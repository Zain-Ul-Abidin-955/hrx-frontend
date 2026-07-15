import { create } from "zustand";
import { getProfile } from "@/api/collection/profile";

const useUserStore = create((set) => ({
  user: null,
  loading: false,
  error: null,

  fetchProfile: async () => {
    set({ loading: true, error: null });
    try {
      const data = await getProfile();
      set({ user: data, loading: false });
      return data;
    } catch (error) {
      set({
        error: error?.response?.data?.message || error.message || "Failed to fetch profile",
        loading: false,
      });
      throw error;
    }
  },

  setUser: (user) => set({ user }),

  clearUser: () => set({ user: null, error: null }),
}));

export default useUserStore;
