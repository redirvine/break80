"use client";

import Link from "next/link";
import { useAuth } from "./AuthProvider";
import { supabase } from "@/lib/supabase-browser";
import { useRouter } from "next/navigation";

export default function Header() {
  const { user, loading } = useAuth();
  const router = useRouter();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.refresh();
  }

  return (
    <header className="border-b border-gray-200 bg-white">
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
          {!loading && user && (
            <button
              onClick={handleLogout}
              className="rounded bg-gray-100 px-3 py-1 hover:bg-gray-200"
            >
              Logout
            </button>
          )}
        </div>
      </nav>
    </header>
  );
}
