import axios from "axios";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { login, logout, signup } from "@/app/lib/Slices/auth/authSlice";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5053/api";

interface EnrollmentState {
    status: "idle" | "loading" | "failed";
    fetchStatus: "idle" | "loading" | "failed";
    error: string | null;
    enrolledCourseIds: number[];
    lastEnrollment: {
        courseId?: number;
        studentId?: number;
        message?: string;
    } | null;
}

const initialState: EnrollmentState = {
    status: "idle",
    fetchStatus: "idle",
    error: null,
    enrolledCourseIds: [],
    lastEnrollment: null,
};

export const fetchStudentEnrollments = createAsyncThunk(
    "enrollments/fetchStudentEnrollments",
    async (studentId: number, { rejectWithValue }) => {
        try {
            const response = await axios.get(`${API_URL}/Enrollments`);
            const data = response.data;
            const enrollments = Array.isArray(data) ? data : [];

            return enrollments
                .filter((enrollment: { studentId?: number }) => enrollment.studentId === studentId)
                .map((enrollment: { courseId?: number }) => enrollment.courseId)
                .filter((courseId): courseId is number => typeof courseId === "number");
        } catch (error) {
            return rejectWithValue(
                axios.isAxiosError(error)
                    ? error.response?.data?.message ?? error.message
                    : "Unable to load enrollments right now."
            );
        }
    }
);

export const enrollInCourse = createAsyncThunk(
    "enrollments/enrollInCourse",
    async (payload: { studentId?: number, courseId?: number; }, { rejectWithValue }) => {
        const studentId = payload.studentId;
        const courseId = payload.courseId;
        if (!courseId) {
            return rejectWithValue("Course ID is required to enroll.");
        }
        try {
            const response = await axios.post(
                `${API_URL}/Enrollments?studentId=${studentId}&courseId=${courseId}`
            );

            return {
                studentId,
                courseId,
                message: response.data?.message ?? "Enrollment request sent.",
            };
        } catch (error) {
            return rejectWithValue(
                axios.isAxiosError(error)
                    ? error.response?.data?.message ?? error.message
                    : "Unable to enroll in this course right now."
            );
        }
    }
);

const enrollmentSlice = createSlice({
    name: "enrollments",
    initialState,
    reducers: {
        clearEnrollmentStatus: (state) => {
            state.status = "idle";
            state.error = null;
            state.lastEnrollment = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchStudentEnrollments.pending, (state) => {
                state.fetchStatus = "loading";
                state.error = null;
            })
            .addCase(fetchStudentEnrollments.fulfilled, (state, action) => {
                state.fetchStatus = "idle";
                state.enrolledCourseIds = action.payload;
            })
            .addCase(fetchStudentEnrollments.rejected, (state, action) => {
                state.fetchStatus = "failed";
                state.enrolledCourseIds = [];
                state.error = action.payload as string;
            })
            .addCase(enrollInCourse.pending, (state) => {
                state.status = "loading";
                state.error = null;
            })
            .addCase(enrollInCourse.fulfilled, (state, action) => {
                state.status = "idle";
                state.lastEnrollment = action.payload;
                const courseId = action.payload.courseId;
                if (courseId && !state.enrolledCourseIds.includes(courseId)) {
                    state.enrolledCourseIds.push(courseId);
                }
            })
            .addCase(enrollInCourse.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.payload as string;
            })
            .addCase(login.fulfilled, () => initialState)
            .addCase(signup.fulfilled, () => initialState)
            .addCase(logout, () => initialState);
    },
});

export const { clearEnrollmentStatus } = enrollmentSlice.actions;
export default enrollmentSlice.reducer;
