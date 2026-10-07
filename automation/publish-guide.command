#!/bin/bash
# ExifLens 가이드 자동 발행 스크립트 (영구 설치형)
# 이 파일은 최초 1회만 다운로드해서 실행하면 저장소 안에 스스로 설치됩니다.
# 이후에는 이 파일을 다시 받을 필요 없이, 저장소의 automation 폴더에 있는
# 이 스크립트를 계속 재사용하시면 매번 보안 경고 없이 실행됩니다.
# 2026-09-08: 예약 작업이 결과물 6개 파일을 zip 1개로 묶어 전달하도록 변경됨에 따라,
# 이 폴더에 zip 파일이 있으면 먼저 자동으로 압축을 풀고 진행하도록 수정.
# 2026-10-02: 하루 2건(이상) 발행 체제에 맞춰, zip 안에 guide-*-en.mdx가 여러 개
# 있으면 전부 반복 처리하도록 수정 (기존에는 ls ... | head -n1 로 1건만 처리해
# 나머지 콘텐츠가 조용히 누락되는 문제가 있었음 - 2026-10-02 원인분석에서 확인).

REPO="$HOME/Desktop/AdSense Affiliate Marketing/exiflens"
SCRIPT_NAME="publish-guide.command"
SCRIPT_PATH="$REPO/automation/$SCRIPT_NAME"

if [ ! -d "$REPO/.git" ]; then
  echo "저장소를 찾을 수 없습니다: $REPO"
  echo "이 스크립트는 exiflens 저장소가 있는 맥에서만 동작합니다."
  read -p "Enter를 누르면 창이 닫힙니다..."
  exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
CURRENT_PATH="$SCRIPT_DIR/$(basename "$0")"

# --- 1. 최초 실행이면 저장소 안에 스스로 설치 (재다운로드가 없어야 보안 경고가 재발하지 않음) ---
if [ "$CURRENT_PATH" != "$SCRIPT_PATH" ]; then
  echo "=== 발행 스크립트를 저장소에 설치합니다 ==="
  mkdir -p "$REPO/automation"
  cp "$CURRENT_PATH" "$SCRIPT_PATH"
  chmod +x "$SCRIPT_PATH"
  # 격리(quarantine) 속성 제거: 이후 실행 시 "확인되지 않은 개발자" 경고가 다시 뜨지 않도록 함
  xattr -d com.apple.quarantine "$SCRIPT_PATH" 2>/dev/null
  xattr -cr "$SCRIPT_PATH" 2>/dev/null

  cd "$REPO"
  [ -f .git/index.lock ] && rm -f .git/index.lock
  [ -f .git/HEAD.lock ] && rm -f .git/HEAD.lock
  git add "automation/$SCRIPT_NAME"
  if ! git diff --cached --quiet; then
    git commit -m "chore: 가이드 자동 발행 스크립트를 저장소에 영구 설치 (매일 재다운로드로 인한 Gatekeeper 경고 문제 해결)"
    git push origin main
  fi

  echo "설치 완료: $SCRIPT_PATH"
  echo "내일부터는 새 스크립트 파일 없이 콘텐츠 파일(mdx 4개 + json + txt)만 전달됩니다."
  echo "전달받은 콘텐츠 파일들을 아래 폴더에 넣고, 그 안의 이 스크립트를 다시 실행하시면 됩니다:"
  echo "  $REPO/automation/"
  echo ""
fi

# --- 1.5. 다른 스크립트와 헷갈리지 않도록 알람시계 아이콘 적용 ---
# (매번 실행할 때마다 재적용해도 무해함 - 이미 적용돼 있으면 그대로 유지됨)
ICON_PATH="$REPO/automation/assets/publish-guide-icon.png"
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
    echo "(알람시계 아이콘 적용 실패: $ICON_RESULT)"
  fi
fi

# --- 1.9. 발행 패키지가 zip으로 전달된 경우 자동 압축 해제 ---
cd "$SCRIPT_DIR"
ZIP_COUNT=$(ls -1 *.zip 2>/dev/null | wc -l | tr -d ' ')
if [ "$ZIP_COUNT" -gt 0 ]; then
  echo "=== 발행 패키지 zip 파일을 발견해 압축을 해제합니다 ==="
  for ZIP_FILE in *.zip; do
    echo "압축 해제 중: $ZIP_FILE"
    if unzip -o "$ZIP_FILE" -d . >/dev/null; then
      rm -f "$ZIP_FILE"
    else
      echo "오류: $ZIP_FILE 압축 해제 실패."
      read -p "Enter를 누르면 창이 닫힙니다..."
      exit 1
    fi
  done
  echo ""
fi

# --- 2. 발행할 콘텐츠가 있는지 확인 (스크립트와 같은 폴더에서 탐색) ---
# 2026-10-02: 1건만 집어오던 것을, 폴더 안의 guide-*-en.mdx 전부를 모아
# 반복 처리하도록 변경 (하루 2건 이상 발행 시 누락 방지).
shopt -s nullglob
EN_FILES=(guide-*-en.mdx)
shopt -u nullglob

if [ "${#EN_FILES[@]}" -eq 0 ]; then
  if [ "$CURRENT_PATH" != "$SCRIPT_PATH" ]; then
    echo "오늘은 발행할 콘텐츠 파일이 없어 설치만 진행했습니다."
  else
    echo "발행할 콘텐츠 파일(guide-*-en.mdx 등)을 찾을 수 없습니다."
    echo "오늘 전달받은 zip(또는 개별 파일)을 이 폴더에 넣은 뒤 다시 실행해 주세요:"
    echo "  $SCRIPT_DIR"
  fi
  read -p "Enter를 누르면 창이 닫힙니다..."
  exit 0
fi

SLUGS=()
for EN_FILE in "${EN_FILES[@]}"; do
  SLUG="${EN_FILE#guide-}"
  SLUG="${SLUG%-en.mdx}"
  SLUGS+=("$SLUG")
done

echo "=== ExifLens 가이드 자동 발행: 오늘 ${#SLUGS[@]}건 처리 (${SLUGS[*]}) ==="

# --- 3. 작업 전 백업 (always-backup-before-work 규칙, 이번 실행 전체에 1회만) ---
BACKUP_DIR="$REPO/_backups/exiflens_backup_$(date +%Y%m%d_%H%M%S)"
mkdir -p "$REPO/_backups"
echo "백업 생성 중: $BACKUP_DIR"
if command -v rsync >/dev/null 2>&1; then
  rsync -a --exclude 'node_modules' --exclude '.next' --exclude '.git' --exclude '_backups' "$REPO/" "$BACKUP_DIR/"
else
  cp -r "$REPO" "$BACKUP_DIR"
fi

# --- 3.5. 큐 파일 반영 (오늘 처리할 전체 항목이 이미 반영된 상태로 전달됨, 1회만) ---
cp "new-queue.json" "$REPO/automation/guide-topics-queue.json"

cd "$REPO"
[ -f .git/index.lock ] && rm -f .git/index.lock
[ -f .git/HEAD.lock ] && rm -f .git/HEAD.lock

FAILED_SLUGS=()

for SLUG in "${SLUGS[@]}"; do
  echo ""
  echo "--- 처리 중: $SLUG ---"

  # 이번 건에 필요한 4개 언어 파일이 모두 있는지 먼저 확인 (하나라도 없으면 이 건은 건너뜀)
  MISSING=0
  for LOCALE in en ja ko es; do
    if [ ! -f "$SCRIPT_DIR/guide-${SLUG}-${LOCALE}.mdx" ]; then
      echo "경고: guide-${SLUG}-${LOCALE}.mdx 가 없습니다. 이 건은 건너뜁니다."
      MISSING=1
    fi
  done
  if [ "$MISSING" -eq 1 ]; then
    FAILED_SLUGS+=("$SLUG")
    continue
  fi

  TITLE=$(python3 -c "
import json
try:
    q = json.load(open('$SCRIPT_DIR/new-queue.json', encoding='utf-8'))
    topics = q['topics'] if isinstance(q, dict) and 'topics' in q else q
    for item in topics:
        if item.get('slug') == '$SLUG':
            print(item.get('titleKo', ''))
            break
except Exception:
    pass
" 2>/dev/null)
  TITLE="${TITLE:-$SLUG}"

  # --- 콘텐츠 반영 ---
  cp "$SCRIPT_DIR/guide-${SLUG}-en.mdx" "$REPO/content/guides/en/${SLUG}.mdx"
  cp "$SCRIPT_DIR/guide-${SLUG}-ja.mdx" "$REPO/content/guides/ja/${SLUG}.mdx"
  cp "$SCRIPT_DIR/guide-${SLUG}-ko.mdx" "$REPO/content/guides/ko/${SLUG}.mdx"
  cp "$SCRIPT_DIR/guide-${SLUG}-es.mdx" "$REPO/content/guides/es/${SLUG}.mdx"

  # --- 디스커버 노출 대비 대표 이미지 자동 첨부 (Unsplash) ---
  # 실패해도(네트워크 오류, API 키 없음 등) 발행 자체는 계속 진행됨 - 스크립트 내부에서 처리
  python3 "$REPO/automation/attach-guide-image.py" "$REPO" "$SLUG"

  IMAGE_PATH="public/guides/images/${SLUG}.webp"
  git add "content/guides/en/${SLUG}.mdx" "content/guides/ja/${SLUG}.mdx" "content/guides/ko/${SLUG}.mdx" "content/guides/es/${SLUG}.mdx"
  [ -f "$REPO/$IMAGE_PATH" ] && git add "$IMAGE_PATH"
  # 대표 이미지 설명(alt) 목록: attach-guide-image.py가 갱신했을 수 있음 (변경 없으면 add해도 무해)
  [ -f "$REPO/content/guides/image-alt.json" ] && git add "content/guides/image-alt.json"

  # CHANGELOG는 오늘 처리하는 전체 건이 한 스니펫(changelog-snippet.txt)에 모두
  # 들어있는 구조이므로, 여러 건을 반복 처리해도 중복 삽입되지 않도록 아래에서
  # "이미 포함돼 있으면 건너뜀" 처리됨 (기존 로직과 동일, idempotent).
  python3 -c "
import pathlib
repo = pathlib.Path('$REPO')
changelog = repo / 'CHANGELOG.md'
snippet_path = pathlib.Path('$SCRIPT_DIR/changelog-snippet.txt')
if snippet_path.exists():
    snippet = snippet_path.read_text(encoding='utf-8')
    content = changelog.read_text(encoding='utf-8')
    anchor = '# 개발 이력 (Development History)\n\n'
    if anchor in content and snippet.strip() not in content:
        content = content.replace(anchor, anchor + snippet + '\n', 1)
        changelog.write_text(content, encoding='utf-8')
"
  git add CHANGELOG.md automation/guide-topics-queue.json

  if ! git diff --cached --quiet; then
    git commit -m "feat: 가이드 아티클 추가 - ${TITLE} (자동 발행)"
  else
    echo "경고: $SLUG 에 대해 커밋할 변경사항이 없습니다 (이미 반영된 상태일 수 있음)."
  fi
done

echo ""
echo "=== 전체 커밋 push 중... ==="
git push origin main
PUSH_RC=$?

# --- 4.5. IndexNow 알림 (2026-10-07 추가) ---
# push가 성공했을 때만, 이번에 발행한 건의 주소를 Bing·Naver·Yandex 등에 알립니다.
# 배포가 끝날 때까지 기다렸다가 전송하므로 백그라운드로 분리해 실행하며(이 창은 바로 닫힘),
# 실패해도 발행에는 영향이 없습니다. 기록: ~/Library/Logs/exiflens-indexnow.log
if [ "$PUSH_RC" -eq 0 ] && [ -f "$REPO/automation/indexnow-submit.py" ]; then
  INDEXNOW_SLUGS=()
  for S in "${SLUGS[@]}"; do
    SKIP=0
    for F in "${FAILED_SLUGS[@]}"; do [ "$F" = "$S" ] && SKIP=1; done
    [ "$SKIP" -eq 0 ] && INDEXNOW_SLUGS+=("$S")
  done
  if [ "${#INDEXNOW_SLUGS[@]}" -gt 0 ]; then
    if python3 "$REPO/automation/indexnow-submit.py" --detach --slugs "${INDEXNOW_SLUGS[@]}"; then
      echo "IndexNow 알림 예약됨: 배포 완료 후 자동 전송 (${INDEXNOW_SLUGS[*]})"
    else
      echo "(IndexNow 알림 예약 실패 - 발행에는 영향 없음)"
    fi
  fi
fi

# --- 5. 정리 (스크립트 자신은 삭제하지 않음) ---
for SLUG in "${SLUGS[@]}"; do
  rm -f "$SCRIPT_DIR/guide-${SLUG}-en.mdx" "$SCRIPT_DIR/guide-${SLUG}-ja.mdx" "$SCRIPT_DIR/guide-${SLUG}-ko.mdx" "$SCRIPT_DIR/guide-${SLUG}-es.mdx"
done
rm -f "$SCRIPT_DIR/new-queue.json" "$SCRIPT_DIR/changelog-snippet.txt"

echo ""
echo "발행 완료: ${#SLUGS[@]}건 (${SLUGS[*]})"
if [ "${#FAILED_SLUGS[@]}" -gt 0 ]; then
  echo "건너뛴 건 (언어별 mdx 파일 누락): ${FAILED_SLUGS[*]}"
fi
echo "백업 위치: $BACKUP_DIR"
echo "3초 후 이 창이 닫힙니다."
sleep 3
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
