import CryptoJS from "crypto-js";
import Cookies from "js-cookie";

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
};
