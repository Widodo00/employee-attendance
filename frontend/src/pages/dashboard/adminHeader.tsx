import { useEffect, useState } from "react";
import MonthPickerCustom from "../../component/monthPickerCustom";
import profileStore from "../../store/profileStore";
import dayjs from "dayjs";
import type { summaryDataInterface } from "../../types/attendance";
import loadingStore from "../../store/loadingStore";
import { getSummary } from "../../api/attendance";
import { toast } from "react-toastify";

export default function AdminHeader() {
  const profile = profileStore((state) => state.profile);
  const setLoading = loadingStore((state) => state.setLoading);
  const [filterSummary, setFilterSummary] = useState<string>("");

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

  const fetchData = (time: string) => {
    setLoading(true);
    getSummary(`?month=${time}`)
      .then((res) => {
        setDataSummary(res.data.data);
        setLoading(false);
      })
      .catch((err) => {
        toast.error(err.message.toString() || "Something went wrong");
        setLoading(false);
      });
  };

  useEffect(() => {
    if (profile.serverTime) {
      fetchData(dayjs(filterSummary || profile.serverTime).format("YYYY-MM"));
    }
  }, [profile, filterSummary]);

  return (
    <>
      <div className="flex flex-col gap-4 md:flex-row md:justify-between">
        <div className="flex flex-col gap-0.5">
          <p className="font-bold text-xl text-text-title">Attendance Overview</p>
          <p className="text-sm text-text-caption">Monitor real-time attendance across your team.</p>
        </div>
        <MonthPickerCustom value={filterSummary || dayjs(profile.serverTime).format("YYYY-MM")} onChange={(value) => setFilterSummary(value)} max={dayjs(profile.serverTime).format("YYYY-MM")} />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {summary.map((item) => (
          <div key={item.title} className="rounded-xl border p-5 bg-white border-bg-card">
            <p className="text-xs font-medium text-text-caption">{item.title}</p>
            <p className={`mt-1.5 font-bold text-2xl ${item.color}`}>{item.value}</p>
          </div>
        ))}
      </div>
    </>
  );
}
