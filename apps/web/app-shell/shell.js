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
  { id: 'profile', label: 'Perfil', subtitle: 'Conta e preferências', icon: '🪪', accent: '#ea580c', src: './apps/web/src/profile/perfil.html' },
  { id: 'access', label: 'Acesso', subtitle: 'Login e cadastro', icon: '🔐', accent: '#1d4ed8', src: './apps/web/src/auth/acesso.html' }
];

const DEFAULT_TAB_ID = 'inicio';
const AUTH_FEEDBACK_KEY = 'odontoflow-auth-feedback';
const AUTH_REDIRECT_TAB_KEY = 'odontoflow-auth-redirect-tab';
const PUBLIC_TAB_IDS = new Set(['access']);

const authGuardState = {
  client: null,
  session: null
};

async function initShell() {
  renderHeader();
  renderSidebar();
  renderBottomNav();
  await setupAuthGuard();

  const initialTab = getInitialTab();
  navigateTo(initialTab);
}

function persistAuthFeedback(message, tone = 'error') {
  try {
    window.localStorage.setItem(AUTH_FEEDBACK_KEY, JSON.stringify({ message, tone }));
  } catch {}
}

async function setupAuthGuard() {
  try {
    const module = await import('./apps/web/src/lib/supabaseClient.js');
    authGuardState.client = module.supabase;
    await refreshAuthSession();
    authGuardState.client.auth.onAuthStateChange((_event, session) => {
      authGuardState.session = session || null;
      handlePostAuthNavigation();
      applyAuthRestrictions();
    });
    applyAuthRestrictions();
  } catch (error) {
    console.warn('Auth guard indisponível:', error);
  }
}

async function refreshAuthSession() {
  if (!authGuardState.client?.auth?.getSession) return;
  const { data } = await authGuardState.client.auth.getSession();
  authGuardState.session = data?.session || null;
  applyAuthRestrictions();
}

function isAuthenticated() {
  return Boolean(authGuardState.session?.user?.id);
}

function isPublicTab(tabId) {
  return PUBLIC_TAB_IDS.has(tabId);
}

function applyAuthRestrictions() {
  const blocked = !isAuthenticated();
  document.querySelectorAll('[data-tab-id]').forEach((button) => {
    const tabId = button.dataset.tabId;
    const shouldBlock = blocked && !isPublicTab(tabId);
    button.disabled = shouldBlock;
    button.setAttribute('aria-disabled', String(shouldBlock));
    button.classList.toggle('is-auth-blocked', shouldBlock);
  });
}

function getAuthorizedTabId(tabId) {
  if (isPublicTab(tabId) || isAuthenticated()) {
    return tabId;
  }
  window.sessionStorage.setItem(AUTH_REDIRECT_TAB_KEY, tabId);
  persistAuthFeedback('Faça login ou cadastro para acessar os módulos da clínica.', 'error');
  return 'access';
}

function handlePostAuthNavigation() {
  if (!isAuthenticated()) {
    const currentTab = getInitialTab();
    if (!isPublicTab(currentTab)) {
      navigateTo('access');
    }
    return;
  }

  const redirectTab = window.sessionStorage.getItem(AUTH_REDIRECT_TAB_KEY);
  if (redirectTab) {
    window.sessionStorage.removeItem(AUTH_REDIRECT_TAB_KEY);
    navigateTo(redirectTab);
    return;
  }

  if (getInitialTab() === 'access') {
    navigateTo(DEFAULT_TAB_ID);
  }
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
  `;

  const menuButton = header.querySelector('.app-menu-toggle');

  menuButton?.addEventListener('click', () => {
    const isExpanded = document.body.classList.contains('sidebar-open');
    setSidebarOpen(!isExpanded);
  });
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
      const { tabId } = button.dataset;
      navigateTo(tabId);
    });
  });
}

function navigateTo(tabId) {
  const targetTabId = getAuthorizedTabId(tabId);
  const item = NAV_ITEMS.find((navItem) => navItem.id === targetTabId);

  if (!item) return;

  const frame = document.getElementById('app-frame');

  if (!frame) return;

  frame.src = item.src;
  setActiveState(targetTabId);
  updateShellHeader(item);
  updateHash(targetTabId);
  closeSidebarDrawer();
}


function setActiveState(tabId) {
  document.querySelectorAll('[data-tab-id]').forEach((button) => {
    const isActive = button.dataset.tabId === tabId;
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

window.addEventListener('message', (event) => {
  const { type, payload } = event.data || {};

  if (type === 'navigate') {
    navigateTo(payload);
    return;
  }

  if (type === 'auth:changed') {
    refreshAuthSession();
  }
});

window.addEventListener('hashchange', () => {
  const tabId = getInitialTab();
  navigateTo(tabId);
});

window.addEventListener('focus', () => {
  refreshAuthSession();
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

document.addEventListener('DOMContentLoaded', initShell);
