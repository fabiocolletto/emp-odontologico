(function registerAuthService(global) {
  const namespace = (global.OdontoFlowSharedModules = global.OdontoFlowSharedModules || {});
  namespace.services = namespace.services || {};

  const getSupabaseClient = () => namespace.services.getSupabaseClient?.() || null;

  const AuthService = {
    async getCurrentUser() {
      const client = getSupabaseClient();
      if (!client?.auth?.getUser) return null;
      const { data, error } = await client.auth.getUser();
      if (error) throw error;
      return data?.user || null;
    },

    async getSession() {
      const client = getSupabaseClient();
      if (!client?.auth?.getSession) return null;
      const { data, error } = await client.auth.getSession();
      if (error) throw error;
      return data?.session || null;
    },

    async signInWithGoogle() {
      const client = getSupabaseClient();
      if (!client?.auth?.signInWithOAuth) return { data: null, error: null };
      return client.auth.signInWithOAuth({ provider: 'google' });
    },

    async signInWithEmail({ email, password }) {
      const client = getSupabaseClient();
      if (!client?.auth?.signInWithPassword) return { data: null, error: null };
      return client.auth.signInWithPassword({ email, password });
    },

    async signOut() {
      const client = getSupabaseClient();
      if (!client?.auth?.signOut) return { error: null };
      return client.auth.signOut();
    },

    onAuthStateChange(callback) {
      const client = getSupabaseClient();
      if (!client?.auth?.onAuthStateChange || typeof callback !== 'function') {
        return { unsubscribe: () => {} };
      }

      const { data } = client.auth.onAuthStateChange((event, session) => callback(event, session));
      return {
        unsubscribe: () => data?.subscription?.unsubscribe?.()
      };
    }
  };

  namespace.services.AuthService = AuthService;
})(globalThis);
