(function registerDrawer(global) {
  const namespace = (global.OdontoFlowSharedModules = global.OdontoFlowSharedModules || {});
  namespace.components = namespace.components || {};

  function createDrawer({ id = 'shared-drawer', title = 'Painel', body = '', side = 'right' } = {}) {
    return `
      <div class="shared-drawer of-drawer" data-shared-component="drawer" data-drawer-id="${id}" hidden>
        <div class="shared-drawer__overlay of-drawer-overlay" data-drawer-close></div>
        <aside class="shared-drawer__panel of-drawer-panel" data-drawer-side="${side}" role="dialog" aria-modal="true" aria-label="${title}">
          <header class="shared-drawer__header">
            <h2>${title}</h2>
            <button type="button" class="of-button of-button--ghost of-button--icon" data-drawer-close aria-label="Fechar painel">✕</button>
          </header>
          <div class="shared-drawer__body">${body}</div>
        </aside>
      </div>
    `;
  }

  function bindDrawer(root, { onOpen, onClose } = {}) {
    if (!root) return;

    const open = () => {
      root.hidden = false;
      if (typeof onOpen === 'function') onOpen();
    };

    const close = () => {
      root.hidden = true;
      if (typeof onClose === 'function') onClose();
    };

    root.querySelectorAll('[data-drawer-close]').forEach((button) => button.addEventListener('click', close));

    return { open, close };
  }

  namespace.components.createDrawer = createDrawer;
  namespace.components.bindDrawer = bindDrawer;
})(globalThis);
