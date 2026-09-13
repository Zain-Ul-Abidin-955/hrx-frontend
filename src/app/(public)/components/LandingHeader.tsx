"use client";

import React from "react";
import { Button } from "antd";
import { RobotOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";

const LandingHeader: React.FC = () => {
  const router = useRouter();

  return (
    <nav className="bg-whiteColor shadow-sm sticky top-0 z-50 border-b border-grayLightColor/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <button
            type="button"
            onClick={() => router.push("/")}
            className="flex items-center space-x-2 cursor-pointer"
          >
            <RobotOutlined className="text-3xl text-primaryColor" />
            <span className="text-2xl font-bold text-primaryColor">HRX AI</span>
          </button>

          <div className="flex items-center space-x-4">
            <Button
              type="text"
              size="large"
              onClick={() => router.push("/jobs")}
              className="!text-primaryColor"
            >
              Browse Jobs
            </Button>
            <Button
              type="default"
              size="large"
              onClick={() => router.push("/login")}
              className="hidden sm:inline-flex !border-primaryColor !text-primaryColor hover:!bg-primaryColor hover:!text-whiteColor"
            >
              Login
            </Button>
            <Button
              type="primary"
              size="large"
              onClick={() => {
                const signup = document.getElementById("landing-signup");
                if (signup) {
                  signup.scrollIntoView({ behavior: "smooth" });
                } else {
                  router.push("/#landing-signup");
                }
              }}
              className="!bg-primaryColor !border-primaryColor hover:!bg-primaryColor/90"
            >
              Get Started
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default LandingHeader;
