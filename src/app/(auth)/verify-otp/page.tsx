"use client";

import React from "react";
import { Form } from "antd";
import { SafetyOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import Link from "next/link";
import CustomInput from "@/components/input/CustomInput";
import AuthFormCard from "../components/AuthFormCard";
import AuthSubmitButton from "../components/AuthSubmitButton";

interface VerifyOtpFormValues {
  otp: string;
}

const VerifyOtp: React.FC = () => {
  const [form] = Form.useForm<VerifyOtpFormValues>();
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
    <AuthFormCard
      title="Check your email"
      subtitle="Enter the 6-digit code we sent to your email address."
      back={{ href: "/forgot-password", label: "Use a different email" }}
      footer={
        <>
          Didn&apos;t get the code?{" "}
          <Link
            href="/forgot-password"
            className="font-medium text-accentColor transition-colors hover:text-glowColor"
          >
            Resend
          </Link>
        </>
      }
    >
      <Form
        form={form}
        name="verify-otp"
        onFinish={onFinish}
        layout="vertical"
        autoComplete="off"
        requiredMark={false}
      >
        <CustomInput
          name="otp"
          label="Verification code"
          placeholder="123456"
          icon={<SafetyOutlined />}
          maxLength={6}
          tone="dark"
          inputClassName="tracking-[0.4em]"
          rules={[
            { required: true, message: "Please enter OTP!" },
            { len: 6, message: "OTP must be 6 digits!" },
            {
              pattern: /^\d{6}$/,
              message: "OTP must contain only numbers!",
            },
          ]}
        />

        <Form.Item className="!mb-0 !mt-2">
          <AuthSubmitButton loading={loading} loadingLabel="Verifying…">
            Verify code
          </AuthSubmitButton>
        </Form.Item>
      </Form>
    </AuthFormCard>
  );
};

export default VerifyOtp;
