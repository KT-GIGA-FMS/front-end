/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',  // Azure 배포를 위한 standalone 모드
  trailingSlash: true,
  images: { unoptimized: true },
  // Azure 환경에서 필요한 설정
  experimental: {
    outputFileTracingRoot: undefined,
  },
};

module.exports = nextConfig;
