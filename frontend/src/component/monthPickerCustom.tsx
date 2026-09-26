import type { monthPickerInterface } from "../types/general";

export default function MonthPickerCustom({ value, onChange }: monthPickerInterface) {
  return <input type="month" className="input-custom text-black bg-white w-fit!" value={value} onChange={(evt) => onChange(evt.target.value)} />;
}
