# Supabase backend bootstrap (OdontoFlow)

Esta pasta prepara toda a base SQL para migrar do `localStorage` para Supabase.

## O que foi incluído

- `migrations/0001_core_schema.sql`
  - Cria tabelas de negócio (`patients`, `procedures`, `appointments`).
  - Cria tabelas de suporte multi-tenant (`clinics`, `staff_profiles`).
  - Habilita RLS e cria políticas de acesso por clínica.
  - Cria índices e gatilho de `updated_at` para boas práticas de performance/auditoria.
- `sample-data/*.csv`
  - Um arquivo por tabela, com volume de dados suficiente para simular operação real de clínica pequena.

## Ordem recomendada para aplicar no Supabase

1. Criar projeto no Supabase.
2. No SQL Editor, executar `migrations/0001_core_schema.sql`.
3. Criar usuários em `Auth > Users` (um para cada `user_id` de `staff_profiles.csv`) **ou** ajustar os `user_id` para IDs reais antes do import.
4. Importar os CSVs nessa ordem:
   1. `clinics.csv`
   2. `staff_profiles.csv`
   3. `patients.csv`
   4. `procedures.csv`
   5. `appointments.csv`

## Observações importantes

- O campo `clinic_id` em todas as tabelas é obrigatório e usado nas políticas RLS.
- A função `current_clinic_id()` resolve o escopo da clínica a partir de `auth.uid()` e `staff_profiles`.
- Para ambiente de produção, manter SQL em migrações versionadas (Supabase CLI) e não editar estrutura direto na UI.
- Recomendado: criar uma migration futura para faturamento/financeiro e prontuário clínico quando as telas dessas áreas ficarem prontas.


## Regra de manutenção (obrigatória)

Sempre que houver mudança de modelagem no frontend (novos campos, novos relacionamentos, novas listas usadas na UI), os arquivos desta pasta devem ser atualizados no mesmo commit:

1. SQL em `migrations/`
2. Massa em `sample-data/*.csv`
3. Esta documentação, se a ordem/processo mudar

Isso garante que a migração de `localStorage` para Supabase aconteça sem divergência de estrutura/dados.
