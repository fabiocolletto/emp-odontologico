(function registerFilterPanel(global) {
  const namespace = (global.OdontoFlowSharedModules = global.OdontoFlowSharedModules || {});
  namespace.components = namespace.components || {};

  const renderField = (field) => {
    const id = field?.id || '';
    const label = field?.label || 'Campo';
    if (field?.type === 'select') {
      const options = (field.options || [])
        .map((option) => `<option value="${option.value}">${option.label}</option>`)
        .join('');
      return `
        <label class="shared-filter-panel__field of-field" for="${id}">
          <span class="of-label">${label}</span>
          <select id="${id}" name="${id}" class="of-select">${options}</select>
        </label>
      `;
    }

    return `
      <label class="shared-filter-panel__field of-field" for="${id}">
        <span class="of-label">${label}</span>
        <input id="${id}" name="${id}" class="of-input" type="${field?.type || 'text'}" value="${field?.value || ''}" />
      </label>
    `;
  };

  function createFilterPanel({ fields = [], applyLabel = 'Aplicar', clearLabel = 'Limpar', expanded = true } = {}) {
    return `
      <section class="shared-filter-panel of-card" data-shared-component="filter-panel" data-expanded="${expanded ? 'true' : 'false'}">
        <header class="shared-filter-panel__header of-card-header">
          <h2 class="of-card-title">Filtros</h2>
          <button type="button" class="of-button of-button--ghost" data-filter-toggle>Mostrar/ocultar</button>
        </header>
        <div class="shared-filter-panel__body of-card-body">
          <div class="shared-filter-panel__grid">${fields.map(renderField).join('')}</div>
        </div>
        <footer class="shared-filter-panel__footer of-card-footer">
          <button type="button" class="of-button of-button--secondary" data-filter-clear>${clearLabel}</button>
          <button type="button" class="of-button of-button--primary" data-filter-apply>${applyLabel}</button>
        </footer>
      </section>
    `;
  }

  function bindFilterPanel(root, { onApply, onClear } = {}) {
    if (!root) return;

    root.querySelector('[data-filter-toggle]')?.addEventListener('click', () => {
      const expanded = root.dataset.expanded !== 'true';
      root.dataset.expanded = expanded ? 'true' : 'false';
    });

    root.querySelector('[data-filter-apply]')?.addEventListener('click', () => {
      if (typeof onApply === 'function') {
        const formValues = Object.fromEntries(
          [...root.querySelectorAll('input[name], select[name]')].map((input) => [input.name, input.value])
        );
        onApply(formValues);
      }
    });

    root.querySelector('[data-filter-clear]')?.addEventListener('click', () => {
      root.querySelectorAll('input').forEach((input) => {
        input.value = '';
      });
      root.querySelectorAll('select').forEach((select) => {
        select.selectedIndex = 0;
      });
      if (typeof onClear === 'function') onClear();
    });
  }

  namespace.components.createFilterPanel = createFilterPanel;
  namespace.components.bindFilterPanel = bindFilterPanel;
})(globalThis);
