# Changelog

Todos os ajustes relevantes de deploy devem ser registrados aqui para facilitar validação no GitHub Pages.

## v0.1.23 - 2026-04-19

### Changed
- Botão de `Filtro` renomeado para `Ordenação` em todas as entradas de navegação e no header.
- Total de registros exibidos movido para baixo do campo de pesquisa como legenda (`search-legend`).
- Fundos dos botões do header e da barra lateral ajustados para semitransparência, alinhando com o padrão visual glassmorphism do header mobile.

## v0.1.22 - 2026-04-19

### Changed
- Botão de filtro/ordenação removido da linha de busca e movido para a linha 2 do header (quick-links e ações padrão).
- Filtro/ordenação agora abre uma janela independente em novo nível (`selector-level`), desacoplada da seção de pesquisa atual.

## v0.1.21 - 2026-04-19

### Changed
- Campo de ordenação na N1 de pacientes sem exibir o título `Ordenar` ao lado da busca.
- Sessões de botões com fundo transparente e botões semitransparentes mantidos no padrão glassmorphism em todas as telas.
- Busca e ordenação forçadas na mesma linha; em mobile, o texto do campo de ordenação é ocultado para preservar layout horizontal.

## v0.1.20 - 2026-04-19

### Changed
- Janela de seleção única (`SingleSelectionField`) passou a usar dropdown customizado em HTML/CSS/JS, removendo o popup nativo do sistema.
- Novo padrão visual para janelas seletoras (`.selector-window`, `.selector-window__option`) alinhado à estética do app.
- Adicionada base reutilizável para outros campos seletivos (ex.: data/hora) com `.selector-input` para evitar aparência padrão do sistema em futuras telas.

## v0.1.19 - 2026-04-19

### Changed
- Ícone de abertura do detalhe N2 dentro do card de paciente alterado para ícone de expansão (`expand`).
- Botões de navegação recebem variação de cor por destino, mantendo transparência/glassmorphism:
  - barra lateral (`overview`, `patients`, `settings`);
  - quick-links de navegação (`overview`, `agenda`, `patients`, `new`, `search`, `multi`, `settings`);
  - navegação mobile N2 (`prev`, `next`, `map`).

## v0.1.18 - 2026-04-19

### Changed
- Padronização global de botões para todos os níveis/sessões/telas:
  - base `.btn`, `.ui-btn`, `.quick-links-btn` e `.modal-action-btn` agora compartilham o mesmo estilo sólido com glassmorphism.
  - variações passam a alterar principalmente exibição de título/posição, mantendo a mesma configuração visual.
- Aplicado também aos botões internos de cards (ex.: botão de abrir/editar registro em `patient-card__open` via `.btn--icon`).

## v0.1.17 - 2026-04-19

### Changed
- O botão de criação foi generalizado para cenários de telas de dados:
  - `AddRecordButton` substitui o antigo botão específico de paciente.
  - aceita `label` e `ariaLabel`, mantendo o mesmo padrão visual (`HeaderActionButton` + `tone="new"`).
- Na Base de Pacientes, o uso permanece como `Novo paciente`, agora via componente genérico reutilizável.

## v0.1.16 - 2026-04-19

### Changed
- Removido o caractere `+` do botão `Novo paciente` no header para evitar redundância com o ícone.
- Criados elementos atômicos reutilizáveis para ações de header:
  - `HeaderActionButton` (base)
  - `NewPatientButton`
  - `SearchToggleButton`
  - `MultiToggleButton`
- A tela Base de Pacientes passa a consumir esses elementos, facilitando reuso em outras telas.

## v0.1.15 - 2026-04-19

### Changed
- Header N1 (ex.: Base de Pacientes): container do carrossel de atalhos ajustado para fundo totalmente transparente.
- Botões do header de pacientes (desktop) agora usam cores únicas por ação, mantendo mesmo peso visual:
  - `+ Novo paciente` (azul-ciano)
  - `Pesquisar` (azul)
  - `Modo multi` (verde)
- Adicionado seletor reutilizável de escolha única (`SingleSelectionField`) e aplicado na base de pacientes para ordenação por campos primários do card (nome, telefone, última visita, nascimento e plano).

## v0.1.14 - 2026-04-19

### Changed
- Botões `Pesquisar` e `Modo multi` da base de pacientes passam a usar o mesmo peso visual do botão `+ Novo paciente` no header (mesmo componente visual `.btn.btn--primary.btn--header`).
- Definidos ícones e cores temáticas para atalhos rápidos mobile:
  - `Pesquisar` com ícone de lupa e paleta azul de busca.
  - `Modo multi` com ícone de seleção em lote e paleta verde de ação em conjunto.

## v0.1.13 - 2026-04-19

### Fixed
- Base de pacientes (mobile): adicionados os atalhos `Pesquisar` e `Modo multi` na linha de links rápidos do header N1, junto de `Painel` e `Novo`.
- Correção de escopo: implementação migrada para `apps/web/standalone-react.jsx`, arquivo realmente carregado pelo `index.html`.

### Changed
- Seção de busca de pacientes passa a iniciar fechada e agora persiste a preferência do usuário via `localStorage`.
- Modo multi para pacientes habilita seleção em lote, ação de `Selecionar todos` e `Arquivar selecionados` (soft delete via `archivedAt` no frontend).

## v0.1.12 - 2026-04-19

### Changed
- Base de pacientes (mobile): linha de botões do header volta a exibir somente atalhos esperados (`Painel` e `Novo`), sem ações duplicadas.
- Tela nível 0: removido o botão `Novo` da lista de navegação rápida.
- Header mobile e seção de pesquisa da base de pacientes ajustados para estilo flat (redução do efeito caixa sobre caixa).

## v0.1.11 - 2026-04-19

### Fixed
- Corrigida falha na abertura de tela nível 1 (pacientes) causada por referência de variável inexistente no header.

## v0.1.10 - 2026-04-19

### Changed
- Navegação rápida mobile padronizada por nível: nível > 0 começa com retorno ao nível anterior.
- Header mobile das telas passa a usar carrossel de links rápidos em todos os níveis.

## v0.1.9 - 2026-04-19

### Changed
- Ícone do header N0 ajustado para contêiner 1:1 e proporção interna maior.
- Botões de links rápidos no mobile agora usam cores temáticas com efeito glassmorphism.

## v0.1.8 - 2026-04-19

### Changed
- Carrossel de links rápidos no mobile passa a ajustar posição apenas após o fim da rolagem do usuário.
- Removido comportamento de reposicionamento contínuo para o primeiro item.

## v0.1.7 - 2026-04-19

### Added
- Função para extrair automaticamente a versão atual do `CHANGELOG.md` no frontend (landing).

## v0.1.6 - 2026-04-19

### Changed
- Header do nível 0 reorganizado com subtítulo logo abaixo do título.
- Título da seção de links rápidos ocultado para deixar o cabeçalho mais limpo no mobile.

## v0.1.5 - 2026-04-19

### Changed
- Tela nível 0 no mobile passa a exibir sessão "Links rápidos" abaixo do subtítulo.
- Atalhos do header migrados para linha única com carrossel horizontal contínuo (sem botões de navegação).

## v0.1.4 - 2026-04-19

### Changed
- Removida a barra de navegação inferior no mobile para evitar redundância com o drawer.
- Header do nível 0 (Painel Diário) atualizado para grid 2x2 com quatro atalhos rápidos.

## v0.1.3 - 2026-04-19

### Added
- Badge de versão no rodapé da tela inicial (landing) com formato `Vx.y.z`.

## v0.1.2 - 2026-04-19

### Changed
- Estrutura do app web consolidada em `apps/web` (remoção da nomenclatura `web-demo`).
- Ajustados caminhos do shell principal (`index.html`) para carregar assets em `apps/web/`.

## v0.1.1 - 2026-04-19

### Changed
- Navegação em dispositivos móveis passou a usar somente o drawer lateral.
- Removidos atalhos de navegação redundantes no header mobile do nível 0.

## v0.1.0 - 2026-04-19

### Added
- Janela lateral para navegação inteligente em dispositivos móveis.
- Header mobile do nível 0 com ações em grid 2x2.
- Indicador visual de versão na tela inicial para confirmar atualização após deploy.
