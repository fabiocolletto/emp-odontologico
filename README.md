# emp-odontologico

Sistema de gestão empresarial para clínicas odontológicas.

## Estrutura de pastas (definida e aplicada)

```text
.
├── apps/
│   └── web-demo/
│       ├── index.html
│       ├── styles.css
│       └── src/
│           ├── app.js
│           ├── components.js
│           ├── constants.js
│           ├── dashboard.js
│           ├── main.js
│           └── modelagem.js
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
- **`apps/web-demo/`**: demo temporária da UI OdontoFlow (sem backend acoplado).

Para detalhes da organização e evolução, consulte `docs/estrutura-repositorio.md`.
