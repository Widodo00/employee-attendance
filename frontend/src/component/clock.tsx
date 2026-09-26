import dayjs from "dayjs";
import { Clock } from "lucide-react";
import { useEffect, useState } from "react";

export default function ClockCustom() {
  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="rounded-xl border py-2.5 px-4 gap-2 bg-white border-bg-card flex items-center w-fit">
      <Clock className="size-4 text-placeholder" />
      <p className="font-semibold text-sm text-text-title">{dayjs(currentTime).format("HH:mm:ss")}</p>
    </div>
  );
}
