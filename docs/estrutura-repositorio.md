# Estrutura de Repositório

## Objetivo
Padronizar a organização do monorepo para facilitar evolução do MVP para Beta/Escala, com separação clara entre aplicações e documentação.

## Estrutura adotada

- `apps/`: código executável por contexto de produto.
  - `web-demo/`: demo de frontend (shell + módulos JS).
    - `index.html`: shell de renderização.
    - `styles.css`: estilos base.
    - `src/`: código modular da aplicação.
- `docs/`: base documental.
  - `api/`: contratos versionados.
  - `arquitetura/`: decisões estruturais e fundação técnica.
  - `governanca/`: fluxo operacional e Definition of Done.
  - `produto/`: roadmap, backlog de fases e changelog.

## Decisões aplicadas nesta mudança
1. Movido `docs/temporario/*` para `apps/web-demo/*`.
2. Movido `agent.md` para `docs/governanca/agent.md`.
3. Movido `read.md` para `docs/produto/read.md`.
4. Mantido `docs/api/v1.md` e `docs/arquitetura/saas-foundation.md`.

## Convenções futuras
- Novas aplicações devem nascer em `apps/<nome-app>/`.
- Qualquer documentação funcional/arquitetural deve ficar em `docs/`.
- Mudança de estrutura precisa atualizar `README.md` e este documento.
