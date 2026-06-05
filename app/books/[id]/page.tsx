"use client";
import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Book = {
  id: number;
  title: string;
  author: string;
  status: string;
  rating: number | null;
};

export default function BookDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/books/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error ${res.status}`);
        return res.json();
      })
      .then(setBook)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  async function markAsRead() {
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/books/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "read" }),
    });
    setBook((b) => b && { ...b, status: "read" });
  }

  async function deleteBook() {
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/books/${id}`, {
      method: "DELETE",
    });
    router.push("/books");
  }

  if (loading) return <p className="p-8 text-sm text-gray-500">Loading...</p>;
  if (error) return <p className="p-8 text-sm text-red-500">Error: {error}</p>;
  if (!book) return null;

  return (
    <main className="p-8 max-w-lg">
      <Link href="/books" className="text-sm text-gray-400 hover:text-gray-600">
        ← Back
      </Link>

      <div className="mt-6 border rounded-lg p-6">
        <h1 className="text-2xl font-bold">{book.title}</h1>
        <p className="text-gray-500 mt-1">{book.author}</p>

        <div className="mt-4 flex gap-4 text-sm text-gray-600">
          <span className="capitalize">{book.status.replace("_", " ")}</span>
          {book.rating !== null && (
            <span className="text-yellow-500">{"★".repeat(book.rating)}</span>
          )}
        </div>

        <div className="mt-6 flex gap-3">
          {book.status !== "read" && (
            <button
              onClick={markAsRead}
              className="border rounded-lg px-4 py-2 text-sm font-medium hover:bg-gray-50"
            >
              Mark as read
            </button>
          )}
          <button
            onClick={deleteBook}
            className="text-sm text-red-500 hover:text-red-700 px-4 py-2"
          >
            Delete
          </button>
        </div>
      </div>
    </main>
  );
}
