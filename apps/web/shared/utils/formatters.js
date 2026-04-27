(function registerFormatters(global) {
  const namespace = (global.OdontoFlowSharedModules = global.OdontoFlowSharedModules || {});
  namespace.utils = namespace.utils || {};

  function formatCurrencyBRL(value) {
    const amount = Number(value || 0);
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(amount);
  }

  function formatDateBR(value) {
    if (!value) return '';
    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    return new Intl.DateTimeFormat('pt-BR').format(date);
  }

  function formatPhoneBR(value) {
    const digits = String(value || '').replace(/\D/g, '').slice(0, 11);
    if (digits.length <= 10) {
      return digits.replace(/(\d{2})(\d{4})(\d{0,4})/, (_, ddd, first, second) => `(${ddd}) ${first}${second ? `-${second}` : ''}`);
    }
    return digits.replace(/(\d{2})(\d{5})(\d{0,4})/, (_, ddd, first, second) => `(${ddd}) ${first}${second ? `-${second}` : ''}`);
  }

  namespace.utils.formatCurrencyBRL = formatCurrencyBRL;
  namespace.utils.formatDateBR = formatDateBR;
  namespace.utils.formatPhoneBR = formatPhoneBR;
})(globalThis);
