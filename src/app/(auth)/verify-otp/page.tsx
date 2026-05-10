"use client";

import React from "react";
import { Form, Input, Button } from "antd";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface VerifyOtpFormValues {
  otp: string;
}

const VerifyOtp: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = React.useState(false);
  const router = useRouter();

  const onFinish = (values: VerifyOtpFormValues) => {
    setLoading(true);
    localStorage.setItem("verifiedOtp", values.otp);

    setTimeout(() => {
      setLoading(false);
      router.push("/auth/reset-password");
    }, 1000);
  };

  return (
    <div className="w-full max-w-[500px] mx-auto px-4 sm:px-6 lg:px-0">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Verify OTP</h1>
        <p className="text-gray-600">Enter the 6-digit OTP sent to your email</p>
      </div>

      <Form
        form={form}
        name="verify-otp"
        onFinish={onFinish}
        layout="vertical"
        autoComplete="off"
        className="space-y-4"
      >
        <Form.Item
          label={<span className="text-gray-700 font-medium">OTP Code</span>}
          name="otp"
          rules={[
            { required: true, message: "Please enter OTP!" },
            { len: 6, message: "OTP must be 6 digits!" },
          ]}
        >
          <div className="flex justify-center">
            <Input.OTP
              length={6}
              size="large"
              formatter={(str) => str.replace(/\D/g, "")}
            />
          </div>
        </Form.Item>

        <Form.Item className="mb-0">
          <Button
            type="primary"
            htmlType="submit"
            size="large"
            loading={loading}
            className="w-full !bg-primaryColor border-0 rounded-lg h-12 font-medium"
          >
            {loading ? "Verifying..." : "Verify OTP"}
          </Button>
        </Form.Item>
      </Form>

      <div className="mt-6 text-center">
        <Link
          href="/auth/forgot-password"
          className="text-blue-600 hover:text-blue-700 font-medium"
        >
          Resend OTP
        </Link>
      </div>
    </div>
  );
};

export default VerifyOtp;
