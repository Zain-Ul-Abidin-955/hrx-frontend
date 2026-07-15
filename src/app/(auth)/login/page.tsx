"use client";

import React from "react";
import { Form, Input, Button, message } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useMutation } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { userLogin } from "@/api/collection/auth";
import type { LoginPayload } from "@/types/auth";

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

          if (role === "superadmin") {
            router.push("/superadmin/dashboard");
          } else if (role === "org_admin" || role === "org_hr" || role === "org_employee") {
            router.push("/orgnization/dashboard");
          } else {
            router.push("/login");
          }
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
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome Back</h1>
        <p className="text-gray-600">Sign in to your account</p>
      </div>

      <Form
        form={form}
        name="login"
        onFinish={onFinish}
        layout="vertical"
        autoComplete="off"
        className="space-y-4"
      >
        <Form.Item
          label={<span className="text-gray-700 font-medium">Email</span>}
          name="email"
          rules={[
            { required: true, message: "Please input your email!" },
            { type: "email", message: "Please enter a valid email!" },
          ]}
        >
          <Input
            prefix={<UserOutlined className="text-gray-400" />}
            placeholder="Enter your email"
            size="large"
            className="rounded-lg"
          />
        </Form.Item>

        <Form.Item
          label={<span className="text-gray-700 font-medium">Password</span>}
          name="password"
          rules={[
            { required: true, message: "Please input your password!" },
            { min: 6, message: "Password must be at least 6 characters!" },
          ]}
        >
          <Input.Password
            prefix={<LockOutlined className="text-gray-400" />}
            placeholder="Enter your password"
            size="large"
            className="rounded-lg"
          />
        </Form.Item>

        <Form.Item name="remember" valuePropName="checked" className="mb-4">
          <div className="flex items-center justify-end">
            <Link
              href="/forgot-password"
              className="text-primaryColor hover:text-primaryColor/80 text-sm"
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
