#!/bin/bash
# ExifLens 변경사항 Push 스크립트 (더블클릭 실행)
# Claude가 이미 로컬에 커밋해둔 변경사항을 GitHub로 push하고, 끝나면 이 터미널 창을 자동으로 닫습니다.

REPO="$HOME/Desktop/애드센스 제휴 마케팅/exiflens"

if [ ! -d "$REPO/.git" ]; then
  echo "저장소를 찾을 수 없습니다: $REPO"
  read -p "Enter를 누르면 창이 닫힙니다..."
  exit 1
fi

cd "$REPO"

# 이전 작업에서 잠금 파일이 남아있을 수 있어 정리 (실행 중인 다른 git 프로세스가 없을 때만 안전)
[ -f .git/index.lock ] && rm -f .git/index.lock
[ -f .git/HEAD.lock ] && rm -f .git/HEAD.lock

echo "=== ExifLens 변경사항 확인 ==="
UNPUSHED=$(git log origin/main..HEAD --oneline 2>/dev/null)

if [ -z "$UNPUSHED" ]; then
  echo "push할 새 커밋이 없습니다. (원격과 이미 동일)"
  echo "3초 후 창이 닫힙니다."
  sleep 3
else
  echo "push될 커밋 목록:"
  echo "$UNPUSHED"
  echo ""

  # 혹시 커밋되지 않은 변경사항이 남아있으면 push 전에 알림만 하고 건드리지 않음
  if [ -n "$(git status --porcelain)" ]; then
    echo "⚠ 커밋되지 않은 변경사항이 있습니다. 이 스크립트는 자동으로 커밋하지 않으니,"
    echo "  필요하면 Claude에게 먼저 커밋을 요청해 주세요. (지금은 이미 커밋된 것만 push합니다)"
    echo ""
  fi

  echo "=== git push origin main ==="
  git push origin main
  PUSH_STATUS=$?

  if [ $PUSH_STATUS -eq 0 ]; then
    echo ""
    echo "✅ push 완료"
    echo "3초 후 창이 닫힙니다."
    sleep 3
  else
    echo ""
    echo "❌ push 실패 (위 오류 메시지 확인 필요)"
    read -p "Enter를 누르면 창이 닫힙니다..."
    exit 1
  fi
fi

THIS_TTY=$(tty)
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
