const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5053/api";

export interface CourseItem {
  id?: number;
  courseId?: number;
  title?: string;
  name?: string;
  courseName?: string;
  description?: string;
  instructor?: string;
  teacher?: string;
  duration?: string;
  credits?: number;
  category?: string;
}


