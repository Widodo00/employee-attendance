import type { locationInterface, todayAttendanceInterface } from "../types/attendance";
import api from "../utils/api";

interface successInterface {
  message: string;
}

export const getTodayAttendance = () => {
  return api.get<todayAttendanceInterface>("/attendance/today");
};

export const postClockIn = (body: locationInterface) => {
  return api.post<successInterface>("/attendance/clock-in", body);
};

export const patchClockOut = () => {
  return api.patch<successInterface>("/attendance/clock-out");
};
