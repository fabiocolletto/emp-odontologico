const { useEffect, useState } = React;

const tabs = [
  { id: 'overview', label: 'Painel' },
  { id: 'patients', label: 'Pacientes' },
  { id: 'settings', label: 'Configurações' }
];

function App() {
  const [view, setView] = useState('loader');
  const [activeTab, setActiveTab] = useState('overview');

  const patients = [
    { id: 1, name: 'Ana Paula Souza', phone: '(11) 98877-6655', lastVisit: '12 Abr 2024' },
    { id: 2, name: 'Ricardo Albuquerque', phone: '(11) 97766-5544', lastVisit: '08 Abr 2024' },
    { id: 3, name: 'Juliana Ferreira', phone: '(11) 96655-4433', lastVisit: '15 Abr 2024' }
  ];

  useEffect(() => {
    const t = setTimeout(() => setView('landing'), 700);
    return () => clearTimeout(t);
  }, []);

  if (view === 'loader') {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-white space-y-4">
        <div className="w-10 h-10 border-[3px] border-sky-700 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300">Sincronizando Ecossistema</p>
      </div>
    );
  }

  if (view === 'landing') {
    return (
      <div className="h-screen flex flex-col items-center justify-between bg-[#F2F2F7] p-10 py-24 text-center">
        <div className="space-y-8">
          <div className="w-20 h-20 bg-sky-700 rounded-2xl flex items-center justify-center text-white shadow-2xl mx-auto text-3xl">🦷</div>
          <div className="space-y-3">
            <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 tracking-tighter leading-none italic">
              Odonto<span className="text-sky-700 font-bold not-italic">Flow</span>
            </h1>
            <p className="text-slate-400 text-lg md:text-2xl font-medium leading-snug tracking-tight italic">
              Design Consistente. <span className="text-slate-900 font-semibold not-italic">Gestão Ágil.</span>
            </p>
          </div>
        </div>
        <button
          onClick={() => setView('dashboard')}
          className="w-full max-w-sm py-5 bg-sky-700 text-white rounded-2xl font-bold text-xl shadow-xl shadow-blue-200 active:scale-95 transition-all hover:bg-sky-800"
        >
          Acessar Unidade
        </button>
      </div>
    );
  }

  const renderContent = () => {
    if (activeTab === 'overview') {
      return (
        <div className="space-y-6">
          <h2 className="text-3xl font-bold text-slate-900">Painel Diário</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-6 rounded-2xl border"><p className="text-xs text-slate-400 uppercase">Atendimentos</p><p className="text-3xl font-bold">12</p></div>
            <div className="bg-white p-6 rounded-2xl border"><p className="text-xs text-slate-400 uppercase">Faturamento</p><p className="text-3xl font-bold">R$ 8.4k</p></div>
            <div className="bg-white p-6 rounded-2xl border"><p className="text-xs text-slate-400 uppercase">Ocupação</p><p className="text-3xl font-bold">92%</p></div>
          </div>
        </div>
      );
    }

    if (activeTab === 'patients') {
      return (
        <div className="space-y-6">
          <h2 className="text-3xl font-bold text-slate-900">Base de Pacientes</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {patients.map((p) => (
              <div key={p.id} className="bg-white p-6 rounded-2xl border">
                <p className="font-bold text-slate-900">{p.name}</p>
                <p className="text-sm text-slate-500">{p.phone}</p>
                <p className="text-xs text-slate-400 mt-2">Última visita: {p.lastVisit}</p>
              </div>
            ))}
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <h2 className="text-3xl font-bold text-slate-900">Configurações</h2>
        <div className="bg-white p-6 rounded-2xl border">
          <p className="text-sm text-slate-500 mb-3">Procedimentos ativos</p>
          <ul className="list-disc pl-5 space-y-1 text-slate-800">
            <li>Limpeza Profilática</li>
            <li>Restauração em Resina</li>
            <li>Tratamento de Canal</li>
            <li>Avaliação Ortodôntica</li>
          </ul>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#EAEEF2]">
      <div className="flex">
        <aside className="hidden md:flex md:w-64 lg:w-72 bg-white border-r border-slate-200 min-h-screen sticky top-0 flex-col p-6 gap-6">
          <div className="text-2xl font-bold text-slate-900">Odonto<span className="text-sky-700">Flow</span></div>
          <nav className="flex flex-col gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`text-left px-4 py-3 rounded-xl font-bold transition-all ${activeTab === tab.id ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </aside>

        <main className="flex-1 p-6 md:p-10 pb-28 md:pb-10">
          {renderContent()}
        </main>
      </div>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-4 py-3 flex justify-between gap-2 z-50">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-2 rounded-lg text-xs font-bold ${activeTab === tab.id ? 'bg-sky-700 text-white' : 'bg-slate-100 text-slate-600'}`}
          >
            {tab.label}
          </button>
        ))}
      </nav>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
