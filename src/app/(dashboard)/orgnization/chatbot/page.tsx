"use client";
import React, { useState } from "react";
import { Card, Input, Button, Avatar, Tag } from "antd";
import {
  RobotOutlined,
  SendOutlined,
  UserOutlined,
} from "@ant-design/icons";

interface Message {
  id: number;
  text: string;
  sender: "user" | "bot";
  timestamp: string;
}

const ChatBot: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Hello! I'm your AI HR Assistant. How can I help you today?",
      sender: "bot",
      timestamp: "10:00 AM",
    },
    {
      id: 2,
      text: "I can help you with:\n• Employee information\n• Leave requests\n• Attendance queries\n• Recruitment status\n• HR policies\n• And much more!",
      sender: "bot",
      timestamp: "10:00 AM",
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const quickActions = [
    "Check employee attendance",
    "View pending leave requests",
    "Show recruitment status",
    "Employee count by department",
    "Generate attendance report",
  ];

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const newUserMessage: Message = {
      id: messages.length + 1,
      text: inputValue,
      sender: "user",
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setMessages([...messages, newUserMessage]);
    setInputValue("");
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const botResponse: Message = {
        id: messages.length + 2,
        text: "I understand you're asking about: '" + inputValue + "'. Let me fetch that information for you. Based on the latest data, here's what I found...",
        sender: "bot",
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setMessages((prev) => [...prev, botResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const handleQuickAction = (action: string) => {
    setInputValue(action);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800">AI Assistant</h1>
        <p className="text-gray-600 mt-1">
          Your intelligent HR assistant powered by AI
        </p>
      </div>

      {/* Main Chat Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chat Card */}
        <Card className="lg:col-span-2 h-[calc(100vh-240px)]">
          <div className="flex flex-col h-full">
            {/* Chat Header */}
            <div className="flex items-center space-x-3 pb-4 border-b border-gray-200">
              <div className="bg-blue-100 p-2 rounded-full">
                <RobotOutlined className="text-2xl text-blue-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-800">HRX AI Assistant</h3>
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  <span className="text-xs text-gray-500">Online</span>
                </div>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto py-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.sender === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`flex items-start space-x-2 max-w-[80%] ${
                      message.sender === "user"
                        ? "flex-row-reverse space-x-reverse"
                        : ""
                    }`}
                  >
                    <Avatar
                      icon={
                        message.sender === "bot" ? (
                          <RobotOutlined />
                        ) : (
                          <UserOutlined />
                        )
                      }
                      className={
                        message.sender === "bot"
                          ? "bg-blue-500"
                          : "bg-purple-500"
                      }
                    />
                    <div>
                      <div
                        className={`px-4 py-3 rounded-2xl ${
                          message.sender === "user"
                            ? "bg-blue-600 text-white"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        <p className="text-sm whitespace-pre-line">
                          {message.text}
                        </p>
                      </div>
                      <p className="text-xs text-gray-400 mt-1 px-2">
                        {message.timestamp}
                      </p>
                    </div>
                  </div>
                </div>
              ))}

              {/* Typing Indicator */}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="flex items-start space-x-2">
                    <Avatar
                      icon={<RobotOutlined />}
                      className="bg-blue-500"
                    />
                    <div className="bg-gray-100 px-4 py-3 rounded-2xl">
                      <div className="flex space-x-2">
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></span>
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className="pt-4 border-t border-gray-200">
              <div className="flex space-x-2">
                <Input
                  placeholder="Ask me anything about HR..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onPressEnter={handleSendMessage}
                  size="large"
                  className="rounded-lg"
                />
                <Button
                  type="primary"
                  icon={<SendOutlined />}
                  size="large"
                  onClick={handleSendMessage}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Send
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Quick Actions Sidebar */}
        <Card className="lg:col-span-1">
          <h3 className="font-bold text-gray-800 mb-4">Quick Actions</h3>
          <div className="space-y-2">
            {quickActions.map((action, index) => (
              <button
                key={index}
                onClick={() => handleQuickAction(action)}
                className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-blue-50 border border-gray-200 hover:border-blue-300 rounded-lg transition-all text-sm text-gray-700 hover:text-blue-600"
              >
                {action}
              </button>
            ))}
          </div>

          {/* AI Capabilities */}
          <div className="mt-6 p-4 bg-purple-50 rounded-lg border border-purple-200">
            <h4 className="font-bold text-gray-800 mb-3 text-sm">
              AI Capabilities
            </h4>
            <div className="space-y-2">
              <Tag color="blue">Natural Language</Tag>
              <Tag color="purple">Smart Analytics</Tag>
              <Tag color="green">24/7 Available</Tag>
              <Tag color="orange">Multi-language</Tag>
              <Tag color="red">Context Aware</Tag>
            </div>
          </div>

          {/* Tips */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="font-bold text-gray-800 mb-2 text-sm">💡 Tips</h4>
            <ul className="text-xs text-gray-600 space-y-2">
              <li>• Ask specific questions for better results</li>
              <li>• Use natural language</li>
              <li>• Request reports and analytics</li>
              <li>• Get policy clarifications</li>
            </ul>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ChatBot;
