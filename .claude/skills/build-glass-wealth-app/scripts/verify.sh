#!/usr/bin/env bash
set -euo pipefail

echo "== Glass Wealth App verification =="

if [[ -f pnpm-lock.yaml ]]; then
  PM="pnpm"
elif [[ -f yarn.lock ]]; then
  PM="yarn"
elif [[ -f bun.lockb || -f bun.lock ]]; then
  PM="bun"
elif [[ -f package-lock.json ]]; then
  PM="npm"
else
  PM="npm"
fi

echo "Package manager: $PM"

run_script() {
  local script="$1"
  if node -e "const p=require('./package.json'); process.exit(p.scripts && p.scripts['$script'] ? 0 : 1)" 2>/dev/null; then
    echo "-- $script"
    case "$PM" in
      npm) npm run "$script" ;;
      yarn) yarn "$script" ;;
      pnpm) pnpm "$script" ;;
      bun) bun run "$script" ;;
    esac
  else
    echo "-- skip $script (script absent)"
  fi
}

if [[ ! -f package.json ]]; then
  echo "No package.json found. Adapt verification to the repository stack."
  exit 0
fi

run_script format:check
run_script lint
run_script typecheck
run_script test
run_script build

echo "== Verification complete =="
