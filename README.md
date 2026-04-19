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


## Migração futura para Supabase
- Base SQL inicial e massa de dados estão em `backend/supabase/`.
- Aplicar migration + importar CSVs quando iniciar a troca de `localStorage` para banco.
- O frontend web já está preparado para ler `backend/supabase/sample-data/*.csv` como fonte principal (com fallback local).
