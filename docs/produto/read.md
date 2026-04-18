# Roadmap e Registro Técnico

## Backlog por Fase

### MVP
- [ ] Autenticação básica de clínica e equipe.
- [ ] CRUD de pacientes.
- [ ] Catálogo de procedimentos.
- [ ] Agenda inicial e abertura de ficha clínica.
- [ ] Persistência via API (substituir estado mockado local).

### Beta
- [ ] Permissões por perfil (admin, recepção, dentista).
- [ ] Histórico clínico estruturado por sessão.
- [ ] Integração de notificações de consultas.
- [ ] Auditoria de alterações relevantes.
- [ ] Observabilidade (logs de negócio + métricas de uso).

### Escala
- [ ] Multi-tenant completo com isolamento por clínica.
- [ ] Filas para tarefas assíncronas (lembretes, relatórios, integrações).
- [ ] Estratégia de cache para leitura intensiva.
- [ ] Data warehouse para analytics operacional.
- [ ] Mecanismos de alta disponibilidade e disaster recovery.

## Decisões Arquiteturais

1. **Arquitetura orientada a domínio clínico**
   - Entidades principais: Paciente, Procedimento, Consulta, Ficha Clínica.
   - API REST v1 como fronteira de integração entre frontend e backend.

2. **Evolução incremental de estados locais para API**
   - `allPatients` → recurso `/v1/patients`.
   - `allProcedures` → recurso `/v1/procedures`.
   - `APPOINTMENTS` → recurso `/v1/appointments`.

3. **Documentação como contrato vivo**
   - `docs/arquitetura/saas-foundation.md` para diretrizes de fundação SaaS.
   - `docs/api/v1.md` para contratos e exemplos de payload.

## Changelog

## 2026-04-18
- Corrigido erro de ícone em modal de ficha clínica ao incluir `User` em `lucide-react`.
- Migrada demo de `docs/temporario` para `apps/web-demo` com separação de shell (`index.html`), estilos (`styles.css`) e módulos JS em `src/`.
- Documento de governança movido para `docs/governanca/agent.md`.
- Roadmap consolidado em `docs/produto/read.md`.
- Adicionada definição formal da estrutura em `docs/estrutura-repositorio.md`.
