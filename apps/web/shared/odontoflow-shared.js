(function exposeOdontoFlowShared(global) {
  const modules = global.OdontoFlowSharedModules || {};
  const components = modules.components || {};
  const services = modules.services || {};
  const utils = modules.utils || {};
  const registry = modules.registry || {};

  global.OdontoFlowShared = {
    components: {
      createPageHeader: components.createPageHeader,
      createFilterPanel: components.createFilterPanel,
      createDateRangePicker: components.createDateRangePicker,
      createModal: components.createModal,
      createDrawer: components.createDrawer,
      createEmptyState: components.createEmptyState,
      createStatusBadge: components.createStatusBadge,
      createActionBar: components.createActionBar
    },
    services: {
      getSupabaseClient: services.getSupabaseClient,
      AuthService: services.AuthService,
      SessionService: services.SessionService,
      ClinicContextService: services.ClinicContextService,
      StorageService: services.StorageService,
      EventBus: services.EventBus
    },
    utils: {
      formatCurrencyBRL: utils.formatCurrencyBRL,
      formatDateBR: utils.formatDateBR,
      formatPhoneBR: utils.formatPhoneBR,
      validateEmail: utils.validateEmail
    },
    registry: {
      COMPONENT_REGISTRY: registry.COMPONENT_REGISTRY,
      SERVICE_REGISTRY: registry.SERVICE_REGISTRY
    }
  };
})(globalThis);
