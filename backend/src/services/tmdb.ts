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

type TmdbProvider = {
  provider_id: number;
  provider_name: string;
  logo_path: string | null;
  display_priority: number;
};

type TmdbRegionProviders = {
  link?: string | undefined;
  flatrate?: TmdbProvider[] | undefined;
  free?: TmdbProvider[] | undefined;
  ads?: TmdbProvider[] | undefined;
  rent?: TmdbProvider[] | undefined;
  buy?: TmdbProvider[] | undefined;
};

type TmdbVideo = {
  key: string;
  name: string;
  site: string;
  type: string;
  official: boolean;
};

type WatchProvider = {
  id: number;
  name: string;
  logo: string | null;
  url: string;
};

type WatchOptions = {
  region: string;
  link: string | null;
  subscription: WatchProvider[];
  free: WatchProvider[];
  rent: WatchProvider[];
  buy: WatchProvider[];
  trailers: { key: string; name: string; type: string }[];
};

// TMDB only gives one link per title (its JustWatch page), not a deep link per
// service, so well-known services get a search URL for the title instead.
const PROVIDER_SEARCH_URLS: [RegExp, (query: string) => string][] = [
  [/netflix/i, (q) => `https://www.netflix.com/search?q=${q}`],
  [/amazon|prime video/i, (q) => `https://www.primevideo.com/search?phrase=${q}`],
  [/disney/i, (q) => `https://www.disneyplus.com/search?q=${q}`],
  [/apple tv/i, (q) => `https://tv.apple.com/search?term=${q}`],
  [/google play/i, (q) => `https://play.google.com/store/search?q=${q}&c=movies`],
  [/youtube/i, (q) => `https://www.youtube.com/results?search_query=${q}`],
];

function buildProviderUrl(providerName: string, title: string, fallback: string) {
  const query = encodeURIComponent(title);
  const match = PROVIDER_SEARCH_URLS.find(([pattern]) => pattern.test(providerName));

  return match ? match[1](query) : fallback;
}

async function getWatchOptions(
  kind: "movie" | "tv",
  id: number,
  title: string,
  region = "FR"
): Promise<WatchOptions> {
  const [providersResponse, videosResponse] = await Promise.all([
    fetch(`${TMDB_API_URL}/${kind}/${id}/watch/providers`, {
      headers: getHeaders(),
    }),
    fetch(
      `${TMDB_API_URL}/${kind}/${id}/videos?language=fr-FR&include_video_language=fr,en,null`,
      {
        headers: getHeaders(),
      }
    ),
  ]);

  if (!providersResponse.ok || !videosResponse.ok) {
    throw new Error(
      `Failed to fetch watch options from TMDB: ${providersResponse.status}/${videosResponse.status}`
    );
  }

  const providersData = await providersResponse.json();
  const videosData = await videosResponse.json();

  const regionProviders: TmdbRegionProviders = providersData.results?.[region] ?? {};
  const link = regionProviders.link ?? null;
  const fallbackUrl = link ?? `https://www.themoviedb.org/${kind}/${id}/watch`;

  const toProviders = (providers: TmdbProvider[] = []): WatchProvider[] =>
    [...providers]
      .sort((a, b) => a.display_priority - b.display_priority)
      .map((provider) => ({
        id: provider.provider_id,
        name: provider.provider_name,
        logo: buildImageUrl(provider.logo_path, "w92"),
        url: buildProviderUrl(provider.provider_name, title, fallbackUrl),
      }));

  const trailers = (videosData.results as TmdbVideo[])
    .filter((video) => video.site === "YouTube" && ["Trailer", "Teaser"].includes(video.type))
    .sort(
      (a, b) =>
        Number(b.type === "Trailer") - Number(a.type === "Trailer") ||
        Number(b.official) - Number(a.official)
    )
    .map((video) => ({ key: video.key, name: video.name, type: video.type }));

  return {
    region,
    link,
    subscription: toProviders(regionProviders.flatrate),
    free: toProviders([...(regionProviders.free ?? []), ...(regionProviders.ads ?? [])]),
    rent: toProviders(regionProviders.rent),
    buy: toProviders(regionProviders.buy),
    trailers,
  };
}

export {
  getPopularMovies,
  getMovieDetails,
  getPopularSeries,
  getSeriesDetails,
  getWatchOptions,
};