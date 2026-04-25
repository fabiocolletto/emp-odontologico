# AGENTS.md — Processo de evolução modular da UI Financeira

## Objetivo
Padronizar a evolução da tela **Financeiro** para que 100% dos elementos possam ser reaproveitados em outras telas, com foco em:
- manutenção de longo prazo,
- repetibilidade de entrega,
- deploy contínuo no GitHub Pages,
- escala via componentes React.

## Técnica aprovada para o projeto
Usar **Atomic Design + composição por camadas (Section → Column → Widget → Atom)**:
1. **Page Section**: blocos macro de contexto da página.
2. **Section Columns**: organização responsiva das colunas/linhas internas.
3. **Widgets reutilizáveis**: cartões, tabelas, painéis, filtros, ações.
4. **Átomos CSS**: tokens de cor, espaçamento, tipografia, borda e sombra no `:root`.

## Fluxo padrão (passo a passo)
> Repetir este fluxo em cada evolução de tela.

1. **Mapeamento da UI atual**
   - Identificar elementos duplicados e responsabilidades por bloco.
   - Classificar cada trecho em: seção, coluna, widget, átomo.

2. **Recorte mínimo da sprint**
   - Criar no máximo 1–3 novos componentes reutilizáveis por entrega.
   - Evitar refatoração massiva sem validação incremental.

3. **Extração de componentes**
   - Preferir arquivos em `apps/web/src/financial/` ou `apps/web/src/shared/`.
   - APIs de componente devem ser orientadas a props simples e previsíveis.

4. **Tokens e CSS atômico**
   - Novos valores visuais devem usar variáveis do `:root` em `apps/web/styles.css`.
   - Evitar valores hardcoded quando houver token equivalente.

5. **Integração no shell React**
   - Registrar módulos via namespace global (padrão já existente no projeto).
   - Incluir script no `index.html` antes do `standalone-react.jsx`.

6. **Validação técnica**
   - Executar:
     - `./scripts/check-framework.sh`
     - `./scripts/smoke-runtime.sh`
   - Corrigir regressões antes de commit.

7. **Git e manutenção (boas práticas GitHub)**
   - Commits pequenos, com escopo único.
   - Mensagens no imperativo e foco funcional.
   - PR com resumo, motivação, validação e impacto visual.

8. **Deploy GitHub Pages**
   - Garantir que arquivos referenciados no `index.html` estejam versionados.
   - Evitar dependências não empacotadas fora da estrutura já usada no projeto.

## Critérios de aceitação por etapa
- Componente novo reutilizado em pelo menos 1 ponto real da tela.
- Responsividade preservada (mobile, tablet, desktop).
- Sem quebra de contrato estrutural e runtime smoke.
- Código sem acoplamento desnecessário ao contexto de uma única tela.

## Roadmap incremental sugerido (financeiro → demais telas)
1. Sections e Columns (fundação macro).
2. Hero widgets e cards padronizados.
3. Catálogo de gráficos reutilizáveis (rosca, linha, área, barras).
4. Tabelas, filtros e ações comuns.
5. Modais e formulários reutilizáveis.
6. Aplicar padrão nas telas Agenda, Pacientes, Clínica e Perfil.
