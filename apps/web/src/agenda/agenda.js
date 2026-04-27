(function registerAgendaFramework(global) {
  const STORAGE_KEY = 'odontoflow-agenda-framework-v1';

  const today = () => new Date().toISOString().slice(0, 10);

  const model = {
    appointments: [
      { id: 'ag-001', date: today(), time: '08:30', patient_name: 'Amanda Lima', professional_name: 'Dra. Julia Martins', procedure: 'Avaliação inicial', channel: 'whatsapp', status: 'confirmed' },
      { id: 'ag-002', date: today(), time: '10:00', patient_name: 'Bruno Costa', professional_name: 'Dra. Julia Martins', procedure: 'Limpeza', channel: 'telefone', status: 'pending' },
      { id: 'ag-003', date: today(), time: '11:30', patient_name: 'Carla Mendes', professional_name: 'Dr. Rafael Nunes', procedure: 'Retorno', channel: 'presencial', status: 'checked_in' }
    ],
    legacyMarkers: ['agenda-grid-v0', 'agenda-modal-legacy', 'agenda-status-antigo']
  };

  const deepClone = (value) => JSON.parse(JSON.stringify(value));
  const nextId = () => `ag-${Date.now()}`;
  const read = () => {
    try {
      const raw = global.localStorage.getItem(STORAGE_KEY);
      if (!raw) return deepClone(model);
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed?.appointments)) return deepClone(model);
      return parsed;
    } catch {
      return deepClone(model);
    }
  };
  const write = (data) => global.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  const escapeHtml = (value) => String(value || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
  const statusLabel = (status) => ({ confirmed: 'Confirmado', pending: 'Pendente', checked_in: 'Em atendimento', missed: 'Falta', completed: 'Concluído' }[status] || 'Sem status');

  const upsert = (rows, payload) => {
    const id = String(payload.id || '');
    if (!id) return [{ ...payload, id: nextId() }, ...rows];
    return rows.map((item) => (item.id === id ? { ...item, ...payload, id } : item));
  };

  const fillForm = (form, payload = {}) => {
    Array.from(form.elements).forEach((el) => {
      if (!el.name) return;
      el.value = payload[el.name] ?? '';
    });
  };

  const renderStandalone = () => {
    const root = global.document.querySelector('[data-agenda-app]');
    if (!root) return;

    const tableBody = root.querySelector('[data-grid="appointments"]');
    const legacyList = root.querySelector('[data-grid="legacy"]');
    const infoNode = root.querySelector('[data-agenda-info]');
    const dateFilter = root.querySelector('[data-filter="date"]');

    const dialog = root.ownerDocument.querySelector('[data-dialog="item"]');
    const form = root.ownerDocument.querySelector('[data-form="item"]');
    const formTitle = root.ownerDocument.querySelector('[data-form-title="item"]');

    const cards = {
      today: root.querySelector('[data-kpi="today"]'),
      confirmed: root.querySelector('[data-kpi="confirmed"]'),
      queue: root.querySelector('[data-kpi="queue"]')
    };

    let state = read();
    let selectedDate = today();
    dateFilter.value = selectedDate;

    const rows = () => state.appointments.filter((item) => item.date === selectedDate).sort((a, b) => String(a.time).localeCompare(String(b.time)));

    const paint = () => {
      const current = rows();
      const confirmed = current.filter((item) => item.status === 'confirmed').length;
      const queue = current.filter((item) => ['pending', 'checked_in'].includes(item.status)).length;

      cards.today.innerHTML = `<h3>${current.length}</h3><p>Atendimentos no dia</p>`;
      cards.confirmed.innerHTML = `<h3>${confirmed}</h3><p>Confirmados</p>`;
      cards.queue.innerHTML = `<h3>${queue}</h3><p>Fila ativa</p>`;

      tableBody.innerHTML = current.length
        ? current.map((item) => `
          <tr>
            <td>${escapeHtml(item.time)}</td>
            <td>${escapeHtml(item.patient_name)}</td>
            <td>${escapeHtml(item.professional_name)}</td>
            <td>${escapeHtml(item.procedure)}</td>
            <td>${escapeHtml(item.channel)}</td>
            <td><span class="agenda-pill is-${escapeHtml(item.status)}">${escapeHtml(statusLabel(item.status))}</span></td>
            <td><button type="button" class="agenda-link-btn" data-action="edit" data-id="${escapeHtml(item.id)}">Editar</button></td>
          </tr>
        `).join('')
        : '<tr><td colspan="7">Nenhum atendimento para esta data.</td></tr>';

      infoNode.textContent = `Data selecionada: ${selectedDate.split('-').reverse().join('/')}.`;
      legacyList.innerHTML = state.legacyMarkers.map((marker) => `<li>${escapeHtml(marker)}</li>`).join('');
    };

    root.addEventListener('click', (event) => {
      const trigger = event.target.closest('[data-action]');
      if (!trigger) return;
      const action = trigger.getAttribute('data-action');
      const id = trigger.getAttribute('data-id') || '';

      if (action === 'new-item') {
        formTitle.textContent = 'Novo atendimento';
        fillForm(form, { id: '', date: selectedDate, status: 'confirmed' });
        dialog.showModal();
      }

      if (action === 'edit') {
        const row = state.appointments.find((item) => item.id === id);
        if (!row) return;
        formTitle.textContent = `Editar atendimento · ${row.patient_name}`;
        fillForm(form, row);
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
        date: String(fd.get('date') || selectedDate),
        time: String(fd.get('time') || ''),
        patient_name: String(fd.get('patient_name') || ''),
        professional_name: String(fd.get('professional_name') || ''),
        procedure: String(fd.get('procedure') || ''),
        channel: String(fd.get('channel') || 'whatsapp'),
        status: String(fd.get('status') || 'confirmed')
      };

      if (!draft.patient_name || !draft.professional_name || !draft.time) return;

      state.appointments = upsert(state.appointments, draft);
      write(state);
      dialog.close();
      paint();
    });

    dateFilter.addEventListener('change', (event) => {
      selectedDate = String(event.target.value || today());
      paint();
    });

    paint();
  };

  const namespace = global.OdontoFlowAgendaComponents = global.OdontoFlowAgendaComponents || {};
  namespace.createAgendaLegacyFrame = function createAgendaLegacyFrame() {
    return function AgendaLegacyFrame(props) {
      const src = props?.src || './apps/web/src/agenda/agenda.html';
      return global.React.createElement(
        'section',
        { className: 'agenda-page-section agenda-legacy-frame' },
        global.React.createElement('iframe', {
          className: 'agenda-legacy-frame__iframe',
          src,
          title: 'Framework Agenda',
          loading: 'lazy'
        })
      );
    };
  };

  if (global.document?.querySelector('[data-agenda-app]')) {
    renderStandalone();
  }
}(globalThis));
