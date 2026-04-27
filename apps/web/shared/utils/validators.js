(function registerValidators(global) {
  const namespace = (global.OdontoFlowSharedModules = global.OdontoFlowSharedModules || {});
  namespace.utils = namespace.utils || {};

  function validateEmail(value) {
    const source = String(value || '').trim();
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(source);
  }

  function validateRequired(value) {
    return String(value || '').trim().length > 0;
  }

  namespace.utils.validateEmail = validateEmail;
  namespace.utils.validateRequired = validateRequired;
})(globalThis);
