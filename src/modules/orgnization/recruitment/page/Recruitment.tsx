"use client";
import React from "react";
import { Card, Row, Col, Table, Button, Tag, Progress, Avatar, Space } from "antd";
import {
  UserAddOutlined,
  TeamOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
  RobotOutlined,
  UserOutlined,
  PlusOutlined,
} from "@ant-design/icons";

const Recruitment: React.FC = () => {
  const stats = [
    {
      title: "Open Positions",
      value: "23",
      icon: <FileTextOutlined className="text-3xl text-blue-600" />,
      bgColor: "bg-blue-50",
    },
    {
      title: "Applications",
      value: "156",
      icon: <TeamOutlined className="text-3xl text-purple-600" />,
      bgColor: "bg-purple-50",
    },
    {
      title: "In Process",
      value: "42",
      icon: <ClockCircleOutlined className="text-3xl text-orange-600" />,
      bgColor: "bg-orange-50",
    },
    {
      title: "Hired This Month",
      value: "8",
      icon: <CheckCircleOutlined className="text-3xl text-green-600" />,
      bgColor: "bg-green-50",
    },
  ];

  const jobColumns = [
    {
      title: "Job Title",
      dataIndex: "title",
      key: "title",
      render: (text: string) => (
        <span className="font-semibold text-gray-800">{text}</span>
      ),
    },
    {
      title: "Department",
      dataIndex: "department",
      key: "department",
      render: (dept: string) => <Tag color="blue">{dept}</Tag>,
    },
    {
      title: "Applications",
      dataIndex: "applications",
      key: "applications",
      render: (count: number) => (
        <span className="font-medium text-gray-700">{count}</span>
      ),
    },
    {
      title: "AI Screening",
      dataIndex: "aiScreened",
      key: "aiScreened",
      render: (screened: number, record: any) => (
        <div>
          <Progress
            percent={(screened / record.applications) * 100}
            size="small"
            format={() => `${screened}/${record.applications}`}
          />
        </div>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Tag
          color={
            status === "Active" ? "green" : status === "Closed" ? "red" : "orange"
          }
        >
          {status}
        </Tag>
      ),
    },
    {
      title: "Action",
      key: "action",
      render: () => (
        <Button type="primary" size="small" className="bg-blue-600">
          View Details
        </Button>
      ),
    },
  ];

  const jobData = [
    {
      key: "1",
      title: "Senior Software Engineer",
      department: "Engineering",
      applications: 45,
      aiScreened: 32,
      status: "Active",
    },
    {
      key: "2",
      title: "Marketing Manager",
      department: "Marketing",
      applications: 28,
      aiScreened: 20,
      status: "Active",
    },
    {
      key: "3",
      title: "Sales Executive",
      department: "Sales",
      applications: 38,
      aiScreened: 30,
      status: "Active",
    },
    {
      key: "4",
      title: "Product Designer",
      department: "Design",
      applications: 22,
      aiScreened: 18,
      status: "Active",
    },
  ];

  const candidateColumns = [
    {
      title: "Candidate",
      dataIndex: "name",
      key: "name",
      render: (text: string, record: any) => (
        <div className="flex items-center space-x-3">
          <Avatar size={40} icon={<UserOutlined />} />
          <div>
            <p className="font-semibold text-gray-800">{text}</p>
            <p className="text-xs text-gray-500">{record.email}</p>
          </div>
        </div>
      ),
    },
    {
      title: "Position",
      dataIndex: "position",
      key: "position",
    },
    {
      title: "AI Score",
      dataIndex: "aiScore",
      key: "aiScore",
      render: (score: number) => (
        <div className="flex items-center space-x-2">
          <Progress
            type="circle"
            percent={score}
            size={40}
            strokeColor={score >= 80 ? "#10b981" : score >= 60 ? "#f59e0b" : "#ef4444"}
          />
          <span className="font-semibold text-gray-700">{score}%</span>
        </div>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Tag
          color={
            status === "Interview Scheduled"
              ? "blue"
              : status === "Screening"
                ? "orange"
                : "green"
          }
        >
          {status}
        </Tag>
      ),
    },
    {
      title: "Action",
      key: "action",
      render: () => (
        <Space>
          <Button type="primary" size="small" className="bg-green-600">
            Shortlist
          </Button>
          <Button type="default" size="small">
            View Resume
          </Button>
        </Space>
      ),
    },
  ];

  const candidateData = [
    {
      key: "1",
      name: "Alice Johnson",
      email: "alice.j@email.com",
      position: "Senior Software Engineer",
      aiScore: 92,
      status: "Interview Scheduled",
    },
    {
      key: "2",
      name: "Bob Smith",
      email: "bob.s@email.com",
      position: "Marketing Manager",
      aiScore: 85,
      status: "Screening",
    },
    {
      key: "3",
      name: "Carol White",
      email: "carol.w@email.com",
      position: "Sales Executive",
      aiScore: 78,
      status: "Screening",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Recruitment & ATS
          </h1>
          <p className="text-gray-600 mt-1">
            AI-powered applicant tracking system
          </p>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          size="large"
          className="bg-blue-600 hover:bg-blue-700"
        >
          Post New Job
        </Button>
      </div>

      {/* Stats Cards */}
      <Row gutter={[16, 16]}>
        {stats.map((stat, index) => (
          <Col xs={24} sm={12} lg={6} key={index}>
            <Card className="hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm mb-1">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-800">{stat.value}</p>
                </div>
                <div className={`${stat.bgColor} p-3 rounded-lg`}>
                  {stat.icon}
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* AI Assistant Card */}
      <Card className="bg-linear-to-r from-purple-50 to-blue-50 border-purple-200">
        <div className="flex items-center space-x-4">
          <div className="bg-purple-100 p-4 rounded-full">
            <RobotOutlined className="text-3xl text-purple-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-800 mb-1">
              AI-Powered Resume Screening
            </h3>
            <p className="text-gray-600 text-sm">
              Our AI has automatically screened 80 resumes and shortlisted 15 top
              candidates based on job requirements.
            </p>
          </div>
          <Button type="primary" className="bg-purple-600 hover:bg-purple-700">
            View Results
          </Button>
        </div>
      </Card>

      {/* Open Positions Table */}
      <Card title={<span className="text-lg font-semibold">Open Positions</span>}>
        <Table
          columns={jobColumns}
          dataSource={jobData}
          pagination={false}
          scroll={{ x: 1000 }}
        />
      </Card>

      {/* Top Candidates */}
      <Card
        title={
          <span className="text-lg font-semibold">Top AI-Matched Candidates</span>
        }
      >
        <Table
          columns={candidateColumns}
          dataSource={candidateData}
          pagination={false}
          scroll={{ x: 1000 }}
        />
      </Card>
    </div>
  );
};

export default Recruitment;
