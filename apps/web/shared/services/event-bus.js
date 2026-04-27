(function registerEventBus(global) {
  const namespace = (global.OdontoFlowSharedModules = global.OdontoFlowSharedModules || {});
  namespace.services = namespace.services || {};

  function createEventBus() {
    const listeners = new Map();

    const on = (eventName, callback) => {
      if (!listeners.has(eventName)) listeners.set(eventName, new Set());
      listeners.get(eventName).add(callback);
      return () => listeners.get(eventName)?.delete(callback);
    };

    const emit = (eventName, payload) => {
      listeners.get(eventName)?.forEach((handler) => handler(payload));
      global.dispatchEvent(new CustomEvent(`odontoflow:${eventName}`, { detail: payload }));
    };

    return { on, emit };
  }

  const EventBus = createEventBus();

  namespace.services.EventBus = EventBus;
})(globalThis);
