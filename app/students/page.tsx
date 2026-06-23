"use client"
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/app/lib/hooks";
import { fetchStudents } from "@/app/lib/Slices/students/studentSlice";
import { logout } from "@/app/lib/Slices/auth/authSlice";

const sidebarItems = [
  { label: "Overview", href: "/dashboard" },
  { label: "Courses", href: "/courses" },
  { label: "Students", href: "/students" },
  { label: "Reports", href: "/reports" },
  { label: "Settings", href: "/settings" },
];

export default function StudentsPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { items: students, status, error } = useAppSelector((state) => state.students);
  const [search, setSearch] = useState("");

  useEffect(() => {
    dispatch(fetchStudents());
  }, [dispatch]);

  const handleLogout = () => {
    dispatch(logout());
    router.replace("/");
  };

  const filteredStudents = students.filter((s) => {
    const name = (s.fullName ?? s.name ?? "").toLowerCase();
    const email = (s.email ?? "").toLowerCase();
    const dept = (s.department ?? "").toLowerCase();
    const q = search.toLowerCase();
    return name.includes(q) || email.includes(q) || dept.includes(q);
  });

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
                className={`flex w-full items-center rounded-xl px-4 py-3 text-left transition ${item.label === "Students"
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
                <p className="text-xs uppercase tracking-[0.35em] text-cyan-700">Students</p>
                <h1 className="mt-1 text-2xl font-semibold md:text-3xl">Student Directory</h1>
              </div>

              <div className="flex items-center gap-3">
                <Link href="/dashboard" className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700">Dashboard</Link>
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
            {/* Search bar */}
            <div className="mb-6">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, email, or department…"
                className="w-full max-w-md rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
              />
            </div>

            {/* Student count badge */}
            <div className="mb-6 flex items-center gap-3">
              <span className="rounded-full bg-cyan-50 border border-cyan-200 px-3 py-1 text-xs font-semibold text-cyan-800">
                {status === "loading" ? "Loading…" : `${filteredStudents.length} student${filteredStudents.length !== 1 ? "s" : ""}`}
              </span>
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="text-xs font-semibold text-slate-500 hover:text-slate-700"
                >
                  Clear search
                </button>
              )}
            </div>

            {/* Content */}
            {status === "loading" ? (
              <div className="flex flex-1 items-center justify-center">
                <div className="text-center">
                  <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-cyan-600" />
                  <p className="mt-4 text-sm text-slate-600">Loading students…</p>
                </div>
              </div>
            ) : error ? (
              <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">{error}</div>
            ) : filteredStudents.length === 0 ? (
              <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center text-slate-600">
                <p className="text-lg font-semibold text-slate-900">No students found</p>
                <p className="mt-2 text-sm">
                  {search
                    ? `No results matching "${search}". Try a different search.`
                    : "No students were returned by the API."}
                </p>
              </div>
            ) : (
              <div className="rounded-3xl border border-slate-200 bg-white shadow-sm shadow-slate-200 overflow-hidden">
                {/* Table header */}
                <div className="grid grid-cols-[1fr_1.2fr_0.8fr_0.6fr] gap-4 border-b border-slate-200 bg-slate-50 px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  <span>Name</span>
                  <span>Email</span>
                  <span>Department</span>
                  <span>Role</span>
                </div>

                {/* Table rows */}
                <div className="divide-y divide-slate-100">
                  {filteredStudents.map((student, index) => {
                    const id = student.id ?? student.studentId ?? index;
                    const name = student.fullName ?? student.name ?? "—";
                    const email = student.email ?? "—";
                    const dept = student.department ?? "—";
                    const role = student.role ?? "Student";

                    return (
                      <div
                        key={id}
                        className="grid grid-cols-[1fr_1.2fr_0.8fr_0.6fr] gap-4 px-6 py-4 text-sm transition hover:bg-slate-50"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-cyan-100 text-xs font-semibold text-cyan-700">
                            {name.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-medium text-slate-900">{name}</span>
                        </div>
                        <span className="flex items-center text-slate-600">{email}</span>
                        <span className="flex items-center text-slate-600">{dept}</span>
                        <span className="flex items-center">
                          <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700">
                            {role}
                          </span>
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <footer className="border-t border-slate-200 bg-white px-6 py-4 text-sm text-slate-600">
            © 2026 CourseFlow. Built for admin and student dashboards.
          </footer>
        </section>
      </div>
    </main>
  );
}
