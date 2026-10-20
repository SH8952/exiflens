@AGENTS.md


## 백업 위치 규칙 (절대 준수)

이 프로젝트(`exiflens`) 작업 전 백업을 생성할 때는 반드시 **이 폴더 내부**에 만든다: `_backups/exiflens_backup_YYYYMMDD_HHMMSS`
상위 폴더(`Desktop/AdSense Affiliate Marketing/`)에 직접 백업 폴더를 만들지 않는다 (예: `../exiflens_backup_...`, `../_backups/exiflens_backup_...` 전부 금지).

**백업 폴더는 `_backups/` 하나로만 통일한다 (2026-10-21 확정).** `_backups`·`.backups`·`.claude-backups` 등 다른 이름의 백업 폴더를 새로 만들지 않는다.
백업은 `bash automation/make-backup.sh [라벨]` 로 만든다 — `_backups/`, `.next*`(빌드 캐시), `node_modules`, `.git` 은 자동 제외되어 중첩·용량 폭증이 없다.
`_backups/` 안의 백업은 **1주일(7일) 지나면 삭제**한다 (작업 시작 전 백업 생성 시 함께 정리).
