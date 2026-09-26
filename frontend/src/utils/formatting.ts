import CryptoJS from "crypto-js";
import Cookies from "js-cookie";
import { toast } from "react-toastify";
import type { locationInterface } from "../types/attendance";

export const Formatting = {
  profileName: function (value: string) {
    const valueSplit = value?.split(" ");
    if (valueSplit?.length >= 2) {
      return valueSplit[0][0]?.toUpperCase() + valueSplit[1][0]?.toUpperCase();
    } else {
      return valueSplit[0][0]?.toUpperCase();
    }
  },

  saveToken: function (token: string) {
    const tokenEncrypted = CryptoJS.AES.encrypt(token, import.meta.env.VITE_PUBLIC_KEY || "").toString();
    if (token) {
      Cookies.set(import.meta.env.VITE_PUBLIC_KEY_TOKEN || "", tokenEncrypted);
    }
  },

  getToken: function (typeToken: string) {
    const token = Cookies.get(typeToken);
    if (token) {
      const bytes = CryptoJS.AES.decrypt(token, import.meta.env.VITE_PUBLIC_KEY || "");
      const tokenjwt = bytes.toString(CryptoJS.enc.Utf8);
      return tokenjwt;
    } else {
      return "";
    }
  },

  deleteAllToken: function () {
    Cookies.remove(import.meta.env.VITE_PUBLIC_KEY_TOKEN || "");
  },

  getLocation: function () {
    return new Promise<locationInterface>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;

          resolve({
            latitude,
            longitude,
          });
        },
        (error) => {
          if (error.message.includes("denied")) {
            toast.warning("Please allow the browser to access your location");
          }
          reject(error);
        },
      );
    });
  },
};
