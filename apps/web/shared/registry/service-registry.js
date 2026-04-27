(function registerServiceRegistry(global) {
  const namespace = (global.OdontoFlowSharedModules = global.OdontoFlowSharedModules || {});
  namespace.registry = namespace.registry || {};

  const SERVICE_REGISTRY = [
    {
      id: 'supabase-client',
      name: 'Supabase Client',
      path: '../services/supabase-client.js',
      purpose: 'Instância única do Supabase no frontend',
      useWhen: 'Qualquer módulo precisar acessar Supabase',
      avoidWhen: 'Nunca criar outro createClient dentro das telas',
      dependencies: [],
      status: 'official'
    },
    {
      id: 'auth-service',
      name: 'Auth Service',
      path: '../services/auth-service.js',
      purpose: 'Login, logout, sessão e usuário atual',
      useWhen: 'Qualquer tela precisar saber usuário autenticado',
      avoidWhen: 'Não manipular auth diretamente na tela',
      dependencies: ['supabase-client'],
      status: 'official'
    },
    {
      id: 'session-service',
      name: 'Session Service',
      path: '../services/session-service.js',
      purpose: 'Normaliza sessão e expõe usuário leve com fallback seguro',
      useWhen: 'Layout e telas que precisam de snapshot rápido do usuário',
      avoidWhen: 'Não duplicar parsing de sessão em cada tela',
      dependencies: ['auth-service'],
      status: 'official'
    },
    {
      id: 'clinic-context-service',
      name: 'Clinic Context Service',
      path: '../services/clinic-context-service.js',
      purpose: 'Clínica ativa, troca de clínica e contexto tenant',
      useWhen: 'Qualquer tela precisar saber a clínica atual',
      avoidWhen: 'Não usar localStorage direto nas telas',
      dependencies: ['auth-service', 'storage-service', 'event-bus'],
      status: 'official'
    },
    {
      id: 'storage-service',
      name: 'Storage Service',
      path: '../services/storage-service.js',
      purpose: 'Encapsula localStorage e padroniza chaves',
      useWhen: 'Persistência local de estado cross-screen',
      avoidWhen: 'Não criar keys soltas em tela específica',
      dependencies: [],
      status: 'official'
    },
    {
      id: 'event-bus',
      name: 'Event Bus',
      path: '../services/event-bus.js',
      purpose: 'Comunicação entre shell e telas',
      useWhen: 'Eventos navigate/auth:changed/clinic:changed/filter:changed/toast/modal:open',
      avoidWhen: 'Não acoplar tela a manipulação direta de DOM global',
      dependencies: [],
      status: 'official'
    }
  ];

  namespace.registry.SERVICE_REGISTRY = SERVICE_REGISTRY;
})(globalThis);
