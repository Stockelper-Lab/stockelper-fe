#!/bin/bash

# 배포 스크립트
# EC2 인스턴스에서 실행됩니다

set -e  # 에러 발생 시 스크립트 중단

echo "🚀 배포를 시작합니다..."

# 현재 스크립트가 있는 디렉토리로 이동
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "📁 작업 디렉토리: $(pwd)"

# Docker 및 Docker Compose 확인
if ! command -v docker &> /dev/null; then
    echo "❌ Docker가 설치되어 있지 않습니다."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose가 설치되어 있지 않습니다."
    exit 1
fi

# 기존 컨테이너 중지 및 제거
echo "📦 기존 컨테이너를 중지합니다..."
docker-compose down || true

# 이미지 정리 (선택사항 - 디스크 공간 확보)
echo "🧹 오래된 이미지를 정리합니다..."
docker system prune -f

# Docker Compose로 빌드 및 실행
echo "🔨 새 이미지를 빌드합니다..."
docker-compose build --no-cache

echo "🚀 컨테이너를 시작합니다..."
docker-compose up -d

# 컨테이너 상태 확인
echo "⏳ 컨테이너가 정상적으로 시작되는지 확인합니다..."
sleep 10

if docker-compose ps | grep -q "Up"; then
    echo "✅ 배포가 성공적으로 완료되었습니다!"
    docker-compose ps
else
    echo "❌ 배포 중 오류가 발생했습니다."
    docker-compose logs
    exit 1
fi

# 로그 확인 (선택사항)
echo "📋 최근 로그:"
docker-compose logs --tail=50

