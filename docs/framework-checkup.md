# Check-up estrutural do framework (2026-04-21)

## Status geral

Framework de layout **consolidado como base oficial** para evolução das próximas telas no código modular do app (`apps/web/src`).

## Checklist de validação

- [x] Shell oficial reutilizável identificado (`AppShell`) com `app-shell`, `app-header`, `app-body`, `app-footer`.
- [x] Navegação principal compacta por tab bar em telas compactas.
- [x] Navegação lateral em layouts amplos (tablet paisagem e desktop).
- [x] Breakpoints oficiais documentados e aplicados (mobile/tablet/desktop).
- [x] Distinção de tablet retrato/paisagem registrada e suportada.
- [x] `app-body` como região principal de scroll.
- [x] Bottom nav oculta quando sidebar assume nível 0.
- [x] Lógica de níveis 0/1/2/3 explicitada em documentação e convenções (`data-level` / `data-shell-level`).
- [x] Primitivas estruturais oficiais presentes: bottom nav, sidebar, detail pane, drawer, sheet, overlay.

## Inconsistências corrigidas nesta etapa

1. **Nomenclatura estrutural da sidebar** padronizada para o contrato oficial:
   - `app-sidebar__header`
   - `app-sidebar__nav`
   - `app-sidebar__footer`

2. **Contratos de nível 0** reforçados no markup da navegação principal:
   - `data-level="0"` na sidebar nav e na bottom tab bar.

3. **Clareza de manutenção** dos estilos estruturais:
   - seções explícitas para desktop, tablet paisagem e primitivas de nível.

## Pendências estruturais

Nenhuma pendência estrutural crítica aberta para fechamento da v0.

- ✅ Entrada funcional única definida no runtime atual (`index.html` raiz + `apps/web/app-shell/shell.js`).
- ✅ Check de runtime (`scripts/smoke-runtime.sh`) e check de contrato (`scripts/check-framework.sh`) criados.

## Conclusão

O framework atual está apto para servir como fundação oficial dos próximos módulos.
Fechamento da versão 0 concluído; próxima fase focada em aplicação do framework nas telas.
