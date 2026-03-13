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
            <Link href="/clubs" className="hover:text-green-600">
              Clubs
            </Link>
          )}
          {!loading && user && (
            <Link href="/add-round" className="hover:text-green-600">
              Add Round
            </Link>
          )}
          <button
            onClick={toggle}
            className="rounded p-1.5 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
            aria-label="Toggle dark mode"
          >
            {theme === "light" ? (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                <circle cx={12} cy={12} r={5} />
                <line x1={12} y1={1} x2={12} y2={3} />
                <line x1={12} y1={21} x2={12} y2={23} />
                <line x1={4.22} y1={4.22} x2={5.64} y2={5.64} />
                <line x1={18.36} y1={18.36} x2={19.78} y2={19.78} />
                <line x1={1} y1={12} x2={3} y2={12} />
                <line x1={21} y1={12} x2={23} y2={12} />
                <line x1={4.22} y1={19.78} x2={5.64} y2={18.36} />
                <line x1={18.36} y1={5.64} x2={19.78} y2={4.22} />
              </svg>
            )}
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
