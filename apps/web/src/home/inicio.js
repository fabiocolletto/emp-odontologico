(function registerInicioFramework(global) {
  const STORAGE_KEY = 'odontoflow-inicio-framework-v1';

  const model = {
    kpis: {
      appointmentsToday: 12,
      patientsActive: 184,
      financialBalance: 'R$ 27.430'
    },
    shortcuts: [
      { id: 'agenda', title: 'Agenda', description: 'Acompanhar atendimentos e confirmações do dia.' },
      { id: 'patients', title: 'Pacientes', description: 'Consultar base, prontuários e status de cadastro.' },
      { id: 'clinic', title: 'Clínica', description: 'Revisar dados institucionais e configuração operacional.' },
      { id: 'team', title: 'Equipe', description: 'Gerenciar profissionais, vínculos e permissões.' },
      { id: 'financial', title: 'Financeiro', description: 'Monitorar caixa, receitas e despesas recorrentes.' },
      { id: 'profile', title: 'Perfil', description: 'Atualizar conta e preferências do usuário logado.' }
    ],
    feed: [
      '3 pacientes aguardando confirmação de consulta para hoje.',
      '2 lançamentos financeiros pendentes de conciliação.',
      '1 atualização de cadastro da clínica recomendada.'
    ],
    legacyMarkers: []
  };

  const deepClone = (value) => JSON.parse(JSON.stringify(value));
  const read = () => {
    try {
      const raw = global.localStorage.getItem(STORAGE_KEY);
      if (!raw) return deepClone(model);
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed?.shortcuts)) return deepClone(model);
      return { ...parsed, legacyMarkers: [] };
    } catch {
      return deepClone(model);
    }
  };
  const write = (data) => global.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  const escapeHtml = (value) => String(value || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');

  const renderStandalone = () => {
    const root = global.document.querySelector('[data-inicio-app]');
    if (!root) return;

    const cards = {
      appointments: root.querySelector('[data-kpi="appointments"]'),
      patients: root.querySelector('[data-kpi="patients"]'),
      financial: root.querySelector('[data-kpi="financial"]')
    };
    const shortcutsGrid = root.querySelector('[data-grid="shortcuts"]');
    const feedGrid = root.querySelector('[data-grid="feed"]');
    const legacyGrid = root.querySelector('[data-grid="legacy"]');
    const legacySection = root.querySelector('[data-legacy="true"]');
    const infoNode = root.querySelector('[data-inicio-info]');

    let state = read();

    const paint = () => {
      cards.appointments.innerHTML = `<h3>${escapeHtml(state.kpis.appointmentsToday)}</h3><p>Atendimentos previstos hoje</p>`;
      cards.patients.innerHTML = `<h3>${escapeHtml(state.kpis.patientsActive)}</h3><p>Pacientes ativos na clínica</p>`;
      cards.financial.innerHTML = `<h3>${escapeHtml(state.kpis.financialBalance)}</h3><p>Saldo operacional consolidado</p>`;

      shortcutsGrid.innerHTML = state.shortcuts.map((item) => `
        <button type="button" class="inicio-shortcut" data-action="nav" data-target="${escapeHtml(item.id)}">
          <h3>${escapeHtml(item.title)}</h3>
          <p>${escapeHtml(item.description)}</p>
        </button>
      `).join('');

      feedGrid.innerHTML = state.feed.map((item) => `<li>${escapeHtml(item)}</li>`).join('');
      const legacyMarkers = Array.isArray(state.legacyMarkers) ? state.legacyMarkers : [];
      legacyGrid.innerHTML = legacyMarkers.map((marker) => `<li>${escapeHtml(marker)}</li>`).join('');
      legacySection.hidden = legacyMarkers.length === 0;
      infoNode.textContent = 'Nível 0 ativo. Selecione um atalho para navegar ao respectivo módulo nível 1.';
    };

    root.addEventListener('click', (event) => {
      const trigger = event.target.closest('[data-action]');
      if (!trigger) return;
      const action = trigger.getAttribute('data-action');

      if (action === 'reset-model') {
        state = deepClone(model);
        write(state);
        paint();
        return;
      }

      if (action === 'nav') {
        const target = trigger.getAttribute('data-target') || '';
        infoNode.textContent = `Atalho selecionado: ${target}. Integração de navegação será concluída pelo shell principal.`;
      }
    });

    paint();
  };

  const namespace = global.OdontoFlowHomeComponents = global.OdontoFlowHomeComponents || {};
  namespace.createHomeLegacyFrame = function createHomeLegacyFrame() {
    return function HomeLegacyFrame(props) {
      const src = props?.src || './apps/web/src/home/inicio.html';
      return global.React.createElement(
        'section',
        { className: 'inicio-page-section inicio-legacy-frame' },
        global.React.createElement('iframe', {
          className: 'inicio-legacy-frame__iframe',
          src,
          title: 'Framework Início',
          loading: 'lazy'
        })
      );
    };
  };

  if (global.document?.querySelector('[data-inicio-app]')) {
    renderStandalone();
  }
}(globalThis));
