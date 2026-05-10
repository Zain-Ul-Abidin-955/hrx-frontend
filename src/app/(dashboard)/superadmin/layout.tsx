"use client";
import MyLayout from "@/layout/Layout";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return <MyLayout>{children}</MyLayout>;
}
