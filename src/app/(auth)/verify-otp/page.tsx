"use client";

import React from "react";
import { Form, Button } from "antd";
import { SafetyOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import Link from "next/link";
import CustomInput from "@/components/input/CustomInput";

interface VerifyOtpFormValues {
  otp: string;
}

const VerifyOtp: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = React.useState(false);
  const router = useRouter();

  const onFinish = (values: VerifyOtpFormValues) => {
    setLoading(true);
    localStorage.setItem("otp", values.otp);
    setTimeout(() => {
      setLoading(false);
      router.push("/reset-password");
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
        requiredMark={false}
        className="space-y-4"
      >
        <CustomInput
          name="otp"
          label="OTP Code"
          placeholder="Enter 6-digit OTP"
          icon={<SafetyOutlined />}
          maxLength={6}
          rules={[
            { required: true, message: "Please enter OTP!" },
            { len: 6, message: "OTP must be 6 digits!" },
            {
              pattern: /^\d{6}$/,
              message: "OTP must contain only numbers!",
            },
          ]}
        />

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
          href="/forgot-password"
          className="text-blue-600 hover:text-blue-700 font-medium"
        >
          Resend OTP
        </Link>
      </div>
    </div>
  );
};

export default VerifyOtp;
