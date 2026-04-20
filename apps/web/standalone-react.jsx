const { useEffect, useRef, useState } = React;
const STORAGE_KEY = 'odontoflow-ui-state-v1';
const NOTES_DRAFT_KEY = 'odontoflow-notes-draft-v1';
const FIRST_PATIENT_HINT_KEY = 'odontoflow-first-patient-hint-seen-v1';
const PAGE_SIZE_PATIENTS = 9;
const PAGE_SIZE_APPOINTMENTS = 6;
const MOBILE_PAGE_SIZE_PATIENTS = 5;
const MOBILE_NAV_STATE_KEY = 'odontoflow-mobile-nav-state-v1';
const PATIENTS_SEARCH_VISIBILITY_KEY = 'odontoflow-patients-search-visibility-v1';
const APP_VERSION_FALLBACK = '0.1.25';
const CHANGELOG_PATH = './CHANGELOG.md';
const SUPABASE_STORAGE_KEY = 'odontoflow-supabase-auth';
const AUTH_NOTICE_TIMEOUT_MS = 5000;
const SUPABASE_CONFIG_NOTICE_TIMEOUT_MS = 9000;

const getSupabaseConfig = () => {
  const injected = globalThis.__APP_ENV__ || {};
  const fromWindow = globalThis || {};

  return {
    url: injected.SUPABASE_URL || fromWindow.SUPABASE_URL || '',
    anonKey: injected.SUPABASE_ANON || fromWindow.SUPABASE_ANON || ''
  };
};

const createSupabaseBrowserClient = () => {
  const { url, anonKey } = getSupabaseConfig();
  const factory = globalThis?.supabase?.createClient;
  if (!factory || !url || !anonKey) return null;

  return factory(url, anonKey, {
    auth: {
      storageKey: SUPABASE_STORAGE_KEY,
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  });
};

const createAccountService = (supabaseClient) => {
  const externalFactory = globalThis?.OdontoAuthAccountService?.create;
  if (typeof externalFactory === 'function') {
    return externalFactory({ supabaseClient });
  }

  return {
    getAuthUser: async () => {
      const { data, error } = await supabaseClient.auth.getUser();
      if (error) throw new Error(error.message || 'Falha ao consultar dados do usuário.');
      return data?.user || null;
    },
    updateAuthUser: async (attributes) => {
      const { data, error } = await supabaseClient.auth.updateUser(attributes);
      if (error) throw new Error(error.message || 'Falha ao atualizar conta.');
      return data?.user || null;
    },
    signOut: async () => {
      const { error } = await supabaseClient.auth.signOut();
      if (error) throw new Error(error.message || 'Falha ao desconectar.');
      return true;
    },
    deleteAuthUser: async (userId) => {
      const { error } = await supabaseClient.auth.admin.deleteUser(userId);
      if (error) throw new Error(error.message || 'Falha ao excluir conta.');
      return true;
    },
    loadPublicProfile: async () => null,
    savePublicProfile: async ({ userId, profile }) => ({ id: userId, ...profile }),
    loadClinics: async () => [],
    saveClinic: async ({ clinic }) => clinic
  };
};

const tabs = [
  { id: 'overview', label: 'Painel', icon: 'home' },
  { id: 'patients', label: 'Pacientes', icon: 'users' },
  { id: 'settings', label: 'Configurações', icon: 'settings' },
  { id: 'account', label: 'Conta', icon: 'settings' }
];

const MOBILE_NAV_SHORTCUTS = [
  { id: 'overview', label: 'Painel diário', tab: 'overview', icon: 'home', group: 'Atendimento' },
  { id: 'agenda-hoje', label: 'Agenda de hoje', tab: 'overview', icon: 'calendar', group: 'Atendimento' },
  { id: 'patients', label: 'Pacientes', tab: 'patients', icon: 'users', group: 'Cadastros' },
  { id: 'new-patient', label: 'Novo paciente', tab: 'patients', icon: 'users', group: 'Cadastros', action: 'create-patient' },
  { id: 'settings', label: 'Configurações', tab: 'settings', icon: 'settings', group: 'Gestão' },
  { id: 'account', label: 'Conta', tab: 'account', icon: 'settings', group: 'Gestão' }
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
    search: <><circle cx="11" cy="11" r="6.5" /><path d="m16 16 4.2 4.2" /></>,
    filter: <path d="M4 6h16M7 12h10M10 18h4" />,
    multi: <><rect x="3.5" y="4" width="7.5" height="7.5" rx="1.5" /><rect x="13" y="4" width="7.5" height="7.5" rx="1.5" /><rect x="3.5" y="13.5" width="7.5" height="7.5" rx="1.5" /><path d="m14.5 17 2 2 4-4" /></>,
    expand: <><path d="M9 3.5H3.5V9M15 3.5h5.5V9M9 20.5H3.5V15M15 20.5h5.5V15" /><path d="M8.5 8.5 3.5 3.5M15.5 8.5l5-5M8.5 15.5l-5 5M15.5 15.5l5 5" /></>,
    info: <><circle cx="12" cy="12" r="9" /><path d="M12 10v6M12 7.5h.01" /></>,
    star: <path d="m12 3.4 2.7 5.5 6 0.9-4.4 4.3 1 6-5.3-2.8-5.3 2.8 1-6L3.3 9.8l6-0.9L12 3.4Z" />,
    clock: <><circle cx="12" cy="12" r="8.5" /><path d="M12 7.8v4.6l3 1.6" /></>,
    map: <><path d="M3.5 6.5 9 4l6 2.5L20.5 4v13L15 19.5 9 17 3.5 19.5v-13Z" /><path d="M9 4v13M15 6.5v13" /></>,
    menu: <><path d="M4 7h16M4 12h16M4 17h16" /></>,
    edit: <><path d="m4 20 3.5-.7 10-10a2 2 0 0 0 0-2.8l-1-1a2 2 0 0 0-2.8 0l-10 10L3 19.9Z" /><path d="M13 6l5 5" /></>,
    check: <path d="m5 12 4.2 4.2L19 6.8" />,
    close: <path d="M6 6l12 12M18 6 6 18" />,
    'chevron-down': <path d="m6 9 6 6 6-6" />,
    'chevron-up': <path d="m18 15-6-6-6 6" />,
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

const SingleSelectionField = ({
  id,
  label,
  ariaLabel,
  value,
  onChange,
  options = [],
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);
  const selectedOption = options.find((option) => option.value === value) || options[0];

  useEffect(() => {
    if (!isOpen) return undefined;

    const handleOutsidePointer = (event) => {
      if (!containerRef.current?.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsidePointer);
    document.addEventListener('touchstart', handleOutsidePointer, { passive: true });

    return () => {
      document.removeEventListener('mousedown', handleOutsidePointer);
      document.removeEventListener('touchstart', handleOutsidePointer);
    };
  }, [isOpen]);

  return (
    <div className={`single-select ${className}`.trim()} ref={containerRef}>
      {label ? <label htmlFor={id} className="single-select__label">{label}</label> : null}
      <div className="single-select__control-wrap">
        <button
          id={id}
          type="button"
          className="single-select__control single-select__trigger"
          aria-haspopup="listbox"
          aria-label={ariaLabel || label || 'Selecionar'}
          aria-expanded={isOpen}
          onClick={() => setIsOpen((prev) => !prev)}
        >
          <span className="single-select__value">{selectedOption?.label || 'Selecionar'}</span>
          <AppIcon name={isOpen ? 'chevron-up' : 'chevron-down'} size={14} className="single-select__icon" />
        </button>

        {isOpen ? (
          <div className="selector-window" role="listbox" aria-label={label || 'Selecionar opção'}>
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                className={`selector-window__option ${option.value === value ? 'is-active' : ''}`}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
              >
                {option.label}
              </button>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
};

const HeaderActionButton = ({
  label,
  icon,
  onClick,
  tone = 'new',
  ariaLabel
}) => (
  <button
    className={`btn btn--primary btn--header btn--header-${tone} inline-flex items-center gap-2`}
    onClick={onClick}
    aria-label={ariaLabel || label}
  >
    <AppIcon name={icon} size={14} className="btn-icon" />
    {label}
  </button>
);

const AddRecordButton = ({
  onClick,
  label = 'Novo registro',
  ariaLabel = 'Cadastrar novo registro'
}) => (
  <HeaderActionButton
    label={label}
    icon="edit"
    tone="new"
    ariaLabel={ariaLabel}
    onClick={onClick}
  />
);

const SearchToggleButton = ({ isOpen, onClick }) => (
  <HeaderActionButton
    label={isOpen ? 'Ocultar busca' : 'Pesquisar'}
    icon="search"
    tone="search"
    ariaLabel="Mostrar ou ocultar busca"
    onClick={onClick}
  />
);

const MultiToggleButton = ({ isActive, onClick }) => (
  <HeaderActionButton
    label={isActive ? 'Sair multi' : 'Modo multi'}
    icon="multi"
    tone="multi"
    ariaLabel="Ativar ou desativar modo multi"
    onClick={onClick}
  />
);

const SortToggleButton = ({ onClick }) => (
  <HeaderActionButton
    label="Ordenação"
    icon="filter"
    tone="settings"
    ariaLabel="Abrir nível de ordenação"
    onClick={onClick}
  />
);

const BioHeader = ({
  icon,
  title,
  subtitle,
  actions = [],
  navigation
}) => (
  <header className="bio-header" role="banner">
    <div className="bio-header__top">
      <div className="bio-header__title-wrap">
        <span className="bio-header__icon">
          <AppIcon name={icon} size={18} />
        </span>
        <div className="bio-header__heading">
          <h2 className="bio-header__title">{title}</h2>
          {subtitle ? <p className="bio-header__subtitle">{subtitle}</p> : null}
        </div>
      </div>
    </div>
    {(navigation || actions.length > 0) ? (
      <div className="bio-header__bottom">
        {actions.length > 0 ? (
          <div className={`bio-header__actions ${actions.length > 2 ? 'bio-header__actions--grid' : ''}`}>
            {actions.map((action) => (
              <button
                key={action.key}
                className={`btn btn--ghost bio-header__action ${actions.length > 2 ? 'bio-header__action--grid' : ''} modal-action-btn modal-action-btn--${action.tone || 'neutral'}`}
                onClick={action.onClick}
                aria-label={action.ariaLabel || action.label}
              >
                <AppIcon name={action.icon} size={18} className="btn-icon" />
                <span className="btn-label">{action.label}</span>
              </button>
            ))}
          </div>
        ) : null}
        {navigation ? <div className="bio-header__nav">{navigation}</div> : null}
      </div>
    ) : null}
  </header>
);


const CSV_PATH = './backend/supabase/sample-data';

const parseLatestReleaseFromChangelog = (markdownText) => {
  const normalizedText = String(markdownText || '');
  const releaseMatch = normalizedText.match(/^##\s+v(\d+\.\d+\.\d+)\s*-\s*(\d{4}-\d{2}-\d{2})/m);

  if (!releaseMatch) {
    return {
      version: APP_VERSION_FALLBACK,
      date: '',
      notes: []
    };
  }

  const [, version, date] = releaseMatch;
  const releaseStart = releaseMatch.index ?? 0;
  const releaseBody = normalizedText.slice(releaseStart).split('\n## ')[0];
  const notes = Array.from(releaseBody.matchAll(/^- (.+)$/gm)).map((item) => item[1]).slice(0, 3);

  return { version, date, notes };
};

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
  onSubmit,
  onStartEdit,
  onCancelEdit,
  onSaveEdit
}) => {
  if (!isOpen) return null;
  const isCreateMode = mode === 'create';
  const currentTab = PATIENT_FORM_TABS.find((tab) => tab.id === activeTab);
  const canEditView = !isCreateMode && isEditingView;
  const modalHeaderActions = [
    ...(!isCreateMode && !isEditingView
      ? [{ key: 'enable-edit', tone: 'info', icon: 'edit', label: 'Habilitar edição', onClick: onStartEdit }]
      : []),
    ...(!isCreateMode && isEditingView
      ? [
        { key: 'cancel-edit', tone: 'neutral', icon: 'close', label: 'Cancelar', onClick: onCancelEdit },
        { key: 'save-edit', tone: 'success', icon: 'check', label: 'Salvar', onClick: onSaveEdit }
      ]
      : []),
    ...(isCreateMode
      ? [{ key: 'save-patient', tone: 'success', icon: 'check', label: 'Salvar paciente', onClick: onSubmit }]
      : []),
    ...(!isEditingView
      ? [{ key: 'close-modal', tone: 'danger', icon: 'close', label: 'Fechar', onClick: onClose, ariaLabel: 'Fechar janela' }]
      : [])
  ];

  return (
    <div className="modal-wrap">
      <div className="modal-backdrop" onClick={onClose}></div>
      <div className="modal-card modal-card--wide">
        <div className="bio-header-shell">
          <BioHeader
            icon="users"
            title={isCreateMode ? 'Novo paciente' : (patient?.name || 'Prontuário')}
            subtitle="Cadastro de paciente"
            actions={modalHeaderActions}
            navigation={(
              <div className="bio-steps" aria-label="Etapas do formulário de paciente">
                {PATIENT_FORM_TABS.map((tab) => (
                  <span key={tab.id} className={`bio-step ${tab.id === activeTab ? 'is-active' : ''}`}>
                    {tab.label}
                  </span>
                ))}
              </div>
            )}
          />
        </div>
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
            <button className="btn btn--mobile-tab n2-mobile-nav__btn n2-mobile-nav__btn--prev" onClick={onPreviousTab}>
              <AppIcon name="chevron-left" size={16} className="btn-icon" />
              <span className="btn-label">Etapa anterior</span>
            </button>
            <button className="btn btn--mobile-tab n2-mobile-nav__btn n2-mobile-nav__btn--next" onClick={onNextTab}>
              <AppIcon name="chevron-right" size={16} className="btn-icon" />
              <span className="btn-label">Próxima etapa</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const AccountN2Modal = ({
  isOpen,
  title,
  subtitle,
  onClose,
  onSave,
  isSaving,
  children
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-wrap">
      <div className="modal-backdrop" onClick={onClose}></div>
      <div className="modal-card modal-card--wide">
        <div className="modal-header">
          <div>
            <h3 className="text-xl font-bold text-slate-900">{title}</h3>
            {subtitle ? <p className="modal-step-label">{subtitle}</p> : null}
          </div>
          <div className="modal-header__actions">
            <button className="btn btn--ghost modal-header__btn modal-action-btn modal-action-btn--neutral" onClick={onClose}>
              <AppIcon name="close" size={13} className="btn-icon" />
              <span className="btn-label">Cancelar</span>
            </button>
            <button className="btn btn--ghost modal-header__btn modal-action-btn modal-action-btn--success" onClick={onSave} disabled={isSaving}>
              <AppIcon name="check" size={13} className="btn-icon" />
              <span className="btn-label">{isSaving ? 'Salvando...' : 'Salvar'}</span>
            </button>
          </div>
        </div>
        <div className="modal-body">
          <div className="modal-grid">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

const PublicProfileN2Modal = ({
  isOpen,
  onClose,
  onSave,
  isSaving,
  draft,
  onChange
}) => {
  const [activeTab, setActiveTab] = useState('primary');

  useEffect(() => {
    if (isOpen) setActiveTab('primary');
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="modal-wrap">
      <div className="modal-backdrop" onClick={onClose}></div>
      <div className="modal-card modal-card--wide">
        <div className="modal-header">
          <div>
            <h3 className="text-xl font-bold text-slate-900">Editar perfil público</h3>
            <p className="modal-step-label">Dados salvos em public.odf_users</p>
          </div>
          <div className="modal-header__actions">
            <button className="btn btn--ghost modal-header__btn modal-action-btn modal-action-btn--neutral" onClick={onClose}>
              <AppIcon name="close" size={13} className="btn-icon" />
              <span className="btn-label">Cancelar</span>
            </button>
            <button className="btn btn--ghost modal-header__btn modal-action-btn modal-action-btn--success" onClick={onSave} disabled={isSaving}>
              <AppIcon name="check" size={13} className="btn-icon" />
              <span className="btn-label">{isSaving ? 'Salvando...' : 'Salvar'}</span>
            </button>
          </div>
        </div>
        <div className="modal-body space-y-4">
          <div className="bio-steps" aria-label="Abas do perfil público">
            <button type="button" className={`bio-step ${activeTab === 'primary' ? 'is-active' : ''}`} onClick={() => setActiveTab('primary')}>
              1. Dados primários
            </button>
            <button type="button" className={`bio-step ${activeTab === 'complementary' ? 'is-active' : ''}`} onClick={() => setActiveTab('complementary')}>
              2. Complementar
            </button>
          </div>

          {activeTab === 'primary' ? (
            <div className="modal-grid">
              <label className="form-field">
                <span>Nome</span>
                <input type="text" className="form-input" value={draft.full_name} onChange={(event) => onChange('full_name', event.target.value)} placeholder="Nome completo" />
              </label>
              <label className="form-field">
                <span>E-mail</span>
                <input type="email" className="form-input" value={draft.email} onChange={(event) => onChange('email', event.target.value)} placeholder="nome@email.com" />
              </label>
              <label className="form-field">
                <span>Telefone</span>
                <input type="text" className="form-input" value={draft.phone} onChange={(event) => onChange('phone', event.target.value)} placeholder="(00) 00000-0000" />
              </label>
            </div>
          ) : (
            <div className="modal-grid">
              <label className="form-field form-field--full">
                <span>Endereço</span>
                <input type="text" className="form-input" value={draft.address} onChange={(event) => onChange('address', event.target.value)} placeholder="Rua, número, bairro, cidade/UF" />
              </label>
              <label className="form-field">
                <span>Data de nascimento</span>
                <input type="date" className="form-input" value={draft.birth_date || ''} onChange={(event) => onChange('birth_date', event.target.value)} />
              </label>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const ClinicN2Modal = ({
  isOpen,
  clinics,
  selectedClinicId,
  draft,
  onSelectClinic,
  onChange,
  onCreateNew,
  onSave,
  onClose,
  isSaving
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-wrap">
      <div className="modal-backdrop" onClick={onClose}></div>
      <div className="modal-card modal-card--wide">
        <div className="modal-header">
          <div>
            <h3 className="text-xl font-bold text-slate-900">Clínicas do usuário</h3>
            <p className="modal-step-label">Selecione uma clínica para editar ou crie uma nova.</p>
          </div>
          <div className="modal-header__actions">
            <button className="btn btn--ghost modal-header__btn modal-action-btn modal-action-btn--info" onClick={onCreateNew}>
              <AppIcon name="edit" size={13} className="btn-icon" />
              <span className="btn-label">Nova clínica</span>
            </button>
            <button className="btn btn--ghost modal-header__btn modal-action-btn modal-action-btn--neutral" onClick={onClose}>
              <AppIcon name="close" size={13} className="btn-icon" />
              <span className="btn-label">Cancelar</span>
            </button>
            <button className="btn btn--ghost modal-header__btn modal-action-btn modal-action-btn--success" onClick={onSave} disabled={isSaving}>
              <AppIcon name="check" size={13} className="btn-icon" />
              <span className="btn-label">{isSaving ? 'Salvando...' : 'Salvar clínica'}</span>
            </button>
          </div>
        </div>
        <div className="modal-body space-y-4">
          <label className="form-field">
            <span>Clínica selecionada</span>
            <select className="form-input" value={selectedClinicId || ''} onChange={(event) => onSelectClinic(event.target.value)}>
              {clinics.map((clinic) => (
                <option key={clinic.id} value={clinic.id}>{clinic.trade_name}</option>
              ))}
              {!selectedClinicId && <option value="">Nova clínica</option>}
            </select>
          </label>

          <div className="modal-grid">
            <label className="form-field">
              <span>Nome fantasia</span>
              <input className="form-input" value={draft.trade_name} onChange={(event) => onChange('trade_name', event.target.value)} placeholder="Minha Clínica" />
            </label>
            <label className="form-field">
              <span>Razão social</span>
              <input className="form-input" value={draft.legal_name} onChange={(event) => onChange('legal_name', event.target.value)} />
            </label>
            <label className="form-field">
              <span>Documento</span>
              <input className="form-input" value={draft.document_number} onChange={(event) => onChange('document_number', event.target.value)} placeholder="CNPJ" />
            </label>
            <label className="form-field">
              <span>Email</span>
              <input className="form-input" type="email" value={draft.email} onChange={(event) => onChange('email', event.target.value)} />
            </label>
            <label className="form-field">
              <span>Telefone</span>
              <input className="form-input" value={draft.phone} onChange={(event) => onChange('phone', event.target.value)} />
            </label>
            <label className="form-field">
              <span>Cidade</span>
              <input className="form-input" value={draft.city} onChange={(event) => onChange('city', event.target.value)} />
            </label>
            <label className="form-field">
              <span>UF</span>
              <input className="form-input" value={draft.state} onChange={(event) => onChange('state', event.target.value.toUpperCase().slice(0, 2))} />
            </label>
            <label className="form-field">
              <span>Status</span>
              <select className="form-input" value={draft.status} onChange={(event) => onChange('status', event.target.value)}>
                <option value="trial">trial</option>
                <option value="active">active</option>
                <option value="suspended">suspended</option>
                <option value="archived">archived</option>
              </select>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
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

const readStoredPatientsSearchVisibility = () => {
  try {
    return localStorage.getItem(PATIENTS_SEARCH_VISIBILITY_KEY) === '1';
  } catch {
    return false;
  }
};

function DashboardApp({
  authEmail = '',
  authUser = null,
  accountService
}) {
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
  const [isPatientsSearchVisible, setIsPatientsSearchVisible] = useState(() => readStoredPatientsSearchVisibility());
  const [isPatientsMultiMode, setIsPatientsMultiMode] = useState(false);
  const [selectedPatientIds, setSelectedPatientIds] = useState([]);
  const [patientsSort, setPatientsSort] = useState('name-asc');
  const [isPatientsSortLevelOpen, setIsPatientsSortLevelOpen] = useState(false);
  const [patientsPage, setPatientsPage] = useState(1);
  const [appointmentsQuery, setAppointmentsQuery] = useState('');
  const [appointmentsPage, setAppointmentsPage] = useState(1);
  const [showPatientHint, setShowPatientHint] = useState(false);
  const [patientModalMode, setPatientModalMode] = useState('view');
  const [patientFormTab, setPatientFormTab] = useState(PATIENT_FORM_TABS[0].id);
  const [newPatientForm, setNewPatientForm] = useState(() => createEmptyPatientForm());
  const [patientViewForm, setPatientViewForm] = useState(() => createEmptyPatientForm());
  const [isPatientViewEditing, setIsPatientViewEditing] = useState(false);
  const [formFeedback, setFormFeedback] = useState('');
  const [authUserWidget, setAuthUserWidget] = useState(authUser);
  const [authActionStatus, setAuthActionStatus] = useState('idle');
  const [authActionMessage, setAuthActionMessage] = useState('');
  const [accountEmailDraft, setAccountEmailDraft] = useState(authUser?.email || '');
  const [accountPasswordDraft, setAccountPasswordDraft] = useState('');
  const [isAccountEditN2Open, setIsAccountEditN2Open] = useState(false);
  const [publicProfileDraft, setPublicProfileDraft] = useState({
    full_name: '',
    email: '',
    phone: '',
    address: '',
    birth_date: ''
  });
  const [isPublicProfileN2Open, setIsPublicProfileN2Open] = useState(false);
  const [profileActionStatus, setProfileActionStatus] = useState('idle');
  const [profileActionMessage, setProfileActionMessage] = useState('');
  const [clinics, setClinics] = useState([]);
  const [selectedClinicId, setSelectedClinicId] = useState('');
  const [clinicDraft, setClinicDraft] = useState({
    id: '',
    trade_name: '',
    legal_name: '',
    document_number: '',
    email: '',
    phone: '',
    city: '',
    state: '',
    timezone: 'America/Sao_Paulo',
    status: 'trial'
  });
  const [isClinicN2Open, setIsClinicN2Open] = useState(false);
  const [clinicActionStatus, setClinicActionStatus] = useState('idle');
  const [clinicActionMessage, setClinicActionMessage] = useState('');
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
  const [releaseInfo, setReleaseInfo] = useState({
    version: APP_VERSION_FALLBACK,
    date: '',
    notes: []
  });
  const patientsInfiniteTriggerRef = useRef(null);
  const appointmentsInfiniteTriggerRef = useRef(null);
  const quickLinksCarouselRef = useRef(null);
  const quickLinksSnapTimeoutRef = useRef(null);

  const formatDateTime = (value) => {
    if (!value) return '-';
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return '-';
    return parsed.toLocaleString('pt-BR');
  };

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

  const handleQuickLinksSnapScroll = () => {
    const track = quickLinksCarouselRef.current;
    if (!track) return;

    if (quickLinksSnapTimeoutRef.current) {
      clearTimeout(quickLinksSnapTimeoutRef.current);
    }

    quickLinksSnapTimeoutRef.current = setTimeout(() => {
      const buttons = Array.from(track.querySelectorAll('.quick-links-btn'));
      if (!buttons.length) return;

      const viewportLeft = track.scrollLeft;
      const viewportRight = viewportLeft + track.clientWidth;

      let target = buttons.find((button) => {
        const left = button.offsetLeft;
        const right = left + button.offsetWidth;
        return left >= viewportLeft && right <= viewportRight;
      });

      if (!target) {
        target = buttons.find((button) => (button.offsetLeft + button.offsetWidth) > viewportLeft) || buttons[buttons.length - 1];
      }

      if (!target) return;
      track.scrollTo({ left: target.offsetLeft, behavior: 'smooth' });
    }, 120);
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

  const parseDatePtBr = (value) => {
    const match = String(value || '').match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (!match) return null;
    const [, dd, mm, yyyy] = match;
    return new Date(`${yyyy}-${mm}-${dd}T00:00:00`);
  };

  const refreshAuthWidget = async () => {
    if (!accountService?.getAuthUser) return;
    const user = await accountService.getAuthUser();
    setAuthUserWidget(user || null);
    if (user?.email) {
      setAccountEmailDraft(user.email);
    }
  };

  const openAccountEditN2 = () => {
    setAccountEmailDraft(authUserWidget?.email || authEmail || '');
    setAccountPasswordDraft('');
    setIsAccountEditN2Open(true);
  };

  const openPublicProfileEditN2 = () => {
    setIsPublicProfileN2Open(true);
  };

  const toClinicDraft = (clinic) => ({
    id: clinic?.id || '',
    trade_name: clinic?.trade_name || '',
    legal_name: clinic?.legal_name || '',
    document_number: clinic?.document_number || '',
    email: clinic?.email || '',
    phone: clinic?.phone || '',
    city: clinic?.city || '',
    state: clinic?.state || '',
    timezone: clinic?.timezone || 'America/Sao_Paulo',
    status: clinic?.status || 'trial'
  });

  const handleAccountUpdate = async () => {
    if (!accountService?.updateAuthUser) return;

    const payload = {};
    if (accountEmailDraft.trim() && accountEmailDraft.trim() !== (authUserWidget?.email || '')) {
      payload.email = accountEmailDraft.trim();
    }
    if (accountPasswordDraft.trim()) {
      payload.password = accountPasswordDraft.trim();
    }

    if (!payload.email && !payload.password) {
      setAuthActionStatus('error');
      setAuthActionMessage('Informe um novo e-mail ou senha para atualizar.');
      return;
    }

    setAuthActionStatus('loading');
    setAuthActionMessage('Atualizando credenciais da conta...');
    try {
      await accountService.updateAuthUser(payload);
      await refreshAuthWidget();
      setAccountPasswordDraft('');
      setIsAccountEditN2Open(false);
      setAuthActionStatus('success');
      setAuthActionMessage('Conta atualizada com sucesso via Supabase Auth.');
    } catch (error) {
      setAuthActionStatus('error');
      setAuthActionMessage(error?.message || 'Não foi possível atualizar a conta.');
    }
  };

  const handleDeleteAccount = async () => {
    if (!accountService?.deleteAuthUser || !authUserWidget?.id) return;
    const confirmed = window.confirm('Tem certeza que deseja excluir sua conta? Esta ação não pode ser desfeita.');
    if (!confirmed) return;

    setAuthActionStatus('loading');
    setAuthActionMessage('Solicitando exclusão da conta no Supabase Auth...');
    try {
      await accountService.deleteAuthUser(authUserWidget.id);
      if (accountService?.signOut) {
        await accountService.signOut();
      }
      setAuthActionStatus('success');
      setAuthActionMessage('Conta excluída com sucesso.');
    } catch (error) {
      setAuthActionStatus('error');
      setAuthActionMessage(error?.message || 'Não foi possível excluir a conta.');
    }
  };

  const refreshPublicProfile = async (userId) => {
    if (!accountService?.loadPublicProfile || !userId) return;
    const profile = await accountService.loadPublicProfile(userId);
    setPublicProfileDraft({
      full_name: profile?.full_name || '',
      email: profile?.email || authUserWidget?.email || authEmail || '',
      phone: profile?.phone || '',
      address: profile?.address || '',
      birth_date: profile?.birth_date || ''
    });
  };

  const handleSavePublicProfile = async () => {
    if (!accountService?.savePublicProfile || !authUserWidget?.id) return;

    setProfileActionStatus('loading');
    setProfileActionMessage('Salvando perfil público...');
    try {
      const saved = await accountService.savePublicProfile({
        userId: authUserWidget.id,
        profile: publicProfileDraft
      });
      setPublicProfileDraft({
        full_name: saved?.full_name || '',
        email: saved?.email || '',
        phone: saved?.phone || '',
        address: saved?.address || '',
        birth_date: saved?.birth_date || ''
      });
      setProfileActionStatus('success');
      setProfileActionMessage('Perfil público salvo com sucesso.');
      setIsPublicProfileN2Open(false);
    } catch (error) {
      setProfileActionStatus('error');
      setProfileActionMessage(error?.message || 'Não foi possível salvar o perfil público.');
    }
  };

  const refreshClinics = async (userId) => {
    if (!accountService?.loadClinics || !userId) return;
    const data = await accountService.loadClinics(userId);
    setClinics(data || []);
    if (data?.length) {
      const defaultClinic = data[0];
      setSelectedClinicId(defaultClinic.id);
      setClinicDraft(toClinicDraft(defaultClinic));
    }
  };

  const handleOpenClinicN2 = async () => {
    setIsClinicN2Open(true);
    try {
      await refreshClinics(authUserWidget?.id);
    } catch (error) {
      setClinicActionStatus('error');
      setClinicActionMessage(error?.message || 'Não foi possível carregar clínicas.');
    }
  };

  const handleSelectClinic = (clinicId) => {
    setSelectedClinicId(clinicId);
    const clinic = clinics.find((item) => item.id === clinicId);
    if (clinic) {
      setClinicDraft(toClinicDraft(clinic));
    }
  };

  const handleCreateNewClinic = () => {
    setSelectedClinicId('');
    setClinicDraft(toClinicDraft(null));
  };

  const handleSaveClinic = async () => {
    if (!accountService?.saveClinic || !authUserWidget?.id) return;
    if (!clinicDraft.trade_name.trim()) {
      setClinicActionStatus('error');
      setClinicActionMessage('Informe ao menos o nome fantasia da clínica.');
      return;
    }

    setClinicActionStatus('loading');
    setClinicActionMessage('Salvando clínica...');
    try {
      await accountService.saveClinic({
        userId: authUserWidget.id,
        clinic: clinicDraft
      });
      await refreshClinics(authUserWidget.id);
      setClinicActionStatus('success');
      setClinicActionMessage('Clínica salva com sucesso.');
      setIsClinicN2Open(false);
    } catch (error) {
      setClinicActionStatus('error');
      setClinicActionMessage(error?.message || 'Não foi possível salvar clínica.');
    }
  };

  const filteredPatients = filterBySearchTerm(patients, patientsQuery);
  const activePatients = filteredPatients.filter((patient) => !patient.archivedAt);
  const sortedPatients = [...activePatients].sort((a, b) => {
    switch (patientsSort) {
      case 'name-desc':
        return b.name.localeCompare(a.name, 'pt-BR');
      case 'phone-asc':
        return String(a.phone || '').localeCompare(String(b.phone || ''), 'pt-BR');
      case 'lastVisit-desc': {
        const aTime = parseDatePtBr(a.lastVisit)?.getTime() || 0;
        const bTime = parseDatePtBr(b.lastVisit)?.getTime() || 0;
        return bTime - aTime;
      }
      case 'lastVisit-asc': {
        const aTime = parseDatePtBr(a.lastVisit)?.getTime() || 0;
        const bTime = parseDatePtBr(b.lastVisit)?.getTime() || 0;
        return aTime - bTime;
      }
      case 'birth-desc': {
        const aTime = parseDatePtBr(a.birth)?.getTime() || 0;
        const bTime = parseDatePtBr(b.birth)?.getTime() || 0;
        return bTime - aTime;
      }
      case 'birth-asc': {
        const aTime = parseDatePtBr(a.birth)?.getTime() || 0;
        const bTime = parseDatePtBr(b.birth)?.getTime() || 0;
        return aTime - bTime;
      }
      case 'plan-asc':
        return String(a.plan || '').localeCompare(String(b.plan || ''), 'pt-BR');
      case 'name-asc':
      default:
        return a.name.localeCompare(b.name, 'pt-BR');
    }
  });
  const patientsPageSize = isMobileViewport ? MOBILE_PAGE_SIZE_PATIENTS : PAGE_SIZE_PATIENTS;
  const patientsPagination = paginateRecords(sortedPatients, patientsPage, patientsPageSize);
  const visiblePatients = isMobileViewport
    ? sortedPatients.slice(0, patientsPagination.page * patientsPageSize)
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
  }, [patientsQuery, patientsSort]);

  useEffect(() => {
    localStorage.setItem(PATIENTS_SEARCH_VISIBILITY_KEY, isPatientsSearchVisible ? '1' : '0');
  }, [isPatientsSearchVisible]);

  useEffect(() => {
    setAppointmentsPage(1);
  }, [appointmentsQuery]);

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
    setAuthUserWidget(authUser || null);
    setAccountEmailDraft(authUser?.email || '');
  }, [authUser]);

  useEffect(() => {
    let active = true;

    const hydrateAuthUser = async () => {
      if (!accountService?.getAuthUser) return;
      try {
        const user = await accountService.getAuthUser();
        if (!active) return;
        setAuthUserWidget(user || null);
        if (user?.email) {
          setAccountEmailDraft(user.email);
          setPublicProfileDraft((prev) => ({ ...prev, email: prev.email || user.email }));
        }
        await refreshPublicProfile(user?.id);
        await refreshClinics(user?.id);
      } catch (error) {
        if (!active) return;
        setAuthActionStatus('error');
        setAuthActionMessage(error?.message || 'Não foi possível carregar dados da conta.');
      }
    };

    hydrateAuthUser();
    return () => {
      active = false;
    };
  }, [accountService]);

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
  }, [activeTab, isMobileViewport, patientsPagination.totalPages, activePatients.length]);

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

  useEffect(() => {
    let active = true;

    const loadReleaseInfo = async () => {
      try {
        const response = await fetch(CHANGELOG_PATH, { cache: 'no-store' });
        if (!response.ok) throw new Error('changelog-unavailable');
        const markdown = await response.text();
        if (!active) return;
        setReleaseInfo(parseLatestReleaseFromChangelog(markdown));
      } catch {
        if (!active) return;
        setReleaseInfo({
          version: APP_VERSION_FALLBACK,
          date: '',
          notes: []
        });
      }
    };

    loadReleaseInfo();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => () => {
    if (quickLinksSnapTimeoutRef.current) {
      clearTimeout(quickLinksSnapTimeoutRef.current);
    }
  }, []);

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
        <div className="flex flex-col items-center gap-4">
          <button
            onClick={() => setView('dashboard')}
            className="btn btn--primary btn--lg landing-cta"
          >
            Acessar Unidade
          </button>
          <span
            className="inline-flex items-center rounded-full border border-slate-300 bg-white px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.18em] text-slate-600"
            aria-label={`Versão V${releaseInfo.version}`}
          >
            V{releaseInfo.version}
          </span>
          {releaseInfo.date ? (
            <p className="text-[10px] font-semibold text-slate-400">
              Atualizado em {releaseInfo.date}
            </p>
          ) : null}
        </div>
      </div>
    );
  }

  const renderContent = () => {
    const quickLinksCatalog = {
      overview: {
        key: 'overview',
        icon: 'home',
        tone: 'overview',
        label: 'Painel',
        ariaLabel: 'Ir para painel inicial',
        onClick: () => setActiveTab('overview')
      },
      'agenda-hoje': {
        key: 'agenda-hoje',
        icon: 'calendar',
        tone: 'agenda',
        label: 'Agenda',
        ariaLabel: 'Ir para agenda de hoje',
        onClick: () => {
          setActiveTab('overview');
          setAppointmentsQuery('');
        }
      },
      patients: {
        key: 'patients',
        icon: 'users',
        tone: 'patients',
        label: 'Pacientes',
        ariaLabel: 'Abrir base de pacientes',
        onClick: () => setActiveTab('patients')
      },
      'new-patient': {
        key: 'new-patient',
        icon: 'edit',
        tone: 'new',
        label: 'Novo',
        ariaLabel: 'Cadastrar novo paciente',
        onClick: () => {
          setActiveTab('patients');
          openCreatePatientN2();
        }
      },
      'patients-search': {
        key: 'patients-search',
        icon: 'search',
        tone: 'search',
        label: 'Pesquisar',
        ariaLabel: 'Mostrar ou ocultar seção de pesquisa de pacientes',
        onClick: () => setIsPatientsSearchVisible((prev) => !prev)
      },
      'patients-multi': {
        key: 'patients-multi',
        icon: 'multi',
        tone: 'multi',
        label: 'Modo multi',
        ariaLabel: 'Ativar ou desativar seleção múltipla de pacientes',
        onClick: () => {
          setIsPatientsMultiMode((prev) => {
            if (prev) setSelectedPatientIds([]);
            return !prev;
          });
        }
      },
      'patients-sort': {
        key: 'patients-sort',
        icon: 'filter',
        tone: 'settings',
        label: 'Ordenação',
        ariaLabel: 'Abrir nível de ordenação',
        onClick: () => setIsPatientsSortLevelOpen(true)
      },
      settings: {
        key: 'settings',
        icon: 'settings',
        tone: 'settings',
        label: 'Config',
        ariaLabel: 'Abrir configurações',
        onClick: () => setActiveTab('settings')
      }
    };

    const levelQuickLinksMap = {
      overview: {
        level: 0,
        previous: null,
        next: ['agenda-hoje', 'patients', 'settings']
      },
      patients: {
        level: 1,
        previous: 'overview',
        next: ['new-patient', 'patients-search', 'patients-sort', 'patients-multi']
      },
      settings: {
        level: 1,
        previous: 'overview',
        next: []
      }
    };

    const quickLinksConfig = levelQuickLinksMap[activeTab] || levelQuickLinksMap.overview;
    const quickLinksOrder = [
      ...(quickLinksConfig.level > 0 && quickLinksConfig.previous ? [quickLinksConfig.previous] : []),
      ...quickLinksConfig.next
    ];
    const currentQuickLinks = quickLinksOrder
      .map((key) => quickLinksCatalog[key])
      .filter(Boolean);

    const contextHeaderActions = [];

    const quickLinksNavigation = (
      <div className="quick-links-shell">
        <div
          ref={quickLinksCarouselRef}
          className="quick-links-carousel"
          onScroll={handleQuickLinksSnapScroll}
        >
          {currentQuickLinks.map((link) => (
            <button
              key={link.key}
              className={`quick-links-btn quick-links-btn--${link.tone}`}
              onClick={link.onClick}
              aria-label={link.ariaLabel}
            >
              <AppIcon name={link.icon} size={14} />
              <span>{link.label}</span>
            </button>
          ))}
        </div>
      </div>
    );

    const renderN1Header = ({ icon, title, subtitle, actions = contextHeaderActions, navigation = quickLinksNavigation }) => (
      isMobileViewport ? (
        <BioHeader
          icon={icon}
          title={title}
          subtitle={subtitle}
          actions={actions}
          navigation={null}
        />
      ) : null
    );

    if (activeTab === 'overview') {
      return (
        <div className="space-y-6">
          {renderN1Header({
            icon: 'home',
            title: 'Painel Diário',
            subtitle: 'Atendimento e indicadores da clínica',
            actions: []
          })}
          {!isMobileViewport && <h2 className="page-title">Painel Diário</h2>}
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
      return (
        <div className="space-y-6 patients-sections">
          {renderN1Header({
            icon: 'users',
            title: 'Base de Pacientes',
            subtitle: 'Cadastro, busca e acesso ao Nível 2',
            actions: []
          })}
          <div className={`page-header ${isMobileViewport ? 'page-header--desktop-only' : ''}`}>
            <h2 className="page-title">Base de Pacientes</h2>
            <div className="flex gap-2 flex-wrap justify-end">
              <AddRecordButton
                label="Novo paciente"
                ariaLabel="Cadastrar novo paciente"
                onClick={openCreatePatientN2}
              />
              <SearchToggleButton
                isOpen={isPatientsSearchVisible}
                onClick={() => setIsPatientsSearchVisible((prev) => !prev)}
              />
              <SortToggleButton onClick={() => setIsPatientsSortLevelOpen(true)} />
              <MultiToggleButton
                isActive={isPatientsMultiMode}
                onClick={() => {
                  setIsPatientsMultiMode((prev) => {
                    if (prev) setSelectedPatientIds([]);
                    return !prev;
                  });
                }}
              />
            </div>
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
          {isPatientsSearchVisible ? (
            <div className="patients-search-section">
              <div className="search-row">
                <input
                  className="search-input search-input--compact"
                  placeholder="Pesquisar pacientes por qualquer campo (nome, telefone, plano, e-mail...)"
                  value={patientsQuery}
                  onChange={(e) => setPatientsQuery(e.target.value)}
                />
              </div>
              <p className="search-legend">{sortedPatients.length} registro(s) exibido(s)</p>
            </div>
          ) : null}
          {isPatientsSortLevelOpen ? (
            <div className="selector-level">
              <button className="selector-level__backdrop" type="button" aria-label="Fechar nível de filtro" onClick={() => setIsPatientsSortLevelOpen(false)} />
              <div className="selector-level__card">
                <div className="selector-level__header">
                  <p>Nível de ordenação</p>
                  <button className="btn btn--ghost" type="button" onClick={() => setIsPatientsSortLevelOpen(false)}>Fechar</button>
                </div>
                <div className="selector-level__body">
                  {[
                    { value: 'name-asc', label: 'Nome (A → Z)' },
                    { value: 'name-desc', label: 'Nome (Z → A)' },
                    { value: 'phone-asc', label: 'Telefone' },
                    { value: 'lastVisit-desc', label: 'Última visita (mais recente)' },
                    { value: 'lastVisit-asc', label: 'Última visita (mais antiga)' },
                    { value: 'birth-desc', label: 'Nascimento (mais recente)' },
                    { value: 'birth-asc', label: 'Nascimento (mais antigo)' },
                    { value: 'plan-asc', label: 'Plano (A → Z)' }
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      className={`selector-window__option ${option.value === patientsSort ? 'is-active' : ''}`}
                      onClick={() => {
                        setPatientsSort(option.value);
                        setIsPatientsSortLevelOpen(false);
                      }}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : null}
          {isPatientsMultiMode ? (
            <div className="bg-transparent rounded-2xl border border-slate-200/70 p-4 flex flex-wrap gap-2 items-center justify-between backdrop-blur-sm">
              <p className="text-xs font-black uppercase tracking-widest text-slate-500">
                {selectedPatientIds.length} selecionado(s)
              </p>
              <div className="flex gap-2">
                <button
                  className="btn btn--ghost"
                  onClick={() => {
                    const allVisibleIds = visiblePatients.map((item) => item.id);
                    const shouldClear = allVisibleIds.length > 0 && allVisibleIds.every((id) => selectedPatientIds.includes(id));
                    setSelectedPatientIds(shouldClear ? [] : allVisibleIds);
                  }}
                >
                  Selecionar todos
                </button>
                <button
                  className="btn btn--danger"
                  disabled={selectedPatientIds.length === 0}
                  onClick={() => {
                    const archiveAt = new Date().toISOString();
                    setPatients((prev) => prev.map((item) => (
                      selectedPatientIds.includes(item.id)
                        ? { ...item, archivedAt: archiveAt }
                        : item
                    )));
                    setSelectedPatientIds([]);
                    setIsPatientsMultiMode(false);
                  }}
                >
                  Arquivar selecionados
                </button>
              </div>
            </div>
          ) : null}
          <div className="patients-data-section">
            <div className="data-grid patients-grid">
            {visiblePatients.length === 0 ? (
              <p className="text-sm text-slate-500">Nenhum paciente encontrado para o termo pesquisado.</p>
            ) : (
              visiblePatients.map((p) => (
                <article key={p.id} className={`data-card data-card--m patient-card ${selectedPatientIds.includes(p.id) ? 'ring-2 ring-sky-200' : ''}`}>
                  <button
                    onClick={() => {
                      if (isPatientsMultiMode) {
                        setSelectedPatientIds((prev) => (
                          prev.includes(p.id)
                            ? prev.filter((id) => id !== p.id)
                            : [...prev, p.id]
                        ));
                        return;
                      }
                      openPatientN2(p);
                    }}
                    className="btn btn--icon patient-card__open"
                    aria-label={isPatientsMultiMode ? `Selecionar ${p.name}` : `Abrir prontuário de ${p.name}`}
                    title={isPatientsMultiMode ? 'Selecionar paciente' : 'Abrir prontuário N2'}
                  >
                    {isPatientsMultiMode
                      ? (selectedPatientIds.includes(p.id) ? '✓' : '○')
                      : <AppIcon name="expand" size={14} />}
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

    if (activeTab === 'account') {
      const provider = authUserWidget?.app_metadata?.provider || authUserWidget?.aud || '-';
      const providers = authUserWidget?.app_metadata?.providers?.join(', ') || provider;

      return (
        <div className="space-y-6">
          {renderN1Header({ icon: 'settings', title: 'Conta', subtitle: 'Auth Supabase e preferências pessoais' })}
          {!isMobileViewport && <h2 className="page-title">Conta</h2>}

          <div className="bg-white border data-card data-card--g space-y-4">
            <div className="flex flex-wrap gap-3 items-center justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-slate-500">Widget Auth (Supabase)</p>
                <p className="text-sm text-slate-500">Dados carregados via <code>supabase.auth.getUser()</code>.</p>
              </div>
              <button
                className="btn btn--ghost"
                onClick={async () => {
                  setAuthActionStatus('loading');
                  setAuthActionMessage('Atualizando dados da conta...');
                  try {
                    await refreshAuthWidget();
                    setAuthActionStatus('success');
                    setAuthActionMessage('Dados da conta atualizados.');
                  } catch (error) {
                    setAuthActionStatus('error');
                    setAuthActionMessage(error?.message || 'Não foi possível atualizar os dados da conta.');
                  }
                }}
              >
                Atualizar widget
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-3 text-sm">
              <div><strong>ID:</strong> <span className="break-all">{authUserWidget?.id || '-'}</span></div>
              <div><strong>E-mail:</strong> <span className="break-all">{authUserWidget?.email || authEmail || '-'}</span></div>
              <div><strong>Provedor:</strong> {providers}</div>
              <div><strong>Email confirmado:</strong> {formatDateTime(authUserWidget?.email_confirmed_at)}</div>
              <div><strong>Criado em:</strong> {formatDateTime(authUserWidget?.created_at)}</div>
              <div><strong>Último login:</strong> {formatDateTime(authUserWidget?.last_sign_in_at)}</div>
            </div>
          </div>

          <div className="bg-white border data-card data-card--g space-y-4">
            <p className="text-xs font-black uppercase tracking-widest text-slate-500">Editar conta (Supabase Auth API)</p>
            <div className="grid md:grid-cols-2 gap-3 text-sm">
              <div><strong>E-mail atual:</strong> <span className="break-all">{authUserWidget?.email || authEmail || '-'}</span></div>
              <div><strong>Senha:</strong> ********</div>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                className="btn btn--ghost modal-header__btn modal-action-btn modal-action-btn--info"
                onClick={openAccountEditN2}
                disabled={authActionStatus === 'loading'}
              >
                Editar (N2)
              </button>
              {accountService?.signOut ? (
                <button
                  className="btn btn--ghost modal-header__btn modal-action-btn modal-action-btn--neutral"
                  onClick={accountService.signOut}
                  disabled={authActionStatus === 'loading'}
                >
                  Desconectar
                </button>
              ) : null}
              {accountService?.deleteAuthUser ? (
                <button
                  className="btn btn--ghost modal-header__btn modal-action-btn modal-action-btn--danger"
                  onClick={handleDeleteAccount}
                  disabled={authActionStatus === 'loading'}
                >
                  Excluir conta
                </button>
              ) : null}
            </div>

            {authActionMessage ? (
              <p className={`text-xs ${authActionStatus === 'error' ? 'text-rose-600' : 'text-slate-600'}`}>
                {authActionMessage}
              </p>
            ) : null}
          </div>

          <div className="bg-white border data-card data-card--g space-y-4">
            <p className="text-xs font-black uppercase tracking-widest text-slate-500">Perfil público (tabela <code>public.odf_users</code>)</p>
            <div className="grid md:grid-cols-2 gap-3 text-sm">
              <div><strong>Nome:</strong> {publicProfileDraft.full_name || '-'}</div>
              <div><strong>E-mail:</strong> {publicProfileDraft.email || '-'}</div>
              <div><strong>Telefone:</strong> {publicProfileDraft.phone || '-'}</div>
              <div><strong>Endereço:</strong> {publicProfileDraft.address || '-'}</div>
              <div><strong>Data de nascimento:</strong> {publicProfileDraft.birth_date || '-'}</div>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                className="btn btn--ghost modal-header__btn modal-action-btn modal-action-btn--info"
                onClick={openPublicProfileEditN2}
                disabled={profileActionStatus === 'loading'}
              >
                Editar (N2)
              </button>
              <button
                className="btn btn--ghost modal-header__btn modal-action-btn modal-action-btn--neutral"
                onClick={() => refreshPublicProfile(authUserWidget?.id)}
                disabled={profileActionStatus === 'loading'}
              >
                Recarregar perfil
              </button>
            </div>

            {profileActionMessage ? (
              <p className={`text-xs ${profileActionStatus === 'error' ? 'text-rose-600' : 'text-slate-600'}`}>
                {profileActionMessage}
              </p>
            ) : null}
          </div>

          <div className="bg-white border data-card data-card--g space-y-4">
            <p className="text-xs font-black uppercase tracking-widest text-slate-500">Clínicas do proprietário (tabela <code>public.odf_clinics</code>)</p>
            {clinics.length === 0 ? (
              <p className="text-sm text-slate-500">Nenhuma clínica encontrada. Ao abrir o editor, uma clínica padrão será criada automaticamente.</p>
            ) : (
              <div className="space-y-2">
                {clinics.slice(0, 3).map((clinic) => (
                  <div key={clinic.id} className="text-sm text-slate-700 border border-slate-100 rounded-xl p-3">
                    <p><strong>{clinic.trade_name}</strong> · {clinic.status}</p>
                    <p>{clinic.city || '-'} / {clinic.state || '-'}</p>
                  </div>
                ))}
                {clinics.length > 3 ? (
                  <p className="text-xs text-slate-500">+{clinics.length - 3} clínica(s) adicional(is).</p>
                ) : null}
              </div>
            )}
            <div className="flex flex-wrap gap-2">
              <button
                className="btn btn--ghost modal-header__btn modal-action-btn modal-action-btn--info"
                onClick={handleOpenClinicN2}
                disabled={clinicActionStatus === 'loading'}
              >
                Editar clínicas (N2)
              </button>
            </div>
            {clinicActionMessage ? (
              <p className={`text-xs ${clinicActionStatus === 'error' ? 'text-rose-600' : 'text-slate-600'}`}>
                {clinicActionMessage}
              </p>
            ) : null}
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {renderN1Header({ icon: 'settings', title: 'Configurações', subtitle: 'Parâmetros e catálogo de procedimentos' })}
        {!isMobileViewport && <h2 className="page-title">Configurações</h2>}
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
      {isMobileViewport ? (
        <div className="mobile-profile-trigger">
          <button
            className="btn btn--ghost modal-header__btn modal-action-btn modal-action-btn--info"
            onClick={() => {
              setShowMobileNavDrawer(false);
              setShowPatientN2(false);
              setShowMobileNavDrawer(true);
            }}
            aria-label="Abrir navegação inteligente"
          >
            <AppIcon name="menu" size={13} className="btn-icon" />
            <span className="btn-label">Navegação</span>
          </button>
        </div>
      ) : null}
      <div className="app-frame">
        <aside className="app-sidebar">
          <div className="app-brand">Odonto<span>Flow</span></div>
          {authEmail ? (
            <div className="text-[11px] leading-snug text-slate-300 mb-3">
              <p className="font-semibold text-slate-200">Conectado</p>
              <p className="truncate">{authEmail}</p>
            </div>
          ) : null}
          <nav className="app-nav">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`btn btn--nav btn--nav--${tab.id} ${activeTab === tab.id ? 'is-active' : ''}`}
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

      <AccountN2Modal
        isOpen={isAccountEditN2Open}
        title="Editar conta"
        subtitle="Atualização de credenciais via Supabase Auth"
        onClose={() => setIsAccountEditN2Open(false)}
        onSave={handleAccountUpdate}
        isSaving={authActionStatus === 'loading'}
      >
        <label className="form-field">
          <span>Novo e-mail</span>
          <input
            type="email"
            className="form-input"
            value={accountEmailDraft}
            onChange={(event) => setAccountEmailDraft(event.target.value)}
            placeholder="novoemail@clinica.com"
          />
        </label>
        <label className="form-field">
          <span>Nova senha</span>
          <input
            type="password"
            className="form-input"
            value={accountPasswordDraft}
            onChange={(event) => setAccountPasswordDraft(event.target.value)}
            placeholder="********"
          />
        </label>
      </AccountN2Modal>

      <PublicProfileN2Modal
        isOpen={isPublicProfileN2Open}
        onClose={() => setIsPublicProfileN2Open(false)}
        onSave={handleSavePublicProfile}
        isSaving={profileActionStatus === 'loading'}
        draft={publicProfileDraft}
        onChange={(field, value) => setPublicProfileDraft((prev) => ({ ...prev, [field]: value }))}
      />

      <ClinicN2Modal
        isOpen={isClinicN2Open}
        clinics={clinics}
        selectedClinicId={selectedClinicId}
        draft={clinicDraft}
        onSelectClinic={handleSelectClinic}
        onChange={(field, value) => setClinicDraft((prev) => ({ ...prev, [field]: value }))}
        onCreateNew={handleCreateNewClinic}
        onSave={handleSaveClinic}
        onClose={() => setIsClinicN2Open(false)}
        isSaving={clinicActionStatus === 'loading'}
      />

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
        onSubmit={handleCreatePatientSubmit}
        onStartEdit={handleStartPatientEdit}
        onCancelEdit={handleCancelPatientEdit}
        onSaveEdit={handleSavePatientEdit}
      />
    </div>
  );
}

function AuthGateApp() {
  const [supabaseClient] = useState(() => createSupabaseBrowserClient());
  const [accountService] = useState(() => (supabaseClient ? createAccountService(supabaseClient) : null));
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authMessage, setAuthMessage] = useState('');
  const [authError, setAuthError] = useState('');
  const [showSupabaseConfigNotice, setShowSupabaseConfigNotice] = useState(true);

  useEffect(() => {
    if (!supabaseClient) {
      setLoading(false);
      return undefined;
    }

    let mounted = true;
    supabaseClient.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data?.session || null);
      setLoading(false);
    });

    const { data: listener } = supabaseClient.auth.onAuthStateChange((_event, currentSession) => {
      setSession(currentSession || null);
    });

    return () => {
      mounted = false;
      listener?.subscription?.unsubscribe();
    };
  }, [supabaseClient]);

  useEffect(() => {
    if (!authMessage && !authError) return undefined;
    const timer = setTimeout(() => {
      setAuthMessage('');
      setAuthError('');
    }, AUTH_NOTICE_TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, [authMessage, authError]);

  useEffect(() => {
    if (supabaseClient) {
      setShowSupabaseConfigNotice(false);
      return undefined;
    }

    setShowSupabaseConfigNotice(true);
    const timer = setTimeout(() => setShowSupabaseConfigNotice(false), SUPABASE_CONFIG_NOTICE_TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, [supabaseClient]);

  const submitCredentials = async (event) => {
    event.preventDefault();
    setAuthError('');
    setAuthMessage('');

    if (!supabaseClient) return;
    if (!email || !password) {
      setAuthError('Informe e-mail e senha para continuar.');
      return;
    }

    if (mode === 'signup') {
      const { error } = await supabaseClient.auth.signUp({ email, password });
      if (error) {
        setAuthError(error.message || 'Não foi possível criar sua conta.');
        return;
      }
      setAuthMessage('Conta criada. Verifique seu e-mail para confirmar o cadastro, se aplicável.');
      return;
    }

    const { error } = await supabaseClient.auth.signInWithPassword({ email, password });
    if (error) {
      setAuthError(error.message || 'Falha ao entrar com e-mail e senha.');
      return;
    }
    setAuthMessage('Login realizado com sucesso.');
  };

  const loginWithGoogle = async () => {
    setAuthError('');
    setAuthMessage('');
    if (!supabaseClient) return;

    const { error } = await supabaseClient.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin + window.location.pathname,
        queryParams: { prompt: 'select_account' }
      }
    });

    if (error) {
      setAuthError(error.message || 'Falha ao iniciar login com Google.');
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-slate-500">Carregando autenticação...</div>;
  }

  if (!supabaseClient) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="bg-white border border-slate-200 rounded-2xl shadow-xl p-8 w-full max-w-xl space-y-4">
          <h1 className="text-xl font-bold text-slate-900">Configuração do Supabase pendente</h1>
          <p className="text-sm text-slate-600">
            Configure as variáveis <strong>SUPABASE_URL</strong> e <strong>SUPABASE_ANON</strong> no Environment do GitHub Actions usado no deploy.
          </p>
          <TransientNotice
            visible={showSupabaseConfigNotice}
            tone="info"
            message="No deploy, o pipeline gera automaticamente o apps/web/env.js com essas variáveis antes da publicação."
            onClose={() => setShowSupabaseConfigNotice(false)}
          />
          <p className="text-xs text-slate-400">Assim o app habilita cadastro e login social com Google via Supabase Auth em produção.</p>
        </div>
      </div>
    );
  }

  if (!session?.user) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <div className="bg-white border border-slate-200 rounded-2xl shadow-xl p-8 w-full max-w-md space-y-4">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-sky-700 font-bold">Acesso seguro</p>
            <h1 className="text-2xl font-black text-slate-900">Entrar no OdontoFlow</h1>
            <p className="text-sm text-slate-600 mt-1">Crie sua conta e acesse quando quiser, inclusive com Google.</p>
          </div>

          <form onSubmit={submitCredentials} className="space-y-3">
            <input
              type="email"
              className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm"
              placeholder="seuemail@clinica.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
            <input
              type="password"
              className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm"
              placeholder="Sua senha"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
            <button type="submit" className="w-full bg-sky-700 hover:bg-sky-800 text-white rounded-xl px-3 py-2 text-sm font-bold">
              {mode === 'signup' ? 'Criar conta' : 'Entrar com e-mail'}
            </button>
          </form>

          <button type="button" onClick={loginWithGoogle} className="w-full bg-white border border-slate-300 hover:bg-slate-50 rounded-xl px-3 py-2 text-sm font-semibold">
            Continuar com Google
          </button>

          <button type="button" className="text-sm text-sky-700 font-semibold" onClick={() => setMode((prev) => (prev === 'signup' ? 'signin' : 'signup'))}>
            {mode === 'signup' ? 'Já tenho conta, quero entrar' : 'Não tenho conta, quero me cadastrar'}
          </button>

          <TransientNotice
            visible={Boolean(authMessage)}
            tone="success"
            message={authMessage}
            onClose={() => setAuthMessage('')}
          />
          <TransientNotice
            visible={Boolean(authError)}
            tone="error"
            message={authError}
            onClose={() => setAuthError('')}
          />
        </div>
      </div>
    );
  }

  return (
    <DashboardApp
      authEmail={session.user.email || ''}
      authUser={session.user}
      accountService={accountService}
    />
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<AuthGateApp />);
