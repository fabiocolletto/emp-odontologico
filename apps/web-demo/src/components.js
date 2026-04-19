import React from 'react';
import { Bell, MapPin } from 'lucide-react';

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

// --- COMPONENTES DE ESTRUTURA (NÍVEL 1, 2 E 3) ---

export const ViewLayout = ({ title, badge, actions, children }) => (
  <div className="flex-1 flex flex-col overflow-y-auto scroll-smooth bg-[#EAEEF2]">
    <header className="px-8 pt-12 pb-8 md:pt-20 md:pb-12 bg-white/50 backdrop-blur-sm sticky top-0 z-30 md:relative md:bg-transparent border-b md:border-none border-slate-100">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-6 md:gap-0">
        <div className="flex flex-col gap-4">
          <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 tracking-tighter leading-none">{title}</h1>
          {badge && (
            <div className="flex items-center gap-2 text-[10px] font-black uppercase text-sky-700 bg-sky-50 px-4 py-1.5 rounded-full w-fit ring-1 ring-sky-100 shadow-sm animate-in fade-in slide-in-from-top-1">
              <MapPin size={10} /> {badge}
            </div>
          )}
        </div>
        <div className="flex items-center gap-4 mb-2">
          {actions ? actions : (
            <>
              <UiButton icon={Bell} size="md" tone="neutral" labelLayout="hidden" />
              <div className="w-10 h-10 bg-sky-700 rounded-xl text-white flex items-center justify-center font-bold shadow-lg shadow-sky-100 ring-4 ring-white">L</div>
            </>
          )}
        </div>
      </div>
    </header>
    <section className="max-w-6xl mx-auto w-full p-8 pb-16 md:pb-20">
      {children}
    </section>
  </div>
);

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
