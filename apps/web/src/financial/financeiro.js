(function registerFinancialFramework(global) {
  const STORAGE_KEY = 'odontoflow-financeiro-framework-v1';

  const seed = [
    { id: 1, tipo: 'entrada', descricao: 'Consulta inicial', categoria: 'Atendimento', data_vencimento: '2026-04-28', valor: 280, status: 'recebido' },
    { id: 2, tipo: 'saida', descricao: 'Laboratório de prótese', categoria: 'Laboratório', data_vencimento: '2026-04-29', valor: 1200, status: 'previsto' },
    { id: 3, tipo: 'saida', descricao: 'Aluguel', categoria: 'Estrutura', data_vencimento: '2026-05-05', valor: 4800, status: 'previsto' }
  ];

  const read = () => {
    try {
      const raw = global.localStorage.getItem(STORAGE_KEY);
      if (!raw) return seed;
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : seed;
    } catch (error) {
      return seed;
    }
  };

  const write = (items) => global.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));

  const currency = (value) => Number(value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

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

    let launches = read();

    const paint = () => {
      const receitas = launches.filter((item) => item.tipo === 'entrada').reduce((acc, item) => acc + Number(item.valor || 0), 0);
      const despesas = launches.filter((item) => item.tipo === 'saida').reduce((acc, item) => acc + Number(item.valor || 0), 0);
      const saldo = receitas - despesas;

      kpiReceitas.innerHTML = `<p>Receitas</p><strong>${currency(receitas)}</strong>`;
      kpiDespesas.innerHTML = `<p>Despesas</p><strong>${currency(despesas)}</strong>`;
      kpiSaldo.innerHTML = `<p>Saldo</p><strong>${currency(saldo)}</strong>`;

      body.innerHTML = launches.map((item) => `
        <tr>
          <td>${item.tipo}</td>
          <td>${item.descricao}</td>
          <td>${item.categoria}</td>
          <td>${item.data_vencimento || '-'}</td>
          <td>${currency(item.valor)}</td>
          <td>${item.status || 'previsto'}</td>
        </tr>
      `).join('');

      const recurringRows = launches
        .filter((item) => item.tipo === 'saida')
        .slice(0, 6)
        .map((item) => `<span class="financeiro-chip">${item.descricao} • ${currency(item.valor)}</span>`)
        .join('');

      recurring.innerHTML = recurringRows || '<span class="financeiro-chip">Sem contas recorrentes</span>';
    };

    root.querySelector('[data-action="novo-lancamento"]').addEventListener('click', () => dialog.showModal());

    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const fd = new FormData(form);
      launches = [
        ...launches,
        {
          id: Date.now(),
          tipo: fd.get('tipo'),
          descricao: String(fd.get('descricao') || ''),
          categoria: String(fd.get('categoria') || ''),
          data_vencimento: String(fd.get('data_vencimento') || ''),
          valor: Number(fd.get('valor') || 0),
          status: fd.get('tipo') === 'entrada' ? 'recebido' : 'previsto'
        }
      ];
      write(launches);
      dialog.close();
      form.reset();
      paint();
    });

    paint();
  };

  const namespace = global.OdontoFlowFinancialComponents = global.OdontoFlowFinancialComponents || {};
  namespace.createFinancialLegacyFrame = () => ({ src = './apps/web/src/financial/financeiro.html' }) => (
    <section className="financial-page-section financial-legacy-frame">
      <iframe className="financial-legacy-frame__iframe" src={src} title="Framework Financeiro" loading="lazy" />
    </section>
  );

  if (global.document?.querySelector('[data-financeiro-app]')) {
    renderStandalone();
  }
}(globalThis));
