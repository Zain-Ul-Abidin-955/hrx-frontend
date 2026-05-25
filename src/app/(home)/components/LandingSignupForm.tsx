"use client";

import React from "react";
import { Form, Input, Button, message } from "antd";
import {
  BankOutlined,
  MailOutlined,
  GlobalOutlined,
} from "@ant-design/icons";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { createOrganization } from "@/api/collection/organizations";
import type { CreateOrganizationPayload } from "@/types/organization";

interface LandingSignupFormProps {
  id?: string;
  className?: string;
}

const LandingSignupForm: React.FC<LandingSignupFormProps> = ({
  id = "landing-signup",
  className = "",
}) => {
  const [form] = Form.useForm<CreateOrganizationPayload>();
  const router = useRouter();
  const { mutate: createOrg, isPending } = useMutation({
    mutationFn: (payload: CreateOrganizationPayload) =>
      createOrganization(payload),
  });

  const onFinish = (values: CreateOrganizationPayload) => {
    createOrg(
      {
        org_name: values.org_name,
        email: values.email,
        description: values.description ?? "",
        website: values.website ?? "",
      },
      {
        onSuccess: () => {
          // localStorage.setItem("signupEmail", values.email);
          // localStorage.setItem(
          //   "signupOrgData",
          //   JSON.stringify({
          //     org_name: values.org_name,
          //     email: values.email,
          //     description: values.description ?? "",
          //     website: values.website ?? "",
          //   }),
          // );
          message.success("Application submitted successfully!");
          // router.push("/verify-otp");
        },
        onError: (error) => {
          const errorMessage = isAxiosError(error)
            ? (error.response?.data as { message?: string })?.message ||
              "Failed to create account. Please try again."
            : "Failed to create account. Please try again.";
          message.error(errorMessage);
        },
      },
    );
  };

  return (
    <div
      id={id}
      className={`bg-whiteColor rounded-2xl p-8 shadow-xl border border-grayLightColor/40 ${className}`}
    >
      <div className="mb-6 text-center">
        <h3 className="text-2xl font-bold text-primaryColor mb-2">
          Create Account
        </h3>
        <p className="text-grayColor">Start using HRX AI today</p>
      </div>

      <Form
        form={form}
        name="landing-signup"
        onFinish={onFinish}
        layout="vertical"
        autoComplete="off"
        className="space-y-1"
      >
        <Form.Item
          label={
            <span className="text-secondaryTextColor font-medium">
              Organization Name
            </span>
          }
          name="org_name"
          rules={[
            { required: true, message: "Please enter your organization name!" },
          ]}
        >
          <Input
            prefix={<BankOutlined className="text-darkGrayColor" />}
            placeholder="Enter organization name"
            size="large"
            className="rounded-lg"
          />
        </Form.Item>

        <Form.Item
          label={
            <span className="text-secondaryTextColor font-medium">Email</span>
          }
          name="email"
          rules={[
            { required: true, message: "Please enter your email!" },
            { type: "email", message: "Please enter a valid email!" },
          ]}
        >
          <Input
            prefix={<MailOutlined className="text-darkGrayColor" />}
            placeholder="user@example.com"
            size="large"
            className="rounded-lg"
          />
        </Form.Item>

        <Form.Item
          label={
            <span className="text-secondaryTextColor font-medium">
              Description
            </span>
          }
          name="description"
        >
          <Input.TextArea
            placeholder="Brief description of your organization"
            rows={3}
            className="rounded-lg"
          />
        </Form.Item>

        <Form.Item
          label={
            <span className="text-secondaryTextColor font-medium">Website</span>
          }
          name="website"
          rules={[
            { type: "url", message: "Please enter a valid website URL!" },
          ]}
        >
          <Input
            prefix={<GlobalOutlined className="text-darkGrayColor" />}
            placeholder="https://example.com"
            size="large"
            className="rounded-lg"
          />
        </Form.Item>

        <Form.Item className="mb-0 mt-4">
          <Button
            type="primary"
            htmlType="submit"
            size="large"
            loading={isPending}
            block
            className="!bg-primaryColor !border-primaryColor hover:!bg-primaryColor/90 rounded-lg h-12 font-medium"
          >
            {isPending ? "Creating account..." : "Create Account"}
          </Button>
        </Form.Item>
      </Form>

      <div className="mt-5 text-center">
        <p className="text-grayColor text-sm">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-primaryColor hover:text-blueColor font-medium"
          >
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LandingSignupForm;
