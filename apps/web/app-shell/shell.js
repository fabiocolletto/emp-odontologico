/*
  SHELL OFICIAL DO ODONTOFLOW

  REGRAS:
  - NÃO adicionar lógica de negócio aqui
  - NÃO renderizar conteúdo de tela aqui
  - NÃO duplicar componentes das telas
  - Shell apenas controla navegação e layout

  Qualquer alteração deve respeitar:
  docs/design-system/visual-v1.md
*/

const NAV_ITEMS = [
  { id: 'inicio', label: 'Início', subtitle: 'Nível 0', icon: '🏠', accent: '#2563eb', src: './apps/web/src/home/inicio.html' },
  { id: 'agenda', label: 'Agenda', subtitle: 'Atendimentos', icon: '📅', accent: '#0b6aa7', src: './apps/web/src/agenda/agenda.html' },
  { id: 'patients', label: 'Pacientes', subtitle: 'Cadastro clínico', icon: '🦷', accent: '#0891b2', src: './apps/web/src/patients/pacientes.html' },
  { id: 'clinic', label: 'Clínica', subtitle: 'Dados institucionais', icon: '🏥', accent: '#7c3aed', src: './apps/web/src/clinics/clinicas.html' },
  { id: 'team', label: 'Equipe', subtitle: 'Profissionais', icon: '👥', accent: '#4f46e5', src: './apps/web/src/team/equipe.html' },
  { id: 'financial', label: 'Financeiro', subtitle: 'Gestão financeira', icon: '💳', accent: '#16a34a', src: './apps/web/src/financial/financeiro.html' },
  { id: 'profile', label: 'Perfil', subtitle: 'Conta e preferências', icon: '🪪', accent: '#ea580c', src: './apps/web/src/profile/perfil.html' }
];

const DEFAULT_TAB_ID = 'inicio';
const AUTH_STORAGE_KEY = 'odontoflow:last-auth-email';

let authClient = null;
let authSubscription = null;
let currentSession = null;

async function initShell() {
  renderHeader();
  renderSidebar();
  renderBottomNav();
  await initAuth();
}

async function initAuth() {
  authClient = createAuthClient();

  if (!authClient) {
    setAuthState({ isAuthenticated: false, reason: 'missing-config' });
    return;
  }

  const { data, error } = await authClient.auth.getSession();
  if (error) {
    setAuthMessage('Não foi possível carregar a sessão atual.', 'error');
    setAuthState({ isAuthenticated: false, reason: 'session-error' });
    return;
  }

  setAuthState({ isAuthenticated: Boolean(data?.session), session: data?.session || null });

  const { data: listenerData } = authClient.auth.onAuthStateChange((_, session) => {
    setAuthState({ isAuthenticated: Boolean(session), session: session || null });
  });

  authSubscription = listenerData?.subscription || null;
}

function createAuthClient() {
  const env = globalThis.__APP_ENV__ || {};
  const url = env.SUPABASE_URL || '';
  const anon = env.SUPABASE_ANON || '';
  const createClient = globalThis?.supabase?.createClient;

  if (!url || !anon || typeof createClient !== 'function') {
    return null;
  }

  return createClient(url, anon, {
    auth: {
      persistSession: true,
      storageKey: 'odontoflow-supabase-auth'
    }
  });
}

function setAuthState({ isAuthenticated, session = null, reason = '' }) {
  const frame = document.getElementById('app-frame');
  const appContent = document.getElementById('app-content');
  const bottomNav = document.getElementById('app-bottom-nav');

  currentSession = session;
  document.body.classList.toggle('is-authenticated', isAuthenticated);
  document.body.classList.toggle('is-auth-gate-active', !isAuthenticated);

  if (!isAuthenticated) {
    closeSidebarDrawer();
    setActiveState('');
    if (frame) frame.src = 'about:blank';
    appContent?.setAttribute('data-nav-level', '1');
    renderAuthView(reason);
    renderHeaderForAuth(session);
    bottomNav?.setAttribute('aria-hidden', 'true');
    return;
  }

  clearAuthView();
  renderHeaderForApp(session);
  bottomNav?.removeAttribute('aria-hidden');
  const initialTab = getInitialTab();
  navigateTo(initialTab);
}

function renderHeader() {
  const header = document.getElementById('app-header');

  if (!header) return;

  header.innerHTML = `
    <button type="button" class="of-button of-button--secondary of-button--icon app-menu-toggle" aria-controls="app-sidebar" aria-expanded="false" aria-label="Abrir menu">☰</button>
    <div class="app-header-context">
      <span class="app-header-icon" data-app-header-icon aria-hidden="true">🧭</span>
      <div class="app-header-content">
        <p class="app-header-subtitle" data-app-header-subtitle>OdontoFlow</p>
        <h1 class="app-header-title" data-app-header-title>Shell modular</h1>
      </div>
    </div>
    <div class="app-header-actions" data-app-header-actions></div>
  `;

  const menuButton = header.querySelector('.app-menu-toggle');

  menuButton?.addEventListener('click', () => {
    const isExpanded = document.body.classList.contains('sidebar-open');
    setSidebarOpen(!isExpanded);
  });
}

function renderHeaderForAuth() {
  const title = document.querySelector('[data-app-header-title]');
  const subtitle = document.querySelector('[data-app-header-subtitle]');
  const icon = document.querySelector('[data-app-header-icon]');
  const actions = document.querySelector('[data-app-header-actions]');

  if (title) title.textContent = 'Acesso seguro';
  if (subtitle) subtitle.textContent = 'Supabase Auth';
  if (icon) icon.textContent = '🔐';
  if (actions) actions.innerHTML = '';
}

function renderHeaderForApp(session) {
  const actions = document.querySelector('[data-app-header-actions]');
  if (!actions) return;

  const userEmail = session?.user?.email || '';
  actions.innerHTML = `
    <span class="app-auth-user">${escapeHtml(userEmail)}</span>
    <button type="button" class="of-button of-button--secondary" data-auth-signout>Sair</button>
  `;

  actions.querySelector('[data-auth-signout]')?.addEventListener('click', async () => {
    if (!authClient) return;
    const { error } = await authClient.auth.signOut();
    if (error) setAuthMessage(error.message || 'Falha ao sair da sessão.', 'error');
  });
}

function renderAuthView(reason = '') {
  const appContent = document.getElementById('app-content');
  if (!appContent) return;

  const savedEmail = globalThis.localStorage?.getItem(AUTH_STORAGE_KEY) || '';
  const appVersion = 'v0.4.0';
  const diagnosticsMarkup = renderAuthDiagnostics(reason);

  appContent.innerHTML = `
    <main class="of-main-inner of-view-level-1 app-auth-shell" data-nav-level="1">
      <section class="of-drawer app-auth-layout" aria-label="Acesso OdontoFlow Material 3">
        <div class="of-drawer-overlay app-auth-overlay" aria-hidden="true"></div>
        <article class="of-drawer-panel of-card app-auth-surface" aria-live="polite">
          <header class="of-card-header app-auth-header">
            <p class="app-auth-kicker" aria-hidden="true">🔐</p>
            <h2 class="of-card-title">Acessar sistema</h2>
          </header>
          <div class="of-card-body app-auth-form">
            <div class="of-segmented app-auth-tabs" role="tablist" aria-label="Acesso e cadastro">
              <button type="button" class="of-segmented__button is-active" role="tab" aria-selected="true" data-auth-tab-trigger data-tab="signin">Acesso</button>
              <button type="button" class="of-segmented__button" role="tab" aria-selected="false" data-auth-tab-trigger data-tab="signup">Cadastro</button>
            </div>

            <form class="app-auth-pane is-active" data-auth-pane="signin" data-auth-form-signin>
              <label class="of-field">
                <span class="of-label">E-mail</span>
                <input class="of-input" type="email" name="email" autocomplete="email" value="${escapeHtml(savedEmail)}" required />
              </label>
              <label class="of-field">
                <span class="of-label">Senha</span>
                <input class="of-input" type="password" name="password" autocomplete="current-password" required />
              </label>
              <div class="app-auth-actions">
                <button type="submit" class="of-button of-button--primary">Entrar com e-mail</button>
                <button type="button" class="of-button of-button--ghost" data-auth-google>Continuar com Google</button>
              </div>
            </form>

            <form class="app-auth-pane" data-auth-pane="signup" data-auth-form-signup>
              <label class="of-field">
                <span class="of-label">E-mail</span>
                <input class="of-input" type="email" name="email" autocomplete="email" value="${escapeHtml(savedEmail)}" required />
              </label>
              <label class="of-field">
                <span class="of-label">Senha</span>
                <input class="of-input" type="password" name="password" autocomplete="new-password" required />
              </label>
              <div class="app-auth-actions">
                <button type="submit" class="of-button of-button--secondary">Criar conta</button>
              </div>
            </form>

            <p class="app-auth-message" data-auth-message></p>
          </div>
          <footer class="of-card-footer app-auth-footer">
            <p class="of-helper-text">Versão ${appVersion}</p>
            <p class="app-auth-legal-links">
              <button type="button" class="app-auth-legal-link" data-legal-open data-legal-src="./apps/web/app-shell/legal/termos.html" data-legal-title="Termos do Usuário">Termos do Usuário</button>
              <span aria-hidden="true">·</span>
              <button type="button" class="app-auth-legal-link" data-legal-open data-legal-src="./apps/web/app-shell/legal/privacidade.html" data-legal-title="Política de Privacidade">Política de Privacidade</button>
            </p>
            ${diagnosticsMarkup}
          </footer>
        </article>
      </section>

      <section class="of-modal app-auth-legal-modal" data-legal-modal hidden>
        <div class="of-drawer-overlay" data-legal-close></div>
        <article class="of-modal-panel app-auth-legal-panel" role="dialog" aria-modal="true" aria-labelledby="legal-title">
          <header class="app-auth-legal-header">
            <h3 id="legal-title" class="of-card-title" data-legal-title>Documento legal</h3>
            <button type="button" class="of-button of-button--secondary of-button--icon" data-legal-close aria-label="Fechar">✕</button>
          </header>
          <iframe title="Documento legal" class="app-auth-legal-frame" data-legal-frame loading="lazy"></iframe>
        </article>
      </section>
    </main>
  `;

  if (reason === 'missing-config') {
    setAuthMessage('Configuração Supabase ausente. Atualize apps/web/env.js com SUPABASE_URL e SUPABASE_ANON.', 'error');
  }

  bindAuthFormEvents();
}

function renderAuthDiagnostics(reason = '') {
  const env = globalThis.__APP_ENV__ || {};
  const hasUrl = Boolean(env.SUPABASE_URL);
  const hasAnon = Boolean(env.SUPABASE_ANON);
  const hasRedirect = Boolean(env.SUPABASE_AUTH_REDIRECT);
  const hasSdk = typeof globalThis?.supabase?.createClient === 'function';

  const statusItems = [
    { label: 'SDK Supabase', ok: hasSdk, value: hasSdk ? 'carregado' : 'ausente' },
    { label: 'SUPABASE_URL', ok: hasUrl, value: hasUrl ? env.SUPABASE_URL : 'não configurado' },
    { label: 'SUPABASE_ANON', ok: hasAnon, value: hasAnon ? `***${String(env.SUPABASE_ANON).slice(-8)}` : 'não configurado' },
    { label: 'AUTH_REDIRECT', ok: hasRedirect, value: hasRedirect ? env.SUPABASE_AUTH_REDIRECT : 'fallback automático' }
  ];

  const overallOk = statusItems.every((item) => item.ok || item.label === 'AUTH_REDIRECT');
  const statusLabel = overallOk ? 'Auth conectado' : 'Auth pendente';
  const statusClass = overallOk ? 'is-ok' : 'is-warning';
  const reasonText = reason === 'missing-config' ? 'Ajuste variáveis públicas em apps/web/env.js.' : '';

  const itemsMarkup = statusItems
    .map((item) => `<li><strong>${item.label}:</strong> <span>${escapeHtml(item.value)}</span></li>`)
    .join('');

  return `
    <section class="app-auth-diagnostic ${statusClass}" aria-live="polite">
      <p class="app-auth-diagnostic-title">${statusLabel}</p>
      <ul class="app-auth-diagnostic-list">${itemsMarkup}</ul>
      ${reasonText ? `<p class="app-auth-diagnostic-note">${reasonText}</p>` : ''}
    </section>
  `;
}

function bindAuthFormEvents() {
  const signInForm = document.querySelector('[data-auth-form-signin]');
  const signUpForm = document.querySelector('[data-auth-form-signup]');
  const tabTriggers = Array.from(document.querySelectorAll('[data-auth-tab-trigger]'));
  if (!signInForm || !signUpForm) return;

  tabTriggers.forEach((trigger) => {
    trigger.addEventListener('click', () => {
      const tab = trigger.dataset.tab;
      setAuthTab(tab);
    });
  });

  signInForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!authClient) return;
    setAuthMessage('Autenticando...', 'info');

    const email = String(signInForm.elements.email?.value || '').trim();
    const password = String(signInForm.elements.password?.value || '').trim();

    const { error } = await authClient.auth.signInWithPassword({ email, password });

    if (error) {
      setAuthMessage(error.message || 'Não foi possível entrar. Verifique e-mail e senha.', 'error');
      return;
    }

    globalThis.localStorage?.setItem(AUTH_STORAGE_KEY, email);
    setAuthMessage('Login realizado com sucesso. Redirecionando...', 'success');
  });

  signUpForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!authClient) return;
    setAuthMessage('Criando conta...', 'info');

    const email = String(signUpForm.elements.email?.value || '').trim();
    const password = String(signUpForm.elements.password?.value || '').trim();

    const { error } = await authClient.auth.signUp({ email, password });
    if (error) {
      setAuthMessage(error.message || 'Não foi possível criar conta.', 'error');
      return;
    }

    globalThis.localStorage?.setItem(AUTH_STORAGE_KEY, email);
    setAuthMessage('Conta criada. Confira seu e-mail para confirmar o cadastro.', 'success');
  });

  signInForm.querySelector('[data-auth-google]')?.addEventListener('click', async () => {
    if (!authClient) return;
    setAuthMessage('Redirecionando para Google...', 'info');

    const redirectTo = getOAuthRedirect();
    const { error } = await authClient.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo }
    });

    if (error) {
      setAuthMessage(error.message || 'Não foi possível iniciar login com Google.', 'error');
    }
  });

  bindLegalModalEvents();
}

function setAuthTab(tab) {
  const validTab = tab === 'signup' ? 'signup' : 'signin';

  document.querySelectorAll('[data-auth-tab-trigger]').forEach((trigger) => {
    const isActive = trigger.dataset.tab === validTab;
    trigger.classList.toggle('is-active', isActive);
    trigger.setAttribute('aria-selected', String(isActive));
  });

  document.querySelectorAll('[data-auth-pane]').forEach((pane) => {
    pane.classList.toggle('is-active', pane.dataset.authPane === validTab);
  });
}

function bindLegalModalEvents() {
  const modal = document.querySelector('[data-legal-modal]');
  const frame = document.querySelector('[data-legal-frame]');
  const title = document.querySelector('[data-legal-title]');
  if (!modal || !frame || !title) return;

  document.querySelectorAll('[data-legal-open]').forEach((button) => {
    button.addEventListener('click', () => {
      const src = button.dataset.legalSrc || '';
      const documentTitle = button.dataset.legalTitle || 'Documento legal';
      title.textContent = documentTitle;
      frame.src = src;
      modal.hidden = false;
    });
  });

  document.querySelectorAll('[data-legal-close]').forEach((button) => {
    button.addEventListener('click', () => {
      modal.hidden = true;
      frame.src = 'about:blank';
    });
  });
}

function getOAuthRedirect() {
  const env = globalThis.__APP_ENV__ || {};
  if (env.SUPABASE_AUTH_REDIRECT) return env.SUPABASE_AUTH_REDIRECT;

  const { origin, pathname } = globalThis.location;
  return `${origin}${pathname}`;
}

function setAuthMessage(message = '', type = 'info') {
  const messageElement = document.querySelector('[data-auth-message]');
  if (!messageElement) return;

  messageElement.textContent = message;
  messageElement.dataset.state = type;
}

function clearAuthView() {
  const appContent = document.getElementById('app-content');
  if (!appContent) return;

  appContent.innerHTML = `
    <iframe
      id="app-frame"
      title="Conteúdo da tela ativa"
      loading="eager"
      referrerpolicy="no-referrer"
    ></iframe>
  `;
}

function renderSidebar() {
  const sidebar = document.getElementById('app-sidebar');

  if (!sidebar) return;

  sidebar.innerHTML = `
    <h2 class="app-brand">OdontoFlow</h2>
    ${renderNavMarkup('sidebar')}
  `;

  bindNavEvents(sidebar);
}

function renderBottomNav() {
  const bottomNav = document.getElementById('app-bottom-nav');

  if (!bottomNav) return;

  const items = NAV_ITEMS;
  bottomNav.innerHTML = renderNavMarkup('bottom', items);
  applyBottomNavLayout(bottomNav, items.length);
  bindNavEvents(bottomNav);
}

function renderNavMarkup(scope, items = NAV_ITEMS) {
  const list = items
    .map(
      (item) => `
        <li>
          <button
            type="button"
            class="app-nav-button"
            data-nav-scope="${scope}"
            data-tab-id="${item.id}"
            style="--nav-accent:${item.accent};"
            aria-label="${item.label}"
          >
            <span class="app-nav-button__icon" aria-hidden="true">${item.icon}</span>
            <span class="app-nav-button__label">${item.label}</span>
          </button>
        </li>
      `
    )
    .join('');

  return `<ul class="app-nav-list">${list}</ul>`;
}

function bindNavEvents(rootElement) {
  rootElement.querySelectorAll('[data-tab-id]').forEach((button) => {
    button.addEventListener('click', () => {
      if (!currentSession?.user) return;
      const { tabId } = button.dataset;
      navigateTo(tabId);
    });
  });
}

function navigateTo(tabId) {
  if (!currentSession?.user) return;

  const item = NAV_ITEMS.find((navItem) => navItem.id === tabId);

  if (!item) return;

  const frame = document.getElementById('app-frame');

  if (!frame) return;

  frame.src = item.src;
  setActiveState(tabId);
  updateShellHeader(item);
  updateHash(tabId);
  closeSidebarDrawer();
}

function setActiveState(tabId) {
  document.querySelectorAll('[data-tab-id]').forEach((button) => {
    const isActive = tabId && button.dataset.tabId === tabId;
    button.classList.toggle('is-active', isActive);
    button.setAttribute('aria-current', isActive ? 'page' : 'false');
  });
}

function getInitialTab() {
  const hashValue = window.location.hash.replace('#', '').trim();
  const existsInNav = NAV_ITEMS.some((item) => item.id === hashValue);

  return existsInNav ? hashValue : DEFAULT_TAB_ID;
}

function updateHash(tabId) {
  if (window.location.hash !== `#${tabId}`) {
    window.history.replaceState(null, '', `#${tabId}`);
  }
}

function closeSidebarDrawer() {
  setSidebarOpen(false);
}

function setSidebarOpen(isOpen) {
  if (!currentSession?.user) return;

  document.body.classList.toggle('sidebar-open', isOpen);

  const menuButton = document.querySelector('.app-menu-toggle');
  menuButton?.setAttribute('aria-expanded', String(isOpen));
}

function getBottomNavVisibleCount() {
  return window.matchMedia('(max-width: 360px)').matches ? 4 : 5;
}

function applyBottomNavLayout(bottomNav, itemCount) {
  const visibleCount = getBottomNavVisibleCount();
  const shouldScroll = itemCount > visibleCount;
  bottomNav.classList.toggle('is-scrollable', shouldScroll);
  bottomNav.style.setProperty('--app-bottom-visible-count', String(Math.min(itemCount, visibleCount)));
}

function updateShellHeader(item) {
  const title = document.querySelector('[data-app-header-title]');
  const subtitle = document.querySelector('[data-app-header-subtitle]');
  const icon = document.querySelector('[data-app-header-icon]');
  if (title) title.textContent = item?.label || 'OdontoFlow';
  if (subtitle) subtitle.textContent = item?.subtitle || 'Shell modular';
  if (icon) icon.textContent = item?.icon || '🧭';
}

function escapeHtml(raw = '') {
  return String(raw)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

window.addEventListener('message', (event) => {
  const { type, payload } = event.data || {};

  if (type === 'navigate') {
    navigateTo(payload);
  }
});

window.addEventListener('hashchange', () => {
  if (!currentSession?.user) return;
  const tabId = getInitialTab();
  navigateTo(tabId);
});

window.addEventListener('resize', () => {
  const bottomNav = document.getElementById('app-bottom-nav');
  if (!bottomNav) return;
  applyBottomNavLayout(bottomNav, NAV_ITEMS.length);
});

document.addEventListener('click', (event) => {
  if (!document.body.classList.contains('sidebar-open')) return;

  const sidebar = document.getElementById('app-sidebar');
  const menuButton = document.querySelector('.app-menu-toggle');
  const target = event.target;
  const clickedInsideSidebar = sidebar?.contains(target);
  const clickedMenuButton = menuButton?.contains(target);

  if (!clickedInsideSidebar && !clickedMenuButton) {
    closeSidebarDrawer();
  }
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    closeSidebarDrawer();
  }
});

window.addEventListener('beforeunload', () => {
  authSubscription?.unsubscribe?.();
});

document.addEventListener('DOMContentLoaded', initShell);
