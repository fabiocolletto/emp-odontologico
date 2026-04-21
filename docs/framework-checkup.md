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

No fechamento desta etapa, **as duas pendências estruturais anteriores foram resolvidas**:

1. Estilos do framework foram extraídos para `apps/web/framework-shell.css`.
2. Fluxo standalone legado foi removido; o `index.html` agora inicializa o app modular oficial em `apps/web/src/main.js`.

## Conclusão

O framework atual está apto para servir como fundação oficial dos próximos módulos: a próxima fase pode focar em aplicar a base nas telas internas, sem redefinir shell/navegação/níveis.
