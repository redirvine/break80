"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase-browser";
import { ClubSet } from "@/lib/types";

const COMMON_CLUBS = [
  "Driver",
  "3W",
  "4W",
  "5W",
  "7W",
  "2H",
  "3H",
  "4H",
  "5H",
  "3i",
  "4i",
  "5i",
  "6i",
  "7i",
  "8i",
  "9i",
  "PW",
  "GW",
  "SW",
  "LW",
  "Putter",
];

interface ClubSetFormProps {
  clubSet?: ClubSet | null;
  onSaved: () => void;
  onCancel: () => void;
}

export default function ClubSetForm({
  clubSet,
  onSaved,
  onCancel,
}: ClubSetFormProps) {
  const [name, setName] = useState(clubSet?.name ?? "");
  const [selectedClubs, setSelectedClubs] = useState<string[]>(
    clubSet?.clubs ?? []
  );
  const [customClub, setCustomClub] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function toggleClub(club: string) {
    setSelectedClubs((prev) =>
      prev.includes(club) ? prev.filter((c) => c !== club) : [...prev, club]
    );
  }

  function addCustomClub() {
    const trimmed = customClub.trim();
    if (trimmed && !selectedClubs.includes(trimmed)) {
      setSelectedClubs((prev) => [...prev, trimmed]);
    }
    setCustomClub("");
  }

  function removeClub(club: string) {
    setSelectedClubs((prev) => prev.filter((c) => c !== club));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError("Name is required.");
      return;
    }
    if (selectedClubs.length === 0) {
      setError("Add at least one club.");
      return;
    }

    setSaving(true);
    setError(null);

    if (clubSet) {
      const { error: updateError } = await supabase
        .from("club_sets")
        .update({ name: name.trim(), clubs: selectedClubs })
        .eq("id", clubSet.id);
      if (updateError) {
        setError(updateError.message);
        setSaving(false);
        return;
      }
    } else {
      const { error: insertError } = await supabase
        .from("club_sets")
        .insert({ name: name.trim(), clubs: selectedClubs });
      if (insertError) {
        setError(insertError.message);
        setSaving(false);
        return;
      }
    }

    setSaving(false);
    onSaved();
  }

  const inputClass =
    "w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/30 dark:text-red-400">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="set-name" className="mb-1 block text-sm font-medium">
          Set Name
        </label>
        <input
          id="set-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Tournament Bag"
          className={inputClass}
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium">Select Clubs</label>
        <div className="flex flex-wrap gap-2">
          {COMMON_CLUBS.map((club) => (
            <button
              key={club}
              type="button"
              onClick={() => toggleClub(club)}
              className={`rounded-full px-3 py-1 text-sm font-medium transition ${
                selectedClubs.includes(club)
                  ? "bg-green-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              }`}
            >
              {club}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="custom-club" className="mb-1 block text-sm font-medium">
          Add Custom Club
        </label>
        <div className="flex gap-2">
          <input
            id="custom-club"
            value={customClub}
            onChange={(e) => setCustomClub(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addCustomClub();
              }
            }}
            placeholder="e.g. 60° Wedge"
            className={inputClass}
          />
          <button
            type="button"
            onClick={addCustomClub}
            className="rounded-lg bg-gray-100 px-3 py-2 text-sm font-medium hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600"
          >
            Add
          </button>
        </div>
      </div>

      {selectedClubs.length > 0 && (
        <div>
          <div className="mb-1 text-sm font-medium">
            Selected ({selectedClubs.length} clubs)
          </div>
          <div className="flex flex-wrap gap-1.5">
            {selectedClubs.map((club) => (
              <span
                key={club}
                className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-0.5 text-sm font-medium text-green-800 dark:bg-green-900/40 dark:text-green-400"
              >
                {club}
                <button
                  type="button"
                  onClick={() => removeClub(club)}
                  className="ml-0.5 text-green-600 hover:text-red-500 dark:text-green-400 dark:hover:text-red-400"
                >
                  &times;
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
        >
          {saving ? "Saving..." : clubSet ? "Update Set" : "Save Set"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
