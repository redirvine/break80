"use client";

import { useState } from "react";
import { Tee } from "@/lib/types";
import { supabase } from "@/lib/supabase-browser";
import { useRouter } from "next/navigation";
import { useAuth } from "./AuthProvider";

interface TeeRowProps {
  tee: Tee;
  courseHoles: 9 | 18;
}

export default function TeeRow({ tee, courseHoles }: TeeRowProps) {
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

  const [combineNines, setCombineNines] = useState(false);
  const [nine1Slope, setNine1Slope] = useState("");
  const [nine1Rating, setNine1Rating] = useState("");
  const [nine1Par, setNine1Par] = useState("");
  const [nine2Slope, setNine2Slope] = useState("");
  const [nine2Rating, setNine2Rating] = useState("");
  const [nine2Par, setNine2Par] = useState("");

  function recalcCombined(
    s1: string, s2: string, r1: string, r2: string, p1: string, p2: string
  ) {
    const slopeA = parseFloat(s1);
    const slopeB = parseFloat(s2);
    const ratingA = parseFloat(r1);
    const ratingB = parseFloat(r2);
    const parA = parseInt(p1, 10);
    const parB = parseInt(p2, 10);
    if (!isNaN(slopeA) && !isNaN(slopeB)) {
      setSlope(String(Math.round((slopeA + slopeB) / 2)));
    }
    if (!isNaN(ratingA) && !isNaN(ratingB)) {
      setRating(String(Math.round((ratingA + ratingB) * 10) / 10));
    }
    if (!isNaN(parA) && !isNaN(parB)) {
      setPar(String(parA + parB));
    }
  }

  function handleNineChange(
    nine: 1 | 2,
    field: "slope" | "rating" | "par",
    value: string
  ) {
    let s1 = nine1Slope, s2 = nine2Slope;
    let r1 = nine1Rating, r2 = nine2Rating;
    let p1 = nine1Par, p2 = nine2Par;

    if (nine === 1) {
      if (field === "slope") { setNine1Slope(value); s1 = value; }
      if (field === "rating") { setNine1Rating(value); r1 = value; }
      if (field === "par") { setNine1Par(value); p1 = value; }
    } else {
      if (field === "slope") { setNine2Slope(value); s2 = value; }
      if (field === "rating") { setNine2Rating(value); r2 = value; }
      if (field === "par") { setNine2Par(value); p2 = value; }
    }
    recalcCombined(s1, s2, r1, r2, p1, p2);
  }

  function toggleCombine() {
    if (combineNines) {
      setCombineNines(false);
    } else {
      setCombineNines(true);
      setSlope("");
      setRating("");
      setPar("");
      setNine1Slope("");
      setNine1Rating("");
      setNine1Par("");
      setNine2Slope("");
      setNine2Rating("");
      setNine2Par("");
    }
  }

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
    setCombineNines(false);
    router.refresh();
  }

  function handleCancel() {
    setTeeName(tee.tee_name);
    setYardage(tee.yardage?.toString() ?? "");
    setPar(tee.par?.toString() ?? "");
    setSlope(tee.slope?.toString() ?? "");
    setRating(tee.rating?.toString() ?? "");
    setCombineNines(false);
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
    "w-full rounded border border-gray-300 px-2 py-1 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100";

  if (editing) {
    return (
      <>
        <tr className="border-b last:border-0 dark:border-gray-700">
          <td className="py-1 pr-2">
            <input value={teeName} onChange={(e) => setTeeName(e.target.value)} className={inputClass} />
          </td>
          <td className="py-1 pr-2">
            <input type="number" value={yardage} onChange={(e) => setYardage(e.target.value)} className={inputClass} />
          </td>
          <td className="py-1 pr-2">
            {!combineNines && (
              <input type="number" value={par} onChange={(e) => setPar(e.target.value)} className={inputClass} />
            )}
            {combineNines && (
              <span className="text-sm text-gray-400">{par || "—"}</span>
            )}
          </td>
          <td className="py-1 pr-2">
            {!combineNines && (
              <input type="number" value={slope} onChange={(e) => setSlope(e.target.value)} className={inputClass} />
            )}
            {combineNines && (
              <span className="text-sm text-gray-400">{slope || "—"}</span>
            )}
          </td>
          <td className="py-1 pr-2">
            {!combineNines && (
              <input type="number" step="0.1" value={rating} onChange={(e) => setRating(e.target.value)} className={inputClass} />
            )}
            {combineNines && (
              <span className="text-sm text-gray-400">{rating || "—"}</span>
            )}
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
                className="rounded bg-gray-100 px-2 py-1 text-xs hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </td>
        </tr>
        {courseHoles === 18 && (
          <tr className="border-b last:border-0 dark:border-gray-700">
            <td colSpan={6} className="pb-2 pt-1">
              <button
                type="button"
                onClick={toggleCombine}
                className={`text-xs font-medium ${
                  combineNines
                    ? "text-green-600"
                    : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                }`}
              >
                {combineNines ? "- Use single slope/rating/par" : "+ Combine from two 9s"}
              </button>
              {combineNines && (
                <div className="mt-2 space-y-2">
                  {([1, 2] as const).map((nine) => (
                    <div key={nine} className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="mb-1 block text-xs text-gray-500 dark:text-gray-400">
                          {nine === 1 ? "First" : "Second"} 9 Slope
                        </label>
                        <input
                          type="number"
                          value={nine === 1 ? nine1Slope : nine2Slope}
                          onChange={(e) => handleNineChange(nine, "slope", e.target.value)}
                          placeholder="113"
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs text-gray-500 dark:text-gray-400">
                          {nine === 1 ? "First" : "Second"} 9 Rating
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          value={nine === 1 ? nine1Rating : nine2Rating}
                          onChange={(e) => handleNineChange(nine, "rating", e.target.value)}
                          placeholder="35.2"
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs text-gray-500 dark:text-gray-400">
                          {nine === 1 ? "First" : "Second"} 9 Par
                        </label>
                        <input
                          type="number"
                          value={nine === 1 ? nine1Par : nine2Par}
                          onChange={(e) => handleNineChange(nine, "par", e.target.value)}
                          placeholder="36"
                          className={inputClass}
                        />
                      </div>
                    </div>
                  ))}
                  {slope && rating && par && (
                    <div className="rounded bg-green-50 px-3 py-2 text-sm text-green-800 dark:bg-green-900/30 dark:text-green-400">
                      Combined: Par {par} / Slope {slope} / Rating {rating}
                    </div>
                  )}
                </div>
              )}
            </td>
          </tr>
        )}
      </>
    );
  }

  if (deleting) {
    return (
      <tr className="border-b last:border-0 bg-red-50 dark:border-gray-700 dark:bg-red-900/20">
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
              className="rounded bg-gray-100 px-2 py-1 text-xs hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600"
            >
              Cancel
            </button>
          </div>
        </td>
      </tr>
    );
  }

  return (
    <tr className="border-b last:border-0 dark:border-gray-700">
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
              className="rounded bg-gray-100 px-2 py-1 text-xs hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600"
            >
              Edit
            </button>
            <button
              onClick={() => setDeleting(true)}
              className="rounded bg-red-50 px-2 py-1 text-xs text-red-600 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50"
            >
              Delete
            </button>
          </div>
        </td>
      )}
    </tr>
  );
}
