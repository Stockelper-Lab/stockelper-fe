# syntax=docker/dockerfile:1.7

FROM node:20-alpine AS base
WORKDIR /app

# Prisma(alpine) 런타임 의존성
RUN apk add --no-cache openssl libc6-compat

# pnpm (corepack)
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && mkdir -p /pnpm/store

ENV NEXT_TELEMETRY_DISABLED=1

FROM base AS deps
COPY package.json pnpm-lock.yaml ./
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# prisma client가 src/generated/prisma로 생성되므로 빌드 전에 생성 필수
RUN pnpm prisma:generate
RUN pnpm build

# 런타임 이미지 크기 축소
RUN pnpm prune --prod

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production

# non-root 실행 (컨테이너 내부는 3000 포트 사용)
RUN addgroup -S nodejs && adduser -S nextjs -G nodejs

COPY --chown=nextjs:nodejs --from=builder /app/package.json ./package.json
COPY --chown=nextjs:nodejs --from=builder /app/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --chown=nextjs:nodejs --from=builder /app/node_modules ./node_modules
COPY --chown=nextjs:nodejs --from=builder /app/.next ./.next

# prisma migrate deploy를 위해 포함
COPY --chown=nextjs:nodejs --from=builder /app/prisma ./prisma

# prisma client output (schema.prisma의 generator output 경로)
COPY --chown=nextjs:nodejs --from=builder /app/src/generated ./src/generated

USER nextjs
EXPOSE 3000

CMD ["pnpm", "exec", "next", "start", "-p", "3000"]

