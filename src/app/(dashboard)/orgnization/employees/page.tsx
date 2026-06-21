"use client";
import React from "react";
import { Card, Button, Avatar, Tag, Space } from "antd";
import {
  UserOutlined,
  PlusOutlined,
  MailOutlined,
  PhoneOutlined,
} from "@ant-design/icons";
import MyTable from "@/components/table/MyTable";

interface EmployeeRecord {
  key: string;
  name: string;
  employeeId: string;
  department: string;
  position: string;
  email: string;
  phone: string;
  status: string;
  avatar?: string;
}

const Employees: React.FC = () => {
  const columns = [
    {
      title: "Employee",
      dataIndex: "name",
      key: "name",
      render: (text: string, record: EmployeeRecord) => (
        <div className="flex items-center space-x-3">
          <Avatar size={40} icon={<UserOutlined />} src={record.avatar} className="!mr-2" />
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
      title: "Position",
      dataIndex: "position",
      key: "position",
      render: (position: string) => (
        <span className="text-gray-700">{position}</span>
      ),
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      render: (email: string) => (
        <div className="flex items-center space-x-2 text-gray-600">
          <MailOutlined className="text-gray-400" />
          <span className="text-sm">{email}</span>
        </div>
      ),
    },
    {
      title: "Phone",
      dataIndex: "phone",
      key: "phone",
      render: (phone: string) => (
        <div className="flex items-center space-x-2 text-gray-600">
          <PhoneOutlined className="text-gray-400" />
          <span className="text-sm">{phone}</span>
        </div>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Tag color={status === "Active" ? "green" : "red"}>{status}</Tag>
      ),
    },
    {
      title: "Action",
      key: "action",
      render: () => (
        <Space>
          <Button type="link" size="small">
            View
          </Button>
          <Button type="link" size="small">
            Edit
          </Button>
        </Space>
      ),
    },
  ];

  const data: EmployeeRecord[] = [
    {
      key: "1",
      name: "John Doe",
      employeeId: "EMP-001",
      department: "Engineering",
      position: "Senior Developer",
      email: "john.doe@company.com",
      phone: "+1 234-567-8901",
      status: "Active",
    },
    {
      key: "2",
      name: "Sarah Smith",
      employeeId: "EMP-002",
      department: "Marketing",
      position: "Marketing Manager",
      email: "sarah.smith@company.com",
      phone: "+1 234-567-8902",
      status: "Active",
    },
    {
      key: "3",
      name: "Mike Johnson",
      employeeId: "EMP-003",
      department: "Sales",
      position: "Sales Executive",
      email: "mike.j@company.com",
      phone: "+1 234-567-8903",
      status: "Active",
    },
    {
      key: "4",
      name: "Emma Wilson",
      employeeId: "EMP-004",
      department: "HR",
      position: "HR Specialist",
      email: "emma.w@company.com",
      phone: "+1 234-567-8904",
      status: "Active",
    },
    {
      key: "5",
      name: "Robert Fox",
      employeeId: "EMP-005",
      department: "Finance",
      position: "Financial Analyst",
      email: "robert.f@company.com",
      phone: "+1 234-567-8905",
      status: "Active",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Employees</h1>
          <p className="text-gray-600 mt-1">Manage your workforce</p>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          size="large"
          className="bg-blue-600 hover:bg-blue-700"
        >
          Add Employee
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-blue-50 border-blue-200">
          <div className="text-center">
            <p className="text-blue-600 text-sm font-medium">Total</p>
            <p className="text-3xl font-bold text-blue-700">248</p>
          </div>
        </Card>
        <Card className="bg-green-50 border-green-200">
          <div className="text-center">
            <p className="text-green-600 text-sm font-medium">Active</p>
            <p className="text-3xl font-bold text-green-700">234</p>
          </div>
        </Card>
        <Card className="bg-orange-50 border-orange-200">
          <div className="text-center">
            <p className="text-orange-600 text-sm font-medium">On Leave</p>
            <p className="text-3xl font-bold text-orange-700">14</p>
          </div>
        </Card>
        <Card className="bg-purple-50 border-purple-200">
          <div className="text-center">
            <p className="text-purple-600 text-sm font-medium">New This Month</p>
            <p className="text-3xl font-bold text-purple-700">8</p>
          </div>
        </Card>
      </div>

      <MyTable<EmployeeRecord>
        title="All Employees"
        searchPlaceholder="Search employees..."
        columns={columns}
        dataSource={data}
        paginationConfig={{ pageSize: 3 }}
        searchKeys={[
          "name",
          "employeeId",
          "department",
          "position",
          "email",
          "phone",
          "status",
        ]}
        scroll={{ x: 1200 }}
      />
    </div>
  );
};

export default Employees;
