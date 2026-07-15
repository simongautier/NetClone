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
          src={movie.image}
          alt={`Affiche de ${movie.title}`}
        />

        <div className="movie-modal-info">
          <p className="movie-modal-category">{movie.category}</p>

          <h2>{movie.title}</h2>

          <div className="movie-modal-details">
            <span>{movie.year}</span>
            <span>•</span>
            <span>{movie.duration}</span>
            <span>•</span>
            <span>⭐ {movie.rating}</span>
          </div>

          <p className="movie-modal-description">{movie.description}</p>

          <button type="button" className="movie-modal-play">
            ▶ Lecture
          </button>
        </div>
      </article>
    </div>
  );
}

export default MovieModal;