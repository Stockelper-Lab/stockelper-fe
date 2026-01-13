# Stockelper 프론트엔드

Next.js 15 기반의 AI 기반 한국 주식 투자 플랫폼 프론트엔드입니다.

## 개요

Stockelper는 투자자에게 AI 기반 포트폴리오 추천, 백테스팅, 실시간 채팅 상담을 제공하는 종합 투자 플랫폼입니다. Next.js 15의 최신 기능을 활용하여 빠르고 반응적인 사용자 경험을 제공합니다.

### 주요 기능

- **AI 채팅 어시스턴트**: LLM 기반 실시간 투자 상담 및 분석
- **포트폴리오 추천**: 투자 성향 기반 맞춤형 포트폴리오 제안
- **백테스팅**: 투자 전략 시뮬레이션 및 성과 분석
- **대시보드**: 투자 현황 및 주요 지표 시각화
- **KIS 증권 연동**: 한국투자증권 API 통합
- **투자 성향 분석**: 8가지 질문 기반 투자자 유형 판별

## 기술 스택

### 프론트엔드 프레임워크
- **Next.js 15.3**: React 기반 풀스택 프레임워크
- **React 19.1**: 최신 React 기능 활용
- **TypeScript 5.8**: 타입 안전성 보장

### UI/UX
- **Tailwind CSS 4.1**: 유틸리티 우선 CSS 프레임워크
- **Radix UI**: 접근성 우선 컴포넌트 라이브러리
  - Dialog, Label, Radio Group, Separator, Slot, Tooltip
- **Framer Motion 12.7**: 애니메이션 및 전환 효과
- **Lucide React 0.488**: 아이콘 라이브러리
- **Sonner 2.0**: 토스트 알림

### 데이터 관리
- **Prisma ORM 6.6**: 타입 안전 데이터베이스 ORM
- **PostgreSQL**: 관계형 데이터베이스
- **TanStack React Query 5.90**: 서버 상태 관리 및 캐싱

### 폼 및 유효성 검사
- **React Hook Form 7.55**: 폼 상태 관리
- **Zod 3.24**: 스키마 유효성 검증
- **@hookform/resolvers 5.0**: Zod와 React Hook Form 통합

### 인증
- **jsonwebtoken 9.0**: JWT 토큰 생성 및 검증
- **bcryptjs 3.0**: 비밀번호 해싱
- **cookies-next 5.1**: 쿠키 관리

### 데이터 시각화
- **@xyflow/react 12.6**: 플로우 차트 및 그래프
- **ReactFlow 11.11**: 노드 기반 다이어그램
- **react-force-graph-2d 1.29**: 포스 다이렉티드 그래프

### 마크다운
- **react-markdown 10.1**: 마크다운 렌더링
- **remark-gfm 4.0**: GitHub Flavored Markdown
- **remark-breaks 4.0**: 줄바꿈 지원
- **rehype-raw 7.0**: HTML 태그 지원
- **rehype-sanitize 6.0**: XSS 보안

### 유틸리티
- **axios 1.8**: HTTP 클라이언트
- **date-fns 4.1**: 날짜 조작
- **uuid 11.1**: 고유 ID 생성
- **clsx 2.1**: 조건부 클래스 이름
- **tailwind-merge 3.2**: Tailwind 클래스 병합
- **class-variance-authority 0.7**: 컴포넌트 변형 관리

## 프로젝트 구조

```
stockelper-fe/
├── src/
│   ├── app/                           # Next.js 앱 라우터
│   │   ├── (no-layout)/               # 레이아웃 없는 페이지
│   │   │   ├── sign-in/              # 로그인
│   │   │   └── sign-up/              # 회원가입 (2단계)
│   │   ├── (has-layout)/              # 레이아웃 포함 페이지
│   │   │   ├── dashboard/            # 대시보드
│   │   │   ├── chat/                 # AI 채팅
│   │   │   ├── analysis/             # 분석
│   │   │   ├── backtesting/          # 백테스팅
│   │   │   ├── portfolio/            # 포트폴리오
│   │   │   ├── settings/             # 설정
│   │   │   └── components/           # 공유 컴포넌트
│   │   └── api/                       # API 라우트
│   │       ├── auth/                 # 인증 API
│   │       ├── chat/                 # 채팅 API
│   │       ├── conversations/        # 대화 API
│   │       ├── backtesting/          # 백테스팅 API
│   │       ├── portfolio/            # 포트폴리오 API
│   │       ├── settings/             # 설정 API
│   │       └── survey/               # 설문조사 API
│   │
│   ├── components/                    # React 컴포넌트
│   │   ├── ui/                       # Radix UI 기반 컴포넌트
│   │   ├── chat/                     # 채팅 관련 컴포넌트
│   │   ├── common/                   # 공통 컴포넌트
│   │   └── survey/                   # 설문조사 컴포넌트
│   │
│   ├── hooks/                         # 커스텀 React 훅
│   │
│   ├── lib/                           # 유틸리티 라이브러리
│   │   ├── api/                      # API 클라이언트
│   │   └── types/                    # TypeScript 타입 정의
│   │
│   ├── generated/                     # 자동 생성 파일
│   │   └── prisma/                   # Prisma 클라이언트
│   │
│   └── middleware.ts                  # Next.js 미들웨어 (인증)
│
├── prisma/                            # Prisma 스키마
│   ├── schema.prisma                 # 데이터베이스 스키마
│   └── migrations/                   # 마이그레이션 파일
│
├── public/                            # 정적 파일
│
├── .github/                           # GitHub 설정
│   └── workflows/                    # GitHub Actions 워크플로우
│
├── package.json                       # 프로젝트 메타데이터
├── tsconfig.json                      # TypeScript 설정
├── next.config.ts                     # Next.js 설정
├── tailwind.config.js                 # Tailwind CSS 설정
├── postcss.config.mjs                 # PostCSS 설정
├── components.json                    # shadcn/ui 설정
├── deploy.sh                          # 배포 스크립트
├── DEPLOY.md                          # 배포 가이드
└── README.md                          # 이 파일
```

## 페이지 구조

### 인증 페이지 (레이아웃 없음)

#### `/sign-in` - 로그인
- 이메일/비밀번호 인증
- JWT 토큰 기반 세션 관리
- 자동 리다이렉트 (/dashboard)

#### `/sign-up` - 회원가입
**1단계: 계정 정보**
- 이름, 이메일, 닉네임, 비밀번호
- 중복 검사 및 유효성 검증

**2단계: 투자 성향 설문조사**
- 8가지 질문 (투자 경험, 목적, 위험 선호도)
- 투자자 유형 판별 (안정형, 안정추구형, 위험중립형, 적극투자형, 공격투자형)

### 메인 페이지 (레이아웃 포함)

#### `/dashboard` - 대시보드
- 투자 포트폴리오 요약
- 주요 지표 시각화
- 최근 활동 내역

#### `/chat` - AI 채팅
- LLM 기반 실시간 대화
- 스트리밍 응답
- 대화 이력 관리
- 서브그래프 시각화 (지식 그래프)
- 거래 액션 제안

#### `/chat/[id]` - 개별 대화
- 특정 대화 세션
- 메시지 페이지네이션
- 피드백 제출 (긍정/부정)

#### `/analysis` - 분석
- 시장 분석 도구
- 종목 상세 정보

#### `/backtesting` - 백테스팅
- 전략 시뮬레이션
- 성과 분석 및 리포트
- 결과 시각화

#### `/portfolio` - 포트폴리오
- AI 추천 포트폴리오
- 투자자 유형별 맞춤 제안
- 리밸런싱 제안

#### `/settings` - 설정
- **계정 설정** (`/settings/account`)
  - 닉네임 변경
  - 비밀번호 변경
- **KIS 증권 API** (`/settings/kis`)
  - App Key, App Secret 설정
  - 계좌 번호 등록
- **투자 성향 재평가** (`/settings/survey`)
  - 설문조사 다시 하기
  - 투자자 유형 업데이트

## API 엔드포인트

### 인증 API

#### POST /api/auth/register
회원가입 (투자 성향 평가 포함)

**요청**:
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "name": "홍길동",
  "nickname": "투자왕",
  "surveyAnswers": {
    "q1": "1",
    "q2": "2",
    // ... q8까지
  }
}
```

**응답**:
```json
{
  "success": true,
  "message": "회원가입이 완료되었습니다",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "nickname": "투자왕",
    "investor_type": "위험중립형"
  }
}
```

#### POST /api/auth/login
로그인 (JWT 쿠키 반환)

**요청**:
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**응답**:
```json
{
  "success": true,
  "user": {
    "id": 1,
    "email": "user@example.com",
    "nickname": "투자왕",
    "investor_type": "위험중립형"
  },
  "token": "jwt-token-here"
}
```

#### GET /api/auth/me
현재 사용자 정보 조회

**응답**:
```json
{
  "id": 1,
  "email": "user@example.com",
  "nickname": "투자왕",
  "investor_type": "위험중립형"
}
```

#### POST /api/auth/logout
로그아웃 (쿠키 삭제)

### 대화 API

#### GET /api/conversations
대화 목록 조회

**응답**:
```json
[
  {
    "id": "uuid-1",
    "title": "삼성전자 투자 상담",
    "createdAt": "2024-01-01T00:00:00Z",
    "lastActive": "2024-01-01T12:00:00Z"
  }
]
```

#### POST /api/conversations
새 대화 생성

**요청**:
```json
{
  "title": "새로운 투자 상담"
}
```

#### GET /api/conversations/[id]
대화 상세 조회

#### PUT /api/conversations/[id]
대화 제목 수정

#### DELETE /api/conversations/[id]
대화 삭제

#### GET /api/conversations/[id]/messages
메시지 목록 조회 (페이지네이션)

**쿼리 파라미터**:
- `page`: 페이지 번호 (기본값: 1)
- `limit`: 페이지 크기 (기본값: 50)

#### POST /api/conversations/[id]/messages
메시지 저장

#### POST /api/conversations/[id]/feedback
피드백 제출

**요청**:
```json
{
  "messageId": "uuid",
  "feedback": true  // true: 긍정, false: 부정
}
```

### 채팅 API

#### POST /api/chat
LLM 스트리밍 응답

**요청**:
```json
{
  "conversationId": "uuid",
  "message": "삼성전자 주식 추천해줘",
  "userId": 1
}
```

**응답**: Server-Sent Events (SSE) 스트리밍

### 백테스팅 API

#### POST /api/backtesting/execute
백테스트 실행 요청

**요청**:
```json
{
  "strategy": "momentum",
  "ticker": "005930",
  "startDate": "2023-01-01",
  "endDate": "2023-12-31",
  "initialCapital": 10000000
}
```

#### GET /api/backtesting/[jobId]
백테스트 결과 조회

### 포트폴리오 API

#### GET /api/portfolio
포트폴리오 추천 조회

#### POST /api/portfolio/recommend
새 포트폴리오 추천 요청

### 설정 API

#### PUT /api/settings/account
닉네임/비밀번호 변경

**요청**:
```json
{
  "nickname": "새닉네임",
  "currentPassword": "old-password",
  "newPassword": "new-password"
}
```

#### GET /api/settings/kis
KIS API 정보 조회

#### PUT /api/settings/kis
KIS API 정보 업데이트

**요청**:
```json
{
  "kis_app_key": "PSxxxx",
  "kis_app_secret": "xxxxx",
  "account_no": "12345678-01"
}
```

### 설문조사 API

#### POST /api/survey
투자 성향 설문 제출/수정

**요청**:
```json
{
  "answers": {
    "q1": "1",
    "q2": "2",
    // ... q8까지
  }
}
```

## 데이터베이스 스키마

### users
사용자 계정 정보

```prisma
model users {
  id                 Int       @id @default(autoincrement())
  email              String    @unique
  name               String
  nickname           String    @unique
  password           String
  investor_type      String    @default("안정형")
  kis_app_key        String
  kis_app_secret     String
  kis_access_token   String?
  account_no         String
  created_at         DateTime  @default(now())
  updated_at         DateTime  @default(now())
  conversations      Conversation[]
  portfolioRecommendations PortfolioRecommendation[]
}
```

**투자자 유형**:
- 안정형
- 안정추구형
- 위험중립형
- 적극투자형
- 공격투자형

### survey
투자 성향 설문 답변

```prisma
model survey {
  id         Int       @id @default(autoincrement())
  user_id    Int       @unique
  answer     Json      // { q1: "1", q2: "2", ... q8: "5" }
  created_at DateTime  @default(now())
  updated_at DateTime  @default(now())
}
```

### Conversation
채팅 대화방

```prisma
model Conversation {
  id         String   @id @default(uuid())
  title      String?
  userId     Int
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
  lastActive DateTime @default(now())
  messages   Chat[]
  user       users    @relation(fields: [userId], references: [id])
}
```

### Chat
채팅 메시지

```prisma
model Chat {
  id                    String       @id @default(uuid())
  messageId             String
  role                  String       // "user" | "assistant" | "question"
  content               String
  timestamp             DateTime
  conversationId        String
  jobId                 String?
  subgraphData          Json?        // 서브그래프 시각화 데이터
  tradingActionData     Json?        // 거래 액션 데이터
  errorMessage          String?
  humanFeedbackResponse Boolean?     // 피드백 (true: 긍정, false: 부정)
  createdAt             DateTime     @default(now())
  conversation          Conversation @relation(fields: [conversationId], references: [id], onDelete: Cascade)
}
```

### PortfolioRecommendation
포트폴리오 추천

```prisma
model PortfolioRecommendation {
  id           String   @id @default(uuid())
  userId       Int
  investorType String
  result       String   // JSON 문자열
  jobId        String?
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  user         users    @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

### backtesting
백테스팅 작업

```prisma
model backtesting {
  id                       String    @id
  job_id                   String    @unique
  user_id                  Int
  request_source           String    @default("llm")
  status                   String    // pending|in_progress|completed|failed
  input_json               Json
  output_json              Json
  result_file_path         String?
  report_file_path         String?
  error_message            String?
  // ... 타임스탬프 필드
}
```

## 환경 변수

### 필수 환경 변수

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

### 선택적 환경 변수

```env
# LLM 엔드포인트 (하위 호환성)
NEXT_PUBLIC_LLM_ENDPOINT=https://your-llm-service-endpoint

# 포트 (프로덕션)
PORT=80
```

## 설치 및 실행

### 사전 요구사항

- Node.js 18 이상
- pnpm 8 이상
- PostgreSQL 12 이상

### 로컬 개발 환경 설정

1. **저장소 클론**
   ```bash
   git clone <repository-url> stockelper-fe
   cd stockelper-fe
   ```

2. **의존성 설치**
   ```bash
   pnpm install
   ```

3. **환경 변수 설정**
   ```bash
   cp .env.example .env
   # .env 파일을 편집하여 설정 값 입력
   ```

4. **데이터베이스 마이그레이션**
   ```bash
   pnpm prisma:generate
   pnpm prisma:migrate
   ```

5. **개발 서버 실행**
   ```bash
   pnpm dev
   ```

6. **브라우저에서 접속**
   - URL: http://localhost:3000

### 빌드 및 프로덕션 실행

```bash
# 프로덕션 빌드
pnpm build

# 빌드된 앱 실행 (포트 80)
pnpm start
```

## npm 스크립트

```bash
# 개발
pnpm dev                 # 개발 서버 실행 (포트 3000)
pnpm dev -- -p 3001     # 다른 포트로 실행

# 빌드
pnpm build              # 프로덕션 빌드

# 실행
pnpm start              # 빌드된 앱 실행 (포트 80)

# 린팅
pnpm lint               # ESLint 검사
pnpm typecheck          # TypeScript 타입 검사

# Prisma
pnpm prisma:generate         # Prisma 클라이언트 생성
pnpm prisma:migrate          # 개발 마이그레이션 실행
pnpm prisma:migrate-deploy   # 프로덕션 마이그레이션 적용
pnpm prisma:migrate-reset    # 마이그레이션 초기화
pnpm prisma:pull             # DB 스키마를 Prisma 스키마로 가져오기
pnpm prisma:studio           # Prisma Studio (DB GUI)
```

## PM2를 사용한 프로덕션 배포

### PM2 설치

```bash
npm install -g pm2
```

### 배포 프로세스

1. **빌드**
   ```bash
   pnpm build
   ```

2. **PM2로 실행**
   ```bash
   pm2 start "pnpm start" --name stockelper-fe
   ```

3. **자동 시작 설정**
   ```bash
   pm2 startup
   pm2 save
   ```

### PM2 관리 명령어

```bash
# 프로세스 목록
pm2 list

# 로그 확인
pm2 logs stockelper-fe
pm2 logs stockelper-fe --lines 100

# 프로세스 재시작
pm2 restart stockelper-fe

# 프로세스 중지
pm2 stop stockelper-fe

# 프로세스 삭제
pm2 delete stockelper-fe

# 모니터링
pm2 monit

# 상세 정보
pm2 show stockelper-fe
```

## GitHub Actions 자동 배포

`main` 브랜치에 push 시 AWS EC2에 자동으로 배포됩니다.

### 배포 설정

자세한 배포 가이드는 [DEPLOY.md](DEPLOY.md)를 참조하세요.

**필수 GitHub Secrets**:
- `EC2_SSH_PRIVATE_KEY`: SSH 개인 키
- `EC2_HOST`: EC2 인스턴스 IP
- `EC2_USER`: EC2 사용자명 (기본: ubuntu)
- `EC2_DEPLOY_PATH`: 배포 경로

### 수동 배포 트리거

1. GitHub 저장소의 Actions 탭으로 이동
2. "Deploy to AWS EC2" 워크플로우 선택
3. "Run workflow" 버튼 클릭

## 개발

### 컴포넌트 추가

shadcn/ui 컴포넌트 추가:
```bash
npx shadcn@latest add [component-name]
```

### API 라우트 추가

1. `src/app/api/` 아래에 디렉토리 생성
2. `route.ts` 파일 생성
3. GET, POST 등 HTTP 메서드 export

예시:
```typescript
// src/app/api/example/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  return NextResponse.json({ message: 'Hello' });
}
```

### 페이지 추가

1. `src/app/(has-layout)/` 아래에 디렉토리 생성
2. `page.tsx` 파일 생성

### 타입 정의

`src/lib/types/` 에 타입 정의 파일 추가

### Prisma 스키마 변경

1. `prisma/schema.prisma` 수정
2. 마이그레이션 생성 및 적용:
   ```bash
   pnpm prisma:migrate
   ```
3. 클라이언트 재생성:
   ```bash
   pnpm prisma:generate
   ```

## 보안

### 주요 보안 사항

1. **환경 변수 관리**
   - `.env` 파일을 절대 커밋하지 마세요
   - `.gitignore`에 `.env` 포함 확인

2. **JWT 보안**
   - 프로덕션에서 강력한 `JWT_SECRET` 사용 (32자 이상)
   - 적절한 만료 시간 설정 (`JWT_EXPIRES_IN`)

3. **비밀번호 보안**
   - bcrypt를 사용한 해싱
   - 최소 8자 이상, 특수문자 포함 권장

4. **API 보안**
   - 미들웨어를 통한 인증 확인
   - CORS 설정
   - Rate limiting (필요 시)

5. **XSS 방지**
   - `rehype-sanitize`를 통한 마크다운 sanitization
   - 사용자 입력 이스케이핑

6. **데이터베이스**
   - Prisma의 파라미터화된 쿼리 사용
   - SQL 인젝션 자동 방지

### 보안 모범 사례

```typescript
// ❌ 나쁜 예
const password = req.body.password;
// 평문 저장

// ✅ 좋은 예
import bcrypt from 'bcryptjs';
const hashedPassword = await bcrypt.hash(password, 10);
// 해시 저장
```

## 문제 해결

### 포트 충돌

```bash
# 다른 포트로 개발 서버 실행
pnpm dev -- -p 3001
```

### Prisma 오류

```bash
# Prisma 클라이언트 재생성
pnpm prisma:generate

# 마이그레이션 재적용
pnpm prisma:migrate
```

### 빌드 오류

```bash
# 캐시 삭제
rm -rf .next

# 의존성 재설치
rm -rf node_modules
pnpm install

# 다시 빌드
pnpm build
```

### 데이터베이스 연결 실패

```bash
# DATABASE_URL 확인
echo $DATABASE_URL

# PostgreSQL 서버 실행 여부 확인
psql $DATABASE_URL -c "SELECT 1"

# 방화벽 설정 확인
```

### PM2 문제

```bash
# PM2 상태 확인
pm2 status

# 로그 확인
pm2 logs stockelper-fe --lines 100

# 프로세스 재시작
pm2 restart stockelper-fe

# PM2 초기화
pm2 kill
pm2 start "pnpm start" --name stockelper-fe
```

### 메모리 부족

```bash
# 빌드 시 메모리 증가
NODE_OPTIONS='--max-old-space-size=4096' pnpm build
```

## 성능 최적화

### Next.js 최적화

1. **이미지 최적화**
   - `next/image` 사용
   - WebP 형식 자동 변환

2. **코드 스플리팅**
   - 동적 import 사용
   ```typescript
   const Component = dynamic(() => import('./Component'));
   ```

3. **캐싱**
   - React Query 캐싱 전략
   - API 응답 캐싱

### 데이터베이스 최적화

```sql
-- 인덱스 추가
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_conversations_user_id ON conversations(user_id);

-- VACUUM 실행
VACUUM ANALYZE;
```

### 번들 크기 분석

```bash
# 번들 분석기 설치
pnpm add -D @next/bundle-analyzer

# 분석 실행
ANALYZE=true pnpm build
```

## 테스트

### 단위 테스트

```bash
# 테스트 실행 (구성 필요)
pnpm test
```

### E2E 테스트

```bash
# Playwright 또는 Cypress 설정 후
pnpm test:e2e
```

## 기여

1. 저장소 포크
2. 기능 브랜치 생성: `git checkout -b feature/my-feature`
3. 변경사항 커밋: `git commit -am 'Add new feature'`
4. 브랜치에 푸시: `git push origin feature/my-feature`
5. Pull Request 생성

### 코딩 스타일

- ESLint 규칙 준수
- TypeScript strict 모드 사용
- 컴포넌트는 함수형으로 작성
- 커밋 메시지는 명확하게

## 라이선스

MIT License

Copyright (c) 2025 Stockelper-Lab

## 지원

- **이슈 리포트**: [GitHub Issues](https://github.com/stockelper-lab/stockelper-fe/issues)
- **기능 요청**: Pull Request
- **문서**: 이 README 및 DEPLOY.md

## 감사의 글

- Next.js 팀
- Vercel
- Prisma 팀
- shadcn/ui
- 모든 오픈소스 기여자

## 추가 자료

- [Next.js 문서](https://nextjs.org/docs)
- [React 문서](https://react.dev)
- [Prisma 문서](https://www.prisma.io/docs)
- [Tailwind CSS 문서](https://tailwindcss.com/docs)
- [배포 가이드](DEPLOY.md)

## 변경 이력

### 2025-01-10
- 포괄적인 README 작성
- 프로젝트 구조 문서화
- API 엔드포인트 상세 설명 추가

### 2025-01-06
- GitHub Actions 자동 배포 설정
- PM2 배포 가이드 추가

### 2025-01-04
- 백테스팅 기능 추가
- 포트폴리오 추천 기능 구현

### 2024-12-22
- 초기 프로젝트 설정
- 인증 시스템 구현
- AI 채팅 기능 추가
