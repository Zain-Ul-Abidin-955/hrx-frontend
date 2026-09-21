"use client";
import React from "react";
import { Modal } from "antd";
import { LogoutOutlined, ExclamationCircleOutlined } from "@ant-design/icons";

interface MyModalProps {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
  subDescription?: React.ReactNode;
  okText?: string;
  cancelText?: string;
  okIcon?: React.ReactNode;
  confirmLoading?: boolean;
  danger?: boolean;
}

const MyModal: React.FC<MyModalProps> = ({
  open,
  onConfirm,
  onCancel,
  title = "Confirm Logout",
  description = "Are you sure you want to perform this action?",
  subDescription = "You will be redirected to the login page and all your session data will be cleared.",
  okText = "Logout",
  cancelText = "Cancel",
  okIcon = <LogoutOutlined />,
  confirmLoading = false,
  danger = false,
}) => {
  return (
    <Modal
      title={
        <div className="flex items-start gap-3 pr-6">
          <span
            className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
              danger
                ? "bg-rose-50 text-rose-600"
                : "bg-accentColor/10 text-accentDeepColor"
            }`}
          >
            <ExclamationCircleOutlined />
          </span>
          <div>
            <p className="text-base font-semibold text-blackColor">{title}</p>
            <p className="mt-0.5 text-xs font-normal text-grayColor">
              Please review the details before continuing.
            </p>
          </div>
        </div>
      }
      open={open}
      onOk={onConfirm}
      onCancel={onCancel}
      okText={okText}
      cancelText={cancelText}
      confirmLoading={confirmLoading}
      okButtonProps={{
        danger,
        icon: okIcon,
      }}
      centered
    >
      <div className="py-4">
        <p className="text-sm leading-6 text-secondaryTextColor">{description}</p>
        {subDescription && (
          <p className="mt-3 rounded-xl border border-[#ECEEF3] bg-[#F7F8FB] px-4 py-3 text-xs text-grayColor">
            {subDescription}
          </p>
        )}
      </div>
    </Modal>
  );
};

export default MyModal;
