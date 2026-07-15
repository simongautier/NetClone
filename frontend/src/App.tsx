import Sidebar from "./components/Sidebar/Sidebar";
import MovieRow from "./components/MovieRow/MovieRow";
import HeroBanner from "./components/HeroBanner/HeroBanner";
import MovieModal from "./components/MovieModal/MovieModal";
import { movies } from "./data/Movies";
import { useState } from "react";
import "./App.css";
import type { Movie } from "./type/Movie";

function App() {
const [selectedMovie, setSelectedMovie] = useState<Movie>(movies[0]);
const [modalMovie, setModalMovie] = useState<Movie | null>(null);
const [searchTerm, setSearchTerm] = useState("");

const filteredMovies = movies.filter((movie) =>
  movie.title.toLowerCase().includes(searchTerm.toLowerCase())
);

  return (
    <div className="app">
      <Sidebar />

      <main className="main-content">
      <HeroBanner movie={selectedMovie} />
<input
  className="search-input"
  type="text"
  placeholder="Rechercher un film..."
  value={searchTerm}
  onChange={(e) => setSearchTerm(e.target.value)}
/>
{filteredMovies.length > 0 ? (
  <MovieRow
    title={
      searchTerm.trim() === ""
        ? "Tendances actuelles"
        : "Résultats de recherche"
    }
    movies={
      searchTerm.trim() === ""
        ? movies
        : filteredMovies
    }
    onSelect={(movie) => {
      setSelectedMovie(movie);
      setModalMovie(movie);
    }}
  />
) : (
  <p>Aucun film trouvé.</p>
)}


<MovieRow
  title="Tendances actuelles"
  movies={movies}
  onSelect={(movie) => {
    setSelectedMovie(movie);
    setModalMovie(movie);
  }}
/>
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