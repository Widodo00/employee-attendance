import type { inputGroupInterface } from "../types/general";
import InputCustom from "./inputCustom";

export default function InputGroup<T>({ formData, errorForm, onChange, fields }: inputGroupInterface<T>) {
  return (
    <div className="grid grid-cols-1 gap-4">
      {fields.map((item) => {
        if (["text", "password"].includes(item.type)) {
          return (
            <InputCustom
              key={item.name}
              {...item}
              value={(formData as Record<string, string>)[item.name]}
              onChange={(value) => onChange(value, item.name)}
              errorText={(errorForm as Record<string, string>)[item.name]}
              isError={Boolean((errorForm as Record<string, string>)[item.name])}
            />
          );
        }
      })}
    </div>
  );
}
