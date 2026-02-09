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
    const notes = (form.get("notes") as string) || null;
    const imageFile = form.get("image") as File;

    const selectedCourse = courses.find((c) => c.id === selectedCourseId);
    const courseName = selectedCourse?.name || "";

    if (!datePlayed || !selectedCourseId || isNaN(score)) {
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
