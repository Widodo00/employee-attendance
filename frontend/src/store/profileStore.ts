import { create } from "zustand";
import type { profileInterface, profileStateInterface } from "../types/zustand";

const profileStore = create<profileStateInterface>((set) => ({
  profile: {
    name: "Jhon Doe",
    role: "Staff",
  },
  setProfile: (value: profileInterface) => set({ profile: value }),
}));

export default profileStore;
