import React, { useEffect } from 'react';
import { Bell } from 'lucide-react';

// --- COMPONENTES ATÔMICOS (NÍVEL 0) ---

export const FormField = ({ label, children, icon: Icon, disabled }) => (
  <div className="ds-field">
    <div className={`ds-field__control ${disabled ? 'is-disabled' : ''}`.trim()}>
      <label className="ds-field__label">{label}</label>
      <div className="ds-field__input-wrap">
        {Icon && <Icon size={16} className="ds-field__icon" />}
        <div className="ds-field__input">{children}</div>
      </div>
    </div>
  </div>
);

export const KpiCard = ({ title, value, subtitle, trend, trendValue, icon: Icon, color }) => (
  <article className="ds-card ds-kpi-card group shrink-0 min-w-[280px] md:min-w-0">
    <div className="flex justify-between items-start mb-10">
      <div className={`ds-kpi-card__icon ${color} bg-opacity-10 group-hover:scale-110 transition-transform duration-500`}>
        <Icon size={24} className={color.replace('bg-', 'text-')} />
      </div>
      <div className={`ds-badge ${trend === 'up' ? 'ds-badge--success' : 'ds-badge--danger'}`}>
        {trend === 'up' ? '+' : '-'}{trendValue}%
      </div>
    </div>
    <h4 className="ds-kpi-card__title">{title}</h4>
    <p className="ds-kpi-card__value">{value}</p>
    <p className="ds-kpi-card__subtitle">{subtitle}</p>
  </article>
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
  <header className="ds-section-header">
    <div className="ds-section-header__heading">
      {Icon && (
        <div className={`ds-section-header__icon ${iconColor}`}>
          <Icon size={20} className="text-white" />
        </div>
      )}
      <div>
        <h4 className="ds-section-header__title">{title}</h4>
        {subtitle && <p className="ds-section-header__subtitle">{subtitle}</p>}
      </div>
    </div>
    <div className="ds-action-bar">
      {actions}
    </div>
  </header>
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
