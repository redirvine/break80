"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase-browser";
import { useRouter } from "next/navigation";
import { Course } from "@/lib/types";

export default function QuickAddForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [courseId, setCourseId] = useState("");
  const [score, setScore] = useState("");

  useEffect(() => {
    supabase
      .from("courses")
      .select("*")
      .order("name")
      .then(({ data }) => setCourses(data ?? []));
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const scoreVal = parseInt(score, 10);
    const course = courses.find((c) => c.id === courseId);

    if (!courseId || !course || isNaN(scoreVal)) {
      setError("Please select a course and enter a score.");
      setLoading(false);
      return;
    }

    const { error: insertError } = await supabase.from("rounds").insert({
      date_played: new Date().toISOString().split("T")[0],
      course_name: course.name,
      course_id: courseId,
      score: scoreVal,
      transport: "cart",
    });

    if (insertError) {
      setError(`Failed to save: ${insertError.message}`);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setScore("");
    setCourseId("");
    setLoading(false);

    setTimeout(() => {
      setSuccess(false);
      router.push("/");
      router.refresh();
    }, 1500);
  }

  const inputClass =
    "w-full rounded-lg border border-gray-300 px-3 py-3 text-lg focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/30 dark:text-red-400">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm font-medium text-green-700 dark:border-green-800 dark:bg-green-900/30 dark:text-green-400">
          Saved! Redirecting...
        </div>
      )}

      <select
        value={courseId}
        onChange={(e) => setCourseId(e.target.value)}
        required
        className={inputClass}
      >
        <option value="">Select course...</option>
        {courses.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>

      <input
        type="number"
        value={score}
        onChange={(e) => setScore(e.target.value)}
        required
        min={1}
        max={199}
        placeholder="Score"
        className={`${inputClass} text-center text-3xl font-bold`}
        autoFocus
      />

      <button
        type="submit"
        disabled={loading || success}
        className="w-full rounded-lg bg-green-600 px-4 py-3 text-lg font-medium text-white hover:bg-green-700 disabled:opacity-50"
      >
        {loading ? "Saving..." : "Save Score"}
      </button>
    </form>
  );
}
