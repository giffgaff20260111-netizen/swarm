import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Swarm",
  description: "自运行组织系统任务工作台"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
