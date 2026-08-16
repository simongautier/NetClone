const TMDB_API_URL = "https://api.themoviedb.org/3";
const TMDB_IMAGE_URL = "https://image.tmdb.org/t/p";

type TmdbGenre = {
  id: number;
  name: string;
};

type TmdbMovie = {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  runtime?: number | undefined;
  genres?: TmdbGenre[] | undefined;
};

function getHeaders() {
  const token = process.env.TMDB_TOKEN;

  if (!token) {
    throw new Error("TMDB_TOKEN is missing from environment variables");
  }

  return {
    Authorization: `Bearer ${token}`,
    Accept: "application/json",
  };
}

function buildImageUrl(
  path: string | null,
  size: string
): string | null {
  if (!path) {
    return null;
  }

  return `${TMDB_IMAGE_URL}/${size}${path}`;
}

async function getPopularMovies(): Promise<TmdbMovie[]> {
  const response = await fetch(
    `${TMDB_API_URL}/movie/popular?language=fr-FR&page=1`,
    {
      headers: getHeaders(),
    }
  );

  if (!response.ok) {
    throw new Error(
      `Failed to fetch popular movies from TMDB: ${response.status}`
    );
  }

  const data = await response.json();

  return data.results.map((movie: TmdbMovie) => ({
    id: movie.id,
    title: movie.title,
    overview: movie.overview,
    poster_path: buildImageUrl(movie.poster_path, "w500"),
    backdrop_path: buildImageUrl(movie.backdrop_path, "original"),
    release_date: movie.release_date,
    vote_average: movie.vote_average,
  }));
}

type TmdbSeries = {
  id: number;
  name: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  first_air_date: string;
  vote_average: number;
  episode_run_time?: number[] | undefined;
  genres?: TmdbGenre[] | undefined;
};

async function getPopularSeries(): Promise<TmdbMovie[]> {
  const response = await fetch(
    `${TMDB_API_URL}/tv/popular?language=fr-FR&page=1`,
    {
      headers: getHeaders(),
    }
  );

  if (!response.ok) {
    throw new Error(
      `Failed to fetch popular series from TMDB: ${response.status}`
    );
  }

  const data = await response.json();

  return data.results.map((series: TmdbSeries) => ({
    id: series.id,
    title: series.name,
    overview: series.overview,
    poster_path: buildImageUrl(series.poster_path, "w500"),
    backdrop_path: buildImageUrl(series.backdrop_path, "original"),
    release_date: series.first_air_date,
    vote_average: series.vote_average,
  }));
}

async function getSeriesDetails(id: number): Promise<TmdbMovie> {
  const response = await fetch(`${TMDB_API_URL}/tv/${id}?language=fr-FR`, {
    headers: getHeaders(),
  });

  if (!response.ok) {
    throw new Error(
      `Failed to fetch series details from TMDB: ${response.status}`
    );
  }

  const series: TmdbSeries = await response.json();

  return {
    id: series.id,
    title: series.name,
    overview: series.overview,
    poster_path: buildImageUrl(series.poster_path, "w500"),
    backdrop_path: buildImageUrl(series.backdrop_path, "original"),
    release_date: series.first_air_date,
    vote_average: series.vote_average,
    runtime: series.episode_run_time?.[0],
    genres: series.genres,
  };
}

async function getMovieDetails(id: number): Promise<TmdbMovie> {
  const response = await fetch(
    `${TMDB_API_URL}/movie/${id}?language=fr-FR`,
    {
      headers: getHeaders(),
    }
  );

  if (!response.ok) {
    throw new Error(
      `Failed to fetch movie details from TMDB: ${response.status}`
    );
  }

  const movie: TmdbMovie = await response.json();

  return {
    id: movie.id,
    title: movie.title,
    overview: movie.overview,
    poster_path: buildImageUrl(movie.poster_path, "w500"),
    backdrop_path: buildImageUrl(movie.backdrop_path, "original"),
    release_date: movie.release_date,
    vote_average: movie.vote_average,
    runtime: movie.runtime,
    genres: movie.genres,
  };
}

export { getPopularMovies, getMovieDetails, getPopularSeries, getSeriesDetails };