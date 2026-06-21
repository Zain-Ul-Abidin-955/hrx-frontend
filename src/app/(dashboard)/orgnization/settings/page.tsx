"use client";
import React from "react";
import { Avatar, Button, Card, Form, Input, Upload, message } from "antd";
import { UploadOutlined, UserOutlined } from "@ant-design/icons";
import type { UploadChangeParam, UploadFile } from "antd/es/upload/interface";

const Settings: React.FC = () => {
  const [form] = Form.useForm();
  const [imageUrl, setImageUrl] = React.useState<string | null>(null);
  const [email, setEmail] = React.useState("admin@hrx.ai");

  React.useEffect(() => {
    const savedName = localStorage.getItem("adminName");
    const savedEmail = localStorage.getItem("userEmail");
    const savedImage = localStorage.getItem("adminProfileImage");

    if (savedName) {
      form.setFieldValue("name", savedName);
    }
    if (savedEmail) {
      setEmail(savedEmail);
    }
    if (savedImage) {
      setImageUrl(savedImage);
    }
  }, [form]);

  const handleImageChange = (info: UploadChangeParam<UploadFile>) => {
    const file = info.file.originFileObj;
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setImageUrl(result);
      localStorage.setItem("adminProfileImage", result);
    };
    reader.readAsDataURL(file);
  };

  const onFinish = (values: { name: string }) => {
    localStorage.setItem("adminName", values.name);
    message.success("Profile settings updated");
  };

  return (
    <div className="w-full min-h-[calc(100vh-140px)] space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Settings</h1>
        <p className="text-gray-600 mt-1">Manage your admin profile information</p>
      </div>

      <Card className="w-full min-h-[calc(100vh-260px)]">
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{ name: "Admin User" }}
          className="w-full max-w-4xl"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <Form.Item label="Profile Picture" className="lg:col-span-2 mb-0">
            <div className="flex items-center gap-4">
              <Avatar
                size={72}
                src={imageUrl || undefined}
                icon={!imageUrl ? <UserOutlined /> : undefined}
                className="bg-blue-500 shrink-0"
              />
              <Upload
                accept="image/*"
                maxCount={1}
                showUploadList={false}
                beforeUpload={() => false}
                onChange={handleImageChange}
              >
                <Button icon={<UploadOutlined />}>Upload Picture</Button>
              </Upload>
            </div>
            </Form.Item>

            <Form.Item
              label="Admin Name"
              name="name"
              className="mb-0"
              rules={[{ required: true, message: "Please enter admin name" }]}
            >
              <Input size="large" placeholder="Enter admin name" />
            </Form.Item>

            <Form.Item label="Current Login Email" className="mb-0">
              <Input size="large" value={email} disabled />
            </Form.Item>
          </div>

          <Form.Item className="mb-0 pt-5 flex justify-end">
            <Button
              htmlType="submit"
              type="primary"
              size="large"
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

export default Settings;
