import { Minus } from "lucide-react";
import type { datePickerInterface } from "../types/general";

export default function DatePickerCustom({ startValue, endValue, startName, endName, onChange }: datePickerInterface) {
  return (
    <div className="flex gap-1 text-xs font-medium text-text-label">
      <div className="flex flex-col gap-1">
        <p>Tanggal Mulai</p>
        <input type="date" className="input-custom text-black" value={startValue} onChange={(evt) => onChange(evt.target.value, startName)} />
      </div>
      <p className="mt-8">
        <Minus className="size-4" />
      </p>
      <div className="flex flex-col gap-1">
        <p>Tanggal Selesai</p>
        <input type="date" className="input-custom text-black" value={endValue} onChange={(evt) => onChange(evt.target.value, endName)} />
      </div>
    </div>
  );
}
