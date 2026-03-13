"use client";

import { useState } from "react";
import { ClubSet } from "@/lib/types";

interface ClubSetCardProps {
  clubSet: ClubSet;
  onEdit: () => void;
  onDelete: () => void;
}

export default function ClubSetCard({
  clubSet,
  onEdit,
  onDelete,
}: ClubSetCardProps) {
  const [confirming, setConfirming] = useState(false);

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
      <div className="flex items-center justify-between">
        <div>
          <span className="font-semibold">{clubSet.name}</span>
          <span className="ml-2 text-sm text-gray-400">
            {clubSet.clubs.length} clubs
          </span>
        </div>
        <div className="flex gap-1">
          <button
            onClick={onEdit}
            className="rounded bg-gray-100 px-2 py-1 text-xs hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600"
          >
            Edit
          </button>
          {confirming ? (
            <>
              <button
                onClick={() => { onDelete(); setConfirming(false); }}
                className="rounded bg-red-600 px-2 py-1 text-xs text-white hover:bg-red-700"
              >
                Confirm
              </button>
              <button
                onClick={() => setConfirming(false)}
                className="rounded bg-gray-100 px-2 py-1 text-xs hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
            </>
          ) : (
            <button
              onClick={() => setConfirming(true)}
              className="rounded bg-red-50 px-2 py-1 text-xs text-red-600 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50"
            >
              Delete
            </button>
          )}
        </div>
      </div>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {clubSet.clubs.map((club) => (
          <span
            key={club}
            className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600 dark:bg-gray-700 dark:text-gray-300"
          >
            {club}
          </span>
        ))}
      </div>
    </div>
  );
}
