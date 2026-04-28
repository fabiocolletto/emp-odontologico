(function registerTeamFramework(global) {
  const STORAGE_KEY = 'odontoflow-equipe-framework-v1';
  const CLINICS_KEY = 'odontoflow-clinicas-framework-v1';

  const model = {
    memberships: [
      { id: 'tm-001', clinic_id: 'cl-001', full_name: 'Dra. Julia Martins', email: 'julia@odontoflow.com.br', role: 'dentista', access_level: 'admin', contract_type: 'pj', monthly_cost: 0, receivable_split: 40, status: 'active' },
      { id: 'tm-002', clinic_id: 'cl-001', full_name: 'Paulo Mendes', email: 'paulo@odontoflow.com.br', role: 'financeiro', access_level: 'manager', contract_type: 'clt', monthly_cost: 4200, receivable_split: 0, status: 'active' },
      { id: 'tm-003', clinic_id: 'cl-002', full_name: 'Dra. Julia Martins', email: 'julia@odontoflow.com.br', role: 'dentista', access_level: 'operational', contract_type: 'pj', monthly_cost: 0, receivable_split: 35, status: 'pending_invite' }
    ],
    legacyMarkers: []
  };

  const deepClone = (value) => JSON.parse(JSON.stringify(value));
  const nextId = () => `tm-${Date.now()}`;

  const read = () => {
    try {
      const raw = global.localStorage.getItem(STORAGE_KEY);
      if (!raw) return deepClone(model);
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed?.memberships)) return deepClone(model);
      return { ...parsed, legacyMarkers: [] };
    } catch {
      return deepClone(model);
    }
  };

  const readClinics = () => {
    try {
      const raw = global.localStorage.getItem(CLINICS_KEY);
      const parsed = raw ? JSON.parse(raw) : null;
      const clinics = Array.isArray(parsed?.clinics) ? parsed.clinics : [];
      const activeClinicId = parsed?.activeClinicId || clinics[0]?.id || 'cl-001';
      return { clinics, activeClinicId };
    } catch {
      return { clinics: [], activeClinicId: 'cl-001' };
    }
  };

  const write = (data) => global.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  const escapeHtml = (value) => String(value || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
  const currency = (value) => Number(value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  const percent = (value) => `${Number(value || 0).toFixed(2)}%`;
  const statusLabel = (status) => ({ active: 'Ativo', pending_invite: 'Convite pendente', inactive: 'Inativo' }[status] || 'Sem status');

  const upsert = (rows, payload) => {
    const id = String(payload.id || '');
    if (!id) return [{ ...payload, id: nextId() }, ...rows];
    return rows.map((item) => (item.id === id ? { ...item, ...payload, id } : item));
  };

  const fillForm = (form, payload = {}) => {
    Array.from(form.elements).forEach((element) => {
      if (!element.name) return;
      element.value = payload[element.name] ?? '';
    });
  };

  const renderStandalone = () => {
    const root = global.document.querySelector('[data-equipe-app]');
    if (!root) return;

    const tableBody = root.querySelector('[data-grid="members"]');
    const legacyList = root.querySelector('[data-grid="legacy"]');
    const legacySection = root.querySelector('[data-legacy="true"]');
    const infoNode = root.querySelector('[data-equipe-info]');
    const clinicFilter = root.querySelector('[data-filter="clinic"]');
    const backendForm = root.querySelector('[data-backend-form]');
    const backendStatus = root.querySelector('[data-backend-status]');

    const dialog = root.ownerDocument.querySelector('[data-dialog="member"]');
    const form = root.ownerDocument.querySelector('[data-form="member"]');
    const formTitle = root.ownerDocument.querySelector('[data-form-title="member"]');
    const formClinicSelect = root.ownerDocument.querySelector('[data-form-clinic]');

    const cards = {
      members: root.querySelector('[data-kpi="members"]'),
      invites: root.querySelector('[data-kpi="invites"]'),
      multiclinic: root.querySelector('[data-kpi="multiclinic"]')
    };

    let state = read();
    let clinicContext = readClinics();
    let selectedClinicId = clinicContext.activeClinicId;

    const clinicNameById = (id) => clinicContext.clinics.find((c) => c.id === id)?.trade_name || id;

    const refillClinicOptions = () => {
      const clinicOptions = clinicContext.clinics.length
        ? clinicContext.clinics.map((clinic) => `<option value="${escapeHtml(clinic.id)}">${escapeHtml(clinic.trade_name)}</option>`).join('')
        : '<option value="cl-001">Clínica padrão</option>';

      clinicFilter.innerHTML = `<option value="all">Todas as clínicas</option>${clinicOptions}`;
      clinicFilter.value = selectedClinicId || clinicContext.activeClinicId || 'all';
      formClinicSelect.innerHTML = clinicOptions;
      if (!formClinicSelect.value) formClinicSelect.value = clinicContext.activeClinicId || 'cl-001';
    };

    const filteredRows = () => (
      selectedClinicId === 'all'
        ? state.memberships
        : state.memberships.filter((item) => item.clinic_id === selectedClinicId)
    );

    const paintKpis = () => {
      const rows = filteredRows();
      const pending = rows.filter((item) => item.status === 'pending_invite').length;
      const multi = Object.values(rows.reduce((acc, item) => {
        acc[item.email] = (acc[item.email] || 0) + 1;
        return acc;
      }, {})).filter((count) => count > 1).length;

      cards.members.innerHTML = `<h3>${rows.length}</h3><p>Vínculos na seleção atual</p>`;
      cards.invites.innerHTML = `<h3>${pending}</h3><p>Convites pendentes</p>`;
      cards.multiclinic.innerHTML = `<h3>${multi}</h3><p>Profissionais multi-clínica</p>`;
    };

    const paintTable = () => {
      const rows = filteredRows();
      if (!rows.length) {
        tableBody.innerHTML = '<tr><td colspan="8">Nenhum profissional encontrado.</td></tr>';
        return;
      }

      tableBody.innerHTML = rows.map((item) => `
        <tr>
          <td>${escapeHtml(item.full_name)}<br/><small>${escapeHtml(item.role)}</small></td>
          <td>${escapeHtml(item.email)}</td>
          <td>${escapeHtml(clinicNameById(item.clinic_id))}</td>
          <td>${escapeHtml(item.access_level)}</td>
          <td>${escapeHtml(item.contract_type)}</td>
          <td>${currency(item.monthly_cost)} / ${percent(item.receivable_split)}</td>
          <td><span class="equipe-pill is-${escapeHtml(item.status)}">${escapeHtml(statusLabel(item.status))}</span></td>
          <td><button type="button" class="equipe-link-btn" data-action="edit" data-id="${escapeHtml(item.id)}">Editar</button></td>
        </tr>
      `).join('');
    };

    const paintInfo = () => {
      if (!infoNode) return;
      infoNode.textContent = selectedClinicId === 'all'
        ? 'Visão consolidada de equipe para múltiplas clínicas.'
        : `Clínica selecionada: ${clinicNameById(selectedClinicId)}.`;
    };

    const paintLegacy = () => {
      const legacyMarkers = Array.isArray(state.legacyMarkers) ? state.legacyMarkers : [];
      legacyList.innerHTML = legacyMarkers.map((marker) => `<li>${escapeHtml(marker)}</li>`).join('');
      legacySection.hidden = legacyMarkers.length === 0;
    };

    const paint = () => {
      clinicContext = readClinics();
      refillClinicOptions();
      paintKpis();
      paintTable();
      paintInfo();
      paintLegacy();
    };

    root.addEventListener('click', (event) => {
      const trigger = event.target.closest('[data-action]');
      if (!trigger) return;
      const action = trigger.getAttribute('data-action');
      const id = trigger.getAttribute('data-id') || '';

      if (action === 'new-member') {
        formTitle.textContent = 'Novo vínculo de equipe';
        fillForm(form, { id: '', clinic_id: clinicContext.activeClinicId || 'cl-001', status: 'active' });
        dialog.showModal();
      }

      if (action === 'edit') {
        const row = state.memberships.find((item) => item.id === id);
        if (!row) return;
        formTitle.textContent = `Editar vínculo · ${row.full_name}`;
        fillForm(form, row);
        dialog.showModal();
      }

      if (action === 'reset-model') {
        state = deepClone(model);
        write(state);
        paint();
      }
    });

    clinicFilter.addEventListener('change', (event) => {
      selectedClinicId = String(event.target.value || 'all');
      paint();
    });

    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const fd = new FormData(form);
      const draft = {
        id: String(fd.get('id') || ''),
        clinic_id: String(fd.get('clinic_id') || clinicContext.activeClinicId || 'cl-001'),
        full_name: String(fd.get('full_name') || ''),
        email: String(fd.get('email') || ''),
        role: String(fd.get('role') || 'apoio'),
        access_level: String(fd.get('access_level') || 'operational'),
        contract_type: String(fd.get('contract_type') || 'pj'),
        monthly_cost: Number(fd.get('monthly_cost') || 0),
        receivable_split: Number(fd.get('receivable_split') || 0),
        status: String(fd.get('status') || 'active')
      };

      if (!draft.full_name || !draft.email) return;

      state.memberships = upsert(state.memberships, draft);
      write(state);
      dialog.close();
      paint();
    });

    backendForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const endpoint = String(new FormData(backendForm).get('endpoint') || '').trim();
      if (!endpoint) return;
      backendStatus.textContent = 'Sincronizando com backend local...';

      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ clinicId: selectedClinicId, memberships: filteredRows() })
        });

        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        backendStatus.textContent = `Sincronização concluída em ${new Date().toLocaleTimeString('pt-BR')}.`;
      } catch (error) {
        backendStatus.textContent = `Falha na sincronização local: ${error?.message || 'erro desconhecido'}.`;
      }
    });

    paint();
  };

  const namespace = global.OdontoFlowTeamComponents = global.OdontoFlowTeamComponents || {};
  namespace.createTeamLegacyFrame = function createTeamLegacyFrame() {
    return function TeamLegacyFrame(props) {
      const src = props?.src || './apps/web/src/team/equipe.html';
      return global.React.createElement(
        'section',
        { className: 'team-page-section team-legacy-frame' },
        global.React.createElement('iframe', {
          className: 'team-legacy-frame__iframe',
          src,
          title: 'Framework Equipe',
          loading: 'lazy'
        })
      );
    };
  };

  if (global.document?.querySelector('[data-equipe-app]')) {
    renderStandalone();
  }
}(globalThis));
