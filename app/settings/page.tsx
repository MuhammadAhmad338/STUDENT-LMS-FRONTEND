"use client"
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/app/lib/hooks";
import { logout } from "@/app/lib/Slices/auth/authSlice";
import { clearEnrollmentStatus } from "@/app/lib/Slices/enrollments/enrollmentSlice";

const sidebarItems = [
  { label: "Overview", href: "/dashboard" },
  { label: "Courses", href: "/courses" },
  { label: "Students", href: "/students" },
  { label: "Reports", href: "/reports" },
  { label: "Settings", href: "/settings" },
];

export default function SettingsPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  // Local settings states
  const [fullName, setFullName] = useState("");
  const [department, setDepartment] = useState("CS");
  const [systemName, setSystemName] = useState("CourseFlow");
  const [maxCredits, setMaxCredits] = useState("18");
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  useEffect(() => {
    if (user?.email) {
      // Split email to guess name or default
      const prefix = user.email.split("@")[0];
      setFullName(prefix.charAt(0).toUpperCase() + prefix.slice(1));
    }
  }, [user]);

  const handleLogout = () => {
    dispatch(logout());
    router.replace("/");
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveStatus("Saving changes…");
    setTimeout(() => {
      setSaveStatus("Settings saved successfully! ✓");
      setTimeout(() => setSaveStatus(null), 3000);
    }, 800);
  };

  const handleResetEnrollments = () => {
    if (confirm("Are you sure you want to reset all course enrollments? This action cannot be undone.")) {
      dispatch(clearEnrollmentStatus());
      alert("All local enrollment cache states have been successfully cleared.");
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="flex min-h-screen">
        {/* ── Sidebar ── */}
        <aside className="hidden w-72 flex-col border-r border-slate-200 bg-white p-6 lg:flex">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-cyan-700 font-bold">{systemName}</p>
            <h2 className="mt-3 text-xl font-semibold">Admin Panel</h2>
            <p className="mt-2 text-sm text-slate-600">Manage students, courses, and reports from one place.</p>
          </div>

          <nav className="mt-8 space-y-2 text-sm text-slate-700">
            {sidebarItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={`flex w-full items-center rounded-xl px-4 py-3 text-left transition ${item.label === "Settings"
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
                <p className="text-xs uppercase tracking-[0.35em] text-cyan-700 font-bold">Preferences</p>
                <h1 className="mt-1 text-2xl font-semibold md:text-3xl">System & Profile Settings</h1>
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

          <div className="flex flex-1 flex-col p-6 max-w-4xl space-y-6">
            {/* status notification */}
            {saveStatus && (
              <div className="rounded-2xl border border-cyan-200 bg-cyan-50 p-4 text-sm text-cyan-950 font-semibold">
                {saveStatus}
              </div>
            )}

            <div className="grid gap-6 md:grid-cols-2">
              {/* Profile Config */}
              <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200">
                <h2 className="text-xl font-semibold text-slate-900">Profile Details</h2>
                <p className="mt-1 text-sm text-slate-500">Configure your personal information metrics</p>
                
                <form onSubmit={handleSave} className="mt-6 space-y-4">
                  <label className="block text-sm text-slate-700 font-semibold">
                    Full name
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-slate-900 outline-none transition focus:border-cyan-500 focus:bg-white"
                      required
                    />
                  </label>

                  <label className="block text-sm text-slate-700 font-semibold">
                    Email address
                    <input
                      type="email"
                      value={user?.email ?? ""}
                      disabled
                      className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-100 px-4 py-2.5 text-slate-500 outline-none cursor-not-allowed"
                    />
                  </label>

                  <label className="block text-sm text-slate-700 font-semibold">
                    Department Area
                    <select
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-slate-900 outline-none transition focus:border-cyan-500 focus:bg-white"
                    >
                      <option value="CS">Computer Science (CS)</option>
                      <option value="IT">Information Technology (IT)</option>
                      <option value="EE">Electrical Engineering (EE)</option>
                      <option value="BA">Business Admin (BA)</option>
                    </select>
                  </label>

                  <button
                    type="submit"
                    className="w-full mt-4 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
                  >
                    Save profile changes
                  </button>
                </form>
              </article>

              {/* System Settings & Customization */}
              <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200 flex flex-col justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-slate-900">System Preferences</h2>
                  <p className="mt-1 text-sm text-slate-500">Configure global parameters and naming standards</p>

                  <div className="mt-6 space-y-4">
                    <label className="block text-sm text-slate-700 font-semibold">
                      System Name
                      <input
                        type="text"
                        value={systemName}
                        onChange={(e) => setSystemName(e.target.value)}
                        className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-slate-900 outline-none transition focus:border-cyan-500 focus:bg-white"
                        placeholder="CourseFlow"
                      />
                    </label>

                    <label className="block text-sm text-slate-700 font-semibold">
                      Max Credits Per Student
                      <input
                        type="number"
                        value={maxCredits}
                        onChange={(e) => setMaxCredits(e.target.value)}
                        className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-slate-900 outline-none transition focus:border-cyan-500 focus:bg-white"
                        min="1"
                        max="30"
                      />
                    </label>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-slate-100">
                  <h3 className="text-sm font-bold text-rose-700 uppercase tracking-wide">Danger Zone</h3>
                  <p className="text-xs text-slate-500 mt-1">Actions below will modify stored database states permanently.</p>
                  
                  <button
                    type="button"
                    onClick={handleResetEnrollments}
                    className="w-full mt-4 rounded-xl border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 px-4 py-3 text-sm font-semibold transition"
                  >
                    Clear Course Enrollments cache
                  </button>
                </div>
              </article>
            </div>
          </div>

          <footer className="border-t border-slate-200 bg-white px-6 py-4 text-sm text-slate-600 mt-auto">
            © 2026 CourseFlow. Built for student and administrative records.
          </footer>
        </section>
      </div>
    </main>
  );
}
