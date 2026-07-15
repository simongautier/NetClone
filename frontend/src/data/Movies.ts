import type { Movie } from "../type/Movie.ts";
import interstellar from "../assets/interstellar.jpeg";
import inception from "../assets/inception.jpeg";
import darkKnight from "../assets/dark_knight.jpeg";

export const movies: Movie[] = [
    {
        id: 1,
        title: "Interstellar",
        description: "Un voyage à travers l'espace pour sauver l'humanité.",
        year: 2014,
        duration: "2h49",
        category: "Science Fiction",
        rating: 8.7,
        image: interstellar
    },

    {
        id: 2,
        title: "Inception",
        description: "Un voleur infiltre les rêves.",
        year: 2010,
        duration: "2h28",
        category: "Science Fiction",
        rating: 8.8,
        image: inception
    },

    {
        id: 3,
        title: "The Dark Knight",
        description: "Batman affronte le Joker.",
        year: 2008,
        duration: "2h32",
        category: "Action",
        rating: 9.0,
        image: darkKnight
    }
];