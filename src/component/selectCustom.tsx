import Select from "react-select";
import type { selectInterface } from "../types/general";

export default function SelectCustom({ name, onChange, value, options, placeholder }: selectInterface) {
  const newValue = options.find((item) => item.value === value);

  return (
    <Select
      value={newValue}
      onChange={(evt) => onChange(evt)}
      options={options}
      name={name}
      autoFocus={false}
      isSearchable={false}
      placeholder={placeholder}
      styles={{
        control: (base, state) => ({
          ...base,
          minHeight: "40px",
          height: "40px",
          paddingLeft: "12px",
          paddingRight: "12px",
          borderRadius: "8px",
          border: `1px solid ${state.isFocused ? "#3b82f6" : "#e2e8f0"}`,
          boxShadow: "none",
          outline: "none",
          fontSize: "12px",
          transition: "border-color 150ms",
          "&:hover": {
            borderColor: state.isFocused ? "#3b82f6" : "#e2e8f0",
          },
        }),

        placeholder: (base) => ({
          ...base,
          margin: 0,
          color: "#94a3b8",
        }),

        indicatorSeparator: () => ({
          display: "none",
        }),

        option: (base, state) => ({
          ...base,
          fontSize: "12px",
          padding: "10px 12px",
          cursor: "pointer",
          color: "#0f172a",
          backgroundColor: state.isSelected ? "#eff6ff" : state.isFocused ? "#f8fafc" : "#ffffff",
          "&:active": {
            backgroundColor: "#eff6ff",
          },
        }),
      }}
    />
  );
}
