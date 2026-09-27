import axios, { type InternalAxiosRequestConfig } from "axios";
import { Formatting } from "./formatting";

interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  withoutToken?: boolean;
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
    Authorization: Formatting.getToken(import.meta.env.VITE_PUBLIC_KEY_TOKEN),
  },
});

api.interceptors.request.use((config: CustomAxiosRequestConfig) => {
  const withoutToken = config.withoutToken ?? false;

  if (!withoutToken) {
    const token = Formatting.getToken(import.meta.env.VITE_PUBLIC_KEY_TOKEN);
    config.headers.Authorization = `Bearer ${token}`;

    return config;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // localStorage.removeItem("accessToken");
      // Nanti bisa diarahkan ke login
      // window.location.href = '/login';
    }

    return Promise.reject(error.response.data);
  },
);

export default api;
