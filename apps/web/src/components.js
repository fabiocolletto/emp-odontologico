import React, { useEffect } from 'react';
import { Search, X } from 'lucide-react';

// --- COMPONENTES ATÔMICOS (NÍVEL 0) ---

export const FormField = ({ label, children, icon: Icon, disabled }) => (
  <div className="group flex flex-col w-full">
    <div className={`relative flex flex-col transition-all duration-300 px-0 py-5 ${disabled ? 'border-b border-dashed border-slate-300' : 'border-b-2 border-slate-200 group-focus-within:border-sky-600 group-focus-within:pl-4 transition-all'}`}>
      <label className="text-[11px] font-bold uppercase tracking-wider mb-2.5 transition-all text-slate-600 group-focus-within:text-sky-700">{label}</label>
      <div className="flex items-center gap-4">
        {Icon && <Icon size={16} className="text-slate-400 group-focus-within:text-sky-600 transition-colors" />}
        <div className="flex-1 w-full min-h-[32px] flex items-center">{children}</div>
      </div>
    </div>
  </div>
);

export const KpiCard = ({ title, value, subtitle, trend, trendValue, icon: Icon, color }) => (
  <div className="bg-white p-8 rounded-3xl shadow-sm hover:shadow-xl hover:shadow-slate-300/20 transition-all duration-500 border border-slate-100/50 group shrink-0 min-w-[280px] md:min-w-0">
    <div className="flex justify-between items-start mb-10">
      <div className={`p-4 rounded-2xl ${color} bg-opacity-10 shadow-inner group-hover:scale-110 transition-transform duration-500`}>
        <Icon size={24} className={color.replace('bg-', 'text-')} />
      </div>
      <div className={`px-3 py-1.5 rounded-full text-[10px] font-black tracking-widest ${trend === 'up' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-red-50 text-red-500 border border-red-100'}`}>
        {trend === 'up' ? '+' : '-'}{trendValue}%
      </div>
    </div>
    <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">{title}</h4>
    <p className="text-4xl font-light text-slate-900 tracking-tighter mb-2">{value}</p>
    <p className="text-xs text-slate-400 font-medium leading-relaxed">{subtitle}</p>
  </div>
);

const BUTTON_SIZE_CLASS = {
  sm: 'ui-btn--sm',
  md: 'ui-btn--md',
  lg: 'ui-btn--lg'
};

const BUTTON_TONE_CLASS = {
  neutral: 'ui-btn--neutral',
  primary: 'ui-btn--primary',
  danger: 'ui-btn--danger',
  success: 'ui-btn--success',
  info: 'ui-btn--info'
};

const BUTTON_LABEL_LAYOUT_CLASS = {
  side: 'ui-btn--label-side',
  below: 'ui-btn--label-below',
  hidden: 'ui-btn--label-hidden'
};

export const UiButton = ({
  icon: Icon,
  label,
  children,
  size = 'md',
  tone = 'neutral',
  labelLayout = 'side',
  className = '',
  type = 'button',
  ...props
}) => {
  const resolvedSize = BUTTON_SIZE_CLASS[size] || BUTTON_SIZE_CLASS.md;
  const resolvedTone = BUTTON_TONE_CLASS[tone] || BUTTON_TONE_CLASS.neutral;
  const resolvedLabelLayout = BUTTON_LABEL_LAYOUT_CLASS[labelLayout] || BUTTON_LABEL_LAYOUT_CLASS.side;

  return (
    <button
      type={type}
      className={`ui-btn ${resolvedSize} ${resolvedTone} ${resolvedLabelLayout} ${className}`.trim()}
      {...props}
    >
      {children || (
        <>
          {Icon && <Icon size={18} className="ui-btn__icon" />}
          {label && <span className="ui-btn__label">{label}</span>}
        </>
      )}
    </button>
  );
};


export const UiField = ({ label, htmlFor, children }) => (
  <label className="ui-field" htmlFor={htmlFor}>
    {label ? <span className="ui-field__label">{label}</span> : null}
    {children}
  </label>
);

export const UiInput = ({ label, id, className = '', ...props }) => (
  <UiField label={label} htmlFor={id}>
    <input id={id} className={`ui-input ${className}`.trim()} {...props} />
  </UiField>
);

export const UiSelect = ({ label, id, className = '', children, ...props }) => (
  <UiField label={label} htmlFor={id}>
    <select id={id} className={`ui-select ${className}`.trim()} {...props}>
      {children}
    </select>
  </UiField>
);

export const UiTextarea = ({ label, id, className = '', ...props }) => (
  <UiField label={label} htmlFor={id}>
    <textarea id={id} className={`ui-textarea ${className}`.trim()} {...props} />
  </UiField>
);

export const UiSearchField = ({ label, id, className = '', ...props }) => (
  <UiField label={label} htmlFor={id}>
    <div className="ui-search-wrap">
      <Search size={16} className="ui-search-wrap__icon" />
      <input id={id} className={`ui-search ${className}`.trim()} {...props} />
    </div>
  </UiField>
);

export const UiNavSearchBar = ({
  value,
  onChange,
  onCancel,
  onClear,
  placeholder = 'Pesquisar...'
}) => (
  <div className="ui-nav-search" role="search">
    <Search size={16} className="ui-nav-search__icon" aria-hidden="true" />
    <input
      type="search"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="ui-nav-search__input"
      autoFocus
    />
    {value ? (
      <button
        type="button"
        className="ui-nav-search__clear"
        onClick={onClear}
        aria-label="Limpar pesquisa"
      >
        <X size={16} />
      </button>
    ) : null}
    <button
      type="button"
      className="ui-nav-search__cancel"
      onClick={onCancel}
    >
      Cancelar
    </button>
  </div>
);

export const UiCard = ({ className = '', children, ...props }) => (
  <section className={`ui-card ${className}`.trim()} {...props}>{children}</section>
);

export const UiBadge = ({ tone = 'neutral', className = '', children }) => (
  <span className={`ui-badge ${tone !== 'neutral' ? `ui-badge--${tone}` : ''} ${className}`.trim()}>
    {children}
  </span>
);

export const UiAlert = ({ tone = 'info', className = '', children }) => (
  <div className={`ui-alert ${tone !== 'info' ? `ui-alert--${tone}` : ''} ${className}`.trim()} role="status">
    {children}
  </div>
);

export const UiEmptyState = ({ title, message, action }) => (
  <div className="ui-empty-state">
    {title ? <strong>{title}</strong> : null}
    {message ? <span>{message}</span> : null}
    {action || null}
  </div>
);

export const UiAvatar = ({ label = '?' }) => (
  <span className="ui-avatar" aria-label={`Avatar ${label}`}>{label}</span>
);

export const UiSkeleton = ({ className = '', style }) => (
  <div className={`ui-skeleton ${className}`.trim()} style={style} aria-hidden="true" />
);

// --- COMPONENTES DE ESTRUTURA (NÍVEL 1, 2 E 3) ---

export const AppShell = ({
  headerLeading,
  headerCenter,
  headerTrailing,
  children,
  footer,
  sidebar
}) => (
  <div className={`app-shell ${sidebar ? 'app-shell--wide' : ''}`.trim()} data-shell-level="0">
    {sidebar && (
      <aside className="app-sidebar">
        {sidebar}
      </aside>
    )}
    <div className="app-main">
      <header className="app-header">
        <div className="app-header__inner">
          <div className="app-header__leading">{headerLeading}</div>
          <div className="app-header__center">{headerCenter}</div>
          <div className="app-header__trailing">{headerTrailing}</div>
        </div>
      </header>

      <main className="app-body" data-shell-level="1">
        {children}
      </main>

      <footer className="app-footer">
        {footer}
      </footer>
    </div>
  </div>
);

export const ViewLayout = ({ children }) => (
  <section className="app-view-layout app-level app-level--1" data-level="1">
    {children}
  </section>
);

export const DetailPane = ({ title, isOpen, onClose, children }) => {
  if (!isOpen) return null;
  return (
    <aside className="detail-pane app-level app-level--2" data-level="2" aria-label={title || 'Painel de detalhe'}>
      <div className="detail-pane__header">
        <h3>{title || 'Detalhe'}</h3>
        {onClose && (
          <button type="button" className="detail-pane__close" onClick={onClose} aria-label="Fechar detalhe">
            ×
          </button>
        )}
      </div>
      <div className="detail-pane__body">
        {children}
      </div>
    </aside>
  );
};

export const AppDrawer = ({ isOpen, onClose, side = 'right', children, title = 'Drawer' }) => {
  useEffect(() => {
    if (!isOpen) return undefined;
    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose?.();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;
  return (
    <div className="app-overlay" role="presentation">
      <button className="app-overlay__backdrop" type="button" aria-label="Fechar drawer" onClick={onClose} />
      <aside className={`app-drawer app-drawer--${side} app-level app-level--3`} data-level="3" aria-label={title}>
        <div className="app-drawer__header">
          <h3>{title}</h3>
          <button type="button" className="app-drawer__close" onClick={onClose} aria-label="Fechar">
            ×
          </button>
        </div>
        <div className="app-drawer__body">{children}</div>
      </aside>
    </div>
  );
};

export const AppSheet = ({ isOpen, onClose, children, title = 'Sheet' }) => {
  if (!isOpen) return null;
  return (
    <div className="app-overlay" role="presentation">
      <button className="app-overlay__backdrop" type="button" aria-label="Fechar sheet" onClick={onClose} />
      <section className="app-sheet app-level app-level--3" data-level="3" aria-label={title}>
        <div className="app-sheet__header">
          <h3>{title}</h3>
          <button type="button" className="app-sheet__close" onClick={onClose} aria-label="Fechar">
            ×
          </button>
        </div>
        <div className="app-sheet__body">{children}</div>
      </section>
    </div>
  );
};

export const AdaptiveHeader = ({ title, subtitle, icon: Icon, iconColor = 'bg-sky-700', actions }) => (
  <div className="px-10 py-6 flex justify-between items-center border-b border-slate-100 bg-white/50 shrink-0">
    <div className="flex items-center gap-5">
      {Icon && (
        <div className={`p-3.5 rounded-2xl shadow-lg ring-4 ring-slate-50 transition-all duration-500 ${iconColor}`}>
          <Icon size={20} className="text-white" />
        </div>
      )}
      <div>
        <h4 className="text-xl font-bold text-slate-900 leading-none">{title}</h4>
        {subtitle && <p className="text-[10px] font-black uppercase text-slate-400 mt-2 tracking-widest">{subtitle}</p>}
      </div>
    </div>
    <div className="flex items-center gap-2">
      {actions}
    </div>
  </div>
);

export const AdaptiveModal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-xl animate-in fade-in duration-500" onClick={onClose}></div>
      <div className="relative bg-white w-full max-w-xl md:max-w-3xl max-h-[90vh] rounded-3xl shadow-2xl flex flex-col animate-in zoom-in-95 duration-300 overflow-hidden border border-white/20">
        {children}
      </div>
    </div>
  );
};
