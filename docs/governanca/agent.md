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

## 4) Registrar
- Atualizar changelog técnico.
- Descrever decisões arquiteturais.
- Gerar commit semântico com escopo claro.

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
