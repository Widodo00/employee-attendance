import type { todayAttendanceInterface } from "../types/attendance";
import api from "../utils/api";

export const getTodayAttendance = () => {
  return api.get<todayAttendanceInterface>("/attendance/today");
};
