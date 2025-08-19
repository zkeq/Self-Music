import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Turbopack配置 (修复deprecated警告)
  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
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
  // 构建优化
  typescript: {
    // 在构建过程中忽略类型错误
    ignoreBuildErrors: false,
  },
  eslint: {
    // 在构建过程中忽略ESLint错误
    ignoreDuringBuilds: false,
  },
  // PWA基础配置
  experimental: {
    webVitalsAttribution: ['CLS', 'LCP'],
  },
};

export default nextConfig;
