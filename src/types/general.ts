import type { LucideIcon } from "lucide-react";

export interface fieldsInputInterface {
  label: string;
  type: "text" | "password";
  placeholder: string;
  Icon?: LucideIcon;
  name: string;
}

export interface inputCustomInterface extends fieldsInputInterface {
  value: string;
  onChange: (value: string) => void;
  isError?: boolean;
  errorText?: string;
}

export interface inputGroupInterface<T> {
  formData: T;
  errorForm: T;
  fields: fieldsInputInterface[];
  onChange: (value: string, name: string) => void;
}
