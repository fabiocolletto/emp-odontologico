(function registerProfileLegacyFramework(global) {
  const STORAGE_KEY = 'odontoflow-profile-framework-v1';
  const CLINICS_KEY = 'odontoflow-clinicas-framework-v1';

  const model = {
    account: {
      full_name: 'Usuário OdontoFlow',
      email: 'usuario@odontoflow.com.br',
      phone: '(11) 90000-0000',
      primary_role: 'admin',
      password_status: 'Segura (2FA pendente)'
    },
    preferences: {
      notify_whatsapp: true,
      notify_email: true,
      daily_digest: false,
      timezone: 'America/Sao_Paulo'
    },
    legacyMarkers: []
  };

  const deepClone = (value) => JSON.parse(JSON.stringify(value));
  const read = () => {
    try {
      const raw = global.localStorage.getItem(STORAGE_KEY);
      if (!raw) return deepClone(model);
      const parsed = JSON.parse(raw);
      if (!parsed?.account || !parsed?.preferences) return deepClone(model);
      return { ...parsed, legacyMarkers: [] };
    } catch {
      return deepClone(model);
    }
  };
  const write = (data) => global.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  const escapeHtml = (value) => String(value || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');

  const readClinicStats = () => {
    try {
      const raw = global.localStorage.getItem(CLINICS_KEY);
      const parsed = raw ? JSON.parse(raw) : null;
      const clinics = Array.isArray(parsed?.clinics) ? parsed.clinics : [];
      const activeClinicId = parsed?.activeClinicId || '';
      return { clinics, activeClinicId };
    } catch {
      return { clinics: [], activeClinicId: '' };
    }
  };

  const fillForm = (form, payload = {}) => {
    Array.from(form.elements).forEach((el) => {
      if (!el.name) return;
      if (el.type === 'checkbox') {
        el.checked = Boolean(payload[el.name]);
      } else {
        el.value = payload[el.name] ?? '';
      }
    });
  };

  const renderStandalone = () => {
    const root = global.document.querySelector('[data-perfil-app]');
    if (!root) return;

    const summaryGrid = root.querySelector('[data-grid="summary"]');
    const legacyList = root.querySelector('[data-grid="legacy"]');
    const legacySection = root.querySelector('[data-legacy="true"]');
    const infoNode = root.querySelector('[data-perfil-info]');
    const preferencesForm = root.querySelector('[data-form="preferences"]');
    const feedback = root.querySelector('[data-feedback]');

    const dialog = root.ownerDocument.querySelector('[data-dialog="account"]');
    const accountForm = root.ownerDocument.querySelector('[data-form="account"]');

    const cards = {
      clinics: root.querySelector('[data-kpi="clinics"]'),
      active: root.querySelector('[data-kpi="active"]'),
      security: root.querySelector('[data-kpi="security"]')
    };

    let state = read();

    const paint = () => {
      const clinicStats = readClinicStats();
      const activeClinic = clinicStats.clinics.find((item) => item.id === clinicStats.activeClinicId);

      cards.clinics.innerHTML = `<h3>${clinicStats.clinics.length}</h3><p>Clínicas vinculadas</p>`;
      cards.active.innerHTML = `<h3>${activeClinic ? 'Sim' : 'Não'}</h3><p>Clínica ativa definida</p>`;
      cards.security.innerHTML = `<h3>${escapeHtml(state.account.password_status)}</h3><p>Status de segurança</p>`;

      summaryGrid.innerHTML = [
        { label: 'Nome', value: state.account.full_name },
        { label: 'E-mail', value: state.account.email },
        { label: 'Telefone', value: state.account.phone },
        { label: 'Função principal', value: state.account.primary_role },
        { label: 'Fuso horário', value: state.preferences.timezone },
        { label: 'Clínica ativa', value: activeClinic?.trade_name || 'Não definida' }
      ].map((item) => `
        <article class="perfil-tile">
          <strong>${escapeHtml(item.label)}</strong>
          <span>${escapeHtml(item.value)}</span>
        </article>
      `).join('');

      fillForm(preferencesForm, state.preferences);
      const legacyMarkers = Array.isArray(state.legacyMarkers) ? state.legacyMarkers : [];
      legacyList.innerHTML = legacyMarkers.map((marker) => `<li>${escapeHtml(marker)}</li>`).join('');
      legacySection.hidden = legacyMarkers.length === 0;
      if (!infoNode) return;
      infoNode.textContent = activeClinic
        ? `Contexto atual: ${activeClinic.trade_name}.`
        : 'Selecione uma clínica ativa para contexto completo do perfil.';
    };

    root.addEventListener('click', (event) => {
      const trigger = event.target.closest('[data-action]');
      if (!trigger) return;
      const action = trigger.getAttribute('data-action');

      if (action === 'edit-account') {
        fillForm(accountForm, state.account);
        dialog.showModal();
      }

      if (action === 'reset-model') {
        state = deepClone(model);
        write(state);
        feedback.textContent = 'Modelo recarregado.';
        paint();
      }
    });

    accountForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const fd = new FormData(accountForm);
      state.account = {
        ...state.account,
        full_name: String(fd.get('full_name') || ''),
        email: String(fd.get('email') || ''),
        phone: String(fd.get('phone') || ''),
        primary_role: String(fd.get('primary_role') || 'admin')
      };
      write(state);
      dialog.close();
      feedback.textContent = 'Dados de conta atualizados.';
      paint();
    });

    preferencesForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const fd = new FormData(preferencesForm);
      state.preferences = {
        notify_whatsapp: fd.get('notify_whatsapp') === 'on',
        notify_email: fd.get('notify_email') === 'on',
        daily_digest: fd.get('daily_digest') === 'on',
        timezone: String(fd.get('timezone') || 'America/Sao_Paulo')
      };
      write(state);
      feedback.textContent = 'Preferências salvas com sucesso.';
      paint();
    });

    paint();
  };

  const namespace = global.OdontoFlowProfileLegacyComponents = global.OdontoFlowProfileLegacyComponents || {};
  namespace.createProfileLegacyFrame = function createProfileLegacyFrame() {
    return function ProfileLegacyFrame(props) {
      const src = props?.src || './apps/web/src/profile/perfil.html';
      return global.React.createElement(
        'section',
        { className: 'profile-page-section profile-legacy-frame' },
        global.React.createElement('iframe', {
          className: 'profile-legacy-frame__iframe',
          src,
          title: 'Framework Perfil',
          loading: 'lazy'
        })
      );
    };
  };

  if (global.document?.querySelector('[data-perfil-app]')) {
    renderStandalone();
  }
}(globalThis));
