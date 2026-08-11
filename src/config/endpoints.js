import { withBase } from "./apiConfig";

// Centralized endpoints list — import values from here in services and contexts
export const AUTH_LOGIN = withBase("/api/auth/login");
export const AUTH_REGISTER = withBase("/api/auth/register");

// Attendance endpoints
export const ATTENDANCE_MY = withBase("/api/attendance/my");
export const ATTENDANCE_TODAY = withBase("/api/attendance/today");
export const ATTENDANCE_ALL = withBase("/api/attendance");
export const ATTENDANCE_CHECK_IN = withBase("/api/attendance/check-in");
export const ATTENDANCE_CHECK_OUT = withBase("/api/attendance/check-out");

export default {
    AUTH_LOGIN,
    AUTH_REGISTER,
    ATTENDANCE_MY,
    ATTENDANCE_TODAY,
    ATTENDANCE_ALL,
    ATTENDANCE_CHECK_IN,
    ATTENDANCE_CHECK_OUT,
};
