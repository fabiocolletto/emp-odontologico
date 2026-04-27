(function registerFinancialFramework(global) {
  const STORAGE_KEY = 'odontoflow-financeiro-framework-v2';

  const model = {
    launches: [
      { id: 101, tipo: 'entrada', descricao: 'Consulta clínica inicial', categoria: 'Atendimento', data_vencimento: '2026-04-03', valor: 260, status: 'recebido' },
      { id: 102, tipo: 'entrada', descricao: 'Clareamento dental', categoria: 'Estética', data_vencimento: '2026-04-05', valor: 1400, status: 'recebido' },
      { id: 103, tipo: 'entrada', descricao: 'Repasse convênio abril', categoria: 'Convênio', data_vencimento: '2026-04-20', valor: 4200, status: 'previsto' },
      { id: 104, tipo: 'entrada', descricao: 'Plano ortodôntico mensal', categoria: 'Ortodontia', data_vencimento: '2026-04-28', valor: 980, status: 'recebido' },
      { id: 201, tipo: 'saida', descricao: 'Aluguel da clínica', categoria: 'Estrutura', data_vencimento: '2026-04-05', valor: 5300, status: 'pago' },
      { id: 202, tipo: 'saida', descricao: 'Laboratório de prótese', categoria: 'Laboratório', data_vencimento: '2026-04-12', valor: 1980, status: 'previsto' },
      { id: 203, tipo: 'saida', descricao: 'Materiais clínicos', categoria: 'Insumos', data_vencimento: '2026-04-09', valor: 1320, status: 'pago' },
      { id: 204, tipo: 'saida', descricao: 'Contabilidade mensal', categoria: 'Administrativo', data_vencimento: '2026-04-30', valor: 1180, status: 'previsto' }
    ],
    recurring: [
      { id: 1, descricao: 'Aluguel da clínica', valor: 5300, periodicidade: 'mensal', status: 'pago' },
      { id: 2, descricao: 'Folha de pagamento', valor: 12890, periodicidade: 'mensal', status: 'pendente' },
      { id: 3, descricao: 'Software de gestão', valor: 690, periodicidade: 'mensal', status: 'pago' },
      { id: 4, descricao: 'Esterilização terceirizada', valor: 1180, periodicidade: 'semanal', status: 'pendente' }
    ]
  };

  const deepClone = (value) => JSON.parse(JSON.stringify(value));

  const read = () => {
    try {
      const raw = global.localStorage.getItem(STORAGE_KEY);
      if (!raw) return deepClone(model);
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed?.launches) || !Array.isArray(parsed?.recurring)) return deepClone(model);
      return parsed;
    } catch (error) {
      return deepClone(model);
    }
  };

  const write = (data) => global.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));

  const currency = (value) => Number(value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  const datePtBr = (value) => {
    if (!value) return '-';
    const [y, m, d] = String(value).split('-');
    if (!y || !m || !d) return value;
    return `${d}/${m}/${y}`;
  };

  const escapeHtml = (value) => String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

  const statusClass = (status) => {
    if (['pago', 'recebido'].includes(status)) return 'is-success';
    if (['vencido', 'cancelado'].includes(status)) return 'is-danger';
    return 'is-warning';
  };

  const renderStandalone = () => {
    const root = global.document.querySelector('[data-financeiro-app]');
    if (!root) return;

    const body = root.querySelector('[data-grid="lancamentos"]');
    const recurring = root.querySelector('[data-grid="recorrencias"]');
    const dialog = root.querySelector('[data-dialog="lancamento"]');
    const form = root.querySelector('[data-form="lancamento"]');
    const kpiReceitas = root.querySelector('[data-kpi="receitas"]');
    const kpiDespesas = root.querySelector('[data-kpi="despesas"]');
    const kpiSaldo = root.querySelector('[data-kpi="saldo"]');
    const sampleInfo = root.querySelector('[data-sample-info]');

    let state = read();

    const paint = () => {
      const launches = [...state.launches].sort((a, b) => String(b.data_vencimento || '').localeCompare(String(a.data_vencimento || '')));
      const receitas = launches.filter((item) => item.tipo === 'entrada').reduce((acc, item) => acc + Number(item.valor || 0), 0);
      const despesas = launches.filter((item) => item.tipo === 'saida').reduce((acc, item) => acc + Number(item.valor || 0), 0);
      const saldo = receitas - despesas;
      const recebidos = launches.filter((item) => item.tipo === 'entrada' && item.status === 'recebido').length;
      const previstosSaida = launches.filter((item) => item.tipo === 'saida' && item.status === 'previsto').length;

      kpiReceitas.innerHTML = `<p class="financeiro-kpi-title">Receitas</p><strong class="financeiro-kpi-value">${currency(receitas)}</strong><small>${recebidos} recebidas</small>`;
      kpiDespesas.innerHTML = `<p class="financeiro-kpi-title">Despesas</p><strong class="financeiro-kpi-value">${currency(despesas)}</strong><small>${previstosSaida} previstas</small>`;
      kpiSaldo.innerHTML = `<p class="financeiro-kpi-title">Saldo</p><strong class="financeiro-kpi-value">${currency(saldo)}</strong><small>${saldo >= 0 ? 'Operação saudável' : 'Atenção ao caixa'}</small>`;

      body.innerHTML = launches.map((item) => `
        <tr>
          <td><span class="financeiro-pill ${item.tipo === 'entrada' ? 'is-in' : 'is-out'}">${escapeHtml(item.tipo)}</span></td>
          <td>${escapeHtml(item.descricao)}</td>
          <td>${escapeHtml(item.categoria)}</td>
          <td>${datePtBr(item.data_vencimento)}</td>
          <td>${currency(item.valor)}</td>
          <td><span class="financeiro-pill ${statusClass(item.status)}">${escapeHtml(item.status || 'previsto')}</span></td>
        </tr>
      `).join('');

      recurring.innerHTML = state.recurring
        .map((item) => `<span class="financeiro-chip">${escapeHtml(item.descricao)} • ${currency(item.valor)} • ${escapeHtml(item.periodicidade)}</span>`)
        .join('');

      if (sampleInfo) {
        sampleInfo.textContent = `Dados modelo carregados: ${launches.length} lançamentos e ${state.recurring.length} recorrências.`;
      }
    };

    root.querySelector('[data-action="novo-lancamento"]').addEventListener('click', () => dialog.showModal());

    const resetModelData = root.querySelector('[data-action="reset-model"]');
    if (resetModelData) {
      resetModelData.addEventListener('click', () => {
        state = deepClone(model);
        write(state);
        paint();
      });
    }

    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const fd = new FormData(form);
      state = {
        ...state,
        launches: [
          {
            id: Date.now(),
            tipo: fd.get('tipo'),
            descricao: String(fd.get('descricao') || ''),
            categoria: String(fd.get('categoria') || ''),
            data_vencimento: String(fd.get('data_vencimento') || ''),
            valor: Number(fd.get('valor') || 0),
            status: fd.get('tipo') === 'entrada' ? 'recebido' : 'previsto'
          },
          ...state.launches
        ]
      };
      write(state);
      dialog.close();
      form.reset();
      paint();
    });

    paint();
  };

  const namespace = global.OdontoFlowFinancialComponents = global.OdontoFlowFinancialComponents || {};
  namespace.createFinancialLegacyFrame = function createFinancialLegacyFrame() {
    return function FinancialLegacyFrame(props) {
      const src = props?.src || './apps/web/src/financial/financeiro.html';
      return global.React.createElement(
        'section',
        { className: 'financial-page-section financial-legacy-frame' },
        global.React.createElement('iframe', {
          className: 'financial-legacy-frame__iframe',
          src,
          title: 'Framework Financeiro',
          loading: 'lazy'
        })
      );
    };
  };

  if (global.document?.querySelector('[data-financeiro-app]')) {
    renderStandalone();
  }
}(globalThis));
