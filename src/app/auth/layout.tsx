"use client";
import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import AuthLayout from "@/modules/auth/layout/page/AuthLayout";

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  const router = useRouter();
//   const { isAuthenticated, authFlag, userType } = useAuth();
//   const [valid, setValid] = React.useState(false);
//   useEffect(() => {
//     if (!isAuthenticated) {
//       router.push("/admin/auth/login");
//     }
//     if (isAuthenticated && userType != "admin") {
//       router.push("/");
//     }
//     if (isAuthenticated && userType == "admin") {
//       setValid(true);
//        router.push("/admin/dashboard");
//     }
//   }, [isAuthenticated, authFlag, router]);
//   return valid && <AdminLayout>{children}</AdminLayout>;
  return <AuthLayout>{children}</AuthLayout>;
}
