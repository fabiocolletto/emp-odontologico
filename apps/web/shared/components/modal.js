(function registerModal(global) {
  const namespace = (global.OdontoFlowSharedModules = global.OdontoFlowSharedModules || {});
  namespace.components = namespace.components || {};

  function createModal({ id = 'shared-modal', title = 'Modal', body = '', footer = '' } = {}) {
    return `
      <div class="shared-modal of-modal" data-shared-component="modal" data-modal-id="${id}" hidden>
        <div class="shared-modal__overlay of-modal-overlay" data-modal-close></div>
        <section class="shared-modal__panel of-modal-panel" role="dialog" aria-modal="true" aria-labelledby="${id}-title">
          <header class="of-modal-header">
            <h2 id="${id}-title">${title}</h2>
            <button type="button" class="of-button of-button--ghost of-button--icon" data-modal-close aria-label="Fechar modal">✕</button>
          </header>
          <div class="of-modal-body">${body}</div>
          <footer class="of-modal-footer">${footer}</footer>
        </section>
      </div>
    `;
  }

  function bindModal(root, { onOpen, onClose } = {}) {
    if (!root) return;

    const open = () => {
      root.hidden = false;
      if (typeof onOpen === 'function') onOpen();
    };

    const close = () => {
      root.hidden = true;
      if (typeof onClose === 'function') onClose();
    };

    root.querySelectorAll('[data-modal-close]').forEach((button) => button.addEventListener('click', close));

    return { open, close };
  }

  namespace.components.createModal = createModal;
  namespace.components.bindModal = bindModal;
})(globalThis);
