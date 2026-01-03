# Stockelper 프론트엔드

Next.js 15 기반의 AI 기반 주식 투자 플랫폼 프론트엔드입니다.

## 📋 기술 스택

- **Frontend**: Next.js 15.3, React 19, TypeScript 5.8
- **Database**: PostgreSQL, Prisma ORM 6.6
- **Styling**: Tailwind CSS 4.1, Radix UI
- **State Management**: TanStack React Query 5.90
- **Authentication**: JWT (jsonwebtoken, bcryptjs)
- **Form Validation**: React Hook Form 7.55, Zod 3.24
- **Markdown**: react-markdown 10.1 (remark-gfm, rehype-raw, rehype-sanitize)
- **Visualization**: XYFlow/React 12.6 (ReactFlow)
- **Notifications**: Sonner 2.0
- **Animation**: Framer Motion 12.7
- **Icons**: Lucide React 0.488

## 🚀 빠른 시작

### 1. 의존성 설치

```bash
pnpm install
```

### 2. 환경 변수 설정

`.env` 파일 생성:

```env
# 데이터베이스
DATABASE_URL=postgresql://user:password@host:5432/database

# JWT 인증
JWT_SECRET=your_super_secret_jwt_key_min_32_characters
JWT_EXPIRES_IN=7d
COOKIE_NAME=auth-token

# LLM 서비스 엔드포인트 (서버 사이드 전용)
LLM_ENDPOINT=https://your-llm-service-endpoint

# 환경
NODE_ENV=development
```

### 3. 데이터베이스 마이그레이션

```bash
pnpm prisma:migrate
pnpm prisma:generate
```

### 4. 개발 서버 실행

```bash
pnpm dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000) 접속

## 📁 주요 페이지

### 인증 페이지 (레이아웃 없음)
- `/sign-in` - 로그인
- `/sign-up` - 회원가입 (2단계: 사용자 정보 + 투자 성향 설문조사)

### 메인 페이지 (레이아웃 포함)
- `/dashboard` - 대시보드
- `/chat` - AI 어시스턴트 채팅
- `/chat/[id]` - 개별 대화
- `/analysis` - 분석
- `/settings` - 설정 허브
- `/settings/account` - 계정 설정 (닉네임, 비밀번호 변경)
- `/settings/kis` - KIS 증권 API 설정
- `/settings/survey` - 투자 성향 설문 재설정

## 🔌 API 엔드포인트

### 인증
- `POST /api/auth/register` - 회원가입 (투자 성향 평가 포함)
- `POST /api/auth/login` - 로그인 (JWT 쿠키 반환)
- `GET /api/auth/me` - 현재 사용자 정보
- `POST /api/auth/logout` - 로그아웃

### 대화
- `GET /api/conversations` - 대화 목록
- `POST /api/conversations` - 새 대화 생성
- `GET /api/conversations/[id]` - 대화 상세
- `PUT /api/conversations/[id]` - 대화 수정
- `DELETE /api/conversations/[id]` - 대화 삭제
- `GET /api/conversations/[id]/messages` - 메시지 목록 (페이지네이션)
- `POST /api/conversations/[id]/messages` - 메시지 저장
- `POST /api/conversations/[id]/feedback` - 피드백 제출

### 채팅
- `POST /api/chat` - LLM 스트리밍 응답 (외부 LLM 서비스 호출)

### 설정
- `PUT /api/settings/account` - 닉네임/비밀번호 변경
- `GET /api/settings/kis` - KIS API 정보 조회
- `PUT /api/settings/kis` - KIS API 정보 업데이트

### 설문조사
- `POST /api/survey` - 투자 성향 설문 제출/수정

## 🗃️ 데이터베이스 스키마

### users
- 사용자 계정 정보
- KIS 증권 API 자격증명 (kis_app_key, kis_app_secret, kis_access_token, account_no)
- 투자자 유형 (investor_type: 안정형, 안정추구형, 위험중립형, 적극투자형, 공격투자형)

### survey
- 사용자별 투자 성향 설문 답변 (JSON 형식)
- 8개 질문 (q1-q8): 투자 경험, 투자 목적, 위험 선호도 등

### Conversation
- 채팅 대화방 (UUID, 제목, 사용자 연결)

### Chat
- 채팅 메시지 (user, assistant, question)
- 서브그래프 데이터, 거래 액션 데이터 포함
- 피드백 (humanFeedbackResponse: true/false/null)

## 📦 주요 npm 스크립트

```bash
pnpm dev                 # 개발 서버 실행 (포트 3000)
pnpm build              # 프로덕션 빌드
pnpm start              # 빌드된 앱 실행 (포트 80)
pnpm lint               # ESLint 검사
pnpm typecheck          # TypeScript 타입 검사
pnpm prisma:generate    # Prisma 클라이언트 생성
pnpm prisma:migrate     # 마이그레이션 실행
pnpm prisma:studio      # Prisma Studio (DB GUI)
```

## 🚀 프로덕션 배포

### PM2 사용

```bash
# 빌드
pnpm build

# PM2로 실행
pm2 start "pnpm start" --name stockelper-fe
pm2 startup
pm2 save
```

### GitHub Actions 자동 배포

`main` 브랜치 push 시 AWS EC2에 자동 배포됩니다.

## 🔒 보안 주의사항

- `.env` 파일을 절대 커밋하지 마세요
- 프로덕션에서 강력한 JWT_SECRET 사용 (32자 이상)
- 데이터베이스 접속 정보를 코드에 하드코딩하지 마세요

## 🐛 문제 해결

### 포트 충돌
```bash
pnpm dev -- -p 3001
```

### Prisma 오류
```bash
pnpm prisma:generate
```

### PM2 문제
```bash
pm2 restart stockelper-fe
pm2 logs stockelper-fe --lines 100
```

## 📞 문의 및 지원

- 버그 리포트: Issues 탭
- 기능 요청: Pull Request
