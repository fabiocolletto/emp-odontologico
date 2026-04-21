#!/usr/bin/env bash
set -euo pipefail

echo "Validando entrada funcional do app..."

test -f "apps/web/standalone-react.jsx"
grep -q 'type="text/babel"' index.html
grep -q './apps/web/standalone-react.jsx' index.html

echo "Runtime smoke check OK."
