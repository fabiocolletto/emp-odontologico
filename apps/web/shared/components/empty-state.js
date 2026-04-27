(function registerEmptyState(global) {
  const namespace = (global.OdontoFlowSharedModules = global.OdontoFlowSharedModules || {});
  namespace.components = namespace.components || {};

  function createEmptyState({ title = 'Nenhum dado encontrado', text = 'Ajuste os filtros e tente novamente.', actionLabel = '' } = {}) {
    return `
      <section class="shared-empty-state of-empty-state" data-shared-component="empty-state">
        <h2 class="of-empty-state-title">${title}</h2>
        <p class="of-empty-state-text">${text}</p>
        ${actionLabel ? `<button type="button" class="of-button of-button--primary" data-empty-action>${actionLabel}</button>` : ''}
      </section>
    `;
  }

  function createLoadingState({ text = 'Carregando dados...' } = {}) {
    return `<section class="shared-loading-state of-empty-state"><p class="of-empty-state-text">${text}</p></section>`;
  }

  function createErrorState({ title = 'Erro ao carregar', text = 'Tente novamente em instantes.' } = {}) {
    return `
      <section class="shared-error-state of-empty-state">
        <h2 class="of-empty-state-title">${title}</h2>
        <p class="of-empty-state-text">${text}</p>
      </section>
    `;
  }

  namespace.components.createEmptyState = createEmptyState;
  namespace.components.createLoadingState = createLoadingState;
  namespace.components.createErrorState = createErrorState;
})(globalThis);
