import axios from "axios";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5053/api";

export interface StudentItem {
  id?: number;
  studentId?: number;
  fullName?: string;
  name?: string;
  email?: string;
  department?: string;
  role?: string;
  enrollmentDate?: string;
  createdAt?: string;
}

interface StudentsState {
  items: StudentItem[];
  status: "idle" | "loading" | "failed";
  error: string | null;
}

const initialState: StudentsState = {
  items: [],
  status: "idle",
  error: null,
};

export const fetchStudents = createAsyncThunk(
  "students/fetchStudents",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/Students`);
      const data = response.data;

      if (Array.isArray(data)) return data;
      if (Array.isArray(data?.items)) return data.items;
      if (Array.isArray(data?.students)) return data.students;

      return [];
    } catch (error) {
      return rejectWithValue(
        axios.isAxiosError(error)
          ? error.response?.data?.message ?? error.message
          : "Unable to load students."
      );
    }
  }
);

const studentSlice = createSlice({
  name: "students",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchStudents.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchStudents.fulfilled, (state, action) => {
        state.status = "idle";
        state.items = action.payload;
      })
      .addCase(fetchStudents.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      });
  },
});

export default studentSlice.reducer;
