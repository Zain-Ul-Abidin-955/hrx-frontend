"use client";
import React from "react";
import { Button } from "antd";
import {
  RobotOutlined,
  TeamOutlined,
  CalendarOutlined,
  FileTextOutlined,
  DashboardOutlined,
  SafetyOutlined,
  ThunderboltOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import { useRouter } from "next/navigation";

const LandingPage: React.FC = () => {
  const router = useRouter();

  const features = [
    {
      icon: <RobotOutlined className="text-5xl text-blue-600" />,
      title: "AI-Powered Assistant",
      description:
        "Smart AI assistant that helps automate HR tasks, provides insights, and answers employee queries instantly 24/7.",
    },
    {
      icon: <TeamOutlined className="text-5xl text-purple-600" />,
      title: "Intelligent Recruitment with ATS",
      description:
        "Advanced Applicant Tracking System powered by AI to screen resumes, match candidates, and streamline hiring process.",
    },
    {
      icon: <CalendarOutlined className="text-5xl text-green-600" />,
      title: "Smart Attendance Management",
      description:
        "Automated attendance tracking with face recognition, real-time monitoring, and intelligent leave management.",
    },
    {
      icon: <DashboardOutlined className="text-5xl text-orange-600" />,
      title: "Analytics Dashboard",
      description:
        "Comprehensive analytics and insights on workforce performance, productivity trends, and HR metrics.",
    },
    {
      icon: <FileTextOutlined className="text-5xl text-red-600" />,
      title: "Employee Self-Service",
      description:
        "Empower employees with self-service portal for payroll, benefits, time-off requests, and document management.",
    },
    {
      icon: <SafetyOutlined className="text-5xl text-indigo-600" />,
      title: "Compliance & Security",
      description:
        "Ensure data security and regulatory compliance with advanced encryption and automated compliance checks.",
    },
  ];

  const stats = [
    { number: "10K+", label: "Active Users" },
    { number: "95%", label: "Time Saved" },
    { number: "24/7", label: "AI Support" },
    { number: "99.9%", label: "Uptime" },
  ];

  return (
    <div className="min-h-screen bg-linear-to-b from-white to-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <RobotOutlined className="text-3xl text-blue-600" />
              <span className="text-2xl font-bold bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                HRX AI
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                type="default"
                size="large"
                onClick={() => router.push("/auth/login")}
                className="hidden sm:inline-flex"
              >
                Login
              </Button>
              <Button
                type="primary"
                size="large"
                onClick={() => router.push("/auth/signup")}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-20 pb-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center px-4 py-2 bg-blue-50 rounded-full mb-6">
            <ThunderboltOutlined className="text-blue-600 mr-2" />
            <span className="text-blue-600 font-semibold text-sm">
              AI-Powered Workforce Management
            </span>
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
            Transform Your HR with
            <span className="block bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mt-2">
              Artificial Intelligence
            </span>
          </h1>

          <p className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed">
            Revolutionize your workforce management with our AI-powered HRMS.
            Automate recruitment, manage attendance, and empower your team with
            intelligent insights.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              type="primary"
              size="large"
              onClick={() => router.push("/auth/signup")}
              className="bg-blue-600 hover:bg-blue-700 h-14 px-8 text-lg font-medium"
            >
              Start Free Trial
            </Button>
            <Button
              size="large"
              onClick={() => router.push("/auth/login")}
              className="h-14 px-8 text-lg font-medium"
            >
              Watch Demo
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-20">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl font-bold text-gray-900 mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              Powerful Features for Modern HR
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need to manage your workforce efficiently, all
              powered by cutting-edge AI technology
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-linear-to-br from-gray-50 to-white p-8 rounded-2xl border border-gray-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-2"
              >
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-linear-to-br from-blue-600 to-purple-600">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-white">
              <h2 className="text-4xl sm:text-5xl font-bold mb-6">
                Why Choose HRX AI?
              </h2>
              <p className="text-xl text-blue-100 mb-8">
                Join thousands of companies that have transformed their HR
                operations with our AI-powered platform
              </p>

              <div className="space-y-4">
                {[
                  "Reduce hiring time by 60% with AI-powered screening",
                  "Automate 80% of repetitive HR tasks",
                  "Real-time workforce analytics and insights",
                  "24/7 AI assistant for employee support",
                  "Seamless integration with existing tools",
                ].map((benefit, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <CheckCircleOutlined className="text-2xl text-green-300 mt-1" />
                    <span className="text-lg text-white">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-2xl">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                Ready to Get Started?
              </h3>
              <div className="space-y-4">
                <Button
                  type="primary"
                  size="large"
                  block
                  onClick={() => router.push("/auth/signup")}
                  className="bg-blue-600 hover:bg-blue-700 h-14 text-lg font-medium"
                >
                  Sign Up Free
                </Button>
                <Button
                  size="large"
                  block
                  onClick={() => router.push("/auth/login")}
                  className="h-14 text-lg font-medium"
                >
                  Login to Your Account
                </Button>
              </div>
              <p className="text-center text-gray-500 mt-4">
                No credit card required • 14-day free trial
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            {/* Company Info */}
            <div className="md:col-span-1">
              <div className="flex items-center space-x-2 mb-4">
                <RobotOutlined className="text-3xl text-blue-400" />
                <span className="text-2xl font-bold">HRX AI</span>
              </div>
              <p className="text-gray-400">
                AI-Powered Workforce Management System for the future of work.
              </p>
            </div>

            {/* Product */}
            <div>
              <h4 className="text-lg font-bold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Pricing
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Integrations
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    API
                  </a>
                </li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="text-lg font-bold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    About Us
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Careers
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Contact
                  </a>
                </li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="text-lg font-bold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Security
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Compliance
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Footer */}
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2026 HRX AI. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a
                href="#"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <span className="sr-only">Twitter</span>
                <svg
                  className="h-6 w-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <span className="sr-only">LinkedIn</span>
                <svg
                  className="h-6 w-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <span className="sr-only">GitHub</span>
                <svg
                  className="h-6 w-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    fillRule="evenodd"
                    d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                    clipRule="evenodd"
                  />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
