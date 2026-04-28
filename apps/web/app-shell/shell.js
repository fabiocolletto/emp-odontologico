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
const AUTH_STEP_PROFILE = 1;
const AUTH_STEP_CLINIC_CHOICE = 2;
const AUTH_STEP_CLINIC_FORM = 3;
const AUTH_STEP_CONFIRMATION = 4;

const appState = {
  authStatus: 'loading',
  user: null,
  profile: null,
  clinic: null,
  memberships: [],
  profileDraft: {
    full_name: '',
    phone: '',
    role: ''
  },
  clinicChoice: 'create',
  clinicDraft: {
    name: '',
    city: '',
    phone: ''
  },
  currentOnboardingStep: AUTH_STEP_PROFILE,
  onboardingSummary: {
    clinicName: '',
    userName: ''
  },
  activeTabId: DEFAULT_TAB_ID,
  authBusy: false,
  authMessage: ''
};

const authApi = {
  client: null,
  initialized: false,
  initError: null,

  async ensure() {
    if (this.initialized && this.client) return this.client;
    if (this.initialized && this.initError) throw this.initError;

    try {
      const mod = await import('./apps/web/src/lib/supabaseClient.js');
      this.client = mod.supabase;
      this.initialized = true;
      this.initError = null;
      return this.client;
    } catch (error) {
      this.initialized = true;
      this.initError = error;
      throw error;
    }
  },

  async signInWithGoogle() {
    const client = await this.ensure();
    return client.auth.signInWithOAuth({ provider: 'google' });
  },

  async signOut() {
    const client = await this.ensure();
    return client.auth.signOut();
  },

  async getCurrentUser() {
    const client = await this.ensure();
    const { data, error } = await client.auth.getUser();
    if (error) throw error;
    return data?.user || null;
  },

  onAuthStateChange(callback) {
    if (!this.client?.auth?.onAuthStateChange) {
      return { unsubscribe: () => {} };
    }

    const { data } = this.client.auth.onAuthStateChange((event, session) => callback(event, session));
    return {
      unsubscribe: () => data?.subscription?.unsubscribe?.()
    };
  }
};

function initShell() {
  renderHeader();
  renderSidebar();
  renderBottomNav();
  renderAuthGate();
  bindAuthUiEvents();
  bootstrapCurrentUser();
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
    <button type="button" class="of-button of-button--ghost app-signout" data-action="auth-signout">Sair</button>
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
      if (appState.authStatus !== 'ready') return;
      const { tabId } = button.dataset;
      navigateTo(tabId);
    });
  });
}

function navigateTo(tabId) {
  const item = NAV_ITEMS.find((navItem) => navItem.id === tabId);

  if (!item || appState.authStatus !== 'ready') return;

  appState.activeTabId = tabId;
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

function setAuthStatus(status, message = '') {
  appState.authStatus = status;
  appState.authMessage = message;
  document.body.dataset.authStatus = status;

  const header = document.getElementById('app-header');
  const sidebar = document.getElementById('app-sidebar');
  const bottomNav = document.getElementById('app-bottom-nav');
  const signOutButton = document.querySelector('[data-action="auth-signout"]');

  const shouldShowShellNav = status === 'ready';

  header?.classList.toggle('is-hidden-auth', !shouldShowShellNav);
  sidebar?.classList.toggle('is-hidden-auth', !shouldShowShellNav);
  bottomNav?.classList.toggle('is-hidden-auth', !shouldShowShellNav);

  if (signOutButton) {
    signOutButton.hidden = !shouldShowShellNav;
  }

  try {
    renderAuthGate();
  } catch (error) {
    console.error('Falha ao renderizar gate de autenticação:', error);
    renderAuthGateFallback('Não foi possível renderizar o fluxo de acesso. Recarregue a página.');
  }
}

async function bootstrapCurrentUser() {
  setAuthStatus('loading', 'Verificando acesso...');

  try {
    await authApi.ensure();
    const user = await authApi.getCurrentUser();
    appState.user = user;

    if (!user) {
      setAuthStatus('unauthenticated');
      return;
    }

    const bootstrapData = await resolveBootstrap(user);
    appState.profile = bootstrapData.profile;
    appState.clinic = bootstrapData.activeClinic;
    appState.memberships = bootstrapData.memberships;

    hydrateDraftsFromBootstrap();

    if (!appState.profile?.full_name || !appState.profile?.phone) {
      appState.currentOnboardingStep = AUTH_STEP_PROFILE;
      setAuthStatus('needs_profile');
      return;
    }

    if (!appState.clinic) {
      appState.currentOnboardingStep = AUTH_STEP_CLINIC_CHOICE;
      setAuthStatus('needs_clinic');
      return;
    }

    completeReadyState();
  } catch (error) {
    console.error('Falha no bootstrap de sessão:', error);
    setAuthStatus('unauthenticated', 'Não foi possível verificar sua sessão. Tente novamente.');
  }
}

async function resolveBootstrap(user) {
  const client = await authApi.ensure();
  const { data: profileRow, error: profileError } = await client
    .from('odf_user_profiles')
    .select('id, user_id, full_name, phone, role, last_active_clinic_id')
    .eq('user_id', user.id)
    .maybeSingle();

  if (profileError && profileError.code !== 'PGRST116') throw profileError;

  let profile = profileRow;

  if (!profileRow) {
    const { data: createdProfile, error: createProfileError } = await client
      .from('odf_user_profiles')
      .insert({
        user_id: user.id,
        full_name: user.user_metadata?.full_name || user.email || 'Profissional',
        phone: '',
        role: ''
      })
      .select('id, user_id, full_name, phone, role, last_active_clinic_id')
      .single();

    if (createProfileError) throw createProfileError;
    profile = createdProfile;
  }

  const memberships = await fetchMembershipsByUser(user.id);
  const activeClinic = await resolveActiveClinic(profile, memberships);

  if (!profile?.last_active_clinic_id && activeClinic?.id) {
    const { data: updatedProfile, error: updateProfileError } = await client
      .from('odf_user_profiles')
      .update({ last_active_clinic_id: activeClinic.id })
      .eq('user_id', user.id)
      .select('id, user_id, full_name, phone, role, last_active_clinic_id')
      .single();

    if (updateProfileError) throw updateProfileError;
    profile = updatedProfile;
  }

  return {
    profile,
    memberships,
    activeClinic
  };
}

async function fetchMembershipsByUser(userId) {
  const client = await authApi.ensure();
  const { data, error } = await client
    .from('odf_clinic_memberships')
    .select('id, user_id, clinic_id, role, clinics:odf_clinics(id, name, city, phone)')
    .eq('user_id', userId)
    .limit(10);

  if (error) {
    console.warn('Não foi possível carregar memberships:', error);
    return [];
  }

  return Array.isArray(data) ? data : [];
}

async function resolveActiveClinic(profile, memberships) {
  const preferredClinicId = profile?.last_active_clinic_id || memberships?.[0]?.clinic_id || null;

  if (!preferredClinicId) return null;

  const clinicFromMembership = memberships.find((entry) => entry?.clinic_id === preferredClinicId)?.clinics;
  if (clinicFromMembership?.id) return clinicFromMembership;

  const client = await authApi.ensure();
  const { data, error } = await client
    .from('odf_clinics')
    .select('id, name, city, phone')
    .eq('id', preferredClinicId)
    .maybeSingle();

  if (error) {
    console.warn('Não foi possível carregar clínica ativa:', error);
    return null;
  }

  return data || null;
}

function hydrateDraftsFromBootstrap() {
  appState.profileDraft.full_name = appState.profile?.full_name || appState.user?.user_metadata?.full_name || '';
  appState.profileDraft.phone = appState.profile?.phone || '';
  appState.profileDraft.role = appState.profile?.role || '';

  if (appState.clinic?.name) {
    appState.onboardingSummary.clinicName = appState.clinic.name;
  }

  appState.onboardingSummary.userName = appState.profileDraft.full_name || appState.user?.user_metadata?.full_name || '';
}

function completeReadyState() {
  const initialTab = getInitialTab();
  setAuthStatus('ready');
  navigateTo(initialTab);
}

function bindAuthUiEvents() {
  const content = document.getElementById('app-content');

  content?.addEventListener('click', async (event) => {
    const target = event.target;
    const actionEl = target.closest('[data-auth-action]');
    if (!actionEl) return;

    const action = actionEl.dataset.authAction;

    if (action === 'login-google') {
      await startGoogleLogin();
      return;
    }

    if (action === 'onboarding-choice') {
      const choice = actionEl.dataset.choice || 'create';
      appState.clinicChoice = choice;

      if (choice === 'invite') {
        await tryResolveInviteByEmail();
      }

      appState.currentOnboardingStep = AUTH_STEP_CLINIC_FORM;
      setAuthStatus('needs_clinic');
      return;
    }

    if (action === 'onboarding-enter') {
      completeReadyState();
      return;
    }
  });

  content?.addEventListener('submit', async (event) => {
    const form = event.target;
    if (!(form instanceof HTMLFormElement)) return;

    event.preventDefault();

    if (form.matches('[data-auth-form="profile"]')) {
      await submitProfileStep(form);
      return;
    }

    if (form.matches('[data-auth-form="clinic"]')) {
      await submitClinicStep(form);
    }
  });

  document.addEventListener('click', async (event) => {
    const actionEl = event.target.closest('[data-action="auth-signout"]');
    if (!actionEl || appState.authBusy) return;

    appState.authBusy = true;
    try {
      await authApi.signOut();
    } catch (error) {
      console.error('Erro ao finalizar sessão:', error);
    } finally {
      appState.authBusy = false;
      appState.user = null;
      appState.profile = null;
      appState.clinic = null;
      appState.memberships = [];
      setAuthStatus('unauthenticated');
    }
  });

  authApi
    .ensure()
    .then(() => {
      authApi.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_OUT' || !session?.user) {
          appState.user = null;
          setAuthStatus('unauthenticated');
          return;
        }

        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          bootstrapCurrentUser();
        }
      });
    })
    .catch((error) => {
      console.error('Auth listener indisponível:', error);
      setAuthStatus('unauthenticated', 'Autenticação indisponível no momento. Verifique o env.js.');
    });
}

async function startGoogleLogin() {
  appState.authBusy = true;
  setAuthStatus('loading', 'Conectando ao Google...');

  try {
    const { error } = await authApi.signInWithGoogle();
    if (error) throw error;

    setAuthStatus('loading', 'Redirecionando para autenticação...');
  } catch (error) {
    console.error('Erro ao iniciar login Google:', error);
    appState.authBusy = false;
    setAuthStatus('unauthenticated', 'Não foi possível iniciar o login com Google.');
  }
}

async function submitProfileStep(form) {
  const data = new FormData(form);
  const fullName = String(data.get('full_name') || '').trim();
  const phone = String(data.get('phone') || '').trim();
  const role = String(data.get('role') || '').trim();

  if (!fullName || !phone) {
    setAuthStatus('needs_profile', 'Informe nome completo e telefone para continuar.');
    return;
  }

  appState.authBusy = true;

  try {
    const client = await authApi.ensure();
    const { data: updatedProfile, error } = await client
      .from('odf_user_profiles')
      .update({ full_name: fullName, phone, role })
      .eq('user_id', appState.user.id)
      .select('id, user_id, full_name, phone, role, last_active_clinic_id')
      .single();

    if (error) throw error;

    appState.profile = updatedProfile;
    appState.profileDraft = { full_name: fullName, phone, role };
    appState.onboardingSummary.userName = fullName;
    appState.currentOnboardingStep = AUTH_STEP_CLINIC_CHOICE;
    setAuthStatus('needs_clinic');
  } catch (error) {
    console.error('Falha ao atualizar perfil:', error);
    setAuthStatus('needs_profile', 'Não foi possível salvar o perfil. Tente novamente.');
  } finally {
    appState.authBusy = false;
  }
}

async function tryResolveInviteByEmail() {
  appState.authBusy = true;

  try {
    const client = await authApi.ensure();
    const email = appState.user?.email || '';

    const { data: invite, error: inviteError } = await client
      .from('odf_clinic_invites')
      .select('id, clinic_id')
      .eq('email', email)
      .in('status', ['pending', 'sent'])
      .limit(1)
      .maybeSingle();

    if (inviteError && inviteError.code !== 'PGRST116') {
      throw inviteError;
    }

    if (!invite?.clinic_id) {
      setAuthStatus('needs_clinic', 'Não encontramos convite pendente para este e-mail. Crie uma nova clínica.');
      appState.clinicChoice = 'create';
      return;
    }

    const { error: membershipError } = await client
      .from('odf_clinic_memberships')
      .upsert({ user_id: appState.user.id, clinic_id: invite.clinic_id, role: 'member' }, { onConflict: 'user_id,clinic_id' });

    if (membershipError) throw membershipError;

    const { error: inviteUpdateError } = await client
      .from('odf_clinic_invites')
      .update({ status: 'accepted' })
      .eq('id', invite.id);

    if (inviteUpdateError) throw inviteUpdateError;

    const { data: profile, error: profileError } = await client
      .from('odf_user_profiles')
      .update({ last_active_clinic_id: invite.clinic_id })
      .eq('user_id', appState.user.id)
      .select('id, user_id, full_name, phone, role, last_active_clinic_id')
      .single();

    if (profileError) throw profileError;

    const { data: clinic, error: clinicError } = await client
      .from('odf_clinics')
      .select('id, name, city, phone')
      .eq('id', invite.clinic_id)
      .maybeSingle();

    if (clinicError) throw clinicError;

    appState.profile = profile;
    appState.clinic = clinic;
    appState.onboardingSummary.clinicName = clinic?.name || 'Clínica vinculada';
    appState.currentOnboardingStep = AUTH_STEP_CONFIRMATION;
    setAuthStatus('needs_clinic');
  } catch (error) {
    console.error('Falha ao validar convite:', error);
    setAuthStatus('needs_clinic', 'Convite não pôde ser vinculado automaticamente. Complete o cadastro de clínica.');
    appState.clinicChoice = 'create';
  } finally {
    appState.authBusy = false;
  }
}

async function submitClinicStep(form) {
  const data = new FormData(form);
  const name = String(data.get('clinic_name') || '').trim();
  const city = String(data.get('city') || '').trim();
  const phone = String(data.get('phone') || '').trim();

  if (!name || !city || !phone) {
    setAuthStatus('needs_clinic', 'Preencha nome, cidade e telefone da clínica.');
    appState.currentOnboardingStep = AUTH_STEP_CLINIC_FORM;
    return;
  }

  appState.authBusy = true;

  try {
    const client = await authApi.ensure();

    const { data: clinic, error: clinicError } = await client
      .from('odf_clinics')
      .insert({ name, city, phone })
      .select('id, name, city, phone')
      .single();

    if (clinicError) throw clinicError;

    const { error: membershipError } = await client
      .from('odf_clinic_memberships')
      .insert({ user_id: appState.user.id, clinic_id: clinic.id, role: 'owner' });

    if (membershipError) throw membershipError;

    const { data: profile, error: profileError } = await client
      .from('odf_user_profiles')
      .update({ last_active_clinic_id: clinic.id })
      .eq('user_id', appState.user.id)
      .select('id, user_id, full_name, phone, role, last_active_clinic_id')
      .single();

    if (profileError) throw profileError;

    appState.profile = profile;
    appState.clinic = clinic;
    appState.clinicDraft = { name, city, phone };
    appState.onboardingSummary.clinicName = name;
    appState.currentOnboardingStep = AUTH_STEP_CONFIRMATION;
    setAuthStatus('needs_clinic');
  } catch (error) {
    console.error('Falha ao cadastrar clínica:', error);
    setAuthStatus('needs_clinic', 'Não foi possível criar a clínica. Revise os dados e tente novamente.');
  } finally {
    appState.authBusy = false;
  }
}

function renderAuthGate() {
  const content = document.getElementById('app-content');
  const frame = document.getElementById('app-frame');

  if (!content || !frame) return;

  if (appState.authStatus === 'ready') {
    frame.hidden = false;
    let gate = content.querySelector('[data-auth-gate]');
    if (gate) gate.remove();
    return;
  }

  frame.hidden = true;

  let gate = content.querySelector('[data-auth-gate]');
  if (!gate) {
    gate = document.createElement('section');
    gate.className = 'app-auth-gate of-v2-scope ui-empty-state';
    gate.dataset.authGate = 'true';
    content.appendChild(gate);
  }

  gate.innerHTML = getAuthViewMarkup();
}

function renderAuthGateFallback(message) {
  const content = document.getElementById('app-content');
  const frame = document.getElementById('app-frame');
  if (!content || !frame) return;

  frame.hidden = true;
  content.innerHTML = `
    <section class="app-auth-gate of-v2-scope ui-empty-state" data-auth-gate="true">
      <main class="app-auth-center of-main-inner of-view-level-1" data-nav-level="1">
        <section class="app-auth-card of-flat-surface">
          <div class="of-empty-state of-empty-state--flat">
            <span class="of-empty-state-title">Ops! Tivemos um problema ao abrir o acesso.</span>
            <p class="of-empty-state-text">${escapeHtml(message)}</p>
          </div>
        </section>
      </main>
    </section>
  `;
}

function getAuthViewMarkup() {
  if (appState.authStatus === 'loading') {
    return renderLoadingScreen();
  }

  if (appState.authStatus === 'unauthenticated') {
    return renderLoginScreen();
  }

  if (appState.authStatus === 'needs_profile' || appState.authStatus === 'needs_clinic') {
    return renderOnboardingScreen();
  }

  return '';
}

function renderLoadingScreen() {
  return `
    <main class="app-auth-center of-main-inner of-view-level-1" data-nav-level="1">
      <section class="app-auth-card of-flat-surface">
        <header class="of-flat-page-header">
          <div class="of-flat-page-title-row">
            <span class="of-flat-page-icon" aria-hidden="true">🦷</span>
            <div>
              <p class="of-flat-page-kicker">OdontoFlow</p>
              <h2 class="of-flat-page-title">Verificando acesso...</h2>
              <p class="of-flat-page-subtitle">Aguarde enquanto carregamos sua sessão.</p>
            </div>
          </div>
        </header>
        <div class="app-auth-loading" aria-live="polite" aria-busy="true">
          <span class="app-auth-spinner" aria-hidden="true"></span>
          <p>${escapeHtml(appState.authMessage || 'Conectando ao OdontoFlow...')}</p>
        </div>
      </section>
    </main>
  `;
}

function renderLoginScreen() {
  return `
    <main class="app-auth-center of-main-inner of-view-level-1" data-nav-level="1">
      <section class="app-auth-card of-flat-surface">
        <header class="of-flat-page-header app-auth-brand-block">
          <div class="of-flat-page-title-row">
            <span class="of-flat-page-icon" aria-hidden="true">🦷</span>
            <div>
              <p class="of-flat-page-kicker">OdontoFlow</p>
              <h2 class="of-flat-page-title">Bem-vindo ao OdontoFlow</h2>
              <p class="of-flat-page-subtitle">Gestão inteligente para clínicas odontológicas.</p>
            </div>
          </div>
        </header>

        <section class="of-form-section" aria-label="Acesso">
          <button type="button" class="of-button of-button--primary app-auth-submit" data-auth-action="login-google">
            Entrar com Google
          </button>
          ${appState.authMessage ? `<p class="app-auth-feedback" role="status">${escapeHtml(appState.authMessage)}</p>` : ''}
        </section>

        <footer class="app-auth-footer">
          <p>Ao continuar, você concorda com os Termos de Uso e Política de Privacidade.</p>
          <small>© 2026 OdontoFlow • Todos os direitos reservados</small>
        </footer>
      </section>
    </main>
  `;
}

function renderOnboardingScreen() {
  const step = appState.currentOnboardingStep;

  return `
    <main class="app-auth-center of-main-inner of-view-level-1" data-nav-level="1">
      <section class="app-auth-card app-auth-card--wide of-flat-surface">
        <header class="of-flat-page-header">
          <div class="of-flat-page-title-row">
            <span class="of-flat-page-icon" aria-hidden="true">🦷</span>
            <div>
              <p class="of-flat-page-kicker">Primeiro acesso</p>
              <h2 class="of-flat-page-title">Fluxo simplificado de entrada</h2>
              <p class="of-flat-page-subtitle">Conclua as 4 etapas para liberar seu dashboard.</p>
            </div>
          </div>
        </header>

        ${renderOnboardingStepper(step)}
        ${renderOnboardingStepContent(step)}
        ${appState.authMessage ? `<p class="app-auth-feedback" role="status">${escapeHtml(appState.authMessage)}</p>` : ''}
      </section>
    </main>
  `;
}

function renderOnboardingStepper(step) {
  const items = [
    { id: AUTH_STEP_PROFILE, label: 'Completar perfil' },
    { id: AUTH_STEP_CLINIC_CHOICE, label: 'Criar ou entrar em clínica' },
    { id: AUTH_STEP_CLINIC_FORM, label: 'Dados da clínica' },
    { id: AUTH_STEP_CONFIRMATION, label: 'Pronto para começar' }
  ];

  return `
    <ol class="app-onboarding-steps" aria-label="Etapas do onboarding">
      ${items
        .map((item) => {
          const stateClass = step === item.id ? 'is-active' : step > item.id ? 'is-complete' : '';
          return `<li class="${stateClass}"><span>${item.id}</span><strong>${item.label}</strong></li>`;
        })
        .join('')}
    </ol>
  `;
}

function renderOnboardingStepContent(step) {
  if (step === AUTH_STEP_PROFILE) {
    return `
      <form class="of-form-section" data-auth-form="profile">
        <label class="of-form-row">
          <span class="of-label">Nome completo</span>
          <input name="full_name" class="of-input of-flat-input" required value="${escapeHtml(appState.profileDraft.full_name)}" />
        </label>
        <label class="of-form-row">
          <span class="of-label">Telefone / WhatsApp</span>
          <input name="phone" class="of-input of-flat-input" required value="${escapeHtml(appState.profileDraft.phone)}" placeholder="(11) 99999-9999" />
        </label>
        <label class="of-form-row">
          <span class="of-label">Cargo (opcional)</span>
          <input name="role" class="of-input of-flat-input" value="${escapeHtml(appState.profileDraft.role)}" placeholder="Ex.: Dentista" />
        </label>
        <div class="of-form-actions app-form-actions-sticky">
          <button type="submit" class="of-button of-button--primary app-auth-submit">Continuar</button>
        </div>
      </form>
    `;
  }

  if (step === AUTH_STEP_CLINIC_CHOICE) {
    return `
      <section class="of-form-section">
        <ul class="of-flat-list app-choice-list" role="listbox" aria-label="Escolha de clínica">
          <li>
            <button type="button" class="of-flat-list-item app-choice-card" data-auth-action="onboarding-choice" data-choice="create">
              <span class="of-flat-list-icon" aria-hidden="true">🏥</span>
              <span class="of-flat-list-content">
                <strong class="of-flat-list-title">Criar nova clínica</strong>
                <small class="of-flat-list-meta">Vou criar minha clínica e configurar o ambiente.</small>
              </span>
              <span class="of-flat-list-action" aria-hidden="true">→</span>
            </button>
          </li>
          <li>
            <button type="button" class="of-flat-list-item app-choice-card" data-auth-action="onboarding-choice" data-choice="invite">
              <span class="of-flat-list-icon" aria-hidden="true">👥</span>
              <span class="of-flat-list-content">
                <strong class="of-flat-list-title">Fui convidado</strong>
                <small class="of-flat-list-meta">Buscar convite pendente no meu e-mail automaticamente.</small>
              </span>
              <span class="of-flat-list-action" aria-hidden="true">→</span>
            </button>
          </li>
        </ul>
      </section>
    `;
  }

  if (step === AUTH_STEP_CLINIC_FORM) {
    return `
      <form class="of-form-section" data-auth-form="clinic">
        <label class="of-form-row">
          <span class="of-label">Nome da clínica</span>
          <input name="clinic_name" class="of-input of-flat-input" required value="${escapeHtml(appState.clinicDraft.name)}" />
        </label>
        <div class="of-form-grid">
          <label class="of-form-row of-span-12 of-md-span-6">
            <span class="of-label">Cidade</span>
            <input name="city" class="of-input of-flat-input" required value="${escapeHtml(appState.clinicDraft.city)}" />
          </label>
          <label class="of-form-row of-span-12 of-md-span-6">
            <span class="of-label">Telefone</span>
            <input name="phone" class="of-input of-flat-input" required value="${escapeHtml(appState.clinicDraft.phone)}" placeholder="(11) 99999-9999" />
          </label>
        </div>
        <p class="app-auth-helper">Você poderá editar essas informações depois nas configurações da clínica.</p>
        <div class="of-form-actions app-form-actions-sticky">
          <button type="submit" class="of-button of-button--primary app-auth-submit">Criar clínica</button>
        </div>
      </form>
    `;
  }

  return `
    <section class="of-form-section">
      <div class="of-empty-state of-empty-state--flat">
        <span class="of-empty-state-title">Tudo pronto!</span>
        <p class="of-empty-state-text">Sua conta foi conectada e seu ambiente já está configurado.</p>
      </div>
      <ul class="of-flat-list app-summary-list">
        <li class="of-flat-list-item">
          <span class="of-flat-list-icon" aria-hidden="true">🏥</span>
          <span class="of-flat-list-content">
            <strong class="of-flat-list-title">Clínica</strong>
            <small class="of-flat-list-meta">${escapeHtml(appState.onboardingSummary.clinicName || appState.clinic?.name || 'Não informada')}</small>
          </span>
        </li>
        <li class="of-flat-list-item">
          <span class="of-flat-list-icon" aria-hidden="true">👤</span>
          <span class="of-flat-list-content">
            <strong class="of-flat-list-title">Usuário</strong>
            <small class="of-flat-list-meta">${escapeHtml(appState.onboardingSummary.userName || appState.profile?.full_name || appState.user?.email || '')}</small>
          </span>
        </li>
      </ul>
      <div class="of-form-actions app-form-actions-sticky">
        <button type="button" class="of-button of-button--primary app-auth-submit" data-auth-action="onboarding-enter">Entrar no OdontoFlow</button>
      </div>
    </section>
  `;
}

function escapeHtml(value) {
  return String(value || '')
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
  if (appState.authStatus !== 'ready') return;
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
