"use client";

import { useState } from "react";
import { Tee } from "@/lib/types";
import { supabase } from "@/lib/supabase-browser";
import { useRouter } from "next/navigation";
import { useAuth } from "./AuthProvider";

export default function TeeRow({ tee }: { tee: Tee }) {
  const { user } = useAuth();
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [teeName, setTeeName] = useState(tee.tee_name);
  const [yardage, setYardage] = useState(tee.yardage?.toString() ?? "");
  const [par, setPar] = useState(tee.par?.toString() ?? "");
  const [slope, setSlope] = useState(tee.slope?.toString() ?? "");
  const [rating, setRating] = useState(tee.rating?.toString() ?? "");

  async function handleSave() {
    setSaving(true);
    await supabase
      .from("tees")
      .update({
        tee_name: teeName.trim(),
        yardage: yardage ? parseInt(yardage, 10) : null,
        par: par ? parseInt(par, 10) : null,
        slope: slope ? parseFloat(slope) : null,
        rating: rating ? parseFloat(rating) : null,
      })
      .eq("id", tee.id);
    setSaving(false);
    setEditing(false);
    router.refresh();
  }

  function handleCancel() {
    setTeeName(tee.tee_name);
    setYardage(tee.yardage?.toString() ?? "");
    setPar(tee.par?.toString() ?? "");
    setSlope(tee.slope?.toString() ?? "");
    setRating(tee.rating?.toString() ?? "");
    setEditing(false);
    setDeleting(false);
  }

  async function handleDelete() {
    setSaving(true);
    await supabase.from("tees").delete().eq("id", tee.id);
    setSaving(false);
    router.refresh();
  }

  const inputClass =
    "w-full rounded border border-gray-300 px-2 py-1 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500";

  if (editing) {
    return (
      <tr className="border-b last:border-0">
        <td className="py-1 pr-2">
          <input value={teeName} onChange={(e) => setTeeName(e.target.value)} className={inputClass} />
        </td>
        <td className="py-1 pr-2">
          <input type="number" value={yardage} onChange={(e) => setYardage(e.target.value)} className={inputClass} />
        </td>
        <td className="py-1 pr-2">
          <input type="number" value={par} onChange={(e) => setPar(e.target.value)} className={inputClass} />
        </td>
        <td className="py-1 pr-2">
          <input type="number" value={slope} onChange={(e) => setSlope(e.target.value)} className={inputClass} />
        </td>
        <td className="py-1 pr-2">
          <input type="number" step="0.1" value={rating} onChange={(e) => setRating(e.target.value)} className={inputClass} />
        </td>
        <td className="py-1">
          <div className="flex gap-1">
            <button
              onClick={handleSave}
              disabled={saving || !teeName.trim()}
              className="rounded bg-green-600 px-2 py-1 text-xs text-white hover:bg-green-700 disabled:opacity-50"
            >
              {saving ? "..." : "Save"}
            </button>
            <button
              onClick={handleCancel}
              className="rounded bg-gray-100 px-2 py-1 text-xs hover:bg-gray-200"
            >
              Cancel
            </button>
          </div>
        </td>
      </tr>
    );
  }

  if (deleting) {
    return (
      <tr className="border-b last:border-0 bg-red-50">
        <td className="py-1" colSpan={6}>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Delete &ldquo;{tee.tee_name}&rdquo;?</span>
            <button
              onClick={handleDelete}
              disabled={saving}
              className="rounded bg-red-600 px-2 py-1 text-xs text-white hover:bg-red-700 disabled:opacity-50"
            >
              {saving ? "..." : "Yes, delete"}
            </button>
            <button
              onClick={handleCancel}
              className="rounded bg-gray-100 px-2 py-1 text-xs hover:bg-gray-200"
            >
              Cancel
            </button>
          </div>
        </td>
      </tr>
    );
  }

  return (
    <tr className="border-b last:border-0">
      <td className="py-1">{tee.tee_name}</td>
      <td className="py-1">{tee.yardage ?? "—"}</td>
      <td className="py-1">{tee.par ?? "—"}</td>
      <td className="py-1">{tee.slope ?? "—"}</td>
      <td className="py-1">{tee.rating ?? "—"}</td>
      {user && (
        <td className="py-1">
          <div className="flex gap-1">
            <button
              onClick={() => setEditing(true)}
              className="rounded bg-gray-100 px-2 py-1 text-xs hover:bg-gray-200"
            >
              Edit
            </button>
            <button
              onClick={() => setDeleting(true)}
              className="rounded bg-red-50 px-2 py-1 text-xs text-red-600 hover:bg-red-100"
            >
              Delete
            </button>
          </div>
        </td>
      )}
    </tr>
  );
}
