import type { CustomAxiosRequestConfig } from "../types/general";
import type { formLoginInterface } from "../types/login";
import type { profileFullInterface } from "../types/zustand";
import api from "../utils/api";

interface LoginResponse {
  accessToken: string;
}

export const postLogin = (body: formLoginInterface) => {
  return api.post<LoginResponse>("auth/login", body, {
    withoutToken: true,
  } as CustomAxiosRequestConfig);
};

export const getProfile = () => {
  return api.get<profileFullInterface>("auth/profile");
};
