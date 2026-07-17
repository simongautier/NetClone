import { useEffect, useState } from "react";

import Sidebar from "./components/Sidebar/Sidebar";
import MovieRow from "./components/MovieRow/MovieRow";
import HeroBanner from "./components/HeroBanner/HeroBanner";
import MovieModal from "./components/MovieModal/MovieModal";

import type { Movie } from "./type/Movie";

import "./App.css";

const API_URL = "http://localhost:3000/api";

function App() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [modalMovie, setModalMovie] = useState<Movie | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    async function loadMovies() {
      try {
        const response = await fetch(`${API_URL}/movies`);

        if (!response.ok) {
          throw new Error("Impossible de récupérer les films");
        }

        
        const movieSummaries: Movie[] = await response.json();
        

        setMovies(movieSummaries);

        if (movieSummaries.length > 0) {
          const firstMovieResponse = await fetch(
            `${API_URL}/movies/${movieSummaries[0].id}`
          );

          if (!firstMovieResponse.ok) {
            throw new Error(
              "Impossible de récupérer les détails du premier film"
            );
          }

          const firstMovieDetails: Movie =
            await firstMovieResponse.json();

          setSelectedMovie(firstMovieDetails);
        }
      } catch (error) {
        console.error(
          "Erreur pendant le chargement des films :",
          error
        );
      }
    }

    loadMovies();
  }, []);

  const filteredMovies = movies.filter((movie) =>
    movie.title
      .toLowerCase()
      .includes(searchTerm.trim().toLowerCase())
  );

  async function handleMovieSelect(movie: Movie) {
    try {
      const response = await fetch(
        `${API_URL}/movies/${movie.id}`
      );

      if (!response.ok) {
        throw new Error(
          "Impossible de récupérer les détails du film"
        );
      }

      const movieDetails: Movie = await response.json();

      setSelectedMovie(movieDetails);
      setModalMovie(movieDetails);
    } catch (error) {
      console.error(
        "Erreur pendant le chargement du film :",
        error
      );
    }
  }

  return (
    <div className="app">
      <Sidebar />

      <main className="main-content">
        {selectedMovie && (
          <HeroBanner movie={selectedMovie} />
        )}

        <input
          className="search-input"
          type="text"
          placeholder="Rechercher un film..."
          value={searchTerm}
          onChange={(event) =>
            setSearchTerm(event.target.value)
          }
        />

        {filteredMovies.length > 0 ? (
          <MovieRow
            title={
              searchTerm.trim() === ""
                ? "Tendances actuelles"
                : "Résultats de recherche"
            }
            movies={filteredMovies}
            onSelect={handleMovieSelect}
          />
        ) : (
          <p>Aucun film trouvé.</p>
        )}

        {modalMovie && (
          <MovieModal
            movie={modalMovie}
            onClose={() => setModalMovie(null)}
          />
        )}
      </main>
    </div>
  );
}

export default App;