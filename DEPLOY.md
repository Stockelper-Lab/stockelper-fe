# AWS EC2 자동 배포 가이드

이 문서는 GitHub Actions를 사용하여 AWS EC2 인스턴스에 자동으로 배포하는 방법을 설명합니다.

## 사전 준비 사항

### 1. EC2 인스턴스 설정

1. **Node.js 설치** (v18 이상 권장)
   ```bash
   # EC2 인스턴스에 SSH 접속 후 실행
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt-get install -y nodejs
   
   # 버전 확인
   node --version
   npm --version
   ```

2. **pnpm 설치** (자동 설치되지만 수동 설치도 가능)
   ```bash
   npm install -g pnpm
   ```

3. **PM2 설치** (자동 설치되지만 수동 설치도 가능)
   ```bash
   npm install -g pm2
   ```

4. **배포 디렉토리 생성**
   ```bash
   mkdir -p /home/ubuntu/stockelper-fe
   chmod 755 /home/ubuntu/stockelper-fe
   ```

5. **포트 설정 확인**
   - 애플리케이션이 사용할 포트(80)가 열려있는지 확인
   - EC2 보안 그룹에서 포트 80 (HTTP) 허용
   - 80 포트는 privileged port이므로 Node.js에 권한 부여 필요:
     ```bash
     sudo setcap 'cap_net_bind_service=+ep' $(which node)
     ```

### 2. SSH 키 생성 및 설정

1. **로컬에서 SSH 키 생성** (이미 있다면 생략)
   ```bash
   ssh-keygen -t ed25519 -C "github-actions-deploy" -f ~/.ssh/ec2_deploy_key
   ```

2. **공개 키를 EC2에 추가**
   ```bash
   # EC2 인스턴스에 접속
   ssh -i ~/.ssh/your-existing-key.pem ubuntu@your-ec2-ip
   
   # authorized_keys에 공개 키 추가
   echo "your-public-key-content" >> ~/.ssh/authorized_keys
   ```

   또는:
   ```bash
   # 로컬에서 실행
   ssh-copy-id -i ~/.ssh/ec2_deploy_key.pub ubuntu@your-ec2-ip
   ```

3. **EC2 보안 그룹 설정**
   - SSH 접속을 위한 포트 22가 열려있는지 확인
   - GitHub Actions IP 대역에서 접속 가능하도록 설정 (또는 모든 IP 허용)

### 3. GitHub Secrets 설정

GitHub 저장소의 Settings > Secrets and variables > Actions에서 다음 Secrets를 추가합니다:

| Secret 이름 | 설명 | 예시 |
|------------|------|------|
| `EC2_SSH_PRIVATE_KEY` | SSH 개인 키 전체 내용 | `-----BEGIN OPENSSH PRIVATE KEY-----...` |
| `EC2_HOST` | EC2 인스턴스 IP 주소 또는 도메인 | `123.45.67.89` 또는 `ec2.example.com` |
| `EC2_USER` | EC2 사용자 이름 | `ubuntu` (기본값) |
| `EC2_DEPLOY_PATH` | 배포 경로 | `/home/ubuntu/stockelper-fe` |

**SSH 개인 키 복사 방법:**
```bash
cat ~/.ssh/ec2_deploy_key
# 출력된 전체 내용을 복사하여 EC2_SSH_PRIVATE_KEY에 붙여넣기
```

### 4. 환경 변수 파일 설정

EC2 인스턴스에 `.env` 파일을 생성합니다:

```bash
# EC2 인스턴스에서 실행
cd /home/ubuntu/stockelper-fe
nano .env
```

필요한 환경 변수:
```env
NODE_ENV=production
DATABASE_URL=postgresql://postgres:postgres@10.0.10.74:5432/llm_users
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
COOKIE_NAME=auth-token
NEXT_PUBLIC_LLM_ENDPOINT=https://stockelper-llm.peo.kr
```

## 배포 프로세스

### 자동 배포

1. `main` 브랜치에 push하면 자동으로 배포가 시작됩니다.
2. GitHub Actions 탭에서 배포 진행 상황을 확인할 수 있습니다.

### 수동 배포

1. GitHub 저장소의 Actions 탭으로 이동
2. "Deploy to AWS EC2" 워크플로우 선택
3. "Run workflow" 버튼 클릭

## 배포 스크립트 동작 방식

1. **코드 체크아웃**: GitHub에서 최신 코드를 가져옵니다.
2. **SSH 설정**: SSH 키를 사용하여 EC2에 접속할 수 있도록 설정합니다.
3. **디렉토리 준비**: 배포 디렉토리를 생성하고 권한을 설정합니다.
4. **파일 전송**: rsync를 사용하여 프로젝트 파일을 EC2로 전송합니다.
5. **배포 실행**: EC2에서 `deploy.sh` 스크립트를 실행하여:
   - Node.js, pnpm, PM2 확인 및 설치
   - 의존성 설치 (`pnpm install`)
   - Prisma 클라이언트 생성
   - 프로젝트 빌드 (`pnpm build`)
   - PM2로 애플리케이션 실행 또는 재시작
   - 상태 확인

## PM2 명령어

배포 후 EC2에서 직접 PM2를 관리할 수 있습니다:

```bash
# 프로세스 목록 확인
pm2 list

# 로그 확인
pm2 logs stockelper-fe

# 프로세스 재시작
pm2 restart stockelper-fe

# 프로세스 중지
pm2 stop stockelper-fe

# 프로세스 삭제
pm2 delete stockelper-fe

# 모니터링
pm2 monit

# PM2 시작 시 자동 실행 설정
pm2 startup
pm2 save
```

## 문제 해결

### SSH 연결 실패
- EC2 보안 그룹에서 포트 22가 열려있는지 확인
- SSH 키가 올바르게 설정되었는지 확인
- EC2_HOST가 올바른지 확인

### 배포 실패
- EC2에서 Node.js가 설치되어 있는지 확인: `node --version`
- 배포 경로에 쓰기 권한이 있는지 확인
- `pm2 logs stockelper-fe`로 로그 확인

### 애플리케이션이 시작되지 않음
- 환경 변수가 올바르게 설정되었는지 확인
- 데이터베이스 연결이 가능한지 확인
- 포트가 이미 사용 중인지 확인: `sudo lsof -i :3000`
- 빌드 오류 확인: `cd $DEPLOY_PATH && pnpm build`

### 권한 오류
- 배포 디렉토리 권한 확인: `ls -la $DEPLOY_PATH`
- 필요시 권한 수정: `sudo chown -R $USER:$USER $DEPLOY_PATH`

### PM2 관련 문제
- PM2가 설치되어 있는지 확인: `pm2 --version`
- PM2 프로세스 상태 확인: `pm2 status`
- PM2 로그 확인: `pm2 logs --lines 100`

## 추가 설정 (선택사항)

### 배포 알림 설정

Slack, Discord 등으로 배포 알림을 받으려면 `.github/workflows/deploy.yml`에 알림 단계를 추가할 수 있습니다.

### 롤백 스크립트

배포 실패 시 이전 버전으로 롤백하는 스크립트를 추가할 수 있습니다.

### Health Check

배포 후 애플리케이션이 정상적으로 동작하는지 확인하는 health check를 추가할 수 있습니다.

### PM2 클러스터 모드

더 많은 성능이 필요한 경우 PM2 클러스터 모드를 사용할 수 있습니다:
```bash
pm2 start "pnpm start" --name stockelper-fe -i max
```

### 리버스 프록시 설정 (Nginx)

포트 3000 대신 80/443 포트로 접근하려면 Nginx를 설정할 수 있습니다.
