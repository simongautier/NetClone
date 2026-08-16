import { useCallback, useEffect, useState } from "react";
import type { FavoriteKind, FavoriteMovie, Movie } from "../type/Movie";

const STORAGE_KEY = "netclone-favorites";

function readFavorites(): FavoriteMovie[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function useFavorites() {
  const [favorites, setFavorites] = useState<FavoriteMovie[]>(readFavorites);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
  }, [favorites]);

  const isFavorite = useCallback(
    (id: number, kind: FavoriteKind) =>
      favorites.some((item) => item.id === id && item.kind === kind),
    [favorites]
  );

  const toggleFavorite = useCallback((movie: Movie, kind: FavoriteKind) => {
    setFavorites((current) => {
      const exists = current.some(
        (item) => item.id === movie.id && item.kind === kind
      );

      if (exists) {
        return current.filter(
          (item) => !(item.id === movie.id && item.kind === kind)
        );
      }

      return [...current, { ...movie, kind }];
    });
  }, []);

  return { favorites, isFavorite, toggleFavorite };
}
