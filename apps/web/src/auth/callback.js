import { supabase } from '../lib/supabaseClient.js';

const AUTH_FEEDBACK_KEY = 'odontoflow-auth-feedback';
const statusNode = document.querySelector('[data-callback-status]');

function setStatus(message) {
  if (statusNode) statusNode.textContent = message;
}

function buildShellUrl() {
  const currentUrl = new URL(window.location.href);
  const callbackPath = '/apps/web/src/auth/callback.html';
  const callbackPathIndex = currentUrl.pathname.indexOf(callbackPath);
  const basePath = callbackPathIndex >= 0 ? currentUrl.pathname.slice(0, callbackPathIndex) : '';
  return `${currentUrl.origin}${basePath}/index.html#access`;
}

function persistFeedback(message, tone = 'success') {
  window.localStorage.setItem(AUTH_FEEDBACK_KEY, JSON.stringify({ message, tone }));
}

function redirectToShell() {
  const targetUrl = buildShellUrl();
  const topWindow = window.top || window;
  topWindow.location.assign(targetUrl);
}

async function finalizeAuth() {
  const currentUrl = new URL(window.location.href);
  const providerError = currentUrl.searchParams.get('error_description') || currentUrl.searchParams.get('error');

  if (providerError) {
    persistFeedback(`Falha na autenticação Google: ${providerError}`, 'error');
    setStatus('Falha ao autenticar. Redirecionando…');
    redirectToShell();
    return;
  }

  setStatus('Validando sessão Supabase…');

  const { data, error } = await supabase.auth.getSession();

  if (error || !data?.session?.user?.email) {
    persistFeedback(error?.message || 'Não foi possível confirmar a sessão após login Google.', 'error');
    setStatus('Não foi possível validar a sessão. Redirecionando…');
    redirectToShell();
    return;
  }

  persistFeedback(`Login Google concluído para ${data.session.user.email}.`, 'success');
  setStatus('Acesso confirmado. Redirecionando…');
  redirectToShell();
}

finalizeAuth();
