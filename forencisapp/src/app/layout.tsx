import type { Metadata } from "next";
import "./globals.css";

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
        {children}
      </body>
    </html>
  );
}