# emp-odontologico

Sistema de gestão empresarial para clínicas odontológicas.

## Estrutura de pastas (definida e aplicada)

```text
.
├── apps/
│   └── web/
│       ├── index.html
│       ├── styles.css
│       └── src/
│           ├── app.js
│           ├── components.js
│           ├── constants.js
│           ├── dashboard.js
│           ├── main.js
│           └── modelagem.js
├── backend/
│   └── supabase/
│       ├── migrations/
│       │   └── 0001_core_schema.sql
│       ├── sample-data/
│       │   ├── appointments.csv
│       │   ├── clinics.csv
│       │   ├── patients.csv
│       │   ├── procedures.csv
│       │   └── staff_profiles.csv
│       └── README.md
├── docs/
│   ├── api/
│   │   └── v1.md
│   ├── arquitetura/
│   │   └── saas-foundation.md
│   ├── governanca/
│   │   └── agent.md
│   ├── produto/
│   │   └── read.md
│   └── estrutura-repositorio.md
└── README.md
```

## Regras organizacionais
- **`apps/`**: aplicações executáveis (frontend, backend, workers).
- **`docs/`**: documentação de produto, arquitetura, governança e APIs.
- **`apps/web/`**: aplicação web principal da UI OdontoFlow.

Para detalhes da organização e evolução, consulte `docs/estrutura-repositorio.md`.

## Design System Visual (V1)
- Documento oficial: `docs/design-system/visual-v1.md`.
- Tokens e componentes base oficiais: `apps/web/styles.css` e `apps/web/src/components.js`.
- Contrato estrutural da V0 permanece em `apps/web/framework-shell.css`.



## Migração futura para Supabase
- Base SQL inicial e massa de dados estão em `backend/supabase/`.
- Aplicar migration + importar CSVs quando iniciar a troca de `localStorage` para banco.
- O frontend web já está preparado para ler `backend/supabase/sample-data/*.csv` como fonte principal (com fallback local).

## Supabase Auth no frontend (Google + e-mail/senha)
- O app web usa os valores públicos **`SUPABASE_URL`** e **`SUPABASE_ANON`** em `apps/web/env.js` para criar o client Supabase no navegador.
- Em GitHub Pages (site estático), essa é a forma mais simples e consistente: publicar o `env.js` junto do app, sem depender de injeção por variável de sistema no workflow.
- Use somente a chave **anon/public** no frontend; nunca `service_role`.
- O fluxo de autenticação implementado:
  - criação de conta com e-mail/senha;
  - login com e-mail/senha;
  - login social com Google (`signInWithOAuth`);
  - sessão persistida com renovação automática de token.

## Estratégia de deploy contínuo (produção + beta)
- **`main`** publica em **produção** na raiz do GitHub Pages (`/`), pensado para domínio final e usuários ativos.
- **`beta`** (ou `develop`) publica em **beta** no caminho `/beta`, para validação contínua sem afetar produção.
- No disparo manual (`workflow_dispatch`), você pode escolher o canal de deploy e, para **beta**, informar qual branch será publicada em `/beta` (padrão: `develop`).
- O workflow usa Environments distintos:
  - `production` para deploy da `main`;
  - `beta` para deploy das branches `beta`/`develop`.
- Não é necessário configurar `SUPABASE_URL`/`SUPABASE_ANON` como variáveis do GitHub Actions para este fluxo atual, pois `apps/web/env.js` é versionado e publicado junto com o build estático.
- Em **Settings → Environments**, garanta que as regras de branch permitam:
  - `main` no Environment `production`;
  - `beta` e/ou `develop` no Environment `beta`.
