import { createServerClient } from "@/lib/supabase-server";
import { Course, Tee } from "@/lib/types";
import Link from "next/link";
import TeeTable from "@/components/TeeTable";

export const dynamic = "force-dynamic";

export default async function CoursesPage() {
  const supabase = createServerClient();
  const { data: courses } = await supabase
    .from("courses")
    .select("*, tees(*)")
    .order("name");

  const allCourses: (Course & { tees: Tee[] })[] = courses ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Courses</h1>
        <Link
          href="/add-course"
          className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
        >
          Add Course
        </Link>
      </div>

      {allCourses.length === 0 ? (
        <p className="text-gray-400">No courses yet.</p>
      ) : (
        <div className="space-y-4">
          {allCourses.map((course) => (
            <div
              key={course.id}
              className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800"
            >
              <div className="flex items-center gap-2">
                <span className="font-semibold">{course.name}</span>
                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                  {course.holes}H
                </span>
              </div>
              {(course.city || course.state) && (
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {[course.city, course.state].filter(Boolean).join(", ")}
                </div>
              )}
              <TeeTable tees={course.tees} courseHoles={course.holes} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
