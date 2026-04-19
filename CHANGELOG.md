# Changelog

Todos os ajustes relevantes de deploy devem ser registrados aqui para facilitar validação no GitHub Pages.

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
