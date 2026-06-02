import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // Vẫn giữ thuộc tính này để bỏ qua lỗi TypeScript khi build
    ignoreBuildErrors: true,
  }
};

export default nextConfig;