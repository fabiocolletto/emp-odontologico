const { useEffect, useRef, useState } = React;
const STORAGE_KEY = 'odontoflow-ui-state-v1';
const NOTES_DRAFT_KEY = 'odontoflow-notes-draft-v1';
const FIRST_PATIENT_HINT_KEY = 'odontoflow-first-patient-hint-seen-v1';
const PAGE_SIZE_PATIENTS = 9;
const PAGE_SIZE_APPOINTMENTS = 6;
const MOBILE_PAGE_SIZE_PATIENTS = 5;
const MOBILE_NAV_STATE_KEY = 'odontoflow-mobile-nav-state-v1';

const tabs = [
  { id: 'overview', label: 'Painel', icon: 'home' },
  { id: 'patients', label: 'Pacientes', icon: 'users' },
  { id: 'settings', label: 'Configurações', icon: 'settings' }
];

const MOBILE_NAV_SHORTCUTS = [
  { id: 'overview', label: 'Painel diário', tab: 'overview', icon: 'home', group: 'Atendimento' },
  { id: 'agenda-hoje', label: 'Agenda de hoje', tab: 'overview', icon: 'calendar', group: 'Atendimento' },
  { id: 'patients', label: 'Pacientes', tab: 'patients', icon: 'users', group: 'Cadastros' },
  { id: 'new-patient', label: 'Novo paciente', tab: 'patients', icon: 'users', group: 'Cadastros', action: 'create-patient' },
  { id: 'settings', label: 'Configurações', tab: 'settings', icon: 'settings', group: 'Gestão' }
];

const AppIcon = ({ name, size = 14, className = '' }) => {
  const icons = {
    home: <path d="M3 10.5 12 3l9 7.5M6.5 9.8V21h11V9.8" />,
    users: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="3.2" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16.5 3.2a3.2 3.2 0 0 1 0 6.2" /></>,
    settings: <><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1 1 0 0 0 .2 1.1l.1.1a1.8 1.8 0 1 1-2.5 2.5l-.1-.1a1 1 0 0 0-1.1-.2 1 1 0 0 0-.6.9V20a1.8 1.8 0 1 1-3.6 0v-.1a1 1 0 0 0-.6-.9 1 1 0 0 0-1.1.2l-.1.1a1.8 1.8 0 1 1-2.5-2.5l.1-.1a1 1 0 0 0 .2-1.1 1 1 0 0 0-.9-.6H4a1.8 1.8 0 1 1 0-3.6h.1a1 1 0 0 0 .9-.6 1 1 0 0 0-.2-1.1l-.1-.1a1.8 1.8 0 1 1 2.5-2.5l.1.1a1 1 0 0 0 1.1.2h.2a1 1 0 0 0 .6-.9V4a1.8 1.8 0 1 1 3.6 0v.1a1 1 0 0 0 .6.9h.2a1 1 0 0 0 1.1-.2l.1-.1a1.8 1.8 0 1 1 2.5 2.5l-.1.1a1 1 0 0 0-.2 1.1v.2a1 1 0 0 0 .9.6H20a1.8 1.8 0 1 1 0 3.6h-.1a1 1 0 0 0-.9.6Z" /></>,
    phone: <path d="M22 16.8v3a2 2 0 0 1-2.2 2 19.7 19.7 0 0 1-8.6-3.1 19.4 19.4 0 0 1-6-6A19.7 19.7 0 0 1 2 4.1 2 2 0 0 1 4 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.7.8 2.5a2 2 0 0 1-.4 2.1L8.1 9.6a16 16 0 0 0 6.3 6.3l1.3-1.3a2 2 0 0 1 2.1-.4c.8.4 1.6.7 2.5.8A2 2 0 0 1 22 16.8Z" />,
    calendar: <><rect x="3" y="4" width="18" height="17" rx="2.5" /><path d="M8 2v4M16 2v4M3 10h18" /></>,
    birth: <><path d="M12 4v16M4 10h16M7 4v4M17 4v4M7 16v4M17 16v4" /></>,
    plan: <><rect x="2.5" y="5" width="19" height="14" rx="2.5" /><path d="M2.5 10.5h19M7.5 15h3" /></>,
    email: <><rect x="2.5" y="4.5" width="19" height="15" rx="2.5" /><path d="m3 6 9 7 9-7" /></>,
    filter: <path d="M4 6h16M7 12h10M10 18h4" />,
    info: <><circle cx="12" cy="12" r="9" /><path d="M12 10v6M12 7.5h.01" /></>,
    star: <path d="m12 3.4 2.7 5.5 6 0.9-4.4 4.3 1 6-5.3-2.8-5.3 2.8 1-6L3.3 9.8l6-0.9L12 3.4Z" />,
    clock: <><circle cx="12" cy="12" r="8.5" /><path d="M12 7.8v4.6l3 1.6" /></>,
    map: <><path d="M3.5 6.5 9 4l6 2.5L20.5 4v13L15 19.5 9 17 3.5 19.5v-13Z" /><path d="M9 4v13M15 6.5v13" /></>,
    menu: <><path d="M4 7h16M4 12h16M4 17h16" /></>,
    edit: <><path d="m4 20 3.5-.7 10-10a2 2 0 0 0 0-2.8l-1-1a2 2 0 0 0-2.8 0l-10 10L3 19.9Z" /><path d="M13 6l5 5" /></>,
    check: <path d="m5 12 4.2 4.2L19 6.8" />,
    close: <path d="M6 6l12 12M18 6 6 18" />,
    'chevron-left': <path d="m14.5 6-6 6 6 6" />,
    'chevron-right': <path d="m9.5 6 6 6-6 6" />
  };

  return (
    <svg className={`app-icon ${className}`} viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      {icons[name]}
    </svg>
  );
};

const TransientNotice = ({ message, tone = 'info', onClose, visible }) => {
  if (!visible) return null;
  return (
    <div className={`transient-notice transient-notice--${tone}`}>
      <div className="transient-notice__content">
        <AppIcon name="info" size={14} />
        <span>{message}</span>
      </div>
      <button className="btn btn--ghost transient-notice__close" onClick={onClose} aria-label="Fechar aviso">OK</button>
    </div>
  );
};


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

const filterBySearchTerm = (records, searchTerm) => {
  const normalizedTerm = String(searchTerm || '').trim().toLowerCase();
  if (!normalizedTerm) return records;

  return records.filter((record) =>
    Object.values(record || {}).some((value) =>
      String(value ?? '').toLowerCase().includes(normalizedTerm)
    )
  );
};

const paginateRecords = (records, page, pageSize) => {
  const totalPages = Math.max(1, Math.ceil(records.length / pageSize));
  const safePage = Math.min(Math.max(page, 1), totalPages);
  const startIndex = (safePage - 1) * pageSize;
  return {
    page: safePage,
    totalPages,
    items: records.slice(startIndex, startIndex + pageSize)
  };
};

const PATIENT_FORM_TABS = [
  { id: 'identity', label: '1. Identificação' },
  { id: 'contact', label: '2. Contato' },
  { id: 'clinical', label: '3. Dados clínicos' }
];

const createEmptyPatientForm = () => ({
  name: '',
  birth: '',
  phone: '',
  email: '',
  plan: 'Particular',
  notes: ''
});

const toPatientFromForm = (form) => ({
  id: `new-${Date.now()}`,
  name: form.name.trim(),
  phone: form.phone.trim(),
  email: form.email.trim() || '-',
  birth: form.birth ? toDate(form.birth) : '-',
  plan: form.plan.trim() || 'Particular',
  notes: form.notes.trim() || 'Sem observações clínicas.',
  lastVisit: '-'
});

const PatientN2Modal = ({
  isOpen,
  mode,
  patient,
  form,
  viewForm,
  activeTab,
  notesValue,
  isEditingView,
  onClose,
  onFormChange,
  onPreviousTab,
  onNextTab,
  onOpenNavigationMap,
  onSubmit,
  onStartEdit,
  onCancelEdit,
  onSaveEdit
}) => {
  if (!isOpen) return null;
  const isCreateMode = mode === 'create';
  const currentTab = PATIENT_FORM_TABS.find((tab) => tab.id === activeTab);
  const canEditView = !isCreateMode && isEditingView;

  return (
    <div className="modal-wrap">
      <div className="modal-backdrop" onClick={onClose}></div>
      <div className="modal-card modal-card--wide">
        <div className="modal-header">
          <div>
            <h3 className="text-xl font-bold text-slate-900">
              {isCreateMode ? 'Novo paciente' : patient?.name}
            </h3>
            <p className="modal-step-label">Etapa atual: {currentTab?.label}</p>
          </div>
          <div className="modal-header__actions">
            {!isCreateMode && !isEditingView && (
              <button className="btn btn--ghost modal-header__btn modal-action-btn modal-action-btn--info" onClick={onStartEdit}>
                <AppIcon name="edit" size={13} className="btn-icon" />
                <span className="btn-label">Habilitar edição</span>
              </button>
            )}
            {!isCreateMode && isEditingView && (
              <>
                <button className="btn btn--ghost modal-header__btn modal-action-btn modal-action-btn--neutral" onClick={onCancelEdit}>
                  <AppIcon name="close" size={13} className="btn-icon" />
                  <span className="btn-label">Cancelar</span>
                </button>
                <button className="btn btn--ghost modal-header__btn modal-action-btn modal-action-btn--success" onClick={onSaveEdit}>
                  <AppIcon name="check" size={13} className="btn-icon" />
                  <span className="btn-label">Salvar</span>
                </button>
              </>
            )}
            {isCreateMode && (
              <button className="btn btn--ghost modal-header__btn modal-action-btn modal-action-btn--success" onClick={onSubmit}>
                <AppIcon name="check" size={13} className="btn-icon" />
                <span className="btn-label">Salvar paciente</span>
              </button>
            )}
            {!isEditingView && (
              <button onClick={onClose} className="btn btn--ghost modal-header__btn modal-action-btn modal-action-btn--danger" aria-label="Fechar janela">
                <AppIcon name="close" size={14} className="btn-icon" />
                <span className="btn-label">Fechar</span>
              </button>
            )}
          </div>
        </div>

        <div className="modal-body">
          {activeTab === 'identity' && (
            <div className="modal-grid">
              <label className="form-field">
                <span>Nome completo</span>
                <input
                  className="form-input"
                  value={isCreateMode ? form.name : (viewForm?.name || patient?.name || '')}
                  onChange={(e) => onFormChange('name', e.target.value)}
                  disabled={!isCreateMode && !canEditView}
                  placeholder="Ex: Mariana Albuquerque"
                />
              </label>
              <label className="form-field">
                <span>Data de nascimento</span>
                <input
                  className="form-input"
                  type={isCreateMode ? 'date' : 'text'}
                  value={isCreateMode ? form.birth : (viewForm?.birth || patient?.birth || '-')}
                  onChange={(e) => onFormChange('birth', e.target.value)}
                  disabled={!isCreateMode && !canEditView}
                />
              </label>
            </div>
          )}

          {activeTab === 'contact' && (
            <div className="modal-grid">
              <label className="form-field">
                <span>Telefone</span>
                <input
                  className="form-input"
                  value={isCreateMode ? form.phone : (viewForm?.phone || patient?.phone || '')}
                  onChange={(e) => onFormChange('phone', e.target.value)}
                  disabled={!isCreateMode && !canEditView}
                  placeholder="(11) 90000-0000"
                />
              </label>
              <label className="form-field">
                <span>E-mail</span>
                <input
                  className="form-input"
                  type="email"
                  value={isCreateMode ? form.email : (viewForm?.email || patient?.email || '')}
                  onChange={(e) => onFormChange('email', e.target.value)}
                  disabled={!isCreateMode && !canEditView}
                  placeholder="nome@email.com"
                />
              </label>
            </div>
          )}

          {activeTab === 'clinical' && (
            <div className="modal-grid">
              <label className="form-field">
                <span>Plano</span>
                <input
                  className="form-input"
                  value={isCreateMode ? form.plan : (viewForm?.plan || patient?.plan || '')}
                  onChange={(e) => onFormChange('plan', e.target.value)}
                  disabled={!isCreateMode && !canEditView}
                  placeholder="Particular ou convênio"
                />
              </label>
              {!isCreateMode && (
                <div className="form-field">
                  <span>Última visita</span>
                  <div className="form-static">{patient?.lastVisit || '-'}</div>
                </div>
              )}
              <label className={`form-field ${!isCreateMode ? 'form-field--full' : ''}`}>
                <span>Observações clínicas</span>
                <textarea
                  className="modal-notes-input"
                  value={isCreateMode ? form.notes : (viewForm?.notes ?? notesValue)}
                  onChange={(e) => onFormChange('notes', e.target.value)}
                  disabled={!isCreateMode && !canEditView}
                  placeholder="Alergias, histórico, cuidados e recomendações..."
                />
              </label>
            </div>
          )}
        </div>

        <div className="modal-footer modal-footer--stack">
          <div className="n2-mobile-nav">
            <button className="btn btn--mobile-tab n2-mobile-nav__btn" onClick={onPreviousTab}>
              <AppIcon name="chevron-left" size={16} className="btn-icon" />
              <span className="btn-label">Etapa anterior</span>
            </button>
            <button className="btn btn--mobile-tab n2-mobile-nav__btn" onClick={onNextTab}>
              <AppIcon name="chevron-right" size={16} className="btn-icon" />
              <span className="btn-label">Próxima etapa</span>
            </button>
            <button className="btn btn--mobile-tab n2-mobile-nav__btn" onClick={onOpenNavigationMap}>
              <AppIcon name="map" size={14} className="btn-icon" />
              <span className="btn-label">Mapa</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const applyPatientQuickFilter = (records, filter) => {
  if (filter === 'with-visit') return records.filter((p) => p.lastVisit && p.lastVisit !== '-');
  if (filter === 'without-visit') return records.filter((p) => !p.lastVisit || p.lastVisit === '-');
  if (filter === 'private-plan') return records.filter((p) => String(p.plan || '').toLowerCase().includes('particular'));
  if (filter === 'insurance-plan') return records.filter((p) => String(p.plan || '').toLowerCase().includes('convênio'));
  if (filter === 'with-email') return records.filter((p) => p.email && p.email !== '-');
  return records;
};

const readStoredUiState = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  } catch {
    return {};
  }
};

const readStoredNotesDraft = () => {
  try {
    return JSON.parse(localStorage.getItem(NOTES_DRAFT_KEY) || '{}');
  } catch {
    return {};
  }
};

const readStoredMobileNavState = () => {
  try {
    return JSON.parse(localStorage.getItem(MOBILE_NAV_STATE_KEY) || '{}');
  } catch {
    return {};
  }
};

function App() {
  const [initialUiState] = useState(() => readStoredUiState());
  const [view, setView] = useState(initialUiState.view || 'loader');
  const [activeTab, setActiveTab] = useState(initialUiState.activeTab || 'overview');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [selectedPatientId, setSelectedPatientId] = useState(initialUiState.selectedPatientId || null);
  const [showPatientN2, setShowPatientN2] = useState(Boolean(initialUiState.showPatientN2));
  const [patients, setPatients] = useState(FALLBACK_PATIENTS);
  const [appointments, setAppointments] = useState(FALLBACK_APPOINTMENTS);
  const [usingFallbackData, setUsingFallbackData] = useState(true);
  const [notesDraft, setNotesDraft] = useState(() => readStoredNotesDraft());
  const [patientsQuery, setPatientsQuery] = useState('');
  const [patientsPage, setPatientsPage] = useState(1);
  const [quickPatientFilter, setQuickPatientFilter] = useState('all');
  const [appointmentsQuery, setAppointmentsQuery] = useState('');
  const [appointmentsPage, setAppointmentsPage] = useState(1);
  const quickFiltersRef = useRef(null);
  const quickFiltersScrollTimeoutRef = useRef(null);
  const [showPatientHint, setShowPatientHint] = useState(false);
  const [showQuickFilterNav, setShowQuickFilterNav] = useState(true);
  const [patientModalMode, setPatientModalMode] = useState('view');
  const [patientFormTab, setPatientFormTab] = useState(PATIENT_FORM_TABS[0].id);
  const [newPatientForm, setNewPatientForm] = useState(() => createEmptyPatientForm());
  const [patientViewForm, setPatientViewForm] = useState(() => createEmptyPatientForm());
  const [isPatientViewEditing, setIsPatientViewEditing] = useState(false);
  const [formFeedback, setFormFeedback] = useState('');
  const [isMobileViewport, setIsMobileViewport] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia('(max-width: 640px)').matches : false
  );
  const [showMobileNavDrawer, setShowMobileNavDrawer] = useState(false);
  const [mobileNavState, setMobileNavState] = useState(() => {
    const stored = readStoredMobileNavState();
    return {
      favorites: Array.isArray(stored.favorites) ? stored.favorites : [],
      recents: Array.isArray(stored.recents) ? stored.recents : []
    };
  });
  const [dragShortcutId, setDragShortcutId] = useState(null);
  const patientsInfiniteTriggerRef = useRef(null);
  const appointmentsInfiniteTriggerRef = useRef(null);

  const groupedMobileShortcuts = MOBILE_NAV_SHORTCUTS.reduce((acc, shortcut) => {
    if (!acc[shortcut.group]) acc[shortcut.group] = [];
    acc[shortcut.group].push(shortcut);
    return acc;
  }, {});

  const openPatientN2 = (patient) => {
    setPatientModalMode('view');
    setPatientFormTab(PATIENT_FORM_TABS[0].id);
    setSelectedPatient(patient);
    setSelectedPatientId(patient?.id || null);
    setPatientViewForm({
      name: patient?.name || '',
      birth: patient?.birth || '-',
      phone: patient?.phone || '',
      email: patient?.email || '',
      plan: patient?.plan || '',
      notes: notesDraft[patient?.id] ?? patient?.notes ?? ''
    });
    setIsPatientViewEditing(false);
    setShowPatientN2(true);
  };

  const openCreatePatientN2 = () => {
    setPatientModalMode('create');
    setPatientFormTab(PATIENT_FORM_TABS[0].id);
    setSelectedPatient(null);
    setSelectedPatientId(null);
    setNewPatientForm(createEmptyPatientForm());
    setFormFeedback('');
    setShowPatientN2(true);
  };

  const handlePatientFormChange = (field, value) => {
    if (patientModalMode === 'create') {
      setNewPatientForm((prev) => ({ ...prev, [field]: value }));
      return;
    }

    if (patientModalMode === 'view' && isPatientViewEditing) {
      setPatientViewForm((prev) => ({ ...prev, [field]: value }));
    }
  };

  const moveFormTab = (direction) => {
    const currentIndex = PATIENT_FORM_TABS.findIndex((tab) => tab.id === patientFormTab);
    const nextIndex = Math.min(
      PATIENT_FORM_TABS.length - 1,
      Math.max(0, currentIndex + direction)
    );
    setPatientFormTab(PATIENT_FORM_TABS[nextIndex].id);
  };

  const handleCreatePatientSubmit = () => {
    if (!newPatientForm.name.trim() || !newPatientForm.phone.trim()) {
      setFormFeedback('Preencha ao menos nome e telefone para salvar o paciente.');
      return;
    }

    const newPatient = toPatientFromForm(newPatientForm);
    setPatients((prev) => [newPatient, ...prev]);
    setQuickPatientFilter('all');
    setPatientsQuery('');
    setPatientsPage(1);
    setSelectedPatient(null);
    setSelectedPatientId(null);
    setPatientModalMode('create');
    setPatientFormTab(PATIENT_FORM_TABS[0].id);
    setShowPatientN2(false);
    setNewPatientForm(createEmptyPatientForm());
    setFormFeedback('');
    setShowPatientHint(true);
  };

  const registerMobileRecent = (shortcutId) => {
    setMobileNavState((prev) => {
      const recents = [shortcutId, ...prev.recents.filter((item) => item !== shortcutId)].slice(0, 5);
      return { ...prev, recents };
    });
  };

  const handleMobileShortcut = (shortcut) => {
    if (!shortcut) return;
    registerMobileRecent(shortcut.id);
    setShowMobileNavDrawer(false);

    if (shortcut.action === 'create-patient') {
      setActiveTab('patients');
      openCreatePatientN2();
      return;
    }

    setActiveTab(shortcut.tab);
  };

  const toggleMobileFavorite = (shortcutId) => {
    setMobileNavState((prev) => {
      const exists = prev.favorites.includes(shortcutId);
      const favorites = exists
        ? prev.favorites.filter((item) => item !== shortcutId)
        : [...prev.favorites, shortcutId].slice(-6);
      return { ...prev, favorites };
    });
  };

  const addMobileFavorite = (shortcutId) => {
    if (!shortcutId) return;
    setMobileNavState((prev) => {
      if (prev.favorites.includes(shortcutId)) return prev;
      return { ...prev, favorites: [...prev.favorites, shortcutId].slice(-6) };
    });
  };

  const handleStartPatientEdit = () => {
    if (!selectedPatient) return;
    setPatientViewForm({
      name: selectedPatient.name || '',
      birth: selectedPatient.birth || '-',
      phone: selectedPatient.phone || '',
      email: selectedPatient.email || '',
      plan: selectedPatient.plan || '',
      notes: notesDraft[selectedPatient.id] ?? selectedPatient.notes ?? ''
    });
    setIsPatientViewEditing(true);
  };

  const handleCancelPatientEdit = () => {
    if (!selectedPatient) return;
    setPatientViewForm({
      name: selectedPatient.name || '',
      birth: selectedPatient.birth || '-',
      phone: selectedPatient.phone || '',
      email: selectedPatient.email || '',
      plan: selectedPatient.plan || '',
      notes: notesDraft[selectedPatient.id] ?? selectedPatient.notes ?? ''
    });
    setIsPatientViewEditing(false);
  };

  const handleSavePatientEdit = () => {
    if (!selectedPatient) return;
    const updatedPatient = {
      ...selectedPatient,
      name: patientViewForm.name.trim() || selectedPatient.name,
      phone: patientViewForm.phone.trim() || selectedPatient.phone,
      email: patientViewForm.email.trim() || '-',
      birth: patientViewForm.birth.trim() || selectedPatient.birth,
      plan: patientViewForm.plan.trim() || selectedPatient.plan,
      notes: patientViewForm.notes.trim() || selectedPatient.notes
    };

    setPatients((prev) => prev.map((item) => (item.id === selectedPatient.id ? updatedPatient : item)));
    setSelectedPatient(updatedPatient);
    setNotesDraft((prev) => ({
      ...prev,
      [selectedPatient.id]: updatedPatient.notes
    }));
    setIsPatientViewEditing(false);
    setFormFeedback('Prontuário atualizado com sucesso.');
  };

  const scrollQuickFilters = (direction) => {
    if (!quickFiltersRef.current) return;
    const container = quickFiltersRef.current;
    const delta = direction === 'right' ? 260 : -260;
    const maxScrollLeft = container.scrollWidth - container.clientWidth;
    const nextScrollLeft = container.scrollLeft + delta;

    if (direction === 'right' && nextScrollLeft >= maxScrollLeft - 2) {
      container.scrollTo({ left: 0, behavior: 'smooth' });
      return;
    }

    if (direction === 'left' && nextScrollLeft <= 0) {
      container.scrollTo({ left: maxScrollLeft, behavior: 'smooth' });
      return;
    }

    container.scrollBy({ left: delta, behavior: 'smooth' });
  };

  const handleQuickFiltersScroll = () => {
    setShowQuickFilterNav(false);
    if (quickFiltersScrollTimeoutRef.current) {
      clearTimeout(quickFiltersScrollTimeoutRef.current);
    }
    quickFiltersScrollTimeoutRef.current = setTimeout(() => {
      setShowQuickFilterNav(true);
    }, 280);
  };

  const quickFilteredPatients = applyPatientQuickFilter(patients, quickPatientFilter);
  const filteredPatients = filterBySearchTerm(quickFilteredPatients, patientsQuery);
  const patientsPageSize = isMobileViewport ? MOBILE_PAGE_SIZE_PATIENTS : PAGE_SIZE_PATIENTS;
  const patientsPagination = paginateRecords(filteredPatients, patientsPage, patientsPageSize);
  const visiblePatients = isMobileViewport
    ? filteredPatients.slice(0, patientsPagination.page * patientsPageSize)
    : patientsPagination.items;

  const filteredAppointments = filterBySearchTerm(appointments, appointmentsQuery);
  const appointmentsPagination = paginateRecords(filteredAppointments, appointmentsPage, PAGE_SIZE_APPOINTMENTS);
  const visibleAppointments = isMobileViewport
    ? filteredAppointments.slice(0, appointmentsPagination.page * PAGE_SIZE_APPOINTMENTS)
    : appointmentsPagination.items;

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

  useEffect(() => {
    if (!selectedPatientId) return;
    const source = patients.find((p) => p.id === selectedPatientId);
    if (source) {
      setSelectedPatient(source);
      if (!isPatientViewEditing) {
        setPatientViewForm({
          name: source.name || '',
          birth: source.birth || '-',
          phone: source.phone || '',
          email: source.email || '',
          plan: source.plan || '',
          notes: notesDraft[source.id] ?? source.notes ?? ''
        });
      }
    }
  }, [patients, selectedPatientId, isPatientViewEditing, notesDraft]);

  useEffect(() => {
    const state = {
      view,
      activeTab,
      showPatientN2,
      selectedPatientId
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [view, activeTab, showPatientN2, selectedPatientId]);

  useEffect(() => {
    localStorage.setItem(NOTES_DRAFT_KEY, JSON.stringify(notesDraft));
  }, [notesDraft]);

  useEffect(() => {
    localStorage.setItem(MOBILE_NAV_STATE_KEY, JSON.stringify(mobileNavState));
  }, [mobileNavState]);

  useEffect(() => {
    setPatientsPage(1);
  }, [patientsQuery, quickPatientFilter]);

  useEffect(() => {
    setAppointmentsPage(1);
  }, [appointmentsQuery]);

  useEffect(() => () => {
    if (quickFiltersScrollTimeoutRef.current) {
      clearTimeout(quickFiltersScrollTimeoutRef.current);
    }
  }, []);

  useEffect(() => {
    const media = window.matchMedia('(max-width: 640px)');
    const handler = (event) => setIsMobileViewport(event.matches);
    setIsMobileViewport(media.matches);
    if (media.addEventListener) {
      media.addEventListener('change', handler);
      return () => media.removeEventListener('change', handler);
    }
    media.addListener(handler);
    return () => media.removeListener(handler);
  }, []);

  useEffect(() => {
    const alreadySeen = localStorage.getItem(FIRST_PATIENT_HINT_KEY) === '1';
    if (!alreadySeen) {
      setShowPatientHint(true);
      localStorage.setItem(FIRST_PATIENT_HINT_KEY, '1');
    }
  }, []);

  useEffect(() => {
    if (!showPatientHint) return;
    const timer = setTimeout(() => setShowPatientHint(false), 7000);
    return () => clearTimeout(timer);
  }, [showPatientHint]);

  useEffect(() => {
    if (!formFeedback) return;
    const timer = setTimeout(() => setFormFeedback(''), 4000);
    return () => clearTimeout(timer);
  }, [formFeedback]);

  useEffect(() => {
    const tabShortcutId = MOBILE_NAV_SHORTCUTS.find((item) => item.id === activeTab)?.id || activeTab;
    if (!isMobileViewport) return;
    registerMobileRecent(tabShortcutId);
  }, [activeTab, isMobileViewport]);

  useEffect(() => {
    if (!isMobileViewport || activeTab !== 'patients') return;
    const target = patientsInfiniteTriggerRef.current;
    if (!target) return;

    const observer = new IntersectionObserver((entries) => {
      const [entry] = entries;
      if (!entry?.isIntersecting) return;
      setPatientsPage((prev) => {
        if (prev >= patientsPagination.totalPages) return prev;
        return prev + 1;
      });
    }, { rootMargin: '160px 0px' });

    observer.observe(target);
    return () => observer.disconnect();
  }, [activeTab, isMobileViewport, patientsPagination.totalPages, filteredPatients.length]);

  useEffect(() => {
    if (!isMobileViewport || activeTab !== 'overview') return;
    const target = appointmentsInfiniteTriggerRef.current;
    if (!target) return;

    const observer = new IntersectionObserver((entries) => {
      const [entry] = entries;
      if (!entry?.isIntersecting) return;
      setAppointmentsPage((prev) => {
        if (prev >= appointmentsPagination.totalPages) return prev;
        return prev + 1;
      });
    }, { rootMargin: '160px 0px' });

    observer.observe(target);
    return () => observer.disconnect();
  }, [activeTab, isMobileViewport, appointmentsPagination.totalPages, filteredAppointments.length]);

  if (view === 'loader') {
    return (
      <div className="app-viewport flex flex-col items-center justify-center bg-white space-y-4">
        <div className="w-10 h-10 border-[3px] border-sky-700 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300">Sincronizando Ecossistema</p>
      </div>
    );
  }

  if (view === 'landing') {
    return (
      <div className="app-viewport flex flex-col items-center justify-between bg-[#F2F2F7] p-10 py-24 text-center">
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
            <div className="search-row">
              <input
                className="search-input"
                placeholder="Pesquisar agendamentos (nome, horário, procedimento...)"
                value={appointmentsQuery}
                onChange={(e) => setAppointmentsQuery(e.target.value)}
              />
              <span className="search-count">{filteredAppointments.length} registro(s)</span>
            </div>

            <div className="agenda-list">
              {visibleAppointments.length === 0 ? (
                <p className="text-sm text-slate-500">Nenhum agendamento encontrado para o termo pesquisado.</p>
              ) : (
                visibleAppointments.map((item) => {
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
                })
              )}
            </div>
            {isMobileViewport ? (
              <div ref={appointmentsInfiniteTriggerRef} className="infinite-trigger">
                {appointmentsPagination.page < appointmentsPagination.totalPages
                  ? 'Role para carregar mais agendamentos'
                  : 'Todos os agendamentos carregados'}
              </div>
            ) : (
              <div className="pagination-row">
                <button
                  className="btn btn--pager"
                  onClick={() => setAppointmentsPage((prev) => Math.max(1, prev - 1))}
                  disabled={appointmentsPagination.page === 1}
                >
                  ← Anterior
                </button>
                <span className="pagination-label">
                  Página {appointmentsPagination.page} de {appointmentsPagination.totalPages}
                </span>
                <button
                  className="btn btn--pager"
                  onClick={() => setAppointmentsPage((prev) => Math.min(appointmentsPagination.totalPages, prev + 1))}
                  disabled={appointmentsPagination.page === appointmentsPagination.totalPages}
                >
                  Próxima →
                </button>
              </div>
            )}
          </div>
        </div>
      );
    }

    if (activeTab === 'patients') {
      const patientsWithVisit = patients.filter((p) => p.lastVisit && p.lastVisit !== '-').length;
      const patientsWithoutVisit = patients.filter((p) => !p.lastVisit || p.lastVisit === '-').length;
      const patientsPrivatePlan = patients.filter((p) => String(p.plan || '').toLowerCase().includes('particular')).length;
      const patientsInsurancePlan = patients.filter((p) => String(p.plan || '').toLowerCase().includes('convênio')).length;
      const patientsWithEmail = patients.filter((p) => p.email && p.email !== '-').length;
      return (
        <div className="space-y-6">
          <div className="page-header">
            <h2 className="page-title">Base de Pacientes</h2>
            <button className="btn btn--primary btn--header" onClick={openCreatePatientN2}>
              + Novo paciente
            </button>
          </div>
          <TransientNotice
            visible={showPatientHint && !formFeedback}
            message="Clique em um paciente para abrir a tela N2 com os dados completos."
            onClose={() => setShowPatientHint(false)}
          />
          <TransientNotice
            visible={Boolean(formFeedback)}
            message={formFeedback}
            tone="info"
            onClose={() => setFormFeedback('')}
          />
          <div className="quick-filters-shell">
            <button
              className={`btn btn--icon btn--quick-nav ${showQuickFilterNav ? '' : 'is-hidden'}`}
              onClick={() => scrollQuickFilters('left')}
              aria-label="Rolar filtros para esquerda"
              aria-hidden={!showQuickFilterNav}
              tabIndex={showQuickFilterNav ? 0 : -1}
            >
              ←
            </button>
            <div className="quick-filters-grid" ref={quickFiltersRef} onScroll={handleQuickFiltersScroll}>
              <button
                className={`btn btn--quick-filter ${quickPatientFilter === 'all' ? 'is-active' : ''}`}
                onClick={() => setQuickPatientFilter('all')}
              >
                <span className="quick-filter__label"><AppIcon name="filter" size={13} />Total cadastrado</span>
                <strong className="quick-filter__value">{patients.length}</strong>
              </button>
              <button
                className={`btn btn--quick-filter ${quickPatientFilter === 'with-visit' ? 'is-active' : ''}`}
                onClick={() => setQuickPatientFilter('with-visit')}
              >
                <span className="quick-filter__label"><AppIcon name="calendar" size={13} />Com última visita</span>
                <strong className="quick-filter__value">{patientsWithVisit}</strong>
              </button>
              <button
                className={`btn btn--quick-filter ${quickPatientFilter === 'without-visit' ? 'is-active' : ''}`}
                onClick={() => setQuickPatientFilter('without-visit')}
              >
                <span className="quick-filter__label"><AppIcon name="calendar" size={13} />Sem visita registrada</span>
                <strong className="quick-filter__value">{patientsWithoutVisit}</strong>
              </button>
              <button
                className={`btn btn--quick-filter ${quickPatientFilter === 'private-plan' ? 'is-active' : ''}`}
                onClick={() => setQuickPatientFilter('private-plan')}
              >
                <span className="quick-filter__label"><AppIcon name="plan" size={13} />Plano particular</span>
                <strong className="quick-filter__value">{patientsPrivatePlan}</strong>
              </button>
              <button
                className={`btn btn--quick-filter ${quickPatientFilter === 'insurance-plan' ? 'is-active' : ''}`}
                onClick={() => setQuickPatientFilter('insurance-plan')}
              >
                <span className="quick-filter__label"><AppIcon name="plan" size={13} />Com convênio</span>
                <strong className="quick-filter__value">{patientsInsurancePlan}</strong>
              </button>
              <button
                className={`btn btn--quick-filter ${quickPatientFilter === 'with-email' ? 'is-active' : ''}`}
                onClick={() => setQuickPatientFilter('with-email')}
              >
                <span className="quick-filter__label"><AppIcon name="email" size={13} />Com e-mail</span>
                <strong className="quick-filter__value">{patientsWithEmail}</strong>
              </button>
            </div>
            <button
              className={`btn btn--icon btn--quick-nav ${showQuickFilterNav ? '' : 'is-hidden'}`}
              onClick={() => scrollQuickFilters('right')}
              aria-label="Rolar filtros para direita"
              aria-hidden={!showQuickFilterNav}
              tabIndex={showQuickFilterNav ? 0 : -1}
            >
              →
            </button>
          </div>
          <div className="search-row">
            <input
              className="search-input search-input--compact"
              placeholder="Pesquisar pacientes por qualquer campo (nome, telefone, plano, e-mail...)"
              value={patientsQuery}
              onChange={(e) => setPatientsQuery(e.target.value)}
            />
            <span className="search-count">{filteredPatients.length} registro(s)</span>
          </div>
          <div className="data-grid patients-grid">
            {visiblePatients.length === 0 ? (
              <p className="text-sm text-slate-500">Nenhum paciente encontrado para o termo pesquisado.</p>
            ) : (
              visiblePatients.map((p) => (
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
                      <p className="patient-card__name">{p.name}</p>
                    </div>
                  </div>

                  <div className="patient-card__grid">
                    <div className="patient-meta">
                      <p className="patient-meta__label"><AppIcon name="phone" size={13} />Telefone</p>
                      <p className="patient-meta__value">{p.phone}</p>
                    </div>
                    <div className="patient-meta">
                      <p className="patient-meta__label"><AppIcon name="calendar" size={13} />Última visita</p>
                      <p className="patient-meta__value">{p.lastVisit}</p>
                    </div>
                    <div className="patient-meta">
                      <p className="patient-meta__label"><AppIcon name="birth" size={13} />Nascimento</p>
                      <p className="patient-meta__value">{p.birth}</p>
                    </div>
                    <div className="patient-meta">
                      <p className="patient-meta__label"><AppIcon name="plan" size={13} />Plano</p>
                      <p className="patient-meta__value">{p.plan}</p>
                    </div>
                  </div>
                </article>
              ))
            )}
          </div>
          {isMobileViewport ? (
            <div ref={patientsInfiniteTriggerRef} className="infinite-trigger">
              {patientsPagination.page < patientsPagination.totalPages
                ? 'Role para carregar mais pacientes'
                : 'Todos os pacientes carregados'}
            </div>
          ) : (
            <div className="pagination-row">
              <button
                className="btn btn--pager"
                onClick={() => setPatientsPage((prev) => Math.max(1, prev - 1))}
                disabled={patientsPagination.page === 1}
              >
                ← Anterior
              </button>
              <span className="pagination-label">
                Página {patientsPagination.page} de {patientsPagination.totalPages}
              </span>
              <button
                className="btn btn--pager"
                onClick={() => setPatientsPage((prev) => Math.min(patientsPagination.totalPages, prev + 1))}
                disabled={patientsPagination.page === patientsPagination.totalPages}
              >
                Próxima →
              </button>
            </div>
          )}
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
                <AppIcon name={tab.icon} size={14} />
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
            <AppIcon name={tab.icon} size={13} />
            {tab.label}
          </button>
        ))}
        <button
          onClick={() => setShowMobileNavDrawer((prev) => !prev)}
          className={`btn btn--mobile-tab ${showMobileNavDrawer ? 'is-active' : ''}`}
          aria-expanded={showMobileNavDrawer}
          aria-controls="mobile-navigation-drawer"
        >
          <AppIcon name="map" size={13} />
          Mapa
        </button>
      </nav>

      {showMobileNavDrawer && (
        <div className="mobile-drawer-wrap md:hidden">
          <button className="mobile-drawer-backdrop" onClick={() => setShowMobileNavDrawer(false)} aria-label="Fechar mapa de navegação"></button>
          <aside id="mobile-navigation-drawer" className="mobile-drawer-panel">
            <div className="mobile-drawer-header">
              <div>
                <p className="mobile-drawer-kicker">Navegação inteligente</p>
                <h3>Mapa rápido</h3>
              </div>
              <button className="btn btn--ghost" onClick={() => setShowMobileNavDrawer(false)}>Fechar</button>
            </div>

            <section className="mobile-drawer-section">
              <p className="mobile-drawer-section__title"><AppIcon name="star" size={12} /> Favoritos</p>
              <div
                className={`mobile-drawer-grid mobile-drawer-grid--dropzone ${dragShortcutId ? 'is-dragging' : ''}`}
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event) => {
                  event.preventDefault();
                  addMobileFavorite(dragShortcutId);
                  setDragShortcutId(null);
                }}
              >
                {MOBILE_NAV_SHORTCUTS
                  .filter((item) => mobileNavState.favorites.includes(item.id))
                  .map((shortcut) => (
                    <button key={shortcut.id} className="mobile-shortcut" onClick={() => handleMobileShortcut(shortcut)}>
                      <span><AppIcon name={shortcut.icon} size={13} /> {shortcut.label}</span>
                    </button>
                  ))}
                {mobileNavState.favorites.length === 0 && (
                  <p className="mobile-drawer-empty">
                    Arraste um atalho para cá para criar seus favoritos.
                  </p>
                )}
              </div>
            </section>

            <section className="mobile-drawer-section">
              <p className="mobile-drawer-section__title"><AppIcon name="clock" size={12} /> Últimos acessos</p>
              <div className="mobile-drawer-grid">
                {mobileNavState.recents
                  .map((id) => MOBILE_NAV_SHORTCUTS.find((shortcut) => shortcut.id === id))
                  .filter(Boolean)
                  .map((shortcut) => (
                    <button key={`recent-${shortcut.id}`} className="mobile-shortcut" onClick={() => handleMobileShortcut(shortcut)}>
                      <span><AppIcon name={shortcut.icon} size={13} /> {shortcut.label}</span>
                    </button>
                  ))}
              </div>
            </section>

            {Object.entries(groupedMobileShortcuts).map(([group, shortcuts]) => (
              <section className="mobile-drawer-section" key={group}>
                <p className="mobile-drawer-section__title"><AppIcon name="menu" size={12} /> {group}</p>
                <div className="mobile-drawer-grid">
                  {shortcuts.map((shortcut) => (
                    <div key={`group-${shortcut.id}`} className="mobile-shortcut-shell">
                      <button
                        className="mobile-shortcut"
                        onClick={() => handleMobileShortcut(shortcut)}
                        draggable
                        onDragStart={() => setDragShortcutId(shortcut.id)}
                        onDragEnd={() => setDragShortcutId(null)}
                      >
                        <span><AppIcon name={shortcut.icon} size={13} /> {shortcut.label}</span>
                      </button>
                      <button
                        className={`mobile-shortcut-fav ${mobileNavState.favorites.includes(shortcut.id) ? 'is-active' : ''}`}
                        onClick={() => toggleMobileFavorite(shortcut.id)}
                        aria-label={`Favoritar ${shortcut.label}`}
                      >
                        <AppIcon name="star" size={11} />
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </aside>
        </div>
      )}

      <PatientN2Modal
        isOpen={showPatientN2 && (patientModalMode === 'create' || Boolean(selectedPatient))}
        mode={patientModalMode}
        patient={selectedPatient}
        form={newPatientForm}
        viewForm={patientViewForm}
        activeTab={patientFormTab}
        notesValue={selectedPatient ? (notesDraft[selectedPatient.id] ?? selectedPatient.notes) : ''}
        isEditingView={isPatientViewEditing}
        onClose={() => {
          setShowPatientN2(false);
          setIsPatientViewEditing(false);
        }}
        onFormChange={handlePatientFormChange}
        onPreviousTab={() => moveFormTab(-1)}
        onNextTab={() => moveFormTab(1)}
        onOpenNavigationMap={() => setShowMobileNavDrawer(true)}
        onSubmit={handleCreatePatientSubmit}
        onStartEdit={handleStartPatientEdit}
        onCancelEdit={handleCancelPatientEdit}
        onSaveEdit={handleSavePatientEdit}
      />
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
