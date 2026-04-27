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
  { id: 'inicio', label: 'Início', src: './apps/web/src/home/inicio.html' },
  { id: 'agenda', label: 'Agenda', src: './apps/web/src/agenda/agenda.html' },
  { id: 'patients', label: 'Pacientes', src: './apps/web/src/patients/pacientes.html' },
  { id: 'clinic', label: 'Clínica', src: './apps/web/src/clinics/clinicas.html' },
  { id: 'team', label: 'Equipe', src: './apps/web/src/team/equipe.html' },
  { id: 'financial', label: 'Financeiro', src: './apps/web/src/financial/financeiro.html' },
  { id: 'profile', label: 'Perfil', src: './apps/web/src/profile/perfil.html' }
];

const MOBILE_VISIBLE_ITEMS = ['inicio', 'agenda', 'patients', 'financial'];
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
    document.body.classList.toggle('sidebar-open');
    const isExpanded = document.body.classList.contains('sidebar-open');
    menuButton.setAttribute('aria-expanded', String(isExpanded));
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

  const items = NAV_ITEMS.filter((item) => MOBILE_VISIBLE_ITEMS.includes(item.id));
  bottomNav.innerHTML = renderNavMarkup('bottom', items);
  bindNavEvents(bottomNav);
}

function renderNavMarkup(scope, items = NAV_ITEMS) {
  const list = items
    .map(
      (item) => `
        <li>
          <button type="button" class="app-nav-button" data-nav-scope="${scope}" data-tab-id="${item.id}">
            ${item.label}
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
  document.body.classList.remove('sidebar-open');

  const menuButton = document.querySelector('.app-menu-toggle');
  menuButton?.setAttribute('aria-expanded', 'false');
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

document.addEventListener('DOMContentLoaded', initShell);
