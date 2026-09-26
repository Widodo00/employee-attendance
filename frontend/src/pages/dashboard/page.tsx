import dayjs from "dayjs";
import NavBar from "../../component/navbar";
import profileStore from "../../store/profileStore";
import { LogIn, LogOut } from "lucide-react";
import Badge from "../../component/badge";
import type { paginationInterface } from "../../types/general";
import DatePickerCustom from "../../component/datePickerCustom";
import Pagination from "../../component/pagination";
import SelectCustom from "../../component/selectCustom";
import MonthPickerCustom from "../../component/monthPickerCustom";
import { useState } from "react";
import ClockCustom from "../../component/clock";

interface dataTableInterface {
  date: Date;
  clockIn: Date;
  clockOut: Date;
  status: string;
}

interface filterInterface {
  startDate: string;
  endDate: string;
  type: string;
}

export default function Dashboard() {
  const profile = profileStore((state) => state.profile);
  const currentTime = new Date();
  const isClockIn = true;
  const isAdmin = profile.role === "Administrator";

  const option = [
    { label: "Present", value: "Present" },
    { label: "Absent", value: "Absent" },
  ];

  const [filter, setFilter] = useState<filterInterface>({
    startDate: dayjs(new Date()).startOf("M").format("YYYY-MM-DD"),
    endDate: dayjs(new Date()).endOf("M").format("YYYY-MM-DD"),
    type: "",
  });

  const [filterSummary, setFilterSummary] = useState<string>(dayjs(new Date()).endOf("M").format("YYYY-MM"));

  const [dataTable, setDataTable] = useState<paginationInterface<dataTableInterface>>({
    data: [
      { date: new Date(), clockIn: new Date(), clockOut: new Date(), status: "Present" },
      { date: new Date(), clockIn: new Date(), clockOut: new Date(), status: "Present" },
      { date: new Date(), clockIn: new Date(), clockOut: new Date(), status: "Absent" },
      { date: new Date(), clockIn: new Date(), clockOut: new Date(), status: "Present" },
      { date: new Date(), clockIn: new Date(), clockOut: new Date(), status: "Present" },
    ],
    page: 1,
    total: 23,
    totalPage: 3,
  });

  const summary = [
    { title: "Total Employees", value: 12, footer: "Active headcount", color: "text-text-title" },
    { title: "Present Today", value: 6, footer: "50% completion rate", color: "text-text-success" },
    { title: "Currently In", value: 3, footer: "Still on premises", color: "text-text-neutral" },
    { title: "Not Clocked In", value: 3, footer: "Pending action", color: "text-text-danger" },
  ];

  const columns = [
    { cell: "Date", row: (row: dataTableInterface) => dayjs(row.date).format("ddd, MMM DD, YYYY") },
    { cell: "Clock In", row: (row: dataTableInterface) => dayjs(row.clockIn).format("HH:mm") },
    { cell: "Clock Out", row: (row: dataTableInterface) => dayjs(row.clockOut).format("HH:mm") },
    { cell: "Status", row: (row: dataTableInterface) => <Badge content={row.status} type={row.status === "Present" ? 1 : 0} /> },
  ];

  const fieldClockIn = [
    { title: "Clock In", caption: dayjs(new Date()).format("HH:mm") },
    { title: "Clock Out", caption: "" },
    { title: "Duration", caption: "" },
  ];

  return (
    <div className="w-full h-dvh flex flex-col items-center">
      <NavBar />
      <div className="py-6 px-4 flex flex-col gap-6 w-full max-w-full md:max-w-7xl md:py-8 md:px-6">
        <div className="flex flex-col gap-4 md:flex-row md:justify-between">
          <div className="flex flex-col gap-0.5">
            <p className="font-bold text-xl text-text-title">{isAdmin ? "Attendance Overview" : `Hai, ${profile.name}`}:</p>
            <p className="text-sm text-text-caption">{isAdmin ? "Monitor real-time attendance across your team." : dayjs(currentTime).format("dddd, MMMM DD, YYYY")}</p>
          </div>
          {isAdmin ? <MonthPickerCustom value={filterSummary} onChange={(value) => setFilterSummary(value)} /> : <ClockCustom />}
        </div>

        {isAdmin ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {summary.map((item) => (
              <div key={item.title} className="rounded-xl border p-5 bg-white border-bg-card">
                <p className="text-xs font-medium text-text-caption">{item.title}</p>
                <p className={`mt-1.5 font-bold text-2xl ${item.color}`}>{item.value}</p>
                <p className="mt-1 text-xs text-placeholder">{item.footer}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border p-6 bg-white border-bg-card flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-col gap-4 flex-1">
              <Badge content={isClockIn ? "Clocked In" : "Not Clocked In"} type={isClockIn ? 2 : 0} />
              <div className="grid grid-cols-3 gap-4">
                {fieldClockIn.map((item) => (
                  <div className="flex flex-col gap-1">
                    <p className="text-xs text-placeholder">{item.title}</p>
                    <p className="text-text-title font-bold text-lg">{item.caption || "-"}</p>
                  </div>
                ))}
              </div>
            </div>
            <button className={`btn-primary md:px-8 ${isClockIn ? "bg-text-danger!" : ""}`}>
              {isClockIn ? (
                <>
                  <LogOut />
                  <p>Clock Out</p>
                </>
              ) : (
                <>
                  <LogIn />
                  <p>Clock In</p>
                </>
              )}
            </button>
          </div>
        )}

        <div className="rounded-xl border bg-white border-bg-card flex flex-col">
          <div className="flex flex-col gap-4 p-5">
            <p className="font-semibold text-text-title">Attendance History</p>
            <div className="flex flex-col gap-3 md:flex-row md:items-end">
              <DatePickerCustom startName="startDate" endName="endDate" startValue={filter.startDate} endValue={filter.endDate} onChange={(value, name) => setFilter((prev) => ({ ...prev, [name]: value }))} />
              <div className="w-37.5">
                <SelectCustom name="type" options={option} placeholder="Select type" onChange={(evt) => setFilter((prev) => ({ ...prev, type: evt!.value as string }))} value={filter.type!} />
              </div>
            </div>
          </div>
          <Pagination data={dataTable.data} page={dataTable.page} total={dataTable.total} totalPage={dataTable.totalPage} onChange={(value) => setDataTable((prev) => ({ ...prev, page: value }))} columns={columns} />
        </div>
      </div>
    </div>
  );
}
