import { configureStore } from "@reduxjs/toolkit";
import authReducer from "@/app/lib/features/auth/authSlice";
import coursesReducer from "@/app/lib/features/courses/courseSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    courses: coursesReducer
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
