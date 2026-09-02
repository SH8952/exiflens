#!/bin/bash
# ExifLens 변경사항 Push 스크립트 (더블클릭 실행, 1회용 - 실행 완료 후 자동 삭제됨)

REPO="$HOME/Desktop/애드센스 제휴 마케팅/exiflens"
THIS_SCRIPT="$(cd "$(dirname "$0")" && pwd)/$(basename "$0")"

if [ ! -d "$REPO/.git" ]; then
  echo "저장소를 찾을 수 없습니다: $REPO"
  read -p "Enter를 누르면 창이 닫힙니다..."
  exit 1
fi

cd "$REPO"

# 이전 작업에서 잠금 파일이 남아있을 수 있어 정리
[ -f .git/index.lock ] && rm -f .git/index.lock
[ -f .git/HEAD.lock ] && rm -f .git/HEAD.lock

# 커밋되지 않은 변경사항이 있으면 자동으로 커밋
if [ -n "$(git status --porcelain)" ]; then
  echo "=== 커밋되지 않은 변경사항을 커밋합니다 ==="
  git add -A
  git commit -m "chore: 커밋되지 않은 변경사항 반영 (Push.command 자동 커밋)"
fi

echo "=== push할 커밋 확인 ==="
UNPUSHED=$(git log origin/main..HEAD --oneline 2>/dev/null)

if [ -z "$UNPUSHED" ]; then
  echo "push할 새 커밋이 없습니다. (원격과 이미 동일)"
else
  echo "push될 커밋 목록:"
  echo "$UNPUSHED"
  echo ""
  echo "=== git push origin main ==="
  git push origin main
  PUSH_STATUS=$?

  if [ $PUSH_STATUS -ne 0 ]; then
    echo ""
    echo "❌ push 실패 (위 오류 메시지 확인 필요) - 이 스크립트는 삭제하지 않고 남겨둡니다"
    read -p "Enter를 누르면 창이 닫힙니다..."
    exit 1
  fi
  echo ""
  echo "✅ push 완료"
fi

echo "3초 후 이 스크립트와 터미널 창이 자동으로 사라집니다."
sleep 3

THIS_TTY=$(tty)
rm -f "$THIS_SCRIPT"

osascript <<APPLESCRIPT
tell application "Terminal"
    repeat with w in windows
        try
            if tty of (selected tab of w) is "$THIS_TTY" then close w
        end try
    end repeat
end tell
delay 0.3
try
    tell application "System Events" to keystroke return
end try
APPLESCRIPT
