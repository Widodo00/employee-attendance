import type { CustomAxiosRequestConfig } from "../types/general";
import type { profileInterface } from "../types/login";
import api from "../utils/api";
import type { formLoginInterface } from "../validation/login";

interface LoginResponse {
  accessToken: string;
}

export const postLogin = (body: formLoginInterface) => {
  return api.post<LoginResponse>("auth/login", body, {
    withoutToken: true,
  } as CustomAxiosRequestConfig);
};

export const getProfile = () => {
  return api.get<profileInterface>("auth/profile");
};
