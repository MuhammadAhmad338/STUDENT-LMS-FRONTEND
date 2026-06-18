"use client"
import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { logout } from "@/app/lib/features/auth/authSlice";
import { useAppDispatch, useAppSelector } from "@/app/lib/hooks";
import { fetchCourses } from "@/app/lib/features/courses/courseSlice";

export default function DashboardPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { items: courses, status: coursesStatus, error: coursesError } = useAppSelector((state) => state.courses);

  const handleLogout = () => {
    dispatch(logout());
    router.replace("/");
  };

  useEffect(() => {
    dispatch(fetchCourses());
  }, [dispatch]);

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="flex min-h-screen">
        <aside className="hidden w-72 flex-col border-r border-slate-200 bg-white p-6 lg:flex">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-cyan-700">LMS</p>
            <h2 className="mt-3 text-xl font-semibold">Admin Panel</h2>
            <p className="mt-2 text-sm text-slate-600">Manage students, courses, and reports from one place.</p>
          </div>

          <nav className="mt-8 space-y-2 text-sm text-slate-700">
            {['Overview', 'Courses', 'Students', 'Reports', 'Settings'].map((item) => (
              <button
                key={item}
                type="button"
                className="flex w-full items-center rounded-xl bg-slate-100 px-4 py-3 text-left transition hover:bg-slate-200"
              >
                {item}
              </button>
            ))}
          </nav>

          <div className="mt-auto rounded-2xl border border-cyan-200 bg-cyan-50 p-4 text-sm text-cyan-900">
            <p className="font-semibold">Current role</p>
            <p className="mt-1 text-cyan-800">{user?.role ?? "Student"}</p>
          </div>
        </aside>

        <section className="flex flex-1 flex-col">
          <header className="border-b border-slate-200 bg-white px-6 py-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-cyan-700">Dashboard</p>
                <h1 className="mt-1 text-2xl font-semibold md:text-3xl">Welcome back, {user?.email ?? "Student"}</h1>
              </div>

              <div className="flex items-center gap-3">
                <Link href="/courses" className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700">View courses</Link>
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
            <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
              <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200">
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-semibold">Courses</h2>
                  </div>
                  <Link href="/courses" className="text-sm font-semibold text-cyan-700 hover:text-cyan-800">Open full catalog</Link>
                </div>

                {coursesStatus === "loading" ? (
                  <p className="mt-4 text-sm text-slate-600">Loading courses…</p>
                ) : coursesError ? (
                  <p className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{coursesError}</p>
                ) : (
                  <div className="mt-6 space-y-3">
                    {courses.slice(0, 4).map((course, index) => (
                      <div key={course.id ?? `${course.title ?? "course"}-${index}`} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                        <p className="text-sm font-semibold text-slate-900">{course.title ?? course.name ?? course.courseName ?? `Course ${index + 1}`}</p>
                        <p className="mt-1 text-sm text-slate-600">{course.description ?? "No description available yet."}</p>
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-6 grid gap-4 md:grid-cols-3">
                  {[
                    ['Active Courses', '12'],
                    ['New Enrollments', '24'],
                    ['Completion Rate', '86%'],
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <p className="text-sm text-slate-600">{label}</p>
                      <p className="mt-2 text-2xl font-semibold text-slate-900">{value}</p>
                    </div>
                  ))}
                </div>
              </article>

              <aside className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200">
                <h2 className="text-xl font-semibold">How to enroll a student</h2>
                <ol className="mt-4 space-y-3 text-sm text-slate-600">
                  <li className="rounded-2xl bg-slate-50 p-4">Open the course catalog from the dashboard.</li>
                  <li className="rounded-2xl bg-slate-50 p-4">Click “Enroll now” on the course card you want the student to join.</li>
                  <li className="rounded-2xl bg-slate-50 p-4">Confirm the enrollment status in the dashboard and continue with the student record.</li>
                </ol>
                <Link href="/courses" className="mt-5 inline-flex rounded-xl bg-cyan-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-cyan-800">Go to courses</Link>
              </aside>
            </div>
          </div>

          <footer className="border-t border-slate-200 bg-white px-6 py-4 text-sm text-slate-600">
            © 2026 DotNet LMS. Built for admin and student dashboards.
          </footer>
        </section>
      </div>
    </main>
  );
}
