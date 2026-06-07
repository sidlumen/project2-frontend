"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Review = {
  id: number;
  rating: number;
  review_text: string | null;
  created_at: string;
};

type Movie = {
  id: number;
  title: string;
  director: string | null;
  genre: string | null;
  year: number | null;
  status: string;
  reviews: Review[];
};

const STATUS_OPTIONS = [
  { value: "want_to_watch", label: "Want to Watch" },
  { value: "watching", label: "Watching" },
  { value: "watched", label: "Watched" },
];

export default function MovieDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const [movie, setMovie] = useState<Movie | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editDirector, setEditDirector] = useState("");
  const [editGenre, setEditGenre] = useState("");
  const [editYear, setEditYear] = useState("");
  const [editStatus, setEditStatus] = useState("");
  const [saving, setSaving] = useState(false);

  const [reviewRating, setReviewRating] = useState(7);
  const [reviewText, setReviewText] = useState("");
  const [addingReview, setAddingReview] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/movies/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error ${res.status}`);
        return res.json();
      })
      .then((data: Movie) => {
        setMovie(data);
        setEditTitle(data.title);
        setEditDirector(data.director ?? "");
        setEditGenre(data.genre ?? "");
        setEditYear(data.year?.toString() ?? "");
        setEditStatus(data.status);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleSave() {
    if (!movie) return;
    setSaving(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/movies/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editTitle,
          director: editDirector || null,
          genre: editGenre || null,
          year: editYear ? parseInt(editYear) : null,
          status: editStatus,
        }),
      });
      if (!res.ok) throw new Error("Failed to update movie");
      const updated: Movie = await res.json();
      setMovie(updated);
      setEditing(false);
    } catch {
      alert("Error saving changes");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm(`Delete "${movie?.title}"? This cannot be undone.`)) return;
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/movies/${id}`, {
      method: "DELETE",
    });
    router.push("/movies");
  }

  async function handleAddReview(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setAddingReview(true);
    setReviewError(null);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/movies/${id}/reviews`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            rating: reviewRating,
            review_text: reviewText || null,
          }),
        }
      );
      if (!res.ok) throw new Error("Failed to add review");
      const newReview: Review = await res.json();
      setMovie((m) => m && { ...m, reviews: [...m.reviews, newReview] });
      setReviewText("");
      setReviewRating(7);
    } catch (err) {
      setReviewError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setAddingReview(false);
    }
  }

  if (loading) {
    return (
      <main className="max-w-2xl mx-auto px-6 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3" />
          <div className="h-10 bg-gray-200 rounded w-2/3" />
          <div className="h-32 bg-gray-200 rounded" />
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="max-w-2xl mx-auto px-6 py-8">
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
          Error: {error}
        </div>
      </main>
    );
  }

  if (!movie) return null;

  const avgRating =
    movie.reviews.length > 0
      ? movie.reviews.reduce((s, r) => s + r.rating, 0) / movie.reviews.length
      : null;

  return (
    <main className="max-w-2xl mx-auto px-6 py-8">
      <Link href="/movies" className="text-sm text-gray-400 hover:text-gray-600">
        ← Back to movies
      </Link>

      <div className="mt-6 bg-white border rounded-xl p-6">
        {editing ? (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium">Title *</label>
              <input
                type="text"
                required
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="input"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium">Director</label>
              <input
                type="text"
                value={editDirector}
                onChange={(e) => setEditDirector(e.target.value)}
                className="input"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium">Genre</label>
                <input
                  type="text"
                  value={editGenre}
                  onChange={(e) => setEditGenre(e.target.value)}
                  className="input"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium">Year</label>
                <input
                  type="number"
                  min={1888}
                  max={2100}
                  value={editYear}
                  onChange={(e) => setEditYear(e.target.value)}
                  className="input"
                />
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium">Status</label>
              <select
                value={editStatus}
                onChange={(e) => setEditStatus(e.target.value)}
                className="input"
              >
                {STATUS_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex gap-3 mt-2">
              <button
                onClick={handleSave}
                disabled={saving}
                className="bg-black text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-gray-800 disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save changes"}
              </button>
              <button
                onClick={() => setEditing(false)}
                className="border rounded-lg px-4 py-2 text-sm font-medium hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold">{movie.title}</h1>
                {movie.director && (
                  <p className="text-gray-500 mt-0.5">Dir. {movie.director}</p>
                )}
              </div>
              <div className="flex gap-2 shrink-0">
                <button
                  onClick={() => setEditing(true)}
                  className="border rounded-lg px-3 py-1.5 text-sm font-medium hover:bg-gray-50"
                >
                  Edit
                </button>
                <button
                  onClick={handleDelete}
                  className="text-sm text-red-500 hover:text-red-700 px-3 py-1.5"
                >
                  Delete
                </button>
              </div>
            </div>

            <div className="flex gap-4 mt-4 text-sm text-gray-500">
              {movie.genre && <span>{movie.genre}</span>}
              {movie.year && <span>{movie.year}</span>}
              <span className="font-medium text-gray-700">
                {STATUS_OPTIONS.find((o) => o.value === movie.status)?.label ??
                  movie.status}
              </span>
              {avgRating !== null && (
                <span className="text-yellow-600 font-medium">
                  ★ {avgRating.toFixed(1)} / 10
                </span>
              )}
            </div>
          </>
        )}
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-4">Reviews</h2>

        {movie.reviews.length === 0 && (
          <p className="text-sm text-gray-400 mb-4">No reviews yet.</p>
        )}

        {movie.reviews.map((review) => (
          <div key={review.id} className="bg-white border rounded-xl p-4 mb-3">
            <div className="flex items-center gap-3 mb-1">
              <span className="text-yellow-600 font-semibold">
                ★ {review.rating}/10
              </span>
              <span className="text-xs text-gray-400">
                {new Date(review.created_at).toLocaleDateString()}
              </span>
            </div>
            {review.review_text && (
              <p className="text-sm text-gray-700">{review.review_text}</p>
            )}
          </div>
        ))}

        <form
          onSubmit={handleAddReview}
          className="bg-white border rounded-xl p-5 mt-4 flex flex-col gap-3"
        >
          <h3 className="text-sm font-semibold">Add a Review</h3>

          {reviewError && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded px-3 py-2 text-sm">
              {reviewError}
            </div>
          )}

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">
              Rating: <span className="text-yellow-600">{reviewRating}/10</span>
            </label>
            <input
              type="range"
              min={1}
              max={10}
              value={reviewRating}
              onChange={(e) => setReviewRating(parseInt(e.target.value))}
              className="w-full"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Notes (optional)</label>
            <textarea
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              rows={3}
              placeholder="What did you think?"
              className="input resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={addingReview}
            className="self-start bg-black text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-gray-800 disabled:opacity-50"
          >
            {addingReview ? "Posting..." : "Post Review"}
          </button>
        </form>
      </div>
    </main>
  );
}
