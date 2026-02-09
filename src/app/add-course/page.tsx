"use client";

import { useAuth } from "@/components/AuthProvider";
import CourseForm from "@/components/CourseForm";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AddCoursePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return <p className="text-gray-400">Loading...</p>;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <h1 className="text-2xl font-bold">Add Course</h1>
      <CourseForm />
    </div>
  );
}
