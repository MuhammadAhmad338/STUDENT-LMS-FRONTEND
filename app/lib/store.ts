import { configureStore } from "@reduxjs/toolkit";
import authReducer from "@/app/lib/features/auth/authSlice";
import coursesReducer from "@/app/lib/features/courses/courseSlice";
import enrollmentReducer from "@/app/lib/features/enrollments/enrollmentSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    courses: coursesReducer,
    enrollments: enrollmentReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
