import React from 'react';
import {
  BadgeDollarSign,
  CalendarDays,
  IdCard,
  Plus,
  Users
} from 'lucide-react';

const NAV_ITEMS = [
  { id: 'overview', icon: CalendarDays, label: 'Agenda', route: 'agenda' },
  { id: 'patients', icon: Users, label: 'Pacientes', route: 'pacientes' },
  { id: 'financial', icon: BadgeDollarSign, label: 'Financeiro', route: 'financeiro' },
  { id: 'profile', icon: IdCard, label: 'Perfil', route: 'perfil' }
];

export const DashboardSidebarNav = ({ activeTab, onSelectTab, clinicName }) => (
  <div className="app-sidebar__inner">
    <div className="app-sidebar__header">
      <div className="app-sidebar__brand">
        <span>OdontoFlow</span>
      </div>
    </div>
    <nav className="app-sidebar__nav" aria-label="Navegação principal" data-level="0">
      {NAV_ITEMS.map((item) => (
        <button
          key={item.id}
          type="button"
          className={`app-sidebar__item app-sidebar__item--${item.id} ${activeTab === item.id ? 'is-active' : ''}`}
          onClick={() => onSelectTab(item.id)}
        >
          <span className="app-sidebar__item-icon" aria-hidden="true"><item.icon size={18} /></span>
          <span>{item.label}</span>
        </button>
      ))}
    </nav>
    <div className="app-sidebar__footer">
      <span>{clinicName || 'Clínica não definida'}</span>
    </div>
  </div>
);

export const DashboardBottomTabbar = ({ activeTab, onSelectTab, onCreatePatient }) => (
  <nav className="bottom-tabbar" aria-label="Navegação principal" data-level="0">
    {NAV_ITEMS.slice(0, 2).map((item) => (
      <a
        key={item.id}
        className={`bottom-tabbar__item bottom-tabbar__item--${item.id} ${activeTab === item.id ? 'is-active' : ''}`}
        href="#"
        data-route={item.route}
        aria-current={activeTab === item.id ? 'page' : undefined}
        onClick={(event) => {
          event.preventDefault();
          onSelectTab(item.id);
        }}
      >
        <span className="bottom-tabbar__icon" aria-hidden="true"><item.icon size={22} /></span>
        <span className="bottom-tabbar__label">{item.label}</span>
      </a>
    ))}
    <button className="bottom-tabbar__fab" type="button" aria-label="Novo paciente" onClick={onCreatePatient}>
      <span className="bottom-tabbar__fab-icon" aria-hidden="true"><Plus size={28} /></span>
    </button>
    {NAV_ITEMS.slice(2).map((item) => (
      <a
        key={item.id}
        className={`bottom-tabbar__item bottom-tabbar__item--${item.id} ${activeTab === item.id ? 'is-active' : ''}`}
        href="#"
        data-route={item.route}
        aria-current={activeTab === item.id ? 'page' : undefined}
        onClick={(event) => {
          event.preventDefault();
          onSelectTab(item.id);
        }}
      >
        <span className="bottom-tabbar__icon" aria-hidden="true"><item.icon size={22} /></span>
        <span className="bottom-tabbar__label">{item.label}</span>
      </a>
    ))}
  </nav>
);
