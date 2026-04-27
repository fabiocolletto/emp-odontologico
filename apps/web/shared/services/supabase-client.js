(function registerSupabaseClient(global) {
  const namespace = (global.OdontoFlowSharedModules = global.OdontoFlowSharedModules || {});
  namespace.services = namespace.services || {};

  let supabaseClientInstance = null;

  function getEnvConfig() {
    const env = global.__APP_ENV__ || {};
    return {
      url: env.SUPABASE_URL || '',
      anon: env.SUPABASE_ANON || ''
    };
  }

  function getSupabaseClient() {
    if (supabaseClientInstance) return supabaseClientInstance;

    const { url, anon } = getEnvConfig();
    const createClientFactory = global?.supabase?.createClient;

    if (!url || !anon || typeof createClientFactory !== 'function') {
      return null;
    }

    supabaseClientInstance = createClientFactory(url, anon, {
      auth: {
        persistSession: true,
        storageKey: 'odontoflow-supabase-auth'
      }
    });

    return supabaseClientInstance;
  }

  namespace.services.getSupabaseClient = getSupabaseClient;
})(globalThis);
