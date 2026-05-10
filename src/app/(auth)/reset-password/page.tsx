"use client";

import React from "react";
import { Form, Input, Button } from "antd";
import { LockOutlined } from "@ant-design/icons";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface ResetPasswordFormValues {
  password: string;
  confirmPassword: string;
}

const ResetPassword: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = React.useState(false);
  const router = useRouter();

  const onFinish = () => {
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      localStorage.removeItem("verifiedOtp");
      router.push("/auth/login");
    }, 1000);
  };

  return (
    <div className="w-full max-w-[500px] mx-auto px-4 sm:px-6 lg:px-0">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Reset Password</h1>
        <p className="text-gray-600">Create a new password for your account</p>
      </div>

      <Form
        form={form}
        name="reset-password"
        onFinish={onFinish}
        layout="vertical"
        autoComplete="off"
        className="space-y-4"
      >
        <Form.Item
          label={<span className="text-gray-700 font-medium">New Password</span>}
          name="password"
          rules={[
            { required: true, message: "Please enter new password!" },
            { min: 6, message: "Password must be at least 6 characters!" },
          ]}
          hasFeedback
        >
          <Input.Password
            prefix={<LockOutlined className="text-gray-400" />}
            placeholder="Enter new password"
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
            placeholder="Confirm new password"
            size="large"
            className="rounded-lg"
          />
        </Form.Item>

        <Form.Item className="mb-0">
          <Button
            type="primary"
            htmlType="submit"
            size="large"
            loading={loading}
            className="w-full !bg-primaryColor border-0 rounded-lg h-12 font-medium"
          >
            {loading ? "Updating..." : "Update Password"}
          </Button>
        </Form.Item>
      </Form>

      <div className="mt-6 text-center">
        <Link href="/auth/login" className="text-blue-600 hover:text-blue-700 font-medium">
          Back to Login
        </Link>
      </div>
    </div>
  );
};

export default ResetPassword;
