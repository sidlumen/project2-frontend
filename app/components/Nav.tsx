"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Home" },
  { href: "/movies", label: "Movies" },
  { href: "/movies/new", label: "Add Movie" },
];

export default function Nav() {
  const pathname = usePathname();

  return (
    <header className="border-b bg-white">
      <nav className="max-w-5xl mx-auto px-6 h-14 flex items-center gap-6">
        <span className="font-semibold text-base tracking-tight mr-4">
          🎬 Watchlist
        </span>
        {links.map(({ href, label }) => {
          const active =
            href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`text-sm font-medium transition-colors ${
                active
                  ? "text-black"
                  : "text-gray-400 hover:text-gray-700"
              }`}
            >
              {label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
