"use client";

import React from "react";
import { Form, Button, message } from "antd";
import { UserOutlined, LockOutlined, HomeOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useMutation } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { userLogin } from "@/api/collection/auth";
import type { LoginPayload } from "@/types/auth";
import CustomInput from "@/components/input/CustomInput";
import { getDashboardPath } from "@/utils/authRoutes";

interface LoginFormValues extends LoginPayload {
  remember?: boolean;
}

const Login: React.FC = () => {
  const router = useRouter();
  const [form] = Form.useForm<LoginFormValues>();

  const { mutate: login, isPending } = useMutation({
    mutationFn: (payload: LoginPayload) => userLogin(payload),
  });

  const onFinish = (values: LoginFormValues) => {
    login(
      {
        email: values.email,
        password: values.password,
      },
      {
        onSuccess: (data) => {
          const role = data.role ?? data.user?.role;

          if (!role) {
            message.error("Login failed: role not found in response.");
            return;
          }
          const dashboardPath = getDashboardPath(role);
          if (!dashboardPath) {
            router.push("/login");
            return;
          }
          router.push(dashboardPath);
          message.success(data.message ?? "Login successful!");
        },
        onError: (error) => {
          const errorMessage = isAxiosError(error)
            ? (error.response?.data as { message?: string })?.message ||
            "Invalid email or password. Please try again."
            : "Invalid email or password. Please try again.";
          message.error(errorMessage);
        },
      },
    );
  };

  return (
    <div className="w-full max-w-[500px] mx-auto px-4 sm:px-6 lg:px-0">
      <div className="mb-8 text-center">
        <Link
          href="/"
          className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full border border-grayLightColor/60 bg-whiteColor text-secondaryTextColor text-sm font-medium hover:border-primaryColor/40 hover:text-primaryColor transition-colors"
        >
          <HomeOutlined />
          Go to Home
        </Link>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome Back</h1>
        <p className="text-gray-600">Login to your account</p>
      </div>

      <Form
        form={form}
        name="login"
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
          icon={<UserOutlined />}
        />

        <CustomInput
          name="password"
          label="Password"
          type="password"
          placeholder="Enter your password"
          icon={<LockOutlined />}
          strengthCheck={false}
        />

        <Form.Item name="remember" valuePropName="checked" className="mb-4">
          <div className="flex items-center justify-end">
            <Link
              href="/forgot-password"
              className="!text-primaryColor !underline text-sm"
            >
              Forgot password?
            </Link>
          </div>
        </Form.Item>

        <Form.Item className="mb-0">
          <Button
            type="primary"
            htmlType="submit"
            size="large"
            loading={isPending}
            className="w-full !bg-primaryColor border-0 rounded-lg h-12 font-medium"
          >
            {isPending ? "Logging in..." : "Login"}
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default Login;
