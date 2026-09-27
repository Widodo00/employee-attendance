import type { formLoginInterface } from "../types/login";
import api from "../utils/api";

interface LoginResponse {
  accessToken: string;
}

export const postLogin = (body: formLoginInterface) => {
  return api.post<LoginResponse>("auth/login", body);
};
