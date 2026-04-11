import { create } from "zustand";

export const useAuthStore = create((set) => ({
  user: null,
  initialized: false,
  setUser: (user) => set({ user, initialized: true }),
  clearUser: () => set({ user: null, initialized: true }),
}));
