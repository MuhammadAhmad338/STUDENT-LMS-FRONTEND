import { configureStore } from "@reduxjs/toolkit";
import authReducer from "@/app/lib/Slices/auth/authSlice";
import coursesReducer from "@/app/lib/Slices/courses/courseSlice";
import enrollmentReducer from "@/app/lib/Slices/enrollments/enrollmentSlice";
import studentsReducer from "@/app/lib/Slices/students/studentSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    courses: coursesReducer,
    enrollments: enrollmentReducer,
    students: studentsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
