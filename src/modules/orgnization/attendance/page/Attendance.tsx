"use client";
import React from "react";
import { Card, Row, Col, Table, Button, Tag, Avatar, Calendar } from "antd";
import {
  CalendarOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  UserOutlined,
  RobotOutlined,
} from "@ant-design/icons";
import type { Dayjs } from "dayjs";

const Attendance: React.FC = () => {
  const stats = [
    {
      title: "Present Today",
      value: "234",
      percentage: "94.4%",
      icon: <CheckCircleOutlined className="text-3xl text-green-600" />,
      bgColor: "bg-green-50",
    },
    {
      title: "Absent",
      value: "8",
      percentage: "3.2%",
      icon: <CloseCircleOutlined className="text-3xl text-red-600" />,
      bgColor: "bg-red-50",
    },
    {
      title: "Late Arrivals",
      value: "6",
      percentage: "2.4%",
      icon: <ClockCircleOutlined className="text-3xl text-orange-600" />,
      bgColor: "bg-orange-50",
    },
    {
      title: "On Leave",
      value: "14",
      percentage: "5.6%",
      icon: <CalendarOutlined className="text-3xl text-blue-600" />,
      bgColor: "bg-blue-50",
    },
  ];

  const columns = [
    {
      title: "Employee",
      dataIndex: "name",
      key: "name",
      render: (text: string, record: any) => (
        <div className="flex items-center space-x-3">
          <Avatar size={40} icon={<UserOutlined />} />
          <div>
            <p className="font-semibold text-gray-800">{text}</p>
            <p className="text-xs text-gray-500">{record.employeeId}</p>
          </div>
        </div>
      ),
    },
    {
      title: "Department",
      dataIndex: "department",
      key: "department",
      render: (dept: string) => <Tag color="blue">{dept}</Tag>,
    },
    {
      title: "Check-In",
      dataIndex: "checkIn",
      key: "checkIn",
      render: (time: string) => (
        <span className="text-gray-700 font-medium">{time}</span>
      ),
    },
    {
      title: "Check-Out",
      dataIndex: "checkOut",
      key: "checkOut",
      render: (time: string) => (
        <span className="text-gray-700 font-medium">{time || "-"}</span>
      ),
    },
    {
      title: "Working Hours",
      dataIndex: "workingHours",
      key: "workingHours",
      render: (hours: string) => (
        <span className="font-semibold text-gray-800">{hours}</span>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Tag
          color={
            status === "Present"
              ? "green"
              : status === "Late"
              ? "orange"
              : status === "Absent"
              ? "red"
              : "blue"
          }
        >
          {status}
        </Tag>
      ),
    },
  ];

  const attendanceData = [
    {
      key: "1",
      name: "John Doe",
      employeeId: "EMP-001",
      department: "Engineering",
      checkIn: "09:00 AM",
      checkOut: "06:00 PM",
      workingHours: "9h 00m",
      status: "Present",
    },
    {
      key: "2",
      name: "Sarah Smith",
      employeeId: "EMP-002",
      department: "Marketing",
      checkIn: "09:15 AM",
      checkOut: "06:10 PM",
      workingHours: "8h 55m",
      status: "Late",
    },
    {
      key: "3",
      name: "Mike Johnson",
      employeeId: "EMP-003",
      department: "Sales",
      checkIn: "08:55 AM",
      checkOut: "05:50 PM",
      workingHours: "8h 55m",
      status: "Present",
    },
    {
      key: "4",
      name: "Emma Wilson",
      employeeId: "EMP-004",
      department: "HR",
      checkIn: "-",
      checkOut: "-",
      workingHours: "-",
      status: "Leave",
    },
    {
      key: "5",
      name: "Robert Fox",
      employeeId: "EMP-005",
      department: "Finance",
      checkIn: "-",
      checkOut: "-",
      workingHours: "-",
      status: "Absent",
    },
  ];

  const onCalendarSelect = (value: Dayjs) => {
    console.log("Selected date:", value.format("YYYY-MM-DD"));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Attendance Management
          </h1>
          <p className="text-gray-600 mt-1">
            Track and manage employee attendance
          </p>
        </div>
        <Button
          type="primary"
          icon={<CalendarOutlined />}
          size="large"
          className="bg-blue-600 hover:bg-blue-700"
        >
          Mark Attendance
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
                  <p className="text-sm text-gray-600 mt-1">{stat.percentage}</p>
                </div>
                <div className={`${stat.bgColor} p-3 rounded-lg`}>
                  {stat.icon}
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Main Content */}
      <Row gutter={[16, 16]}>
        {/* Attendance Table */}
        <Col xs={24} lg={16}>
          <Card
            title={
              <span className="text-lg font-semibold">Today's Attendance</span>
            }
          >
            <Table
              columns={columns}
              dataSource={attendanceData}
              pagination={false}
              scroll={{ x: 900 }}
            />
          </Card>
        </Col>

        {/* Calendar */}
        <Col xs={24} lg={8}>
          <Card title={<span className="text-lg font-semibold">Calendar</span>}>
            <Calendar
              fullscreen={false}
              onSelect={onCalendarSelect}
              className="attendance-calendar"
            />
          </Card>
        </Col>
      </Row>

      {/* AI Insights */}
      <Card className="bg-linear-to-r from-blue-50 to-purple-50 border-blue-200">
        <div className="flex items-start space-x-4">
          <div className="bg-blue-100 p-4 rounded-full">
            <RobotOutlined className="text-3xl text-blue-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-800 mb-2">
              AI Attendance Insights
            </h3>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start space-x-2">
                <CheckCircleOutlined className="text-green-500 mt-1" />
                <span>
                  Attendance rate improved by 5% compared to last month
                </span>
              </li>
              <li className="flex items-start space-x-2">
                <ClockCircleOutlined className="text-orange-500 mt-1" />
                <span>
                  6 employees have been consistently late this week - consider review
                </span>
              </li>
              <li className="flex items-start space-x-2">
                <CalendarOutlined className="text-blue-500 mt-1" />
                <span>
                  Peak absence day: Friday (recommend shift planning)
                </span>
              </li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Attendance;
