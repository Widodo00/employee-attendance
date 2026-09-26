export interface dataTodayAttendanceInterface {
  clockIn: string;
  clockOut: null | string;
  latitude: string;
  longitude: string;
  elapsedSeconds: number;
}

export interface todayAttendanceInterface {
  message: string;
  data: dataTodayAttendanceInterface | null;
}

export interface locationInterface {
  latitude: number;
  longitude: number;
}
