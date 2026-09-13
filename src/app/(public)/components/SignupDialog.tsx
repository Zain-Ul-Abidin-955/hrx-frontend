"use client";

import React from "react";
import { Modal } from "antd";
import LandingSignupForm from "./LandingSignupForm";

interface SignupDialogProps {
  open: boolean;
  onClose: () => void;
}

const SignupDialog: React.FC<SignupDialogProps> = ({ open, onClose }) => {
  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      centered
      width={460}
      destroyOnHidden
      className="hrx-modal hrx-dark"
      styles={{
        mask: { backgroundColor: "rgba(4, 5, 8, 0.82)", backdropFilter: "blur(4px)" },
      }}
    >
      <LandingSignupForm onDone={onClose} />
    </Modal>
  );
};

export default SignupDialog;
