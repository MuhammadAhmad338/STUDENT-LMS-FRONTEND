"use client"
import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/app/lib/hooks";
import { fetchCourses } from "@/app/lib/Slices/courses/courseSlice";
import { fetchStudents } from "@/app/lib/Slices/students/studentSlice";
import { fetchStudentEnrollments } from "@/app/lib/Slices/enrollments/enrollmentSlice";
import { logout } from "@/app/lib/Slices/auth/authSlice";

const sidebarItems = [
  { label: "Overview", href: "/dashboard" },
  { label: "Courses", href: "/courses" },
  { label: "Students", href: "/students" },
  { label: "Reports", href: "/reports" },
  { label: "Settings", href: "/settings" },
];

export default function ReportsPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { items: courses, status: coursesStatus } = useAppSelector((state) => state.courses);
  const { items: students, status: studentsStatus } = useAppSelector((state) => state.students);
  const { enrolledCourseIds, fetchStatus: enrollStatus } = useAppSelector((state) => state.enrollments);

  useEffect(() => {
    dispatch(fetchCourses());
    dispatch(fetchStudents());
    if (user?.id) {
      dispatch(fetchStudentEnrollments(user.id));
    }
  }, [dispatch, user?.id]);

  const handleLogout = () => {
    dispatch(logout());
    router.replace("/");
  };

  // Calculations for Reports
  const totalCourses = courses.length;
  const totalStudents = students.length;
  
  // Calculate average course credits
  const totalCredits = courses.reduce((acc, c) => acc + (c.credits ?? 0), 0);
  const avgCredits = totalCourses > 0 ? (totalCredits / totalCourses).toFixed(1) : "0.0";

  // Group courses by Category
  const categoryCounts: Record<string, number> = {};
  courses.forEach((c) => {
    const cat = c.category ?? "General";
    categoryCounts[cat] = (categoryCounts[cat] ?? 0) + 1;
  });

  // Group students by Department
  const departmentCounts: Record<string, number> = {};
  students.forEach((s) => {
    const dept = s.department ?? s.dept ?? "CS";
    departmentCounts[dept] = (departmentCounts[dept] ?? 0) + 1;
  });

  const isLoading = coursesStatus === "loading" || studentsStatus === "loading";

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
                className={`flex w-full items-center rounded-xl px-4 py-3 text-left transition ${item.label === "Reports"
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
                <p className="text-xs uppercase tracking-[0.35em] text-cyan-700 font-bold">Reports</p>
                <h1 className="mt-1 text-2xl font-semibold md:text-3xl">System Analytics</h1>
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
            {isLoading ? (
              <div className="flex flex-1 items-center justify-center">
                <div className="text-center">
                  <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-cyan-600" />
                  <p className="mt-4 text-sm text-slate-600">Generating analytical reports…</p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* KPI Summaries */}
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                  {[
                    { label: "Active Courses", value: totalCourses, note: "Catalog availability", color: "border-cyan-200 bg-cyan-50/40 text-cyan-900" },
                    { label: "Enrolled Students", value: totalStudents, note: "Student accounts", color: "border-indigo-200 bg-indigo-50/40 text-indigo-900" },
                    { label: "Your Enrollments", value: enrolledCourseIds.length, note: "Personal active modules", color: "border-emerald-200 bg-emerald-50/40 text-emerald-900" },
                    { label: "Average Credits", value: avgCredits, note: "System study value", color: "border-amber-200 bg-amber-50/40 text-amber-900" },
                  ].map((kpi) => (
                    <div key={kpi.label} className={`rounded-3xl border p-6 shadow-sm ${kpi.color}`}>
                      <p className="text-xs uppercase tracking-wider font-semibold opacity-75">{kpi.label}</p>
                      <p className="mt-3 text-4xl font-semibold tracking-tight">{kpi.value}</p>
                      <p className="mt-2 text-xs font-medium opacity-80">{kpi.note}</p>
                    </div>
                  ))}
                </div>

                {/* Analytical breakdowns */}
                <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
                  {/* Category Breakdown list */}
                  <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200">
                    <h2 className="text-xl font-semibold text-slate-900">Courses by Category</h2>
                    <p className="mt-1 text-sm text-slate-500">Distribution of educational catalog courses</p>
                    
                    <div className="mt-6 space-y-4">
                      {Object.keys(categoryCounts).length === 0 ? (
                        <p className="text-sm text-slate-500">No courses category records found.</p>
                      ) : (
                        Object.entries(categoryCounts).map(([cat, count]) => {
                          const percentage = totalCourses > 0 ? (count / totalCourses) * 100 : 0;
                          return (
                            <div key={cat} className="space-y-1.5">
                              <div className="flex items-center justify-between text-sm">
                                <span className="font-semibold text-slate-800">{cat}</span>
                                <span className="font-semibold text-slate-900">{count} course{count !== 1 ? "s" : ""} ({percentage.toFixed(0)}%)</span>
                              </div>
                              <div className="h-2.5 w-full rounded-full bg-slate-100 overflow-hidden">
                                <div
                                  className="h-full rounded-full bg-cyan-700"
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </article>

                  {/* Student Dept Breakdowns */}
                  <aside className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200">
                    <h2 className="text-xl font-semibold text-slate-900">Student Department Metrics</h2>
                    <p className="mt-1 text-sm text-slate-500">Academic concentration profile breakdown</p>

                    <div className="mt-6 space-y-4">
                      {Object.keys(departmentCounts).length === 0 ? (
                        <p className="text-sm text-slate-500">No student department records found.</p>
                      ) : (
                        Object.entries(departmentCounts).map(([dept, count]) => {
                          const percentage = totalStudents > 0 ? (count / totalStudents) * 100 : 0;
                          return (
                            <div key={dept} className="flex items-center justify-between rounded-2xl bg-slate-50 p-4 border border-slate-100">
                              <div>
                                <p className="text-sm font-semibold text-slate-900">{dept} Department</p>
                                <p className="text-xs text-slate-500 mt-0.5">{count} registered student{count !== 1 ? "s" : ""}</p>
                              </div>
                              <div className="text-right">
                                <span className="rounded-full bg-cyan-50 px-3 py-1 text-xs font-bold text-cyan-800 border border-cyan-100">
                                  {percentage.toFixed(0)}%
                                </span>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </aside>
                </div>

                {/* Database Courses list summary table */}
                <article className="rounded-3xl border border-slate-200 bg-white shadow-sm shadow-slate-200 overflow-hidden">
                  <div className="p-6 border-b border-slate-200">
                    <h2 className="text-xl font-semibold text-slate-900">Course Index Analytics</h2>
                    <p className="mt-1 text-sm text-slate-500">Summary overview of credits, durations, and instruction metrics</p>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-sm">
                      <thead>
                        <tr className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 text-xs uppercase tracking-wider">
                          <th className="px-6 py-3.5">Course Title</th>
                          <th className="px-6 py-3.5">Instructor</th>
                          <th className="px-6 py-3.5">Duration</th>
                          <th className="px-6 py-3.5">Credits Value</th>
                          <th className="px-6 py-3.5">Category</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {courses.map((course, idx) => (
                          <tr key={course.id ?? idx} className="hover:bg-slate-50/50 transition">
                            <td className="px-6 py-4 font-semibold text-slate-900">{course.title ?? course.name ?? "—"}</td>
                            <td className="px-6 py-4 text-slate-600">{course.instructor ?? course.teacher ?? "—"}</td>
                            <td className="px-6 py-4 text-slate-600">{course.duration ?? "—"}</td>
                            <td className="px-6 py-4 text-slate-900 font-bold">{course.credits ?? "—"}</td>
                            <td className="px-6 py-4">
                              <span className="rounded-lg bg-cyan-50 border border-cyan-100 px-2 py-0.5 text-xs font-semibold text-cyan-800">
                                {course.category ?? "General"}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </article>
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
