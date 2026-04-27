# Camada Shared do OdontoFlow

## 1) O que é a camada shared
A camada `apps/web/shared` centraliza componentes, serviços e utilitários oficiais para evitar duplicidade entre telas HTML + CSS + JS.

## 2) Quando usar componente compartilhado
Use sempre que a necessidade já existir no `component-registry.js` (header, filtros, date picker, modal, drawer, badge, ação, empty/loading/error).

## 3) Quando criar componente local
Componente local só é permitido quando for exclusivo de uma tela e sem potencial de reuso em outro módulo.

## 4) Como consultar o registry
Consultar, nesta ordem, antes de criar qualquer UI/serviço/helper:
1. `apps/web/shared/registry/component-registry.js`
2. `apps/web/shared/registry/service-registry.js`
3. `apps/web/shared/registry/README.md`

## 5) Como adicionar novo componente oficial
1. Verificar se já existe equivalente em `apps/web/shared/components`.
2. Criar o novo arquivo em `apps/web/shared/components`.
3. Registrar metadados no `component-registry.js`.
4. Documentar uso e limites (useWhen/avoidWhen).
5. Atualizar `apps/web/shared/odontoflow-shared.js`.

## 6) Como adicionar novo serviço oficial
1. Verificar se já existe equivalente em `apps/web/shared/services`.
2. Criar serviço isolado e sem lógica de negócio de tela.
3. Registrar metadados no `service-registry.js`.
4. Atualizar `apps/web/shared/odontoflow-shared.js`.

## 7) Regra anti-duplicidade
É proibido reimplementar em tela algo já oficial no shared. Primeiro reusar, depois discutir extensão.

## 8) Exemplo de uso em uma tela
```html
<link rel="stylesheet" href="../shared/components/shared-components.css" />
<script src="../shared/components/page-header.js"></script>
<script src="../shared/odontoflow-shared.js"></script>
<script>
  const html = globalThis.OdontoFlowShared.components.createPageHeader({
    eyebrow: 'Agenda',
    title: 'Visão do dia',
    description: 'Atendimentos e encaixes',
    actions: [{ id: 'novo', label: 'Novo atendimento', variant: 'primary' }]
  });
  document.querySelector('[data-header-root]').innerHTML = html;
</script>
```

## 9) Regras para agentes Codex
- Antes de criar qualquer UI, serviço ou helper, consultar os registries.
- Não duplicar createClient do Supabase.
- Não criar lógica própria de clínica ativa em tela.
- Priorizar funções de componente que retornam HTML e binders explícitos.
