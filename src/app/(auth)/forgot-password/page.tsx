"use client";

import React from "react";
import { Form, Button, message } from "antd";
import { MailOutlined } from "@ant-design/icons";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { forgotPassword } from "@/api/collection/auth";
import CustomInput from "@/components/input/CustomInput";

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
    <div className="w-full max-w-[500px] mx-auto px-4 sm:px-6 lg:px-0">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Forgot Password</h1>
        <p className="text-gray-600">
          Enter your email and we&apos;ll send you an OTP code
        </p>
      </div>

      <Form
        form={form}
        name="forgot-password"
        onFinish={onFinish}
        layout="vertical"
        autoComplete="off"
        requiredMark={false}
        className="space-y-4"
      >
        <CustomInput
          name="email"
          label="Email"
          type="email"
          placeholder="Enter your email"
          icon={<MailOutlined />}
        />

        <Form.Item className="mb-0">
          <Button
            type="primary"
            htmlType="submit"
            size="large"
            loading={isPending}
            className="w-full !bg-primaryColor border-0 rounded-lg h-12 font-medium"
          >
            {isPending ? "Sending OTP..." : "Send OTP"}
          </Button>
        </Form.Item>
      </Form>

      <div className="mt-6 text-center">
        <Link
          href="/login"
          className="text-blue-600 hover:text-blue-700 font-medium"
        >
          Back to Login
        </Link>
      </div>
    </div>
  );
};

export default ForgotPassword;
