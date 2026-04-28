/**
 * Arquivo de exemplo para configuração pública do frontend.
 *
 * Em GitHub Pages (site estático), os valores precisam existir em arquivo versionado
 * (por exemplo `apps/web/env.js`) para serem carregados no navegador.
 *
 * ⚠️ Use somente chaves públicas (anon key). Nunca use service_role no frontend.
 */
window.__APP_ENV__ = {
  SUPABASE_URL: 'https://SEU-PROJETO.supabase.co',
  SUPABASE_ANON: 'SUA_CHAVE_ANON_PUBLICA',
  SUPABASE_AUTH_REDIRECT: 'https://seu-dominio.com/'
};
