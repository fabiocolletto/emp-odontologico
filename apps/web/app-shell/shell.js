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
  { id: 'inicio', label: 'Início', icon: '🏠', accent: '#2563eb', src: './apps/web/src/home/inicio.html' },
  { id: 'agenda', label: 'Agenda', icon: '📅', accent: '#0b6aa7', src: './apps/web/src/agenda/agenda.html' },
  { id: 'patients', label: 'Pacientes', icon: '🦷', accent: '#0891b2', src: './apps/web/src/patients/pacientes.html' },
  { id: 'clinic', label: 'Clínica', icon: '🏥', accent: '#7c3aed', src: './apps/web/src/clinics/clinicas.html' },
  { id: 'team', label: 'Equipe', icon: '👥', accent: '#4f46e5', src: './apps/web/src/team/equipe.html' },
  { id: 'financial', label: 'Financeiro', icon: '💳', accent: '#16a34a', src: './apps/web/src/financial/financeiro.html' },
  { id: 'profile', label: 'Perfil', icon: '🪪', accent: '#ea580c', src: './apps/web/src/profile/perfil.html' }
];

const DEFAULT_TAB_ID = 'inicio';

function initShell() {
  renderHeader();
  renderSidebar();
  renderBottomNav();

  const initialTab = getInitialTab();
  navigateTo(initialTab);
}

function renderHeader() {
  const header = document.getElementById('app-header');

  if (!header) return;

  header.innerHTML = `
    <button type="button" class="of-button of-button--secondary of-button--icon app-menu-toggle" aria-controls="app-sidebar" aria-expanded="false" aria-label="Abrir menu">☰</button>
    <div>
      <p class="app-header-subtitle">OdontoFlow</p>
      <h1 class="app-header-title">Shell modular</h1>
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
  const item = NAV_ITEMS.find((navItem) => navItem.id === tabId);

  if (!item) return;

  const frame = document.getElementById('app-frame');

  if (!frame) return;

  frame.src = item.src;
  setActiveState(tabId);
  updateHash(tabId);
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

window.addEventListener('message', (event) => {
  const { type, payload } = event.data || {};

  if (type === 'navigate') {
    navigateTo(payload);
  }
});

window.addEventListener('hashchange', () => {
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

document.addEventListener('DOMContentLoaded', initShell);
