import { create } from "zustand";
import type { loadingStateInterface } from "../types/zustand";

const loadingStore = create<loadingStateInterface>((set) => ({
  loading: false,
  setLoading: (value: boolean) => set({ loading: value }),
}));

export default loadingStore;
