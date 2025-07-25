FROM node:24-alpine

# 작업 디렉토리 설정
WORKDIR /app

# 패키지 매니저 파일 복사 및 종속성 설치
COPY package.json pnpm-lock.yaml* ./
RUN npm install -g pnpm
RUN pnpm install --frozen-lockfile


ENV NEXT_PUBLIC_LLM_ENDPOINT=https://stockelper-llm.peo.kr

# 프로젝트 파일 복사
COPY . .

# Next.js 애플리케이션 빌드
RUN pnpm run build

# 포트 노출
EXPOSE 3000

# 애플리케이션 실행
CMD ["npm", "run", "start"] 
