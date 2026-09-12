import dayjs from "dayjs";
import NavBar from "../../component/navbar";
import profileStore from "../../store/profileStore";
import { LogIn, LogOut } from "lucide-react";
import Badge from "../../component/badge";
import DatePickerCustom from "../../component/datePickerCustom";
import Pagination from "../../component/pagination";
import SelectCustom from "../../component/selectCustom";
import MonthPickerCustom from "../../component/monthPickerCustom";
import { useEffect, useState } from "react";
import ClockCustom from "../../component/clock";
import loadingStore from "../../store/loadingStore";
import { getHistory, getSummary, getTodayAttendance, patchClockOut, postClockIn } from "../../api/attendance";
import { toast } from "react-toastify";
import { type dataTableInterface, type dataTodayAttendanceInterface, type locationInterface, type summaryDataInterface, type tableInterface } from "../../types/attendance";
import { Formatting } from "../../utils/formatting";

interface filterInterface {
  startDate: string;
  endDate: string;
  status: string;
}

export default function Dashboard() {
  const setLoading = loadingStore((state) => state.setLoading);
  const profile = profileStore((state) => state.profile);
  const isAdmin = profile.user.role === "ADMIN";
  const [dataToday, setDataToday] = useState<dataTodayAttendanceInterface | null>(null);
  const isClockIn = dataToday?.clockIn;
  const isComplete = dataToday?.clockIn && dataToday.clockOut;

  const option = [
    { label: "Present", value: "Present" },
    { label: "Absent", value: "Absent" },
  ];

  const [filter, setFilter] = useState<filterInterface>({
    startDate: "",
    endDate: "",
    status: "",
  });

  const [filterSummary, setFilterSummary] = useState<string>("");

  const [dataTable, setDataTable] = useState<tableInterface>({
    data: [],
    message: "",
    paging: {
      page: 1,
      total: 0,
      totalPages: 1,
    },
  });

  const [dataSummary, setDataSummary] = useState<summaryDataInterface>({
    clockedIn: 0,
    complete: 0,
    employee: 0,
    notClockedIn: 0,
  });

  const summary = [
    { title: "Total Employees", value: dataSummary.employee, color: "text-text-title" },
    { title: "Present", value: dataSummary.complete, color: "text-text-success" },
    { title: "Only Clocked In", value: dataSummary.clockedIn, color: "text-text-neutral" },
    { title: "Not Clocked In", value: dataSummary.notClockedIn, color: "text-text-danger" },
  ];

  const columns = [
    { cell: "Date", row: (row: dataTableInterface) => dayjs(row.date).format("ddd, MMM DD, YYYY") },
    ...(isAdmin ? [{ cell: "Name", row: (row: dataTableInterface) => row.name }] : []),
    { cell: "Clock In", row: (row: dataTableInterface) => (row.clockIn ? dayjs(row.clockIn).format("HH:mm") : "-") },
    { cell: "Clock Out", row: (row: dataTableInterface) => (row.clockOut ? dayjs(row.clockOut).format("HH:mm") : "-") },
    { cell: "Status", row: (row: dataTableInterface) => <Badge content={row.status} type={row.status === "Present" ? 1 : 0} /> },
  ];

  const parseHourMinute = (value: number) => {
    const hour = Math.floor(value / 360);
    const minute = Math.floor(value / 60);
    return `${hour}h ${minute}m`;
  };

  const fieldClockIn = [
    { title: "Clock In", caption: dataToday?.clockIn ? dayjs(dataToday?.clockIn).format("HH:mm") : "-" },
    { title: "Clock Out", caption: dataToday?.clockOut ? dayjs(dataToday?.clockOut).format("HH:mm") : "-" },
    { title: "Duration", caption: dataToday?.elapsedSeconds ? parseHourMinute(dataToday?.elapsedSeconds) : "" },
  ];

  const onSubmit = async () => {
    if (isClockIn) {
      setLoading(true);
      patchClockOut()
        .then(() => {
          getTodayAttendance()
            .then((res) => {
              setDataToday(res.data.data);
              setLoading(false);
            })
            .catch((err) => {
              toast.error(err.message || "Something went wrong");
              setLoading(false);
            });
        })
        .catch((err) => {
          toast.error(err.message.toString() || "Something went wrong");
          setLoading(false);
        });
    } else {
      const location: locationInterface = await Formatting.getLocation();
      if (location) {
        setLoading(true);
        postClockIn(location)
          .then(() => {
            getTodayAttendance()
              .then((res) => {
                setDataToday(res.data.data);
                setLoading(false);
              })
              .catch((err) => {
                toast.error(err.message || "Something went wrong");
                setLoading(false);
              });
          })
          .catch((err) => {
            toast.error(err.message.toString() || "Something went wrong");
            setLoading(false);
          });
      }
    }
  };

  const onChangePage = (value: number) => {
    fetchData(value);
  };

  const fetchData = (page = 1) => {
    setLoading(true);
    getHistory(`?page=${page}&startDate=${filter.startDate || dayjs(profile.serverTime).startOf("M").format("YYYY-MM-DD")}&endDate=${filter.endDate || dayjs(profile.serverTime).format("YYYY-MM-DD")}&status=${filter.status}`)
      .then((res) => {
        setDataTable(res.data);
        setLoading(false);
      })
      .catch((err) => {
        toast.error(err.message || "Something went wrong");
        setLoading(false);
      });
  };

  useEffect(() => {
    if (filter.endDate || filter.startDate || filter.status) {
      fetchData();
    }
  }, [filter]);

  useEffect(() => {
    setLoading(true);
    getSummary(`?month=${filterSummary}`)
      .then((res) => {
        setDataSummary(res.data.data);
        setLoading(false);
      })
      .catch((err) => {
        toast.error(err.message || "Terjadi kesalahan");
        setLoading(false);
      });
  }, [filterSummary]);

  useEffect(() => {
    if (profile.serverTime) {
      setLoading(true);
      Promise.all([
        isAdmin ? getSummary(`?month=${dayjs(profile.serverTime).format("YYYY-MM")}`) : getTodayAttendance(),
        getHistory(`?page=1&startDate=${dayjs(profile.serverTime).startOf("M").format("YYYY-MM-DD")}&endDate=${filter.endDate || dayjs(profile.serverTime).format("YYYY-MM-DD")}`),
      ])
        .then((res) => {
          if (isAdmin) {
            setDataSummary(res[0].data.data);
          } else {
            setDataToday(res[0].data.data);
          }
          setDataTable(res[1].data);
          setLoading(false);
        })
        .catch((err) => {
          toast.error(err.message || "Something went wrong");
          setLoading(false);
        });
    }
  }, [profile]);

  return (
    <div className="w-full h-dvh flex flex-col items-center">
      <NavBar />
      <div className="py-6 px-4 flex flex-col gap-6 w-full max-w-full md:max-w-7xl md:py-8 md:px-6">
        <div className="flex flex-col gap-4 md:flex-row md:justify-between">
          <div className="flex flex-col gap-0.5">
            <p className="font-bold text-xl text-text-title">{isAdmin ? "Attendance Overview" : `Hai, ${profile.user.name}`}</p>
            <p className="text-sm text-text-caption">{isAdmin ? "Monitor real-time attendance across your team." : dayjs(profile.serverTime).format("dddd, MMMM DD, YYYY")}</p>
          </div>
          {isAdmin ? <MonthPickerCustom value={filterSummary || dayjs(profile.serverTime).format("YYYY-MM")} onChange={(value) => setFilterSummary(value)} /> : <ClockCustom />}
        </div>

        {isAdmin ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {summary.map((item) => (
              <div key={item.title} className="rounded-xl border p-5 bg-white border-bg-card">
                <p className="text-xs font-medium text-text-caption">{item.title}</p>
                <p className={`mt-1.5 font-bold text-2xl ${item.color}`}>{item.value}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border p-6 bg-white border-bg-card flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-col gap-4 flex-1">
              <Badge content={isComplete ? "Complete" : isClockIn ? "Clocked In" : "Not Clocked In"} type={isComplete ? 1 : isClockIn ? 2 : 0} />
              <div className="grid grid-cols-3 gap-4">
                {fieldClockIn.map((item) => (
                  <div className="flex flex-col gap-1">
                    <p className="text-xs text-placeholder">{item.title}</p>
                    <p className="text-text-title font-bold text-lg">{item.caption || "-"}</p>
                  </div>
                ))}
              </div>
            </div>
            {!isComplete && (
              <button className={`btn-primary md:px-8 ${isClockIn ? "bg-text-danger!" : ""}`} onClick={onSubmit}>
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
            )}
          </div>
        )}

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
          <Pagination data={dataTable.data} page={dataTable.paging.page} total={dataTable.paging.total} totalPage={dataTable.paging.totalPages} onChange={onChangePage} columns={columns} />
        </div>
      </div>
    </div>
  );
}
