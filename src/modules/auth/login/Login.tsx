"use client";
import React from "react";
import { Form, Input, Button, Checkbox } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";

interface LoginFormValues {
  email: string;
  password: string;
  remember: boolean;
}

/**
 * Login Component with Role-Based Navigation
 *
 * To test different user roles, set the role in localStorage before login:
 *
 * For Employee: localStorage.setItem('userRole', 'employee')
 * For HR/Organization: localStorage.setItem('userRole', 'hr')
 * For Admin: localStorage.setItem('userRole', 'admin')
 *
 * After login, user will be redirected based on their role:
 * - employee -> /employee
 * - hr/organization -> /orgnization
 * - admin -> /admin
 */
const Login: React.FC = () => {
  const router = useRouter();
  const [form] = Form.useForm();
  const [loading, setLoading] = React.useState(false);
  const [currentRole, setCurrentRole] = React.useState<string>("Not Set");

  // Get current role on component mount
  React.useEffect(() => {
    const role = localStorage.getItem("userRole");
    setCurrentRole(role || "Not Set");
  }, []);

  const onFinish = (values: LoginFormValues) => {
    setLoading(true);

    // Store dummy token in localStorage
    const dummyToken =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxMjM0NTYiLCJlbWFpbCI6InVzZXJAZXhhbXBsZS5jb20ifQ.dummytoken";
    localStorage.setItem("authToken", dummyToken);

    // Store user info if remember is checked
    if (values.remember) {
      localStorage.setItem("userEmail", values.email);
    }

    // Simulate API call delay
    setTimeout(() => {
      setLoading(false);

      // Get user role from localStorage
      const userRole = localStorage.getItem("userRole");

      // Navigate based on role
      if (userRole === "employee") {
        router.push("/employee/dashboard");
      } else if (userRole === "hr" || userRole === "organization") {
        router.push("/orgnization/dashboard");
      } else if (userRole === "admin") {
        router.push("/admin/dashboard");
      } else {
        // Default navigation if no role is set (defaults to employee)
        console.warn("No role found in localStorage, defaulting to employee");
      }
    }, 1000);
  };

  return (
    <div className="w-full max-w-md px-8 py-10">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome Back</h1>
        <p className="text-gray-600">Sign in to your account</p>
      </div>

      <Form
        form={form}
        name="login"
        onFinish={onFinish}
        layout="vertical"
        autoComplete="off"
        className="space-y-4"
      >
        <Form.Item
          label={<span className="text-gray-700 font-medium">Email</span>}
          name="email"
          rules={[
            { required: true, message: "Please input your email!" },
            { type: "email", message: "Please enter a valid email!" },
          ]}
        >
          <Input
            prefix={<UserOutlined className="text-gray-400" />}
            placeholder="Enter your email"
            size="large"
            className="rounded-lg"
          />
        </Form.Item>

        <Form.Item
          label={<span className="text-gray-700 font-medium">Password</span>}
          name="password"
          rules={[
            { required: true, message: "Please input your password!" },
            { min: 6, message: "Password must be at least 6 characters!" },
          ]}
        >
          <Input.Password
            prefix={<LockOutlined className="text-gray-400" />}
            placeholder="Enter your password"
            size="large"
            className="rounded-lg"
          />
        </Form.Item>

        <Form.Item name="remember" valuePropName="checked" className="mb-4">
          <div className="flex items-center justify-between">
            <Checkbox className="text-gray-600">Remember me</Checkbox>
            <a href="#" className="text-blue-600 hover:text-blue-700 text-sm">
              Forgot password?
            </a>
          </div>
        </Form.Item>

        <Form.Item className="mb-0">
          <Button
            type="primary"
            htmlType="submit"
            size="large"
            loading={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 border-0 rounded-lg h-12 text-base font-medium"
          >
            {loading ? "Logging in..." : "Login"}
          </Button>
        </Form.Item>
      </Form>

      <div className="mt-6 text-center">
        <p className="text-gray-600">
          Don&apos;t have an account?{" "}
          <a
            href="/auth/signup"
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Sign up
          </a>
        </p>
      </div>

      {/* Development Helper - Role Selector */}
      <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-sm font-semibold text-gray-700 mb-3">
          Test Role (Development Only):
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => {
              localStorage.setItem("userRole", "employee");
              setCurrentRole("employee");
            }}
            className="px-4 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 text-sm font-medium transition-colors"
          >
            Employee
          </button>
          <button
            onClick={() => {
              localStorage.setItem("userRole", "organization");
              setCurrentRole("organization");
            }}
            className="px-4 py-2 bg-purple-100 text-purple-700 rounded-md hover:bg-purple-200 text-sm font-medium transition-colors"
          >
            Organization
          </button>
          <button
            onClick={() => {
              localStorage.setItem("userRole", "admin");
              setCurrentRole("admin");
            }}
            className="px-4 py-2 bg-green-100 text-green-700 rounded-md hover:bg-green-200 text-sm font-medium transition-colors"
          >
            Admin
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Current Role:{" "}
          <span className="font-semibold capitalize">{currentRole}</span>
        </p>
      </div>
    </div>
  );
};

export default Login;
