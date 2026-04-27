(function registerDates(global) {
  const namespace = (global.OdontoFlowSharedModules = global.OdontoFlowSharedModules || {});
  namespace.utils = namespace.utils || {};

  function toISODate(date) {
    const source = date instanceof Date ? date : new Date(date);
    if (Number.isNaN(source.getTime())) return '';
    return source.toISOString().slice(0, 10);
  }

  function getRangeFromPreset(preset) {
    const now = new Date();
    const current = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    if (preset === 'today') {
      return { startDate: toISODate(current), endDate: toISODate(current) };
    }

    if (preset === 'week') {
      const day = current.getDay();
      const mondayOffset = day === 0 ? -6 : 1 - day;
      const start = new Date(current);
      start.setDate(current.getDate() + mondayOffset);
      return { startDate: toISODate(start), endDate: toISODate(current) };
    }

    if (preset === 'month') {
      const start = new Date(current.getFullYear(), current.getMonth(), 1);
      return { startDate: toISODate(start), endDate: toISODate(current) };
    }

    if (preset === 'last30') {
      const start = new Date(current);
      start.setDate(current.getDate() - 29);
      return { startDate: toISODate(start), endDate: toISODate(current) };
    }

    return { startDate: '', endDate: '' };
  }

  namespace.utils.toISODate = toISODate;
  namespace.utils.getRangeFromPreset = getRangeFromPreset;
})(globalThis);
