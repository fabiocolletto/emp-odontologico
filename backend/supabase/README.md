# Supabase backend bootstrap (OdontoFlow)

Esta pasta prepara toda a base SQL para migrar do `localStorage` para Supabase.

## O que foi incluído

- `migrations/0001_core_schema.sql`
  - Cria tabelas de negócio (`patients`, `procedures`, `appointments`).
  - Cria tabelas de suporte multi-tenant (`clinics`, `staff_profiles`).
  - Habilita RLS e cria políticas de acesso por clínica.
  - Cria índices e gatilho de `updated_at` para boas práticas de performance/auditoria.
- `migrations/0002_multi_clinic_context.sql`
  - Permite associação de um usuário em múltiplas clínicas (`unique (clinic_id, user_id)`).
  - Cria `user_clinic_context` para persistir clínica ativa por usuário.
  - Cria RPC `set_active_clinic(uuid)` para troca segura da clínica ativa.
- `migrations/0003_clinic_owner_membership.sql`
  - Adiciona `owner_user_id` em `clinics` como campo obrigatório.
  - Garante perfil `admin` automático para o owner da clínica.
  - Restringe update de clínica para `owner` ou `admin` ativo.
- `migrations/0004_user_onboarding_bootstrap.sql`
  - Cria bootstrap automático de clínica/contexto para novos usuários.
  - Adiciona rotinas de backfill e view de integridade para usuários legados.
- `sample-data/*.csv`
  - Um arquivo por tabela de negócio/base (`clinics`, `staff_profiles`, `patients`, `procedures`, `appointments`).

## Ordem recomendada para aplicar no Supabase

1. Criar projeto no Supabase.
2. No SQL Editor (ou Supabase CLI), executar **em ordem**:
   1. `migrations/0001_core_schema.sql`
   2. `migrations/0002_multi_clinic_context.sql`
   3. `migrations/0003_clinic_owner_membership.sql`
   4. `migrations/0004_user_onboarding_bootstrap.sql`
3. Criar usuários em `Auth > Users` para todos os `owner_user_id` e `user_id` usados nos CSVs.
4. Importar os CSVs nessa ordem:
   1. `clinics.csv`
   2. `staff_profiles.csv`
   3. `patients.csv`
   4. `procedures.csv`
   5. `appointments.csv`
5. Após import, para usuários legados sem contexto, executar:
   - `select * from public.backfill_user_clinic_integrity(500);`

## Novos campos obrigatórios

- `clinics.owner_user_id` (**obrigatório**): deve referenciar um usuário existente em `auth.users`.
- `staff_profiles.active` (**obrigatório**): usado para permitir `switch` de clínica e escopo de RLS.
- `staff_profiles.role` (**obrigatório**): validado contra (`admin`, `dentist`, `assistant`, `receptionist`).
- `staff_profiles` agora usa unicidade por par (`clinic_id`, `user_id`) para suportar múltiplas clínicas por usuário.

## Observações importantes

- O campo `clinic_id` nas tabelas de negócio é obrigatório e usado nas políticas RLS.
- A função `current_clinic_id()` resolve o escopo a partir de `user_clinic_context`.
- A troca de clínica ativa deve ser feita por `public.set_active_clinic(uuid)` (não por update direto em tabela).
- O usuário sempre deve permanecer com ao menos uma associação ativa de clínica (`staff_profiles.active = true`).
- Para ambiente de produção, manter SQL em migrações versionadas (Supabase CLI) e não editar estrutura direto na UI.

## Regra de manutenção (obrigatória)

Sempre que houver mudança de modelagem no frontend (novos campos, novos relacionamentos, novas listas usadas na UI), os arquivos desta pasta devem ser atualizados no mesmo commit:

1. SQL em `migrations/`
2. Massa em `sample-data/*.csv`
3. Esta documentação, se a ordem/processo/campos obrigatórios mudarem

Isso garante que a migração de `localStorage` para Supabase aconteça sem divergência de estrutura/dados.
