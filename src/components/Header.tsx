"use client";

import Link from "next/link";
import { useAuth } from "./AuthProvider";
import { useTheme } from "./ThemeProvider";
import { supabase } from "@/lib/supabase-browser";
import { useRouter } from "next/navigation";

export default function Header() {
  const { user, loading } = useAuth();
  const { theme, toggle } = useTheme();
  const router = useRouter();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.refresh();
  }

  return (
    <header className="border-b border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
      <nav className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-xl font-bold tracking-tight">
            break<span className="text-green-600">80</span>
          </Link>
          <span className="hidden text-sm italic text-gray-400 sm:inline">
            The journey of an average golfer to break 80
          </span>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <Link href="/stats" className="hover:text-green-600">
            Stats
          </Link>
          {!loading && user && (
            <Link href="/rounds" className="hover:text-green-600">
              Rounds
            </Link>
          )}
          {!loading && user && (
            <Link href="/courses" className="hover:text-green-600">
              Courses
            </Link>
          )}
          {!loading && user && (
            <Link href="/add-round" className="hover:text-green-600">
              Add Round
            </Link>
          )}
          <button
            onClick={toggle}
            className="rounded border border-gray-300 px-2 py-1 text-xs font-medium text-gray-600 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
            aria-label="Toggle dark mode"
          >
            {theme === "light" ? "Dark" : "Light"}
          </button>
          {!loading && user && (
            <button
              onClick={handleLogout}
              className="rounded bg-gray-100 px-3 py-1 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600"
            >
              Logout
            </button>
          )}
          {!loading && !user && (
            <Link
              href="/login"
              className="rounded bg-green-600 px-3 py-1 text-white hover:bg-green-700"
            >
              Login
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}
