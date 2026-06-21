"use client";

import React, { Suspense } from "react";
import { Form, Input, Button, message } from "antd";
import { LockOutlined } from "@ant-design/icons";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { setPassword } from "@/api/collection/auth";

interface SetPasswordFormValues {
  password: string;
  confirmPassword: string;
}

function SetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [form] = Form.useForm<SetPasswordFormValues>();

  const setupToken =
    searchParams.get("token") ?? searchParams.get("setup_token") ?? "";

  const { mutate: submitPassword, isPending } = useMutation({
    mutationFn: setPassword,
  });

  const onFinish = (values: SetPasswordFormValues) => {
    if (!setupToken) {
      message.error("Invalid or missing setup token. Please use the link from your email.");
      return;
    }

    submitPassword(
      {
        setup_token: setupToken,
        password: values.password,
      },
      {
        onSuccess: (data) => {
          message.success(data.message ?? "Password set successfully!");
          router.push("/login");
        },
        onError: (error) => {
          const errorMessage = isAxiosError(error)
            ? (error.response?.data as { message?: string })?.message ||
              "Failed to set password. Please try again."
            : "Failed to set password. Please try again.";
          message.error(errorMessage);
        },
      },
    );
  };

  return (
    <div className="w-full max-w-[500px] mx-auto px-4 sm:px-6 lg:px-0">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Set Password</h1>
        <p className="text-gray-600">Create a password for your organization account</p>
      </div>

      {!setupToken && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          Setup token is missing. Please open the link sent to your email.
        </div>
      )}

      <Form
        form={form}
        name="set-password"
        onFinish={onFinish}
        layout="vertical"
        autoComplete="off"
        className="space-y-4"
      >
        <Form.Item
          label={<span className="text-gray-700 font-medium">Password</span>}
          name="password"
          rules={[
            { required: true, message: "Please enter your password!" },
            { min: 6, message: "Password must be at least 6 characters!" },
          ]}
          hasFeedback
        >
          <Input.Password
            prefix={<LockOutlined className="text-gray-400" />}
            placeholder="Enter your password"
            size="large"
            className="rounded-lg"
          />
        </Form.Item>

        <Form.Item
          label={
            <span className="text-gray-700 font-medium">Confirm Password</span>
          }
          name="confirmPassword"
          dependencies={["password"]}
          hasFeedback
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
        >
          <Input.Password
            prefix={<LockOutlined className="text-gray-400" />}
            placeholder="Confirm your password"
            size="large"
            className="rounded-lg"
          />
        </Form.Item>

        <Form.Item className="mb-0">
          <Button
            type="primary"
            htmlType="submit"
            size="large"
            loading={isPending}
            disabled={!setupToken}
            className="w-full !bg-primaryColor border-0 rounded-lg h-12 font-medium"
          >
            {isPending ? "Setting password..." : "Set Password"}
          </Button>
        </Form.Item>
      </Form>

      <div className="mt-6 text-center">
        <Link
          href="/login"
          className="text-primaryColor hover:text-primaryColor/80 font-medium"
        >
          Back to Login
        </Link>
      </div>
    </div>
  );
}

const SetPasswordPage: React.FC = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-offWhiteColor py-12">
      <Suspense fallback={<div className="text-gray-600">Loading...</div>}>
        <SetPasswordForm />
      </Suspense>
    </div>
  );
};

export default SetPasswordPage;
