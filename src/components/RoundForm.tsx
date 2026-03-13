"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase-browser";
import { useRouter } from "next/navigation";
import { Course, Round, Tee } from "@/lib/types";
import Link from "next/link";
import ImageCropper from "./ImageCropper";

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
  const [frontNine, setFrontNine] = useState(round?.front_nine?.toString() ?? "");
  const [backNine, setBackNine] = useState(round?.back_nine?.toString() ?? "");
  const [score, setScore] = useState(round?.score?.toString() ?? "");

  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [croppedBlob, setCroppedBlob] = useState<Blob | null>(null);
  const [croppedPreview, setCroppedPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isEdit = !!round;

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setCropSrc(url);
    setCroppedBlob(null);
    setCroppedPreview(null);
  }

  function handleCropDone(blob: Blob) {
    setCroppedBlob(blob);
    setCroppedPreview(URL.createObjectURL(blob));
    setCropSrc(null);
  }

  function handleCropCancel() {
    setCropSrc(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function handleNineChange(which: "front" | "back", value: string) {
    if (which === "front") setFrontNine(value);
    else setBackNine(value);
    const f = which === "front" ? parseInt(value, 10) : parseInt(frontNine, 10);
    const b = which === "back" ? parseInt(value, 10) : parseInt(backNine, 10);
    if (!isNaN(f) && !isNaN(b)) {
      setScore(String(f + b));
    }
  }

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
    const scoreVal = parseInt(score, 10);
    const frontNineVal = frontNine ? parseInt(frontNine, 10) : null;
    const backNineVal = backNine ? parseInt(backNine, 10) : null;
    const birdiesRaw = form.get("birdies") as string;
    const birdies = birdiesRaw ? parseInt(birdiesRaw, 10) : null;
    const parsRaw = form.get("pars") as string;
    const parsVal = parsRaw ? parseInt(parsRaw, 10) : null;
    const girRaw = form.get("gir") as string;
    const gir = girRaw ? parseInt(girRaw, 10) : null;
    const fairwaysRaw = form.get("fairways_hit") as string;
    const fairwaysHit = fairwaysRaw ? parseInt(fairwaysRaw, 10) : null;
    const totalPuttsRaw = form.get("total_putts") as string;
    const totalPutts = totalPuttsRaw ? parseInt(totalPuttsRaw, 10) : null;
    const penaltiesRaw = form.get("penalties") as string;
    const penalties = penaltiesRaw ? parseInt(penaltiesRaw, 10) : null;
    const scramblesRaw = form.get("scrambles") as string;
    const scrambles = scramblesRaw ? parseInt(scramblesRaw, 10) : null;
    const transport = form.get("transport") as string;
    const notes = (form.get("notes") as string) || null;

    const selectedCourse = courses.find((c) => c.id === selectedCourseId);
    const courseName = selectedCourse?.name || "";

    if (!datePlayed || !selectedCourseId || isNaN(scoreVal) || !transport) {
      setError("Please fill in all required fields.");
      setLoading(false);
      return;
    }

    if (scoreVal < 1 || scoreVal > 199) {
      setError("Score must be between 1 and 199.");
      setLoading(false);
      return;
    }

    // Keep existing image unless a new one is selected
    let imageUrl: string | null = isEdit ? round.image_url : null;

    const uploadBlob = croppedBlob ?? (fileInputRef.current?.files?.[0]?.size ? fileInputRef.current.files[0] : null);
    if (uploadBlob) {
      const ext = croppedBlob ? "jpg" : fileInputRef.current!.files![0].name.split(".").pop();
      const path = `${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("scorecards")
        .upload(path, uploadBlob);

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
      score: scoreVal,
      front_nine: isNaN(frontNineVal as number) ? null : frontNineVal,
      back_nine: isNaN(backNineVal as number) ? null : backNineVal,
      transport,
      birdies: isNaN(birdies as number) ? null : birdies,
      pars: isNaN(parsVal as number) ? null : parsVal,
      gir: isNaN(gir as number) ? null : gir,
      fairways_hit: isNaN(fairwaysHit as number) ? null : fairwaysHit,
      total_putts: isNaN(totalPutts as number) ? null : totalPutts,
      penalties: isNaN(penalties as number) ? null : penalties,
      scrambles: isNaN(scrambles as number) ? null : scrambles,
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
    "w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100";

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

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label htmlFor="front_nine" className="mb-1 block text-sm font-medium">
            Front 9
          </label>
          <input
            type="number"
            id="front_nine"
            min={1}
            max={99}
            value={frontNine}
            onChange={(e) => handleNineChange("front", e.target.value)}
            placeholder="e.g. 42"
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="back_nine" className="mb-1 block text-sm font-medium">
            Back 9
          </label>
          <input
            type="number"
            id="back_nine"
            min={1}
            max={99}
            value={backNine}
            onChange={(e) => handleNineChange("back", e.target.value)}
            placeholder="e.g. 43"
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="score" className="mb-1 block text-sm font-medium">
            Total *
          </label>
          <input
            type="number"
            id="score"
            required
            min={1}
            max={199}
            value={score}
            onChange={(e) => setScore(e.target.value)}
            placeholder="e.g. 85"
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Transport *</label>
        <div className="flex gap-4">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="transport"
              value="cart"
              required
              defaultChecked={round?.transport ? round.transport === "cart" : true}
              className="text-green-600 focus:ring-green-500"
            />
            <span className="text-sm">Cart</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="transport"
              value="walk"
              defaultChecked={round?.transport === "walk"}
              className="text-green-600 focus:ring-green-500"
            />
            <span className="text-sm">Walk</span>
          </label>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 sm:grid-cols-7">
        <div>
          <label htmlFor="birdies" className="mb-1 block text-sm font-medium">
            Birdies
          </label>
          <input
            type="number"
            id="birdies"
            name="birdies"
            min={0}
            max={18}
            defaultValue={round?.birdies ?? ""}
            placeholder="0-18"
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="pars" className="mb-1 block text-sm font-medium">
            Pars
          </label>
          <input
            type="number"
            id="pars"
            name="pars"
            min={0}
            max={18}
            defaultValue={round?.pars ?? ""}
            placeholder="0-18"
            className={inputClass}
          />
        </div>
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
          <label htmlFor="fairways_hit" className="mb-1 block text-sm font-medium">
            Fairways
          </label>
          <input
            type="number"
            id="fairways_hit"
            name="fairways_hit"
            min={0}
            max={18}
            defaultValue={round?.fairways_hit ?? ""}
            placeholder="0-14"
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="total_putts" className="mb-1 block text-sm font-medium">
            Putts
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
        <div>
          <label htmlFor="scrambles" className="mb-1 block text-sm font-medium">
            Scrambles
          </label>
          <input
            type="number"
            id="scrambles"
            name="scrambles"
            min={0}
            max={18}
            defaultValue={round?.scrambles ?? ""}
            placeholder="0-18"
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
        <label className="mb-1 block text-sm font-medium">
          Scorecard Image
        </label>
        {isEdit && round.image_url && !cropSrc && !croppedPreview && (
          <div className="mt-2">
            <img
              src={round.image_url}
              alt="Current scorecard"
              className="mb-2 w-full rounded-lg border border-gray-200"
            />
            <button
              type="button"
              onClick={() => setCropSrc(round.image_url!)}
              className="rounded border border-green-600 px-3 py-1 text-xs font-medium text-green-600 hover:bg-green-50"
            >
              Crop / Rotate
            </button>
          </div>
        )}
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          onChange={handleFileSelect}
          className={`w-full text-sm text-gray-500 file:mr-3 file:rounded-lg file:border-0 file:bg-green-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-green-700 hover:file:bg-green-100 ${
            isEdit && round.image_url && !cropSrc && !croppedPreview ? "mt-2" : ""
          }`}
        />
        {cropSrc && (
          <div className="mt-3">
            <ImageCropper
              imageSrc={cropSrc}
              onCropDone={handleCropDone}
              onCancel={handleCropCancel}
            />
          </div>
        )}
        {croppedPreview && (
          <div className="mt-3">
            <img
              src={croppedPreview}
              alt="Cropped preview"
              className="w-full rounded-lg border border-gray-200"
            />
          </div>
        )}
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
