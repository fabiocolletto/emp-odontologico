(function registerStatusBadge(global) {
  const namespace = (global.OdontoFlowSharedModules = global.OdontoFlowSharedModules || {});
  namespace.components = namespace.components || {};

  const TONE_CLASS_MAP = {
    neutral: 'of-chip--neutral',
    success: 'of-chip--success',
    warning: 'of-chip--warning',
    danger: 'of-chip--danger',
    info: 'of-chip--info'
  };

  function createStatusBadge({ label = '', tone = 'neutral' } = {}) {
    const className = TONE_CLASS_MAP[tone] || TONE_CLASS_MAP.neutral;
    return `<span class="shared-status-badge of-chip ${className}" data-shared-component="status-badge">${label}</span>`;
  }

  namespace.components.createStatusBadge = createStatusBadge;
})(globalThis);
