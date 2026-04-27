(function registerDateRangePicker(global) {
  const namespace = (global.OdontoFlowSharedModules = global.OdontoFlowSharedModules || {});
  namespace.components = namespace.components || {};

  const PRESETS = [
    { id: 'today', label: 'Hoje' },
    { id: 'week', label: 'Esta semana' },
    { id: 'month', label: 'Este mês' },
    { id: 'last30', label: 'Últimos 30 dias' },
    { id: 'custom', label: 'Personalizado' }
  ];

  function createDateRangePicker({ startDate = '', endDate = '', selectedPreset = 'month' } = {}) {
    return `
      <section class="shared-date-range of-card" data-shared-component="date-range-picker">
        <div class="shared-date-range__presets of-segmented" role="tablist">
          ${PRESETS.map((preset) => `
            <button
              type="button"
              class="of-segmented__button${selectedPreset === preset.id ? ' is-active' : ''}"
              data-date-preset="${preset.id}"
            >${preset.label}</button>
          `).join('')}
        </div>
        <div class="shared-date-range__inputs">
          <label class="of-field">
            <span class="of-label">Início</span>
            <input type="date" class="of-input" data-date-start value="${startDate}" />
          </label>
          <label class="of-field">
            <span class="of-label">Fim</span>
            <input type="date" class="of-input" data-date-end value="${endDate}" />
          </label>
        </div>
      </section>
    `;
  }

  function bindDateRangePicker(root, { onChange } = {}) {
    if (!root) return;

    root.querySelectorAll('[data-date-preset]').forEach((button) => {
      button.addEventListener('click', () => {
        root.querySelectorAll('[data-date-preset]').forEach((entry) => entry.classList.remove('is-active'));
        button.classList.add('is-active');
        if (typeof onChange === 'function') {
          onChange({
            preset: button.dataset.datePreset,
            startDate: root.querySelector('[data-date-start]')?.value || '',
            endDate: root.querySelector('[data-date-end]')?.value || ''
          });
        }
      });
    });

    ['[data-date-start]', '[data-date-end]'].forEach((selector) => {
      root.querySelector(selector)?.addEventListener('change', () => {
        if (typeof onChange === 'function') {
          const activePreset = root.querySelector('[data-date-preset].is-active')?.dataset.datePreset || 'custom';
          onChange({
            preset: activePreset,
            startDate: root.querySelector('[data-date-start]')?.value || '',
            endDate: root.querySelector('[data-date-end]')?.value || ''
          });
        }
      });
    });
  }

  namespace.components.createDateRangePicker = createDateRangePicker;
  namespace.components.bindDateRangePicker = bindDateRangePicker;
})(globalThis);
