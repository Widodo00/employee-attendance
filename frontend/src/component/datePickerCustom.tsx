import { Minus } from "lucide-react";
import type { datePickerInterface } from "../types/general";
import profileStore from "../store/profileStore";
import dayjs from "dayjs";

export default function DatePickerCustom({ startValue, endValue, startName, endName, onChange }: datePickerInterface) {
  const profile = profileStore((state) => state.profile);

  return (
    <div className="flex gap-1 text-xs font-medium text-text-label">
      <div className="flex flex-col gap-1">
        <p>Tanggal Mulai</p>
        <input type="date" className="input-custom text-black bg-white" value={startValue} onChange={(evt) => onChange(evt.target.value, startName)} max={endValue} />
      </div>
      <p className="mt-8">
        <Minus className="size-4" />
      </p>
      <div className="flex flex-col gap-1">
        <p>Tanggal Selesai</p>
        <input type="date" className="input-custom text-black bg-white" value={endValue} onChange={(evt) => onChange(evt.target.value, endName)} max={dayjs(profile.serverTime).format("YYYY-MM-DD")} />
      </div>
    </div>
  );
}
