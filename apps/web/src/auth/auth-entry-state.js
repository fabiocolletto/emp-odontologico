(function registerAuthEntryState(global) {
  const namespace = global.OdontoFlowAuthEntry = global.OdontoFlowAuthEntry || {};

  const FIRST_ACCESS_COMPLETED_KEY = 'odontoflow:first-access-completed';

  const getFirstAccessCompleted = () => window.localStorage.getItem(FIRST_ACCESS_COMPLETED_KEY) === 'true';

  const setFirstAccessCompleted = () => {
    window.localStorage.setItem(FIRST_ACCESS_COMPLETED_KEY, 'true');
    return true;
  };

  namespace.FIRST_ACCESS_COMPLETED_KEY = FIRST_ACCESS_COMPLETED_KEY;
  namespace.getFirstAccessCompleted = getFirstAccessCompleted;
  namespace.setFirstAccessCompleted = setFirstAccessCompleted;
}(globalThis));
