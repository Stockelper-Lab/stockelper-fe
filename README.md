# Stockelper 프론트엔드

이 프로젝트는 **Next.js 15** 기반의 주식 관련 서비스 프론트엔드입니다.  
Docker 및 npm을 이용해 손쉽게 개발 및 배포할 수 있습니다.

## 📋 주요 기술 스택

- **Frontend**: Next.js 15, React 19, TypeScript
- **Database**: PostgreSQL, Prisma ORM
- **Styling**: Tailwind CSS
- **Authentication**: JWT, bcryptjs
- **UI Components**: Radix UI, Lucide React
- **Notifications**: Sonner (Toast notifications)
- **Deployment**: Docker, Docker Compose

## 🚀 빠른 시작

### 1. 프로젝트 클론

```bash
git clone <repository-url>
cd new-fe
```

### 2. 의존성 설치

```bash
npm install
# 또는
pnpm install
```

### 3. 환경 변수 설정

프로젝트 루트에 `.env` 파일을 생성하고 다음 변수들을 설정하세요:

```env
# 데이터베이스 연결
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/postgres

# JWT 인증
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=7d

# 쿠키 설정
COOKIE_NAME=auth-token

# LLM 서비스 엔드포인트
NEXT_PUBLIC_LLM_ENDPOINT=https://your-llm-service-endpoint

# 환경 설정
NODE_ENV=development
```

### 4. 데이터베이스 마이그레이션

```bash
npm run prisma:migrate
npm run prisma:generate
```

### 5. 개발 서버 실행

```bash
npm run dev
# 또는
pnpm dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)에 접속하여 애플리케이션을 확인하세요.

## 🐳 Docker로 실행하기

### Docker Compose 사용 (권장)

1. **환경 변수 설정**

   ```bash
   cp .env.example .env
   # .env 파일을 실제 환경에 맞게 수정하세요
   ```

2. **서비스 실행**

   ```bash
   docker-compose up -d
   ```

3. **접속 확인**

   - 애플리케이션: [http://localhost:21011](http://localhost:21011)

4. **서비스 중지**
   ```bash
   docker-compose down
   ```

### 개별 Docker 실행

```bash
# 이미지 빌드
docker build -t stockelper-frontend .

# 컨테이너 실행
docker run -p 3000:3000 \
  -e DATABASE_URL="your_database_url" \
  -e JWT_SECRET="your_jwt_secret" \
  stockelper-frontend
```

## 📦 주요 npm 스크립트

| 명령어                    | 설명                           |
| ------------------------- | ------------------------------ |
| `npm run dev`             | 개발 서버 실행 (포트 3000)     |
| `npm run build`           | 프로덕션 빌드                  |
| `npm run start`           | 빌드된 애플리케이션 실행       |
| `npm run lint`            | ESLint 코드 검사               |
| `npm run typecheck`       | TypeScript 타입 검사           |
| `npm run prisma:generate` | Prisma 클라이언트 생성         |
| `npm run prisma:migrate`  | 데이터베이스 마이그레이션 실행 |
| `npm run prisma:studio`   | Prisma Studio 실행 (DB GUI)    |

## 🗃️ 데이터베이스 관리

### 마이그레이션

```bash
# 새 마이그레이션 생성 및 적용
npm run prisma:migrate

# 마이그레이션 리셋 (개발 환경만)
npm run prisma:migrate-reset

# 기존 DB에서 스키마 가져오기
npm run prisma:pull
```

### Prisma Studio

```bash
npm run prisma:studio
```

웹 브라우저에서 데이터베이스를 시각적으로 관리할 수 있습니다.

## 🏗️ 프로젝트 구조

```
src/
├── app/                 # Next.js App Router
│   ├── (has-layout)/   # 레이아웃이 있는 페이지
│   │   ├── settings/   # 설정 페이지들
│   │   │   ├── account/    # 계정 설정 (닉네임, 비밀번호)
│   │   │   ├── kis/        # KIS 증권 API 설정
│   │   │   └── survey/     # 설문조사 재설정
│   │   ├── chat/       # 채팅 페이지
│   │   └── dashboard/  # 대시보드
│   ├── (no-layout)/    # 레이아웃이 없는 페이지
│   │   ├── sign-in/    # 로그인
│   │   └── sign-up/    # 회원가입
│   └── api/            # API 라우트
│       ├── auth/       # 인증 API
│       ├── settings/   # 설정 관련 API
│       └── survey/     # 설문조사 API
├── components/         # React 컴포넌트
│   ├── chat/          # 채팅 관련 컴포넌트
│   ├── ui/            # 공통 UI 컴포넌트
│   └── ...
├── lib/               # 유틸리티 및 설정
│   ├── auth.ts        # 인증 로직
│   ├── db.ts          # 데이터베이스 설정
│   └── ...
├── hooks/             # 커스텀 React 훅
└── generated/         # Prisma 생성 파일
```

## 🔒 보안 및 주의사항

### 환경 변수 보안

- **절대로 `.env` 파일을 git에 커밋하지 마세요!**
- 프로덕션 환경에서는 강력한 JWT_SECRET을 사용하세요
- 데이터베이스 접속 정보를 코드에 하드코딩하지 마세요

### 기본 보안 설정

```env
# 강력한 JWT 시크릿 예시 (실제로는 더 복잡하게)
JWT_SECRET=your_very_long_and_complex_secret_key_min_32_characters

# 프로덕션 환경 설정
NODE_ENV=production
```

## 🚀 배포

### Vercel 배포

```bash
# Vercel CLI 설치
npm i -g vercel

# 배포
vercel --prod
```

### Docker 기반 배포

```bash
# 프로덕션 이미지 빌드
docker build -t stockelper-frontend:latest .

# 컨테이너 실행
docker run -d \
  --name stockelper-frontend \
  -p 3000:3000 \
  --env-file .env.production \
  stockelper-frontend:latest
```

## 🐛 문제 해결

### 일반적인 문제들

1. **포트 충돌**

   ```bash
   # 다른 포트로 개발 서버 실행
   npm run dev -- -p 3001
   ```

2. **Prisma 관련 오류**

   ```bash
   # Prisma 클라이언트 재생성
   npm run prisma:generate
   ```

3. **Docker 권한 문제** (Linux/Mac)
   ```bash
   sudo docker-compose up -d
   ```

### 로그 확인

```bash
# Docker Compose 로그
docker-compose logs -f

# 특정 서비스 로그
docker-compose logs -f nextjs
```

## 🤝 개발 가이드

### 코드 스타일

- ESLint 설정을 따라주세요
- TypeScript 타입을 명시적으로 작성해주세요
- 컴포넌트는 함수형으로 작성해주세요

### 커밋 전 체크리스트

```bash
# 타입 검사
npm run typecheck

# 린트 검사
npm run lint

# 빌드 테스트
npm run build
```

## 🆕 최근 업데이트 (v0.1.0)

### 새로운 기능

- **계정 설정 페이지**: 사용자 닉네임 및 비밀번호 변경 기능
- **KIS 증권 API 설정**: KIS 앱키, 앱시크릿, 계좌번호 관리
- **설문조사 재설정**: 기존 설문조사 답변 수정 기능
- **Sonner 알림 시스템**: react-hot-toast에서 sonner로 교체하여 더 나은 사용자 경험 제공
- **데이터베이스 제약 조건 강화**: 사용자별 고유 제약 조건 추가로 데이터 무결성 향상

### 개선사항

- 설정 페이지 UI/UX 개선
- API 라우트 구조 최적화
- 사용자 인증 및 권한 관리 강화
- 폼 유효성 검사 및 오류 처리 개선

## 📞 문의 및 지원

- 버그 리포트: Issues 탭 활용
- 기능 요청: Pull Request 환영
- 기술적 문의: 이슈로 등록

---

**⚠️ 중요**: 이 프로젝트를 공개 저장소에 올리기 전에 모든 민감 정보(API 키, 데이터베이스 정보, JWT 시크릿 등)가 제거되었는지 확인하세요.
