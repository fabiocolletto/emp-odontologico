(function registerComponentRegistry(global) {
  const namespace = (global.OdontoFlowSharedModules = global.OdontoFlowSharedModules || {});
  namespace.registry = namespace.registry || {};

  const COMPONENT_REGISTRY = [
    {
      id: 'page-header',
      name: 'Page Header',
      path: '../components/page-header.js',
      purpose: 'Cabeçalho interno padrão das telas',
      useWhen: 'Toda tela precisa de título, subtítulo, status e ações principais',
      avoidWhen: 'Não usar dentro de cards pequenos',
      dependencies: [],
      status: 'official'
    },
    {
      id: 'filter-panel',
      name: 'Filter Panel',
      path: '../components/filter-panel.js',
      purpose: 'Painel padrão de filtros de dados',
      useWhen: 'Listas, tabelas, agenda, financeiro e relatórios',
      avoidWhen: 'Não usar para formulários de cadastro',
      dependencies: ['date-range-picker'],
      status: 'official'
    },
    {
      id: 'date-range-picker',
      name: 'Date Range Picker',
      path: '../components/date-range-picker.js',
      purpose: 'Seleção padronizada de período',
      useWhen: 'Filtros por data, financeiro, agenda, relatórios',
      avoidWhen: 'Datas simples de cadastro podem usar input date nativo',
      dependencies: ['dates-utils'],
      status: 'official'
    },
    {
      id: 'modal',
      name: 'Modal',
      path: '../components/modal.js',
      purpose: 'Janela modal oficial para confirmação e fluxos curtos',
      useWhen: 'Confirmações, formulários curtos e seleção auxiliar',
      avoidWhen: 'Não usar para fluxo longo multinível',
      dependencies: [],
      status: 'official'
    },
    {
      id: 'drawer',
      name: 'Drawer',
      path: '../components/drawer.js',
      purpose: 'Painel lateral/inferior para contexto auxiliar',
      useWhen: 'Filtros avançados, detalhes auxiliares e seleção em mobile',
      avoidWhen: 'Não usar como conteúdo principal da tela',
      dependencies: [],
      status: 'official'
    },
    {
      id: 'empty-state',
      name: 'Empty, Loading and Error States',
      path: '../components/empty-state.js',
      purpose: 'Estados padrão de vazio, carregamento e erro',
      useWhen: 'Quando não houver dados, durante fetch e em falhas de carregamento',
      avoidWhen: 'Não usar em fluxo bloqueante que exija modal',
      dependencies: [],
      status: 'official'
    },
    {
      id: 'status-badge',
      name: 'Status Badge',
      path: '../components/status-badge.js',
      purpose: 'Badge/chip oficial para status semântico',
      useWhen: 'Listas, cards e tabelas com status de entidade',
      avoidWhen: 'Não usar para informação puramente decorativa',
      dependencies: [],
      status: 'official'
    },
    {
      id: 'action-bar',
      name: 'Action Bar',
      path: '../components/action-bar.js',
      purpose: 'Barra de ações principal/secundária',
      useWhen: 'Listagens e telas com múltiplas ações de contexto',
      avoidWhen: 'Não usar para ações únicas isoladas',
      dependencies: [],
      status: 'official'
    }
  ];

  namespace.registry.COMPONENT_REGISTRY = COMPONENT_REGISTRY;
})(globalThis);
