"use client";

import React, { useState, forwardRef } from "react";
import { Form } from "antd";
import type { Rule } from "antd/es/form";
import { EyeInvisibleOutlined, EyeOutlined } from "@ant-design/icons";

type InputType = "text" | "email" | "password" | "url" | "textarea";
type Tone = "light" | "dark";

export interface CustomInputProps {
  name: string;
  label?: React.ReactNode;
  placeholder?: string;
  type?: InputType;
  icon?: React.ReactNode;
  className?: string;
  inputClassName?: string;
  required?: boolean;
  rules?: Rule[];
  rows?: number;
  disabled?: boolean;
  dependencies?: string[];
  hasFeedback?: boolean;
  maxLength?: number;
  /** When false, password skips complexity checks (e.g. login). Default true. */
  strengthCheck?: boolean;
  /** Surface the field sits on. "dark" is used by the landing page. */
  tone?: Tone;
}

interface FieldProps {
  value?: string;
  onChange?: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => void;
  onBlur?: (
    e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => void;
  id?: string;
  placeholder?: string;
  disabled?: boolean;
  icon?: React.ReactNode;
  inputClassName?: string;
  type?: InputType;
  rows?: number;
  maxLength?: number;
  tone?: Tone;
}

const baseInputClass =
  "w-full h-11 rounded-lg border outline-none transition-colors disabled:opacity-60 disabled:cursor-not-allowed";

const TONE_INPUT_CLASS: Record<Tone, string> = {
  light:
    "bg-offWhiteColor border-grayLightColor/50 text-secondaryTextColor placeholder:text-darkGrayColor focus:border-primaryColor focus:ring-1 focus:ring-primaryColor/20",
  dark:
    "bg-nightSoftColor border-lineColor text-lightColor placeholder:text-mutedColor/60 focus:border-accentColor focus:ring-2 focus:ring-accentColor/25",
};

const TONE_ICON_CLASS: Record<Tone, string> = {
  light: "text-darkGrayColor",
  dark: "text-mutedColor",
};

const TONE_LABEL_CLASS: Record<Tone, string> = {
  light: "text-secondaryTextColor",
  dark: "text-lightColor/80",
};

const EMAIL_MAX_LENGTH = 254;
const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_MAX_LENGTH = 128;

const EMAIL_PATTERN =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z]{2,})+$/;

const PASSWORD_PATTERN =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9\s])\S+$/;

function getDefaultRules(
  type: InputType,
  required: boolean,
  label?: React.ReactNode,
  strengthCheck = true,
): Rule[] {
  const fieldLabel =
    typeof label === "string" ? label.toLowerCase() : "this field";
  const rules: Rule[] = [];

  if (required) {
    rules.push({
      required: true,
      message: `Please enter your ${fieldLabel}!`,
    });
  }

  if (type === "email") {
    rules.push(
      {
        max: EMAIL_MAX_LENGTH,
        message: `Email must be at most ${EMAIL_MAX_LENGTH} characters!`,
      },
      {
        pattern: EMAIL_PATTERN,
        message: "Please enter a valid email (e.g. name@example.com)!",
      },
    );
  }

  if (type === "password") {
    if (strengthCheck) {
      rules.push(
        {
          min: PASSWORD_MIN_LENGTH,
          message: `Password must be at least ${PASSWORD_MIN_LENGTH} characters!`,
        },
        {
          max: PASSWORD_MAX_LENGTH,
          message: `Password must be at most ${PASSWORD_MAX_LENGTH} characters!`,
        },
        {
          pattern: /^\S+$/,
          message: "Password must not contain spaces!",
        },
        {
          pattern: PASSWORD_PATTERN,
          message:
            "Password must include uppercase, lowercase, number, and special character!",
        },
      );
    }
  }

  if (type === "url") {
    rules.push({ type: "url", message: "Please enter a valid website URL!" });
  }

  return rules;
}

const TextAreaField = forwardRef<HTMLTextAreaElement, FieldProps>(
  function TextAreaField(
    {
      value,
      onChange,
      onBlur,
      id,
      placeholder,
      disabled,
      inputClassName = "",
      rows = 3,
      maxLength,
      tone = "light",
    },
    ref,
  ) {
    return (
      <textarea
        ref={ref}
        id={id}
        value={value ?? ""}
        onChange={onChange}
        onBlur={onBlur}
        placeholder={placeholder}
        disabled={disabled}
        rows={rows}
        maxLength={maxLength}
        className={`${baseInputClass} ${TONE_INPUT_CLASS[tone]} h-auto py-2.5 px-3 resize-none ${inputClassName}`}
      />
    );
  },
);

const InputField = forwardRef<HTMLInputElement, FieldProps>(function InputField(
  {
    value,
    onChange,
    onBlur,
    id,
    placeholder,
    disabled,
    icon,
    inputClassName = "",
    type = "text",
    maxLength,
    tone = "light",
  },
  ref,
) {
  const [showPassword, setShowPassword] = useState(false);
  const paddingLeft = icon ? "pl-10" : "pl-3";
  const paddingRight = type === "password" ? "pr-10" : "pr-3";

  const htmlType =
    type === "password"
      ? showPassword
        ? "text"
        : "password"
      : type === "email"
        ? "email"
        : type === "url"
          ? "url"
          : "text";

  return (
    <div className="relative w-full">
      {icon && (
        <span
          className={`absolute left-3 top-1/2 -translate-y-1/2 ${TONE_ICON_CLASS[tone]} pointer-events-none z-10`}
        >
          {icon}
        </span>
      )}
      <input
        ref={ref}
        id={id}
        type={htmlType}
        value={value ?? ""}
        onChange={onChange}
        onBlur={onBlur}
        placeholder={placeholder}
        disabled={disabled}
        maxLength={maxLength}
        className={`${baseInputClass} ${TONE_INPUT_CLASS[tone]} ${paddingLeft} ${paddingRight} ${inputClassName}`}
      />
      {type === "password" && (
        <button
          type="button"
          tabIndex={-1}
          onClick={() => setShowPassword((prev) => !prev)}
          className={`absolute right-3 top-1/2 -translate-y-1/2 ${TONE_ICON_CLASS[tone]} ${
            tone === "dark" ? "hover:text-lightColor" : "hover:text-secondaryTextColor"
          }`}
          aria-label={showPassword ? "Hide password" : "Show password"}
        >
          {showPassword ? <EyeInvisibleOutlined /> : <EyeOutlined />}
        </button>
      )}
    </div>
  );
});

const CustomInput: React.FC<CustomInputProps> = ({
  name,
  label,
  placeholder,
  type = "text",
  icon,
  className = "",
  inputClassName = "",
  required = true,
  rules,
  rows = 3,
  disabled = false,
  dependencies,
  hasFeedback,
  maxLength,
  strengthCheck = true,
  tone = "light",
}) => {
  const mergedRules =
    rules ?? getDefaultRules(type, required, label, strengthCheck);

  const resolvedMaxLength =
    maxLength ??
    (type === "email"
      ? EMAIL_MAX_LENGTH
      : type === "password"
        ? PASSWORD_MAX_LENGTH
        : undefined);

  return (
    <Form.Item
      name={name}
      label={
        label ? (
          <span className={`${TONE_LABEL_CLASS[tone]} font-medium`}>{label}</span>
        ) : undefined
      }
      rules={mergedRules}
      className={className}
      dependencies={dependencies}
      hasFeedback={hasFeedback}
    >
      {type === "textarea" ? (
        <TextAreaField
          placeholder={placeholder}
          disabled={disabled}
          inputClassName={inputClassName}
          rows={rows}
          maxLength={resolvedMaxLength}
          tone={tone}
        />
      ) : (
        <InputField
          type={type}
          icon={icon}
          placeholder={placeholder}
          disabled={disabled}
          inputClassName={inputClassName}
          maxLength={resolvedMaxLength}
          tone={tone}
        />
      )}
    </Form.Item>
  );
};

export default CustomInput;
