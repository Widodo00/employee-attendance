import Select from "react-select";
import type { selectInterface } from "../types/general";

export default function SelectCustom({ name, onChange, value, options, placeholder }: selectInterface) {
  return (
    <Select
      value={value}
      onChange={(evt) => onChange(evt)}
      options={options}
      name={name}
      autoFocus={false}
      isSearchable={false}
      placeholder={placeholder}
      styles={{
        control: (provided) => ({
          ...provided,
          height: "40px",
          paddingLeft: "8px",
          paddingRight: "16px",
          borderRadius: "8px",
          border: "1px solid #e2e8f0",
          width: "100%",
        }),
        indicatorSeparator: () => ({ display: "none" }),
        input: (base) => ({
          ...base,
          margin: 0,
          paddingTop: 0,
          paddingBottom: 0,
        }),
      }}
    />
  );
}
