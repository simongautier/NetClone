import "./MovieCard.css";
import type { Movie } from "../../type/Movie";

type MovieCardProps = {
  movie: Movie;
  onSelect: (movie: Movie) => void;
};

function MovieCard({ movie, onSelect }: MovieCardProps) {
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

      <div className="movie-overlay">
        <h3>{movie.title}</h3>
        <p>⭐ {movie.vote_average.toFixed(1)}</p>
      </div>
    </article>
  );
}

export default MovieCard;