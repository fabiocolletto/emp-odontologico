(function registerActionBar(global) {
  const namespace = (global.OdontoFlowSharedModules = global.OdontoFlowSharedModules || {});
  namespace.components = namespace.components || {};

  function createActionBar({ primaryActions = [], secondaryActions = [] } = {}) {
    const renderAction = (action, variant) => `
      <button type="button" class="of-button of-button--${variant}" data-action-id="${action?.id || ''}">${action?.label || 'Ação'}</button>
    `;

    return `
      <section class="shared-action-bar of-page-actions" data-shared-component="action-bar">
        <div class="shared-action-bar__secondary">${secondaryActions.map((action) => renderAction(action, 'secondary')).join('')}</div>
        <div class="shared-action-bar__primary">${primaryActions.map((action) => renderAction(action, 'primary')).join('')}</div>
      </section>
    `;
  }

  function bindActionBar(root, { onAction } = {}) {
    if (!root || typeof onAction !== 'function') return;
    root.querySelectorAll('[data-action-id]').forEach((button) => {
      button.addEventListener('click', () => onAction(button.dataset.actionId));
    });
  }

  namespace.components.createActionBar = createActionBar;
  namespace.components.bindActionBar = bindActionBar;
})(globalThis);
