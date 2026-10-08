import type { Metadata } from "next";
import "./globals.css";

import NonDashboardLayout from "@/components/public-layout";

export const metadata: Metadata = {
  title: "Forencis | Digital Evidence Platform",
  description:
    "Digital evidence storage, chain of custody, integrity verification, and forensic audit management.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-[#f5f5f2] text-[#171A1F]">
        <NonDashboardLayout>
          {children}
        </NonDashboardLayout>
      </body>
    </html>
  );
}