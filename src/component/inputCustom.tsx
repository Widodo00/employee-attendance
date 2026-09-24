import { useState } from "react";
import type { inputCustomInterface } from "../types/general";
import { Eye, EyeOff } from "lucide-react";

export default function InputCustom({ label, placeholder, type, Icon, onChange, value, name, errorText, isError }: inputCustomInterface) {
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const EyeIcon = showPassword ? EyeOff : Eye;

  return (
    <div className="flex flex-col gap-1.5">
      <p className="text-sm font-medium text-text-label">{label}</p>
      <div className="flex flex-col gap-1">
        <div className="relative flex items-center">
          <input
            type={type === "password" ? (showPassword ? "text" : "password") : type}
            name={name}
            value={value}
            onChange={(evt) => onChange(evt.target.value)}
            placeholder={placeholder}
            className={`input-custom ${Icon ? "pl-9!" : ""} ${type === "password" ? "pr-9!" : ""} ${isError ? "border-red-600!" : ""}`}
          />
          {Icon && <Icon className="size-4 text-placeholder absolute left-3" />}
          {type === "password" && (
            <button type="button" className="absolute right-3 cursor-pointer" onClick={() => setShowPassword(!showPassword)}>
              <EyeIcon className="size-4 text-placeholder" />
            </button>
          )}
        </div>
        {isError && <p className="text-xs text-red-600">{errorText}</p>}
      </div>
    </div>
  );
}
