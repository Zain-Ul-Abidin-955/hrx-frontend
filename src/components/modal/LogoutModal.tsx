"use client";
import React from "react";
import { Modal } from "antd";
import { LogoutOutlined, ExclamationCircleOutlined } from "@ant-design/icons";

interface LogoutModalProps {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const LogoutModal: React.FC<LogoutModalProps> = ({
  open,
  onConfirm,
  onCancel,
}) => {
  return (
    <Modal
      title={
        <div className="flex items-center space-x-2">
          <ExclamationCircleOutlined className="text-orange-500 text-xl" />
          <span>Confirm Logout</span>
        </div>
      }
      open={open}
      onOk={onConfirm}
      onCancel={onCancel}
      okText="Logout"
      cancelText="Cancel"
      okButtonProps={{
        danger: true,
        size: "large",
        icon: <LogoutOutlined />,
      }}
      cancelButtonProps={{
        size: "large",
      }}
      centered
    >
      <div className="py-4">
        <p className="text-gray-700 text-base">
          Are you sure you want to logout?
        </p>
        <p className="text-gray-500 text-sm mt-2">
          You will be redirected to the login page and all your session data will be cleared.
        </p>
      </div>
    </Modal>
  );
};

export default LogoutModal;
