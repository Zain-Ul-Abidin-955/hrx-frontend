import axiosInstance from "../axios/axiosInstance";
import type {
  ForgotPasswordPayload,
  LoginPayload,
  LoginResponse,
  ResetPasswordPayload,
  ResendOtpPayload,
  SetPasswordPayload,
  SetPasswordResponse,
  VerifyEmailPayload,
} from "@/types/auth";

export const userLogin = async (
  formData: LoginPayload,
): Promise<LoginResponse> => {
  const response = await axiosInstance.post<LoginResponse>(
    "/auth/login",
    formData,
  );
  return response.data;
};

export const forgotPassword = async (formData: ForgotPasswordPayload) => {
  const response = await axiosInstance.post(
    "/auth/forgot-password/request-otp",
    formData,
  );
  return response.data;
};

// export const userVerify = async (formData: VerifyEmailPayload) => {
//   const response = await axiosInstance.post("/admin/auth/VerifyEmail", formData);
//   return response.data;
// };

export const setPassword = async (
  formData: SetPasswordPayload,
): Promise<SetPasswordResponse> => {
  const response = await axiosInstance.post<SetPasswordResponse>(
    "/auth/org-admin/set-password",
    formData,
  );
  return response.data;
};

export const setEmployeePassword = async (
  formData: SetPasswordPayload,
): Promise<SetPasswordResponse> => {
  const response = await axiosInstance.post<SetPasswordResponse>(
    "/auth/employee/set-password",
    formData,
  );
  return response.data;
};

export const resetPassword = async (
  formData: ResetPasswordPayload,
): Promise<SetPasswordResponse> => {
  const response = await axiosInstance.post<SetPasswordResponse>(
    "/auth/forgot-password/reset",
    formData,
  );
  return response.data;
};
