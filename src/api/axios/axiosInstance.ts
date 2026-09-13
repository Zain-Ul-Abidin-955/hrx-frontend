import axios from "axios";
import { message } from "antd";

type AuthAwareRequestConfig = {
  suppressAuthRedirect?: boolean;
};

const axiosInstance = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_BASE_URL}`,
  withCredentials: true,
});

function isAuthFailure(error: unknown): boolean {
  const err = error as {
    response?: { status?: number; data?: { detail?: unknown; message?: string } };
  };
  const status = err?.response?.status;
  if (status === 401) return true;

  // Some backends still use 403 for missing/invalid auth — only treat those as logout.
  if (status !== 403) return false;

  const detail = err?.response?.data?.detail ?? err?.response?.data?.message ?? "";
  const text = Array.isArray(detail)
    ? detail.map((d) => (typeof d === "string" ? d : d?.msg)).join(" ")
    : String(detail);

  return /not authenticated|unauthori[sz]ed|invalid token|expired|credentials|session/i.test(
    text,
  );
}

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const config = error?.config as AuthAwareRequestConfig | undefined;
    if (isAuthFailure(error) && !config?.suppressAuthRedirect) {
      message.error("Session expired. Please log in again.");
      window.location.href = "/login";
    }

    return Promise.reject(error);
  },
);

export default axiosInstance;
