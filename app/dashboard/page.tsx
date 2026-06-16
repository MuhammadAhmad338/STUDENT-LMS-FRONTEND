"use client";

import { useRouter } from "next/navigation";
import { logout } from "@/app/lib/features/auth/authSlice";
import { useAppDispatch, useAppSelector } from "@/app/lib/hooks";

export default function DashboardPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    router.replace("/");
  };

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="flex min-h-screen">
        <aside className="hidden w-72 flex-col border-r border-slate-800 bg-slate-900/95 p-6 lg:flex">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-cyan-300">DotNet LMS</p>
            <h2 className="mt-3 text-xl font-semibold">Admin Panel</h2>
            <p className="mt-2 text-sm text-slate-300">Manage students, courses, and reports from one place.</p>
          </div>

          <nav className="mt-8 space-y-2 text-sm text-slate-200">
            {['Overview', 'Courses', 'Students', 'Reports', 'Settings'].map((item) => (
              <button
                key={item}
                type="button"
                className="flex w-full items-center rounded-xl bg-white/5 px-4 py-3 text-left transition hover:bg-white/10"
              >
                {item}
              </button>
            ))}
          </nav>

          <div className="mt-auto rounded-2xl border border-cyan-400/20 bg-cyan-400/10 p-4 text-sm text-cyan-100">
            <p className="font-semibold">Current role</p>
            <p className="mt-1 text-cyan-50">{user?.role ?? "Student"}</p>
          </div>
        </aside>

        <section className="flex flex-1 flex-col">
          <header className="border-b border-slate-800 bg-slate-900/90 px-6 py-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-cyan-300">Dashboard</p>
                <h1 className="mt-1 text-2xl font-semibold md:text-3xl">Welcome back, {user?.email ?? "Student"}</h1>
              </div>

              <button
                type="button"
                onClick={handleLogout}
                className="rounded-xl bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/20"
              >
                Log out
              </button>
            </div>
          </header>

          <div className="flex flex-1 flex-col p-6">
            <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
              <article className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-2xl shadow-black/30">
                <h2 className="text-xl font-semibold">Main content</h2>
                <p className="mt-2 text-slate-300">This is the primary workspace for courses, activity, and key metrics.</p>

                <div className="mt-6 grid gap-4 md:grid-cols-3">
                  {[
                    ['Active Courses', '12'],
                    ['New Enrollments', '24'],
                    ['Completion Rate', '86%'],
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-2xl border border-slate-800 bg-slate-800/80 p-4">
                      <p className="text-sm text-slate-300">{label}</p>
                      <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
                    </div>
                  ))}
                </div>
              </article>

              <aside className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-2xl shadow-black/30">
                <h2 className="text-xl font-semibold">Quick notes</h2>
                <ul className="mt-4 space-y-3 text-sm text-slate-300">
                  <li className="rounded-2xl bg-white/5 p-4">Review pending assignments for the current week.</li>
                  <li className="rounded-2xl bg-white/5 p-4">Share the latest course progress report with instructors.</li>
                  <li className="rounded-2xl bg-white/5 p-4">Update enrollment statuses before Friday.</li>
                </ul>
              </aside>
            </div>
          </div>

          <footer className="border-t border-slate-800 bg-slate-900/90 px-6 py-4 text-sm text-slate-300">
            © 2026 DotNet LMS. Built for admin and student dashboards.
          </footer>
        </section>
      </div>
    </main>
  );
}
