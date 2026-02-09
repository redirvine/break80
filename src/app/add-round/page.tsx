"use client";

import { useAuth } from "@/components/AuthProvider";
import RoundForm from "@/components/RoundForm";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AddRoundPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return <p className="text-gray-400">Loading...</p>;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <h1 className="text-2xl font-bold">Add Round</h1>
      <RoundForm />
    </div>
  );
}
