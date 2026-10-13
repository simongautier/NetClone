import express from "express";
import { randomUUID } from "node:crypto";
import { createWriteStream } from "node:fs";
import { mkdir, readdir, rename, rm } from "node:fs/promises";
import path from "node:path";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import type { ReadableStream as NodeReadableStream } from "node:stream/web";

type DownloadStatus = "downloading" | "done" | "error";

type Download = {
  id: string;
  url: string;
  filename: string;
  status: DownloadStatus;
  receivedBytes: number;
  totalBytes: number | null;
  error: string | null;
};

const PORT = 3001;
const MEDIA_DIR = process.env.MEDIA_DIR ?? "../media";
const VIDEO_EXTENSIONS = [".mp4", ".webm", ".mkv", ".mov", ".m4v"];
const EXTENSION_BY_TYPE: Record<string, string> = {
  "video/mp4": ".mp4",
  "video/webm": ".webm",
  "video/x-matroska": ".mkv",
  "video/quicktime": ".mov",
};

const downloads = new Map<string, Download>();

const app = express();
app.use(express.json());

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

app.get("/api/downloads", (_req, res) => {
  res.json([...downloads.values()].reverse());
});

app.post("/api/downloads", async (req, res) => {
  const rawUrl: unknown = req.body?.url;

  let url: URL;
  try {
    url = new URL(String(rawUrl));
  } catch {
    res.status(400).json({ error: "URL invalide" });
    return;
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    res.status(400).json({ error: "Seules les URL http(s) sont acceptées" });
    return;
  }

  let response: Response;
  try {
    response = await fetch(url);
  } catch (error) {
    console.error(`Error reaching ${url}:`, error);
    res.status(502).json({ error: "Impossible de joindre cette URL" });
    return;
  }

  if (!response.ok || !response.body) {
    res.status(502).json({ error: `Le serveur distant a répondu ${response.status}` });
    return;
  }

  const contentType = response.headers.get("content-type")?.split(";")[0]?.trim() ?? "";
  const filename = buildFilename(url, contentType);

  if (!filename) {
    await response.body.cancel();
    res.status(415).json({ error: "Ce lien ne pointe pas vers une vidéo (mp4, webm, mkv, mov)" });
    return;
  }

  const contentLength = Number(response.headers.get("content-length"));

  const download: Download = {
    id: randomUUID(),
    url: url.toString(),
    filename,
    status: "downloading",
    receivedBytes: 0,
    totalBytes: contentLength > 0 ? contentLength : null,
    error: null,
  };
  downloads.set(download.id, download);

  res.status(202).json(download);

  saveToDisk(download, response.body);
});

async function saveToDisk(download: Download, body: NonNullable<Response["body"]>) {
  const finalPath = path.join(MEDIA_DIR, download.filename);
  const partPath = `${finalPath}.part`;

  // fetch() returns the DOM stream type; at runtime it is Node's web stream.
  const source = Readable.fromWeb(body as NodeReadableStream<Uint8Array>);
  source.on("data", (chunk: Buffer) => {
    download.receivedBytes += chunk.length;
  });

  try {
    await pipeline(source, createWriteStream(partPath));
    await rename(partPath, finalPath);
    download.status = "done";
  } catch (error) {
    console.error(`Error downloading ${download.url}:`, error);
    download.status = "error";
    download.error = "Le téléchargement a échoué";
    await rm(partPath, { force: true });
  }
}

// Keeps the original name when it has a video extension, otherwise derives
// one from the Content-Type. A short id prefix avoids overwriting files.
function buildFilename(url: URL, contentType: string): string | null {
  const baseName = decodeURIComponent(path.basename(url.pathname));
  const extension = path.extname(baseName).toLowerCase();
  const safeStem = path
    .basename(baseName, path.extname(baseName))
    .replace(/[^a-zA-Z0-9._-]+/g, "_")
    .slice(0, 80) || "video";
  const prefix = randomUUID().slice(0, 8);

  if (VIDEO_EXTENSIONS.includes(extension)) {
    return `${prefix}-${safeStem}${extension}`;
  }

  const typeExtension = EXTENSION_BY_TYPE[contentType];
  return typeExtension ? `${prefix}-${safeStem}${typeExtension}` : null;
}

// A crash mid-download leaves .part files behind; nothing can resume them.
async function cleanupPartialFiles() {
  await mkdir(MEDIA_DIR, { recursive: true });
  const files = await readdir(MEDIA_DIR);
  await Promise.all(
    files
      .filter((file) => file.endsWith(".part"))
      .map((file) => rm(path.join(MEDIA_DIR, file), { force: true }))
  );
}

await cleanupPartialFiles();

app.listen(PORT, () => {
  console.log(`Downloader is running on port ${PORT}, saving to ${MEDIA_DIR}`);
});
