/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // trailingSlash: true, // API 라우트와 충돌하므로 제거
  images: { unoptimized: true },
  output: 'standalone', //배포아티팩트 최소화
};

module.exports = nextConfig;

