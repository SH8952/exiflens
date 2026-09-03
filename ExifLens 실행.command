#!/bin/bash
# 더블클릭으로 ExifLens 개발 서버를 실행하는 원클릭 스크립트입니다.
# 1) 이 파일이 있는 프로젝트 폴더로 이동
# 2) npm run dev 실행 (개발 서버가 준비되면 Chrome이 자동으로 열립니다)

REPO="$(cd "$(dirname "$0")" && pwd)"
SCRIPT_PATH="$REPO/$(basename "$0")"
ICON_PATH="$REPO/src/app/icon.png"

# --- 다른 스크립트와 헷갈리지 않도록 ExifLens 로고 아이콘 적용 ---
# (매번 실행할 때마다 재적용해도 무해함 - 이미 적용돼 있으면 그대로 유지됨)
if [ -f "$ICON_PATH" ]; then
  ICON_RESULT=$(osascript <<APPLESCRIPT 2>&1
use framework "Foundation"
use framework "AppKit"
set theImage to current application's NSImage's alloc()'s initWithContentsOfFile:"$ICON_PATH"
if theImage is missing value then
    return "ERROR: 아이콘 이미지 파일을 읽지 못함 ($ICON_PATH)"
end if
set didSet to current application's NSWorkspace's sharedWorkspace()'s setIcon:theImage forFile:"$SCRIPT_PATH" options:0
if didSet as boolean is false then
    return "ERROR: setIcon 호출은 됐지만 실패로 반환됨 (didSet=false)"
end if
return "OK"
APPLESCRIPT
)
  if [ "$ICON_RESULT" = "OK" ]; then
    touch "$SCRIPT_PATH"
  else
    echo "(로고 아이콘 적용 실패: $ICON_RESULT)"
  fi
fi

cd "$REPO"
echo "▶ ExifLens 개발 서버를 시작합니다: $(pwd)"
echo ""
npm run dev
