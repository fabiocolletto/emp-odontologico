# Plano de ação — Fechamento da versão 0 (Framework)

## Diagnóstico objetivo

O framework possui base funcional de shell, breakpoints, níveis e primitivas estruturais e, nesta etapa, foi consolidado para fechamento da versão 0.

## Estado já consolidado

- Shell e navegação estrutural definidos (header/body/footer, tabbar, sidebar).
- Breakpoints e comportamento compact/wide definidos.
- Níveis 0/1/2/3 documentados.
- Primitivas oficiais disponíveis (detail pane, drawer, sheet, overlay).
- Contratos documentais (`framework-layout`, `framework-checkup`).

## Escopo executado para fechar a versão 0

### Eixo A — Runtime único oficial
- ✅ Definida entrada oficial funcional no `index.html` da raiz com shell HTML/CSS/JS puro.
- ✅ Runtime estabilizado para evitar regressão de tela branca.
- ✅ Contrato de evolução modular mantido em `apps/web/src` para próximas etapas de aplicação.

### Eixo B — Pipeline de build/test
- ✅ Adicionado smoke check de runtime: `scripts/smoke-runtime.sh`.
- ✅ Adicionado check de contrato estrutural: `scripts/check-framework.sh`.
- ✅ Checks executáveis localmente sem dependência externa adicional.

### Eixo C — Governança de versão
- ✅ Versão exibida sincronizada para `1.0.0`.
- ✅ Changelog consolidado com fechamento da versão 0 e início da versão 1.

## Critérios para declarar “Framework v0 concluído”

1. ✅ Runtime único oficial definido e estável.
2. ✅ Smoke test de boot passando.
3. ✅ Contratos de shell/breakpoints/níveis preservados e verificáveis.
4. ✅ Changelog consolidado de encerramento da versão 0.

## Marco de transição para versão 1

Com os critérios cumpridos:

- criar release de consolidação `v0.x-final` (encerramento da etapa framework),
- publicar entrada de início de ciclo `v1.0.0` focada em aplicação dos módulos/telas sobre a base consolidada (sem reinvenção estrutural).
