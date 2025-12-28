import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    /* config options here */
    reactStrictMode: true,

    // 空的 turbopack 配置以满足 Next.js 16 要求
    turbopack: {},

};

export default nextConfig;
