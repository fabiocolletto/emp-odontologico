(function registerSessionService(global) {
  const namespace = (global.OdontoFlowSharedModules = global.OdontoFlowSharedModules || {});
  namespace.services = namespace.services || {};

  const FALLBACK_SESSION = {
    user: null,
    profile: {
      firstName: 'Profissional',
      email: ''
    },
    isAuthenticated: false
  };

  const SESSION_KEY = 'odontoflow:session-user';

  function normalizeSession(session) {
    const email = String(session?.user?.email || '').trim();
    const fullName = String(session?.user?.user_metadata?.full_name || session?.user?.email || '').trim();
    const firstName = fullName ? fullName.split(' ')[0] : FALLBACK_SESSION.profile.firstName;

    return {
      user: session?.user || null,
      profile: {
        firstName,
        email
      },
      isAuthenticated: Boolean(session?.user)
    };
  }

  function getLightSession() {
    const authService = namespace.services.AuthService;
    if (!authService?.getSession) return { ...FALLBACK_SESSION };

    return authService
      .getSession()
      .then((session) => normalizeSession(session || {}))
      .catch(() => {
        try {
          const fallbackRaw = global.localStorage?.getItem(SESSION_KEY);
          if (!fallbackRaw) return { ...FALLBACK_SESSION };
          const parsed = JSON.parse(fallbackRaw);
          return normalizeSession({ user: { email: parsed?.email || '', user_metadata: { full_name: parsed?.name || '' } } });
        } catch {
          return { ...FALLBACK_SESSION };
        }
      });
  }

  const SessionService = {
    normalizeSession,
    getLightSession
  };

  namespace.services.SessionService = SessionService;
})(globalThis);
