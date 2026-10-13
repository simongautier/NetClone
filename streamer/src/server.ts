import express from "express";
import { readdir, stat } from "node:fs/promises";
import path from "node:path";

type Video = {
  filename: string;
  size: number;
  addedAt: string;
};

const PORT = 3002;
const MEDIA_DIR = path.resolve(process.env.MEDIA_DIR ?? "../media");
const VIDEO_EXTENSIONS = [".mp4", ".webm", ".mkv", ".mov", ".m4v"];

const app = express();

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

app.get("/api/stream", async (_req, res) => {
  try {
    const files = await readdir(MEDIA_DIR).catch(() => []);
    const videos: Video[] = [];

    for (const filename of files.filter(isVideo)) {
      const info = await stat(path.join(MEDIA_DIR, filename));
      videos.push({ filename, size: info.size, addedAt: info.mtime.toISOString() });
    }

    videos.sort((a, b) => b.addedAt.localeCompare(a.addedAt));
    res.json(videos);
  } catch (error) {
    console.error("Error listing videos:", error);
    res.status(500).json({ error: "Impossible de lister les vidéos" });
  }
});

// sendFile answers Range requests with 206 Partial Content, which is what
// lets the <video> element seek without downloading the whole file.
app.get("/api/stream/:filename", (req, res) => {
  const { filename } = req.params;

  if (filename !== path.basename(filename) || !isVideo(filename)) {
    res.status(400).json({ error: "Nom de fichier invalide" });
    return;
  }

  res.sendFile(filename, { root: MEDIA_DIR, dotfiles: "deny" }, (error) => {
    if (error && !res.headersSent) {
      res.status(404).json({ error: "Vidéo introuvable" });
    }
  });
});

function isVideo(filename: string): boolean {
  return VIDEO_EXTENSIONS.includes(path.extname(filename).toLowerCase());
}

app.listen(PORT, () => {
  console.log(`Streamer is running on port ${PORT}, serving ${MEDIA_DIR}`);
});
