"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase-browser";
import { useRouter } from "next/navigation";

interface TeeInput {
  tee_name: string;
  yardage: string;
  par: string;
  slope: string;
  rating: string;
}

const emptyTee = (): TeeInput => ({
  tee_name: "",
  yardage: "",
  par: "",
  slope: "",
  rating: "",
});

export default function CourseForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [tees, setTees] = useState<TeeInput[]>([emptyTee()]);

  function addTee() {
    setTees([...tees, emptyTee()]);
  }

  function removeTee(index: number) {
    setTees(tees.filter((_, i) => i !== index));
  }

  function updateTee(index: number, field: keyof TeeInput, value: string) {
    setTees(tees.map((t, i) => (i === index ? { ...t, [field]: value } : t)));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!name.trim()) {
      setError("Course name is required.");
      setLoading(false);
      return;
    }

    const validTees = tees.filter((t) => t.tee_name.trim());
    if (validTees.length === 0) {
      setError("Add at least one tee with a name.");
      setLoading(false);
      return;
    }

    const { data: course, error: courseError } = await supabase
      .from("courses")
      .insert({
        name: name.trim(),
        city: city.trim() || null,
        state: state.trim() || null,
      })
      .select()
      .single();

    if (courseError || !course) {
      setError(`Failed to save course: ${courseError?.message}`);
      setLoading(false);
      return;
    }

    const teeRows = validTees.map((t) => ({
      course_id: course.id,
      tee_name: t.tee_name.trim(),
      yardage: t.yardage ? parseInt(t.yardage, 10) : null,
      par: t.par ? parseInt(t.par, 10) : null,
      slope: t.slope ? parseFloat(t.slope) : null,
      rating: t.rating ? parseFloat(t.rating) : null,
    }));

    const { error: teeError } = await supabase.from("tees").insert(teeRows);

    if (teeError) {
      setError(`Course saved but tees failed: ${teeError.message}`);
      setLoading(false);
      return;
    }

    router.push("/courses");
    router.refresh();
  }

  const inputClass =
    "w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="name" className="mb-1 block text-sm font-medium">
          Course Name *
        </label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          placeholder="e.g. Pebble Beach"
          className={inputClass}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="city" className="mb-1 block text-sm font-medium">
            City
          </label>
          <input
            type="text"
            id="city"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="e.g. Pebble Beach"
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="state" className="mb-1 block text-sm font-medium">
            State
          </label>
          <input
            type="text"
            id="state"
            value={state}
            onChange={(e) => setState(e.target.value)}
            placeholder="e.g. CA"
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold">Tees</h2>
          <button
            type="button"
            onClick={addTee}
            className="rounded bg-green-50 px-3 py-1 text-sm font-medium text-green-700 hover:bg-green-100"
          >
            + Add Tee
          </button>
        </div>

        <div className="space-y-4">
          {tees.map((tee, i) => (
            <div
              key={i}
              className="rounded-lg border border-gray-200 bg-gray-50 p-4"
            >
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">
                  Tee {i + 1}
                </span>
                {tees.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeTee(i)}
                    className="text-sm text-red-500 hover:text-red-700"
                  >
                    Remove
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
                <div className="col-span-2 sm:col-span-1">
                  <label className="mb-1 block text-xs text-gray-500">
                    Name *
                  </label>
                  <input
                    type="text"
                    value={tee.tee_name}
                    onChange={(e) => updateTee(i, "tee_name", e.target.value)}
                    placeholder="Blue"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-gray-500">
                    Yardage
                  </label>
                  <input
                    type="number"
                    value={tee.yardage}
                    onChange={(e) => updateTee(i, "yardage", e.target.value)}
                    placeholder="6800"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-gray-500">
                    Par
                  </label>
                  <input
                    type="number"
                    value={tee.par}
                    onChange={(e) => updateTee(i, "par", e.target.value)}
                    placeholder="72"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-gray-500">
                    Slope
                  </label>
                  <input
                    type="number"
                    value={tee.slope}
                    onChange={(e) => updateTee(i, "slope", e.target.value)}
                    placeholder="131"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-gray-500">
                    Rating
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={tee.rating}
                    onChange={(e) => updateTee(i, "rating", e.target.value)}
                    placeholder="72.4"
                    className={inputClass}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-green-600 px-4 py-2 font-medium text-white hover:bg-green-700 disabled:opacity-50"
      >
        {loading ? "Saving..." : "Save Course"}
      </button>
    </form>
  );
}
