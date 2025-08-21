FROM node:20-alpine AS builder
WORKDIR /app

# 보안을 위해 root가 아닌 사용자 생성
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# 패키지 파일 복사 및 의존성 설치
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# 소스 코드 복사 및 빌드
COPY . .
RUN npm run build

# 프로덕션 스테이지
FROM node:20-alpine AS runner
WORKDIR /app

# 보안을 위해 root가 아닌 사용자 생성
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# 환경 변수 설정
ENV NODE_ENV=production
ENV PORT=3000

# 필요한 파일들만 복사
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# 사용자 변경
USER nextjs

# 포트 노출
EXPOSE 3000

# 헬스체크 추가
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

# 애플리케이션 시작
CMD ["node", "server.js"]
