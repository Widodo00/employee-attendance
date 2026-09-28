import dayjs from "dayjs";
import NavBar from "../../component/navbar";
import profileStore from "../../store/profileStore";
import Badge from "../../component/badge";
import DatePickerCustom from "../../component/datePickerCustom";
import Pagination from "../../component/pagination";
import SelectCustom from "../../component/selectCustom";
import { useEffect, useState } from "react";
import loadingStore from "../../store/loadingStore";
import { getHistory } from "../../api/attendance";
import { toast } from "react-toastify";
import { type dataTableInterface } from "../../types/attendance";
import { useQuery } from "@tanstack/react-query";
import AdminHeader from "./adminHeader";
import EmployeeHeader from "./employeeHeader";

interface filterInterface {
  startDate: string;
  endDate: string;
  status: string;
}

export default function Dashboard() {
  const setLoading = loadingStore((state) => state.setLoading);
  const profile = profileStore((state) => state.profile);
  const isAdmin = profile.user.role === "ADMIN";
  const [page, setPage] = useState<number>(1);

  const option = [
    { label: "Present", value: "Present" },
    { label: "Absent", value: "Absent" },
    { label: "Clocked In", value: "Clocked In" },
  ];

  const [filter, setFilter] = useState<filterInterface>({
    startDate: "",
    endDate: "",
    status: "",
  });

  const {
    data: historyData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["attendance-history", page, filter.startDate, filter.endDate, filter.status],
    queryFn: () => getHistory(`?page=${page}&startDate=${filter.startDate || dayjs(profile.serverTime).startOf("M").format("YYYY-MM-DD")}&endDate=${filter.endDate || dayjs(profile.serverTime).format("YYYY-MM-DD")}&status=${filter.status}`),
    enabled: !!profile?.serverTime,
    gcTime: 10 * 60 * 1000,
  });

  const dataTable = historyData?.data;

  const columns = [
    { cell: "Date", row: (row: dataTableInterface) => dayjs(row.date).format("ddd, MMM DD, YYYY") },
    ...(isAdmin ? [{ cell: "Name", row: (row: dataTableInterface) => row.name }] : []),
    { cell: "Clock In", row: (row: dataTableInterface) => (row.clockIn ? dayjs(row.clockIn).format("HH:mm") : "-") },
    { cell: "Clock Out", row: (row: dataTableInterface) => (row.clockOut ? dayjs(row.clockOut).format("HH:mm") : "-") },
    { cell: "Status", row: (row: dataTableInterface) => <Badge content={row.status} type={row.status === "Present" ? 1 : row.status === "Clocked In" ? 2 : 0} /> },
  ];

  const onChangePage = (value: number) => {
    setPage(value);
  };

  useEffect(() => {
    if (isLoading) {
      setLoading(true);
    } else {
      setLoading(false);
    }
  }, [isLoading]);

  useEffect(() => {
    if (error) {
      toast.error(error.message.toString() || "Something went wrong");
    }
  }, [error]);

  return (
    <div className="w-full h-dvh flex flex-col items-center">
      <NavBar />
      <div className="py-6 px-4 flex flex-col gap-6 w-full max-w-full md:max-w-7xl md:py-8 md:px-6">
        {profile.user.role && (isAdmin ? <AdminHeader /> : <EmployeeHeader />)}

        <div className="rounded-xl border bg-white border-bg-card flex flex-col">
          <div className="flex flex-col gap-4 p-5">
            <p className="font-semibold text-text-title">Attendance History</p>
            <div className="flex flex-col gap-3 md:flex-row md:items-end">
              <DatePickerCustom
                startName="startDate"
                endName="endDate"
                startValue={filter.startDate || dayjs(profile.serverTime).startOf("M").format("YYYY-MM-DD")}
                endValue={filter.endDate || dayjs(profile.serverTime).format("YYYY-MM-DD")}
                onChange={(value, name) => setFilter((prev) => ({ ...prev, [name]: value }))}
              />
              <div className="w-37.5">
                <SelectCustom name="type" options={option} placeholder="Select type" onChange={(evt) => setFilter((prev) => ({ ...prev, status: evt!.value as string }))} value={filter.status!} />
              </div>
            </div>
          </div>
          {dataTable && <Pagination data={dataTable!.data} page={dataTable!.paging.page} total={dataTable!.paging.total} totalPage={dataTable!.paging.totalPages} onChange={onChangePage} columns={columns} />}
        </div>
      </div>
    </div>
  );
}
