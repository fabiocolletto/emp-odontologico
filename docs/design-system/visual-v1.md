# Design System Visual V1 (Oficial)

Status: **oficial e obrigatório** a partir de `v1.1.0`.

## 1. Objetivo

Transformar a base estrutural da V0 em uma fundação visual única, reutilizável e escalável para todo o app, sem CSS improvisado por tela.

## 2. Princípios visuais

- Limpo
- Profissional
- Silencioso
- Moderno
- Coerente com iOS/iPadOS em disciplina de densidade e interação
- Identidade própria do projeto (paleta OdontoFlow)

## 3. Tokens globais oficiais

Arquivo-fonte: `apps/web/styles.css`.

### 3.1 Cores
- `--color-brand-*`
- `--color-neutral-*`
- `--color-success-500`, `--color-warning-500`, `--color-danger-500`, `--color-info-500`

### 3.2 Superfícies e texto
- `--surface-page`, `--surface-solid`, `--surface-soft`, `--surface-elevated`, `--surface-overlay`
- `--text-strong`, `--text-base`, `--text-muted`, `--text-soft`, `--text-on-brand`

### 3.3 Bordas, raios e sombras
- `--border-*`
- `--radius-*`
- `--shadow-*`

### 3.4 Espaçamento, tipografia e ícones
- `--space-*`
- `--font-size-*`, `--font-family-sans`
- `--icon-size-*`

### 3.5 Larguras úteis e densidade
- `--content-max-width`
- `--density-header-height`
- `--density-body-padding`

### 3.6 Estados de interação
- `--state-focus-ring`
- `--state-hover-lift`
- `--state-disabled-opacity`

## 4. Componentes base oficiais

Implementados no CSS e com wrappers React em `apps/web/src/components.js`:

- Botões (`UiButton`)
- Campos (`UiInput`, `UiSelect`, `UiTextarea`, `UiSearchField`)
- Cartões (`UiCard`)
- Badges (`UiBadge`)
- Alertas (`UiAlert`)
- Empty state (`UiEmptyState`)
- Avatar (`UiAvatar`)
- Tabela base (`.ui-table-shell`, `.ui-table`)
- Skeleton (`UiSkeleton`)

## 5. Regras de composição e consistência

1. Não hardcodar cor, raio, sombra e spacing em telas novas.
2. Toda variação visual deve nascer por token/componente base.
3. Não duplicar componente com a mesma função visual.
4. Estados `hover/focus/disabled` devem usar tokens oficiais.
5. `framework-shell.css` mantém contrato estrutural V0; linguagem visual vive no design system.

## 6. O que deve ser preservado nas próximas fases

- Shell, breakpoints, navegação e níveis da V0.
- Tokens da V1 como fonte de verdade visual.
- Componentes base como primeira opção antes de criar variantes.
- Documentação atualizada a cada nova família de componente.

## 7. Estratégia de evolução

Prioridade contínua:
1. Fundação de tokens
2. Componentes base
3. Regras de composição
4. Aplicação incremental nas telas e módulos

## 8. Aplicação prática em módulos reais (V1.1)

Módulos priorizados e tratados:

- **Pacientes (Nível 1)**:
  - cards da grade padronizados com `ui-card`;
  - busca padronizada com `ui-search`;
  - vazio padronizado com `ui-empty-state`;
  - paginação/ações padronizadas com `ui-action-bar`.
- **Painel/Dashboard (Nível 1)**:
  - cards de KPI e bloco de agenda com `ui-card`;
  - itens de agenda com `ui-list-item`;
  - alerta de fallback padronizado com `ui-alert`.
- **Conta (Nível 1 + N2 auxiliar)**:
  - blocos de conta, perfil e clínicas com `ui-card`;
  - lista de clínicas com `ui-list-item`;
  - estado vazio de clínicas com `ui-empty-state`.
- **Configurações (Nível 1)**:
  - bloco principal convergido para `ui-card`.

## 9. Padrões de composição consolidados

- Header interno de módulo + bloco de ações (`ui-action-bar`).
- Busca sempre com `ui-search` dentro do bloco do módulo.
- Conteúdo principal em superfícies `ui-card`.
- Listagens clicáveis usando `ui-list-item`.
- Estados sem dados usando `ui-empty-state`.
- Mensagens de contexto/sistema usando `ui-alert`.

## 10. Decisões de consistência adotadas na V1.1

1. Eliminar classes utilitárias locais para superfícies brancas quando houver `ui-card`.
2. Evitar estados vazios em texto solto; sempre usar `ui-empty-state`.
3. Unificar barra de ações/paginação em `ui-action-bar`.
4. Preservar a arquitetura estrutural V0 (shell, breakpoints, níveis 0/1/2/3) sem desvio.

## 11. Refinamentos aplicados na sequência (V1.1.x)

- Fluxos auxiliares de N2/N3 convergidos para campos do sistema (`ui-input` e `ui-textarea`) em modais de Pacientes, Perfil e Clínicas.
- Fluxos de autenticação (configuração, login e loading) convergidos para superfícies oficiais `ui-card` e estados consistentes com o design system.
- Sem criação de novos módulos/negócio: somente consolidação de consistência visual e previsibilidade de composição.

## 12. Navegação (estética final + comportamento)

- **Sidebar (desktop/wide):**
  - botões de navegação com estado ativo claro, indicador lateral e foco acessível;
  - sem variações paralelas fora da família `btn--nav`.
- **Barra móvel (compact):**
  - ações com estado ativo semântico (`aria-current="page"`);
  - estrutura final em **5 botões** fixos (2 + botão central de navegação + 2);
  - ícone como elemento principal e label abaixo com peso/fonte reduzidos;
  - barra contínua incorporada ao rodapé (sem floating, sem arredondamento);
  - suporta ações contextuais por fluxo (ex.: em Clínica N2: Cancelar, Duplicar, Salvar, Excluir, Arquivar);
  - barra móvel é ocultada enquanto o drawer de navegação inteligente estiver aberto para evitar sobreposição visual.

## 13. Padrão global para telas de cadastro (header/body/footer)

- Toda tela de cadastro/edição N2 deve usar shell comum com:
  - header preservado (padrão atual aprovado),
  - body com formulário,
  - footer informativo de ações.
- Em mobile, as ações principais de cadastro devem ficar concentradas na barra inferior contextual (5 botões), evitando duplicidade de barras/botões no topo.
- Aplicado em: Pacientes N2, Conta N2, Perfil público N2 e Clínicas N2.
- Em Pacientes N2, os chips de etapa (`Identificação`, `Contato`, `Dados clínicos`) são clicáveis para navegação direta, coexistindo com `Anterior`/`Próxima` na barra inferior.
