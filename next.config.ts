import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // Bỏ qua toàn bộ lỗi kiểm tra kiểu dữ liệu TypeScript khi build
    ignoreBuildErrors: true,
  },
  eslint: {
    // Bỏ qua toàn bộ cảnh báo và lỗi ESLint khi build
    ignoreDuringBuilds: true,
  }
};

export default nextConfig;