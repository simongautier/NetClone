import "./MovieCard.css";
import type { Movie } from "../../type/Movie";

type MovieCardProps = {
  movie: Movie;
  onSelect: (movie: Movie) => void;
  isFavorite: boolean;
  onToggleFavorite: (movie: Movie) => void;
};

function MovieCard({
  movie,
  onSelect,
  isFavorite,
  onToggleFavorite,
}: MovieCardProps) {
  return (
    <article
      className="movie-card"
      onClick={() => onSelect(movie)}
    >
      <img
        src={movie.poster_path ?? undefined}
        alt={movie.title}
        className="movie-image"
      />

      <button
        type="button"
        className={
          isFavorite ? "movie-favorite active" : "movie-favorite"
        }
        aria-label={
          isFavorite
            ? "Retirer de ma liste"
            : "Ajouter à ma liste"
        }
        onClick={(event) => {
          event.stopPropagation();
          onToggleFavorite(movie);
        }}
      >
        {isFavorite ? "♥" : "♡"}
      </button>

      <div className="movie-overlay">
        <h3>{movie.title}</h3>
        <p>⭐ {movie.vote_average.toFixed(1)}</p>
      </div>
    </article>
  );
}

export default MovieCard;
