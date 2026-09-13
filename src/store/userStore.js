import { create } from "zustand";
import { getProfile } from "@/api/collection/profile";

const useUserStore = create((set, get) => ({
  user: null,
  loading: false,
  sessionChecked: false,
  error: null,

  fetchProfile: async () => {
    set({ loading: true, error: null });
    try {
      const data = await getProfile();
      set({ user: data, loading: false, sessionChecked: true });
      return data;
    } catch (error) {
      set({
        error: error?.response?.data?.message || error.message || "Failed to fetch profile",
        user: null,
        loading: false,
        sessionChecked: true,
      });
      throw error;
    }
  },

  checkSession: async () => {
    if (get().sessionChecked) return get().user;

    set({ loading: true, error: null });
    try {
      const data = await getProfile({ suppressAuthRedirect: true });
      set({ user: data, loading: false, sessionChecked: true });
      return data;
    } catch {
      set({ user: null, loading: false, sessionChecked: true });
      return null;
    }
  },

  setUser: (user) => set({ user, sessionChecked: true }),

  clearUser: () => set({ user: null, error: null, sessionChecked: true }),
}));

export default useUserStore;
