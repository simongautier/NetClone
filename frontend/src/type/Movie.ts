export type Genre = {
  id: number;
  name: string;
};

export type Movie = {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;

  runtime?: number;
  genres?: Genre[];
};

export type FavoriteKind = "movies" | "series";

export type FavoriteMovie = Movie & { kind: FavoriteKind };

export type WatchProvider = {
  id: number;
  name: string;
  logo: string | null;
  url: string;
};

export type WatchOptions = {
  region: string;
  link: string | null;
  subscription: WatchProvider[];
  free: WatchProvider[];
  rent: WatchProvider[];
  buy: WatchProvider[];
  trailers: { key: string; name: string; type: string }[];
};