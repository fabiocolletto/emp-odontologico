(function registerFinancialFramework(global) {
  const STORAGE_KEY = 'odontoflow-financeiro-framework-v3';

  const model = {
    launches: [
      { id: 101, tipo: 'entrada', descricao: 'Consulta clínica inicial', categoria: 'Atendimento', data_vencimento: '2026-04-03', valor: 260, status: 'recebido' },
      { id: 102, tipo: 'entrada', descricao: 'Clareamento dental', categoria: 'Estética', data_vencimento: '2026-04-05', valor: 1400, status: 'recebido' },
      { id: 103, tipo: 'entrada', descricao: 'Repasse convênio abril', categoria: 'Convênio', data_vencimento: '2026-04-20', valor: 4200, status: 'previsto' },
      { id: 201, tipo: 'saida', descricao: 'Aluguel da clínica', categoria: 'Estrutura', data_vencimento: '2026-04-05', valor: 5300, status: 'pago' },
      { id: 202, tipo: 'saida', descricao: 'Laboratório de prótese', categoria: 'Laboratório', data_vencimento: '2026-04-12', valor: 1980, status: 'previsto' },
      { id: 203, tipo: 'saida', descricao: 'Materiais clínicos', categoria: 'Insumos', data_vencimento: '2026-04-09', valor: 1320, status: 'pago' }
    ],
    recurring: [
      { id: 1, descricao: 'Aluguel da clínica', valor: 5300, periodicidade: 'mensal', status: 'pago' },
      { id: 2, descricao: 'Folha de pagamento', valor: 12890, periodicidade: 'mensal', status: 'pendente' }
    ],
    categories: [
      { id: 1, tipo: 'entrada', nome: 'Atendimento' },
      { id: 2, tipo: 'entrada', nome: 'Convênio' },
      { id: 3, tipo: 'saida', nome: 'Estrutura' },
      { id: 4, tipo: 'saida', nome: 'Laboratório' }
    ],
    accounts: [
      { id: 1, nome: 'Conta Principal', banco: 'Odonto Bank', tipo: 'corrente', saldo_inicial: 15000 },
      { id: 2, nome: 'Conta Operacional', banco: 'Banco Sul', tipo: 'corrente', saldo_inicial: 8200 },
      { id: 3, nome: 'Caixa interno', banco: 'Clínica', tipo: 'caixa', saldo_inicial: 3500 }
    ]
  };

  const deepClone = (value) => JSON.parse(JSON.stringify(value));
  const nextId = () => Date.now() + Math.floor(Math.random() * 1000);

  const read = () => {
    try {
      const raw = global.localStorage.getItem(STORAGE_KEY);
      if (!raw) return deepClone(model);
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed?.launches) || !Array.isArray(parsed?.recurring) || !Array.isArray(parsed?.categories) || !Array.isArray(parsed?.accounts)) {
        return deepClone(model);
      }
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
    return (y && m && d) ? `${d}/${m}/${y}` : value;
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

  const buildMonthSeries = (launches = []) => {
    const map = launches.reduce((acc, item) => {
      const raw = String(item.data_vencimento || '').slice(0, 7);
      if (!/^\d{4}-\d{2}$/.test(raw)) return acc;
      const entry = acc[raw] || { receitas: 0, despesas: 0 };
      if (item.tipo === 'entrada') entry.receitas += Number(item.valor || 0);
      if (item.tipo === 'saida') entry.despesas += Number(item.valor || 0);
      acc[raw] = entry;
      return acc;
    }, {});

    const labels = Object.keys(map).sort((a, b) => a.localeCompare(b));
    const receitas = labels.map((key) => map[key].receitas);
    const despesas = labels.map((key) => map[key].despesas);
    const saldo = labels.map((key, index) => receitas[index] - despesas[index]);

    return {
      labels: labels.map((item) => item.split('-').reverse().join('/')),
      receitas,
      despesas,
      saldo
    };
  };

  const formatPercent = (value) => `${(Number(value || 0) * 100).toFixed(1)}%`;

  const trendText = (series = []) => {
    if (series.length < 2) return 'Sem histórico suficiente';
    const current = Number(series[series.length - 1] || 0);
    const previous = Number(series[series.length - 2] || 0);
    if (!previous && !current) return 'Sem variação entre períodos';
    const variation = previous === 0 ? 1 : ((current - previous) / Math.abs(previous));
    const signal = variation >= 0 ? '▲' : '▼';
    return `${signal} ${(Math.abs(variation) * 100).toFixed(1)}% vs período anterior`;
  };

  const renderKpiCard = (target, data, activeView = 'summary') => {
    target.innerHTML = `
      <div class="financeiro-kpi-content" data-kpi-key="${escapeHtml(data.key)}">
        <div class="financeiro-kpi-main">
          <p class="financeiro-kpi-title">${escapeHtml(data.title)}</p>
          <strong class="financeiro-kpi-value">${escapeHtml(data.value)}</strong>
          <small>${escapeHtml(data.caption)}</small>
          <p class="financeiro-kpi-trend">${escapeHtml(data.trend)}</p>
          <div class="html-widget-tabs" role="tablist" aria-label="Abas do KPI ${escapeHtml(data.title)}">
            <button type="button" class="html-widget-tab ${activeView === 'summary' ? 'is-active' : ''}" data-kpi-tab="summary" data-kpi-key="${escapeHtml(data.key)}">Resumo</button>
            <button type="button" class="html-widget-tab ${activeView === 'time' ? 'is-active' : ''}" data-kpi-tab="time" data-kpi-key="${escapeHtml(data.key)}">Tempo</button>
            <button type="button" class="html-widget-tab ${activeView === 'data' ? 'is-active' : ''}" data-kpi-tab="data" data-kpi-key="${escapeHtml(data.key)}">Dados</button>
          </div>
          <p class="html-widget-swipe-hint">Deslize para alternar as abas do KPI.</p>
        </div>
        <div class="financeiro-kpi-panels">
          <section class="html-widget-view ${activeView === 'summary' ? 'is-active' : ''}" data-kpi-view="summary" data-kpi-key="${escapeHtml(data.key)}">
            <div class="financeiro-kpi-chart-wrap">
              <canvas class="financeiro-kpi-chart" data-kpi-chart="${escapeHtml(data.key)}-donut" aria-label="Resumo consolidado ${escapeHtml(data.title)}"></canvas>
            </div>
            <p class="financeiro-kpi-caption">Consolidado: ${escapeHtml(data.consolidatedLabel)} (${formatPercent(data.consolidatedRatio)})</p>
          </section>
          <section class="html-widget-view ${activeView === 'time' ? 'is-active' : ''}" data-kpi-view="time" data-kpi-key="${escapeHtml(data.key)}">
            <div class="financeiro-kpi-chart-wrap">
              <canvas class="financeiro-kpi-chart" data-kpi-chart="${escapeHtml(data.key)}-time" aria-label="Distribuição temporal ${escapeHtml(data.title)}"></canvas>
            </div>
          </section>
          <section class="html-widget-view ${activeView === 'data' ? 'is-active' : ''}" data-kpi-view="data" data-kpi-key="${escapeHtml(data.key)}">
            <div class="financeiro-kpi-data-wrap">
              <table class="financeiro-kpi-data-table">
                <thead><tr><th>Descrição</th><th>Status</th><th>Valor</th></tr></thead>
                <tbody>
                  ${data.rows.map((row) => `<tr><td>${escapeHtml(row.descricao)}</td><td>${escapeHtml(row.status)}</td><td>${escapeHtml(currency(row.valor))}</td></tr>`).join('') || '<tr><td colspan="3">Sem dados para este KPI.</td></tr>'}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </div>
    `;
  };

  const upsertChart = (charts, key, canvas, config) => {
    if (!canvas || !global.Chart) return;
    if (charts[key]) charts[key].destroy();
    charts[key] = new global.Chart(canvas, config);
  };

  const upsertById = (rows, payload) => {
    const id = Number(payload.id || 0);
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
      const clickedOutside = (
        event.clientX < box.left
        || event.clientX > box.right
        || event.clientY < box.top
        || event.clientY > box.bottom
      );
      if (clickedOutside) {
        dialog.close('cancel');
      }
    });
  };

  const renderStandalone = () => {
    const root = global.document.querySelector('[data-financeiro-app]');
    if (!root) return;

    const grids = {
      launches: root.querySelector('[data-grid="lancamentos"]'),
      recurring: root.querySelector('[data-grid="recorrencias"]'),
      categories: root.querySelector('[data-grid="categorias"]'),
      accounts: root.querySelector('[data-grid="contas"]')
    };

    const forms = {
      launch: root.ownerDocument.querySelector('[data-form="lancamento"]'),
      recurring: root.ownerDocument.querySelector('[data-form="recorrencia"]'),
      category: root.ownerDocument.querySelector('[data-form="categoria"]'),
      account: root.ownerDocument.querySelector('[data-form="conta"]')
    };

    const dialogs = {
      launch: root.ownerDocument.querySelector('[data-dialog="lancamento"]'),
      recurring: root.ownerDocument.querySelector('[data-dialog="recorrencia"]'),
      category: root.ownerDocument.querySelector('[data-dialog="categoria"]'),
      account: root.ownerDocument.querySelector('[data-dialog="conta"]')
    };

    const titles = {
      launch: root.ownerDocument.querySelector('[data-form-title="lancamento"]'),
      recurring: root.ownerDocument.querySelector('[data-form-title="recorrencia"]'),
      category: root.ownerDocument.querySelector('[data-form-title="categoria"]'),
      account: root.ownerDocument.querySelector('[data-form-title="conta"]')
    };

    Object.values(dialogs).forEach((dialog) => wireDialogCloseOnBackdrop(dialog));

    const kpiReceitas = root.querySelector('[data-kpi="receitas"]');
    const kpiDespesas = root.querySelector('[data-kpi="despesas"]');
    const kpiSaldo = root.querySelector('[data-kpi="saldo"]');
    const sampleInfo = root.querySelector('[data-sample-info]');

    const charts = {};
    const kpiViewState = { receitas: 'summary', despesas: 'summary', saldo: 'summary' };
    const kpiTabsOrder = ['summary', 'time', 'data'];
    const touchState = { startX: 0, key: '' };
    let state = read();

    const changeKpiView = (kpiKey, nextView) => {
      if (!kpiViewState[kpiKey]) return;
      kpiViewState[kpiKey] = nextView;
      paint();
    };

    const cycleKpiView = (kpiKey, direction = 1) => {
      const currentIndex = kpiTabsOrder.indexOf(kpiViewState[kpiKey] || 'summary');
      const nextIndex = (currentIndex + direction + kpiTabsOrder.length) % kpiTabsOrder.length;
      changeKpiView(kpiKey, kpiTabsOrder[nextIndex]);
    };

    const openDialog = (key, payload = {}, title = '') => {
      fillForm(forms[key], payload);
      if (title && titles[key]) titles[key].textContent = title;
      dialogs[key].showModal();
    };

    const paint = () => {
      const launches = [...state.launches].sort((a, b) => String(b.data_vencimento || '').localeCompare(String(a.data_vencimento || '')));
      const receitas = launches.filter((item) => item.tipo === 'entrada').reduce((acc, item) => acc + Number(item.valor || 0), 0);
      const despesas = launches.filter((item) => item.tipo === 'saida').reduce((acc, item) => acc + Number(item.valor || 0), 0);
      const saldo = receitas - despesas;

      const entries = launches.filter((item) => item.tipo === 'entrada');
      const outflows = launches.filter((item) => item.tipo === 'saida');
      const receitasConsolidadas = entries
        .filter((item) => ['recebido', 'pago'].includes(item.status))
        .reduce((acc, item) => acc + Number(item.valor || 0), 0);
      const despesasConsolidadas = outflows
        .filter((item) => item.status === 'pago')
        .reduce((acc, item) => acc + Number(item.valor || 0), 0);
      const timeline = buildMonthSeries(launches);

      const kpiConfigs = {
        receitas: {
          key: 'receitas',
          title: 'Receitas',
          value: currency(receitas),
          caption: `${entries.length} lançamentos`,
          trend: trendText(timeline.receitas),
          consolidatedRatio: receitas > 0 ? receitasConsolidadas / receitas : 0,
          consolidatedLabel: `${currency(receitasConsolidadas)} consolidado`,
          rows: entries.slice(0, 8)
        },
        despesas: {
          key: 'despesas',
          title: 'Despesas',
          value: currency(despesas),
          caption: `${outflows.length} lançamentos`,
          trend: trendText(timeline.despesas),
          consolidatedRatio: despesas > 0 ? despesasConsolidadas / despesas : 0,
          consolidatedLabel: `${currency(despesasConsolidadas)} pago`,
          rows: outflows.slice(0, 8)
        },
        saldo: {
          key: 'saldo',
          title: 'Saldo',
          value: currency(saldo),
          caption: saldo >= 0 ? 'Operação saudável' : 'Atenção ao caixa',
          trend: trendText(timeline.saldo),
          consolidatedRatio: despesas > 0 ? Math.max(Math.min(receitasConsolidadas / despesas, 1), 0) : 1,
          consolidatedLabel: `${currency(receitasConsolidadas - despesasConsolidadas)} consolidado`,
          rows: launches.slice(0, 8)
        }
      };

      renderKpiCard(kpiReceitas, kpiConfigs.receitas, kpiViewState.receitas);
      renderKpiCard(kpiDespesas, kpiConfigs.despesas, kpiViewState.despesas);
      renderKpiCard(kpiSaldo, kpiConfigs.saldo, kpiViewState.saldo);

      const baseOptions = {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: { display: true, position: 'top' },
          title: { display: true }
        },
        scales: {
          x: { grid: { display: true }, title: { display: true, text: 'Competência (MM/AAAA)' } },
          y: { grid: { display: true }, title: { display: true, text: 'Valor (R$)' } }
        }
      };

      upsertChart(charts, 'receitas-donut', root.querySelector('[data-kpi-chart="receitas-donut"]'), {
        type: 'doughnut',
        data: {
          labels: ['Consolidado', 'Em aberto'],
          datasets: [{ data: [receitasConsolidadas, Math.max(receitas - receitasConsolidadas, 0)], backgroundColor: ['#16a34a', '#e2e8f0'] }]
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' }, title: { display: true, text: 'Consolidação de receitas' } } }
      });

      upsertChart(charts, 'despesas-donut', root.querySelector('[data-kpi-chart="despesas-donut"]'), {
        type: 'doughnut',
        data: {
          labels: ['Pago', 'Pendente'],
          datasets: [{ data: [despesasConsolidadas, Math.max(despesas - despesasConsolidadas, 0)], backgroundColor: ['#dc2626', '#fde68a'] }]
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' }, title: { display: true, text: 'Consolidação de despesas' } } }
      });

      upsertChart(charts, 'saldo-donut', root.querySelector('[data-kpi-chart="saldo-donut"]'), {
        type: 'doughnut',
        data: {
          labels: ['Cobertura', 'Gap'],
          datasets: [{ data: [Math.max(receitasConsolidadas, 0), Math.max(despesasConsolidadas - receitasConsolidadas, 0)], backgroundColor: ['#2563eb', '#fecaca'] }]
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' }, title: { display: true, text: 'Cobertura consolidada' } } }
      });

      upsertChart(charts, 'receitas-time', root.querySelector('[data-kpi-chart="receitas-time"]'), {
        type: 'bar',
        data: { labels: timeline.labels, datasets: [{ label: 'Receitas', data: timeline.receitas, backgroundColor: 'rgba(22, 163, 74, 0.55)', borderColor: '#166534', borderWidth: 1 }] },
        options: { ...baseOptions, plugins: { ...baseOptions.plugins, title: { display: true, text: 'Distribuição das receitas no tempo' } } }
      });

      upsertChart(charts, 'despesas-time', root.querySelector('[data-kpi-chart="despesas-time"]'), {
        type: 'line',
        data: { labels: timeline.labels, datasets: [{ label: 'Despesas', data: timeline.despesas, borderColor: '#dc2626', backgroundColor: 'rgba(220, 38, 38, 0.18)', fill: true, tension: 0.25 }] },
        options: { ...baseOptions, plugins: { ...baseOptions.plugins, title: { display: true, text: 'Distribuição das despesas no tempo' } } }
      });

      upsertChart(charts, 'saldo-time', root.querySelector('[data-kpi-chart="saldo-time"]'), {
        type: 'line',
        data: { labels: timeline.labels, datasets: [{ label: 'Saldo', data: timeline.saldo, borderColor: '#2563eb', backgroundColor: 'rgba(37, 99, 235, 0.20)', fill: true, tension: 0.2 }] },
        options: { ...baseOptions, plugins: { ...baseOptions.plugins, title: { display: true, text: 'Distribuição do saldo no tempo' } } }
      });

      grids.launches.innerHTML = launches.map((item) => `
        <tr>
          <td><span class="financeiro-pill ${item.tipo === 'entrada' ? 'is-in' : 'is-out'}">${escapeHtml(item.tipo)}</span></td>
          <td>${escapeHtml(item.descricao)}</td>
          <td>${escapeHtml(item.categoria)}</td>
          <td>${datePtBr(item.data_vencimento)}</td>
          <td>${currency(item.valor)}</td>
          <td><span class="financeiro-pill ${statusClass(item.status)}">${escapeHtml(item.status)}</span></td>
          <td><button class="financeiro-link-btn" data-edit="launch" data-id="${item.id}">Editar</button></td>
        </tr>
      `).join('');

      grids.recurring.innerHTML = state.recurring.map((item) => `
        <tr>
          <td>${escapeHtml(item.descricao)}</td>
          <td>${escapeHtml(item.periodicidade)}</td>
          <td>${currency(item.valor)}</td>
          <td><span class="financeiro-pill ${statusClass(item.status)}">${escapeHtml(item.status)}</span></td>
          <td><button class="financeiro-link-btn" data-edit="recurring" data-id="${item.id}">Editar</button></td>
        </tr>
      `).join('');

      grids.categories.innerHTML = state.categories.map((item) => `
        <tr>
          <td><span class="financeiro-pill ${item.tipo === 'entrada' ? 'is-in' : 'is-out'}">${escapeHtml(item.tipo)}</span></td>
          <td>${escapeHtml(item.nome)}</td>
          <td><button class="financeiro-link-btn" data-edit="category" data-id="${item.id}">Editar</button></td>
        </tr>
      `).join('');

      grids.accounts.innerHTML = state.accounts.map((item) => `
        <tr>
          <td>${escapeHtml(item.nome)}</td>
          <td>${escapeHtml(item.banco)}</td>
          <td>${escapeHtml(item.tipo)}</td>
          <td>${currency(item.saldo_inicial)}</td>
          <td><button class="financeiro-link-btn" data-edit="account" data-id="${item.id}">Editar</button></td>
        </tr>
      `).join('');

      sampleInfo.textContent = `Modelo: ${state.launches.length} lançamentos, ${state.recurring.length} recorrências, ${state.categories.length} categorias e ${state.accounts.length} contas.`;
    };

    root.querySelector('[data-action="novo-lancamento"]').addEventListener('click', () => openDialog('launch', { tipo: 'entrada', status: 'previsto' }, 'Novo lançamento'));
    root.querySelector('[data-action="nova-recorrencia"]').addEventListener('click', () => openDialog('recurring', { periodicidade: 'mensal', status: 'pendente' }, 'Nova recorrência'));
    root.querySelector('[data-action="nova-categoria"]').addEventListener('click', () => openDialog('category', { tipo: 'saida' }, 'Nova categoria'));
    root.querySelector('[data-action="nova-conta"]').addEventListener('click', () => openDialog('account', { tipo: 'corrente' }, 'Nova conta financeira'));

    root.querySelector('[data-action="reset-model"]').addEventListener('click', () => {
      state = deepClone(model);
      write(state);
      paint();
    });

    root.addEventListener('click', (event) => {
      const tabButton = event.target.closest('[data-kpi-tab]');
      if (tabButton) {
        changeKpiView(tabButton.dataset.kpiKey, tabButton.dataset.kpiTab);
        return;
      }

      const button = event.target.closest('[data-edit]');
      if (!button) return;
      const id = Number(button.dataset.id || 0);
      const type = button.dataset.edit;

      if (type === 'launch') {
        const launch = state.launches.find((item) => item.id === id);
        if (launch) openDialog('launch', launch, 'Editar lançamento');
      }
      if (type === 'recurring') {
        const recurring = state.recurring.find((item) => item.id === id);
        if (recurring) openDialog('recurring', recurring, 'Editar recorrência');
      }
      if (type === 'category') {
        const category = state.categories.find((item) => item.id === id);
        if (category) openDialog('category', category, 'Editar categoria');
      }
      if (type === 'account') {
        const account = state.accounts.find((item) => item.id === id);
        if (account) openDialog('account', account, 'Editar conta financeira');
      }
    });

    root.addEventListener('touchstart', (event) => {
      const kpiContainer = event.target.closest('[data-kpi-key]');
      if (!kpiContainer) return;
      touchState.startX = event.touches[0].clientX;
      touchState.key = kpiContainer.dataset.kpiKey;
    }, { passive: true });

    root.addEventListener('touchend', (event) => {
      if (!touchState.key) return;
      const endX = event.changedTouches[0].clientX;
      const delta = endX - touchState.startX;
      if (Math.abs(delta) > 36) {
        cycleKpiView(touchState.key, delta < 0 ? 1 : -1);
      }
      touchState.key = '';
    }, { passive: true });

    forms.launch.addEventListener('submit', (event) => {
      event.preventDefault();
      if (event.submitter?.value === 'cancel') {
        dialogs.launch.close('cancel');
        return;
      }
      const fd = new FormData(forms.launch);
      state.launches = upsertById(state.launches, {
        id: Number(fd.get('id') || 0),
        tipo: String(fd.get('tipo') || 'entrada'),
        descricao: String(fd.get('descricao') || ''),
        categoria: String(fd.get('categoria') || ''),
        data_vencimento: String(fd.get('data_vencimento') || ''),
        valor: Number(fd.get('valor') || 0),
        status: String(fd.get('status') || 'previsto')
      });
      write(state);
      dialogs.launch.close();
      paint();
    });

    forms.recurring.addEventListener('submit', (event) => {
      event.preventDefault();
      if (event.submitter?.value === 'cancel') {
        dialogs.recurring.close('cancel');
        return;
      }
      const fd = new FormData(forms.recurring);
      state.recurring = upsertById(state.recurring, {
        id: Number(fd.get('id') || 0),
        descricao: String(fd.get('descricao') || ''),
        periodicidade: String(fd.get('periodicidade') || 'mensal'),
        valor: Number(fd.get('valor') || 0),
        status: String(fd.get('status') || 'pendente')
      });
      write(state);
      dialogs.recurring.close();
      paint();
    });

    forms.category.addEventListener('submit', (event) => {
      event.preventDefault();
      if (event.submitter?.value === 'cancel') {
        dialogs.category.close('cancel');
        return;
      }
      const fd = new FormData(forms.category);
      state.categories = upsertById(state.categories, {
        id: Number(fd.get('id') || 0),
        tipo: String(fd.get('tipo') || 'saida'),
        nome: String(fd.get('nome') || '')
      });
      write(state);
      dialogs.category.close();
      paint();
    });

    forms.account.addEventListener('submit', (event) => {
      event.preventDefault();
      if (event.submitter?.value === 'cancel') {
        dialogs.account.close('cancel');
        return;
      }
      const fd = new FormData(forms.account);
      state.accounts = upsertById(state.accounts, {
        id: Number(fd.get('id') || 0),
        nome: String(fd.get('nome') || ''),
        banco: String(fd.get('banco') || ''),
        tipo: String(fd.get('tipo') || 'corrente'),
        saldo_inicial: Number(fd.get('saldo_inicial') || 0)
      });
      write(state);
      dialogs.account.close();
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
