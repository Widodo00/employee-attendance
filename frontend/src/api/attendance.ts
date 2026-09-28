import { type tableInterface, type todayAttendanceInterface } from "../types/attendance";
import api from "../utils/api";
import type { locationInterface } from "../validation/attendance";

interface successInterface {
  message: string;
}

export const getTodayAttendance = () => {
  return api.get<todayAttendanceInterface>("attendance/today");
};

export const postClockIn = (body: locationInterface) => {
  return api.post<successInterface>("attendance/clock-in", body);
};

export const patchClockOut = () => {
  return api.patch<successInterface>("attendance/clock-out");
};

export const getHistory = (params: string) => {
  return api.get<tableInterface>(`attendance/history${params}`);
};

export const getSummary = (params: string) => {
  return api.get(`attendance/summary${params}`);
};
