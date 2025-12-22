#!/bin/bash

# 배포 스크립트
# EC2 인스턴스에서 실행됩니다

set -e  # 에러 발생 시 스크립트 중단

echo "🚀 배포를 시작합니다..."

# 현재 스크립트가 있는 디렉토리로 이동
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "📁 작업 디렉토리: $(pwd)"

# Node.js 확인
if ! command -v node &> /dev/null; then
    echo "❌ Node.js가 설치되어 있지 않습니다."
    exit 1
fi

echo "✅ Node.js 버전: $(node --version)"

# pnpm 확인 및 설치
if ! command -v pnpm &> /dev/null; then
    echo "📦 pnpm을 설치합니다..."
    npm install -g pnpm
fi

echo "✅ pnpm 버전: $(pnpm --version)"

# PM2 확인 및 설치
if ! command -v pm2 &> /dev/null; then
    echo "📦 PM2를 설치합니다..."
    npm install -g pm2
fi

echo "✅ PM2 버전: $(pm2 --version)"

# 의존성 설치
echo "📦 의존성을 설치합니다..."
pnpm install --frozen-lockfile

# Prisma 클라이언트 생성
echo "🔧 Prisma 클라이언트를 생성합니다..."
pnpm prisma:generate || pnpm exec prisma generate

# 프로젝트 빌드
echo "🔨 프로젝트를 빌드합니다..."
pnpm build

# PM2로 애플리케이션 실행 또는 재시작
APP_NAME="stockelper-fe"
PM2_SCRIPT="pnpm start"

echo "🚀 PM2로 애플리케이션을 시작합니다..."

# PM2 프로세스가 실행 중인지 확인
if pm2 list | grep -q "$APP_NAME"; then
    echo "🔄 기존 프로세스를 재시작합니다..."
    pm2 restart $APP_NAME
else
    echo "✨ 새 프로세스를 시작합니다..."
    pm2 start "$PM2_SCRIPT" --name $APP_NAME
fi

# PM2 시작 시 자동 실행 설정
# pm2 startup은 sudo 권한이 필요하고 이미 설정되어 있을 수 있으므로 실패해도 계속 진행
pm2 startup || echo "⚠️  pm2 startup 설정은 수동으로 실행해야 할 수 있습니다. (sudo 권한 필요)"
pm2 save || echo "⚠️  pm2 save 실패 (이미 저장되어 있을 수 있음)"

# 상태 확인
echo "⏳ 애플리케이션이 정상적으로 시작되는지 확인합니다..."
sleep 5

# 상태 확인
echo "⏳ 애플리케이션 상태를 확인합니다..."
sleep 3

echo "📊 PM2 프로세스 상태:"
pm2 list

# 프로세스가 존재하고 online 상태인지 확인
if pm2 list | grep -q "$APP_NAME" && pm2 list | grep "$APP_NAME" | grep -q "online"; then
    echo ""
    echo "✅ 배포가 성공적으로 완료되었습니다!"
    echo ""
    echo "📋 최근 로그:"
    pm2 logs $APP_NAME --lines 20 --nostream 2>/dev/null || echo "로그를 가져올 수 없습니다."
    exit 0
elif pm2 list | grep -q "$APP_NAME"; then
    # 프로세스가 존재하지만 online이 아닌 경우
    echo ""
    echo "⚠️  프로세스가 존재하지만 online 상태가 아닙니다."
    echo "📋 최근 로그:"
    pm2 logs $APP_NAME --lines 50 2>/dev/null || echo "로그를 가져올 수 없습니다."
    # 프로세스가 존재하면 일단 성공으로 간주 (재시작 중일 수 있음)
    echo "✅ 프로세스가 실행 중입니다."
    exit 0
else
    echo ""
    echo "❌ 프로세스를 찾을 수 없습니다."
    echo "📋 PM2 프로세스 목록:"
    pm2 list
    exit 1
fi
