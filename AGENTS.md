# AGENTS.md — Processo de evolução modular da UI OdontoFlow

## Leitura obrigatória antes de alterar UI
1. Ler `docs/UI_GUIDELINES.md`.
2. Reusar classes/componentes oficiais `.of-*`.
3. Não criar padrão visual paralelo se já existir equivalente.

## Objetivo
Padronizar evolução da UI para desktop, tablet e celular, mantendo:
- manutenção de longo prazo,
- repetibilidade de entrega,
- deploy contínuo no GitHub Pages,
- escala via componentes reutilizáveis.

## Diretrizes obrigatórias para agentes
1. Preservar navegação, rotas e comportamento funcional existente.
2. Não quebrar página Financeiro nem dados simulados.
3. Não adicionar framework pesado.
4. Preservar stack atual (HTML, CSS e JS puro + shell já existente).
5. Usar tokens CSS (`--of-*` e tokens globais existentes).
6. Evitar overflow horizontal global.
7. Testar responsividade em mobile/tablet/desktop.
8. Documentar novos padrões oficiais em `docs/UI_GUIDELINES.md`.
9. Não alterar rotas públicas sem necessidade.
10. Toda nova tela deve declarar/seguir nível de navegação (`data-nav-level` ou `.of-view-level-*`).

## Técnica aprovada
Usar composição por camadas:
1. **Shell/Page Section**
2. **Section Columns**
3. **Data Section + Data Columns**
4. **Widgets reutilizáveis**
5. **Átomos CSS via tokens**

## Fluxo padrão
1. Mapear UI atual e componentes duplicados.
2. Definir recorte mínimo da sprint (incremental).
3. Extrair componentes para `apps/web/src/shared/` quando aplicável.
4. Aplicar tokens globais, sem hardcode desnecessário.
5. Integrar no shell React via namespace global já usado no projeto.
6. Validar com:
   - `bash ./scripts/check-framework.sh`
   - `bash ./scripts/smoke-runtime.sh`
7. Commits pequenos, foco funcional, PR com impacto visual e validação.

## Critérios de aceitação
- Componente novo reutilizado em ponto real da UI.
- Responsividade preservada.
- Sem quebra de contrato estrutural/runtime.
- Sem acoplamento desnecessário a uma única tela.
