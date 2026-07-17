import express from "express";
import Movies from "./data/movies.js";
import "dotenv/config";
import { getPopularMovies } from "./services/tmdb.js";
import { getMovieDetails } from "./services/tmdb.js";
import cors from "cors";


if (!process.env.TMDB_TOKEN) {
  throw new Error("TMDB_TOKEN est absent du fichier .env");
}

const app = express();
app.use(cors());
const PORT = 3000;

app.get("/api/movies", async (_req, res) => {
  try {
    const movies = await getPopularMovies();
    res.json(movies);
  } catch (error) {
    console.error("Error fetching movies from TMDB:", error);

    res.status(502).json({
      error: "Unable to fetch movies from TMDB",
    });
  }
});

app.get("/api/movies/:id", async (req, res) => {
  const id = Number(req.params.id);

  try {
    const movieDetails = await getMovieDetails(id);
    res.json(movieDetails);
  } catch (error) {
    console.error(`Error fetching details for movie ID ${id}:`, error);

    res.status(502).json({
      error: "Unable to fetch movie details from TMDB",
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});