export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  role?: string;
  user?: {
    email?: string;
    role?: string;
  };
  message?: string;
}

export interface VerifyEmailPayload {
  email: string;
  otp: string;
}

export interface ResendOtpPayload {
  email: string;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface SetPasswordPayload {
  setup_token: string;
  password: string;
}

export interface SetPasswordResponse {
  message?: string;
}
