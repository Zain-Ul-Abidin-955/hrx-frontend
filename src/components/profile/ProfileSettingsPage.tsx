"use client";

import React from "react";
import { Avatar, Button, Form, Input, message } from "antd";
import { IdcardOutlined, MailOutlined, SaveOutlined, UserOutlined } from "@ant-design/icons";
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
  const roleLabel = user?.role
    ? user.role.replace(/_/g, " ").replace(/\b\w/g, (letter: string) => letter.toUpperCase())
    : "User";

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
    <div className="w-full space-y-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-blackColor">Profile</h1>
        <p className="mt-1 text-sm text-grayColor">Manage your identity and account information.</p>
      </div>

      <div className="grid gap-4 xl:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="hrx-card flex flex-col items-center px-6 py-8 text-center">
          <Avatar
            size={72}
            className="!bg-accentColor/10 !text-xl !font-semibold !text-accentDeepColor"
          >
            {avatarInitial}
          </Avatar>
          <p className="mt-4 text-base font-semibold text-blackColor">{userName || "Your profile"}</p>
          <p className="mt-1 text-xs text-darkGrayColor">{roleLabel}</p>
          <div className="mt-6 w-full border-t border-[#ECEEF3] pt-5">
            <div className="flex items-center gap-2 text-left text-xs text-grayColor">
              <MailOutlined className="shrink-0 text-darkGrayColor" />
              <span className="truncate">{userEmail || "No email available"}</span>
            </div>
          </div>
        </aside>

        <section className="hrx-card p-5 sm:p-6">
          <div className="mb-5 flex items-center gap-2.5 border-b border-[#ECEEF3] pb-4">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accentColor/10 text-accentDeepColor"><IdcardOutlined /></span>
            <div>
              <h2 className="text-sm font-semibold text-blackColor">Account details</h2>
              <p className="mt-0.5 text-xs text-grayColor">Keep your display name accurate across HRX.</p>
            </div>
          </div>
          <Form
            form={form}
            layout="vertical"
            requiredMark={false}
            onFinish={onFinish}
            initialValues={{ name: userName }}
          >
            <div className="grid gap-x-5 lg:grid-cols-2">
              <Form.Item
                label={<span className="font-medium text-secondaryTextColor">Name</span>}
                name="name"
                rules={[{ required: true, message: "Please enter your name" }]}
              >
                <Input size="large" prefix={<UserOutlined className="text-darkGrayColor" />} placeholder="Enter your name" />
              </Form.Item>

              <Form.Item label={<span className="font-medium text-secondaryTextColor">Email</span>}>
                <Input size="large" prefix={<MailOutlined className="text-darkGrayColor" />} value={userEmail} disabled />
              </Form.Item>
            </div>

            <div className="flex justify-end border-t border-[#ECEEF3] pt-5">
              <Button htmlType="submit" type="primary" icon={<SaveOutlined />} loading={isPending}>
                Save changes
              </Button>
            </div>
          </Form>
        </section>
      </div>
    </div>
  );
};

export default ProfileSettingsPage;
