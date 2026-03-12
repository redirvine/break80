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
          <a
            href="https://rules.usga.org/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-green-600"
          >
            Rules
          </a>
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
            className="rounded p-1 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            aria-label="Toggle dark mode"
            title={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
          >
            {theme === "light" ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
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
        </div>
      </nav>
    </header>
  );
}
