import dayjs from "dayjs";
import profileStore from "../../store/profileStore";
import ClockCustom from "../../component/clock";
import Badge from "../../component/badge";
import { useEffect, useState } from "react";
import type { dataTodayAttendanceInterface } from "../../types/attendance";
import loadingStore from "../../store/loadingStore";
import { getTodayAttendance, patchClockOut, postClockIn } from "../../api/attendance";
import { toast } from "react-toastify";
import { Formatting } from "../../utils/formatting";
import { LogIn, LogOut } from "lucide-react";
import { clockInSchema, type locationInterface } from "../../validation/attendance";

export default function EmployeeHeader() {
  const profile = profileStore((state) => state.profile);
  const setLoading = loadingStore((state) => state.setLoading);
  const loading = loadingStore((state) => state.loading);
  const [dataToday, setDataToday] = useState<dataTodayAttendanceInterface | null>(null);
  const isClockIn = dataToday?.clockIn;
  const isComplete = dataToday?.clockIn && dataToday.clockOut;

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
              toast.error(err.message.toString() || "Something went wrong");
              setLoading(false);
            });
        })
        .catch((err) => {
          toast.error(err.message.toString() || "Something went wrong");
          setLoading(false);
        });
    } else {
      setLoading(true);
      const location: locationInterface = await Formatting.getLocation();

      if (location) {
        const validate = clockInSchema.safeParse(location);

        if (!validate.success) {
          toast.error("Invalid location data");
          return;
        }
        postClockIn(location)
          .then(() => {
            getTodayAttendance()
              .then((res) => {
                setDataToday(res.data.data);
                setLoading(false);
              })
              .catch((err) => {
                toast.error(err.message.toString() || "Something went wrong");
                setLoading(false);
              });
          })
          .catch((err) => {
            toast.error(err.message.toString() || "Something went wrong");
            setLoading(false);
          });
      } else {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    setLoading(true);
    getTodayAttendance()
      .then((res) => {
        setDataToday(res.data.data);
        setLoading(false);
      })
      .catch((err) => {
        toast.error(err.message.toString() || "Something went wrong");
        setLoading(false);
      });
  }, []);

  return (
    <>
      <div className="flex flex-col gap-4 md:flex-row md:justify-between">
        <div className="flex flex-col gap-0.5">
          <p className="font-bold text-xl text-text-title">Hai, {profile.user.name}</p>
          <p className="text-sm text-text-caption">{dayjs(profile.serverTime).format("dddd, MMMM DD, YYYY")}</p>
        </div>
        <ClockCustom />
      </div>

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
          <button className={`btn-primary md:px-8 ${isClockIn ? "bg-text-danger!" : ""}`} onClick={onSubmit} disabled={loading}>
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
    </>
  );
}
