#!/usr/bin/env bash
set -euo pipefail

echo "Auditoria estática de limpeza (heurística)"

echo
echo "[1/3] Entrypoint oficial:"
echo "- index.html"
echo "- apps/web/app-shell/shell.js"

echo
echo "[2/3] Verificando candidatos legados conhecidos..."

candidates=(
  "apps/web/standalone-react.jsx"
  "apps/web/framework-shell.css"
  "apps/web/auth-account-service.js"
  "apps/web/src/app.js"
  "apps/web/src/main.js"
  "apps/web/src/modelagem.js"
  "apps/web/src/dashboard.js"
  "apps/web/src/components.js"
  "apps/web/src/constants.js"
  "apps/web/src/daily-panel.js"
  "apps/web/src/dashboard-navigation.js"
  "apps/web/src/data-gateway.js"
  "apps/web/src/profile-workspace.js"
  "apps/web/src/session-light.js"
  "apps/web/src/auth/auth-entry-form.jsx"
  "apps/web/src/auth/auth-entry-modal.jsx"
  "apps/web/src/auth/auth-entry-notices.jsx"
  "apps/web/src/auth/auth-entry-state.js"
)

for file in "${candidates[@]}"; do
  if [[ -f "$file" ]]; then
    refs=$(rg -n --fixed-strings "$file" index.html apps/web docs scripts README.md 2>/dev/null | wc -l | tr -d ' ')
    echo "- PRESENTE: $file (referências textuais: $refs)"
  else
    echo "- REMOVIDO: $file"
  fi
done

echo
echo "[3/3] Recomendação"
echo "- Se todos os candidatos estiverem como REMOVIDO, a limpeza base de legados foi aplicada."
echo "- Execute check-framework + smoke-runtime para validar contrato e boot."
