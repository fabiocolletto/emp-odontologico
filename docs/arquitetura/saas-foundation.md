# SaaS Foundation — OdontoFlow

## Objetivo
Estabelecer a fundação técnica para operar o produto como SaaS multi-clínica, com evolução progressiva de um frontend com estado local para uma plataforma orientada a APIs.

## Princípios
- **Multi-tenant by design**: toda entidade de negócio carrega `clinicId`.
- **API-first**: frontend consome contratos versionados (`/v1`).
- **Segurança por padrão**: autenticação, autorização por papel e trilha de auditoria.
- **Escalabilidade evolutiva**: arquitetura começa simples e cresce por necessidade real.

## Domínio e Mapeamento Inicial

### Estados locais atuais
- `allPatients`
- `allProcedures`
- `APPOINTMENTS`

### Mapeamento para API
- `allPatients` ⟶ `Patient[]` via `/v1/patients`
- `allProcedures` ⟶ `Procedure[]` via `/v1/procedures`
- `APPOINTMENTS` ⟶ `Appointment[]` via `/v1/appointments`

## Modelo de Dados Base (v1)

### Patient
- `id`
- `clinicId`
- `name`
- `phone`
- `birthDate`
- `gender`
- `lastVisitAt`
- `createdAt`
- `updatedAt`

### Procedure
- `id`
- `clinicId`
- `name`
- `isActive`
- `createdAt`
- `updatedAt`

### Appointment
- `id`
- `clinicId`
- `patientId`
- `procedureId`
- `startsAt`
- `status` (`scheduled`, `confirmed`, `done`, `canceled`)
- `notes`
- `createdAt`
- `updatedAt`

## Estratégia de Evolução
1. **Fase 1 (MVP)**: persistência centralizada via API com autenticação básica.
2. **Fase 2 (Beta)**: autorização por papéis, histórico clínico avançado e auditoria.
3. **Fase 3 (Escala)**: otimização de performance, resiliência e analytics de produto.

## Governança Técnica
- Mudanças de contrato exigem atualização em `docs/api/v1.md`.
- Breaking changes apenas em nova versão (`/v2`).
- Telemetria mínima: latência por endpoint, taxa de erro, throughput por tenant.
