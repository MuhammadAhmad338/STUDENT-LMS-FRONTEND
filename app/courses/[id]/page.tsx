"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/app/lib/hooks";
import { fetchCourses } from "@/app/lib/Slices/courses/courseSlice";
import { enrollInCourse, fetchStudentEnrollments } from "@/app/lib/Slices/enrollments/enrollmentSlice";

/* ─── icons (SVG paths with clean slate/cyan colors for optimal contrast) ─────────────────────── */
const ClockIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
    <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
  </svg>
);
const StarIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4 text-amber-500">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
);
const ShieldCheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-cyan-700">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <polyline points="22 11.08 12 21 9 18" />
  </svg>
);
const CheckCircleIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-cyan-700 shrink-0">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);
const GraduationIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
    <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
    <path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5" />
  </svg>
);
const BookOpenIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2zM22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
  </svg>
);
const ArrowLeftIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
    <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
  </svg>
);
const ChevronDownIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 transition-transform duration-200">
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

/* ─── curriculum generation ────────────────────────────────────────── */
interface Lesson {
  title: string;
  duration: string;
  description: string;
}

function generateFullCurriculum(title: string, description: string): Lesson[] {
  return [
    {
      title: `Welcome to ${title}`,
      duration: "45 mins",
      description: "Getting set up, establishing expectations, and reviewing structural goals for the course.",
    },
    {
      title: "Core Mechanics and Principles",
      duration: "1 hr 15 mins",
      description: "Understanding the underlying framework, industry patterns, and mental models crucial for progress.",
    },
    {
      title: "Hands-on Workshop: Building from Scratch",
      duration: "2 hrs 30 mins",
      description: "Step-by-step guidance on constructing dynamic project blueprints using modern methods.",
    },
    {
      title: "Troubleshooting and Advanced Strategies",
      duration: "1 hr 45 mins",
      description: "How to resolve typical roadblocks and structure complex scenarios gracefully under pressure.",
    },
    {
      title: "Final Assessment and Next Steps",
      duration: "1 hr",
      description: "Putting it all together, grading criteria, resources for future expansion, and credentials.",
    },
  ];
}

/* ─── main component ─────────────────────────────────────────────────── */
export default function CourseDetailPage() {
  const params = useParams();
  const rawId = params?.id;
  const courseId = rawId ? Number(rawId) : NaN;

  const dispatch = useAppDispatch();
  const { user } = useAppSelector((s) => s.auth);
  const { items: courses, status: courseStatus } = useAppSelector((s) => s.courses);
  const {
    status: enrollStatus,
    fetchStatus: enrollFetchStatus,
    enrolledCourseIds,
    lastEnrollment,
    error: enrollError,
  } = useAppSelector((s) => s.enrollments);

  const [enrollMessage, setEnrollMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"about" | "syllabus" | "instructor">("about");
  const [openLessonIndex, setOpenLessonIndex] = useState<number | null>(0);

  /* load courses if empty */
  useEffect(() => {
    if (courses.length === 0) dispatch(fetchCourses());
  }, [dispatch, courses.length]);

  /* load student enrollments */
  useEffect(() => {
    if (user?.id) dispatch(fetchStudentEnrollments(user.id));
  }, [dispatch, user?.id]);

  /* resolve course from store */
  const course = courses.find((c) => (c.id ?? c.courseId) === courseId);

  /* derived values */
  const title = course?.title ?? course?.name ?? course?.courseName ?? "Course";
  const instructor = course?.instructor ?? course?.teacher ?? "TBA";
  const description =
    course?.description ??
    "This course provides a comprehensive learning experience. Enroll now to get started on your journey.";
  const category = course?.category ?? "General";
  const duration = course?.duration ?? "Self-paced";
  const credits = course?.credits ?? "—";
  const isEnrolled = Number.isFinite(courseId) && enrolledCourseIds.includes(courseId);
  const curriculum = course ? generateFullCurriculum(title, description) : [];

  /* enrollment handler */
  const handleEnroll = () => {
    if (!user?.id) {
      setEnrollMessage("Please sign in before enrolling.");
      return;
    }
    if (!Number.isFinite(courseId)) return;

    dispatch(enrollInCourse({ courseId, studentId: user.id }))
      .unwrap()
      .then(() => setEnrollMessage("You have been enrolled! 🎉"))
      .catch(() => setEnrollMessage("Enrollment failed. Please try again."));
  };

  /* ── loading state ────────────────────────────────────────────────── */
  if (courseStatus === "loading") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <span className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-cyan-700" />
          <p className="text-slate-700 text-sm font-semibold">Loading course details…</p>
        </div>
      </main>
    );
  }

  /* ── not found ───────────────────────────────────────────────────── */
  if (!course && courses.length > 0) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-6 text-center">
        <div className="rounded-3xl border border-slate-200 bg-white p-10 shadow-sm shadow-slate-200 max-w-md">
          <p className="text-5xl">📚</p>

          <h1 className="mt-4 text-2xl font-semibold text-slate-900">
            Course not found
          </h1>

          <p className="mt-2 text-slate-600">
            The course you're looking for doesn't exist or was removed.
          </p>

          <Link
            href="/courses"
            className="mt-6 inline-block rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
          >
            Browse all courses
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      {/* ── HERO BANNER MATCHING OTHER APP SCHEME ───────────────────────── */}
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-10">
          {/* breadcrumb */}
          <Link
            href="/courses"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-100 hover:text-slate-900"
          >
            <ArrowLeftIcon />
            All courses
          </Link>

          <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_360px]">
            {/* Header info */}
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-cyan-700 font-bold">
                {category}
              </p>

              <h1 className="mt-3 text-3xl font-semibold text-slate-900 md:text-4xl">
                {title}
              </h1>

              <p className="mt-4 max-w-2xl text-base text-slate-600 leading-relaxed">
                {description}
              </p>

              {/* stats row */}
              <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-slate-600">
                <span className="flex items-center gap-1 font-semibold text-slate-900">
                  {[...Array(5)].map((_, i) => <StarIcon key={i} />)}
                  <span className="ml-1">4.8</span>
                </span>
                <span className="h-1.5 w-1.5 rounded-full bg-slate-300" />
                <span className="font-medium text-slate-700">1,240 students enrolled</span>
                <span className="h-1.5 w-1.5 rounded-full bg-slate-300" />
                <span className="flex items-center gap-1 text-slate-600">
                  <ClockIcon />
                  Updated recently
                </span>
              </div>

              {/* quick highlight stats */}
              <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Duration</p>
                  <p className="mt-1 text-base font-bold text-slate-900">{duration}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Credits</p>
                  <p className="mt-1 text-base font-bold text-slate-900">{credits}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Instructor</p>
                  <p className="mt-1 text-base font-bold text-slate-900">{instructor}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Category</p>
                  <p className="mt-1 text-base font-bold text-slate-900">{category}</p>
                </div>
              </div>
            </div>

            {/* floating enrollment sidebar card */}
            <div className="lg:sticky lg:top-8 lg:self-start">
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200">
                <div className="relative flex h-40 items-center justify-center overflow-hidden rounded-2xl bg-slate-100 border border-slate-200">
                  <span className="relative text-5xl">🎓</span>
                </div>

                <div className="mt-6 space-y-3.5 text-sm text-slate-700">
                  <div className="flex justify-between">
                    <span>Course Fee</span>
                    <span className="font-semibold text-slate-900">Included in Tuition</span>
                  </div>
                  <div className="flex justify-between border-t border-slate-200/60 pt-3">
                    <span>Credit Value</span>
                    <span className="font-semibold text-slate-900">{credits} Credits</span>
                  </div>
                  <div className="flex justify-between border-t border-slate-200/60 pt-3">
                    <span>Instructor Contact</span>
                    <span className="font-semibold text-slate-900">{instructor}</span>
                  </div>
                  <div className="flex justify-between border-t border-slate-200/60 pt-3">
                    <span>Workload</span>
                    <span className="font-semibold text-slate-900">4-6 hours / week</span>
                  </div>
                </div>

                {/* main CTA button */}
                <button
                  type="button"
                  id="enroll-btn"
                  onClick={handleEnroll}
                  disabled={isEnrolled || enrollStatus === "loading"}
                  className={`mt-6 w-full rounded-xl px-4 py-3 text-sm font-semibold transition ${isEnrolled
                    ? "cursor-default bg-emerald-50 text-emerald-900 border border-emerald-200"
                    : enrollStatus === "loading"
                      ? "cursor-wait bg-slate-100 text-slate-400"
                      : "bg-slate-900 text-white hover:bg-slate-700"
                    }`}
                >
                  {isEnrolled ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="h-4 w-4 text-emerald-700 shrink-0">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      Enrolled successfully
                    </span>
                  ) : enrollStatus === "loading" && enrollFetchStatus !== "loading" ? (
                    <span className="inline-flex items-center justify-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-slate-700" />
                      Enrolling…
                    </span>
                  ) : (
                    "Enroll now"
                  )}
                </button>

                {/* status messages matching catalog alert styles */}
                {enrollMessage && !isEnrolled && (
                  <div className="mt-4 rounded-2xl border border-cyan-200 bg-cyan-50 p-4 text-sm text-cyan-950 font-semibold text-center">
                    {enrollMessage}
                  </div>
                )}
                {enrollError && (
                  <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 font-semibold text-center">
                    {enrollError}
                  </div>
                )}
                {lastEnrollment?.message && isEnrolled && (
                  <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900 font-semibold text-center">
                    {lastEnrollment.message}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── BODY CONTENT ────────────────────────────────────────────── */}
      <div className="mx-auto max-w-7xl px-6 mt-12">
        <div className="grid gap-10 lg:grid-cols-[1fr_360px]">
          <div className="space-y-10">
            {/* Custom Interactive Tab Headers */}
            <div className="flex border-b border-slate-200 bg-white rounded-t-3xl border-t border-x border-slate-200/80">
              {[
                { id: "about", label: "Overview" },
                { id: "syllabus", label: "Curriculum Syllabus" },
                { id: "instructor", label: "Instructor Bio" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-6 py-4 text-sm font-semibold transition border-b-2 -mb-[2px] ${activeTab === tab.id
                    ? "border-cyan-700 text-cyan-900 font-bold"
                    : "border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                    }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* TAB CONTENT panels */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200">
              {/* Tab 1: About */}
              {activeTab === "about" && (
                <div className="space-y-8">
                  <section>
                    <h2 className="text-xl font-semibold text-slate-900">What you&apos;ll learn</h2>
                    <p className="mt-3 text-slate-600 leading-relaxed">
                      This course is structured to guide you through both theoretical basics and practical, hands-on implementations. Upon completion, you will be prepared for real-world setups matching common industry templates.
                    </p>
                    <div className="mt-5 grid gap-3 sm:grid-cols-2">
                      {[
                        "Solid conceptual foundation",
                        "Industry-relevant practical skills",
                        "Project-based learning outcomes",
                        "Confidence to tackle real problems",
                        "Best practices and design patterns",
                        "Official student record validation",
                      ].map((item) => (
                        <div key={item} className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
                          <CheckCircleIcon />
                          <span className="text-sm font-semibold text-slate-700">{item}</span>
                        </div>
                      ))}
                    </div>
                  </section>

                  <section className="rounded-2xl border border-cyan-200 bg-cyan-50 p-5 text-sm text-cyan-950">
                    <p className="text-xs uppercase tracking-[0.35em] text-cyan-700 font-bold">Suggested Prerequisites</p>
                    <p className="mt-2 font-semibold">General knowledge and a logical mindset will give you the best path forward. No prior advanced credentials required.</p>
                  </section>
                </div>
              )}

              {/* Tab 2: Syllabus with collapse timeline */}
              {activeTab === "syllabus" && (
                <div className="space-y-4">
                  <div>
                    <h2 className="text-xl font-semibold text-slate-900">Curriculum Breakdown</h2>
                    <p className="mt-1 text-sm text-slate-500 font-medium">Click any module header below to expand details.</p>
                  </div>

                  <div className="mt-6 space-y-3">
                    {curriculum.map((lesson, index) => {
                      const isOpen = openLessonIndex === index;
                      return (
                        <div
                          key={index}
                          className={`rounded-2xl border transition-all ${isOpen ? "border-cyan-300 bg-cyan-50/20" : "border-slate-200 bg-slate-50/50 hover:bg-slate-50"
                            }`}
                        >
                          <button
                            type="button"
                            onClick={() => setOpenLessonIndex(isOpen ? null : index)}
                            className="flex w-full items-center justify-between p-4 text-left font-semibold text-slate-800 text-sm sm:text-base"
                          >
                            <div className="flex items-center gap-3">
                              <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${isOpen ? "bg-cyan-700 text-white" : "bg-slate-200 text-slate-700"
                                }`}>
                                {index + 1}
                              </span>
                              <span>{lesson.title}</span>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-slate-500">
                              <span>{lesson.duration}</span>
                              <span className={isOpen ? "rotate-180" : ""}>
                                <ChevronDownIcon />
                              </span>
                            </div>
                          </button>

                          {isOpen && (
                            <div className="px-4 pb-4 pt-1 text-sm text-slate-600 leading-relaxed border-t border-slate-200/50">
                              <p>{lesson.description}</p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Tab 3: Instructor */}
              {activeTab === "instructor" && (
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                  {/* initials avatar */}
                  <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl bg-cyan-700 text-3xl font-semibold text-white shadow-sm shadow-cyan-200">
                    {instructor.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h2 className="text-2xl font-semibold text-slate-900">{instructor}</h2>
                    <p className="text-cyan-700 font-semibold text-sm mt-0.5">Senior Coordinator &amp; Instructor</p>
                    <p className="mt-4 text-slate-600 text-sm leading-relaxed">
                      A senior advisor and curriculum coordinator with a dedicated record of positive student outcomes. Specialized in structuring progressive courses built on practical, industry-standard templates.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* sidebar support info matching other panel style */}
          <div className="hidden lg:block">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200">
              <h3 className="font-semibold text-slate-900">Student Advisor panel</h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Need extra clarification about curriculum options, credits, or registration metrics? Reach out to our advisor panel.
              </p>
              <Link href="/dashboard" className="mt-4 block rounded-xl bg-slate-100 text-center px-4 py-2.5 text-xs font-semibold text-slate-900 hover:bg-slate-200 transition">
                Return to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ── BOTTOM PERSISTENT CTA ────────────────────────────────────────── */}
      <div className="border-t border-slate-200 bg-white mt-16 shadow-inner">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-5 sm:flex-row">
          <div>
            <p className="font-semibold text-slate-900">{title}</p>
            <p className="text-xs text-slate-500 font-semibold">Instructor: {instructor}</p>
          </div>
          <button
            type="button"
            onClick={handleEnroll}
            disabled={isEnrolled || enrollStatus === "loading"}
            className={`shrink-0 rounded-xl px-6 py-2.5 text-sm font-semibold transition ${isEnrolled
              ? "bg-emerald-50 text-emerald-900 border border-emerald-200 cursor-default"
              : "bg-slate-900 text-white hover:bg-slate-700"
              }`}
          >
            {isEnrolled ? "Enrolled" : "Enroll now"}
          </button>
        </div>
      </div>
    </main>
  );
}
