/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',  // Azure 배포를 위한 standalone 모드
  trailingSlash: false,  // API 라우트와의 충돌 방지
  images: { unoptimized: true },
  // 빌드 에러 방지
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Azure 환경에서 필요한 설정
  experimental: {
    outputFileTracingRoot: undefined,
  },
  // API 라우트 설정
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: '/api/:path*',
      },
    ];
  },
};

module.exports = nextConfig;