"use client";

import { useAuth } from "@/components/AuthProvider";
import RoundForm from "@/components/RoundForm";
import { supabase } from "@/lib/supabase-browser";
import { Round } from "@/lib/types";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function EditRoundPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [round, setRound] = useState<Round | null>(null);
  const [loading, setLoading] = useState(true);
  const [id, setId] = useState<string | null>(null);

  useEffect(() => {
    params.then(({ id }) => setId(id));
  }, [params]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!id) return;
    supabase
      .from("rounds")
      .select("*")
      .eq("id", id)
      .single()
      .then(({ data }) => {
        setRound(data as Round | null);
        setLoading(false);
      });
  }, [id]);

  if (authLoading || loading) {
    return <p className="text-gray-400">Loading...</p>;
  }

  if (!user) {
    return null;
  }

  if (!round) {
    return <p className="text-gray-500">Round not found.</p>;
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <Link
        href={`/rounds/${round.id}`}
        className="text-sm text-gray-500 hover:text-green-600"
      >
        &larr; Back to round
      </Link>
      <h1 className="text-2xl font-bold">Edit Round</h1>
      <RoundForm round={round} />
    </div>
  );
}
