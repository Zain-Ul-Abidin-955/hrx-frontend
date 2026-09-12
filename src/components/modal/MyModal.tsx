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
        <div className="flex items-center space-x-2">
          <ExclamationCircleOutlined className="text-orange-500 text-xl" />
          <span>{title}</span>
        </div>
      }
      open={open}
      onOk={onConfirm}
      onCancel={onCancel}
      okText={okText}
      cancelText={cancelText}
      confirmLoading={confirmLoading}
      okButtonProps={{
        size: "large",
        danger,
        icon: okIcon,
        className: danger
          ? undefined
          : "!bg-primaryColor !text-white !border-primaryColor hover:!bg-primaryColor/90",
      }}
      cancelButtonProps={{
        size: "large",
      }}
      centered
    >
      <div className="py-4">
        <p className="text-gray-700 text-base">{description}</p>
        {subDescription && (
          <p className="text-gray-500 text-sm mt-2">{subDescription}</p>
        )}
      </div>
    </Modal>
  );
};

export default MyModal;
