# Fluxo de Execução do Agente

Este documento define o fluxo operacional padrão para mudanças no projeto.

## 1) Planejar
- Entender objetivo funcional e impacto técnico.
- Mapear arquivos afetados (código, documentação, contratos de API).
- Definir critérios de validação e riscos.

## 2) Implementar
- Aplicar alterações mínimas e incrementais.
- Priorizar compatibilidade retroativa nos contratos existentes.
- Manter nomenclatura consistente entre estado local e API.

## 3) Validar
- Executar checks estáticos/sintáticos.
- Verificar integridade de imports e referências.
- Confirmar consistência entre documentação e código.
- Quando houver necessidade de validação visual (ex.: telas, responsividade mobile, regressões de layout), instalar e configurar browser tools (ex.: Playwright/Chromium) antes da evidência final, caso o ambiente ainda não disponha dessas ferramentas.

## 4) Registrar
- Atualizar changelog técnico obrigatoriamente ao finalizar qualquer alteração de arquivo (código, docs, scripts, estilos ou configuração).
- Descrever decisões arquiteturais.
- Gerar commit semântico com escopo claro.

### Regra mandatória de Logchange
- Toda tarefa concluída com modificação em pelo menos um arquivo deve incluir atualização do `CHANGELOG.md` no mesmo ciclo de entrega.
- É proibido encerrar entrega com arquivos alterados sem refletir a mudança correspondente no logchange.

## Definition of Done por Módulo

### Frontend (UI/Estado)
- Sem erros de import/renderização.
- Estado local mapeado para payloads/entidades da API.
- Componentes críticos (ex.: modal de ficha clínica) funcionais.

### API (Contratos v1)
- Endpoints essenciais descritos com método, rota, request/response.
- Convenções de paginação, erros e autenticação documentadas.
- Mapeamento explícito entre domínio de negócio e recursos REST.

### Arquitetura
- Camadas e responsabilidades registradas.
- Decisões arquiteturais com trade-offs documentados.
- Diretrizes de evolução (MVP → Beta → Escala) publicadas.

### Documentação
- Backlog por fase atualizado.
- Changelog com data e resumo técnico.
- Documentos em caminhos padronizados (`docs/arquitetura`, `docs/api`, `docs/governanca`, `docs/produto`).

## Padrão de Navegação Mobile por Níveis (Obrigatório)

- A primeira linha do header mobile deve sempre representar a tela atual:
  - ícone,
  - título,
  - subtítulo.
- Logo abaixo deve existir a sessão de links rápidos em carrossel horizontal.
- Regra de composição dos links rápidos por nível:
  - **Nível 0**: não possui botão de retorno; listar destinos de níveis seguintes.
  - **Nível >= 1**: o **primeiro botão** deve ser sempre o retorno ao nível imediatamente anterior.
  - Após o retorno, listar os destinos dos níveis seguintes relacionados ao contexto atual.
- Essa lógica deve ser replicada para todas as telas/níveis novos conforme evolução do sistema, evitando decisões ad hoc por tela.
