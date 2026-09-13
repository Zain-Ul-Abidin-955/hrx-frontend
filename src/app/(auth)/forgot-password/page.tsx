"use client";

import React from "react";
import { Form, message } from "antd";
import { MailOutlined } from "@ant-design/icons";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { forgotPassword } from "@/api/collection/auth";
import CustomInput from "@/components/input/CustomInput";
import AuthFormCard from "../components/AuthFormCard";
import AuthSubmitButton from "../components/AuthSubmitButton";

interface ForgotPasswordFormValues {
  email: string;
}

const ForgotPassword: React.FC = () => {
  const [form] = Form.useForm<ForgotPasswordFormValues>();
  const router = useRouter();

  const { mutate: requestOtp, isPending } = useMutation({
    mutationFn: forgotPassword,
  });

  const onFinish = (values: ForgotPasswordFormValues) => {
    requestOtp(
      { email: values.email },
      {
        onSuccess: (data) => {
          localStorage.setItem("email", values.email);
          message.success(data.message ?? "OTP sent successfully.");
          router.push("/verify-otp");
        },
        onError: (error) => {
          const errorMessage = isAxiosError(error)
            ? (error.response?.data as { detail?: string })?.detail ||
              "Failed to send OTP. Please try again."
            : "Failed to send OTP. Please try again.";
          message.error(errorMessage);
        },
      },
    );
  };

  return (
    <AuthFormCard
      title="Forgot your password?"
      subtitle="Enter your email and we'll send you a 6-digit code to reset it."
      back={{ href: "/login", label: "Back to sign in" }}
    >
      <Form
        form={form}
        name="forgot-password"
        onFinish={onFinish}
        layout="vertical"
        autoComplete="off"
        requiredMark={false}
      >
        <CustomInput
          name="email"
          label="Email"
          type="email"
          placeholder="you@company.com"
          icon={<MailOutlined />}
          tone="dark"
        />

        <Form.Item className="!mb-0 !mt-2">
          <AuthSubmitButton loading={isPending} loadingLabel="Sending code…">
            Send code
          </AuthSubmitButton>
        </Form.Item>
      </Form>
    </AuthFormCard>
  );
};

export default ForgotPassword;
