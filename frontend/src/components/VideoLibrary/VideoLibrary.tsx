import { useCallback, useEffect, useState } from "react";
import type { FormEvent } from "react";

import "./VideoLibrary.css";

type Download = {
  id: string;
  url: string;
  filename: string;
  status: "downloading" | "done" | "error";
  receivedBytes: number;
  totalBytes: number | null;
  error: string | null;
};

type Video = {
  filename: string;
  size: number;
  addedAt: string;
};

const DOWNLOADS_URL = "/api/downloads";
const STREAM_URL = "/api/stream";

function formatSize(bytes: number) {
  if (bytes >= 1024 ** 3) return `${(bytes / 1024 ** 3).toFixed(1)} Go`;
  if (bytes >= 1024 ** 2) return `${(bytes / 1024 ** 2).toFixed(1)} Mo`;
  return `${Math.round(bytes / 1024)} Ko`;
}

// Drops the 8-character id prefix the downloader adds to avoid collisions.
function displayName(filename: string) {
  return filename.replace(/^[0-9a-f]{8}-/, "");
}

type VideoLibraryProps = {
  searchTerm: string;
};

function VideoLibrary({ searchTerm }: VideoLibraryProps) {
  const [url, setUrl] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [downloads, setDownloads] = useState<Download[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [playing, setPlaying] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const [downloadsResponse, videosResponse] = await Promise.all([
        fetch(DOWNLOADS_URL),
        fetch(STREAM_URL),
      ]);

      if (downloadsResponse.ok) setDownloads(await downloadsResponse.json());
      if (videosResponse.ok) setVideos(await videosResponse.json());
    } catch (error) {
      console.error("Erreur pendant le chargement des vidéos :", error);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const hasActiveDownload = downloads.some((download) => download.status === "downloading");

  useEffect(() => {
    if (!hasActiveDownload) return;

    const interval = setInterval(refresh, 1500);
    return () => clearInterval(interval);
  }, [hasActiveDownload, refresh]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setFormError(null);

    try {
      const response = await fetch(DOWNLOADS_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        setFormError(body?.error ?? "Le téléchargement n'a pas pu démarrer");
        return;
      }

      setUrl("");
      refresh();
    } catch {
      setFormError("Le service de téléchargement est injoignable");
    }
  }

  const activeDownloads = downloads.filter((download) => download.status !== "done");
  const visibleVideos = videos.filter((video) =>
    displayName(video.filename).toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <section className="video-library">
      {playing && (
        <div className="video-library-player">
          <video
            key={playing}
            src={`${STREAM_URL}/${encodeURIComponent(playing)}`}
            controls
            autoPlay
          />
          <div className="video-library-player-bar">
            <span>{displayName(playing)}</span>
            <button type="button" onClick={() => setPlaying(null)}>
              Fermer
            </button>
          </div>
        </div>
      )}

      <h2 className="video-library-title">Ajouter une vidéo</h2>

      <form className="video-library-form" onSubmit={handleSubmit}>
        <input
          type="url"
          placeholder="https://exemple.com/video.mp4"
          value={url}
          onChange={(event) => setUrl(event.target.value)}
          required
        />
        <button type="submit">Télécharger</button>
      </form>

      {formError && <p className="video-library-error">{formError}</p>}

      {activeDownloads.length > 0 && (
        <ul className="video-library-downloads">
          {activeDownloads.map((download) => {
            const percent = download.totalBytes
              ? Math.round((download.receivedBytes / download.totalBytes) * 100)
              : null;

            return (
              <li key={download.id}>
                <span>{displayName(download.filename)}</span>
                {download.status === "error" ? (
                  <span className="video-library-error">{download.error}</span>
                ) : (
                  <>
                    <progress max={100} value={percent ?? undefined} />
                    <span>
                      {percent !== null ? `${percent} %` : formatSize(download.receivedBytes)}
                    </span>
                  </>
                )}
              </li>
            );
          })}
        </ul>
      )}

      <h2 className="video-library-title">Mes vidéos</h2>

      {videos.length === 0 ? (
        <p>Aucune vidéo pour l'instant.</p>
      ) : visibleVideos.length === 0 ? (
        <p>Aucune vidéo ne correspond à « {searchTerm} ».</p>
      ) : (
        <ul className="video-library-list">
          {visibleVideos.map((video) => (
            <li key={video.filename}>
              <button type="button" onClick={() => setPlaying(video.filename)}>
                <span className="video-library-play">▶</span>
                <span className="video-library-name">{displayName(video.filename)}</span>
                <span className="video-library-size">{formatSize(video.size)}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default VideoLibrary;
