#!/usr/bin/env node
/**
 * Runs `next dev` and, once the dev server reports it's ready, opens the
 * app in Google Chrome automatically (macOS/Windows/Linux).
 *
 * Used by `npm run dev`. If you don't want the browser to open, use
 * `npm run dev:plain` instead.
 */
import { spawn, exec, execSync } from "node:child_process";

const URL_REGEX = /(https?:\/\/localhost:\d+)/;
const FALLBACK_URL = "http://localhost:3000";
const FALLBACK_DELAY_MS = 8000;

const child = spawn("next", ["dev"], {
  stdio: ["inherit", "pipe", "inherit"],
  shell: process.platform === "win32",
});

let opened = false;

child.stdout.on("data", (chunk) => {
  const text = chunk.toString();
  process.stdout.write(text);

  if (!opened) {
    const match = text.match(URL_REGEX);
    if (match) {
      opened = true;
      openInChrome(match[1]);
    }
  }
});

const fallbackTimer = setTimeout(() => {
  if (!opened) {
    opened = true;
    openInChrome(FALLBACK_URL);
  }
}, FALLBACK_DELAY_MS);

function openInChrome(url) {
  clearTimeout(fallbackTimer);

  let cmd;
  switch (process.platform) {
    case "darwin":
      cmd = `open -a "Google Chrome" "${url}"`;
      break;
    case "win32":
      cmd = `start chrome "${url}"`;
      break;
    default:
      cmd = `google-chrome "${url}" || xdg-open "${url}"`;
      break;
  }

  exec(cmd, (err) => {
    if (err) {
      console.warn(
        `\n⚠ Couldn't auto-open Chrome (is it installed?). Open manually: ${url}\n`,
      );
    }
  });
}

function shutdown() {
  child.kill("SIGTERM");
  process.exit(0);
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

// next dev(child)는 마지막 브라우저 탭이 닫히면(src/app/api/dev/watch)
// 일반적인 종료가 아니라 exit code 42로 스스로를 종료시킨다 - 이 경우
// 여기서 macOS 터미널 창까지 자동으로 닫아준다. (Ctrl+C 등 사용자가 직접
// 종료한 경우는 SIGTERM 경로를 타므로 이 분기와 무관함)
child.on("exit", (code) => {
  if (code === 42 && process.platform === "darwin") {
    closeTerminalWindow();
    return;
  }
  process.exit(code ?? 0);
});
child.on("error", (err) => {
  console.error(err);
  process.exit(1);
});

function closeTerminalWindow() {
  console.log(
    "\n마지막 브라우저 탭이 닫혀 개발 서버를 종료합니다. 3초 후 이 창도 자동으로 닫힙니다.\n",
  );
  try {
    const tty = execSync("tty", { stdio: ["inherit", "pipe", "ignore"] })
      .toString()
      .trim();
    const script = `
sleep 3
osascript <<APPLESCRIPT
tell application "Terminal"
    repeat with w in windows
        try
            if tty of (selected tab of w) is "${tty}" then close w
        end try
    end repeat
end tell
delay 0.3
try
    tell application "System Events" to keystroke return
end try
APPLESCRIPT
`;
    spawn("bash", ["-c", script], { detached: true, stdio: "ignore" }).unref();
  } catch (err) {
    console.warn("터미널 자동 종료 실패 (수동으로 닫아주세요):", err.message);
  }
  setTimeout(() => process.exit(0), 200);
}
