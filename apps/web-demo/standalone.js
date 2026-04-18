const root = document.getElementById('root');

const state = {
  view: 'loader',
  tab: 'overview',
  patients: [
    { id: 1, name: 'Ana Paula Souza', phone: '(11) 98877-6655', lastVisit: '12 Abr 2024' },
    { id: 2, name: 'Ricardo Albuquerque', phone: '(11) 97766-5544', lastVisit: '08 Abr 2024' },
    { id: 3, name: 'Juliana Ferreira', phone: '(11) 96655-4433', lastVisit: '15 Abr 2024' }
  ],
  procedures: [
    'Limpeza Profilática',
    'Restauração em Resina',
    'Tratamento de Canal',
    'Avaliação Ortodôntica'
  ]
};

function render() {
  if (state.view === 'loader') {
    root.innerHTML = `
      <div class="h-screen flex flex-col items-center justify-center bg-white space-y-4">
        <div class="w-10 h-10 border-[3px] border-sky-700 border-t-transparent rounded-full animate-spin"></div>
        <p class="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300">Sincronizando Ecossistema</p>
      </div>
    `;
    return;
  }

  if (state.view === 'landing') {
    root.innerHTML = `
      <div class="h-screen flex flex-col items-center justify-between bg-[#F2F2F7] p-10 py-24 text-center">
        <div class="space-y-8">
          <div class="w-20 h-20 bg-sky-700 rounded-2xl flex items-center justify-center text-white shadow-2xl mx-auto text-3xl">🦷</div>
          <div class="space-y-3">
            <h1 class="text-5xl md:text-7xl font-extrabold text-slate-900 tracking-tighter leading-none italic">Odonto<span class="text-sky-700 font-bold not-italic">Flow</span></h1>
            <p class="text-slate-400 text-lg md:text-2xl font-medium leading-snug tracking-tight italic">Design Consistente. <span class="text-slate-900 font-semibold not-italic">Gestão Ágil.</span></p>
          </div>
        </div>
        <button id="open-dashboard" class="w-full max-w-sm py-5 bg-sky-700 text-white rounded-2xl font-bold text-xl shadow-xl shadow-blue-200 active:scale-95 transition-all hover:bg-sky-800">Acessar Unidade</button>
      </div>
    `;
    document.getElementById('open-dashboard').onclick = () => {
      state.view = 'dashboard';
      render();
    };
    return;
  }

  const tabs = {
    overview: `
      <div class="space-y-6">
        <h2 class="text-3xl font-bold text-slate-900">Painel Diário</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="bg-white p-6 rounded-2xl border"><p class="text-xs text-slate-400 uppercase">Atendimentos</p><p class="text-3xl font-bold">12</p></div>
          <div class="bg-white p-6 rounded-2xl border"><p class="text-xs text-slate-400 uppercase">Faturamento</p><p class="text-3xl font-bold">R$ 8.4k</p></div>
          <div class="bg-white p-6 rounded-2xl border"><p class="text-xs text-slate-400 uppercase">Ocupação</p><p class="text-3xl font-bold">92%</p></div>
        </div>
      </div>
    `,
    patients: `
      <div class="space-y-6">
        <h2 class="text-3xl font-bold text-slate-900">Base de Pacientes</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          ${state.patients.map((p) => `
            <div class="bg-white p-6 rounded-2xl border">
              <p class="font-bold text-slate-900">${p.name}</p>
              <p class="text-sm text-slate-500">${p.phone}</p>
              <p class="text-xs text-slate-400 mt-2">Última visita: ${p.lastVisit}</p>
            </div>
          `).join('')}
        </div>
      </div>
    `,
    settings: `
      <div class="space-y-6">
        <h2 class="text-3xl font-bold text-slate-900">Configurações</h2>
        <div class="bg-white p-6 rounded-2xl border">
          <p class="text-sm text-slate-500 mb-3">Procedimentos ativos</p>
          <ul class="list-disc pl-5 space-y-1 text-slate-800">
            ${state.procedures.map((p) => `<li>${p}</li>`).join('')}
          </ul>
        </div>
      </div>
    `
  };

  root.innerHTML = `
    <div class="min-h-screen bg-[#EAEEF2] p-6 md:p-10">
      <header class="mb-8 flex flex-wrap gap-3">
        <button data-tab="overview" class="tab-btn px-4 py-2 rounded-xl font-bold ${state.tab === 'overview' ? 'bg-slate-900 text-white' : 'bg-white text-slate-600'}">Painel</button>
        <button data-tab="patients" class="tab-btn px-4 py-2 rounded-xl font-bold ${state.tab === 'patients' ? 'bg-slate-900 text-white' : 'bg-white text-slate-600'}">Pacientes</button>
        <button data-tab="settings" class="tab-btn px-4 py-2 rounded-xl font-bold ${state.tab === 'settings' ? 'bg-slate-900 text-white' : 'bg-white text-slate-600'}">Configurações</button>
      </header>
      ${tabs[state.tab]}
    </div>
  `;

  document.querySelectorAll('.tab-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      state.tab = btn.dataset.tab;
      render();
    });
  });
}

render();
setTimeout(() => {
  state.view = 'landing';
  render();
}, 700);
