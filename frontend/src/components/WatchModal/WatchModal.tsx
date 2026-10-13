import { useEffect, useState } from "react";

import type { FavoriteKind, Movie, WatchOptions, WatchProvider } from "../../type/Movie";
import "./WatchModal.css";

type WatchModalProps = {
  movie: Movie;
  kind: FavoriteKind;
  onClose: () => void;
};

const SECTIONS: { key: "subscription" | "free" | "rent" | "buy"; label: string }[] = [
  { key: "subscription", label: "Inclus dans un abonnement" },
  { key: "free", label: "Gratuit" },
  { key: "rent", label: "Location" },
  { key: "buy", label: "Achat" },
];

function WatchModal({ movie, kind, onClose }: WatchModalProps) {
  const [options, setOptions] = useState<WatchOptions | null>(null);
  const [error, setError] = useState(false);
  const [trailerKey, setTrailerKey] = useState<string | null>(null);

  useEffect(() => {
    async function loadWatchOptions() {
      try {
        const response = await fetch(
          `/api/${kind}/${movie.id}/watch?title=${encodeURIComponent(movie.title)}`
        );

        if (!response.ok) {
          throw new Error("Impossible de récupérer les offres de visionnage");
        }

        const watchOptions: WatchOptions = await response.json();

        setOptions(watchOptions);
        setTrailerKey(watchOptions.trailers[0]?.key ?? null);
      } catch (loadError) {
        console.error("Erreur pendant le chargement des offres :", loadError);
        setError(true);
      }
    }

    loadWatchOptions();
  }, [kind, movie.id, movie.title]);

  const hasProviders =
    options !== null && SECTIONS.some((section) => options[section.key].length > 0);

  return (
    <div className="watch-modal" onClick={onClose}>
      <article
        className="watch-modal-content"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          className="watch-modal-close"
          onClick={onClose}
          aria-label="Fermer"
        >
          ×
        </button>

        {trailerKey ? (
          <iframe
            className="watch-modal-trailer"
            src={`https://www.youtube-nocookie.com/embed/${trailerKey}?autoplay=1`}
            title={`Bande-annonce de ${movie.title}`}
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen
          />
        ) : (
          <div
            className="watch-modal-backdrop"
            style={{ backgroundImage: `url(${movie.backdrop_path ?? movie.poster_path})` }}
          />
        )}

        <div className="watch-modal-body">
          <h2>{movie.title}</h2>

          {!options && !error && <p className="watch-modal-muted">Chargement…</p>}

          {error && (
            <p className="watch-modal-muted">
              Impossible de charger les offres pour l'instant.
            </p>
          )}

          {options && options.trailers.length > 1 && (
            <div className="watch-modal-trailers">
              {options.trailers.slice(0, 6).map((trailer) => (
                <button
                  key={trailer.key}
                  type="button"
                  className={trailer.key === trailerKey ? "active" : ""}
                  onClick={() => setTrailerKey(trailer.key)}
                >
                  ▶ {trailer.name}
                </button>
              ))}
            </div>
          )}

          {options && !hasProviders && (
            <p className="watch-modal-muted">
              Aucune offre de streaming n'est disponible en France pour l'instant
              {kind === "movies" ? " (le film est peut-être encore au cinéma)" : ""}.
            </p>
          )}

          {options &&
            SECTIONS.filter((section) => options[section.key].length > 0).map((section) => (
              <section key={section.key} className="watch-modal-section">
                <h3>{section.label}</h3>
                <ul>
                  {options[section.key].map((provider: WatchProvider) => (
                    <li key={provider.id}>
                      <a href={provider.url} target="_blank" rel="noopener noreferrer">
                        {provider.logo && <img src={provider.logo} alt="" />}
                        <span>{provider.name}</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </section>
            ))}

          {options?.link && (
            <a
              className="watch-modal-all"
              href={options.link}
              target="_blank"
              rel="noopener noreferrer"
            >
              Voir toutes les offres sur TMDB ↗
            </a>
          )}

          <p className="watch-modal-attribution">Offres fournies par JustWatch via TMDB.</p>
        </div>
      </article>
    </div>
  );
}

export default WatchModal;
