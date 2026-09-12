"use client";

import React from "react";
import { Form, Button, message } from "antd";
import {
  BankOutlined,
  MailOutlined,
  GlobalOutlined,
} from "@ant-design/icons";
import Link from "next/link";
import { useMutation } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { createOrganization } from "@/api/collection/organizations";
import type { CreateOrganizationPayload } from "@/types/organization";
import CustomInput from "@/components/input/CustomInput";

interface LandingSignupFormProps {
  id?: string;
  className?: string;
}

const LandingSignupForm: React.FC<LandingSignupFormProps> = ({
  id = "landing-signup",
  className = "",
}) => {
  const [form] = Form.useForm<CreateOrganizationPayload>();
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
          message.success("Application submitted successfully!");
          form.resetFields();
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
        requiredMark={false}
      >
        <CustomInput
          name="org_name"
          label="Organization Name"
          placeholder="Enter organization name"
          icon={<BankOutlined />}
        />

        <CustomInput
          name="email"
          label="Email"
          type="email"
          placeholder="user@example.com"
          icon={<MailOutlined />}
        />

        <CustomInput
          name="description"
          label="Description"
          type="textarea"
          placeholder="Brief description of your organization"
          required={false}
          rows={3}
        />

        <CustomInput
          name="website"
          label="Website"
          type="url"
          placeholder="https://example.com"
          icon={<GlobalOutlined />}
          required={false}
        />

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
