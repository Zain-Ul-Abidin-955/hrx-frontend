import { Poppins } from "next/font/google";
import "./globals.css";
import { Metadata } from "next";
import QueryProvider from "@/components/providers/QueryProvider";
const poppins = Poppins({
  subsets: ["latin"],
  variable: "--font-poppins",
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "HrX-AI",
  description: "Powerful HR Management System",
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${poppins.variable} antialiased`}
        suppressHydrationWarning
      >
        <QueryProvider>
          {children}
        </QueryProvider>
      </body>
    </html>
  )
}
