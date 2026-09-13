"use client";

import React from "react";
import { Form, message } from "antd";
import { LockOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { resetPassword } from "@/api/collection/auth";
import CustomInput from "@/components/input/CustomInput";
import AuthFormCard from "../components/AuthFormCard";
import AuthSubmitButton from "../components/AuthSubmitButton";

interface ResetPasswordFormValues {
  password: string;
  confirmPassword: string;
}

const ResetPassword: React.FC = () => {
  const [form] = Form.useForm<ResetPasswordFormValues>();
  const router = useRouter();

  const { mutate: submitReset, isPending } = useMutation({
    mutationFn: resetPassword,
  });

  const onFinish = (values: ResetPasswordFormValues) => {
    const email = localStorage.getItem("email");
    const otp = localStorage.getItem("otp");

    if (!email || !otp) {
      message.error("Reset session expired. Please request a new OTP.");
      router.push("/forgot-password");
      return;
    }

    submitReset(
      {
        email,
        otp,
        password: values.password,
      },
      {
        onSuccess: (data) => {
          localStorage.clear();
          message.success(data.message ?? "Password reset successfully.");
          router.push("/login");
        },
        onError: (error) => {
          const errorMessage = isAxiosError(error)
            ? (error.response?.data as { detail?: string })?.detail ||
              "Failed to reset password. Please try again."
            : "Failed to reset password. Please try again.";
          message.error(errorMessage);
        },
      },
    );
  };

  return (
    <AuthFormCard
      title="Set a new password"
      subtitle="Use at least 8 characters with an uppercase letter, a number, and a symbol."
      back={{ href: "/login", label: "Back to sign in" }}
    >
      <Form
        form={form}
        name="reset-password"
        onFinish={onFinish}
        layout="vertical"
        autoComplete="off"
        requiredMark={false}
      >
        <CustomInput
          name="password"
          label="New password"
          type="password"
          placeholder="Enter new password"
          icon={<LockOutlined />}
          hasFeedback
          tone="dark"
        />

        <CustomInput
          name="confirmPassword"
          label="Confirm password"
          type="password"
          placeholder="Re-enter new password"
          icon={<LockOutlined />}
          dependencies={["password"]}
          hasFeedback
          tone="dark"
          rules={[
            { required: true, message: "Please confirm your password!" },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue("password") === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error("Passwords do not match!"));
              },
            }),
          ]}
        />

        <Form.Item className="!mb-0 !mt-2">
          <AuthSubmitButton loading={isPending} loadingLabel="Updating…">
            Update password
          </AuthSubmitButton>
        </Form.Item>
      </Form>
    </AuthFormCard>
  );
};

export default ResetPassword;
