"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

type Movie = {
  id: number;
  title: string;
  director: string | null;
  genre: string | null;
  year: number | null;
  status: string;
  reviews: { rating: number }[];
};

const STATUS_LABELS: Record<string, string> = {
  want_to_watch: "Want to Watch",
  watching: "Watching",
  watched: "Watched",
};

const STATUS_COLORS: Record<string, string> = {
  want_to_watch: "bg-blue-50 text-blue-700",
  watching: "bg-yellow-50 text-yellow-700",
  watched: "bg-green-50 text-green-700",
};

const FILTERS = ["all", "want_to_watch", "watching", "watched"] as const;

export default function MoviesPage() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    setLoading(true);
    setError(null);
    const url =
      filter === "all"
        ? `${process.env.NEXT_PUBLIC_API_URL}/movies`
        : `${process.env.NEXT_PUBLIC_API_URL}/movies?status=${filter}`;

    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error ${res.status}`);
        return res.json();
      })
      .then(setMovies)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [filter]);

  return (
    <main className="max-w-5xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Movies</h1>
        <Link
          href="/movies/new"
          className="bg-black text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-gray-800 transition-colors"
        >
          + Add Movie
        </Link>
      </div>

      <div className="flex gap-2 mb-6">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              filter === f
                ? "bg-black text-white"
                : "bg-white border text-gray-600 hover:bg-gray-50"
            }`}
          >
            {f === "all" ? "All" : STATUS_LABELS[f]}
          </button>
        ))}
      </div>

      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border p-5 animate-pulse h-32" />
          ))}
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
          Error loading movies: {error}
        </div>
      )}

      {!loading && !error && movies.length === 0 && (
        <div className="text-center py-20 text-gray-400">
          <p className="text-lg mb-3">No movies here yet.</p>
          <Link href="/movies/new" className="text-sm text-black hover:underline">
            Add your first movie →
          </Link>
        </div>
      )}

      {!loading && !error && movies.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {movies.map((movie) => {
            const avgRating =
              movie.reviews.length > 0
                ? movie.reviews.reduce((s, r) => s + r.rating, 0) / movie.reviews.length
                : null;
            return (
              <Link
                key={movie.id}
                href={`/movies/${movie.id}`}
                className="bg-white border rounded-xl p-5 hover:shadow-md transition-shadow block"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h2 className="font-semibold leading-snug">{movie.title}</h2>
                  <span
                    className={`shrink-0 text-xs font-medium px-2 py-0.5 rounded-full ${
                      STATUS_COLORS[movie.status] ?? "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {STATUS_LABELS[movie.status] ?? movie.status}
                  </span>
                </div>
                {movie.director && (
                  <p className="text-sm text-gray-500">Dir. {movie.director}</p>
                )}
                <div className="flex gap-3 mt-3 text-xs text-gray-400">
                  {movie.genre && <span>{movie.genre}</span>}
                  {movie.year && <span>{movie.year}</span>}
                  {avgRating !== null && (
                    <span className="text-yellow-600 font-medium">
                      ★ {avgRating.toFixed(1)}
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </main>
  );
}
