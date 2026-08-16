import type { Movie } from "../../type/Movie";
import MovieCard from "../MovieCard/MovieCard";
import "./MovieRow.css";

type MovieRowProps = {
  title: string;
  movies: Movie[];
  onSelect: (movie: Movie) => void;
  isFavorite: (movie: Movie) => boolean;
  onToggleFavorite: (movie: Movie) => void;
};

function MovieRow({
  title,
  movies,
  onSelect,
  isFavorite,
  onToggleFavorite,
}: MovieRowProps) {
  return (
    <section className="movie-row">
      <h2 className="movie-row-title">{title}</h2>

      <div className="movie-row-list">
        {movies.map((movie) => (
          <MovieCard
            key={movie.id}
            movie={movie}
            onSelect={onSelect}
            isFavorite={isFavorite(movie)}
            onToggleFavorite={onToggleFavorite}
          />
        ))}
      </div>
    </section>
  );
}

export default MovieRow;
