/**
 * DIRETRIZES DE ARQUITETURA ATÔMICA - ODONTOFLOW (MILESTONE GOLD - V15)
 * Refatoração: decomposição de `modelagem.js` em módulos.
 */

import React, { useEffect, useMemo, useState } from 'react';
import Dashboard from './dashboard.js';
import { APP_VERSION } from './constants.js';

const ACTIVE_CLINIC_KEY = 'odontoflow:active-clinic-id';

const ensureClinicContext = () => {
  const current = window.localStorage.getItem(ACTIVE_CLINIC_KEY);
  if (current) return current;

  const created = `clinic-${Date.now()}`;
  window.localStorage.setItem(ACTIVE_CLINIC_KEY, created);
  return created;
};

const App = () => {
  const [loading, setLoading] = useState(true);
  const [clinicContextReady, setClinicContextReady] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const clinicId = window.localStorage.getItem(ACTIVE_CLINIC_KEY);
    setClinicContextReady(Boolean(clinicId));
  }, []);

  const onboardingLabel = useMemo(() => (
    clinicContextReady
      ? 'Contexto de clínica validado'
      : 'Contexto de clínica pendente'
  ), [clinicContextReady]);

  if (loading) {
    return (
      <div className="ds-loading-screen">
        <div className="ds-spinner" />
        <p className="ds-loading-screen__title">Sincronizando Ecossistema</p>
        <p className="ds-loading-screen__meta">Versão {APP_VERSION}</p>
      </div>
    );
  }

  if (!clinicContextReady) {
    return (
      <div className="ds-empty-state-shell">
        <div className="ds-card ds-empty-state">
          <span className="ds-badge ds-badge--warning">
            Onboarding obrigatório
          </span>
          <h1 className="ds-empty-state__title">Crie sua clínica para continuar</h1>
          <p className="ds-empty-state__description">
            Não encontramos <strong>user_clinic_context.active_clinic_id</strong> para este usuário.
            Para proteger o tenancy do sistema, a navegação principal fica bloqueada até concluir a criação inicial.
          </p>
          <button
            type="button"
            onClick={() => {
              ensureClinicContext();
              setClinicContextReady(true);
            }}
            className="ui-btn ui-btn--primary ui-btn--lg"
          >
            Criar clínica inicial
          </button>
          <p className="ds-empty-state__status">Status: {onboardingLabel}</p>
          <p className="ds-empty-state__meta">Versão {APP_VERSION}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Dashboard />
      <div className="app-version-chip" aria-label={`Versão atual ${APP_VERSION}`}>
        Versão {APP_VERSION}
      </div>
    </>
  );
};

export default App;
