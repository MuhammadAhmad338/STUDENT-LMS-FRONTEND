"use client"
import Link from "next/link";
import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/app/lib/hooks";
import { fetchCourses } from "@/app/lib/Slices/courses/courseSlice";
import { enrollInCourse, fetchStudentEnrollments } from "@/app/lib/Slices/enrollments/enrollmentSlice";

export default function CoursesPage() {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { items: courses, status, error } = useAppSelector((state) => state.courses);
  const {
    status: enrollmentStatus,
    fetchStatus: enrollmentFetchStatus,
    error: enrollmentError,
    lastEnrollment,
    enrolledCourseIds,
  } = useAppSelector((state) => state.enrollments);
  const [statusMessage, setStatusMessage] = useState("Choose a course and click Enroll now to start the student enrollment flow.");

  const studentId = user?.id;

  useEffect(() => {
    dispatch(fetchCourses());
  }, [dispatch]);

  useEffect(() => {
    if (!studentId) return;
    dispatch(fetchStudentEnrollments(studentId));
  }, [dispatch, studentId]);

  const handleEnroll = (courseId?: number) => {
    if (!courseId) return;

    if (!studentId) {
      setStatusMessage("Please sign in before enrolling in a course.");
      return;
    }

    dispatch(enrollInCourse({ courseId, studentId }))
      .unwrap()
      .then(() => {
        setStatusMessage("Enrollment request sent.");
      })
      .catch(() => {
        setStatusMessage("Enrollment could not be completed. Please try again.");
      });
  };

  return (
    <main className="min-h-screen bg-white text-slate-900">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-6 py-10">
        <header className="flex flex-col gap-4 border-b border-slate-200 pb-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-cyan-700">Courses</p>
            <h1 className="mt-2 text-3xl font-semibold md:text-4xl">Live course catalog</h1>
          </div>
          <Link href="/dashboard" className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700">Back to dashboard</Link>
        </header>

        <section className="mt-8 space-y-6">
          <div className="rounded-3xl border border-cyan-200 bg-cyan-50 p-5 text-sm text-cyan-950">
            <p className="text-xs uppercase tracking-[0.35em] text-cyan-700">How to enroll</p>
            <p className="mt-2 font-semibold">Open a course, click Enroll now, and the dashboard will show the enrollment status for that student.</p>
            <p className="mt-1 text-cyan-900">{statusMessage}</p>
            {enrollmentFetchStatus === "loading" && <p className="mt-2 text-cyan-800">Loading your enrollments…</p>}
            {enrollmentStatus === "loading" && <p className="mt-2 text-cyan-800">Submitting enrollment request…</p>}
            {enrollmentError && <p className="mt-2 text-rose-700">{enrollmentError}</p>}
            {lastEnrollment?.message && <p className="mt-2 text-emerald-800">{lastEnrollment.message}</p>}
          </div>

          {status === "loading" ? (
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-8 text-slate-700">Loading courses…</div>
          ) : error ? (
            <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-rose-700">{error}</div>
          ) : courses.length === 0 ? (
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-8 text-slate-700">No courses were returned by the API.</div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {courses.map((course, index) => {
                const courseId = course.id ?? course.courseId ?? 0;
                const title = course.title ?? course.name ?? course.courseName ?? `Course ${course.id ?? index + 1}`;
                const instructor = course.instructor ?? course.teacher ?? "TBA";
                const description = course.description ?? "No description available yet.";
                const isEnrolled = enrolledCourseIds.includes(courseId);

                return (
                  <article key={course.id ?? `${title}-${index}`} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200">
                    <p className="text-xs uppercase tracking-[0.35em] text-cyan-700">{course.category ?? "Course"}</p>
                    <h2 className="mt-3 text-xl font-semibold text-slate-900">{title}</h2>
                    <p className="mt-3 text-sm text-slate-600">{description}</p>
                    <dl className="mt-5 space-y-2 text-sm text-slate-700">
                      <div className="flex items-center justify-between gap-3"><dt>Instructor</dt><dd className="text-right text-slate-900">{instructor}</dd></div>
                      <div className="flex items-center justify-between gap-3"><dt>Duration</dt><dd className="text-right text-slate-900">{course.duration ?? "—"}</dd></div>
                      <div className="flex items-center justify-between gap-3"><dt>Credits</dt><dd className="text-right text-slate-900">{course.credits ?? "—"}</dd></div>
                    </dl>
                    <button
                      type="button"
                      onClick={() => handleEnroll(courseId || undefined)}
                      disabled={isEnrolled || enrollmentStatus === "loading"}
                      className="mt-6 w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-400"
                    >
                      {isEnrolled ? "Enrolled" : "Enroll now"}
                    </button>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
