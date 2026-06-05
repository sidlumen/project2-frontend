"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

type Book = {
  id: number;
  title: string;
  author: string;
  status: string;
  rating: number | null;
};

export default function BooksPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/books`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error ${res.status}`);
        return res.json();
      })
      .then((data) => setBooks(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="p-8">Loading books...</p>;
  if (error) return <p className="p-8 text-red-500">Error: {error}</p>;

  return (
    <main className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Books</h1>
        <Link
          href="/books/new"
          className="bg-blue-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-blue-700"
        >
          Add Book
        </Link>
      </div>

      {books.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="mb-4">No books yet.</p>
          <Link href="/books/new" className="text-blue-600 hover:underline text-sm">
            Add your first book
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {books.map((book) => (
            <Link
              key={book.id}
              href={`/books/${book.id}`}
              className="border rounded-lg p-4 shadow-sm hover:bg-gray-50 block"
            >
              <h2 className="text-lg font-semibold">{book.title}</h2>
              <p className="text-gray-600">{book.author}</p>
              <p className="text-sm mt-2 capitalize">{book.status.replace("_", " ")}</p>
              <p className="text-sm text-yellow-500">
                {book.rating !== null ? `${"★".repeat(book.rating)}` : "No rating"}
              </p>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
