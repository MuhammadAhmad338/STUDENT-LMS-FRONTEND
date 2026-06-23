"use client"
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/app/lib/hooks";
import { fetchCourses } from "@/app/lib/Slices/courses/courseSlice";
import { enrollInCourse, fetchStudentEnrollments } from "@/app/lib/Slices/enrollments/enrollmentSlice";
import { logout } from "@/app/lib/Slices/auth/authSlice";

const sidebarItems = [
  { label: "Overview", href: "/dashboard" },
  { label: "Courses", href: "/courses" },
  { label: "Students", href: "/students" },
  { label: "Reports", href: "/reports" },
  { label: "Settings", href: "/settings" },
];

export default function CoursesPage() {
  const router = useRouter();
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
  const [statusMessage, setStatusMessage] = useState("Choose a course and click View details to enroll and view information.");

  const studentId = user?.id;

  useEffect(() => {
    dispatch(fetchCourses());
  }, [dispatch]);

  useEffect(() => {
    if (!studentId) return;
    dispatch(fetchStudentEnrollments(studentId));
  }, [dispatch, studentId]);

  const handleLogout = () => {
    dispatch(logout());
    router.replace("/");
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="flex min-h-screen">
        {/* ── Sidebar ── */}
        <aside className="hidden w-72 flex-col border-r border-slate-200 bg-white p-6 lg:flex">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-cyan-700 font-bold">CourseFlow</p>
            <h2 className="mt-3 text-xl font-semibold">Admin Panel</h2>
            <p className="mt-2 text-sm text-slate-600">Manage students, courses, and reports from one place.</p>
          </div>

          <nav className="mt-8 space-y-2 text-sm text-slate-700">
            {sidebarItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={`flex w-full items-center rounded-xl px-4 py-3 text-left transition ${item.label === "Courses"
                  ? "bg-cyan-50 text-cyan-900 font-semibold border border-cyan-200"
                  : "bg-slate-100 hover:bg-slate-200"
                  }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="mt-auto rounded-2xl border border-cyan-200 bg-cyan-50 p-4 text-sm text-cyan-900">
            <p className="font-semibold">Current role</p>
            <p className="mt-1 text-cyan-800">{user?.role ?? "Student"}</p>
          </div>
        </aside>

        {/* ── Main content ── */}
        <section className="flex flex-1 flex-col">
          <header className="border-b border-slate-200 bg-white px-6 py-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-cyan-700 font-bold">Courses</p>
                <h1 className="mt-1 text-2xl font-semibold md:text-3xl">Live course catalog</h1>
              </div>

              <div className="flex items-center gap-3">
                <Link href="/dashboard" className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-200">Dashboard</Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-200"
                >
                  Log out
                </button>
              </div>
            </div>
          </header>

          <div className="flex flex-1 flex-col p-6">
            <div className="mb-6 rounded-3xl border border-cyan-200 bg-cyan-50 p-5 text-sm text-cyan-950">
              <p className="text-xs uppercase tracking-[0.35em] text-cyan-700 font-bold">How to enroll</p>
              <p className="mt-2 font-semibold font-medium">Open a course, click View details, and enroll to start your learning flow.</p>
              <p className="mt-1 text-cyan-900">{statusMessage}</p>
              {enrollmentFetchStatus === "loading" && <p className="mt-2 text-cyan-850">Loading your enrollments…</p>}
              {enrollmentError && <p className="mt-2 text-rose-700 font-medium">{enrollmentError}</p>}
            </div>

            {status === "loading" ? (
              <div className="flex flex-1 items-center justify-center">
                <div className="text-center">
                  <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-cyan-600" />
                  <p className="mt-4 text-sm text-slate-600">Loading courses catalog…</p>
                </div>
              </div>
            ) : error ? (
              <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-rose-700">{error}</div>
            ) : courses.length === 0 ? (
              <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center text-slate-600">No courses available.</div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {courses.map((course, index) => {
                  const courseId = course.id ?? course.courseId ?? 0;
                  const title = course.title ?? course.name ?? course.courseName ?? `Course ${course.id ?? index + 1}`;
                  const instructor = course.instructor ?? course.teacher ?? "TBA";
                  const description = course.description ?? "No description available yet.";
                  const isEnrolled = enrolledCourseIds.includes(courseId);

                  return (
                    <article key={course.id ?? `${title}-${index}`} className="flex flex-col justify-between rounded-3xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200">
                      <div>
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-xs uppercase tracking-[0.35em] text-cyan-700 font-bold">{course.category ?? "Course"}</p>
                          {isEnrolled && (
                            <span className="rounded-lg bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-800 border border-emerald-100">
                              Enrolled
                            </span>
                          )}
                        </div>
                        <h2 className="mt-3 text-xl font-semibold text-slate-900">{title}</h2>
                        <p className="mt-3 text-sm text-slate-600 line-clamp-3">{description}</p>
                        <dl className="mt-5 space-y-2 text-sm text-slate-700">
                          <div className="flex items-center justify-between gap-3"><dt>Instructor</dt><dd className="text-right text-slate-900 font-semibold">{instructor}</dd></div>
                          <div className="flex items-center justify-between gap-3"><dt>Duration</dt><dd className="text-right text-slate-900 font-semibold">{course.duration ?? "—"}</dd></div>
                          <div className="flex items-center justify-between gap-3"><dt>Credits</dt><dd className="text-right text-slate-900 font-semibold">{course.credits ?? "—"}</dd></div>
                        </dl>
                      </div>
                      <div className="mt-6">
                        <Link
                          href={`/courses/${courseId}`}
                          className="block w-full rounded-xl bg-slate-900 px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-slate-700"
                        >
                          View details
                        </Link>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>

          <footer className="border-t border-slate-200 bg-white px-6 py-4 text-sm text-slate-600">
            © 2026 CourseFlow. Built for student and administrative records.
          </footer>
        </section>
      </div>
    </main>
  );
}
