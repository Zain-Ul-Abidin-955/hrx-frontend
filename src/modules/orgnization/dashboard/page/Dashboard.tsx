"use client";
import React from "react";
import { Card, Row, Col, Progress, Tag, Avatar, Button, Table } from "antd";
import {
  UserOutlined,
  TeamOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  RiseOutlined,
  FallOutlined,
  FileTextOutlined,
  TrophyOutlined,
} from "@ant-design/icons";

const Dashboard: React.FC = () => {
  // Stats data
  const statsCards = [
    {
      title: "Total Employees",
      value: "248",
      change: "+12%",
      changeType: "increase",
      icon: <TeamOutlined className="text-3xl" />,
      color: "bg-blue-500",
      bgLight: "bg-blue-50",
      textColor: "text-blue-600",
    },
    {
      title: "Present Today",
      value: "234",
      change: "94.4%",
      changeType: "increase",
      icon: <CheckCircleOutlined className="text-3xl" />,
      color: "bg-green-500",
      bgLight: "bg-green-50",
      textColor: "text-green-600",
    },
    {
      title: "On Leave",
      value: "14",
      change: "-3%",
      changeType: "decrease",
      icon: <CalendarOutlined className="text-3xl" />,
      color: "bg-orange-500",
      bgLight: "bg-orange-50",
      textColor: "text-orange-600",
    },
    {
      title: "New Hires",
      value: "8",
      change: "+25%",
      changeType: "increase",
      icon: <UserOutlined className="text-3xl" />,
      color: "bg-purple-500",
      bgLight: "bg-purple-50",
      textColor: "text-purple-600",
    },
  ];

  // Recent activities
  const recentActivities = [
    {
      id: 1,
      user: "John Doe",
      action: "submitted a leave request",
      time: "5 mins ago",
      type: "leave",
    },
    {
      id: 2,
      user: "Sarah Smith",
      action: "completed onboarding",
      time: "15 mins ago",
      type: "onboarding",
    },
    {
      id: 3,
      user: "Mike Johnson",
      action: "checked in at 9:00 AM",
      time: "1 hour ago",
      type: "attendance",
    },
    {
      id: 4,
      user: "Emma Wilson",
      action: "updated profile information",
      time: "2 hours ago",
      type: "profile",
    },
  ];

  // Leave requests table data
  const leaveRequestsColumns = [
    {
      title: "Employee",
      dataIndex: "employee",
      key: "employee",
      render: (text: string, record: any) => (
        <div className="flex items-center space-x-3">
          <Avatar icon={<UserOutlined />} />
          <div>
            <p className="font-medium text-gray-800">{text}</p>
            <p className="text-xs text-gray-500">{record.department}</p>
          </div>
        </div>
      ),
    },
    {
      title: "Leave Type",
      dataIndex: "leaveType",
      key: "leaveType",
      render: (type: string) => (
        <Tag
          color={
            type === "Sick" ? "red" : type === "Vacation" ? "blue" : "orange"
          }
        >
          {type}
        </Tag>
      ),
    },
    {
      title: "Duration",
      dataIndex: "duration",
      key: "duration",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Tag
          color={
            status === "Approved"
              ? "green"
              : status === "Pending"
              ? "orange"
              : "red"
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
        <div className="space-x-2">
          <Button type="primary" size="small" className="bg-green-500">
            Approve
          </Button>
          <Button danger size="small">
            Reject
          </Button>
        </div>
      ),
    },
  ];

  const leaveRequestsData = [
    {
      key: "1",
      employee: "Robert Fox",
      department: "Engineering",
      leaveType: "Vacation",
      duration: "Dec 20-25 (5 days)",
      status: "Pending",
    },
    {
      key: "2",
      employee: "Jane Cooper",
      department: "Marketing",
      leaveType: "Sick",
      duration: "Dec 18 (1 day)",
      status: "Approved",
    },
    {
      key: "3",
      employee: "Wade Warren",
      department: "Sales",
      leaveType: "Personal",
      duration: "Dec 22-23 (2 days)",
      status: "Pending",
    },
  ];

  // Department stats
  const departmentStats = [
    { name: "Engineering", employees: 85, percentage: 34 },
    { name: "Sales", employees: 62, percentage: 25 },
    { name: "Marketing", employees: 48, percentage: 19 },
    { name: "HR", employees: 28, percentage: 11 },
    { name: "Finance", employees: 25, percentage: 11 },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-linear-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">
          Welcome back, HR Manager! 👋
        </h1>
        <p className="text-blue-100 text-lg">
          Here's what's happening with your workforce today
        </p>
      </div>

      {/* Stats Cards */}
      <Row gutter={[16, 16]}>
        {statsCards.map((stat, index) => (
          <Col xs={24} sm={12} lg={6} key={index}>
            <Card className="hover:shadow-lg transition-shadow duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium mb-1">
                    {stat.title}
                  </p>
                  <h3 className="text-3xl font-bold text-gray-800 mb-2">
                    {stat.value}
                  </h3>
                  <div className="flex items-center space-x-1">
                    {stat.changeType === "increase" ? (
                      <RiseOutlined className="text-green-500" />
                    ) : (
                      <FallOutlined className="text-red-500" />
                    )}
                    <span
                      className={`text-sm font-medium ${
                        stat.changeType === "increase"
                          ? "text-green-500"
                          : "text-red-500"
                      }`}
                    >
                      {stat.change}
                    </span>
                    <span className="text-gray-400 text-xs">vs last month</span>
                  </div>
                </div>
                <div className={`${stat.bgLight} p-4 rounded-xl`}>
                  <div className={stat.textColor}>{stat.icon}</div>
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Main Content Grid */}
      <Row gutter={[16, 16]}>
        {/* Department Overview */}
        <Col xs={24} lg={12}>
          <Card
            title={
              <div className="flex items-center space-x-2">
                <TrophyOutlined className="text-blue-600" />
                <span>Department Overview</span>
              </div>
            }
            className="h-full"
          >
            <div className="space-y-4">
              {departmentStats.map((dept, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-700">
                      {dept.name}
                    </span>
                    <span className="text-gray-600 font-semibold">
                      {dept.employees} employees
                    </span>
                  </div>
                  <Progress
                    percent={dept.percentage}
                    strokeColor={{
                      "0%": "#3b82f6",
                      "100%": "#8b5cf6",
                    }}
                    showInfo={false}
                  />
                </div>
              ))}
            </div>
          </Card>
        </Col>

        {/* Recent Activities */}
        <Col xs={24} lg={12}>
          <Card
            title={
              <div className="flex items-center space-x-2">
                <ClockCircleOutlined className="text-blue-600" />
                <span>Recent Activities</span>
              </div>
            }
            className="h-full"
          >
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <Avatar
                    icon={<UserOutlined />}
                    className="bg-blue-500 shrink-0"
                  />
                  <div className="flex-1">
                    <p className="text-sm">
                      <span className="font-semibold text-gray-800">
                        {activity.user}
                      </span>{" "}
                      <span className="text-gray-600">{activity.action}</span>
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </Col>
      </Row>

      {/* Attendance Overview */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={8}>
          <Card className="text-center h-full">
            <div className="space-y-3">
              <div className="text-green-500 text-4xl">
                <CheckCircleOutlined />
              </div>
              <h3 className="text-2xl font-bold text-gray-800">94.4%</h3>
              <p className="text-gray-600">Attendance Rate</p>
              <Progress percent={94.4} strokeColor="#10b981" showInfo={false} />
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card className="text-center h-full">
            <div className="space-y-3">
              <div className="text-orange-500 text-4xl">
                <CalendarOutlined />
              </div>
              <h3 className="text-2xl font-bold text-gray-800">14</h3>
              <p className="text-gray-600">Pending Leave Requests</p>
              <Button type="primary" className="mt-2 bg-blue-600">
                Review Requests
              </Button>
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card className="text-center h-full">
            <div className="space-y-3">
              <div className="text-blue-500 text-4xl">
                <FileTextOutlined />
              </div>
              <h3 className="text-2xl font-bold text-gray-800">23</h3>
              <p className="text-gray-600">Open Positions</p>
              <Button type="primary" className="mt-2 bg-blue-600">
                View Positions
              </Button>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Leave Requests Table */}
      <Card
        title={
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CalendarOutlined className="text-blue-600" />
              <span>Pending Leave Requests</span>
            </div>
            <Button type="link" className="text-blue-600">
              View All
            </Button>
          </div>
        }
      >
        <Table
          columns={leaveRequestsColumns}
          dataSource={leaveRequestsData}
          pagination={false}
          scroll={{ x: 800 }}
        />
      </Card>

      {/* Quick Actions */}
      <Card title="Quick Actions">
        <Row gutter={[16, 16]}>
          <Col xs={12} sm={6}>
            <Button
              type="default"
              block
              size="large"
              icon={<UserOutlined />}
              className="h-20 flex flex-col items-center justify-center"
            >
              <span className="mt-2">Add Employee</span>
            </Button>
          </Col>
          <Col xs={12} sm={6}>
            <Button
              type="default"
              block
              size="large"
              icon={<CalendarOutlined />}
              className="h-20 flex flex-col items-center justify-center"
            >
              <span className="mt-2">Mark Attendance</span>
            </Button>
          </Col>
          <Col xs={12} sm={6}>
            <Button
              type="default"
              block
              size="large"
              icon={<FileTextOutlined />}
              className="h-20 flex flex-col items-center justify-center"
            >
              <span className="mt-2">Generate Report</span>
            </Button>
          </Col>
          <Col xs={12} sm={6}>
            <Button
              type="default"
              block
              size="large"
              icon={<TeamOutlined />}
              className="h-20 flex flex-col items-center justify-center"
            >
              <span className="mt-2">Post Job</span>
            </Button>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default Dashboard;
