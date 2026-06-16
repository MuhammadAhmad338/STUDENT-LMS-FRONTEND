"use client"

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/app/lib/hooks";
import { login, logout, signup } from "@/app/lib/features/auth/authSlice";

export default function Home() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user, isAuthenticated, status } = useAppSelector((state) => state.auth);
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("fizzatanveer@example.com");
  const [password, setPassword] = useState("Password123!");
  const [role, setRole] = useState("Admin");

  const handleLogin = () => {
    if (!email.trim() || !password.trim()) return;
    dispatch(login({ email: email.trim(), password, role: role.toLowerCase() }));
  };

  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/dashboard");
    }
  }, [isAuthenticated, router]);

  const handleSignup = () => {
    if (!name.trim() || !email.trim() || !password.trim()) return;
    dispatch(
      signup({
        fullName: name.trim(),
        email: email.trim(),
        password,
        department: "CS",
        role: role.toLowerCase(),
      })
    );
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white">
      <section className="mx-auto flex min-h-screen w-full max-w-6xl flex-col items-center justify-center px-6 py-16 lg:flex-row lg:gap-16">
        <div className="max-w-xl space-y-6 text-center lg:text-left">
          <p className="text-sm uppercase tracking-[0.35em] text-cyan-300">DotNet LMS</p>
          <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">A clean LMS frontend with Redux Toolkit auth ready for your .NET API.</h1>
          <p className="text-lg text-slate-300">Use this as the starting point for student, instructor, and admin flows. The auth state is stored in Redux and can be connected to your ASP.NET backend once endpoints are ready.</p>
        </div>

        <div className="w-full max-w-md rounded-3xl border border-slate-700 bg-slate-900/90 p-6 shadow-2xl shadow-black/30">
          <h2 className="text-2xl font-semibold">Auth starter</h2>
          <p className="mt-2 text-sm text-slate-300">Choose login or signup, then connect this to your .NET auth API.</p>

          {!isAuthenticated ? (
            <div className="mt-6 space-y-4">
              <div className="grid grid-cols-2 gap-2 rounded-xl bg-slate-800 p-1">
                <button
                  type="button"
                  onClick={() => setMode("login")}
                  className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${mode === "login" ? "bg-cyan-400 text-slate-950" : "text-slate-200 hover:bg-slate-700"}`}
                >
                  Login
                </button>
                <button
                  type="button"
                  onClick={() => setMode("signup")}
                  className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${mode === "signup" ? "bg-cyan-400 text-slate-950" : "text-slate-200 hover:bg-slate-700"}`}
                >
                  Signup
                </button>
              </div>

              {mode === "signup" && (
                <label className="block text-sm text-slate-200">
                  Full name
                  <input
                    type="text"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none transition focus:border-cyan-400"
                    placeholder="Aisha Khan"
                  />
                </label>
              )}

              <label className="block text-sm text-slate-200">
                Email
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none transition focus:border-cyan-400"
                  placeholder="student@dotnetlms.dev"
                />
              </label>

              <label className="block text-sm text-slate-200">
                Password
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none transition focus:border-cyan-400"
                  placeholder="••••••••"
                />
              </label>

              <label className="block text-sm text-slate-200">
                Role
                <select
                  value={role}
                  onChange={(event) => setRole(event.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none transition focus:border-cyan-400"
                >
                  <option value="Student">Student</option>
                  <option value="Instructor">Instructor</option>
                  <option value="Admin">Admin</option>
                </select>
              </label>

              <button
                type="button"
                onClick={mode === "login" ? handleLogin : handleSignup}
                disabled={status === "loading"}
                className="w-full rounded-xl bg-cyan-400 px-4 py-3 font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:bg-cyan-200"
              >
                {status === "loading" ? (
                  <span className="inline-flex items-center justify-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-950/30 border-t-slate-950" />
                    Signing in...
                  </span>
                ) : mode === "login" ? (
                  "Sign in"
                ) : (
                  "Create account"
                )}
              </button>
            </div>
          ) : (
            <div className="mt-6 space-y-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-100">
              <p className="text-base font-semibold">Welcome back, {user?.email}</p>
              <p>Role: {user?.role}</p>
              <button
                type="button"
                onClick={() => dispatch(logout())}
                className="w-full rounded-xl bg-white/10 px-4 py-3 font-semibold text-white transition hover:bg-white/20"
              >
                Log out
              </button>
            </div>
          )}

          <p className="mt-4 text-xs text-slate-400">Next step: replace the mock login with your ASP.NET Identity / JWT endpoint.</p>
        </div>
      </section>
    </main>
  );
}
