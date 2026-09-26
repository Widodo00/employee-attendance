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

export interface dataTableInterface {
  clockIn: string;
  clockOut: string;
  date: string;
  name: string;
  status: "Present" | "Absent" | "CLocked In";
}

export interface pagingTableInterface {
  page: number;
  total: number;
  totalPages: number;
}

export interface tableInterface {
  data: dataTableInterface[];
  message: string;
  paging: pagingTableInterface;
}
