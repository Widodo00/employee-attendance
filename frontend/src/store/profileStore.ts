import { create } from "zustand";
import type { profileFullInterface, profileStateInterface } from "../types/zustand";

const profileStore = create<profileStateInterface>((set) => ({
  profile: {
    user: {
      email: "",
      name: "",
      role: "",
    },
    serverTime: "",
  },
  setProfile: (value: profileFullInterface) => set({ profile: value }),
}));

export default profileStore;
