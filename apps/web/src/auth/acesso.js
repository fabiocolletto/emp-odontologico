import { supabase } from '../lib/supabaseClient.js';

const root = document.querySelector('[data-acesso-app]');

if (!root) {
  throw new Error('Root da tela de acesso não encontrado.');
}

const form = root.querySelector('[data-form="auth"]');
const feedback = root.querySelector('[data-feedback]');
const sessionPanel = root.querySelector('[data-session]');
const sessionEmail = root.querySelector('[data-session-email]');
const modeHint = root.querySelector('[data-mode-hint]');
const submitLabel = root.querySelector('[data-submit-label]');
const modeButtons = Array.from(root.querySelectorAll('[data-mode]'));

const state = {
  mode: 'login',
  loading: false
};

function buildShellRedirectUrl() {
  const currentUrl = new URL(window.location.href);
  const authPath = '/apps/web/src/auth/acesso.html';
  const authPathIndex = currentUrl.pathname.indexOf(authPath);
  const basePath = authPathIndex >= 0 ? currentUrl.pathname.slice(0, authPathIndex) : '';
  return `${currentUrl.origin}${basePath}/index.html#access`;
}

function setFeedback(message, tone = 'neutral') {
  feedback.textContent = message;
  feedback.classList.remove('is-error', 'is-success');
  if (tone === 'error') feedback.classList.add('is-error');
  if (tone === 'success') feedback.classList.add('is-success');
}

function setMode(mode) {
  state.mode = mode;
  modeButtons.forEach((button) => {
    const isActive = button.dataset.mode === mode;
    button.classList.toggle('is-active', isActive);
    button.setAttribute('aria-selected', String(isActive));
  });

  const passwordInput = form.elements.password;

  if (mode === 'signup') {
    submitLabel.textContent = 'Criar conta com email';
    modeHint.textContent = 'Criaremos sua conta no Supabase e enviaremos confirmação por email quando configurado.';
    passwordInput.autocomplete = 'new-password';
    return;
  }

  submitLabel.textContent = 'Acessar com email';
  modeHint.textContent = 'Use suas credenciais existentes para entrar.';
  passwordInput.autocomplete = 'current-password';
}

function setLoading(isLoading) {
  state.loading = isLoading;
  form.querySelectorAll('button, input').forEach((element) => {
    element.disabled = isLoading;
  });
  root.querySelectorAll('[data-action="google"], [data-action="logout"], [data-mode]').forEach((element) => {
    element.disabled = isLoading;
  });
}

async function refreshSession() {
  const { data, error } = await supabase.auth.getSession();
  if (error) {
    setFeedback(error.message, 'error');
    return;
  }

  const currentEmail = data?.session?.user?.email || '';
  sessionPanel.hidden = !currentEmail;
  sessionEmail.textContent = currentEmail ? `Conectado como ${currentEmail}` : '';
}

async function handleGoogleLogin() {
  setLoading(true);
  setFeedback('Redirecionando para autenticação Google...');

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: buildShellRedirectUrl(),
      skipBrowserRedirect: true
    }
  });

  if (error) {
    setFeedback(error.message, 'error');
    setLoading(false);
    return;
  }

  if (data?.url) {
    const topWindow = window.top || window;
    topWindow.location.assign(data.url);
    return;
  }

  setFeedback('Não foi possível iniciar o login Google.', 'error');
  setLoading(false);
}

async function handleEmailAuth(event) {
  event.preventDefault();
  if (state.loading) return;

  const formData = new FormData(form);
  const email = String(formData.get('email') || '').trim();
  const password = String(formData.get('password') || '');

  if (!email || !password) {
    setFeedback('Informe email e senha.', 'error');
    return;
  }

  setLoading(true);
  setFeedback(state.mode === 'signup' ? 'Criando conta...' : 'Entrando...');

  const request = state.mode === 'signup'
    ? supabase.auth.signUp({ email, password })
    : supabase.auth.signInWithPassword({ email, password });

  const { error } = await request;

  if (error) {
    setFeedback(error.message, 'error');
    setLoading(false);
    return;
  }

  const successMessage = state.mode === 'signup'
    ? 'Conta criada com sucesso. Verifique seu email para confirmação, se habilitado.'
    : 'Acesso realizado com sucesso.';

  setFeedback(successMessage, 'success');
  await refreshSession();
  setLoading(false);
}

async function handleLogout() {
  setLoading(true);
  const { error } = await supabase.auth.signOut();
  if (error) {
    setFeedback(error.message, 'error');
    setLoading(false);
    return;
  }
  setFeedback('Sessão encerrada.', 'success');
  await refreshSession();
  setLoading(false);
}

root.addEventListener('click', (event) => {
  const target = event.target.closest('[data-action], [data-mode]');
  if (!target) return;

  if (target.matches('[data-mode]')) {
    setMode(target.dataset.mode);
    return;
  }

  const action = target.dataset.action;

  if (action === 'google') {
    handleGoogleLogin();
    return;
  }

  if (action === 'limpar') {
    form.reset();
    setFeedback('Campos limpos.');
    return;
  }

  if (action === 'logout') {
    handleLogout();
  }
});

form.addEventListener('submit', handleEmailAuth);

supabase.auth.onAuthStateChange(() => {
  refreshSession();
});

setMode('login');
refreshSession();
