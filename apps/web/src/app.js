/**
 * DIRETRIZES DE ARQUITETURA ATÔMICA - ODONTOFLOW (MILESTONE GOLD - V15)
 * Refatoração: decomposição de `modelagem.js` em módulos.
 */

import React, { useEffect, useMemo, useState } from 'react';
import Dashboard from './dashboard.js';
import { UiAlert, UiBadge, UiButton, UiCard, UiEmptyState, UiSkeleton } from './components.js';
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
      <div className="app-viewport" style={{ display: 'grid', placeItems: 'center', padding: 'var(--space-6)' }}>
        <UiCard className="stack-3" style={{ width: 'min(420px, 100%)' }}>
          <UiBadge tone="success">Inicializando</UiBadge>
          <UiSkeleton style={{ height: '14px', width: '75%' }} />
          <UiSkeleton style={{ height: '14px', width: '55%' }} />
          <p className="text-xs text-muted">Versão {APP_VERSION}</p>
        </UiCard>
      </div>
    );
  }

  if (!clinicContextReady) {
    return (
      <div className="app-viewport" style={{ display: 'grid', placeItems: 'center', padding: 'var(--space-6)' }}>
        <UiCard className="stack-4" style={{ width: 'min(620px, 100%)' }}>
          <UiBadge>Onboarding obrigatório</UiBadge>
          <UiEmptyState
            title="Crie sua clínica para continuar"
            message="Não encontramos user_clinic_context.active_clinic_id para este usuário. A navegação principal fica bloqueada até concluir a criação inicial."
            action={(
              <UiButton
                tone="primary"
                className="w-full"
                onClick={() => {
                  ensureClinicContext();
                  setClinicContextReady(true);
                }}
                label="Criar clínica inicial"
              />
            )}
          />
          <UiAlert>
            <strong>Status:</strong> {onboardingLabel}
          </UiAlert>
          <p className="text-xs text-muted">Versão {APP_VERSION}</p>
        </UiCard>
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
