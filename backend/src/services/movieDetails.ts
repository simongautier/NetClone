
async function getMovieDetails(movieId: number): Promise<{
  id: number;
  title: string;
  year: number;
  overview: string;
  poster_path: string;
}> {
  const response = await fetch(
  `https://api.themoviedb.org/3/movie/${movieId}?language=en-US`,
    {
      headers: {
        Authorization: `Bearer ${process.env.TMDB_TOKEN}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch movie details from TMDB");
  }
  const data = await response.json();
  return {

    id: data.id,
    title: data.title,
    year: parseInt(data.release_date.split("-")[0], 10),
    overview: data.overview,
    poster_path: data.poster_path,
  };
}

export default getMovieDetails;