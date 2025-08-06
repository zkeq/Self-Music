import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 强制启用热加载和快速刷新
  experimental: {
    turbo: {
      // 修复 turbopack 热加载问题
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
  },
  // 开发模式配置
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      // 确保热加载模块正常工作
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
      };
    }
    return config;
  },
};

export default nextConfig;
