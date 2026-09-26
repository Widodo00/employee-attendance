import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

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

export interface datePickerInterface {
  startValue: string;
  endValue: string;
  startName: string;
  endName: string;
  onChange: (value: string, name: string) => void;
}

export interface optionsInterface {
  value: string | number;
  label: string;
}

export interface selectInterface {
  value: string | number;
  name: string;
  onChange: (value: optionsInterface | null) => void;
  options: optionsInterface[];
  placeholder: string;
}

export interface columnsInterface<T> {
  cell: string;
  row: (row: T) => ReactNode;
}

export interface paginationInterface<T> {
  data: T[];
  columns?: columnsInterface<T>[];
  page: number;
  total: number;
  totalPage: number;
  onChange?: (value: number) => void;
}
