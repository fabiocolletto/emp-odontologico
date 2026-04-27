const { useMemo, useState } = React;

const NAV_TABS = [
  { id: 'patients', label: 'Pacientes' },
  { id: 'clinics', label: 'Clínicas' }
];

const PATIENTS = [
  { id: 'P-001', name: 'Ana Souza', clinic: 'Clínica Sorriso Central', phone: '(11) 99876-4501', status: 'Ativo', nextVisit: '2026-05-03' },
  { id: 'P-002', name: 'Carlos Lima', clinic: 'Centro Odonto Norte', phone: '(11) 99234-1001', status: 'Em retorno', nextVisit: '2026-05-01' },
  { id: 'P-003', name: 'Fernanda Rocha', clinic: 'Clínica Sorriso Central', phone: '(11) 98765-9000', status: 'Ativo', nextVisit: '2026-05-08' },
  { id: 'P-004', name: 'Mateus Prado', clinic: 'Odonto Vida Leste', phone: '(11) 97654-3344', status: 'Inativo', nextVisit: '—' }
];

const CLINICS = [
  { id: 'C-001', name: 'Clínica Sorriso Central', city: 'São Paulo', chairs: 8, team: 22, owner: 'Dra. Marina Alves', status: 'Operando' },
  { id: 'C-002', name: 'Centro Odonto Norte', city: 'Guarulhos', chairs: 5, team: 14, owner: 'Dr. Renato Mello', status: 'Operando' },
  { id: 'C-003', name: 'Odonto Vida Leste', city: 'São Paulo', chairs: 3, team: 9, owner: 'Dra. Bianca Freire', status: 'Atenção' }
];

const PageSection = ({ eyebrow, title, description, children }) => (
  <section className="page-section">
    <header className="page-section__header">
      <p className="section-eyebrow">{eyebrow}</p>
      <h1>{title}</h1>
      <p className="section-description">{description}</p>
    </header>
    {children}
  </section>
);

const SectionColumns = ({ children }) => <div className="section-columns">{children}</div>;
const DataColumn = ({ children }) => <div className="data-column">{children}</div>;

const WidgetCard = ({ title, subtitle, rightContent, children }) => (
  <article className="widget-card">
    <div className="widget-card__header">
      <div>
        <h2>{title}</h2>
        {subtitle ? <p className="widget-subtitle">{subtitle}</p> : null}
      </div>
      {rightContent ? <div>{rightContent}</div> : null}
    </div>
    {children}
  </article>
);

const SummaryWidget = ({ label, value, tone = 'brand' }) => (
  <article className={`summary-widget summary-widget--${tone}`}>
    <p>{label}</p>
    <strong>{value}</strong>
  </article>
);

const DataTable = ({ columns, rows }) => (
  <div className="table-wrap" role="region" aria-label="Tabela de gestão">
    <table>
      <thead>
        <tr>{columns.map((col) => <th key={col}>{col}</th>)}</tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.key}>
            {row.cells.map((cell, index) => <td key={`${row.key}-${index}`}>{cell}</td>)}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const FilterWidget = ({ search, onSearch, statusFilter, onStatusFilter, options }) => (
  <WidgetCard title="Filtros" subtitle="Busca rápida e status">
    <div className="filters-grid">
      <label>
        Buscar
        <input
          type="search"
          value={search}
          onChange={(event) => onSearch(event.target.value)}
          placeholder="Nome, unidade ou contato"
        />
      </label>
      <label>
        Status
        <select value={statusFilter} onChange={(event) => onStatusFilter(event.target.value)}>
          {options.map((option) => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
      </label>
    </div>
  </WidgetCard>
);

const PatientsScreen = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('Todos');

  const filtered = useMemo(() => PATIENTS.filter((patient) => {
    const text = `${patient.name} ${patient.clinic} ${patient.phone}`.toLowerCase();
    const matchesSearch = text.includes(search.trim().toLowerCase());
    const matchesStatus = statusFilter === 'Todos' || patient.status === statusFilter;
    return matchesSearch && matchesStatus;
  }), [search, statusFilter]);

  return (
    <PageSection
      eyebrow="Gestão"
      title="Pacientes"
      description="Controle centralizado de cadastro, vínculo com clínica e próximos atendimentos."
    >
      <SectionColumns>
        <DataColumn>
          <div className="summary-grid">
            <SummaryWidget label="Pacientes ativos" value={PATIENTS.filter((p) => p.status === 'Ativo').length} />
            <SummaryWidget label="Em retorno" value={PATIENTS.filter((p) => p.status === 'Em retorno').length} tone="info" />
            <SummaryWidget label="Sem próxima visita" value={PATIENTS.filter((p) => p.nextVisit === '—').length} tone="warning" />
          </div>
          <WidgetCard title="Lista de pacientes" subtitle={`${filtered.length} registro(s) encontrado(s)`}>
            <DataTable
              columns={['ID', 'Paciente', 'Clínica', 'Telefone', 'Status', 'Próxima visita']}
              rows={filtered.map((patient) => ({
                key: patient.id,
                cells: [patient.id, patient.name, patient.clinic, patient.phone, patient.status, patient.nextVisit]
              }))}
            />
          </WidgetCard>
        </DataColumn>

        <DataColumn>
          <FilterWidget
            search={search}
            onSearch={setSearch}
            statusFilter={statusFilter}
            onStatusFilter={setStatusFilter}
            options={['Todos', 'Ativo', 'Em retorno', 'Inativo']}
          />
          <WidgetCard title="Ações recomendadas" subtitle="Rotina operacional para time clínico">
            <ul className="list-widget">
              <li>Confirmar retornos com vencimento em até 7 dias.</li>
              <li>Validar cadastros sem próxima visita definida.</li>
              <li>Consolidar pacientes por unidade para campanhas locais.</li>
            </ul>
          </WidgetCard>
        </DataColumn>
      </SectionColumns>
    </PageSection>
  );
};

const ClinicsScreen = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('Todos');

  const filtered = useMemo(() => CLINICS.filter((clinic) => {
    const text = `${clinic.name} ${clinic.city} ${clinic.owner}`.toLowerCase();
    const matchesSearch = text.includes(search.trim().toLowerCase());
    const matchesStatus = statusFilter === 'Todos' || clinic.status === statusFilter;
    return matchesSearch && matchesStatus;
  }), [search, statusFilter]);

  return (
    <PageSection
      eyebrow="Gestão"
      title="Clínicas"
      description="Visão operacional de unidades, capacidade de atendimento e responsabilidade de gestão."
    >
      <SectionColumns>
        <DataColumn>
          <div className="summary-grid">
            <SummaryWidget label="Unidades totais" value={CLINICS.length} />
            <SummaryWidget label="Cadeiras ativas" value={CLINICS.reduce((sum, clinic) => sum + clinic.chairs, 0)} tone="info" />
            <SummaryWidget label="Unidades em atenção" value={CLINICS.filter((c) => c.status === 'Atenção').length} tone="warning" />
          </div>
          <WidgetCard title="Lista de clínicas" subtitle={`${filtered.length} registro(s) encontrado(s)`}>
            <DataTable
              columns={['ID', 'Unidade', 'Cidade', 'Responsável', 'Cadeiras', 'Time', 'Status']}
              rows={filtered.map((clinic) => ({
                key: clinic.id,
                cells: [clinic.id, clinic.name, clinic.city, clinic.owner, clinic.chairs, clinic.team, clinic.status]
              }))}
            />
          </WidgetCard>
        </DataColumn>

        <DataColumn>
          <FilterWidget
            search={search}
            onSearch={setSearch}
            statusFilter={statusFilter}
            onStatusFilter={setStatusFilter}
            options={['Todos', 'Operando', 'Atenção']}
          />
          <WidgetCard title="Checklist da gestão" subtitle="Processos mínimos para estabilidade da operação">
            <ul className="list-widget">
              <li>Revisar equipe por unidade e ajustar escala semanal.</li>
              <li>Checar cadeiras com manutenção pendente.</li>
              <li>Atualizar responsável técnico quando houver alteração societária.</li>
            </ul>
          </WidgetCard>
        </DataColumn>
      </SectionColumns>
    </PageSection>
  );
};

const App = () => {
  const [activeTab, setActiveTab] = useState('patients');

  return (
    <div className="app-shell">
      <aside className="app-sidebar">
        <h2>OdontoFlow</h2>
        <p>Gestão modular</p>
        <nav>
          {NAV_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={activeTab === tab.id ? 'is-active' : ''}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </aside>

      <main className="app-main">
        {activeTab === 'patients' ? <PatientsScreen /> : <ClinicsScreen />}
      </main>
    </div>
  );
};

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
