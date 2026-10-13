import { useEffect, useState } from "react";

import Sidebar from "./components/Sidebar/Sidebar";
import MovieRow from "./components/MovieRow/MovieRow";
import HeroBanner from "./components/HeroBanner/HeroBanner";
import MovieModal from "./components/MovieModal/MovieModal";
import VideoLibrary from "./components/VideoLibrary/VideoLibrary";
import { useFavorites } from "./hooks/useFavorites";

import type { FavoriteKind, FavoriteMovie, Movie } from "./type/Movie";

import "./App.css";

const API_URL = "/api";

type Category = "Accueil" | "Séries" | "Films" | "Ma liste" | "Mes vidéos";

function App() {
  const [activeCategory, setActiveCategory] = useState<Category>("Accueil");
  const [movies, setMovies] = useState<Movie[]>([]);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [modalMovie, setModalMovie] = useState<Movie | null>(null);
  const [modalMovieKind, setModalMovieKind] = useState<FavoriteKind>("movies");
  const [searchTerm, setSearchTerm] = useState("");

  const { favorites, isFavorite, toggleFavorite } = useFavorites();

  const resource: FavoriteKind = activeCategory === "Séries" ? "series" : "movies";

  function kindFor(movie: Movie): FavoriteKind {
    if (activeCategory === "Ma liste") {
      return (movie as FavoriteMovie).kind;
    }

    return resource;
  }

  useEffect(() => {
    if (activeCategory === "Ma liste" || activeCategory === "Mes vidéos") {
      setSelectedMovie(null);
      return;
    }

    async function loadMovies() {
      try {
        const response = await fetch(`${API_URL}/${resource}`);

        if (!response.ok) {
          throw new Error("Impossible de récupérer les films");
        }

        const movieSummaries: Movie[] = await response.json();

        setMovies(movieSummaries);

        if (movieSummaries.length > 0) {
          const firstMovieResponse = await fetch(
            `${API_URL}/${resource}/${movieSummaries[0].id}`
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
  }, [activeCategory, resource]);

  const visibleMovies = activeCategory === "Ma liste" ? favorites : movies;

  const filteredMovies = visibleMovies.filter((movie) =>
    movie.title
      .toLowerCase()
      .includes(searchTerm.trim().toLowerCase())
  );

  async function handleMovieSelect(movie: Movie) {
    const kind = kindFor(movie);

    try {
      const response = await fetch(
        `${API_URL}/${kind}/${movie.id}`
      );

      if (!response.ok) {
        throw new Error(
          "Impossible de récupérer les détails du film"
        );
      }

      const movieDetails: Movie = await response.json();

      setSelectedMovie(movieDetails);
      setModalMovie(movieDetails);
      setModalMovieKind(kind);
    } catch (error) {
      console.error(
        "Erreur pendant le chargement du film :",
        error
      );
    }
  }

  function rowTitle() {
    if (searchTerm.trim() !== "") {
      return "Résultats de recherche";
    }

    if (activeCategory === "Séries") {
      return "Séries populaires";
    }

    if (activeCategory === "Films") {
      return "Films populaires";
    }

    return "Tendances actuelles";
  }

  return (
    <div className="app">
      <Sidebar activeLabel={activeCategory} onSelect={(label) => setActiveCategory(label as Category)} />

      <main className="main-content">
        {activeCategory === "Mes vidéos" ? (
          <VideoLibrary />
        ) : (
          <>
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

            {activeCategory === "Ma liste" && favorites.length === 0 ? (
              <p>Ta liste est vide pour l'instant.</p>
            ) : filteredMovies.length > 0 ? (
              <MovieRow
                title={activeCategory === "Ma liste" ? "Ma liste" : rowTitle()}
                movies={filteredMovies}
                onSelect={handleMovieSelect}
                isFavorite={(movie) => isFavorite(movie.id, kindFor(movie))}
                onToggleFavorite={(movie) => toggleFavorite(movie, kindFor(movie))}
              />
            ) : (
              <p>Aucun film trouvé.</p>
            )}

            {modalMovie && (
              <MovieModal
                movie={modalMovie}
                onClose={() => setModalMovie(null)}
                isFavorite={isFavorite(modalMovie.id, modalMovieKind)}
                onToggleFavorite={(movie) => toggleFavorite(movie, modalMovieKind)}
              />
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default App;
