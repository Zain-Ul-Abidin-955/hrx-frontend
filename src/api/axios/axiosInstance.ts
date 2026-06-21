import axios from "axios";
import { message } from "antd";

const axiosInstance = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_BASE_URL}`,
  withCredentials: true,
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;

    if (status === 403) {
      message.error("Session expired. Please log in again.");
      window.location.href = "/login";
    }

    return Promise.reject(error);
  },
);

export default axiosInstance;
