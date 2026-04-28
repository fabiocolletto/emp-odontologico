(function registerPatientsFramework(global) {
  const STORAGE_KEY = 'odontoflow-pacientes-framework-v1';
  const CLINICS_KEY = 'odontoflow-clinicas-framework-v1';

  const model = {
    patients: [
      {
        id: 'pt-001',
        clinic_id: 'cl-001',
        full_name: 'Mariana Costa',
        phone: '(11) 98888-1100',
        email: 'mariana@exemplo.com',
        document_number: '123.456.789-10',
        insurance_name: 'Particular',
        last_visit: '2026-04-10',
        status: 'active',
        created_at: '2026-04-01'
      },
      {
        id: 'pt-002',
        clinic_id: 'cl-001',
        full_name: 'Ricardo Souza',
        phone: '(11) 97777-2200',
        email: 'ricardo@exemplo.com',
        document_number: '987.654.321-00',
        insurance_name: 'OdontoPrev',
        last_visit: '2026-04-18',
        status: 'attention',
        created_at: '2026-04-05'
      }
    ],
    legacyMarkers: []
  };

  const deepClone = (value) => JSON.parse(JSON.stringify(value));
  const nextId = () => `pt-${Date.now()}`;
  const todayISO = () => new Date().toISOString().slice(0, 10);

  const read = () => {
    try {
      const raw = global.localStorage.getItem(STORAGE_KEY);
      if (!raw) return deepClone(model);
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed?.patients)) return deepClone(model);
      return { ...parsed, legacyMarkers: [] };
    } catch {
      return deepClone(model);
    }
  };

  const readClinicContext = () => {
    try {
      const raw = global.localStorage.getItem(CLINICS_KEY);
      if (!raw) return { activeClinicId: 'cl-001' };
      const parsed = JSON.parse(raw);
      return { activeClinicId: parsed?.activeClinicId || 'cl-001' };
    } catch {
      return { activeClinicId: 'cl-001' };
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
    if (current === 'active') return 'is-active';
    if (current === 'attention') return 'is-attention';
    return 'is-inactive';
  };

  const getStatusLabel = (status) => {
    const map = { active: 'Ativo', attention: 'Atenção', inactive: 'Inativo' };
    return map[String(status || '').toLowerCase()] || 'Sem status';
  };

  const formatDate = (date) => {
    if (!date) return '-';
    const [y, m, d] = String(date).split('-');
    return y && m && d ? `${d}/${m}/${y}` : date;
  };

  const upsert = (rows, payload) => {
    const id = String(payload.id || '');
    if (!id) return [{ ...payload, id: nextId(), created_at: todayISO() }, ...rows];
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
    const root = global.document.querySelector('[data-pacientes-app]');
    if (!root) return;

    const tableBody = root.querySelector('[data-grid="patients"]');
    const legacyList = root.querySelector('[data-grid="legacy"]');
    const legacySection = root.querySelector('[data-legacy="true"]');
    const backendForm = root.querySelector('[data-backend-form]');
    const backendStatus = root.querySelector('[data-backend-status]');
    const infoNode = root.querySelector('[data-patient-info]');
    const searchInput = root.querySelector('[data-filter="search"]');

    const dialog = root.ownerDocument.querySelector('[data-dialog="patient"]');
    const form = root.ownerDocument.querySelector('[data-form="patient"]');
    const formTitle = root.ownerDocument.querySelector('[data-form-title="patient"]');

    const cards = {
      total: root.querySelector('[data-kpi="total"]'),
      active: root.querySelector('[data-kpi="active"]'),
      newMonth: root.querySelector('[data-kpi="new-month"]')
    };

    wireDialogCloseOnBackdrop(dialog);

    let state = read();
    let clinicContext = readClinicContext();
    let query = '';

    const patientsFromActiveClinic = () => state.patients.filter((patient) => patient.clinic_id === clinicContext.activeClinicId);

    const paintKpis = () => {
      const base = patientsFromActiveClinic();
      const activeCount = base.filter((item) => item.status === 'active').length;
      const monthRef = todayISO().slice(0, 7);
      const createdThisMonth = base.filter((item) => String(item.created_at || '').slice(0, 7) === monthRef).length;

      cards.total.innerHTML = `<h3>${base.length}</h3><p>Total da clínica ativa</p>`;
      cards.active.innerHTML = `<h3>${activeCount}</h3><p>Pacientes ativos</p>`;
      cards.newMonth.innerHTML = `<h3>${createdThisMonth}</h3><p>Novos no mês</p>`;
    };

    const paintTable = () => {
      const normalized = query.trim().toLocaleLowerCase('pt-BR');
      const base = patientsFromActiveClinic();
      const rows = normalized
        ? base.filter((item) => [item.full_name, item.document_number, item.phone].some((field) => String(field || '').toLocaleLowerCase('pt-BR').includes(normalized)))
        : base;

      if (!rows.length) {
        tableBody.innerHTML = '<tr><td colspan="7">Nenhum paciente encontrado para a clínica ativa.</td></tr>';
        return;
      }

      tableBody.innerHTML = rows.map((patient) => `
        <tr>
          <td>${escapeHtml(patient.full_name)}</td>
          <td>${escapeHtml(patient.phone)}<br/><small>${escapeHtml(patient.email)}</small></td>
          <td>${escapeHtml(patient.document_number)}</td>
          <td>${escapeHtml(patient.insurance_name || 'Particular')}</td>
          <td>${escapeHtml(formatDate(patient.last_visit))}</td>
          <td><span class="pacientes-pill ${getStatusClass(patient.status)}">${escapeHtml(getStatusLabel(patient.status))}</span></td>
          <td><button type="button" class="pacientes-link-btn" data-action="edit" data-id="${escapeHtml(patient.id)}">Editar</button></td>
        </tr>
      `).join('');
    };

    const paintLegacy = () => {
      const legacyMarkers = Array.isArray(state.legacyMarkers) ? state.legacyMarkers : [];
      legacyList.innerHTML = legacyMarkers.map((marker) => `<li>${escapeHtml(marker)}</li>`).join('');
      legacySection.hidden = legacyMarkers.length === 0;
    };

    const paintInfo = () => {
      if (infoNode) infoNode.textContent = `Contexto atual da clínica: ${clinicContext.activeClinicId}. Apenas pacientes desta clínica são listados.`;
    };

    const paint = () => {
      clinicContext = readClinicContext();
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

      if (action === 'new-patient') {
        formTitle.textContent = 'Novo paciente';
        fillForm(form, { id: '', status: 'active' });
        dialog.showModal();
      }

      if (action === 'edit') {
        const patient = state.patients.find((item) => item.id === id);
        if (!patient) return;
        formTitle.textContent = `Editar paciente · ${patient.full_name}`;
        fillForm(form, patient);
        dialog.showModal();
      }

      if (action === 'reset-model') {
        state = deepClone(model);
        write(state);
        paint();
      }
    });

    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const fd = new FormData(form);
      const draft = {
        id: String(fd.get('id') || ''),
        clinic_id: clinicContext.activeClinicId,
        full_name: String(fd.get('full_name') || ''),
        phone: String(fd.get('phone') || ''),
        email: String(fd.get('email') || ''),
        document_number: String(fd.get('document_number') || ''),
        insurance_name: String(fd.get('insurance_name') || 'Particular'),
        last_visit: String(fd.get('last_visit') || ''),
        status: String(fd.get('status') || 'active')
      };

      if (!draft.full_name) return;

      state.patients = upsert(state.patients, draft);
      write(state);
      dialog.close();
      paint();
    });

    searchInput.addEventListener('input', (event) => {
      query = String(event.target.value || '');
      paintTable();
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
          body: JSON.stringify({ clinicId: clinicContext.activeClinicId, patients: patientsFromActiveClinic() })
        });

        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        backendStatus.textContent = `Sincronização concluída em ${new Date().toLocaleTimeString('pt-BR')}.`;
      } catch (error) {
        backendStatus.textContent = `Falha na sincronização local: ${error?.message || 'erro desconhecido'}.`;
      }
    });

    paint();
  };

  const namespace = global.OdontoFlowPatientComponents = global.OdontoFlowPatientComponents || {};
  namespace.createPatientsLegacyFrame = function createPatientsLegacyFrame() {
    return function PatientsLegacyFrame(props) {
      const src = props?.src || './apps/web/src/patients/pacientes.html';
      return global.React.createElement(
        'section',
        { className: 'patients-page-section patients-legacy-frame' },
        global.React.createElement('iframe', {
          className: 'patients-legacy-frame__iframe',
          src,
          title: 'Framework Pacientes',
          loading: 'lazy'
        })
      );
    };
  };

  if (global.document?.querySelector('[data-pacientes-app]')) {
    renderStandalone();
  }
}(globalThis));
