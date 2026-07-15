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
    backgroundImage: `linear-gradient(rgba(0,0,0,.7), rgba(0,0,0,.85)), url(${movie.image})`,
  }}
>
                <div className="hero-content">
                    
                    <p className="hero-category">{movie.category}</p>

                    <h1>{movie.title}</h1>
                    <div className="hero-details">
                        <span>{movie.year}</span>
                        <span>{movie.duration}</span>
                        <span>⭐ {movie.rating}</span>
                    </div>

                    <p className="hero-description">{movie.description}</p>

                    <div className="hero-actions">
                        <button type="button" className="play-button">
                            ▶ Lecture
                        </button>

                        <button type="button" className="info-button">
                            ⓘ Plus d&apos;infos
                        </button>
                    </div>
                </div>
        </section>
    );
}

export default HeroBanner;