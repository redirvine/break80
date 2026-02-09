"use client";

import Link from "next/link";
import { useAuth } from "./AuthProvider";

export default function EditRoundLink({ roundId }: { roundId: string }) {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <Link
      href={`/rounds/${roundId}/edit`}
      className="rounded-lg border border-green-600 px-3 py-1 text-sm font-medium text-green-600 hover:bg-green-50"
    >
      Edit
    </Link>
  );
}
