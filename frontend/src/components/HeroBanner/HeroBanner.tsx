import type { Movie } from "../../type/Movie";
import "./HeroBanner.css";

type HeroBannerProps = {
  movie: Movie;
};

function HeroBanner({ movie }: HeroBannerProps) {
  return (
    <section
      className="hero-banner"
      style={{
        backgroundImage: `linear-gradient(rgba(0,0,0,.7), rgba(0,0,0,.85)), url(${movie.backdrop_path})`,
      }}
    >
      <div className="hero-content">
        <h1>{movie.title}</h1>

        <div className="hero-details">
          <span>{movie.release_date.substring(0, 4)}</span>
          <span>{movie.runtime} min</span>
          <span>⭐ {movie.vote_average.toFixed(1)}</span>
        </div>

        <p className="hero-description">
          {movie.overview}
        </p>

        <div className="hero-actions">
          <button type="button" className="play-button">
            ▶ Lecture
          </button>

          <button type="button" className="info-button">
            ⓘ Plus d'infos
          </button>
        </div>
      </div>
    </section>
  );
}

export default HeroBanner;