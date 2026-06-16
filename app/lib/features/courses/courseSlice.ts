import axios from "axios";
import type { CourseItem } from "@/app/lib/api";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5053/api";

interface CoursesState {
  items: CourseItem[];
  status: "idle" | "loading" | "failed";
  error: string | null;
}

const initialState: CoursesState = {
  items: [],
  status: "idle",
  error: null
};

export const fetchCourses = createAsyncThunk("courses/fetchCourses", async (_, { rejectWithValue }) => {
  try {
    const response = await axios.get(`${API_URL}/Courses`, {
      timeout: 10000,
    });

    const data = response.data;

    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.items)) return data.items;
    if (Array.isArray(data?.courses)) return data.courses;

    return [];
  } catch (error) {
    return rejectWithValue(
      axios.isAxiosError(error) ? error.response?.data?.message ?? error.message : "Unable to load courses."
    );
  }
});

const courseSlice = createSlice({
  name: "courses",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCourses.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchCourses.fulfilled, (state, action) => {
        state.status = "idle";
        state.items = action.payload;
      })
      .addCase(fetchCourses.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      });
  },
});

export default courseSlice.reducer;
