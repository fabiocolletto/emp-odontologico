const { useEffect, useState } = React;

const tabs = [
  { id: 'overview', label: 'Painel' },
  { id: 'patients', label: 'Pacientes' },
  { id: 'settings', label: 'Configurações' }
];


const CSV_PATH = './backend/supabase/sample-data';

const parseCsv = (csvText) => {
  const [headersLine, ...lines] = csvText.trim().split('\n');
  if (!headersLine) return [];
  const headers = headersLine.split(',').map((item) => item.trim());

  return lines
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const values = line.split(',').map((value) => value.trim());
      return headers.reduce((acc, key, index) => {
        acc[key] = values[index] ?? '';
        return acc;
      }, {});
    });
};

const toDate = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleDateString('pt-BR');
};

const toTime = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '--:--';
  return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
};

const fetchCsv = async (fileName) => {
  const response = await fetch(`${CSV_PATH}/${fileName}`);
  if (!response.ok) throw new Error(fileName);
  return response.text();
};

const loadClinicDataset = async () => {
  const [patientsCsv, proceduresCsv, appointmentsCsv] = await Promise.all([
    fetchCsv('patients.csv'),
    fetchCsv('procedures.csv'),
    fetchCsv('appointments.csv')
  ]);

  const patientsRaw = parseCsv(patientsCsv);
  const proceduresRaw = parseCsv(proceduresCsv);
  const appointmentsRaw = parseCsv(appointmentsCsv);

  const procedureMap = new Map(proceduresRaw.map((item) => [item.id, item.name]));
  const patients = patientsRaw.map((item) => ({
    id: item.id,
    name: item.full_name,
    phone: item.phone,
    email: item.email,
    birth: toDate(item.birth_date),
    plan: 'Particular',
    notes: item.notes,
    lastVisit: '-'
  }));

  const lastVisitMap = new Map();
  appointmentsRaw.forEach((item) => {
    if (item.status !== 'done') return;
    const prev = lastVisitMap.get(item.patient_id);
    if (!prev || new Date(item.starts_at) > new Date(prev)) {
      lastVisitMap.set(item.patient_id, item.starts_at);
    }
  });

  const appointments = appointmentsRaw.map((item) => {
    const patient = patients.find((p) => p.id === item.patient_id);
    return {
      id: item.id,
      name: patient?.name ?? 'Paciente não encontrado',
      time: toTime(item.starts_at),
      procedure: procedureMap.get(item.procedure_id) ?? 'Procedimento não encontrado'
    };
  });

  return {
    appointments,
    patients: patients.map((item) => ({
      ...item,
      lastVisit: toDate(lastVisitMap.get(item.id))
    }))
  };
};

const FALLBACK_APPOINTMENTS = [
  { id: 1, name: 'Ana Paula Souza', time: '09:00', procedure: 'Limpeza Profilática' },
  { id: 2, name: 'Ricardo Albuquerque', time: '10:30', procedure: 'Extração Siso' },
  { id: 3, name: 'Juliana Ferreira', time: '14:15', procedure: 'Avaliação Ortodôntica' }
];

const FALLBACK_PATIENTS = [
  {
    id: 1,
    name: 'Ana Paula Souza',
    phone: '(11) 98877-6655',
    lastVisit: '12 Abr 2024',
    birth: '15/05/1992',
    email: 'ana.souza@email.com',
    plan: 'Particular',
    notes: 'Paciente com histórico de sensibilidade em molares.'
  },
  {
    id: 2,
    name: 'Ricardo Albuquerque',
    phone: '(11) 97766-5544',
    lastVisit: '08 Abr 2024',
    birth: '22/10/1985',
    email: 'ricardo.albuquerque@email.com',
    plan: 'Convênio Odonto+',
    notes: 'Em acompanhamento de pós-extração.'
  },
  {
    id: 3,
    name: 'Juliana Ferreira',
    phone: '(11) 96655-4433',
    lastVisit: '15 Abr 2024',
    birth: '03/01/1998',
    email: 'juliana.ferreira@email.com',
    plan: 'Particular',
    notes: 'Avaliação ortodôntica solicitada.'
  }
];

const getInitials = (name) =>
  String(name || '')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((chunk) => chunk[0]?.toUpperCase() || '')
    .join('');

function App() {
  const [view, setView] = useState('loader');
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showPatientN2, setShowPatientN2] = useState(false);
  const [patients, setPatients] = useState(FALLBACK_PATIENTS);
  const [appointments, setAppointments] = useState(FALLBACK_APPOINTMENTS);
  const [usingFallbackData, setUsingFallbackData] = useState(true);

  const openPatientN2 = (patient) => {
    setSelectedPatient(patient);
    setShowPatientN2(true);
  };

  useEffect(() => {
    const t = setTimeout(() => setView('landing'), 700);

    let mounted = true;
    loadClinicDataset()
      .then((dataset) => {
        if (!mounted) return;
        setPatients(dataset.patients);
        setAppointments(dataset.appointments);
        setUsingFallbackData(false);
      })
      .catch(() => {
        if (!mounted) return;
        setUsingFallbackData(true);
      });

    return () => {
      mounted = false;
      clearTimeout(t);
    };
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
          className="btn btn--primary btn--lg landing-cta"
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
          <h2 className="page-title">Painel Diário</h2>
          {usingFallbackData && (
            <p className="text-xs bg-amber-50 border border-amber-200 text-amber-700 rounded-xl px-3 py-2">
              Dados de fallback ativos. Quando os arquivos em backend/supabase/sample-data estiverem disponíveis no servidor, os dados reais serão usados automaticamente.
            </p>
          )}
          <div className="data-grid">
            <div className="bg-white border data-card data-card--p"><p className="kpi-label">Atendimentos</p><p className="kpi-value">12</p></div>
            <div className="bg-white border data-card data-card--p"><p className="kpi-label">Faturamento</p><p className="kpi-value">R$ 8.4k</p></div>
            <div className="bg-white border data-card data-card--p"><p className="kpi-label">Ocupação</p><p className="kpi-value">92%</p></div>
          </div>

          <div className="bg-white rounded-2xl border p-5 space-y-3">
            <h3 className="text-sm font-black uppercase tracking-widest text-slate-500">Agenda de Hoje (N2 ao clicar)</h3>
            {appointments.map((item) => {
              const patient = patients.find((p) => p.name === item.name);
              return (
                <button
                  key={item.id}
                  onClick={() => openPatientN2(patient)}
                  className="list-button data-card data-card--m"
                >
                  <p className="text-sm text-slate-500">{item.time} · {item.procedure}</p>
                  <p className="font-bold text-slate-900">{item.name}</p>
                </button>
              );
            })}
          </div>
        </div>
      );
    }

    if (activeTab === 'patients') {
      const patientsWithVisit = patients.filter((p) => p.lastVisit && p.lastVisit !== '-').length;
      return (
        <div className="space-y-6">
          <h2 className="page-title">Base de Pacientes</h2>
          <p className="page-subtitle">Clique em um paciente para abrir a tela N2 com os dados completos.</p>
          <div className="summary-grid">
            <div className="summary-pill">
              <span className="summary-pill__label">Total cadastrado</span>
              <strong className="summary-pill__value">{patients.length}</strong>
            </div>
            <div className="summary-pill">
              <span className="summary-pill__label">Com última visita</span>
              <strong className="summary-pill__value">{patientsWithVisit}</strong>
            </div>
            <div className="summary-pill">
              <span className="summary-pill__label">Sem visita registrada</span>
              <strong className="summary-pill__value">{patients.length - patientsWithVisit}</strong>
            </div>
          </div>
          <div className="data-grid">
            {patients.map((p) => (
              <article key={p.id} className="data-card data-card--m patient-card">
                <button
                  onClick={() => openPatientN2(p)}
                  className="btn btn--icon patient-card__open"
                  aria-label={`Abrir prontuário de ${p.name}`}
                  title="Abrir prontuário N2"
                >
                  ↗
                </button>
                <div className="patient-card__header">
                  <div className="patient-avatar">{getInitials(p.name)}</div>
                  <div>
                    <p className="font-bold text-slate-900">{p.name}</p>
                  </div>
                </div>

                <div className="patient-card__grid">
                  <div className="patient-meta">
                    <p className="patient-meta__label">📞 Telefone</p>
                    <p className="patient-meta__value">{p.phone}</p>
                  </div>
                  <div className="patient-meta">
                    <p className="patient-meta__label">🗓️ Última visita</p>
                    <p className="patient-meta__value">{p.lastVisit}</p>
                  </div>
                  <div className="patient-meta">
                    <p className="patient-meta__label">🎂 Nascimento</p>
                    <p className="patient-meta__value">{p.birth}</p>
                  </div>
                  <div className="patient-meta">
                    <p className="patient-meta__label">🧾 Plano</p>
                    <p className="patient-meta__value">{p.plan}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <h2 className="page-title">Configurações</h2>
        <div className="bg-white border data-card data-card--g">
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
    <div className="app-shell">
      <div className="app-frame">
        <aside className="app-sidebar">
          <div className="app-brand">Odonto<span>Flow</span></div>
          <nav className="app-nav">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`btn btn--nav ${activeTab === tab.id ? 'is-active' : ''}`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </aside>

        <main className="app-content">
          {renderContent()}
        </main>
      </div>

      <nav className="mobile-nav md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-4 py-3 flex justify-between gap-2 z-50">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`btn btn--mobile-tab ${activeTab === tab.id ? 'is-active' : ''}`}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {showPatientN2 && selectedPatient && (
        <div className="modal-wrap">
          <div className="modal-backdrop" onClick={() => setShowPatientN2(false)}></div>
          <div className="modal-card">
            <div className="modal-header">
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-slate-500">Tela N2 · Prontuário</p>
                <h3 className="text-xl font-bold text-slate-900">{selectedPatient.name}</h3>
              </div>
              <button onClick={() => setShowPatientN2(false)} className="btn btn--ghost">Fechar</button>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="bg-slate-50 rounded-xl p-4"><p className="text-slate-400">Telefone</p><p className="font-bold text-slate-900">{selectedPatient.phone}</p></div>
              <div className="bg-slate-50 rounded-xl p-4"><p className="text-slate-400">E-mail</p><p className="font-bold text-slate-900">{selectedPatient.email}</p></div>
              <div className="bg-slate-50 rounded-xl p-4"><p className="text-slate-400">Nascimento</p><p className="font-bold text-slate-900">{selectedPatient.birth}</p></div>
              <div className="bg-slate-50 rounded-xl p-4"><p className="text-slate-400">Plano</p><p className="font-bold text-slate-900">{selectedPatient.plan}</p></div>
              <div className="md:col-span-2 bg-slate-50 rounded-xl p-4">
                <p className="text-slate-400">Última visita</p>
                <p className="font-bold text-slate-900 mb-3">{selectedPatient.lastVisit}</p>
                <p className="text-slate-400">Observações clínicas</p>
                <p className="font-medium text-slate-800">{selectedPatient.notes}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
