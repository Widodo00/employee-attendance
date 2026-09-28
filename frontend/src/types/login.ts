import type { profileFullInterface } from "./zustand";

export interface errorFormLoginInterface {
  email?: string;
  password?: string;
}

export interface profileInterface {
  message: string;
  data: profileFullInterface;
}
