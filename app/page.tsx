"use client"

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/app/lib/hooks";
import { login, logout, signup } from "@/app/lib/Slices/auth/authSlice";

export default function Home() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user, isAuthenticated, status } = useAppSelector((state) => state.auth);
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <section className="mx-auto flex min-h-screen w-full max-w-6xl flex-col items-center justify-center px-6 py-16 lg:flex-row lg:gap-16">
        <div className="max-w-xl space-y-6 text-center lg:text-left">
          <p className="text-sm uppercase tracking-[0.35em] text-cyan-700">LMS</p>
          <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">A simple LMS frontend with clean auth and course workflows.</h1>
          <p className="text-lg text-slate-600">Use this as the starting point for student, instructor, and admin flows. The auth state is stored in Redux and connected to your ASP.NET backend.</p>
        </div>

        <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200">
          <h2 className="text-2xl font-semibold">Welcome</h2>
          <p className="mt-2 text-sm text-slate-600">Choose login or signup, then continue to your dashboard.</p>

          {!isAuthenticated ? (
            <div className="mt-6 space-y-4">
              <div className="grid grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1">
                <button
                  type="button"
                  onClick={() => setMode("login")}
                  className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${mode === "login" ? "bg-slate-900 text-white" : "text-slate-700 hover:bg-slate-200"}`}
                >
                  Login
                </button>
                <button
                  type="button"
                  onClick={() => setMode("signup")}
                  className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${mode === "signup" ? "bg-slate-900 text-white" : "text-slate-700 hover:bg-slate-200"}`}
                >
                  Signup
                </button>
              </div>

              {mode === "signup" && (
                <label className="block text-sm text-slate-700">
                  Full name
                  <input
                    type="text"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-cyan-500 focus:bg-white"
                    placeholder="Aisha Khan"
                  />
                </label>
              )}

              <label className="block text-sm text-slate-700">
                Email
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-cyan-500 focus:bg-white"
                  placeholder="student@dotnetlms.dev"
                />
              </label>

              <label className="block text-sm text-slate-700">
                Password
                <div className="mt-1 flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 transition focus-within:border-cyan-500 focus-within:bg-white">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="w-full bg-transparent text-slate-900 outline-none"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="text-xs font-semibold text-cyan-700 hover:text-cyan-800"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </label>

              <label className="block text-sm text-slate-700">
                Role
                <select
                  value={role}
                  onChange={(event) => setRole(event.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-cyan-500 focus:bg-white"
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
                className="w-full rounded-xl bg-slate-900 px-4 py-3 font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-400"
              >
                {status === "loading" ? (
                  <span className="inline-flex items-center justify-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
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
            <div className="mt-6 space-y-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
              <p className="text-base font-semibold">Welcome back, {user?.email}</p>
              <p>Role: {user?.role}</p>
              <button
                type="button"
                onClick={() => dispatch(logout())}
                className="w-full rounded-xl bg-slate-900 px-4 py-3 font-semibold text-white transition hover:bg-slate-700"
              >
                Log out
              </button>
            </div>
          )}

          <p className="mt-4 text-xs text-slate-500">Next step: replace the mock login with your ASP.NET Identity / JWT endpoint.</p>
        </div>
      </section>
    </main>
  );
}
