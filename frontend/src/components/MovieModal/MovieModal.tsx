import type { Movie } from "../../type/Movie";
import "./MovieModal.css";

type MovieModalProps = {
  movie: Movie;
  onClose: () => void;
};

function MovieModal({ movie, onClose }: MovieModalProps) {
  return (
    <div className="movie-modal" onClick={onClose}>
      <article
        className="movie-modal-content"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          className="movie-modal-close"
          onClick={onClose}
          aria-label="Fermer la fiche"
        >
          ×
        </button>

        <img
          className="movie-modal-image"
          src={movie.poster_path ?? undefined}
          alt={`Affiche de ${movie.title}`}
        />

        <div className="movie-modal-info">
          <h2>{movie.title}</h2>

          <div className="movie-modal-details">
            <span>{movie.release_date.substring(0, 4)}</span>
            <span>•</span>
{movie.runtime && <span>{movie.runtime} min</span>}
            <span>•</span>
            <span>⭐ {movie.vote_average.toFixed(1)}</span>
          </div>

          <p className="movie-modal-description">
            {movie.overview}
          </p>

          <button type="button" className="movie-modal-play">
            ▶ Lecture
          </button>
        </div>
      </article>
    </div>
  );
}

export default MovieModal;