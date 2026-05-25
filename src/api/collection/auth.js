import axiosClient from "../axios/axiosInstance";


//Login
export const userLogin = async (formData) => {

  const response = await axiosClient.post("/admin/auth/login", {
    ...formData,
  });
  return response.data;
};

//Verify otp
export const userVerify = async (formData) => {

  const response = await axiosClient.post("/admin/auth/VerifyEmail", {
    ...formData,
  });
  return response.data;
};

// Resend Otp
export const resendOtp = async (formData) => {

  const response = await axiosClient.post("/admin/auth/resendOtp", {
    ...formData,
  });
  return response.data;
};


//Forget Password
export const forgotPassword = async (formData) => {

  const response = await axiosClient.post("/admin/auth/forgotPassword", {
    ...formData,
  });
  return response.data;
};




