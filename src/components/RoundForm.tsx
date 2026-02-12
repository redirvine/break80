"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase-browser";
import { useRouter } from "next/navigation";
import { Course, Round, Tee } from "@/lib/types";
import Link from "next/link";

interface RoundFormProps {
  round?: Round;
}

export default function RoundForm({ round }: RoundFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [tees, setTees] = useState<Tee[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState(
    round?.course_id ?? ""
  );
  const [selectedTeeId, setSelectedTeeId] = useState(round?.tee_id ?? "");

  const isEdit = !!round;

  useEffect(() => {
    supabase
      .from("courses")
      .select("*")
      .order("name")
      .then(({ data }) => setCourses(data ?? []));
  }, []);

  useEffect(() => {
    if (!selectedCourseId) {
      setTees([]);
      setSelectedTeeId("");
      return;
    }
    supabase
      .from("tees")
      .select("*")
      .eq("course_id", selectedCourseId)
      .order("tee_name")
      .then(({ data }) => {
        setTees(data ?? []);
        // Only reset tee selection when course changes in create mode,
        // or when course changes away from the original in edit mode
        if (!isEdit || selectedCourseId !== round?.course_id) {
          setSelectedTeeId("");
        }
      });
  }, [selectedCourseId, isEdit, round?.course_id]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const form = new FormData(e.currentTarget);
    const datePlayed = form.get("date_played") as string;
    const score = parseInt(form.get("score") as string, 10);
    const girRaw = form.get("gir") as string;
    const gir = girRaw ? parseInt(girRaw, 10) : null;
    const totalPuttsRaw = form.get("total_putts") as string;
    const totalPutts = totalPuttsRaw ? parseInt(totalPuttsRaw, 10) : null;
    const penaltiesRaw = form.get("penalties") as string;
    const penalties = penaltiesRaw ? parseInt(penaltiesRaw, 10) : null;
    const transport = form.get("transport") as string;
    const notes = (form.get("notes") as string) || null;
    const imageFile = form.get("image") as File;

    const selectedCourse = courses.find((c) => c.id === selectedCourseId);
    const courseName = selectedCourse?.name || "";

    if (!datePlayed || !selectedCourseId || isNaN(score) || !transport) {
      setError("Please fill in all required fields.");
      setLoading(false);
      return;
    }

    if (score < 1 || score > 199) {
      setError("Score must be between 1 and 199.");
      setLoading(false);
      return;
    }

    // Keep existing image unless a new one is selected
    let imageUrl: string | null = isEdit ? round.image_url : null;

    if (imageFile && imageFile.size > 0) {
      const ext = imageFile.name.split(".").pop();
      const path = `${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("scorecards")
        .upload(path, imageFile);

      if (uploadError) {
        setError(`Image upload failed: ${uploadError.message}`);
        setLoading(false);
        return;
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("scorecards").getPublicUrl(path);
      imageUrl = publicUrl;
    }

    const roundData = {
      date_played: datePlayed,
      course_name: courseName,
      course_id: selectedCourseId,
      tee_id: selectedTeeId || null,
      score,
      transport,
      gir: isNaN(gir as number) ? null : gir,
      total_putts: isNaN(totalPutts as number) ? null : totalPutts,
      penalties: isNaN(penalties as number) ? null : penalties,
      notes,
      image_url: imageUrl,
    };

    if (isEdit) {
      const { error: updateError } = await supabase
        .from("rounds")
        .update(roundData)
        .eq("id", round.id);

      if (updateError) {
        setError(`Failed to update round: ${updateError.message}`);
        setLoading(false);
        return;
      }

      router.push(`/rounds/${round.id}`);
    } else {
      const { error: insertError } = await supabase
        .from("rounds")
        .insert(roundData);

      if (insertError) {
        setError(`Failed to save round: ${insertError.message}`);
        setLoading(false);
        return;
      }

      router.push("/rounds");
    }

    router.refresh();
  }

  const inputClass =
    "w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="date_played" className="mb-1 block text-sm font-medium">
          Date Played *
        </label>
        <input
          type="date"
          id="date_played"
          name="date_played"
          required
          defaultValue={
            round?.date_played ?? new Date().toISOString().split("T")[0]
          }
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="course" className="mb-1 block text-sm font-medium">
          Course *
        </label>
        {courses.length === 0 ? (
          <p className="text-sm text-gray-500">
            No courses yet.{" "}
            <Link href="/add-course" className="text-green-600 hover:underline">
              Add a course
            </Link>{" "}
            first.
          </p>
        ) : (
          <select
            id="course"
            value={selectedCourseId}
            onChange={(e) => setSelectedCourseId(e.target.value)}
            required
            className={inputClass}
          >
            <option value="">Select a course...</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        )}
      </div>

      {tees.length > 0 && (
        <div>
          <label htmlFor="tee" className="mb-1 block text-sm font-medium">
            Tee
          </label>
          <select
            id="tee"
            value={selectedTeeId}
            onChange={(e) => setSelectedTeeId(e.target.value)}
            className={inputClass}
          >
            <option value="">Select a tee...</option>
            {tees.map((t) => (
              <option key={t.id} value={t.id}>
                {t.tee_name}
                {t.yardage ? ` (${t.yardage} yds)` : ""}
              </option>
            ))}
          </select>
        </div>
      )}

      <div>
        <label htmlFor="score" className="mb-1 block text-sm font-medium">
          Score *
        </label>
        <input
          type="number"
          id="score"
          name="score"
          required
          min={1}
          max={199}
          defaultValue={round?.score ?? ""}
          placeholder="e.g. 85"
          className={inputClass}
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Transport *</label>
        <div className="flex gap-4">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="transport"
              value="walk"
              required
              defaultChecked={round?.transport ? round.transport === "walk" : true}
              className="text-green-600 focus:ring-green-500"
            />
            <span className="text-sm">Walk</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="transport"
              value="cart"
              defaultChecked={round?.transport === "cart"}
              className="text-green-600 focus:ring-green-500"
            />
            <span className="text-sm">Cart</span>
          </label>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label htmlFor="gir" className="mb-1 block text-sm font-medium">
            GIR
          </label>
          <input
            type="number"
            id="gir"
            name="gir"
            min={0}
            max={18}
            defaultValue={round?.gir ?? ""}
            placeholder="0-18"
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="total_putts" className="mb-1 block text-sm font-medium">
            Total Putts
          </label>
          <input
            type="number"
            id="total_putts"
            name="total_putts"
            min={0}
            max={99}
            defaultValue={round?.total_putts ?? ""}
            placeholder="e.g. 32"
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="penalties" className="mb-1 block text-sm font-medium">
            Penalties
          </label>
          <input
            type="number"
            id="penalties"
            name="penalties"
            min={0}
            max={99}
            defaultValue={round?.penalties ?? ""}
            placeholder="e.g. 2"
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label htmlFor="notes" className="mb-1 block text-sm font-medium">
          Notes
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={3}
          defaultValue={round?.notes ?? ""}
          placeholder="How did the round go?"
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="image" className="mb-1 block text-sm font-medium">
          Scorecard Image
        </label>
        {isEdit && round.image_url && (
          <p className="mb-1 text-xs text-gray-500">
            Current image will be kept unless you select a new one.
          </p>
        )}
        <input
          type="file"
          id="image"
          name="image"
          accept="image/*"
          className="w-full text-sm text-gray-500 file:mr-3 file:rounded-lg file:border-0 file:bg-green-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-green-700 hover:file:bg-green-100"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-green-600 px-4 py-2 font-medium text-white hover:bg-green-700 disabled:opacity-50"
      >
        {loading ? "Saving..." : isEdit ? "Update Round" : "Save Round"}
      </button>
    </form>
  );
}
