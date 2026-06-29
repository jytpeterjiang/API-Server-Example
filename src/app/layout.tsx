import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MCP API Server",
  description: "Next.js API server with Prisma ORM",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
