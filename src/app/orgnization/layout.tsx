"use client";
import MyLayout from "@/layout/Layout";

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return <MyLayout>{children}</MyLayout>;
}
