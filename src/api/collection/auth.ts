import axiosInstance from "../axios/axiosInstance";
import type {
  ForgotPasswordPayload,
  LoginPayload,
  LoginResponse,
  ResendOtpPayload,
  SetPasswordPayload,
  SetPasswordResponse,
  VerifyEmailPayload,
} from "@/types/auth";

export const userLogin = async (formData: LoginPayload): Promise<LoginResponse> => {
  const response = await axiosInstance.post<LoginResponse>("/auth/login", formData);
  return response.data;
};

export const userVerify = async (formData: VerifyEmailPayload) => {
  const response = await axiosInstance.post("/admin/auth/VerifyEmail", formData);
  return response.data;
};

export const resendOtp = async (formData: ResendOtpPayload) => {
  const response = await axiosInstance.post("/admin/auth/resendOtp", formData);
  return response.data;
};

export const forgotPassword = async (formData: ForgotPasswordPayload) => {
  const response = await axiosInstance.post(
    "/admin/auth/forgotPassword",
    formData,
  );
  return response.data;
};


export const setPassword = async (
  formData: SetPasswordPayload,
): Promise<SetPasswordResponse> => {
  const response = await axiosInstance.post<SetPasswordResponse>(
    "/auth/org-admin/set-password",
    formData,
  );
  return response.data;
};