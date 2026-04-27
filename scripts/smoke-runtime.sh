#!/usr/bin/env bash
set -euo pipefail

echo "Validando entrada funcional do app..."

test -f "apps/web/app-shell/shell.js"
test -f "apps/web/app-shell/index.html"
grep -q "window.location.replace('../../../index.html' + window.location.hash)" apps/web/app-shell/index.html
grep -q "./apps/web/src/home/inicio.html" apps/web/app-shell/shell.js
grep -q "./apps/web/src/financial/financeiro.html" apps/web/app-shell/shell.js
grep -q "type === 'navigate'" apps/web/app-shell/shell.js

echo "Runtime smoke check OK."
