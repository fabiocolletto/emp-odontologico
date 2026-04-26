const { useEffect, useMemo, useRef, useState } = React;
const STORAGE_KEY = 'odontoflow-ui-state-v1';
const NOTES_DRAFT_KEY = 'odontoflow-notes-draft-v1';
const FIRST_PATIENT_HINT_KEY = 'odontoflow-first-patient-hint-seen-v1';
const PAGE_SIZE_PATIENTS = 9;
const PAGE_SIZE_APPOINTMENTS = 6;
const MOBILE_PAGE_SIZE_PATIENTS = 5;
const PATIENTS_SEARCH_VISIBILITY_KEY = 'odontoflow-patients-search-visibility-v1';
const SUPABASE_STORAGE_KEY = 'odontoflow-supabase-auth';
const AUTH_NOTICE_TIMEOUT_MS = 5000;
const SUPABASE_CONFIG_NOTICE_TIMEOUT_MS = 9000;
const FINANCIAL_STORAGE_KEY = 'odontoflow-financial-launches-v1';
const FINANCIAL_ACCOUNTS_STORAGE_KEY = 'odontoflow-financial-accounts-v1';
const FINANCIAL_CATEGORIES_STORAGE_KEY = 'odontoflow-financial-categories-v1';
const FINANCIAL_RECURRING_STORAGE_KEY = 'odontoflow-financial-recurring-v1';
const FINANCIAL_FORECAST_STORAGE_KEY = 'odontoflow-financial-forecast-v1';

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

const NAV_PRIMARY = [
  { id: 'overview', label: 'Início', icon: 'home', tone: 'overview', group: 'Atendimento' },
  { id: 'agenda', label: 'Agenda', icon: 'calendar', tone: 'agenda', group: 'Atendimento' },
  { id: 'patients', label: 'Pacientes', icon: 'users', tone: 'patients', group: 'Cadastros' },
  { id: 'clinic', label: 'Clínica', icon: 'id-card', tone: 'account', group: 'Gestão' },
  { id: 'financial', label: 'Financeiro', icon: 'plan', tone: 'settings', group: 'Gestão' },
  { id: 'profile', label: 'Perfil', icon: 'id-card', tone: 'account', group: 'Gestão' }
];

const LEVEL1_TABS = NAV_PRIMARY.map(({ id, label, icon }) => ({ id, label, icon }));
const TAB_META = NAV_PRIMARY.reduce((acc, tab) => ({ ...acc, [tab.id]: tab }), {});

const AppIcon = ({ name, size = 14, className = '' }) => {
  const icons = {
    home: <path d="M3 10.5 12 3l9 7.5M6.5 9.8V21h11V9.8" />,
    users: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="3.2" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16.5 3.2a3.2 3.2 0 0 1 0 6.2" /></>,
    settings: <><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1 1 0 0 0 .2 1.1l.1.1a1.8 1.8 0 1 1-2.5 2.5l-.1-.1a1 1 0 0 0-1.1-.2 1 1 0 0 0-.6.9V20a1.8 1.8 0 1 1-3.6 0v-.1a1 1 0 0 0-.6-.9 1 1 0 0 0-1.1.2l-.1.1a1.8 1.8 0 1 1-2.5-2.5l.1-.1a1 1 0 0 0 .2-1.1 1 1 0 0 0-.9-.6H4a1.8 1.8 0 1 1 0-3.6h.1a1 1 0 0 0 .9-.6 1 1 0 0 0-.2-1.1l-.1-.1a1.8 1.8 0 1 1 2.5-2.5l.1.1a1 1 0 0 0 1.1.2h.2a1 1 0 0 0 .6-.9V4a1.8 1.8 0 1 1 3.6 0v.1a1 1 0 0 0 .6.9h.2a1 1 0 0 0 1.1-.2l.1-.1a1.8 1.8 0 1 1 2.5 2.5l-.1.1a1 1 0 0 0-.2 1.1v.2a1 1 0 0 0 .9.6H20a1.8 1.8 0 1 1 0 3.6h-.1a1 1 0 0 0-.9.6Z" /></>,
    'id-card': <><rect x="3" y="5" width="18" height="14" rx="2.5" /><circle cx="9" cy="11" r="2.2" /><path d="M6.3 15.2c.6-1.1 1.5-1.7 2.7-1.7 1.1 0 2.1.6 2.7 1.7M14.5 9h4M14.5 12h4M14.5 15h3" /></>,
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
    archive: <><rect x="3" y="4" width="18" height="5" rx="1.2" /><path d="M5.5 9.2V19a2 2 0 0 0 2 2h9a2 2 0 0 0 2-2V9.2" /><path d="M10 13h4" /></>,
    plus: <path d="M12 5v14M5 12h14" />,
    edit: <><path d="m4 20 3.5-.7 10-10a2 2 0 0 0 0-2.8l-1-1a2 2 0 0 0-2.8 0l-10 10L3 19.9Z" /><path d="M13 6l5 5" /></>,
    check: <path d="m5 12 4.2 4.2L19 6.8" />,
    close: <path d="M6 6l12 12M18 6 6 18" />,
    clear: <><path d="M4 20h10" /><path d="m8 20 6.7-11.6a1.6 1.6 0 0 0-1.4-2.4H7.7a1.6 1.6 0 0 0-1.4 2.4L8.8 13" /><path d="m14 14 3.5 3.5M17.5 14 14 17.5" /></>,
    download: <><path d="M12 4v10" /><path d="m8.5 10.5 3.5 3.5 3.5-3.5" /><path d="M4 19.5h16" /></>,
    wallet: <><rect x="3" y="6" width="18" height="12" rx="2" /><path d="M16 12h5" /><circle cx="16.5" cy="12" r="0.8" /></>,
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

const {
  AuthEntryModal,
  getFirstAccessCompleted,
  setFirstAccessCompleted
} = globalThis.OdontoFlowAuthEntry || {};

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

const AppShell = ({ sidebar, header, mobileHeader, children }) => (
  <div className="app-shell">
    <div className="app-frame">
      {sidebar}
      <main className="app-content">
        {mobileHeader}
        {header}
        {children}
      </main>
    </div>
  </div>
);

const AppSidebar = ({
  isVisible,
  authEmail,
  tabs,
  activeTab,
  onTabChange
}) => {
  if (!isVisible) return null;

  return (
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
            onClick={() => onTabChange(tab.id)}
            className={`btn btn--nav btn--nav--${tab.id} ${activeTab === tab.id ? 'is-active' : ''}`}
            aria-current={activeTab === tab.id ? 'page' : undefined}
            title={tab.label}
          >
            <AppIcon name={tab.icon} size={14} />
            {tab.label}
          </button>
        ))}
      </nav>
    </aside>
  );
};

const AppHeader = ({ children }) => (
  <header className="app-header-flat mb-3">
    {children}
  </header>
);

const PageHeader = ({ icon, title, subtitle, actions = null }) => (
  <div className="flex flex-wrap items-start justify-between gap-3">
    <div>
      <BioHeader
        icon={icon}
        title={title}
        subtitle={subtitle}
        actions={[]}
        navigation={null}
      />
    </div>
    {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
  </div>
);

const ContentGrid = ({ columns = '2', children, className = '' }) => (
  <section className={`grid gap-4 ${columns === '4' ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-4' : columns === '3' ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1 xl:grid-cols-2'} ${className}`.trim()}>
    {children}
  </section>
);

const BaseCard = ({ className = '', children }) => (
  <article className={`ui-card data-card data-card--g p-4 ${className}`.trim()}>{children}</article>
);

const SparkMiniChart = ({ points = [], tone = '#2563eb', variant = 'line' }) => {
  if (!points.length) return null;
  if (variant === 'donut') {
    const value = Math.max(0, Math.min(100, points[points.length - 1]));
    const radius = 14;
    const c = 2 * Math.PI * radius;
    const offset = c - (value / 100) * c;
    return (
      <svg className="stat-sparkline stat-sparkline--donut" viewBox="0 0 40 40" aria-hidden="true">
        <circle cx="20" cy="20" r={radius} fill="none" stroke="#e2e8f0" strokeWidth="5" />
        <circle cx="20" cy="20" r={radius} fill="none" stroke={tone} strokeWidth="5" strokeDasharray={c} strokeDashoffset={offset} strokeLinecap="round" transform="rotate(-90 20 20)" />
      </svg>
    );
  }
  if (variant === 'bar') {
    const max = Math.max(...points, 1);
    return (
      <div className="stat-sparkline stat-sparkline--bar" aria-hidden="true">
        {points.map((point, index) => (
          <span key={`bar-${index}`} style={{ height: `${Math.max(14, (point / max) * 100)}%`, background: tone }} />
        ))}
      </div>
    );
  }
  const width = 92;
  const height = 34;
  const min = Math.min(...points);
  const max = Math.max(...points);
  const span = Math.max(max - min, 1);
  const d = points.map((point, index) => {
    const x = (index / Math.max(points.length - 1, 1)) * width;
    const y = height - ((point - min) / span) * height;
    return `${index === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
  }).join(' ');

  return (
    <svg className="stat-sparkline" viewBox={`0 0 ${width} ${height}`} aria-hidden="true">
      <path d={d} fill="none" stroke={tone} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
};

const StatCard = ({ label, value, trend, trendTone = 'text-slate-500', sparkPoints = [], sparkColor = '#2563eb', sparkVariant = 'line', className = '' }) => (
  <BaseCard className={`stat-card-flat ${className}`.trim()}>
    <p className="text-xs uppercase tracking-[0.14em] text-slate-400 font-black">{label}</p>
    <div className="stat-card-flat__main">
      <p className="text-[1.95rem] font-semibold tracking-tight text-slate-900 mt-1 whitespace-nowrap">{value}</p>
      <SparkMiniChart points={sparkPoints} tone={sparkColor} variant={sparkVariant} />
    </div>
    {trend ? <p className={`text-xs font-bold mt-2 ${trendTone}`}>{trend}</p> : null}
  </BaseCard>
);

const PanelCard = ({ title, extra = null, children, className = '', titleClassName = '', contentClassName = '' }) => (
  <BaseCard className={className}>
    <div className="panel-card__header flex items-center justify-between gap-3 mb-3">
      <h3 className={`panel-card__title text-base font-black text-slate-900 ${titleClassName}`.trim()}>{title}</h3>
      {extra}
    </div>
    <div className={`panel-card__content ${contentClassName}`.trim()}>{children}</div>
  </BaseCard>
);

const SectionCard = ({ title, actions = null, children, className = '' }) => (
  <BaseCard className={className}>
    <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
      <h3 className="text-base font-black text-slate-900">{title}</h3>
      {actions}
    </div>
    {children}
  </BaseCard>
);

const StatusBadge = ({ status }) => {
  const tone = status === 'vencido'
    ? 'text-rose-600 bg-rose-50'
    : (['pago', 'recebido'].includes(status) ? 'text-emerald-600 bg-emerald-50' : 'text-amber-600 bg-amber-50');
  return <span className={`inline-flex px-2 py-1 rounded-full text-[11px] font-black uppercase ${tone}`}>{status}</span>;
};

const EmptyState = ({ message = 'Nenhum registro encontrado.' }) => (
  <div className="py-6 text-center text-sm text-slate-500">{message}</div>
);

const getResponsiveTableRowsPerPage = ({ compact = false } = {}) => {
  if (typeof window === 'undefined') return 5;
  const width = window.innerWidth;
  if (compact) {
    if (width >= 768) return 4;
    return 3;
  }
  if (width >= 1536) return 8;
  if (width >= 1280) return 7;
  if (width >= 1024) return 6;
  if (width >= 768) return 5;
  return 4;
};

const normalizeSortValue = (value) => {
  if (value === null || value === undefined) return '';
  if (typeof value === 'number') return value;
  if (value instanceof Date) return value.getTime();
  const stringValue = String(value).trim();
  if (!stringValue) return '';
  if (/^\d{4}-\d{2}-\d{2}$/.test(stringValue)) {
    const date = new Date(`${stringValue}T00:00:00`);
    const time = date.getTime();
    if (!Number.isNaN(time)) return time;
  }
  return stringValue.toLocaleLowerCase('pt-BR');
};

const DataTable = ({ columns, rows, emptyMessage = 'Sem dados para exibir.', paginated = false, compact = false, keepEmptyRows = false, footerTotals = [] }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [rowsPerPage, setRowsPerPage] = useState(() => (paginated ? getResponsiveTableRowsPerPage({ compact }) : Math.max(rows.length, 1)));
  const [viewportWidth, setViewportWidth] = useState(() => (typeof window !== 'undefined' ? window.innerWidth : 1280));

  useEffect(() => {
    const syncViewportWidth = () => setViewportWidth(window.innerWidth);
    syncViewportWidth();
    window.addEventListener('resize', syncViewportWidth);
    return () => window.removeEventListener('resize', syncViewportWidth);
  }, []);

  const visibleColumns = useMemo(() => columns.filter((column) => (
    typeof column.hideBelow !== 'number' || viewportWidth >= column.hideBelow
  )), [columns, viewportWidth]);

  useEffect(() => {
    if (!sortConfig.key) return;
    if (visibleColumns.some((column) => column.key === sortConfig.key)) return;
    setSortConfig({ key: null, direction: 'asc' });
  }, [sortConfig.key, visibleColumns]);

  useEffect(() => {
    if (!paginated) return undefined;

    const syncRowsPerPage = () => {
      setRowsPerPage(getResponsiveTableRowsPerPage({ compact }));
    };

    syncRowsPerPage();
    window.addEventListener('resize', syncRowsPerPage);
    return () => window.removeEventListener('resize', syncRowsPerPage);
  }, [compact, paginated]);

  const sortedRows = useMemo(() => {
    if (!sortConfig.key) return rows;
    const activeColumn = visibleColumns.find((column) => column.key === sortConfig.key);
    if (!activeColumn || activeColumn.sortable === false) return rows;

    return [...rows].sort((leftRow, rightRow) => {
      const leftValue = normalizeSortValue(activeColumn.sortValue ? activeColumn.sortValue(leftRow) : leftRow[activeColumn.key]);
      const rightValue = normalizeSortValue(activeColumn.sortValue ? activeColumn.sortValue(rightRow) : rightRow[activeColumn.key]);

      if (typeof leftValue === 'number' && typeof rightValue === 'number') {
        return sortConfig.direction === 'asc' ? leftValue - rightValue : rightValue - leftValue;
      }

      const result = String(leftValue).localeCompare(String(rightValue), 'pt-BR', { numeric: true, sensitivity: 'base' });
      return sortConfig.direction === 'asc' ? result : -result;
    });
  }, [rows, sortConfig.direction, sortConfig.key, visibleColumns]);

  const totalPages = paginated ? Math.max(1, Math.ceil(sortedRows.length / rowsPerPage)) : 1;

  useEffect(() => {
    if (!paginated) return;
    setCurrentPage((current) => Math.min(current, totalPages));
  }, [paginated, totalPages, sortedRows.length]);

  const toggleSort = (column) => {
    if (column.sortable === false) return;
    setSortConfig((current) => {
      if (current.key !== column.key) return { key: column.key, direction: 'asc' };
      return { key: column.key, direction: current.direction === 'asc' ? 'desc' : 'asc' };
    });
    setCurrentPage(1);
  };

  const visibleRows = paginated
    ? sortedRows.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage)
    : sortedRows;
  const placeholderRowsCount = keepEmptyRows && paginated ? Math.max(rowsPerPage - visibleRows.length, 0) : 0;

  return (
    <div className="data-table-shell">
      <div className="data-table__scroller">
        <table className={`data-table min-w-full text-sm ${compact ? 'data-table--compact' : ''}`.trim()}>
          <thead>
            <tr className="text-slate-400">
              {visibleColumns.map((column) => (
                <th key={column.key} className="data-table__head-cell text-left py-2 pr-3">
                  <button
                    type="button"
                    className={`data-table__head-button ${column.sortable === false ? 'data-table__head-button--disabled' : ''}`.trim()}
                    onClick={() => toggleSort(column)}
                    disabled={column.sortable === false}
                    aria-label={column.sortable === false ? `${column.label} sem ordenação` : `Ordenar por ${column.label}`}
                  >
                    <span>{column.label}</span>
                    {column.sortable === false ? null : (
                      <span className="data-table__sort-indicator" aria-hidden="true">
                        {sortConfig.key === column.key ? (sortConfig.direction === 'asc' ? '↑' : '↓') : '↕'}
                      </span>
                    )}
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visibleRows.length === 0 ? (
              <tr>
                <td colSpan={visibleColumns.length}><EmptyState message={emptyMessage} /></td>
              </tr>
            ) : visibleRows.map((row) => (
              <tr key={row.key} className="data-table__row">
                {visibleColumns.map((column) => (
                  <td key={`${row.key}-${column.key}`} className="data-table__cell py-2 pr-3">{column.render(row)}</td>
                ))}
              </tr>
            ))}
            {Array.from({ length: placeholderRowsCount }).map((_, index) => (
              <tr key={`placeholder-${index}`} className="data-table__row data-table__row--placeholder" aria-hidden="true">
                {visibleColumns.map((column) => (
                  <td key={`placeholder-${index}-${column.key}`} className="data-table__cell py-2 pr-3">&nbsp;</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {(footerTotals.length > 0 || (paginated && totalPages > 1)) ? (
        <div className="data-table__footer">
          {footerTotals.length > 0 ? (
            <div className="data-table__totals" aria-label="Totalizadores da tabela">
              {footerTotals.map((item) => (
                <p key={item.label} className={`data-table__total-item ${item.toneClassName || ''}`.trim()}>
                  <span>{item.label}:</span>
                  <strong>{item.value}</strong>
                </p>
              ))}
            </div>
          ) : <span />}
          {paginated && totalPages > 1 ? (
            <div className="data-table__pagination">
              <p className="data-table__pagination-label">Pág. {currentPage} de {totalPages}</p>
              <div className="data-table__pagination-actions">
                <button
                  type="button"
                  className="data-table__page-button"
                  onClick={() => setCurrentPage((page) => Math.max(page - 1, 1))}
                  disabled={currentPage <= 1}
                  aria-label="Página anterior"
                >
                  <AppIcon name="chevron-left" size={13} />
                  <span>Anterior</span>
                </button>
                <button
                  type="button"
                  className="data-table__page-button"
                  onClick={() => setCurrentPage((page) => Math.min(page + 1, totalPages))}
                  disabled={currentPage >= totalPages}
                  aria-label="Próxima página"
                >
                  <span>Próxima</span>
                  <AppIcon name="chevron-right" size={13} />
                </button>
              </div>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
};

const ActionButton = ({ label, tone = 'ghost', onClick, className = '', icon = null, type = 'button', ariaLabel, disabled = false }) => (
  <button type={type} className={`btn ${tone === 'primary' ? 'btn--primary' : 'btn--ghost'} ${className}`.trim()} onClick={onClick} aria-label={ariaLabel || label} disabled={disabled}>
    {icon}
    {label ? <span>{label}</span> : null}
  </button>
);

const FinancialWidgetIconButton = ({ ariaLabel, onClick, icon = 'edit', tone = 'text-sky-600' }) => (
  <button type="button" className={`financial-row-actions__icon ${tone}`.trim()} aria-label={ariaLabel} onClick={onClick}>
    <AppIcon name={icon} size={16} />
  </button>
);

const FinancialTableAddIconButton = ({ ariaLabel, onClick }) => (
  <FinancialWidgetIconButton ariaLabel={ariaLabel} onClick={onClick} icon="plus" />
);

const financialComponentFactories = globalThis.OdontoFlowFinancialComponents || {};
if (
  !financialComponentFactories.createFinancialEditAction
  || !financialComponentFactories.createFinancialWidgetFooter
  || !financialComponentFactories.createFinancialPageSection
  || !financialComponentFactories.createFinancialSectionColumns
  || !financialComponentFactories.createFinancialTableSectionCard
  || !financialComponentFactories.createFinancialTablePanelCard
) {
  throw new Error('Módulos financeiros globais não carregados. Verifique os scripts em index.html.');
}
const FinancialEditAction = financialComponentFactories.createFinancialEditAction({ ActionButton, AppIcon });
const FinancialWidgetFooter = financialComponentFactories.createFinancialWidgetFooter();
const FinancialPageSection = financialComponentFactories.createFinancialPageSection();
const FinancialSectionColumns = financialComponentFactories.createFinancialSectionColumns();
const FinancialTableSectionCard = financialComponentFactories.createFinancialTableSectionCard({ SectionCard, DataTable, FinancialEditAction, FinancialWidgetFooter });
const FinancialTablePanelCard = financialComponentFactories.createFinancialTablePanelCard({ PanelCard, DataTable, FinancialEditAction });
const chartCatalogFactories = globalThis.OdontoFlowChartCatalog || {};
if (!chartCatalogFactories.createChartDonut || !chartCatalogFactories.createChartSparkLine || !chartCatalogFactories.createChartSparkArea) {
  throw new Error('Catálogo de gráficos não carregado. Verifique os scripts em index.html.');
}
const ChartDonut = chartCatalogFactories.createChartDonut();
const ChartSparkLine = chartCatalogFactories.createChartSparkLine();
const ChartSparkArea = chartCatalogFactories.createChartSparkArea();
const layoutPrimitiveFactories = globalThis.OdontoFlowLayoutPrimitives || {};
if (!layoutPrimitiveFactories.createDataSection || !layoutPrimitiveFactories.createDataColumns) {
  throw new Error('Primitivos de layout não carregados. Verifique os scripts em index.html.');
}
const DataSection = layoutPrimitiveFactories.createDataSection();
const DataColumns = layoutPrimitiveFactories.createDataColumns();

const ActionGroup = ({ children }) => <div className="flex flex-wrap items-center gap-2">{children}</div>;
const Toolbar = ({ children }) => <section className="toolbar-flat"><ActionGroup>{children}</ActionGroup></section>;
const screenBlockFactories = globalThis.OdontoFlowScreenBlocks || {};
if (
  !screenBlockFactories.createSidebarScreenHeader
  || !screenBlockFactories.createKpiGridRow
  || !screenBlockFactories.createDualContentRow
) {
  throw new Error('Módulos globais de blocos de tela não carregados. Verifique os scripts em index.html.');
}
const SidebarScreenHeader = screenBlockFactories.createSidebarScreenHeader({ AppHeader, PageHeader });
const KpiGridRow = screenBlockFactories.createKpiGridRow({ ContentGrid, StatCard });
const DualContentRow = screenBlockFactories.createDualContentRow({ ContentGrid });
const profileBlockFactories = globalThis.OdontoFlowProfileBlocks || {};
if (!profileBlockFactories.createProfileFieldGrid || !profileBlockFactories.createProfileActionRow || !profileBlockFactories.createProfileFeedbackMessage || !profileBlockFactories.createProfileResponsivePanels) {
  throw new Error('Módulos globais de perfil não carregados. Verifique os scripts em index.html.');
}
const ProfileFieldGrid = profileBlockFactories.createProfileFieldGrid();
const ProfileActionRow = profileBlockFactories.createProfileActionRow({ ActionButton, AppIcon });
const ProfileFeedbackMessage = profileBlockFactories.createProfileFeedbackMessage();
const ProfileResponsivePanels = profileBlockFactories.createProfileResponsivePanels({ AppIcon });
const AlertCard = ({ text }) => <BaseCard className="border-amber-100 bg-amber-50/40"><p className="text-sm text-amber-700 font-semibold">{text}</p></BaseCard>;
const InsightCard = ({ text }) => <BaseCard className="border-sky-100 bg-sky-50/40"><p className="text-sm text-sky-700 font-semibold">{text}</p></BaseCard>;

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
                disabled={action.disabled}
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

const FINANCIAL_MOCK_DATA = globalThis.OdontoFlowMockData?.financial || {};
const FINANCIAL_DEFAULT_LANCAMENTOS = Array.isArray(FINANCIAL_MOCK_DATA.launches) ? FINANCIAL_MOCK_DATA.launches.map((item) => ({ ...item })) : [];
const FINANCIAL_DEFAULT_ACCOUNTS = Array.isArray(FINANCIAL_MOCK_DATA.accounts) ? FINANCIAL_MOCK_DATA.accounts.map((item) => ({ ...item })) : [];
const FINANCIAL_DEFAULT_CATEGORIES = {
  entradas: Array.isArray(FINANCIAL_MOCK_DATA.categories?.entradas) ? [...FINANCIAL_MOCK_DATA.categories.entradas] : [],
  saidas: Array.isArray(FINANCIAL_MOCK_DATA.categories?.saidas) ? [...FINANCIAL_MOCK_DATA.categories.saidas] : []
};
const FINANCIAL_DEFAULT_RECURRING = Array.isArray(FINANCIAL_MOCK_DATA.recurring) ? FINANCIAL_MOCK_DATA.recurring.map((item) => ({ ...item })) : [];
const FINANCIAL_DEFAULT_FORECASTS = Array.isArray(FINANCIAL_MOCK_DATA.forecasts) ? FINANCIAL_MOCK_DATA.forecasts.map((item) => ({ ...item })) : [];

const summarizeFinancialData = (items = []) => {
  const receitaRecebida = items
    .filter((item) => item.tipo === 'entrada' && ['recebido', 'pago'].includes(item.status))
    .reduce((acc, item) => acc + Number(item.valor || 0), 0);
  const despesasPagas = items
    .filter((item) => item.tipo === 'saida' && item.status === 'pago')
    .reduce((acc, item) => acc + Number(item.valor || 0), 0);
  const aReceber = items
    .filter((item) => item.tipo === 'entrada' && !['recebido', 'pago'].includes(item.status))
    .reduce((acc, item) => acc + Number(item.valor || 0), 0);

  const entradas = items.filter((item) => item.tipo === 'entrada');
  const ticketMedio = receitaRecebida / Math.max(entradas.length, 1);
  const inadimplencia = entradas.length
    ? (entradas.filter((item) => item.status === 'vencido').length / entradas.length) * 100
    : 0;

  return {
    receitaRecebida,
    despesasPagas,
    resultadoLiquido: receitaRecebida - despesasPagas,
    aReceber,
    ticketMedio,
    inadimplencia
  };
};

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

const CadastroFooterHint = ({ message = 'Use a barra de navegação inferior para ações de cadastro.' }) => (
  <div className="modal-footer cadastro-shell__footer">
    <p className="text-xs text-muted">{message}</p>
  </div>
);

const MobileScreenHeader = ({
  icon,
  title,
  subtitle,
  actions = [],
  navigation = null
}) => (
  <div className="bio-header-shell">
    <BioHeader
      icon={icon}
      title={title}
      subtitle={subtitle}
      actions={actions}
      navigation={navigation}
    />
  </div>
);

const DataManagementModalFrame = ({
  onClose,
  mobileHeader,
  bodyClassName = 'modal-body',
  footerNav,
  footerHintMessage,
  children
}) => (
  <div className="modal-wrap">
    <div className="modal-backdrop" onClick={onClose}></div>
    <div className="modal-card modal-card--wide cadastro-shell">
      <MobileScreenHeader {...mobileHeader} />
      <div className={bodyClassName}>
        {children}
      </div>
      <div className="modal-footer modal-footer--window-nav">
        {footerNav || <CadastroFooterHint message={footerHintMessage} />}
      </div>
    </div>
  </div>
);

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
  onSelectTab,
  onSubmit,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  footerNav
}) => {
  if (!isOpen) return null;
  const isCreateMode = mode === 'create';
  const currentTab = PATIENT_FORM_TABS.find((tab) => tab.id === activeTab);
  const canEditView = !isCreateMode && isEditingView;

  return (
    <DataManagementModalFrame
      onClose={onClose}
      mobileHeader={{
        icon: 'users',
        title: isCreateMode ? 'Novo paciente' : (patient?.name || 'Prontuário'),
        subtitle: 'Cadastro de paciente',
        actions: [],
        navigation: (
          <div className="bio-steps" aria-label="Etapas do formulário de paciente">
            {PATIENT_FORM_TABS.map((tab) => (
              <button
                type="button"
                key={tab.id}
                className={`bio-step ${tab.id === activeTab ? 'is-active' : ''}`}
                onClick={() => onSelectTab?.(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )
      }}
      desktopHeader={(
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
      )}
      footerNav={footerNav}
      footerHintMessage="Navegação de formulário disponível no rodapé da janela."
    >
          {activeTab === 'identity' && (
            <div className="modal-grid">
              <label className="form-field">
                <span>Nome completo</span>
                <input
                  className="form-input ui-input"
                  value={isCreateMode ? form.name : (viewForm?.name || patient?.name || '')}
                  onChange={(e) => onFormChange('name', e.target.value)}
                  disabled={!isCreateMode && !canEditView}
                  placeholder="Ex: Mariana Albuquerque"
                />
              </label>
              <label className="form-field">
                <span>Data de nascimento</span>
                <input
                  className="form-input ui-input"
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
                  className="form-input ui-input"
                  value={isCreateMode ? form.phone : (viewForm?.phone || patient?.phone || '')}
                  onChange={(e) => onFormChange('phone', e.target.value)}
                  disabled={!isCreateMode && !canEditView}
                  placeholder="(11) 90000-0000"
                />
              </label>
              <label className="form-field">
                <span>E-mail</span>
                <input
                  className="form-input ui-input"
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
                  className="form-input ui-input"
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
                  className="modal-notes-input ui-textarea"
                  value={isCreateMode ? form.notes : (viewForm?.notes ?? notesValue)}
                  onChange={(e) => onFormChange('notes', e.target.value)}
                  disabled={!isCreateMode && !canEditView}
                  placeholder="Alergias, histórico, cuidados e recomendações..."
                />
              </label>
            </div>
          )}
    </DataManagementModalFrame>
  );
};

const AccountN2Modal = ({
  isOpen,
  title,
  subtitle,
  onClose,
  onSave,
  isSaving,
  children,
  footerNav
}) => {
  if (!isOpen) return null;

  return (
    <DataManagementModalFrame
      onClose={onClose}
      mobileHeader={{
        icon: 'settings',
        title,
        subtitle,
        actions: [
          { key: 'account-modal-cancel', label: 'Cancelar', icon: 'close', tone: 'neutral', onClick: onClose },
          { key: 'account-modal-save', label: isSaving ? 'Salvando...' : 'Salvar', icon: 'check', tone: 'success', onClick: onSave, disabled: isSaving }
        ]
      }}
      desktopHeader={(
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
      )}
      footerNav={footerNav}
      footerHintMessage="Use a barra de navegação inferior para ações de cadastro."
    >
          <div className="modal-grid">
            {children}
          </div>
    </DataManagementModalFrame>
  );
};

const PublicProfileN2Modal = ({
  isOpen,
  onClose,
  onSave,
  isSaving,
  draft,
  onChange,
  footerNav
}) => {
  const [activeTab, setActiveTab] = useState('primary');

  useEffect(() => {
    if (isOpen) setActiveTab('primary');
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <DataManagementModalFrame
      onClose={onClose}
      mobileHeader={{
        icon: 'user',
        title: 'Editar perfil público',
        subtitle: 'Dados salvos em public.odf_users',
        actions: [
          { key: 'public-profile-cancel', label: 'Cancelar', icon: 'close', tone: 'neutral', onClick: onClose },
          { key: 'public-profile-save', label: isSaving ? 'Salvando...' : 'Salvar', icon: 'check', tone: 'success', onClick: onSave, disabled: isSaving }
        ],
        navigation: (
          <div className="bio-steps" aria-label="Abas do perfil público">
            <button type="button" className={`bio-step ${activeTab === 'primary' ? 'is-active' : ''}`} onClick={() => setActiveTab('primary')}>
              1. Dados primários
            </button>
            <button type="button" className={`bio-step ${activeTab === 'complementary' ? 'is-active' : ''}`} onClick={() => setActiveTab('complementary')}>
              2. Complementar
            </button>
          </div>
        )
      }}
      desktopHeader={(
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
      )}
      bodyClassName="modal-body space-y-4"
      footerNav={footerNav}
      footerHintMessage="Use a barra de navegação inferior para ações de cadastro."
    >
          <div className="hidden md:flex bio-steps" aria-label="Abas do perfil público">
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
                <input type="text" className="form-input ui-input" value={draft.full_name} onChange={(event) => onChange('full_name', event.target.value)} placeholder="Nome completo" />
              </label>
              <label className="form-field">
                <span>E-mail</span>
                <input type="email" className="form-input ui-input" value={draft.email} onChange={(event) => onChange('email', event.target.value)} placeholder="nome@email.com" />
              </label>
              <label className="form-field">
                <span>Telefone</span>
                <input type="text" className="form-input ui-input" value={draft.phone} onChange={(event) => onChange('phone', event.target.value)} placeholder="(00) 00000-0000" />
              </label>
            </div>
          ) : (
            <div className="modal-grid">
              <label className="form-field form-field--full">
                <span>Endereço</span>
                <input type="text" className="form-input ui-input" value={draft.address} onChange={(event) => onChange('address', event.target.value)} placeholder="Rua, número, bairro, cidade/UF" />
              </label>
              <label className="form-field">
                <span>Data de nascimento</span>
                <input type="date" className="form-input ui-input" value={draft.birth_date || ''} onChange={(event) => onChange('birth_date', event.target.value)} />
              </label>
            </div>
          )}
    </DataManagementModalFrame>
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
  isSaving,
  footerNav
}) => {
  if (!isOpen) return null;

  return (
    <DataManagementModalFrame
      onClose={onClose}
      mobileHeader={{
        icon: 'settings',
        title: 'Clínicas do usuário',
        subtitle: 'Selecione uma clínica para editar ou crie uma nova.',
        actions: [
          { key: 'clinic-modal-new', label: 'Nova clínica', icon: 'edit', tone: 'info', onClick: onCreateNew },
          { key: 'clinic-modal-cancel', label: 'Cancelar', icon: 'close', tone: 'neutral', onClick: onClose },
          { key: 'clinic-modal-save', label: isSaving ? 'Salvando...' : 'Salvar', icon: 'check', tone: 'success', onClick: onSave, disabled: isSaving }
        ]
      }}
      desktopHeader={(
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
      )}
      bodyClassName="modal-body space-y-4"
      footerNav={footerNav}
      footerHintMessage="Ações de clínica disponíveis na barra inferior (cancelar, duplicar, salvar, excluir, arquivar)."
    >
          <label className="form-field">
            <span>Clínica selecionada</span>
            <select className="form-input ui-input" value={selectedClinicId || ''} onChange={(event) => onSelectClinic(event.target.value)}>
              {clinics.map((clinic) => (
                <option key={clinic.id} value={clinic.id}>{clinic.trade_name}</option>
              ))}
              {!selectedClinicId && <option value="">Nova clínica</option>}
            </select>
          </label>

          <div className="modal-grid">
            <label className="form-field">
              <span>Nome fantasia</span>
              <input className="form-input ui-input" value={draft.trade_name} onChange={(event) => onChange('trade_name', event.target.value)} placeholder="Minha Clínica" />
            </label>
            <label className="form-field">
              <span>Razão social</span>
              <input className="form-input ui-input" value={draft.legal_name} onChange={(event) => onChange('legal_name', event.target.value)} />
            </label>
            <label className="form-field">
              <span>Documento</span>
              <input className="form-input ui-input" value={draft.document_number} onChange={(event) => onChange('document_number', event.target.value)} placeholder="CNPJ" />
            </label>
            <label className="form-field">
              <span>Email</span>
              <input className="form-input ui-input" type="email" value={draft.email} onChange={(event) => onChange('email', event.target.value)} />
            </label>
            <label className="form-field">
              <span>Telefone</span>
              <input className="form-input ui-input" value={draft.phone} onChange={(event) => onChange('phone', event.target.value)} />
            </label>
            <label className="form-field">
              <span>Cidade</span>
              <input className="form-input ui-input" value={draft.city} onChange={(event) => onChange('city', event.target.value)} />
            </label>
            <label className="form-field">
              <span>UF</span>
              <input className="form-input ui-input" value={draft.state} onChange={(event) => onChange('state', event.target.value.toUpperCase().slice(0, 2))} />
            </label>
            <label className="form-field">
              <span>Status</span>
              <select className="form-input ui-input" value={draft.status} onChange={(event) => onChange('status', event.target.value)}>
                <option value="trial">trial</option>
                <option value="active">active</option>
                <option value="suspended">suspended</option>
                <option value="archived">archived</option>
              </select>
            </label>
          </div>
    </DataManagementModalFrame>
  );
};

const MobileMd3Nav = ({
  visible,
  leftActions = [],
  rightActions = [],
  centerAction,
  embedded = false
}) => {
  if (!visible) return null;
  const leftPrimary = leftActions.slice(0, 2);
  const rightPrimary = rightActions.slice(0, 2);

  const renderAction = (action) => (
    <button
      key={action.key}
      type="button"
      className={`mobile-md3-nav__action mobile-md3-nav__action--${action.tone || 'neutral'} ${action.active ? 'is-active' : ''}`}
      onClick={action.disabled ? undefined : action.onClick}
      disabled={Boolean(action.disabled)}
      aria-label={action.ariaLabel || action.label}
      aria-current={action.active ? 'page' : undefined}
      title={action.label}
    >
      <AppIcon name={action.icon} size={18} />
      <span className="mobile-md3-nav__label">{action.label}</span>
    </button>
  );

  return (
    <nav className={`mobile-md3-nav ${embedded ? 'mobile-md3-nav--embedded' : ''}`.trim()} aria-label="Barra de navegação móvel">
      {leftPrimary.map(renderAction)}
      {centerAction ? (
        <button
          type="button"
          className={`mobile-md3-nav__fab mobile-md3-nav__action--${centerAction.tone || 'info'}`}
          onClick={centerAction.onClick}
          aria-label={centerAction.ariaLabel || centerAction.label}
          title={centerAction.label}
        >
          <AppIcon name={centerAction.icon || 'menu'} size={18} />
          <span className="mobile-md3-nav__label">{centerAction.label}</span>
        </button>
      ) : null}
      {rightPrimary.map(renderAction)}
    </nav>
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

const readStoredPatientsSearchVisibility = () => {
  try {
    return localStorage.getItem(PATIENTS_SEARCH_VISIBILITY_KEY) === '1';
  } catch {
    return false;
  }
};

const readStoredFinancialLaunches = () => {
  try {
    const raw = localStorage.getItem(FINANCIAL_STORAGE_KEY);
    if (!raw) return FINANCIAL_DEFAULT_LANCAMENTOS;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length ? parsed : FINANCIAL_DEFAULT_LANCAMENTOS;
  } catch {
    return FINANCIAL_DEFAULT_LANCAMENTOS;
  }
};

const readStoredFinancialAccounts = () => {
  try {
    const raw = localStorage.getItem(FINANCIAL_ACCOUNTS_STORAGE_KEY);
    if (!raw) return FINANCIAL_DEFAULT_ACCOUNTS;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length ? parsed : FINANCIAL_DEFAULT_ACCOUNTS;
  } catch {
    return FINANCIAL_DEFAULT_ACCOUNTS;
  }
};

const readStoredFinancialCategories = () => {
  try {
    const raw = localStorage.getItem(FINANCIAL_CATEGORIES_STORAGE_KEY);
    if (!raw) return FINANCIAL_DEFAULT_CATEGORIES;
    const parsed = JSON.parse(raw);
    return {
      entradas: Array.isArray(parsed?.entradas) && parsed.entradas.length ? parsed.entradas : FINANCIAL_DEFAULT_CATEGORIES.entradas,
      saidas: Array.isArray(parsed?.saidas) && parsed.saidas.length ? parsed.saidas : FINANCIAL_DEFAULT_CATEGORIES.saidas
    };
  } catch {
    return FINANCIAL_DEFAULT_CATEGORIES;
  }
};

const readStoredFinancialRecurring = () => {
  try {
    const raw = localStorage.getItem(FINANCIAL_RECURRING_STORAGE_KEY);
    if (!raw) return FINANCIAL_DEFAULT_RECURRING;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length
      ? parsed.map((item) => ({ ...item, status: item.status || 'pendente', ultima_quitacao: item.ultima_quitacao || '' }))
      : FINANCIAL_DEFAULT_RECURRING;
  } catch {
    return FINANCIAL_DEFAULT_RECURRING;
  }
};

const readStoredFinancialForecasts = () => {
  try {
    const raw = localStorage.getItem(FINANCIAL_FORECAST_STORAGE_KEY);
    if (!raw) return FINANCIAL_DEFAULT_FORECASTS;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length
      ? parsed.map((item) => ({ ...item, comprometido: Boolean(item.comprometido) }))
      : FINANCIAL_DEFAULT_FORECASTS;
  } catch {
    return FINANCIAL_DEFAULT_FORECASTS;
  }
};

function DashboardApp({
  authEmail = '',
  authUser = null,
  accountService
}) {
  const [initialUiState] = useState(() => readStoredUiState());
  const [view, setView] = useState(initialUiState.view || 'loader');
  const [activeTab, setActiveTab] = useState(() => (
    initialUiState.activeTab === 'agenda' ? 'agenda' : (initialUiState.activeTab || 'overview')
  ));
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
  const [financialLaunches, setFinancialLaunches] = useState(() => readStoredFinancialLaunches());
  const [financialAccounts, setFinancialAccounts] = useState(() => readStoredFinancialAccounts());
  const [financialCategories, setFinancialCategories] = useState(() => readStoredFinancialCategories());
  const [financialRecurring, setFinancialRecurring] = useState(() => readStoredFinancialRecurring());
  const [financialForecasts, setFinancialForecasts] = useState(() => readStoredFinancialForecasts());
  const [isFinancialFormOpen, setIsFinancialFormOpen] = useState(false);
  const [isPeriodPickerOpen, setIsPeriodPickerOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [selectedPeriodLabel, setSelectedPeriodLabel] = useState('01/04/2026 - 30/04/2026');
  const [periodDraft, setPeriodDraft] = useState({ from: '2026-04-01', to: '2026-04-30' });
  const [newCategoryDraft, setNewCategoryDraft] = useState({ tipo: 'entradas', nome: '' });
  const [newAccountDraft, setNewAccountDraft] = useState({ nome: '', banco: '', tipo: 'corrente', saldo_inicial: '' });
  const [newRecurringDraft, setNewRecurringDraft] = useState({ descricao: '', valor: '', periodicidade: 'mensal', categoria: '', status: 'pendente', ultima_quitacao: '' });
  const [newForecastDraft, setNewForecastDraft] = useState({ descricao: '', valor: '', periodo: 'Próximos 30 dias', comprometido: false });
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isRecurringModalOpen, setIsRecurringModalOpen] = useState(false);
  const [isForecastModalOpen, setIsForecastModalOpen] = useState(false);
  const [isAccountsEditMode, setIsAccountsEditMode] = useState(false);
  const [isCategoriesEditMode, setIsCategoriesEditMode] = useState(false);
  const [isRecurringEditMode, setIsRecurringEditMode] = useState(false);
  const [isForecastEditMode, setIsForecastEditMode] = useState(false);
  const [accountFilter, setAccountFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [recurringFilter, setRecurringFilter] = useState('');
  const [forecastFilter, setForecastFilter] = useState('');
  const [openWidgetFilter, setOpenWidgetFilter] = useState('');
  const [widgetFilters, setWidgetFilters] = useState({
    contasFinanceiras: { tipo: 'all' },
    recorrencias: { periodicidade: 'all', categoria: 'all', status: 'all' },
    previsoes: { periodo: 'all', comprometido: 'all' },
    contasReceber: { status: 'all' },
    contasPagar: { status: 'all' }
  });
  const [confirmationDialog, setConfirmationDialog] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmLabel: 'Confirmar',
    tone: 'danger',
    onConfirm: null
  });
  const [financialDraft, setFinancialDraft] = useState(() => ({
    id: '',
    tipo: 'entrada',
    descricao: '',
    categoria: '',
    subcategoria: '',
    valor: '',
    status: 'previsto',
    data_competencia: '',
    data_vencimento: '',
    data_pagamento: '',
    origem: '',
    paciente_id: '',
    profissional_id: '',
    observacoes: ''
  }));
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
  const [expandedProfilePanel, setExpandedProfilePanel] = useState('auth');
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
  const [isWideNavigation, setIsWideNavigation] = useState(() => {
    if (typeof window === 'undefined') return false;
    const isDesktop = window.matchMedia('(min-width: 1024px)').matches;
    const isTablet = window.innerWidth >= 600 && window.innerWidth < 1024;
    const isLandscape = window.innerWidth > window.innerHeight;
    return isDesktop || (isTablet && isLandscape);
  });
  const patientsInfiniteTriggerRef = useRef(null);
  const appointmentsInfiniteTriggerRef = useRef(null);
  const quickLinksCarouselRef = useRef(null);
  const quickLinksSnapTimeoutRef = useRef(null);
  const financialLaunchesSectionRef = useRef(null);
  const [isSidebarDrawerOpen, setIsSidebarDrawerOpen] = useState(false);

  const formatDateTime = (value) => {
    if (!value) return '-';
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return '-';
    return parsed.toLocaleString('pt-BR');
  };

  const formatMoney = (value) => Number(value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const emptyFinancialDraft = () => ({
    id: '',
    tipo: 'entrada',
    descricao: '',
    categoria: '',
    subcategoria: '',
    valor: '',
    status: 'previsto',
    data_competencia: '',
    data_vencimento: '',
    data_pagamento: '',
    origem: '',
    paciente_id: '',
    profissional_id: '',
    observacoes: ''
  });

  const openFinancialCreate = (tipo = 'entrada') => {
    setFinancialDraft({
      ...emptyFinancialDraft(),
      tipo
    });
    setIsFinancialFormOpen(true);
  };

  const openFinancialEdit = (launch) => {
    setFinancialDraft({
      ...launch,
      valor: launch.valor ?? '',
      paciente_id: launch.paciente_id ?? '',
      profissional_id: launch.profissional_id ?? ''
    });
    setIsFinancialFormOpen(true);
  };

  const closeFinancialForm = () => {
    setFinancialDraft(emptyFinancialDraft());
    setIsFinancialFormOpen(false);
  };

  const focusFinancialLaunches = (tipo) => {
    setWidgetFilters((current) => ({
      ...current,
      contasReceber: { ...current.contasReceber, status: 'all' },
      contasPagar: { ...current.contasPagar, status: 'all' }
    }));
    requestAnimationFrame(() => {
      financialLaunchesSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
    if (tipo === 'entrada') {
      setConfirmationDialog({
        isOpen: true,
        title: 'Receitas em foco',
        message: 'Use as ações da tabela para dar baixa, editar ou cancelar receitas.',
        confirmLabel: 'OK',
        tone: 'info',
        onConfirm: () => setConfirmationDialog((current) => ({ ...current, isOpen: false }))
      });
    }
    if (tipo === 'saida') {
      setConfirmationDialog({
        isOpen: true,
        title: 'Despesas em foco',
        message: 'Use as ações da tabela para pagar, editar ou cancelar despesas.',
        confirmLabel: 'OK',
        tone: 'info',
        onConfirm: () => setConfirmationDialog((current) => ({ ...current, isOpen: false }))
      });
    }
  };

  const handleFinancialDraftChange = (field, value) => {
    setFinancialDraft((current) => ({ ...current, [field]: value }));
  };

  const handleFinancialSave = () => {
    if (!financialDraft.descricao || !financialDraft.categoria || !financialDraft.data_vencimento || !financialDraft.origem) return;

    const payload = {
      ...financialDraft,
      id: financialDraft.id || Date.now(),
      valor: Number(financialDraft.valor || 0),
      paciente_id: financialDraft.paciente_id === '' ? null : Number(financialDraft.paciente_id),
      profissional_id: financialDraft.profissional_id === '' ? null : Number(financialDraft.profissional_id)
    };

    setFinancialLaunches((current) => (
      financialDraft.id
        ? current.map((item) => (item.id === financialDraft.id ? payload : item))
        : [payload, ...current]
    ));
    closeFinancialForm();
  };

  const openConfirmationDialog = ({ title, message, confirmLabel = 'Confirmar', tone = 'danger', onConfirm }) => {
    setConfirmationDialog({
      isOpen: true,
      title,
      message,
      confirmLabel,
      tone,
      onConfirm
    });
  };

  const closeConfirmationDialog = () => {
    setConfirmationDialog({
      isOpen: false,
      title: '',
      message: '',
      confirmLabel: 'Confirmar',
      tone: 'danger',
      onConfirm: null
    });
  };

  const runConfirmationDialog = () => {
    if (typeof confirmationDialog.onConfirm === 'function') {
      confirmationDialog.onConfirm();
    }
    closeConfirmationDialog();
  };

  const handleFinancialDelete = (id) => {
    openConfirmationDialog({
      title: 'Excluir movimentação',
      message: 'Deseja excluir esta movimentação financeira?',
      confirmLabel: 'Excluir',
      tone: 'danger',
      onConfirm: () => setFinancialLaunches((current) => current.filter((item) => item.id !== id))
    });
  };
  const handleFinancialCancel = (id) => handleFinancialDelete(id);

  const handleFinancialConfirm = (id) => {
    openConfirmationDialog({
      title: 'Confirmar movimentação',
      message: 'Confirma a baixa desta movimentação?',
      confirmLabel: 'Confirmar',
      tone: 'success',
      onConfirm: () => {
        const today = new Date().toISOString().slice(0, 10);
        setFinancialLaunches((current) => current.map((item) => (
          item.id === id
            ? {
              ...item,
              status: getFinancialConfirmedStatus(item.tipo),
              data_pagamento: item.data_pagamento || today
            }
            : item
        )));
      }
    });
  };

  const handleCategoryDelete = (tipo, nome) => {
    openConfirmationDialog({
      title: 'Excluir categoria',
      message: `Deseja excluir a categoria "${nome}"?`,
      confirmLabel: 'Excluir',
      tone: 'danger',
      onConfirm: () => setFinancialCategories((current) => ({
        ...current,
        [tipo]: current[tipo].filter((cat) => cat !== nome)
      }))
    });
  };

  const deleteFinancialAccount = (id) => {
    openConfirmationDialog({
      title: 'Excluir conta financeira',
      message: 'Deseja remover esta conta financeira?',
      confirmLabel: 'Excluir',
      tone: 'danger',
      onConfirm: () => setFinancialAccounts((items) => items.filter((item) => item.id !== id))
    });
  };

  const deleteRecurring = (id) => {
    openConfirmationDialog({
      title: 'Excluir recorrência',
      message: 'Deseja excluir esta despesa recorrente?',
      confirmLabel: 'Excluir',
      tone: 'danger',
      onConfirm: () => setFinancialRecurring((items) => items.filter((item) => item.id !== id))
    });
  };

  const editRecurring = (id) => {
    const target = financialRecurring.find((item) => item.id === id);
    if (!target) return;
    const descricao = window.prompt('Descrição da recorrência', target.descricao);
    if (!descricao) return;
    setFinancialRecurring((items) => items.map((item) => (item.id === id ? { ...item, descricao } : item)));
  };

  const confirmRecurringPayment = (id) => {
    openConfirmationDialog({
      title: 'Confirmar pagamento da parcela',
      message: 'Deseja confirmar o pagamento desta despesa recorrente?',
      confirmLabel: 'Confirmar pagamento',
      tone: 'success',
      onConfirm: () => {
        const today = new Date().toISOString().slice(0, 10);
        setFinancialRecurring((items) => items.map((item) => (
          item.id === id ? { ...item, status: 'pago', ultima_quitacao: today } : item
        )));
      }
    });
  };

  const deleteForecast = (id) => {
    openConfirmationDialog({
      title: 'Excluir previsão',
      message: 'Deseja excluir esta previsão de custo?',
      confirmLabel: 'Excluir',
      tone: 'danger',
      onConfirm: () => setFinancialForecasts((items) => items.filter((item) => item.id !== id))
    });
  };

  const editForecast = (id) => {
    const target = financialForecasts.find((item) => item.id === id);
    if (!target) return;
    const descricao = window.prompt('Descrição da previsão', target.descricao);
    if (!descricao) return;
    setFinancialForecasts((items) => items.map((item) => (item.id === id ? { ...item, descricao } : item)));
  };

  const toggleForecastCommitted = (id) => {
    openConfirmationDialog({
      title: 'Atualizar comprometimento',
      message: 'Deseja marcar esta previsão como comprometida no período?',
      confirmLabel: 'Confirmar',
      tone: 'success',
      onConfirm: () => setFinancialForecasts((items) => items.map((item) => (
        item.id === id ? { ...item, comprometido: true } : item
      )))
    });
  };
  const getFinancialConfirmedStatus = (tipo) => (tipo === 'entrada' ? 'recebido' : 'pago');
  const isFinancialLaunchConfirmed = (launch) => launch.status === getFinancialConfirmedStatus(launch.tipo);

  const toggleWidgetFilter = (key) => {
    setOpenWidgetFilter((current) => (current === key ? '' : key));
  };

  const updateWidgetFilter = (key, field, value) => {
    setWidgetFilters((current) => ({
      ...current,
      [key]: {
        ...current[key],
        [field]: value
      }
    }));
  };

  const applyQuickPeriod = (period) => {
    const today = new Date('2026-04-23');
    if (period === 'today') {
      const date = today.toISOString().slice(0, 10);
      setPeriodDraft({ from: date, to: date });
      setSelectedPeriodLabel('Hoje');
      return;
    }
    if (period === 'week') {
      const from = new Date(today);
      from.setDate(today.getDate() - 6);
      setPeriodDraft({ from: from.toISOString().slice(0, 10), to: today.toISOString().slice(0, 10) });
      setSelectedPeriodLabel('Últimos 7 dias');
      return;
    }
    setPeriodDraft({ from: '2026-04-01', to: '2026-04-30' });
    setSelectedPeriodLabel('Mês atual');
  };

  const applyCustomPeriod = () => {
    if (!periodDraft.from || !periodDraft.to) return;
    const formatted = `${periodDraft.from.split('-').reverse().join('/')} - ${periodDraft.to.split('-').reverse().join('/')}`;
    setSelectedPeriodLabel(formatted);
    setIsPeriodPickerOpen(false);
  };

  const addFinancialCategory = () => {
    const name = newCategoryDraft.nome.trim();
    if (!name) return;
    setFinancialCategories((current) => ({
      ...current,
      [newCategoryDraft.tipo]: [...current[newCategoryDraft.tipo], name]
    }));
    setNewCategoryDraft((current) => ({ ...current, nome: '' }));
    setIsCategoryModalOpen(false);
  };


  const addFinancialAccount = () => {
    if (!newAccountDraft.nome.trim()) return;
    setFinancialAccounts((current) => [
      ...current,
      { id: Date.now(), ...newAccountDraft, saldo_inicial: Number(newAccountDraft.saldo_inicial || 0) }
    ]);
    setNewAccountDraft({ nome: '', banco: '', tipo: 'corrente', saldo_inicial: '' });
    setIsAccountModalOpen(false);
  };

  const editFinancialAccount = (id) => {
    const current = financialAccounts.find((item) => item.id === id);
    if (!current) return;
    const nome = window.prompt('Nome da conta', current.nome);
    if (!nome) return;
    const banco = window.prompt('Banco', current.banco || '');
    setFinancialAccounts((items) => items.map((item) => (item.id === id ? { ...item, nome, banco: banco ?? item.banco } : item)));
  };


  const addRecurring = () => {
    if (!newRecurringDraft.descricao.trim()) return;
    setFinancialRecurring((current) => [
      ...current,
      { id: Date.now(), ...newRecurringDraft, valor: Number(newRecurringDraft.valor || 0) }
    ]);
    setNewRecurringDraft({ descricao: '', valor: '', periodicidade: 'mensal', categoria: '', status: 'pendente', ultima_quitacao: '' });
    setIsRecurringModalOpen(false);
  };


  const addForecast = () => {
    if (!newForecastDraft.descricao.trim()) return;
    setFinancialForecasts((current) => [
      ...current,
      { id: Date.now(), ...newForecastDraft, valor: Number(newForecastDraft.valor || 0) }
    ]);
    setNewForecastDraft({ descricao: '', valor: '', periodo: 'Próximos 30 dias', comprometido: false });
    setIsForecastModalOpen(false);
  };


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

  const handleOpenPatientEdit = () => {
    if (selectedPatient) {
      openPatientN2(selectedPatient);
      return;
    }

    const firstPatient = visiblePatients[0];
    if (firstPatient) {
      openPatientN2(firstPatient);
      return;
    }

    setFormFeedback('Selecione um paciente para editar.');
  };

  const goToLevel1 = (tabId) => {
    if (!LEVEL1_TABS.some((tab) => tab.id === tabId)) return;
    setActiveTab(tabId);
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
    openConfirmationDialog({
      title: 'Excluir conta',
      message: 'Tem certeza que deseja excluir sua conta? Esta ação não pode ser desfeita.',
      confirmLabel: 'Excluir conta',
      tone: 'danger',
      onConfirm: async () => {
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
      }
    });
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

  const handleOpenClinicCreateN2 = async () => {
    setIsClinicN2Open(true);
    setSelectedClinicId('');
    setClinicDraft(toClinicDraft(null));
    try {
      await refreshClinics(authUserWidget?.id);
      setSelectedClinicId('');
      setClinicDraft(toClinicDraft(null));
    } catch (error) {
      setClinicActionStatus('error');
      setClinicActionMessage(error?.message || 'Não foi possível preparar o cadastro de clínica.');
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

  const handleDuplicateClinic = () => {
    const baseName = clinicDraft.trade_name?.trim() || 'Nova Clínica';
    setSelectedClinicId('');
    setClinicDraft((current) => ({
      ...current,
      id: '',
      trade_name: `${baseName} (cópia)`,
      status: 'trial'
    }));
    setClinicActionStatus('success');
    setClinicActionMessage('Cópia preparada. Revise e salve para criar a nova clínica.');
  };

  const handleArchiveClinic = async () => {
    if (!accountService?.saveClinic || !authUserWidget?.id) return;
    const archivedDraft = { ...clinicDraft, status: 'archived' };
    setClinicDraft(archivedDraft);
    setClinicActionStatus('loading');
    setClinicActionMessage('Arquivando clínica...');
    try {
      await accountService.saveClinic({
        userId: authUserWidget.id,
        clinic: archivedDraft
      });
      await refreshClinics(authUserWidget.id);
      setClinicActionStatus('success');
      setClinicActionMessage('Clínica arquivada com sucesso.');
    } catch (error) {
      setClinicActionStatus('error');
      setClinicActionMessage(error?.message || 'Não foi possível arquivar clínica.');
    }
  };

  const handleDeleteClinic = () => {
    if (!selectedClinicId) {
      setClinicActionStatus('error');
      setClinicActionMessage('Selecione uma clínica existente para excluir.');
      return;
    }
    openConfirmationDialog({
      title: 'Excluir clínica',
      message: 'Excluir esta clínica da lista local?',
      confirmLabel: 'Excluir',
      tone: 'danger',
      onConfirm: () => {
        setClinics((prev) => prev.filter((clinic) => clinic.id !== selectedClinicId));
        setSelectedClinicId('');
        setClinicDraft(toClinicDraft(null));
        setClinicActionStatus('success');
        setClinicActionMessage('Clínica removida da lista local. Salve se desejar persistir alterações.');
      }
    });
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
    const t = setTimeout(() => setView('dashboard'), 700);

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
    if (isWideNavigation) {
      setIsSidebarDrawerOpen(false);
    }
  }, [isWideNavigation]);

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
    localStorage.setItem(FINANCIAL_STORAGE_KEY, JSON.stringify(financialLaunches));
  }, [financialLaunches]);

  useEffect(() => {
    localStorage.setItem(FINANCIAL_ACCOUNTS_STORAGE_KEY, JSON.stringify(financialAccounts));
  }, [financialAccounts]);

  useEffect(() => {
    localStorage.setItem(FINANCIAL_CATEGORIES_STORAGE_KEY, JSON.stringify(financialCategories));
  }, [financialCategories]);

  useEffect(() => {
    localStorage.setItem(FINANCIAL_RECURRING_STORAGE_KEY, JSON.stringify(financialRecurring));
  }, [financialRecurring]);

  useEffect(() => {
    localStorage.setItem(FINANCIAL_FORECAST_STORAGE_KEY, JSON.stringify(financialForecasts));
  }, [financialForecasts]);

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
    const updateWideNavigation = () => {
      const isDesktop = window.matchMedia('(min-width: 1024px)').matches;
      const isTablet = window.innerWidth >= 600 && window.innerWidth < 1024;
      const isLandscape = window.innerWidth > window.innerHeight;
      setIsWideNavigation(isDesktop || (isTablet && isLandscape));
    };

    updateWideNavigation();
    window.addEventListener('resize', updateWideNavigation);
    window.addEventListener('orientationchange', updateWideNavigation);
    return () => {
      window.removeEventListener('resize', updateWideNavigation);
      window.removeEventListener('orientationchange', updateWideNavigation);
    };
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
    if (!isMobileViewport || activeTab !== 'patients') return;
    if (typeof window.IntersectionObserver !== 'function') return;
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
    if (!isMobileViewport || activeTab !== 'agenda') return;
    if (typeof window.IntersectionObserver !== 'function') return;
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

  useEffect(() => () => {
    if (quickLinksSnapTimeoutRef.current) {
      clearTimeout(quickLinksSnapTimeoutRef.current);
    }
  }, []);

  if (view === 'loader') {
    return (
      <div className="app-viewport flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-[3px] border-sky-700 border-t-transparent rounded-full animate-spin"></div>
        <div className="ui-badge">Inicializando</div>
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300">Sincronizando Ecossistema</p>
      </div>
    );
  }

  const renderContent = () => {
    const quickLinksCatalog = {
      overview: {
        key: 'overview',
        icon: TAB_META.overview.icon,
        tone: TAB_META.overview.tone,
        label: TAB_META.overview.label,
        ariaLabel: 'Ir para início',
        onClick: () => goToLevel1('overview')
      },
      agenda: {
        key: 'agenda',
        icon: 'calendar',
        tone: 'agenda',
        label: 'Agenda',
        ariaLabel: 'Ir para agenda',
        onClick: () => goToLevel1('agenda')
      },
      'agenda-hoje': {
        key: 'agenda-hoje',
        icon: 'calendar',
        tone: 'agenda',
        label: 'Agenda',
        ariaLabel: 'Ir para agenda de hoje',
        onClick: () => {
          goToLevel1('agenda');
          setAppointmentsQuery('');
        }
      },
      patients: {
        key: 'patients',
        icon: 'users',
        tone: 'patients',
        label: 'Pacientes',
        ariaLabel: 'Abrir base de pacientes',
        onClick: () => goToLevel1('patients')
      },
      'new-patient': {
        key: 'new-patient',
        icon: 'edit',
        tone: 'new',
        label: 'Novo',
        ariaLabel: 'Cadastrar novo paciente',
        onClick: () => {
          goToLevel1('patients');
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
      financial: {
        key: 'financial',
        icon: 'plan',
        tone: 'settings',
        label: 'Financeiro',
        ariaLabel: 'Abrir financeiro',
        onClick: () => goToLevel1('financial')
      },
      clinic: {
        key: 'clinic',
        icon: 'id-card',
        tone: 'account',
        label: 'Clínica',
        ariaLabel: 'Abrir clínica',
        onClick: () => goToLevel1('clinic')
      },
      profile: {
        key: 'profile',
        icon: TAB_META.profile.icon,
        tone: TAB_META.profile.tone,
        label: TAB_META.profile.label,
        ariaLabel: 'Abrir perfil',
        onClick: () => goToLevel1('profile')
      }
    };

    const levelQuickLinksMap = {
      overview: {
        level: 0,
        previous: null,
        next: ['agenda', 'patients', 'clinic', 'financial', 'profile']
      },
      agenda: {
        level: 1,
        previous: 'overview',
        next: ['agenda-hoje']
      },
      patients: {
        level: 1,
        previous: 'overview',
        next: ['new-patient', 'patients-search', 'patients-sort', 'patients-multi']
      },
      clinic: {
        level: 1,
        previous: 'overview',
        next: []
      },
      financial: {
        level: 1,
        previous: 'overview',
        next: []
      },
      profile: {
        level: 1,
        previous: 'overview',
        next: []
      }
    };

    const createHeaderBreadcrumb = (title) => (
      title === 'Início'
        ? [{ label: 'Início' }]
        : [{ label: 'Início', onClick: () => goToLevel1('overview') }, { label: title }]
    );

    const renderN1Header = ({ icon, title, subtitle, actions = null }) => (
      <SidebarScreenHeader
        icon={icon}
        title={title}
        subtitle={subtitle}
        actions={actions}
        breadcrumb={createHeaderBreadcrumb(title)}
      />
    );


    const PlaceholderSection = ({ title, notes = [] }) => (
      <DataSection
        title={title}
        description="Placeholder padronizado. A implementação detalhada será feita na sprint específica desta tela."
      >
        <div className="ui-card border border-slate-200 bg-white/85 rounded-2xl p-4 space-y-2">
          {notes.map((note) => (
            <p key={note} className="text-sm text-slate-600">• {note}</p>
          ))}
        </div>
      </DataSection>
    );

    if (activeTab === 'overview') {
      return (
        <div className="space-y-6">
          {renderN1Header({ icon: 'home', title: 'Início', subtitle: 'Dashboard principal e visão consolidada', actions: [] })}
          <DataColumns columns={3}>
            <PlaceholderSection title="Seção 1 · Resumo operacional" notes={['Modelo padrão existente: DataSection + DataColumns + KpiGridRow.', 'Implantação posterior ao trabalhar a tela Início.']} />
            <PlaceholderSection title="Seção 2 · Agenda e alertas" notes={['Modelo padrão existente: cards + tabelas compactas.', 'Definição de conteúdo ficará para sprint da tela Início.']} />
            <PlaceholderSection title="Seção 3 · Atalhos estratégicos" notes={['Modelo padrão existente: actions header + widgets.', 'Conteúdo será definido na fase de detalhamento funcional.']} />
          </DataColumns>
        </div>
      );
    }

    if (activeTab === 'agenda') {
      return (
        <div className="space-y-6">
          {renderN1Header({ icon: 'calendar', title: 'Agenda', subtitle: 'Planejamento de atendimentos e compromissos', actions: [] })}
          <DataColumns columns={2}>
            <PlaceholderSection title="Seção 1 · Grade de horários" notes={['Modelo padrão existente: DataSection + DataColumns(2).', 'Implantação posterior para regras de bloqueio, encaixe e conflito.']} />
            <PlaceholderSection title="Seção 2 · Filtros e status" notes={['Modelo padrão existente: filtros por coluna e badges.', 'Conteúdo e colunas serão definidos na sprint da Agenda.']} />
          </DataColumns>
        </div>
      );
    }

    if (activeTab === 'patients') {
      return (
        <div className="space-y-6">
          {renderN1Header({ icon: 'users', title: 'Pacientes', subtitle: 'Gestão do cadastro clínico e prontuário', actions: [] })}
          <DataColumns columns={3}>
            <PlaceholderSection title="Seção 1 · Lista de pacientes" notes={['Modelo padrão existente: tabela com ações e paginação.', 'Implantação posterior na sprint de Pacientes.']} />
            <PlaceholderSection title="Seção 2 · Perfil clínico" notes={['Modelo padrão existente: cards de dados e histórico.', 'Definição de colunas e campos fica para próxima etapa.']} />
            <PlaceholderSection title="Seção 3 · Ações em lote" notes={['Modelo padrão existente: toolbar + seleção múltipla.', 'Implementação posterior no detalhamento da tela.']} />
          </DataColumns>
        </div>
      );
    }

    if (activeTab === 'profile') {
      return (
        <div className="space-y-6">
          {renderN1Header({ icon: TAB_META.profile.icon, title: 'Perfil', subtitle: 'Auth Supabase e preferências pessoais', actions: [] })}
          <DataColumns columns={2}>
            <PlaceholderSection title="Seção 1 · Conta e segurança" notes={['Modelo padrão existente: DataSection + formulários padrão.', 'Implantação posterior na sprint da tela Perfil.']} />
            <PlaceholderSection title="Seção 2 · Preferências e clínicas" notes={['Modelo padrão existente: colunas de dados configuráveis.', 'Conteúdo e contratos serão definidos quando abrirmos a tela Perfil.']} />
          </DataColumns>
        </div>
      );
    }

    if (activeTab === 'clinic') {
      return (
        <div className="space-y-6">
          {renderN1Header({ icon: 'id-card', title: 'Clínica', subtitle: 'Gestão da clínica e dados cadastrais', actions: [] })}
          <DataColumns columns={3}>
            <PlaceholderSection title="Seção 1 · Dados cadastrais" notes={['Modelo padrão existente: seção de dados em 1/2/3 colunas.', 'Implantação posterior com campos de cadastro e validação.']} />
            <PlaceholderSection title="Seção 2 · Fiscal e contratos" notes={['Modelo padrão existente: tabelas + ações de edição.', 'Regras serão definidas na sprint da tela Clínica.']} />
            <PlaceholderSection title="Seção 3 · Equipe e unidades" notes={['Modelo padrão existente: cartões e listas reutilizáveis.', 'Implementação posterior conforme roadmap.']} />
          </DataColumns>
        </div>
      );
    }

    const summary = summarizeFinancialData(financialLaunches);
    const contasReceber = financialLaunches.filter((item) => item.tipo === 'entrada');
    const contasPagar = financialLaunches.filter((item) => item.tipo === 'saida');
    const totalReceitas = contasReceber.reduce((acc, item) => acc + Number(item.valor || 0), 0);
    const totalDespesas = contasPagar.reduce((acc, item) => acc + Number(item.valor || 0), 0);
    const receitasConfirmadas = contasReceber.filter((item) => isFinancialLaunchConfirmed(item));
    const despesasConfirmadas = contasPagar.filter((item) => isFinancialLaunchConfirmed(item));
    const receitaRecebidaTotal = receitasConfirmadas.reduce((acc, item) => acc + Number(item.valor || 0), 0);
    const despesaPagaTotal = despesasConfirmadas.reduce((acc, item) => acc + Number(item.valor || 0), 0);
    const receitaAbertaTotal = Math.max(totalReceitas - receitaRecebidaTotal, 0);
    const despesaAbertaTotal = Math.max(totalDespesas - despesaPagaTotal, 0);
    const receiptRatio = totalReceitas > 0 ? (receitaRecebidaTotal / totalReceitas) : 0;
    const expenseRatio = totalDespesas > 0 ? (despesaPagaTotal / totalDespesas) : 0;
    const reconciliationRatio = totalDespesas > 0 ? Math.min(receitaRecebidaTotal / totalDespesas, 1) : 1;
    const getTimelineFromLaunches = (launches) => {
      const monthMap = launches.reduce((acc, item) => {
        const source = item.data_pagamento || item.data_competencia || item.data_vencimento;
        if (!source || !/^\d{4}-\d{2}/.test(source)) return acc;
        const monthKey = source.slice(0, 7);
        acc[monthKey] = (acc[monthKey] || 0) + Number(item.valor || 0);
        return acc;
      }, {});
      return Object.entries(monthMap)
        .sort((a, b) => a[0].localeCompare(b[0]))
        .slice(-6)
        .map(([month, total]) => ({ month: month.slice(5).replace('-', '/'), total }));
    };
    const receitasTimeline = getTimelineFromLaunches(contasReceber);
    const despesasTimeline = getTimelineFromLaunches(contasPagar);
    const conciliacaoTimeline = receitasTimeline.map((entry, index) => ({
      month: entry.month,
      total: Math.max(entry.total - Number(despesasTimeline[index]?.total || 0), 0)
    }));
    const conciliationStatus = (() => {
      const diff = receitaRecebidaTotal - despesaPagaTotal;
      if (diff >= 0) return { label: 'Superávit', tone: 'text-emerald-600', description: 'Fluxo positivo no período' };
      if (Math.abs(diff) <= totalDespesas * 0.1) return { label: 'Atenção', tone: 'text-amber-600', description: 'Margem curta para despesas' };
      return { label: 'Risco', tone: 'text-rose-600', description: 'Despesas superam recebimentos' };
    })();
    const financialHeroWidgets = [
      {
        key: 'receitas',
        toneClass: 'financial-hero-widget--receitas',
        title: 'Receitas consolidadas',
        primary: formatMoney(receitaRecebidaTotal),
        secondary: `A receber ${formatMoney(receitaAbertaTotal)}`,
        ratio: receiptRatio,
        ratioLabel: `${(receiptRatio * 100).toFixed(0)}% recebido`,
        trendSeries: receitasTimeline.map((entry) => entry.total),
        trendLabel: 'Linha de receitas',
        chartTone: '#10b981',
        chartVariant: 'line',
        actionLabel: 'Foco receitas',
        actionAria: 'Abrir lista de receitas para trabalhar o conjunto de dados',
        onAction: () => focusFinancialLaunches('entrada')
      },
      {
        key: 'despesas',
        toneClass: 'financial-hero-widget--despesas',
        title: 'Despesas consolidadas',
        primary: formatMoney(despesaPagaTotal),
        secondary: `A pagar ${formatMoney(despesaAbertaTotal)}`,
        ratio: expenseRatio,
        ratioLabel: `${(expenseRatio * 100).toFixed(0)}% quitado`,
        trendSeries: despesasTimeline.map((entry) => entry.total),
        trendLabel: 'Linha de despesas',
        chartTone: '#f43f5e',
        chartVariant: 'area',
        actionLabel: 'Foco despesas',
        actionAria: 'Abrir lista de despesas para dar baixa, editar ou excluir',
        onAction: () => focusFinancialLaunches('saida')
      },
      {
        key: 'conciliacao',
        toneClass: 'financial-hero-widget--conciliacao',
        title: 'Conciliação financeira',
        primary: formatMoney(receitaRecebidaTotal - despesaPagaTotal),
        secondary: `${conciliationStatus.label} · ${conciliationStatus.description}`,
        ratio: reconciliationRatio,
        ratioLabel: `${(reconciliationRatio * 100).toFixed(0)}% cobertura`,
        trendSeries: conciliacaoTimeline.map((entry) => entry.total),
        trendLabel: 'Linha de conciliação',
        chartTone: '#3b82f6',
        chartVariant: 'line',
        actionLabel: 'Conferir lançamentos',
        actionAria: 'Ir para a lista de lançamentos para conciliação',
        onAction: () => focusFinancialLaunches('all')
      }
    ];
    const contasFinanceirasWidgetRows = financialAccounts.filter((item) => (
      widgetFilters.contasFinanceiras.tipo === 'all'
      || item.tipo === widgetFilters.contasFinanceiras.tipo
    ));
    const recurringWidgetRows = financialRecurring.filter((item) => {
      const byPeriodicidade = widgetFilters.recorrencias.periodicidade === 'all' || item.periodicidade === widgetFilters.recorrencias.periodicidade;
      const byCategoria = widgetFilters.recorrencias.categoria === 'all' || (item.categoria || '-') === widgetFilters.recorrencias.categoria;
      const byStatus = widgetFilters.recorrencias.status === 'all' || (item.status || 'pendente') === widgetFilters.recorrencias.status;
      return byPeriodicidade && byCategoria && byStatus;
    });
    const forecastWidgetRows = financialForecasts.filter((item) => (
      (widgetFilters.previsoes.periodo === 'all' || item.periodo === widgetFilters.previsoes.periodo)
      && (widgetFilters.previsoes.comprometido === 'all'
        || (widgetFilters.previsoes.comprometido === 'sim' ? Boolean(item.comprometido) : !Boolean(item.comprometido)))
    ));
    const contasReceberWidgetRows = contasReceber.filter((item) => {
      if (widgetFilters.contasReceber.status === 'all') return true;
      if (widgetFilters.contasReceber.status === 'confirmados') return isFinancialLaunchConfirmed(item);
      if (widgetFilters.contasReceber.status === 'abertos') return !isFinancialLaunchConfirmed(item);
      return item.status === widgetFilters.contasReceber.status;
    });
    const contasPagarWidgetRows = contasPagar.filter((item) => {
      if (widgetFilters.contasPagar.status === 'all') return true;
      if (widgetFilters.contasPagar.status === 'confirmados') return isFinancialLaunchConfirmed(item);
      if (widgetFilters.contasPagar.status === 'abertos') return !isFinancialLaunchConfirmed(item);
      return item.status === widgetFilters.contasPagar.status;
    });
    const filteredAccounts = financialAccounts.filter((item) => `${item.nome} ${item.banco} ${item.tipo}`.toLowerCase().includes(accountFilter.toLowerCase()));
    const filteredRecurring = financialRecurring.filter((item) => `${item.descricao} ${item.periodicidade} ${item.categoria || ''}`.toLowerCase().includes(recurringFilter.toLowerCase()));
    const filteredForecasts = financialForecasts.filter((item) => `${item.descricao} ${item.periodo}`.toLowerCase().includes(forecastFilter.toLowerCase()));
    const filteredInCategories = financialCategories.entradas.filter((item) => item.toLowerCase().includes(categoryFilter.toLowerCase()));
    const filteredOutCategories = financialCategories.saidas.filter((item) => item.toLowerCase().includes(categoryFilter.toLowerCase()));
    const recurringCategories = Array.from(new Set(financialRecurring.map((item) => item.categoria || '-')));
    const forecastPeriods = Array.from(new Set(financialForecasts.map((item) => item.periodo)));
    const renderWidgetFilterDropdown = (content) => (
      <div className="financial-filter-dropdown">
        {content}
      </div>
    );
    const despesasPorCategoriaResumo = Object.entries(
      financialLaunches
        .filter((item) => item.tipo === 'saida')
        .reduce((acc, item) => {
          const key = item.categoria || 'Sem categoria';
          acc[key] = (acc[key] || 0) + Number(item.valor || 0);
          return acc;
        }, {})
    ).sort((a, b) => b[1] - a[1]).slice(0, 4);
    const contasFinanceirasTotal = contasFinanceirasWidgetRows.reduce((acc, item) => acc + Number(item.saldo_inicial || 0), 0);
    const recorrenciasTotal = recurringWidgetRows.reduce((acc, item) => acc + Number(item.valor || 0), 0);
    const previsoesTotal = forecastWidgetRows.reduce((acc, item) => acc + Number(item.valor || 0), 0);
    const categoriasReceitasTotal = financialLaunches
      .filter((item) => item.tipo === 'entrada')
      .reduce((acc, item) => acc + Number(item.valor || 0), 0);
    const categoriasDespesasTotal = financialLaunches
      .filter((item) => item.tipo === 'saida')
      .reduce((acc, item) => acc + Number(item.valor || 0), 0);
    const receitasPorCategoriaResumo = Object.entries(
      financialLaunches
        .filter((item) => item.tipo === 'entrada')
        .reduce((acc, item) => {
          const key = item.categoria || 'Sem categoria';
          acc[key] = (acc[key] || 0) + Number(item.valor || 0);
          return acc;
        }, {})
    ).sort((a, b) => b[1] - a[1]).slice(0, 4);
    const financialLaunchColumns = [
      { key: 'tipo', label: 'Tipo', render: (row) => <span className="text-slate-600 uppercase">{row.tipo}</span> },
      { key: 'descricao', label: 'Descrição', render: (row) => <span className="text-slate-600">{row.descricao}</span> },
      { key: 'categoria', label: 'Categoria', hideBelow: 1120, render: (row) => <span className="text-slate-600">{row.categoria}</span> },
      { key: 'valor', label: 'Valor', hideBelow: 520, sortValue: (row) => Number(row.valor || 0), render: (row) => <span className="text-slate-600">{formatMoney(row.valor)}</span> },
      { key: 'status', label: 'Status', hideBelow: 760, render: (row) => <StatusBadge status={row.status} /> },
      { key: 'vencimento', label: 'Vencimento', sortValue: (row) => row.data_vencimento || '', render: (row) => <span className="text-slate-600">{row.data_vencimento || '-'}</span> },
      { key: 'pagamento', label: 'Pagamento', hideBelow: 620, sortValue: (row) => row.data_pagamento || '', render: (row) => <span className="text-slate-600">{row.data_pagamento || '-'}</span> },
      {
        key: 'acoes_rapidas',
        label: 'Ações rápidas',
        sortable: false,
        render: (row) => (
          <div className="financial-row-actions">
            {!isFinancialLaunchConfirmed(row) ? (
              <FinancialWidgetIconButton ariaLabel="Confirmar lançamento" icon="check" tone="text-emerald-600" onClick={() => handleFinancialConfirm(row.id)} />
            ) : null}
            <FinancialWidgetIconButton ariaLabel="Editar lançamento" onClick={() => openFinancialEdit(row)} />
            <FinancialWidgetIconButton ariaLabel="Excluir lançamento" icon="close" tone="text-rose-600" onClick={() => handleFinancialDelete(row.id)} />
          </div>
        )
      }
    ];
    return (
      <div className="space-y-4 financial-layout--flat">
        {renderN1Header({
          icon: 'settings',
          title: 'Financeiro',
          subtitle: 'Visão geral da saúde financeira da clínica',
          actions: (
            <>
              <ActionButton
                label="Período"
                className="btn--header btn--header-muted"
                icon={<AppIcon name="calendar" size={14} />}
                onClick={() => setIsPeriodPickerOpen(true)}
              />
              <ActionButton
                label="Exportar relatório"
                className="btn--header btn--header-muted"
                icon={<AppIcon name="download" size={14} />}
                onClick={() => setIsExportModalOpen(true)}
              />
            </>
          )
        })}

        {isPeriodPickerOpen ? (
          <div className="finance-overlay" onClick={() => setIsPeriodPickerOpen(false)}>
            <div className="finance-overlay__panel" onClick={(event) => event.stopPropagation()}>
              <PanelCard className="financial-modal-card" title="Selecionar período">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <ActionButton label="Hoje" className="btn--header btn--header-muted" onClick={() => applyQuickPeriod('today')} />
                  <ActionButton label="Semana" className="btn--header btn--header-muted" onClick={() => applyQuickPeriod('week')} />
                  <ActionButton label="Mês" className="btn--header btn--header-muted" onClick={() => applyQuickPeriod('month')} />
                  <label className="text-xs font-black uppercase tracking-[0.12em] text-slate-400">Início
                    <input type="date" className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" value={periodDraft.from} onChange={(event) => setPeriodDraft((current) => ({ ...current, from: event.target.value }))} />
                  </label>
                  <label className="text-xs font-black uppercase tracking-[0.12em] text-slate-400">Fim
                    <input type="date" className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" value={periodDraft.to} onChange={(event) => setPeriodDraft((current) => ({ ...current, to: event.target.value }))} />
                  </label>
                </div>
                <div className="mt-3 flex justify-end gap-2">
                  <ActionButton label="Fechar" className="btn--header btn--header-muted" onClick={() => setIsPeriodPickerOpen(false)} />
                  <ActionButton label="Aplicar período" className="btn--header btn--header-new" onClick={applyCustomPeriod} />
                </div>
              </PanelCard>
            </div>
          </div>
        ) : null}

        {isExportModalOpen ? (
          <div className="finance-overlay" onClick={() => setIsExportModalOpen(false)}>
            <div className="finance-overlay__panel" onClick={(event) => event.stopPropagation()}>
              <PanelCard className="financial-modal-card" title="Exportar relatório financeiro">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <ActionButton label="Exportar PDF" className="btn--header btn--header-muted" icon={<AppIcon name="download" size={14} />} onClick={() => setIsExportModalOpen(false)} />
                  <ActionButton label="Exportar CSV" className="btn--header btn--header-muted" icon={<AppIcon name="download" size={14} />} onClick={() => setIsExportModalOpen(false)} />
                </div>
                <div className="mt-3 flex justify-end gap-2">
                  <ActionButton label="Fechar" className="btn--header btn--header-muted" onClick={() => setIsExportModalOpen(false)} />
                </div>
              </PanelCard>
            </div>
          </div>
        ) : null}

        <FinancialPageSection
          eyebrow="Nível 1 · visão consolidada"
          title="Resumo financeiro estratégico"
          description="Widgets consolidados para receitas, despesas e conciliação, com foco operacional em poucos cliques."
        >
          <FinancialSectionColumns variant="hero">
            <section className="financial-kpi-row financial-kpi-row--hero" aria-label="Consolidado financeiro com inspiração Bloomberg">
              {financialHeroWidgets.map((widget) => {
                return (
                  <article key={widget.key} className={`financial-hero-widget ${widget.toneClass}`}>
                    <div className="financial-hero-widget__header">
                      <div>
                        <p className="financial-hero-widget__eyebrow">{widget.title}</p>
                        <p className="financial-hero-widget__value">{widget.primary}</p>
                        <p className="financial-hero-widget__caption">{widget.secondary}</p>
                      </div>
                      <div className="financial-widget-actions">
                        <FinancialEditAction
                          ariaLabel={widget.actionAria}
                          onClick={widget.onAction}
                          icon="search"
                        />
                      </div>
                    </div>
                    <div className="financial-hero-widget__body">
                      <ChartDonut
                        value={widget.ratio}
                        label={widget.ratioLabel}
                        tone={widget.chartTone}
                        size={82}
                      />
                      <div className="financial-hero-widget__trend">
                        {widget.chartVariant === 'area' ? (
                          <ChartSparkArea points={widget.trendSeries} tone={widget.chartTone} />
                        ) : (
                          <ChartSparkLine points={widget.trendSeries} tone={widget.chartTone} />
                        )}
                        <p>{widget.trendLabel}</p>
                      </div>
                    </div>
                  </article>
                );
              })}
            </section>
          </FinancialSectionColumns>
        </FinancialPageSection>

        <FinancialPageSection
          eyebrow="Nível 1 · operação"
          title="Operação financeira diária"
          description="Módulos reutilizáveis por seção para contas, categorias e recorrências."
        >
          <FinancialSectionColumns variant="operation">
            <DataSection
              title="Configurações e cadastros"
              description="Elementos orientados a estrutura de dados, reutilizáveis em outras telas como Perfil."
            >
              <DataColumns columns={2}>
                <FinancialTableSectionCard
                  title="Contas financeiras"
                  addAriaLabel="Adicionar conta financeira"
                  onAdd={() => { setIsAccountsEditMode(false); setIsAccountModalOpen(true); }}
                  onToggleFilter={() => toggleWidgetFilter('contasFinanceiras')}
                  isFilterOpen={openWidgetFilter === 'contasFinanceiras'}
                  filterAriaLabel="Filtrar contas financeiras"
                  filterDropdown={renderWidgetFilterDropdown(
                    <label className="financial-filter-dropdown__field">
                      <span>Tipo da conta</span>
                      <select value={widgetFilters.contasFinanceiras.tipo} onChange={(event) => updateWidgetFilter('contasFinanceiras', 'tipo', event.target.value)}>
                        <option value="all">Todos</option>
                        <option value="corrente">Corrente</option>
                        <option value="poupanca">Poupança</option>
                      </select>
                    </label>
                  )}
                  columns={[
                    { key: 'nome', label: 'Conta', render: (row) => <span className="font-semibold text-slate-700">{row.nome}</span> },
                    { key: 'banco', label: 'Banco', hideBelow: 980, render: (row) => <span className="text-slate-500">{row.banco}</span> },
                    { key: 'tipo', label: 'Tipo', hideBelow: 740, render: (row) => <span className="text-slate-500">{row.tipo}</span> },
                    { key: 'saldo', label: 'Saldo inicial', hideBelow: 620, render: (row) => <span className="text-slate-700">{formatMoney(row.saldo_inicial)}</span> }
                  ]}
                  rows={contasFinanceirasWidgetRows.map((item) => ({ key: `account-${item.id}`, ...item }))}
                  emptyMessage="Nenhuma conta cadastrada."
                  footerTotals={[
                    { label: 'Registros', value: contasFinanceirasWidgetRows.length },
                    { label: 'Total saldo inicial', value: formatMoney(contasFinanceirasTotal) }
                  ]}
                />
                <SectionCard
                  className="financial-section-card financial-section-card--operation"
                  title="Categorias financeiras"
                  actions={(
                    <div className="financial-widget-actions">
                      <FinancialEditAction
                        ariaLabel="Abrir categorias financeiras"
                        onClick={() => setIsCategoriesEditMode(true)}
                        icon="expand"
                      />
                      <FinancialEditAction
                        ariaLabel="Adicionar categoria financeira"
                        onClick={() => { setIsCategoriesEditMode(false); setIsCategoryModalOpen(true); }}
                        icon="plus"
                      />
                      <FinancialEditAction
                        ariaLabel="Filtrar categorias financeiras"
                        onClick={() => setIsCategoriesEditMode(true)}
                        icon="filter"
                      />
                    </div>
                  )}
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="font-black text-slate-700 mb-2">Top receitas por categoria</p>
                      <div className="space-y-2">
                        {receitasPorCategoriaResumo.map(([categoria, total]) => (
                          <div key={`cat-income-${categoria}`}>
                            <div className="flex justify-between text-xs text-slate-600 mb-1">
                              <span>{categoria}</span><span>{formatMoney(total)}</span>
                            </div>
                            <div className="h-2 rounded bg-slate-100 overflow-hidden">
                              <div className="h-full bg-emerald-500" style={{ width: `${Math.min(100, (total / Math.max(receitasPorCategoriaResumo[0]?.[1] || 1, 1)) * 100)}%` }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="font-black text-slate-700 mb-2">Top despesas por categoria</p>
                      <div className="space-y-2">
                        {despesasPorCategoriaResumo.map(([categoria, total]) => (
                          <div key={`cat-expense-${categoria}`}>
                            <div className="flex justify-between text-xs text-slate-600 mb-1">
                              <span>{categoria}</span><span>{formatMoney(total)}</span>
                            </div>
                            <div className="h-2 rounded bg-slate-100 overflow-hidden">
                              <div className="h-full bg-rose-500" style={{ width: `${Math.min(100, (total / Math.max(despesasPorCategoriaResumo[0]?.[1] || 1, 1)) * 100)}%` }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 mt-3">A lista completa de categorias e ações fica disponível na janela de edição.</p>
                  <div className="financial-widget-totalizer mt-3">
                    <p><span>Total receitas</span><strong>{formatMoney(categoriasReceitasTotal)}</strong></p>
                    <p><span>Total despesas</span><strong>{formatMoney(categoriasDespesasTotal)}</strong></p>
                  </div>
                </SectionCard>
              </DataColumns>
            </DataSection>

            <DataSection
              title="Planejamento e recorrência"
              description="Seções de dados detalhados com variação de 1, 2 ou 3 colunas para reaproveitar em qualquer contexto."
            >
              <DataColumns columns={2}>
                <FinancialTableSectionCard
                  title="Despesas recorrentes"
                  addAriaLabel="Adicionar despesa recorrente"
                  onAdd={() => { setIsRecurringEditMode(false); setIsRecurringModalOpen(true); }}
                  onToggleFilter={() => toggleWidgetFilter('recorrencias')}
                  isFilterOpen={openWidgetFilter === 'recorrencias'}
                  filterAriaLabel="Filtrar recorrências"
                  filterDropdown={renderWidgetFilterDropdown(
                    <>
                      <label className="financial-filter-dropdown__field">
                        <span>Periodicidade</span>
                        <select value={widgetFilters.recorrencias.periodicidade} onChange={(event) => updateWidgetFilter('recorrencias', 'periodicidade', event.target.value)}>
                          <option value="all">Todas</option>
                          <option value="mensal">Mensal</option>
                          <option value="semanal">Semanal</option>
                        </select>
                      </label>
                      <label className="financial-filter-dropdown__field">
                        <span>Categoria</span>
                        <select value={widgetFilters.recorrencias.categoria} onChange={(event) => updateWidgetFilter('recorrencias', 'categoria', event.target.value)}>
                          <option value="all">Todas</option>
                          {recurringCategories.map((categoria) => <option key={categoria} value={categoria}>{categoria}</option>)}
                        </select>
                      </label>
                      <label className="financial-filter-dropdown__field">
                        <span>Status</span>
                        <select value={widgetFilters.recorrencias.status} onChange={(event) => updateWidgetFilter('recorrencias', 'status', event.target.value)}>
                          <option value="all">Todos</option>
                          <option value="pendente">Pendente</option>
                          <option value="pago">Pago</option>
                        </select>
                      </label>
                    </>
                  )}
                  columns={[
                    { key: 'descricao', label: 'Descrição', render: (row) => <span className="text-slate-600">{row.descricao}</span> },
                    { key: 'periodicidade', label: 'Periodicidade', hideBelow: 960, render: (row) => <span className="text-slate-600">{row.periodicidade}</span> },
                    { key: 'categoria', label: 'Categoria', hideBelow: 840, render: (row) => <span className="text-slate-600">{row.categoria || '-'}</span> },
                    { key: 'valor', label: 'Valor', hideBelow: 700, render: (row) => <span className="text-slate-600">{formatMoney(row.valor)}</span> },
                    { key: 'status', label: 'Status', hideBelow: 620, render: (row) => <StatusBadge status={row.status || 'pendente'} /> },
                    {
                      key: 'acoes',
                      label: 'Ações',
                      sortable: false,
                      render: (row) => (
                        <div className="financial-row-actions">
                          {(row.status || 'pendente') !== 'pago' ? <FinancialWidgetIconButton ariaLabel="Confirmar pagamento da parcela" icon="check" tone="text-emerald-600" onClick={() => confirmRecurringPayment(row.id)} /> : null}
                          <FinancialWidgetIconButton ariaLabel="Editar recorrência" onClick={() => editRecurring(row.id)} />
                          <FinancialWidgetIconButton ariaLabel="Excluir recorrência" icon="close" tone="text-rose-600" onClick={() => deleteRecurring(row.id)} />
                        </div>
                      )
                    }
                  ]}
                  rows={recurringWidgetRows.map((item) => ({ key: `rec-${item.id}`, ...item }))}
                  emptyMessage="Nenhuma despesa recorrente cadastrada."
                  footerTotals={[
                    { label: 'Registros', value: recurringWidgetRows.length },
                    { label: 'Total recorrências', value: formatMoney(recorrenciasTotal) }
                  ]}
                />
                <FinancialTableSectionCard
                  title="Previsões de custos"
                  addAriaLabel="Adicionar previsão de custo"
                  onAdd={() => { setIsForecastEditMode(false); setIsForecastModalOpen(true); }}
                  onToggleFilter={() => toggleWidgetFilter('previsoes')}
                  isFilterOpen={openWidgetFilter === 'previsoes'}
                  filterAriaLabel="Filtrar previsões"
                  filterDropdown={renderWidgetFilterDropdown(
                    <>
                      <label className="financial-filter-dropdown__field">
                        <span>Período</span>
                        <select value={widgetFilters.previsoes.periodo} onChange={(event) => updateWidgetFilter('previsoes', 'periodo', event.target.value)}>
                          <option value="all">Todos</option>
                          {forecastPeriods.map((periodo) => <option key={periodo} value={periodo}>{periodo}</option>)}
                        </select>
                      </label>
                      <label className="financial-filter-dropdown__field">
                        <span>Comprometido</span>
                        <select value={widgetFilters.previsoes.comprometido} onChange={(event) => updateWidgetFilter('previsoes', 'comprometido', event.target.value)}>
                          <option value="all">Todos</option>
                          <option value="sim">Sim</option>
                          <option value="nao">Não</option>
                        </select>
                      </label>
                    </>
                  )}
                  columns={[
                    { key: 'descricao', label: 'Descrição', render: (row) => <span className="text-slate-600">{row.descricao}</span> },
                    { key: 'periodo', label: 'Período', hideBelow: 960, render: (row) => <span className="text-slate-600">{row.periodo}</span> },
                    { key: 'valor', label: 'Valor previsto', hideBelow: 740, render: (row) => <span className="text-slate-600">{formatMoney(row.valor)}</span> },
                    { key: 'comprometido', label: 'Comprometido no período', hideBelow: 620, render: (row) => <StatusBadge status={row.comprometido ? 'pago' : 'previsto'} /> },
                    {
                      key: 'acoes',
                      label: 'Ações',
                      sortable: false,
                      render: (row) => (
                        <div className="financial-row-actions">
                          {!row.comprometido ? <FinancialWidgetIconButton ariaLabel="Marcar previsão como comprometida" icon="check" tone="text-emerald-600" onClick={() => toggleForecastCommitted(row.id)} /> : null}
                          <FinancialWidgetIconButton ariaLabel="Editar previsão" onClick={() => editForecast(row.id)} />
                          <FinancialWidgetIconButton ariaLabel="Excluir previsão" icon="close" tone="text-rose-600" onClick={() => deleteForecast(row.id)} />
                        </div>
                      )
                    }
                  ]}
                  rows={forecastWidgetRows.map((item) => ({ key: `fore-${item.id}`, ...item }))}
                  emptyMessage="Nenhuma previsão cadastrada."
                  footerTotals={[
                    { label: 'Registros', value: forecastWidgetRows.length },
                    { label: 'Total previsto', value: formatMoney(previsoesTotal) }
                  ]}
                />
              </DataColumns>
            </DataSection>
          </FinancialSectionColumns>
        </FinancialPageSection>

        {isAccountModalOpen || isAccountsEditMode ? (
          <div className="finance-overlay" onClick={() => { setIsAccountModalOpen(false); setIsAccountsEditMode(false); }}>
            <div className="finance-overlay__panel" onClick={(event) => event.stopPropagation()}>
              <PanelCard className="financial-modal-card" title={isAccountModalOpen ? 'Adicionar conta financeira' : 'Editar contas financeiras'}>
                {isAccountModalOpen ? (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                      <input className="rounded-xl border border-slate-200 px-3 py-2 text-sm" placeholder="Nome da conta" value={newAccountDraft.nome} onChange={(event) => setNewAccountDraft((current) => ({ ...current, nome: event.target.value }))} />
                      <input className="rounded-xl border border-slate-200 px-3 py-2 text-sm" placeholder="Banco" value={newAccountDraft.banco} onChange={(event) => setNewAccountDraft((current) => ({ ...current, banco: event.target.value }))} />
                      <select className="rounded-xl border border-slate-200 px-3 py-2 text-sm" value={newAccountDraft.tipo} onChange={(event) => setNewAccountDraft((current) => ({ ...current, tipo: event.target.value }))}>
                        <option value="corrente">corrente</option>
                        <option value="poupanca">poupança</option>
                      </select>
                      <input type="number" className="rounded-xl border border-slate-200 px-3 py-2 text-sm" placeholder="Saldo inicial" value={newAccountDraft.saldo_inicial} onChange={(event) => setNewAccountDraft((current) => ({ ...current, saldo_inicial: event.target.value }))} />
                    </div>
                    <div className="mt-3 flex justify-end gap-2">
                      <ActionButton label="Fechar" className="btn--header btn--header-muted" onClick={() => { setIsAccountModalOpen(false); setIsAccountsEditMode(false); }} />
                      <ActionButton label="Salvar conta" className="btn--header btn--header-new" onClick={addFinancialAccount} />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                      <input className="rounded-xl border border-slate-200 px-3 py-2 text-sm w-full md:max-w-xs" placeholder="Filtrar contas" value={accountFilter} onChange={(event) => setAccountFilter(event.target.value)} />
                      <FinancialTableAddIconButton ariaLabel="Adicionar conta" onClick={() => { setIsAccountsEditMode(false); setIsAccountModalOpen(true); }} />
                    </div>
                    <DataTable
                      columns={[
                        { key: 'nome', label: 'Conta', render: (row) => <span className="font-semibold text-slate-700">{row.nome}</span> },
                        { key: 'banco', label: 'Banco', render: (row) => <span className="text-slate-500">{row.banco}</span> },
                        { key: 'tipo', label: 'Tipo', render: (row) => <span className="text-slate-500">{row.tipo}</span> },
                        { key: 'saldo', label: 'Saldo inicial', sortValue: (row) => Number(row.saldo_inicial || 0), render: (row) => <span className="text-slate-700">{formatMoney(row.saldo_inicial)}</span> },
                        {
                          key: 'acoes',
                          label: 'Ações',
                          sortable: false,
                          render: (row) => (
                            <div className="financial-row-actions">
                              <FinancialWidgetIconButton ariaLabel="Editar conta financeira" onClick={() => editFinancialAccount(row.id)} />
                              <FinancialWidgetIconButton ariaLabel="Excluir conta financeira" icon="close" tone="text-rose-600" onClick={() => deleteFinancialAccount(row.id)} />
                            </div>
                          )
                        }
                      ]}
                      rows={filteredAccounts.map((item) => ({ key: `account-edit-${item.id}`, ...item }))}
                      paginated
                      compact
                      keepEmptyRows
                      footerTotals={[
                        { label: 'Registros', value: filteredAccounts.length },
                        { label: 'Saldo inicial', value: formatMoney(filteredAccounts.reduce((acc, item) => acc + Number(item.saldo_inicial || 0), 0)) }
                      ]}
                    />
                    <div className="mt-3 flex justify-end gap-2">
                      <ActionButton label="Fechar" className="btn--header btn--header-muted" onClick={() => { setIsAccountModalOpen(false); setIsAccountsEditMode(false); }} />
                      <FinancialTableAddIconButton ariaLabel="Adicionar conta" onClick={() => { setIsAccountsEditMode(false); setIsAccountModalOpen(true); }} />
                    </div>
                  </>
                )}
              </PanelCard>
            </div>
          </div>
        ) : null}

        {isCategoryModalOpen || isCategoriesEditMode ? (
          <div className="finance-overlay" onClick={() => { setIsCategoryModalOpen(false); setIsCategoriesEditMode(false); }}>
            <div className="finance-overlay__panel" onClick={(event) => event.stopPropagation()}>
              <PanelCard className="financial-modal-card" title={isCategoryModalOpen ? 'Adicionar categoria financeira' : 'Editar categorias financeiras'}>
                {isCategoryModalOpen ? (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                      <select className="rounded-xl border border-slate-200 px-3 py-2 text-sm" value={newCategoryDraft.tipo} onChange={(event) => setNewCategoryDraft((current) => ({ ...current, tipo: event.target.value }))}>
                        <option value="entradas">Receitas</option>
                        <option value="saidas">Despesas</option>
                      </select>
                      <input className="rounded-xl border border-slate-200 px-3 py-2 text-sm md:col-span-2" placeholder="Nome da categoria" value={newCategoryDraft.nome} onChange={(event) => setNewCategoryDraft((current) => ({ ...current, nome: event.target.value }))} />
                    </div>
                    <div className="mt-3 flex justify-end gap-2">
                      <ActionButton label="Fechar" className="btn--header btn--header-muted" onClick={() => { setIsCategoryModalOpen(false); setIsCategoriesEditMode(false); }} />
                      <ActionButton label="Salvar categoria" className="btn--header btn--header-new" onClick={addFinancialCategory} />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="mb-3 flex justify-center">
                      <input className="financial-category-filter rounded-xl border border-slate-200 px-3 py-2 text-sm w-full md:max-w-xs" placeholder="Filtrar categorias" value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)} />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="font-black text-slate-600 mb-2">Receitas</p>
                        <div className="flex flex-wrap gap-2">{filteredInCategories.map((item) => <button type="button" key={`cat-edit-in-${item}`} className="financial-category-chip financial-category-chip--in px-2 py-1 rounded-full border border-emerald-200 text-emerald-700 bg-emerald-50" onClick={() => handleCategoryDelete('entradas', item)}>{item}<span className="financial-category-chip__remove"><AppIcon name="close" size={10} /></span></button>)}</div>
                      </div>
                      <div>
                        <p className="font-black text-slate-600 mb-2">Despesas</p>
                        <div className="flex flex-wrap gap-2">{filteredOutCategories.map((item) => <button type="button" key={`cat-edit-out-${item}`} className="financial-category-chip financial-category-chip--out px-2 py-1 rounded-full border border-rose-200 text-rose-700 bg-rose-50" onClick={() => handleCategoryDelete('saidas', item)}>{item}<span className="financial-category-chip__remove"><AppIcon name="close" size={10} /></span></button>)}</div>
                      </div>
                    </div>
                    <div className="mt-3 flex justify-end gap-2">
                      <ActionButton label="Fechar" className="btn--header btn--header-muted" onClick={() => { setIsCategoryModalOpen(false); setIsCategoriesEditMode(false); }} />
                      <FinancialTableAddIconButton ariaLabel="Adicionar categoria" onClick={() => { setIsCategoriesEditMode(false); setIsCategoryModalOpen(true); }} />
                    </div>
                  </>
                )}
              </PanelCard>
            </div>
          </div>
        ) : null}

        {isRecurringModalOpen || isRecurringEditMode ? (
          <div className="finance-overlay" onClick={() => { setIsRecurringModalOpen(false); setIsRecurringEditMode(false); }}>
            <div className="finance-overlay__panel" onClick={(event) => event.stopPropagation()}>
              <PanelCard className="financial-modal-card" title={isRecurringModalOpen ? 'Adicionar despesa recorrente' : 'Editar despesas recorrentes'}>
                {isRecurringModalOpen ? (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                      <input className="rounded-xl border border-slate-200 px-3 py-2 text-sm md:col-span-2" placeholder="Descrição" value={newRecurringDraft.descricao} onChange={(event) => setNewRecurringDraft((current) => ({ ...current, descricao: event.target.value }))} />
                      <input type="number" className="rounded-xl border border-slate-200 px-3 py-2 text-sm" placeholder="Valor" value={newRecurringDraft.valor} onChange={(event) => setNewRecurringDraft((current) => ({ ...current, valor: event.target.value }))} />
                      <select className="rounded-xl border border-slate-200 px-3 py-2 text-sm" value={newRecurringDraft.periodicidade} onChange={(event) => setNewRecurringDraft((current) => ({ ...current, periodicidade: event.target.value }))}>
                        <option value="mensal">mensal</option>
                        <option value="semanal">semanal</option>
                      </select>
                    </div>
                    <div className="mt-3 flex justify-end gap-2"><ActionButton label="Fechar" className="btn--header btn--header-muted" onClick={() => { setIsRecurringModalOpen(false); setIsRecurringEditMode(false); }} /><ActionButton label="Salvar recorrência" className="btn--header btn--header-new" onClick={addRecurring} /></div>
                  </>
                ) : (
                  <>
                    <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                      <input className="rounded-xl border border-slate-200 px-3 py-2 text-sm w-full md:max-w-xs" placeholder="Filtrar recorrências" value={recurringFilter} onChange={(event) => setRecurringFilter(event.target.value)} />
                      <FinancialTableAddIconButton ariaLabel="Adicionar recorrência" onClick={() => { setIsRecurringEditMode(false); setIsRecurringModalOpen(true); }} />
                    </div>
                    <DataTable
                      columns={[
                        { key: 'descricao', label: 'Descrição', render: (row) => <span className="text-slate-600">{row.descricao}</span> },
                        { key: 'periodicidade', label: 'Periodicidade', render: (row) => <span className="text-slate-600">{row.periodicidade}</span> },
                        { key: 'categoria', label: 'Categoria', render: (row) => <span className="text-slate-600">{row.categoria || '-'}</span> },
                        { key: 'valor', label: 'Valor', sortValue: (row) => Number(row.valor || 0), render: (row) => <span className="text-slate-600">{formatMoney(row.valor)}</span> },
                        { key: 'status', label: 'Status', sortValue: (row) => row.status || 'pendente', render: (row) => <StatusBadge status={row.status || 'pendente'} /> },
                        {
                          key: 'acoes',
                          label: 'Ações',
                          sortable: false,
                          render: (row) => (
                            <div className="financial-row-actions">
                              {(row.status || 'pendente') !== 'pago' ? <FinancialWidgetIconButton ariaLabel="Confirmar pagamento da parcela" icon="check" tone="text-emerald-600" onClick={() => confirmRecurringPayment(row.id)} /> : null}
                              <FinancialWidgetIconButton ariaLabel="Editar recorrência" onClick={() => editRecurring(row.id)} />
                              <FinancialWidgetIconButton ariaLabel="Excluir recorrência" icon="close" tone="text-rose-600" onClick={() => deleteRecurring(row.id)} />
                            </div>
                          )
                        }
                      ]}
                      rows={filteredRecurring.map((item) => ({ key: `rec-edit-${item.id}`, ...item }))}
                      paginated
                      compact
                      keepEmptyRows
                      footerTotals={[
                        { label: 'Registros', value: filteredRecurring.length },
                        { label: 'Total', value: formatMoney(filteredRecurring.reduce((acc, item) => acc + Number(item.valor || 0), 0)) }
                      ]}
                    />
                    <div className="mt-3 flex justify-end gap-2">
                      <ActionButton label="Fechar" className="btn--header btn--header-muted" onClick={() => { setIsRecurringModalOpen(false); setIsRecurringEditMode(false); }} />
                      <FinancialTableAddIconButton ariaLabel="Adicionar recorrência" onClick={() => { setIsRecurringEditMode(false); setIsRecurringModalOpen(true); }} />
                    </div>
                  </>
                )}
              </PanelCard>
            </div>
          </div>
        ) : null}

        {isForecastModalOpen || isForecastEditMode ? (
          <div className="finance-overlay" onClick={() => { setIsForecastModalOpen(false); setIsForecastEditMode(false); }}>
            <div className="finance-overlay__panel" onClick={(event) => event.stopPropagation()}>
              <PanelCard className="financial-modal-card" title={isForecastModalOpen ? 'Adicionar previsão de custo' : 'Editar previsões de custo'}>
                {isForecastModalOpen ? (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                      <input className="rounded-xl border border-slate-200 px-3 py-2 text-sm" placeholder="Descrição" value={newForecastDraft.descricao} onChange={(event) => setNewForecastDraft((current) => ({ ...current, descricao: event.target.value }))} />
                      <input type="number" className="rounded-xl border border-slate-200 px-3 py-2 text-sm" placeholder="Valor" value={newForecastDraft.valor} onChange={(event) => setNewForecastDraft((current) => ({ ...current, valor: event.target.value }))} />
                      <select className="rounded-xl border border-slate-200 px-3 py-2 text-sm" value={newForecastDraft.periodo} onChange={(event) => setNewForecastDraft((current) => ({ ...current, periodo: event.target.value }))}>
                        <option value="Próximos 15 dias">Próximos 15 dias</option>
                        <option value="Próximos 30 dias">Próximos 30 dias</option>
                        <option value="Próximos 90 dias">Próximos 90 dias</option>
                      </select>
                    </div>
                    <div className="mt-3 flex justify-end gap-2"><ActionButton label="Fechar" className="btn--header btn--header-muted" onClick={() => { setIsForecastModalOpen(false); setIsForecastEditMode(false); }} /><ActionButton label="Salvar previsão" className="btn--header btn--header-new" onClick={addForecast} /></div>
                  </>
                ) : (
                  <>
                    <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                      <input className="rounded-xl border border-slate-200 px-3 py-2 text-sm w-full md:max-w-xs" placeholder="Filtrar previsões" value={forecastFilter} onChange={(event) => setForecastFilter(event.target.value)} />
                      <FinancialTableAddIconButton ariaLabel="Adicionar previsão" onClick={() => { setIsForecastEditMode(false); setIsForecastModalOpen(true); }} />
                    </div>
                    <DataTable
                      columns={[
                        { key: 'descricao', label: 'Descrição', render: (row) => <span className="text-slate-600">{row.descricao}</span> },
                        { key: 'periodo', label: 'Período', render: (row) => <span className="text-slate-600">{row.periodo}</span> },
                        { key: 'valor', label: 'Valor previsto', sortValue: (row) => Number(row.valor || 0), render: (row) => <span className="text-slate-600">{formatMoney(row.valor)}</span> },
                        { key: 'comprometido', label: 'Comprometido no período', sortValue: (row) => (row.comprometido ? 1 : 0), render: (row) => <StatusBadge status={row.comprometido ? 'pago' : 'previsto'} /> },
                        {
                          key: 'acoes',
                          label: 'Ações',
                          sortable: false,
                          render: (row) => (
                            <div className="financial-row-actions">
                              {!row.comprometido ? <FinancialWidgetIconButton ariaLabel="Marcar previsão como comprometida" icon="check" tone="text-emerald-600" onClick={() => toggleForecastCommitted(row.id)} /> : null}
                              <FinancialWidgetIconButton ariaLabel="Editar previsão" onClick={() => editForecast(row.id)} />
                              <FinancialWidgetIconButton ariaLabel="Excluir previsão" icon="close" tone="text-rose-600" onClick={() => deleteForecast(row.id)} />
                            </div>
                          )
                        }
                      ]}
                      rows={filteredForecasts.map((item) => ({ key: `forecast-edit-${item.id}`, ...item }))}
                      paginated
                      compact
                      keepEmptyRows
                      footerTotals={[
                        { label: 'Registros', value: filteredForecasts.length },
                        { label: 'Total previsto', value: formatMoney(filteredForecasts.reduce((acc, item) => acc + Number(item.valor || 0), 0)) }
                      ]}
                    />
                    <div className="mt-3 flex justify-end gap-2">
                      <ActionButton label="Fechar" className="btn--header btn--header-muted" onClick={() => { setIsForecastModalOpen(false); setIsForecastEditMode(false); }} />
                      <FinancialTableAddIconButton ariaLabel="Adicionar previsão" onClick={() => { setIsForecastEditMode(false); setIsForecastModalOpen(true); }} />
                    </div>
                  </>
                )}
              </PanelCard>
            </div>
          </div>
        ) : null}

        <FinancialSectionColumns variant="operation">
          <DataSection
            title="Contas a receber e pagar"
            description="Grade de dados detalhados parametrizada em duas colunas, reaproveitável em outros módulos."
          >
            <DataColumns columns={2}>
            <FinancialTablePanelCard
              title="Contas a receber"
              onAdd={() => openFinancialCreate('entrada')}
              addAriaLabel="Adicionar conta a receber"
              onToggleFilter={() => toggleWidgetFilter('contasReceber')}
              isFilterOpen={openWidgetFilter === 'contasReceber'}
              filterAriaLabel="Filtrar contas a receber"
              filterDropdown={renderWidgetFilterDropdown(
                <label className="financial-filter-dropdown__field">
                  <span>Status</span>
                  <select value={widgetFilters.contasReceber.status} onChange={(event) => updateWidgetFilter('contasReceber', 'status', event.target.value)}>
                    <option value="all">Todos</option>
                    <option value="abertos">Abertos</option>
                    <option value="confirmados">Confirmados</option>
                    <option value="previsto">Previsto</option>
                    <option value="vencido">Vencido</option>
                  </select>
                </label>
              )}
              columns={[
                { key: 'origem', label: 'Paciente/Origem', render: (row) => <span className="text-slate-600">{row.origem}</span> },
                { key: 'vencimento', label: 'Vencimento', sortValue: (row) => row.data_vencimento || '', render: (row) => <span className="text-slate-600">{row.data_vencimento || '-'}</span> },
                { key: 'valor', label: 'Valor', hideBelow: 520, sortValue: (row) => Number(row.valor || 0), render: (row) => <span className="text-slate-600">{formatMoney(row.valor)}</span> },
                { key: 'status', label: 'Status', hideBelow: 680, render: (row) => <StatusBadge status={row.status} /> },
                {
                  key: 'acoes',
                  label: 'Ações',
                  sortable: false,
                  render: (row) => (
                    <div className="financial-row-actions">
                      {!isFinancialLaunchConfirmed(row) ? <FinancialWidgetIconButton ariaLabel="Dar baixa no lançamento" icon="check" tone="text-emerald-600" onClick={() => handleFinancialConfirm(row.id)} /> : null}
                      <FinancialWidgetIconButton ariaLabel="Editar lançamento" onClick={() => openFinancialEdit(row)} />
                      <FinancialWidgetIconButton ariaLabel="Cancelar lançamento" icon="close" tone="text-rose-600" onClick={() => handleFinancialCancel(row.id)} />
                    </div>
                  )
                }
              ]}
              rows={contasReceberWidgetRows.map((item) => ({ key: `receber-${item.id}`, ...item }))}
              footerClassName="text-emerald-700"
              footerValue={formatMoney(contasReceberWidgetRows.reduce((acc, item) => acc + Number(item.valor || 0), 0))}
            />
            <FinancialTablePanelCard
              title="Contas a pagar"
              onAdd={() => openFinancialCreate('saida')}
              addAriaLabel="Adicionar conta a pagar"
              onToggleFilter={() => toggleWidgetFilter('contasPagar')}
              isFilterOpen={openWidgetFilter === 'contasPagar'}
              filterAriaLabel="Filtrar contas a pagar"
              filterDropdown={renderWidgetFilterDropdown(
                <label className="financial-filter-dropdown__field">
                  <span>Status</span>
                  <select value={widgetFilters.contasPagar.status} onChange={(event) => updateWidgetFilter('contasPagar', 'status', event.target.value)}>
                    <option value="all">Todos</option>
                    <option value="abertos">Abertos</option>
                    <option value="confirmados">Confirmados</option>
                    <option value="previsto">Previsto</option>
                    <option value="vencido">Vencido</option>
                  </select>
                </label>
              )}
              columns={[
                { key: 'origem', label: 'Fornecedor', render: (row) => <span className="text-slate-600">{row.origem}</span> },
                { key: 'vencimento', label: 'Vencimento', sortValue: (row) => row.data_vencimento || '', render: (row) => <span className="text-slate-600">{row.data_vencimento || '-'}</span> },
                { key: 'valor', label: 'Valor', hideBelow: 520, sortValue: (row) => Number(row.valor || 0), render: (row) => <span className="text-slate-600">{formatMoney(row.valor)}</span> },
                { key: 'status', label: 'Status', hideBelow: 680, render: (row) => <StatusBadge status={row.status} /> },
                {
                  key: 'acoes',
                  label: 'Ações',
                  sortable: false,
                  render: (row) => (
                    <div className="financial-row-actions">
                      {!isFinancialLaunchConfirmed(row) ? <FinancialWidgetIconButton ariaLabel="Dar baixa no lançamento" icon="check" tone="text-emerald-600" onClick={() => handleFinancialConfirm(row.id)} /> : null}
                      <FinancialWidgetIconButton ariaLabel="Editar lançamento" onClick={() => openFinancialEdit(row)} />
                      <FinancialWidgetIconButton ariaLabel="Cancelar lançamento" icon="close" tone="text-rose-600" onClick={() => handleFinancialCancel(row.id)} />
                    </div>
                  )
                }
              ]}
              rows={contasPagarWidgetRows.map((item) => ({ key: `pagar-${item.id}`, ...item }))}
              footerClassName="text-rose-700"
              footerValue={formatMoney(contasPagarWidgetRows.reduce((acc, item) => acc + Number(item.valor || 0), 0))}
            />
            </DataColumns>
          </DataSection>

          <DataSection
            title="Lançamentos financeiros"
            description="Exemplo de seção em uma coluna para histórico completo e ações rápidas."
          >
            <DataColumns columns={1}>
              <div ref={financialLaunchesSectionRef}>
                <FinancialTableSectionCard
                  title="Lançamentos"
                  layout="single"
                  addAriaLabel="Novo lançamento"
                  onAdd={() => openFinancialCreate('entrada')}
                  onToggleFilter={() => focusFinancialLaunches('all')}
                  filterAriaLabel="Filtrar lançamentos"
                  columns={financialLaunchColumns}
                  rows={financialLaunches.map((item) => ({ key: `launch-${item.id}`, ...item }))}
                  emptyMessage="Nenhum lançamento financeiro cadastrado."
                  footerTotals={[
                    { label: 'Registros', value: financialLaunches.length },
                    { label: 'Total lançamentos', value: formatMoney(financialLaunches.reduce((acc, item) => acc + Number(item.valor || 0), 0)) }
                  ]}
                />
              </div>
            </DataColumns>
          </DataSection>
        </FinancialSectionColumns>

        {isFinancialFormOpen ? (
          <div className="finance-overlay" onClick={closeFinancialForm}>
            <div className="finance-overlay__panel" onClick={(event) => event.stopPropagation()}>
              <PanelCard
                className="financial-modal-card financial-launch-modal-card"
                titleClassName="financial-launch-modal-card__title"
                title={
                  financialDraft.id
                    ? 'Editar lançamento'
                    : financialDraft.tipo === 'saida'
                      ? 'Adicionar despesa'
                      : 'Adicionar receita'
                }
                extra={null}
              >
                <div className="financial-launch-modal-card__body">
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                  <label className="text-xs font-black uppercase tracking-[0.12em] text-slate-400">Tipo
                    <select className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" value={financialDraft.tipo} onChange={(event) => handleFinancialDraftChange('tipo', event.target.value)}>
                      <option value="entrada">entrada</option>
                      <option value="saida">saida</option>
                    </select>
                  </label>
                  <label className="text-xs font-black uppercase tracking-[0.12em] text-slate-400">Descrição
                    <input className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" value={financialDraft.descricao} onChange={(event) => handleFinancialDraftChange('descricao', event.target.value)} />
                  </label>
                  <label className="text-xs font-black uppercase tracking-[0.12em] text-slate-400">Categoria
                    <input className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" value={financialDraft.categoria} onChange={(event) => handleFinancialDraftChange('categoria', event.target.value)} />
                  </label>
                  <label className="text-xs font-black uppercase tracking-[0.12em] text-slate-400">Subcategoria
                    <input className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" value={financialDraft.subcategoria} onChange={(event) => handleFinancialDraftChange('subcategoria', event.target.value)} />
                  </label>
                  <label className="text-xs font-black uppercase tracking-[0.12em] text-slate-400">Valor
                    <input type="number" min="0" step="0.01" className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" value={financialDraft.valor} onChange={(event) => handleFinancialDraftChange('valor', event.target.value)} />
                  </label>
                  <label className="text-xs font-black uppercase tracking-[0.12em] text-slate-400">Status
                    <select className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" value={financialDraft.status} onChange={(event) => handleFinancialDraftChange('status', event.target.value)}>
                      <option value="previsto">previsto</option>
                      <option value="pago">pago</option>
                      <option value="recebido">recebido</option>
                      <option value="vencido">vencido</option>
                    </select>
                  </label>
                  <label className="text-xs font-black uppercase tracking-[0.12em] text-slate-400">Competência
                    <input type="date" className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" value={financialDraft.data_competencia} onChange={(event) => handleFinancialDraftChange('data_competencia', event.target.value)} />
                  </label>
                  <label className="text-xs font-black uppercase tracking-[0.12em] text-slate-400">Vencimento
                    <input type="date" className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" value={financialDraft.data_vencimento} onChange={(event) => handleFinancialDraftChange('data_vencimento', event.target.value)} />
                  </label>
                  <label className="text-xs font-black uppercase tracking-[0.12em] text-slate-400">Pagamento
                    <input type="date" className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" value={financialDraft.data_pagamento} onChange={(event) => handleFinancialDraftChange('data_pagamento', event.target.value)} />
                  </label>
                  <label className="text-xs font-black uppercase tracking-[0.12em] text-slate-400">Origem
                    <input className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" value={financialDraft.origem} onChange={(event) => handleFinancialDraftChange('origem', event.target.value)} />
                  </label>
                  <label className="text-xs font-black uppercase tracking-[0.12em] text-slate-400">Paciente ID
                    <input type="number" min="1" className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" value={financialDraft.paciente_id} onChange={(event) => handleFinancialDraftChange('paciente_id', event.target.value)} />
                  </label>
                  <label className="text-xs font-black uppercase tracking-[0.12em] text-slate-400">Profissional ID
                    <input type="number" min="1" className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" value={financialDraft.profissional_id} onChange={(event) => handleFinancialDraftChange('profissional_id', event.target.value)} />
                  </label>
                  <label className="text-xs font-black uppercase tracking-[0.12em] text-slate-400 md:col-span-2 xl:col-span-3">Observações
                    <textarea className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm min-h-[96px]" value={financialDraft.observacoes} onChange={(event) => handleFinancialDraftChange('observacoes', event.target.value)} />
                  </label>
                </div>
                </div>
                <div className="financial-launch-modal-card__footer mt-4 flex justify-end gap-2">
                  <ActionButton label="Cancelar" className="btn--header btn--header-muted financial-launch-modal-card__cancel" onClick={closeFinancialForm} />
                  <ActionButton label="Salvar lançamento" className="btn--header btn--header-new financial-launch-modal-card__save" onClick={handleFinancialSave} />
                </div>
              </PanelCard>
            </div>
          </div>
        ) : null}
      </div>
    );
  };

  const mobileNavActionConfigByTab = {
    overview: {
      left: [
        { key: 'overview-patients', icon: 'users', tone: 'patients', label: 'Pacientes', onClick: () => goToLevel1('patients') },
        { key: 'overview-agenda', icon: 'calendar', tone: 'agenda', label: 'Agenda', onClick: () => goToLevel1('agenda') }
      ],
      center: { key: 'overview-clinic', icon: 'id-card', tone: 'account', label: 'Clínica', onClick: () => goToLevel1('clinic') },
      right: [
        { key: 'overview-financial', icon: 'plan', tone: 'settings', label: 'Financeiro', onClick: () => goToLevel1('financial') },
        { key: 'overview-profile', icon: 'id-card', tone: 'account', label: 'Perfil', onClick: () => goToLevel1('profile') }
      ]
    },
    agenda: {
      left: [
        { key: 'agenda-overview', icon: 'home', tone: 'overview', label: 'Início', onClick: () => goToLevel1('overview') }
      ],
      right: [
        { key: 'agenda-search', icon: 'search', tone: 'search', label: 'Buscar', onClick: () => setAppointmentsQuery('') }
      ]
    },
    patients: {
      left: [
        { key: 'patients-overview', icon: 'home', tone: 'overview', label: 'Início', onClick: () => goToLevel1('overview') },
        { key: 'patients-filter', icon: 'filter', tone: 'settings', label: 'Filtrar', onClick: () => setIsPatientsSortLevelOpen(true) }
      ],
      center: { key: 'patients-add', icon: 'plus', tone: 'success', label: 'Adicionar', onClick: openCreatePatientN2 },
      right: [
        { key: 'patients-search', icon: 'search', tone: 'search', label: 'Buscar', onClick: () => setIsPatientsSearchVisible((prev) => !prev), active: isPatientsSearchVisible },
        { key: 'patients-edit', icon: 'edit', tone: 'info', label: 'Editar', onClick: handleOpenPatientEdit }
      ]
    },
    financial: {
      left: [
        { key: 'financial-period', icon: 'calendar', tone: 'settings', label: 'Período', onClick: () => setIsPeriodPickerOpen(true) },
        { key: 'financial-receita', icon: 'plus', tone: 'success', label: 'Receita', onClick: () => openFinancialCreate('entrada') }
      ],
      center: { key: 'financial-panel', icon: 'plan', tone: 'settings', label: 'Painel', onClick: () => goToLevel1('financial') },
      right: [
        { key: 'financial-despesa', icon: 'plus', tone: 'info', label: 'Despesa', onClick: () => openFinancialCreate('saida') },
        { key: 'financial-export', icon: 'download', tone: 'overview', label: 'Exportar', onClick: () => setIsExportModalOpen(true) }
      ]
    },
    clinic: {
      left: [
        { key: 'clinic-overview', icon: 'home', tone: 'overview', label: 'Início', onClick: () => goToLevel1('overview') },
        { key: 'clinic-new', icon: 'plus', tone: 'account', label: 'Nova', onClick: handleOpenClinicCreateN2 }
      ],
      center: { key: 'clinic-add', icon: 'plus', tone: 'account', label: 'Adicionar', onClick: handleOpenClinicCreateN2 },
      right: [
        { key: 'clinic-profile', icon: 'id-card', tone: 'account', label: 'Perfil', onClick: () => goToLevel1('profile') }
      ]
    },
    profile: {
      left: [
        { key: 'account-overview', icon: 'home', tone: 'overview', label: 'Início', onClick: () => goToLevel1('overview') },
        { key: 'account-patients', icon: 'users', tone: 'patients', label: 'Pacientes', onClick: () => goToLevel1('patients') }
      ],
      right: [
        { key: 'account-edit', icon: 'edit', tone: 'info', label: 'Editar', onClick: openAccountEditN2 },
        { key: 'account-clinics', icon: 'id-card', tone: 'account', label: 'Clínicas', onClick: handleOpenClinicN2 }
      ]
    }
  };

  const mobileNavActionConfig = (() => {
    const createRecordNavPattern = ({
      prefix,
      onPrevious,
      onNext,
      onSave,
      onCancel,
      onClear,
      disablePrevious = false,
      disableNext = false
    }) => ({
      left: [
        { key: `${prefix}-clear`, icon: 'clear', tone: 'info', label: 'Limpar', onClick: onClear },
        { key: `${prefix}-prev`, icon: 'chevron-left', tone: 'overview', label: 'Anterior', onClick: onPrevious, disabled: disablePrevious }
      ],
      center: { key: `${prefix}-save`, icon: 'check', tone: 'success', label: 'Salvar', onClick: onSave },
      right: [
        { key: `${prefix}-cancel`, icon: 'close', tone: 'neutral', label: 'Cancelar', onClick: onCancel },
        { key: `${prefix}-next`, icon: 'chevron-right', tone: 'patients', label: 'Próxima', onClick: onNext, disabled: disableNext }
      ]
    });

    const currentPatientTabIndex = PATIENT_FORM_TABS.findIndex((tab) => tab.id === patientFormTab);
    const isFirstPatientTab = currentPatientTabIndex <= 0;
    const isLastPatientTab = currentPatientTabIndex >= PATIENT_FORM_TABS.length - 1;

    if (showPatientN2 && patientModalMode === 'create') {
      return createRecordNavPattern({
        prefix: 'patient-create',
        onPrevious: () => moveFormTab(-1),
        onNext: () => moveFormTab(1),
        onSave: handleCreatePatientSubmit,
        onCancel: () => {
          setShowPatientN2(false);
          setPatientFormTab(PATIENT_FORM_TABS[0].id);
          setFormFeedback('');
        },
        onClear: () => {
          setNewPatientForm(createEmptyPatientForm());
          setPatientFormTab(PATIENT_FORM_TABS[0].id);
          setFormFeedback('');
        },
        disablePrevious: isFirstPatientTab,
        disableNext: isLastPatientTab
      });
    }

    if (isClinicN2Open && !selectedClinicId) {
      return createRecordNavPattern({
        prefix: 'clinic-create',
        onPrevious: () => {},
        onNext: () => {},
        onSave: handleSaveClinic,
        onCancel: () => {
          setIsClinicN2Open(false);
          setClinicActionStatus('idle');
          setClinicActionMessage('');
        },
        onClear: () => {
          setSelectedClinicId('');
          setClinicDraft(toClinicDraft(null));
          setClinicActionStatus('idle');
          setClinicActionMessage('');
        },
        disablePrevious: true,
        disableNext: true
      });
    }

    if (isClinicN2Open) {
      return {
        left: [
          { key: 'clinic-cancel', icon: 'close', tone: 'neutral', label: 'Cancelar', onClick: () => setIsClinicN2Open(false) },
          { key: 'clinic-duplicate', icon: 'edit', tone: 'info', label: 'Duplicar', onClick: handleDuplicateClinic }
        ],
        center: { key: 'clinic-save', icon: 'check', tone: 'success', label: 'Salvar', onClick: handleSaveClinic },
        right: [
          { key: 'clinic-delete', icon: 'close', tone: 'danger', label: 'Excluir', onClick: handleDeleteClinic },
          { key: 'clinic-archive', icon: 'archive', tone: 'settings', label: 'Arquivar', onClick: handleArchiveClinic }
        ]
      };
    }

    if (showPatientN2) {
      return {
        left: [
          { key: 'patient-clear', icon: 'clear', tone: 'info', label: 'Limpar', onClick: () => { setPatientViewForm(createEmptyPatientForm()); setFormFeedback(''); } },
          { key: 'patient-prev', icon: 'chevron-left', tone: 'overview', label: 'Anterior', onClick: () => moveFormTab(-1) }
        ],
        center: {
          key: 'patient-save',
          icon: 'check',
          tone: 'success',
          label: patientModalMode === 'create' ? 'Salvar' : (isPatientViewEditing ? 'Salvar' : 'Editar'),
          onClick: patientModalMode === 'create'
            ? handleCreatePatientSubmit
            : (isPatientViewEditing ? handleSavePatientEdit : handleStartPatientEdit)
        },
        right: [
          { key: 'patient-next', icon: 'chevron-right', tone: 'patients', label: 'Próxima', onClick: () => moveFormTab(1) },
          { key: 'patient-cancel', icon: 'close', tone: 'neutral', label: 'Cancelar', onClick: () => setShowPatientN2(false) }
        ]
      };
    }

    if (isAccountEditN2Open || isPublicProfileN2Open) {
      return {
        left: [
          { key: 'account-cancel', icon: 'close', tone: 'neutral', label: 'Cancelar', onClick: () => { setIsAccountEditN2Open(false); setIsPublicProfileN2Open(false); } },
          { key: 'account-open', icon: 'id-card', tone: 'account', label: 'Perfil', onClick: () => goToLevel1('profile') }
        ],
        center: {
          key: 'account-save',
          icon: 'check',
          tone: 'success',
          label: 'Salvar',
          onClick: isPublicProfileN2Open ? handleSavePublicProfile : handleAccountUpdate
        },
      right: [
          { key: 'account-profile', icon: 'edit', tone: 'info', label: 'Perfil', onClick: openPublicProfileEditN2 },
          { key: 'account-close', icon: 'close', tone: 'neutral', label: 'Cancelar', onClick: () => { setIsAccountEditN2Open(false); setIsPublicProfileN2Open(false); } }
        ]
      };
    }

    return mobileNavActionConfigByTab[activeTab] || mobileNavActionConfigByTab.overview;
  })();
  const embeddedWindowNav = (
    <MobileMd3Nav
      visible
      embedded
      leftActions={mobileNavActionConfig.left}
      centerAction={mobileNavActionConfig.center}
      rightActions={mobileNavActionConfig.right}
    />
  );

  return (
    <AppShell
      sidebar={(
        <AppSidebar
          isVisible={isWideNavigation}
          authEmail={authEmail}
          tabs={LEVEL1_TABS}
          activeTab={activeTab}
          onTabChange={goToLevel1}
        />
      )}
      mobileHeader={!isWideNavigation ? (
        <header className="app-mobile-header">
          <button
            type="button"
            className="btn btn--ghost app-mobile-header__menu-btn"
            onClick={() => setIsSidebarDrawerOpen(true)}
            aria-label="Abrir barra lateral"
          >
            <AppIcon name="menu" size={16} />
          </button>
          <div className="app-mobile-header__brand">
            <span className="app-mobile-header__title">OdontoFlow</span>
            <span className="app-mobile-header__subtitle">{TAB_META[activeTab]?.label || 'Início'}</span>
          </div>
        </header>
      ) : null}
    >
      {isSidebarDrawerOpen ? (
        <div className="app-sidebar-drawer" role="dialog" aria-modal="true" aria-label="Menu lateral">
          <button
            type="button"
            className="app-sidebar-drawer__backdrop"
            aria-label="Fechar menu lateral"
            onClick={() => setIsSidebarDrawerOpen(false)}
          />
          <div className="app-sidebar-drawer__panel">
            <AppSidebar
              isVisible
              authEmail={authEmail}
              tabs={LEVEL1_TABS}
              activeTab={activeTab}
              onTabChange={(tabId) => {
                goToLevel1(tabId);
                setIsSidebarDrawerOpen(false);
              }}
            />
          </div>
        </div>
      ) : null}

      {renderContent()}

      <AccountN2Modal
        isOpen={isAccountEditN2Open}
        title="Editar conta"
        subtitle="Atualização de credenciais via Supabase Auth"
        onClose={() => setIsAccountEditN2Open(false)}
        onSave={handleAccountUpdate}
        isSaving={authActionStatus === 'loading'}
        footerNav={embeddedWindowNav}
      >
        <label className="form-field">
          <span>Novo e-mail</span>
          <input
            type="email"
            className="form-input ui-input"
            value={accountEmailDraft}
            onChange={(event) => setAccountEmailDraft(event.target.value)}
            placeholder="novoemail@clinica.com"
          />
        </label>
        <label className="form-field">
          <span>Nova senha</span>
          <input
            type="password"
            className="form-input ui-input"
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
        footerNav={embeddedWindowNav}
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
        footerNav={embeddedWindowNav}
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
        onSelectTab={(tabId) => setPatientFormTab(tabId)}
        onSubmit={handleCreatePatientSubmit}
        onStartEdit={handleStartPatientEdit}
        onCancelEdit={handleCancelPatientEdit}
        onSaveEdit={handleSavePatientEdit}
        footerNav={embeddedWindowNav}
      />

      {confirmationDialog.isOpen ? (
        <div className="confirm-overlay" onClick={closeConfirmationDialog}>
          <div className="confirm-dialog" onClick={(event) => event.stopPropagation()}>
            <h3 className="confirm-dialog__title">{confirmationDialog.title}</h3>
            <p className="confirm-dialog__message">{confirmationDialog.message}</p>
            <div className="confirm-dialog__actions">
              <button type="button" className="confirm-dialog__btn confirm-dialog__btn--neutral" onClick={closeConfirmationDialog}>Cancelar</button>
              <button
                type="button"
                className={`confirm-dialog__btn ${confirmationDialog.tone === 'success' ? 'confirm-dialog__btn--success' : 'confirm-dialog__btn--danger'}`}
                onClick={runConfirmationDialog}
              >
                {confirmationDialog.confirmLabel}
              </button>
            </div>
          </div>
        </div>
      ) : null}

    </AppShell>
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
  const [isFirstAccessCompleted, setIsFirstAccessCompleted] = useState(false);

  useEffect(() => {
    setIsFirstAccessCompleted(Boolean(getFirstAccessCompleted?.()));
  }, []);

  const markFirstAccessCompleted = () => {
    setFirstAccessCompleted?.();
    setIsFirstAccessCompleted(true);
  };

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

    const { data: listener } = supabaseClient.auth.onAuthStateChange((event, currentSession) => {
      setSession(currentSession || null);
      if (event === 'SIGNED_IN') {
        markFirstAccessCompleted();
      }
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

  const onSignUp = ({ email: signupEmail, password: signupPassword }) => {
    if (!supabaseClient) return Promise.resolve({ data: null, error: null });
    return supabaseClient.auth.signUp({ email: signupEmail, password: signupPassword });
  };

  const onSignIn = ({ email: signinEmail, password: signinPassword }) => {
    if (!supabaseClient) return Promise.resolve({ data: null, error: null });
    return supabaseClient.auth.signInWithPassword({ email: signinEmail, password: signinPassword });
  };

  const onGoogle = () => {
    if (!supabaseClient) return Promise.resolve({ data: null, error: null });
    return supabaseClient.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin + window.location.pathname,
        queryParams: { prompt: 'select_account' }
      }
    });
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="ui-empty-state" style={{ minWidth: "280px" }}>Carregando autenticação...</div></div>;
  }

  if (!supabaseClient) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="ui-card w-full max-w-xl space-y-4">
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

  const isAuthenticated = Boolean(session?.user);
  const isBlocked = !isAuthenticated || !isFirstAccessCompleted;

  return (
    <>
      <div className={isBlocked ? 'auth-gated-shell' : ''} aria-hidden={isBlocked} inert={isBlocked ? '' : undefined}>
        <DashboardApp
          authEmail={session?.user?.email || ''}
          authUser={session?.user || null}
          accountService={accountService}
        />
      </div>

      {isBlocked ? (
        <AuthEntryModal
          mode={mode}
          email={email}
          password={password}
          authMessage={authMessage}
          authError={authError}
          isAuthenticated={isAuthenticated}
          onSetMode={setMode}
          onSetEmail={setEmail}
          onSetPassword={setPassword}
          onSignIn={onSignIn}
          onSignUp={onSignUp}
          onGoogle={onGoogle}
          onSetAuthMessage={setAuthMessage}
          onSetAuthError={setAuthError}
          onCloseNotices={() => {
            setAuthMessage('');
            setAuthError('');
          }}
          onContinueAuthenticated={markFirstAccessCompleted}
          onAuthSuccess={markFirstAccessCompleted}
        />
      ) : null}
    </>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<AuthGateApp />);
