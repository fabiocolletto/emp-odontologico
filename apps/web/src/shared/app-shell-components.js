(function registerAppShellComponents(global) {
  const namespace = global.OdontoFlowShellComponents = global.OdontoFlowShellComponents || {};

  namespace.createAppIcon = () => ({ name, size = 14, className = '' }) => {
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

  namespace.createHeaderActionButton = ({ AppIcon }) => ({
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

  namespace.createAddRecordButton = ({ HeaderActionButton }) => ({
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

  namespace.createAppShell = () => ({ sidebar, header, children }) => (
    <div className="app-shell">
      <div className="app-frame">
        {sidebar}
        <main className="app-content">
          {header}
          {children}
        </main>
      </div>
    </div>
  );

  namespace.createAppSidebar = ({ AppIcon }) => ({
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

  namespace.createAppHeader = () => ({ children }) => (
    <header className="app-header-flat mb-3">
      {children}
    </header>
  );

  namespace.createPageHeader = ({ BioHeader }) => ({ icon, title, subtitle, actions = null }) => (
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
}(globalThis));
