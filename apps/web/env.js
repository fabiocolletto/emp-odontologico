(function attachAppEnv(global) {
  if (global.__APP_ENV__) return;

  global.__APP_ENV__ = {
    SUPABASE_URL: global.SUPABASE_URL || '',
    SUPABASE_ANON: global.SUPABASE_ANON || ''
  };
})(window);
