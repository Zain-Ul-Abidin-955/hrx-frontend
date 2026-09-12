"use client";

import React from "react";
import { Avatar, Button, Card, Form, Input, message } from "antd";
import { useMutation } from "@tanstack/react-query";
import { updateProfile } from "@/api/collection/profile";
import useUserStore from "@/store/userStore";
import { getNameInitial } from "@/utils/getNameInitial";
import {
  buildUpdateProfilePayload,
  getUserDisplayName,
} from "@/utils/profileHelpers";

const ProfileSettingsPage: React.FC = () => {
  const [form] = Form.useForm();
  const user = useUserStore((state) => state.user);
  const fetchProfile = useUserStore((state) => state.fetchProfile);

  const userName = getUserDisplayName(user);
  const userEmail = user?.email ?? "";
  const avatarInitial = getNameInitial(userName);

  React.useEffect(() => {
    if (!user) return;
    form.setFieldsValue({ name: userName });
  }, [form, user, userName]);

  const { mutate: saveProfile, isPending } = useMutation({
    mutationFn: async (fullName: string) => {
      return updateProfile(buildUpdateProfilePayload(fullName));
    },
    onSuccess: async () => {
      await fetchProfile();
      message.success("Profile updated successfully");
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      message.error(
        err?.response?.data?.message || err?.message || "Failed to update profile",
      );
    },
  });

  const onFinish = (values: { name: string }) => {
    saveProfile(values.name.trim());
  };

  return (
    <div className="w-full min-h-[calc(100vh-140px)] space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Profile</h1>
        <p className="text-gray-600 mt-1">Manage your profile information</p>
      </div>

      <Card className="w-full min-h-[calc(100vh-260px)]">
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{ name: userName }}
          className="w-full max-w-4xl"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* <Form.Item label="Profile" className="lg:col-span-2 mb-0">
              <div className="flex items-center gap-4">
                <Avatar
                  size={72}
                  className="!bg-primaryColor !text-white shrink-0 text-2xl font-semibold"
                >
                  {avatarInitial}
                </Avatar>
              </div>
            </Form.Item> */}

            <Form.Item
              label="Name"
              name="name"
              className="mb-0"
              // rules={[{ required: true, message: "Please enter your name" }]}
            >
              <Input size="large" placeholder="Enter your name" />
            </Form.Item>

            <Form.Item label="Email" className="mb-0">
              <Input size="large" value={userEmail} disabled />
            </Form.Item>
          </div>

          <Form.Item className="mb-0 pt-5 flex justify-end">
            <Button
              htmlType="submit"
              type="primary"
              size="large"
              loading={isPending}
              className="!bg-primaryColor border-0 px-8"
            >
              Save Profile
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default ProfileSettingsPage;
