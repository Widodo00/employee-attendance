import { Clock } from "lucide-react";
import { useEffect, useState } from "react";
import profileStore from "../store/profileStore";
import dayjs from "dayjs";

export default function ClockCustom() {
  const profile = profileStore((state) => state.profile);
  const serverTime = profile.serverTime;
  const [currentTime, setCurrentTime] = useState<string>(serverTime);

  useEffect(() => {
    if (!serverTime) return;

    const interval = setInterval(() => {
      setCurrentTime((prev) =>
        dayjs(prev || serverTime)
          .add(1, "second")
          .toISOString(),
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [profile]);

  return (
    <div className="rounded-xl border py-2.5 px-4 gap-2 bg-white border-bg-card flex items-center w-fit">
      <Clock className="size-4 text-placeholder" />
      <p className="font-semibold text-sm text-text-title">{dayjs(currentTime || serverTime).format("HH:mm:ss")}</p>
    </div>
  );
}
