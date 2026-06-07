"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Stats = {
  total: number;
  by_status: {
    want_to_watch: number;
    watching: number;
    watched: number;
  };
  average_rating: number | null;
};

export default function HomePage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/movies/stats`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error ${res.status}`);
        return res.json();
      })
      .then(setStats)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="max-w-5xl mx-auto px-6 py-12">
      <div className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight">My Watchlist</h1>
        <p className="text-gray-500 mt-1">Track movies you want to watch, are watching, or have finished.</p>
      </div>

      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border p-6 animate-pulse h-24" />
          ))}
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
          Could not load stats: {error}
        </div>
      )}

      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
          <StatCard label="Total Movies" value={stats.total} />
          <StatCard label="Want to Watch" value={stats.by_status.want_to_watch} />
          <StatCard label="Watching" value={stats.by_status.watching} />
          <StatCard label="Watched" value={stats.by_status.watched} />
        </div>
      )}

      {stats && stats.average_rating !== null && (
        <p className="text-sm text-gray-500 mb-10">
          Average rating across all reviews:{" "}
          <span className="font-semibold text-yellow-600">{stats.average_rating.toFixed(1)} / 10</span>
        </p>
      )}

      <div className="flex gap-4">
        <Link
          href="/movies"
          className="bg-black text-white rounded-lg px-5 py-2.5 text-sm font-medium hover:bg-gray-800 transition-colors"
        >
          Browse movies
        </Link>
        <Link
          href="/movies/new"
          className="border border-gray-300 rounded-lg px-5 py-2.5 text-sm font-medium hover:bg-gray-100 transition-colors"
        >
          Add a movie
        </Link>
      </div>
    </main>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-white rounded-xl border p-5">
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-sm text-gray-500 mt-0.5">{label}</p>
    </div>
  );
}
