(function registerClinicFramework(global) {
  const STORAGE_KEY = 'odontoflow-clinicas-framework-v1';

  const model = {
    activeClinicId: 'cl-001',
    clinics: [
      {
        id: 'cl-001',
        trade_name: 'OdontoFlow Matriz',
        legal_name: 'OdontoFlow Serviços Odontológicos LTDA',
        document_number: '12.345.678/0001-90',
        email: 'contato@odontoflow.com.br',
        phone: '(11) 3000-4000',
        city: 'São Paulo',
        state: 'SP',
        status: 'active'
      },
      {
        id: 'cl-002',
        trade_name: 'Unidade Jardins',
        legal_name: 'OdontoFlow Jardins LTDA',
        document_number: '98.765.432/0001-10',
        email: 'jardins@odontoflow.com.br',
        phone: '(11) 3555-8000',
        city: 'São Paulo',
        state: 'SP',
        status: 'trial'
      }
    ],
    legacyMarkers: []
  };

  const deepClone = (value) => JSON.parse(JSON.stringify(value));
  const nextId = () => `cl-${Date.now()}`;

  const read = () => {
    try {
      const raw = global.localStorage.getItem(STORAGE_KEY);
      if (!raw) return deepClone(model);
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed?.clinics)) return deepClone(model);
      return { ...parsed, legacyMarkers: [] };
    } catch {
      return deepClone(model);
    }
  };

  const write = (data) => global.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));

  const escapeHtml = (value) => String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

  const getStatusClass = (status) => {
    const current = String(status || '').toLowerCase();
    if (['active'].includes(current)) return 'is-active';
    if (['trial'].includes(current)) return 'is-trial';
    if (['inactive'].includes(current)) return 'is-inactive';
    return 'is-archived';
  };

  const getStatusLabel = (status) => {
    const map = {
      active: 'Ativa',
      trial: 'Trial',
      inactive: 'Inativa',
      archived: 'Arquivada'
    };
    return map[String(status || '').toLowerCase()] || 'Sem status';
  };

  const upsertClinic = (rows, payload) => {
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

  const wireDialogCloseOnBackdrop = (dialog) => {
    dialog.addEventListener('click', (event) => {
      const box = dialog.getBoundingClientRect();
      if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) {
        dialog.close('cancel');
      }
    });
  };

  const renderStandalone = () => {
    const root = global.document.querySelector('[data-clinicas-app]');
    if (!root) return;

    const tableBody = root.querySelector('[data-grid="clinics"]');
    const legacyList = root.querySelector('[data-grid="legacy"]');
    const legacySection = root.querySelector('[data-legacy="true"]');
    const backendForm = root.querySelector('[data-backend-form]');
    const backendStatus = root.querySelector('[data-backend-status]');
    const infoNode = root.querySelector('[data-clinic-info]');

    const dialog = root.ownerDocument.querySelector('[data-dialog="clinic"]');
    const form = root.ownerDocument.querySelector('[data-form="clinic"]');
    const formTitle = root.ownerDocument.querySelector('[data-form-title="clinic"]');

    const cards = {
      total: root.querySelector('[data-kpi="total"]'),
      active: root.querySelector('[data-kpi="active"]'),
      status: root.querySelector('[data-kpi="status"]')
    };

    wireDialogCloseOnBackdrop(dialog);

    let state = read();

    const paintKpis = () => {
      const total = state.clinics.length;
      const active = state.clinics.filter((clinic) => clinic.id === state.activeClinicId).length;
      const activeStatus = state.clinics.find((clinic) => clinic.id === state.activeClinicId)?.status || 'active';

      cards.total.innerHTML = `<h3>${total}</h3><p>Clínicas cadastradas</p>`;
      cards.active.innerHTML = `<h3>${active === 1 ? 'Sim' : 'Não'}</h3><p>Existe clínica ativa por usuário</p>`;
      cards.status.innerHTML = `<h3>${escapeHtml(getStatusLabel(activeStatus))}</h3><p>Status da clínica ativa</p>`;
    };

    const paintTable = () => {
      if (!state.clinics.length) {
        tableBody.innerHTML = '<tr><td colspan="7">Nenhuma clínica cadastrada.</td></tr>';
        return;
      }

      tableBody.innerHTML = state.clinics.map((clinic) => `
        <tr>
          <td><input type="radio" name="active-clinic" ${clinic.id === state.activeClinicId ? 'checked' : ''} data-action="set-active" data-id="${escapeHtml(clinic.id)}" aria-label="Definir clínica ativa ${escapeHtml(clinic.trade_name)}" /></td>
          <td>${escapeHtml(clinic.trade_name)}</td>
          <td>${escapeHtml(clinic.legal_name)}</td>
          <td>${escapeHtml(clinic.document_number)}</td>
          <td>${escapeHtml(clinic.city)} / ${escapeHtml(clinic.state)}</td>
          <td><span class="clinicas-pill ${getStatusClass(clinic.status)}">${escapeHtml(getStatusLabel(clinic.status))}</span></td>
          <td>
            <button type="button" class="clinicas-link-btn" data-action="edit" data-id="${escapeHtml(clinic.id)}">Editar</button>
          </td>
        </tr>
      `).join('');
    };

    const paintLegacy = () => {
      const legacyMarkers = Array.isArray(state.legacyMarkers) ? state.legacyMarkers : [];
      legacyList.innerHTML = legacyMarkers.map((marker) => `<li>${escapeHtml(marker)}</li>`).join('');
      legacySection.hidden = legacyMarkers.length === 0;
    };

    const paintInfo = () => {
      const active = state.clinics.find((clinic) => clinic.id === state.activeClinicId);
      infoNode.textContent = active
        ? `Clínica ativa atual: ${active.trade_name} (${active.city}/${active.state}).`
        : 'Selecione uma clínica ativa para o contexto de usuário.';
    };

    const paint = () => {
      paintKpis();
      paintTable();
      paintLegacy();
      paintInfo();
    };

    root.addEventListener('click', (event) => {
      const trigger = event.target.closest('[data-action]');
      if (!trigger) return;

      const action = trigger.getAttribute('data-action');
      const id = trigger.getAttribute('data-id') || '';

      if (action === 'new-clinic') {
        formTitle.textContent = 'Nova clínica';
        fillForm(form, { id: '', status: 'active' });
        dialog.showModal();
      }

      if (action === 'edit') {
        const clinic = state.clinics.find((item) => item.id === id);
        if (!clinic) return;
        formTitle.textContent = `Editar clínica · ${clinic.trade_name}`;
        fillForm(form, clinic);
        dialog.showModal();
      }

      if (action === 'reset-model') {
        state = deepClone(model);
        write(state);
        paint();
      }

      if (action === 'set-active') {
        state.activeClinicId = id;
        write(state);
        paint();
      }
    });

    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const fd = new FormData(form);
      const draft = {
        id: String(fd.get('id') || ''),
        trade_name: String(fd.get('trade_name') || ''),
        legal_name: String(fd.get('legal_name') || ''),
        document_number: String(fd.get('document_number') || ''),
        email: String(fd.get('email') || ''),
        phone: String(fd.get('phone') || ''),
        city: String(fd.get('city') || ''),
        state: String(fd.get('state') || ''),
        status: String(fd.get('status') || 'active')
      };

      if (!draft.trade_name) return;

      state.clinics = upsertClinic(state.clinics, draft);
      if (!state.activeClinicId || !state.clinics.some((clinic) => clinic.id === state.activeClinicId)) {
        state.activeClinicId = state.clinics[0]?.id || '';
      }
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
          body: JSON.stringify({ activeClinicId: state.activeClinicId, clinics: state.clinics })
        });

        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        backendStatus.textContent = `Sincronização concluída em ${new Date().toLocaleTimeString('pt-BR')}.`;
      } catch (error) {
        backendStatus.textContent = `Falha na sincronização local: ${error?.message || 'erro desconhecido'}.`;
      }
    });

    paint();
  };

  const namespace = global.OdontoFlowClinicComponents = global.OdontoFlowClinicComponents || {};
  namespace.createClinicLegacyFrame = function createClinicLegacyFrame() {
    return function ClinicLegacyFrame(props) {
      const src = props?.src || './apps/web/src/clinics/clinicas.html';
      return global.React.createElement(
        'section',
        { className: 'clinic-page-section clinic-legacy-frame' },
        global.React.createElement('iframe', {
          className: 'clinic-legacy-frame__iframe',
          src,
          title: 'Framework Clínicas',
          loading: 'lazy'
        })
      );
    };
  };

  if (global.document?.querySelector('[data-clinicas-app]')) {
    renderStandalone();
  }
}(globalThis));
