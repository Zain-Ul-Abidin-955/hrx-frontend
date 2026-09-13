"use client";

import React, { useState } from "react";
import { Form, message } from "antd";
import {
  BankOutlined,
  MailOutlined,
  GlobalOutlined,
  CheckOutlined,
  LoadingOutlined,
  ArrowRightOutlined,
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
  /** Rendered after a successful submission, e.g. a dialog close button. */
  onDone?: () => void;
}

const LandingSignupForm: React.FC<LandingSignupFormProps> = ({
  id = "landing-signup",
  className = "",
  onDone,
}) => {
  const [form] = Form.useForm<CreateOrganizationPayload>();
  const [submitted, setSubmitted] = useState(false);

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
          form.resetFields();
          setSubmitted(true);
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

  if (submitted) {
    return (
      <div id={id} className={`px-7 py-12 text-center ${className}`}>
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-accentColor to-glowColor">
          <CheckOutlined className="text-xl text-white" />
        </div>
        <h3 className="mb-2 text-xl font-semibold text-lightColor">
          Request received
        </h3>
        <p className="mx-auto mb-7 max-w-xs text-sm leading-relaxed text-mutedColor">
          We&apos;ve got your details. Our team will review the workspace and
          email you the setup link shortly.
        </p>
        <button
          type="button"
          onClick={onDone}
          className="rounded-lg bg-lightColor px-5 py-2.5 text-sm font-medium text-nightColor transition-colors hover:bg-white"
        >
          Done
        </button>
      </div>
    );
  }

  return (
    <div id={id} className={`px-7 pb-7 pt-8 ${className}`}>
      <div className="mb-6">
        <h3 className="text-xl font-semibold tracking-tight text-lightColor">
          Create your workspace
        </h3>
        <p className="mt-1.5 text-sm text-mutedColor">
          Tell us about your organization and we&apos;ll get HRX ready for your
          team.
        </p>
      </div>

      <Form
        form={form}
        name="landing-signup"
        onFinish={onFinish}
        layout="vertical"
        autoComplete="off"
        requiredMark={false}
      >
        <CustomInput
          name="org_name"
          label="Organization name"
          placeholder="Acme Inc."
          icon={<BankOutlined />}
          tone="dark"
        />

        <CustomInput
          name="email"
          label="Work email"
          type="email"
          placeholder="you@company.com"
          icon={<MailOutlined />}
          tone="dark"
        />

        <CustomInput
          name="website"
          label="Website"
          type="url"
          placeholder="https://company.com"
          icon={<GlobalOutlined />}
          required={false}
          tone="dark"
        />

        <CustomInput
          name="description"
          label="What does your team do?"
          type="textarea"
          placeholder="A short description of your organization"
          required={false}
          rows={3}
          tone="dark"
        />

        <Form.Item className="!mb-0 !mt-1">
          <button
            type="submit"
            disabled={isPending}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-accentColor text-sm font-medium text-white transition-colors hover:bg-accentDeepColor disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isPending ? (
              <>
                <LoadingOutlined />
                Creating workspace…
              </>
            ) : (
              <>
                Create workspace
                <ArrowRightOutlined className="text-xs" />
              </>
            )}
          </button>
        </Form.Item>
      </Form>

      <p className="mt-5 text-center text-sm text-mutedColor">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-medium text-accentColor transition-colors hover:text-glowColor"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
};

export default LandingSignupForm;
