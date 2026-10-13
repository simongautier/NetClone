import express from "express";
import Movies from "./data/movies.js";
import "dotenv/config";
import { getPopularMovies } from "./services/tmdb.js";
import { getMovieDetails } from "./services/tmdb.js";
import { getPopularSeries } from "./services/tmdb.js";
import { getSeriesDetails } from "./services/tmdb.js";
import { getWatchOptions } from "./services/tmdb.js";
import cors from "cors";


if (!process.env.TMDB_TOKEN) {
  throw new Error("TMDB_TOKEN est absent du fichier .env");
}

const app = express();
app.use(cors());
const PORT = 3000;

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

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

app.get("/api/movies/:id/watch", async (req, res) => {
  const id = Number(req.params.id);
  const title = typeof req.query.title === "string" ? req.query.title : "";
  const region =
    typeof req.query.region === "string" && /^[A-Z]{2}$/.test(req.query.region)
      ? req.query.region
      : "FR";

  try {
    const watchOptions = await getWatchOptions("movie", id, title, region);
    res.json(watchOptions);
  } catch (error) {
    console.error(`Error fetching watch options for movie ID ${id}:`, error);

    res.status(502).json({
      error: "Unable to fetch watch options from TMDB",
    });
  }
});

app.get("/api/series", async (_req, res) => {
  try {
    const series = await getPopularSeries();
    res.json(series);
  } catch (error) {
    console.error("Error fetching series from TMDB:", error);

    res.status(502).json({
      error: "Unable to fetch series from TMDB",
    });
  }
});

app.get("/api/series/:id", async (req, res) => {
  const id = Number(req.params.id);

  try {
    const seriesDetails = await getSeriesDetails(id);
    res.json(seriesDetails);
  } catch (error) {
    console.error(`Error fetching details for series ID ${id}:`, error);

    res.status(502).json({
      error: "Unable to fetch series details from TMDB",
    });
  }
});

app.get("/api/series/:id/watch", async (req, res) => {
  const id = Number(req.params.id);
  const title = typeof req.query.title === "string" ? req.query.title : "";
  const region =
    typeof req.query.region === "string" && /^[A-Z]{2}$/.test(req.query.region)
      ? req.query.region
      : "FR";

  try {
    const watchOptions = await getWatchOptions("tv", id, title, region);
    res.json(watchOptions);
  } catch (error) {
    console.error(`Error fetching watch options for series ID ${id}:`, error);

    res.status(502).json({
      error: "Unable to fetch watch options from TMDB",
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});