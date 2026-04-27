(function registerPageHeader(global) {
  const namespace = (global.OdontoFlowSharedModules = global.OdontoFlowSharedModules || {});
  namespace.components = namespace.components || {};

  const toActionButton = (action) => {
    const variant = action?.variant ? ` of-button--${action.variant}` : ' of-button--secondary';
    const attrs = action?.attrs || '';
    return `<button type="button" class="of-button${variant}" data-action-id="${action?.id || ''}" ${attrs}>${action?.label || 'Ação'}</button>`;
  };

  function createPageHeader({ eyebrow = '', title = '', description = '', status = '', actions = [] } = {}) {
    const actionsMarkup = actions.length
      ? `<div class="shared-page-header__actions of-page-actions">${actions.map(toActionButton).join('')}</div>`
      : '';

    return `
      <header class="shared-page-header of-page-header" data-shared-component="page-header">
        <div>
          ${eyebrow ? `<p class="shared-page-header__eyebrow of-page-kicker">${eyebrow}</p>` : ''}
          ${title ? `<h1 class="shared-page-header__title of-page-title">${title}</h1>` : ''}
          ${description ? `<p class="shared-page-header__description of-page-description">${description}</p>` : ''}
        </div>
        ${status ? `<p class="shared-page-header__status of-chip of-chip--info">${status}</p>` : ''}
        ${actionsMarkup}
      </header>
    `;
  }

  function bindPageHeader(root, { onAction } = {}) {
    if (!root || typeof onAction !== 'function') return;
    root.querySelectorAll('[data-action-id]').forEach((button) => {
      button.addEventListener('click', () => onAction(button.dataset.actionId));
    });
  }

  namespace.components.createPageHeader = createPageHeader;
  namespace.components.bindPageHeader = bindPageHeader;
})(globalThis);
