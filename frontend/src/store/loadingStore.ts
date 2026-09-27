import { create } from "zustand";
import type { loadingStateInterface } from "../types/zustand";

const loadingStore = create<loadingStateInterface>((set) => ({
  loading: true,
  setLoading: (value: boolean) => set({ loading: value }),
}));

export default loadingStore;
