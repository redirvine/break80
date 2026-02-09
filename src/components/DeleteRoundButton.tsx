"use client";

import { useState } from "react";
import { useAuth } from "./AuthProvider";
import { supabase } from "@/lib/supabase-browser";
import { useRouter } from "next/navigation";

export default function DeleteRoundButton({ roundId }: { roundId: string }) {
  const { user } = useAuth();
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);

  if (!user) return null;

  async function handleDelete() {
    setDeleting(true);
    await supabase.from("rounds").delete().eq("id", roundId);
    router.push("/rounds");
    router.refresh();
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-500">Delete this round?</span>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="rounded bg-red-600 px-3 py-1 text-sm text-white hover:bg-red-700 disabled:opacity-50"
        >
          {deleting ? "Deleting..." : "Yes, delete"}
        </button>
        <button
          onClick={() => setConfirming(false)}
          className="rounded bg-gray-100 px-3 py-1 text-sm hover:bg-gray-200"
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="rounded bg-red-50 px-3 py-1 text-sm text-red-600 hover:bg-red-100"
    >
      Delete
    </button>
  );
}
