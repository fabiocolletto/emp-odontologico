(function registerStorageService(global) {
  const namespace = (global.OdontoFlowSharedModules = global.OdontoFlowSharedModules || {});
  namespace.services = namespace.services || {};

  const KEY_PREFIX = 'odontoflow:';

  function withPrefix(key) {
    return `${KEY_PREFIX}${key}`;
  }

  const StorageService = {
    key(key) {
      return withPrefix(key);
    },

    get(key, fallback = null) {
      try {
        const raw = global.localStorage?.getItem(withPrefix(key));
        return raw === null ? fallback : JSON.parse(raw);
      } catch {
        return fallback;
      }
    },

    set(key, value) {
      try {
        global.localStorage?.setItem(withPrefix(key), JSON.stringify(value));
        return true;
      } catch {
        return false;
      }
    },

    remove(key) {
      try {
        global.localStorage?.removeItem(withPrefix(key));
        return true;
      } catch {
        return false;
      }
    }
  };

  namespace.services.StorageService = StorageService;
})(globalThis);
