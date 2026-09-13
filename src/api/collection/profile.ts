import axiosInstance from "../axios/axiosInstance";
import type { AxiosRequestConfig } from "axios";
import type { UpdateProfilePayload, UserProfile } from "@/types/profile";

interface ProfileRequestConfig extends AxiosRequestConfig {
  suppressAuthRedirect?: boolean;
}

export const getProfile = async (
  options: { suppressAuthRedirect?: boolean } = {},
): Promise<UserProfile> => {
  const config: ProfileRequestConfig = {
    suppressAuthRedirect: options.suppressAuthRedirect,
  };
  const response = await axiosInstance.get("/profile", config);
  return response.data;
};

export const updateProfile = async (
  profileData: UpdateProfilePayload,
): Promise<UserProfile> => {
  const response = await axiosInstance.put("/profile", profileData);
  return response.data;
};
