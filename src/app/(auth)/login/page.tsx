"use client";
import React from "react";
import { Form, Input, Button, Checkbox, message } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { setAuthCookies } from "@/lib/cookies-client";
import type { AppRoleCookie } from "@/lib/auth-cookies";

interface LoginFormValues {
  email: string;
  password: string;
  remember: boolean;
}

const DUMMY_TOKEN =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxMjM0NTYiLCJlbWFpbCI6InVzZXJAZXhhbXBsZS5jb20ifQ.dummytoken";

/** Demo accounts — Organization uses admin role + /orgnization routes; Super Admin uses superadmin + /superadmin routes. */
const DUMMY_ACCOUNTS: ReadonlyArray<{
  email: string;
  password: string;
  role: AppRoleCookie;
  label: string;
}> = [
  {
    email: "org@hrx.demo",
    password: "OrgDemo123!",
    role: "admin",
    label: "Organization",
  },
  {
    email: "super@hrx.demo",
    password: "SuperDemo123!",
    role: "superadmin",
    label: "Super Admin",
  },
];

/**
 * Login stores authToken and userRole in cookies (not localStorage).
 * Middleware enforces /orgnization/* for admin and /superadmin/* for superadmin.
 */
const Login: React.FC = () => {
  const router = useRouter();
  const [form] = Form.useForm();
  const [loading, setLoading] = React.useState(false);

  const onFinish = (values: LoginFormValues) => {
    setLoading(true);

    const normalizedEmail = values.email.trim().toLowerCase();
    const match = DUMMY_ACCOUNTS.find(
      (a) =>
        a.email.toLowerCase() === normalizedEmail && a.password === values.password
    );

    if (!match) {
      message.error("Invalid email or password");
      setLoading(false);
      return;
    }

    setAuthCookies({
      token: DUMMY_TOKEN,
      role: match.role,
      email: values.remember ? values.email.trim() : undefined,
    });

    setTimeout(() => {
      setLoading(false);
      if (match.role === "superadmin") {
        router.push("/superadmin/dashboard");
      } else {
        router.push("/orgnization/dashboard");
      }
    }, 400);
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
          <div className="flex items-center justify-between">
            <Checkbox className="text-gray-600">Remember me</Checkbox>
            <Link
              href="/forgot-password"
              className="!text-primaryColor hover:text-primaryColor/80 text-sm"
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
            loading={loading}
            className="w-full !bg-primaryColor border-0 rounded-lg h-12  font-medium"
          >
            {loading ? "Logging in..." : "Login"}
          </Button>
        </Form.Item>
      </Form>

      <div className="mt-6 text-center">
        <p className="text-gray-600">
          Don&apos;t have an account?{" "}
          <Link
            href="/signup"
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Sign up
          </Link>
        </p>
      </div>

      <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-3">
        <p className="text-sm font-semibold text-gray-700">
          Demo credentials (development)
        </p>
        <ul className="text-sm text-gray-600 space-y-2 list-disc list-inside">
          <li>
            <span className="font-medium text-gray-800">Organization (admin)</span>
            : org@hrx.demo / OrgDemo123! — access to{" "}
            <code className="text-xs bg-gray-200 px-1 rounded">/orgnization/*</code>
          </li>
          <li>
            <span className="font-medium text-gray-800">Super Admin</span>: super@hrx.demo
            / SuperDemo123! — access to{" "}
            <code className="text-xs bg-gray-200 px-1 rounded">/superadmin/*</code>
          </li>
        </ul>
        <p className="text-xs text-gray-500">
          Session token and role are stored in cookies after login; middleware uses them to
          protect dashboard routes.
        </p>
      </div>
    </div>
  );
};

export default Login;
