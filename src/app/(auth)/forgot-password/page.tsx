"use client";

import React from "react";
import { Form, Input, Button } from "antd";
import { MailOutlined } from "@ant-design/icons";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface ForgotPasswordFormValues {
  email: string;
}

const ForgotPassword: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = React.useState(false);
  const router = useRouter();

  const onFinish = (values: ForgotPasswordFormValues) => {
    setLoading(true);
    localStorage.setItem("resetEmail", values.email);
    setTimeout(() => {
      setLoading(false);
      router.push("/auth/verify-otp");
    }, 1000);
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
        className="space-y-4"
      >
        <Form.Item
          label={<span className="text-gray-700 font-medium">Email</span>}
          name="email"
          rules={[
            { required: true, message: "Please enter your email!" },
            { type: "email", message: "Please enter a valid email!" },
          ]}
        >
          <Input
            prefix={<MailOutlined className="text-gray-400" />}
            placeholder="Enter your email"
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
            {loading ? "Sending OTP..." : "Send OTP"}
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

export default ForgotPassword;
