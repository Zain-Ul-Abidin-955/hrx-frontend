import axiosInstance from "../axios/axiosInstance";
import type { UpdateProfilePayload, UserProfile } from "@/types/profile";

export const getProfile = async (): Promise<UserProfile> => {
  const response = await axiosInstance.get("/profile");
  return response.data;
};

export const updateProfile = async (
  profileData: UpdateProfilePayload,
): Promise<UserProfile> => {
  const response = await axiosInstance.put("/profile", profileData);
  return response.data;
};
