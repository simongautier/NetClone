export interface Movie {
    id: number;
    title: string;
    description: string;
    year: number;
    duration: string;
    category: string;
    rating: number;
    image: string;
    isLeaving?: boolean;
}

export type DisplayedMovie = {
  movie: Movie;
  isLeaving: boolean;
};