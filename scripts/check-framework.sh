#!/usr/bin/env bash
set -euo pipefail

echo "Validando contrato estrutural do framework..."

test -f "docs/framework-layout.md"
test -f "docs/framework-checkup.md"
test -f "apps/web/framework-shell.css"
test -f "index.html"

grep -q "framework-shell.css" index.html
grep -q "standalone-react.jsx" index.html
grep -q "Nível 0" docs/framework-layout.md
grep -q "Nível 1" docs/framework-layout.md
grep -q "Nível 2" docs/framework-layout.md
grep -q "Nível 3" docs/framework-layout.md

echo "Contrato estrutural OK."
