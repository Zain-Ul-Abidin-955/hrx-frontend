"use client";

import React from "react";
import { Form, message } from "antd";
import { MailOutlined, LockOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useMutation } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { userLogin } from "@/api/collection/auth";
import type { LoginPayload } from "@/types/auth";
import CustomInput from "@/components/input/CustomInput";
import { getDashboardPath } from "@/utils/authRoutes";
import AuthFormCard from "../components/AuthFormCard";
import AuthSubmitButton from "../components/AuthSubmitButton";

const Login: React.FC = () => {
  const router = useRouter();
  const [form] = Form.useForm<LoginPayload>();

  const { mutate: login, isPending } = useMutation({
    mutationFn: (payload: LoginPayload) => userLogin(payload),
  });

  const onFinish = (values: LoginPayload) => {
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
    <AuthFormCard
      title="Welcome back"
      subtitle="Sign in to your HRX workspace."
      footer={
        <>
          Need a workspace?{" "}
          <Link
            href="/"
            className="font-medium text-accentColor transition-colors hover:text-glowColor"
          >
            Create one
          </Link>
        </>
      }
    >
      <Form
        form={form}
        name="login"
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

        <CustomInput
          name="password"
          label="Password"
          type="password"
          placeholder="Enter your password"
          icon={<LockOutlined />}
          strengthCheck={false}
          tone="dark"
        />

        <div className="-mt-1 mb-6 flex justify-end">
          <Link
            href="/forgot-password"
            className="text-sm !text-mutedColor transition-colors hover:!text-lightColor"
          >
            Forgot password?
          </Link>
        </div>

        <Form.Item className="!mb-0">
          <AuthSubmitButton loading={isPending} loadingLabel="Signing in…">
            Sign in
          </AuthSubmitButton>
        </Form.Item>
      </Form>
    </AuthFormCard>
  );
};

export default Login;
