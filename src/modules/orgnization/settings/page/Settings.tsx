"use client";
import React from "react";
import { Card, Form, Input, Button, Switch, Select, Row, Col } from "antd";
import {
  SettingOutlined,
  UserOutlined,
  BellOutlined,
  SafetyOutlined,
  TeamOutlined,
} from "@ant-design/icons";

const Settings: React.FC = () => {
  const [form] = Form.useForm();

  const onFinish = (values: any) => {
    console.log("Settings saved:", values);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Settings</h1>
        <p className="text-gray-600 mt-1">
          Manage your organization preferences and configurations
        </p>
      </div>

      <Row gutter={[16, 16]}>
        {/* Organization Settings */}
        <Col xs={24} lg={12}>
          <Card
            title={
              <div className="flex items-center space-x-2">
                <TeamOutlined className="text-blue-600" />
                <span>Organization Settings</span>
              </div>
            }
          >
            <Form form={form} layout="vertical" onFinish={onFinish}>
              <Form.Item
                label="Organization Name"
                name="orgName"
                initialValue="My Company"
              >
                <Input size="large" placeholder="Enter organization name" />
              </Form.Item>

              <Form.Item
                label="Industry"
                name="industry"
                initialValue="technology"
              >
                <Select
                  size="large"
                  options={[
                    { value: "technology", label: "Technology" },
                    { value: "healthcare", label: "Healthcare" },
                    { value: "finance", label: "Finance" },
                    { value: "education", label: "Education" },
                    { value: "retail", label: "Retail" },
                  ]}
                />
              </Form.Item>

              <Form.Item
                label="Company Size"
                name="companySize"
                initialValue="51-200"
              >
                <Select
                  size="large"
                  options={[
                    { value: "1-10", label: "1-10 employees" },
                    { value: "11-50", label: "11-50 employees" },
                    { value: "51-200", label: "51-200 employees" },
                    { value: "201-500", label: "201-500 employees" },
                    { value: "500+", label: "500+ employees" },
                  ]}
                />
              </Form.Item>

              <Form.Item label="Time Zone" name="timezone" initialValue="pst">
                <Select
                  size="large"
                  options={[
                    { value: "pst", label: "Pacific Time (PST)" },
                    { value: "est", label: "Eastern Time (EST)" },
                    { value: "cst", label: "Central Time (CST)" },
                    { value: "gmt", label: "GMT" },
                  ]}
                />
              </Form.Item>
            </Form>
          </Card>
        </Col>

        {/* Notification Settings */}
        <Col xs={24} lg={12}>
          <Card
            title={
              <div className="flex items-center space-x-2">
                <BellOutlined className="text-blue-600" />
                <span>Notification Settings</span>
              </div>
            }
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <div>
                  <p className="font-medium text-gray-800">
                    Leave Request Notifications
                  </p>
                  <p className="text-sm text-gray-500">
                    Get notified when employees request leave
                  </p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <div>
                  <p className="font-medium text-gray-800">
                    Attendance Alerts
                  </p>
                  <p className="text-sm text-gray-500">
                    Alerts for absences and late arrivals
                  </p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <div>
                  <p className="font-medium text-gray-800">
                    New Application Alerts
                  </p>
                  <p className="text-sm text-gray-500">
                    Notify when new candidates apply
                  </p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <div>
                  <p className="font-medium text-gray-800">Email Notifications</p>
                  <p className="text-sm text-gray-500">
                    Receive notifications via email
                  </p>
                </div>
                <Switch />
              </div>

              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="font-medium text-gray-800">AI Insights</p>
                  <p className="text-sm text-gray-500">
                    Get AI-powered workforce insights
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
            </div>
          </Card>
        </Col>

        {/* Security Settings */}
        <Col xs={24} lg={12}>
          <Card
            title={
              <div className="flex items-center space-x-2">
                <SafetyOutlined className="text-blue-600" />
                <span>Security Settings</span>
              </div>
            }
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <div>
                  <p className="font-medium text-gray-800">
                    Two-Factor Authentication
                  </p>
                  <p className="text-sm text-gray-500">
                    Add extra security to your account
                  </p>
                </div>
                <Switch />
              </div>

              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <div>
                  <p className="font-medium text-gray-800">Session Timeout</p>
                  <p className="text-sm text-gray-500">
                    Auto logout after 30 minutes of inactivity
                  </p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="font-medium text-gray-800">Activity Logging</p>
                  <p className="text-sm text-gray-500">
                    Track all user activities and changes
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
            </div>

            <div className="mt-6">
              <Button danger block size="large">
                Change Password
              </Button>
            </div>
          </Card>
        </Col>

        {/* AI Settings */}
        <Col xs={24} lg={12}>
          <Card
            title={
              <div className="flex items-center space-x-2">
                <SettingOutlined className="text-blue-600" />
                <span>AI Assistant Settings</span>
              </div>
            }
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <div>
                  <p className="font-medium text-gray-800">
                    AI Assistant Enabled
                  </p>
                  <p className="text-sm text-gray-500">
                    Enable AI-powered HR assistant
                  </p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <div>
                  <p className="font-medium text-gray-800">Auto-Screening</p>
                  <p className="text-sm text-gray-500">
                    Automatically screen applications with AI
                  </p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="font-medium text-gray-800">
                    Smart Recommendations
                  </p>
                  <p className="text-sm text-gray-500">
                    Get AI-powered hiring recommendations
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          type="primary"
          size="large"
          className="bg-blue-600 hover:bg-blue-700 px-8"
        >
          Save All Settings
        </Button>
      </div>
    </div>
  );
};

export default Settings;
