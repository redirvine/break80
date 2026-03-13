"use client";

import { useAuth } from "@/components/AuthProvider";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase-browser";
import { ClubSet } from "@/lib/types";
import ClubSetCard from "@/components/ClubSetCard";
import ClubSetForm from "@/components/ClubSetForm";

export default function ClubsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [clubSets, setClubSets] = useState<ClubSet[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingSet, setEditingSet] = useState<ClubSet | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) loadClubSets();
  }, [user]);

  async function loadClubSets() {
    const { data } = await supabase
      .from("club_sets")
      .select("*")
      .order("created_at", { ascending: false });
    setClubSets(data ?? []);
  }

  function handleSaved() {
    setShowForm(false);
    setEditingSet(null);
    loadClubSets();
  }

  function handleEdit(set: ClubSet) {
    setEditingSet(set);
    setShowForm(true);
  }

  function handleCancel() {
    setShowForm(false);
    setEditingSet(null);
  }

  async function handleDelete(id: string) {
    await supabase.from("club_sets").delete().eq("id", id);
    loadClubSets();
  }

  if (loading) return <p className="text-gray-400">Loading...</p>;
  if (!user) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Club Sets</h1>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
          >
            Add Set
          </button>
        )}
      </div>

      {showForm && (
        <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <ClubSetForm
            clubSet={editingSet}
            onSaved={handleSaved}
            onCancel={handleCancel}
          />
        </div>
      )}

      {clubSets.length === 0 && !showForm ? (
        <p className="text-gray-400">No club sets yet.</p>
      ) : (
        <div className="space-y-4">
          {clubSets.map((set) => (
            <ClubSetCard
              key={set.id}
              clubSet={set}
              onEdit={() => handleEdit(set)}
              onDelete={() => handleDelete(set.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
