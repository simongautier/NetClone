import { useEffect, useState } from "react";

import Sidebar from "./components/Sidebar/Sidebar";
import MovieRow from "./components/MovieRow/MovieRow";
import HeroBanner from "./components/HeroBanner/HeroBanner";
import MovieModal from "./components/MovieModal/MovieModal";
import VideoLibrary from "./components/VideoLibrary/VideoLibrary";
import WatchModal from "./components/WatchModal/WatchModal";
import SearchBar from "./components/SearchBar/SearchBar";
import { useFavorites } from "./hooks/useFavorites";

import type { FavoriteKind, FavoriteMovie, Movie } from "./type/Movie";

import "./App.css";

const API_URL = "/api";

type Category = "Accueil" | "Séries" | "Films" | "Ma liste" | "Mes vidéos";

const SEARCH_PLACEHOLDERS: Record<Category, string> = {
  Accueil: "Rechercher un film…",
  Films: "Rechercher un film…",
  Séries: "Rechercher une série…",
  "Ma liste": "Rechercher dans ma liste…",
  "Mes vidéos": "Rechercher dans mes vidéos…",
};

function App() {
  const [activeCategory, setActiveCategory] = useState<Category>("Accueil");
  const [movies, setMovies] = useState<Movie[]>([]);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [modalMovie, setModalMovie] = useState<Movie | null>(null);
  const [modalMovieKind, setModalMovieKind] = useState<FavoriteKind>("movies");
  const [watchTarget, setWatchTarget] = useState<{ movie: Movie; kind: FavoriteKind } | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<Movie[] | null>(null);

  const { favorites, isFavorite, toggleFavorite } = useFavorites();

  const resource: FavoriteKind = activeCategory === "Séries" ? "series" : "movies";
  const query = searchTerm.trim();
  // Catalogue pages search all of TMDB; the personal pages filter locally.
  const searchesCatalogue = activeCategory !== "Ma liste" && activeCategory !== "Mes vidéos";

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

  useEffect(() => {
    setSearchResults(null);

    if (!searchesCatalogue || query === "") {
      return;
    }

    const controller = new AbortController();

    // Waits for a pause in typing instead of hitting TMDB on every key.
    const timeout = setTimeout(async () => {
      try {
        const response = await fetch(
          `${API_URL}/search/${resource}?query=${encodeURIComponent(query)}`,
          { signal: controller.signal }
        );

        if (!response.ok) {
          throw new Error("Impossible d'effectuer la recherche");
        }

        setSearchResults(await response.json());
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error("Erreur pendant la recherche :", error);
          setSearchResults([]);
        }
      }
    }, 350);

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [query, resource, searchesCatalogue]);

  const isSearching = searchesCatalogue && query !== "" && searchResults === null;

  const filteredMovies = searchesCatalogue
    ? (query === "" ? movies : searchResults ?? [])
    : favorites.filter((movie) =>
        movie.title.toLowerCase().includes(query.toLowerCase())
      );

  function handleCategorySelect(category: Category) {
    setActiveCategory(category);
    setSearchTerm("");
  }

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
    if (query !== "") {
      return `Résultats pour « ${query} »`;
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
      <Sidebar activeLabel={activeCategory} onSelect={(label) => handleCategorySelect(label as Category)} />

      <main className="main-content">
        <SearchBar
          value={searchTerm}
          placeholder={SEARCH_PLACEHOLDERS[activeCategory]}
          onChange={setSearchTerm}
          overHero={activeCategory !== "Mes vidéos" && selectedMovie !== null}
        />

        {activeCategory === "Mes vidéos" ? (
          <VideoLibrary searchTerm={query} />
        ) : (
          <>
            {selectedMovie && (
              <HeroBanner
                movie={selectedMovie}
                onPlay={(movie) => setWatchTarget({ movie, kind: resource })}
              />
            )}


            {activeCategory === "Ma liste" && favorites.length === 0 ? (
              <p className="empty-message">Ta liste est vide pour l'instant.</p>
            ) : isSearching ? (
              <p className="empty-message">Recherche…</p>
            ) : filteredMovies.length > 0 ? (
              <MovieRow
                title={activeCategory === "Ma liste" && query === "" ? "Ma liste" : rowTitle()}
                movies={filteredMovies}
                onSelect={handleMovieSelect}
                isFavorite={(movie) => isFavorite(movie.id, kindFor(movie))}
                onToggleFavorite={(movie) => toggleFavorite(movie, kindFor(movie))}
              />
            ) : (
              <p className="empty-message">
                {query !== "" ? `Aucun résultat pour « ${query} ».` : "Aucun film trouvé."}
              </p>
            )}

            {modalMovie && (
              <MovieModal
                movie={modalMovie}
                onClose={() => setModalMovie(null)}
                isFavorite={isFavorite(modalMovie.id, modalMovieKind)}
                onToggleFavorite={(movie) => toggleFavorite(movie, modalMovieKind)}
                onPlay={(movie) => setWatchTarget({ movie, kind: modalMovieKind })}
              />
            )}

            {watchTarget && (
              <WatchModal
                movie={watchTarget.movie}
                kind={watchTarget.kind}
                onClose={() => setWatchTarget(null)}
              />
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default App;
