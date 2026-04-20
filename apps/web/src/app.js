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
      <div className="h-screen flex flex-col items-center justify-center bg-white space-y-4">
        <div className="w-10 h-10 border-[3px] border-sky-700 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300">Sincronizando Ecossistema</p>
        <p className="text-[10px] font-semibold text-slate-400">Versão {APP_VERSION}</p>
      </div>
    );
  }

  if (!clinicContextReady) {
    return (
      <div className="min-h-screen bg-[#EAEEF2] flex items-center justify-center px-6">
        <div className="bg-white w-full max-w-xl rounded-3xl border border-slate-200 shadow-xl p-8 space-y-5">
          <span className="inline-flex px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.24em] bg-amber-50 text-amber-700 border border-amber-200">
            Onboarding obrigatório
          </span>
          <h1 className="text-2xl font-black text-slate-900">Crie sua clínica para continuar</h1>
          <p className="text-sm text-slate-600 leading-relaxed">
            Não encontramos <strong>user_clinic_context.active_clinic_id</strong> para este usuário.
            Para proteger o tenancy do sistema, a navegação principal fica bloqueada até concluir a criação inicial.
          </p>
          <button
            type="button"
            onClick={() => {
              ensureClinicContext();
              setClinicContextReady(true);
            }}
            className="w-full bg-sky-700 text-white rounded-2xl py-3 px-4 text-xs font-black uppercase tracking-[0.2em] hover:bg-sky-800 transition"
          >
            Criar clínica inicial
          </button>
          <p className="text-[11px] text-slate-400 font-semibold">Status: {onboardingLabel}</p>
          <p className="text-[10px] font-semibold text-slate-400">Versão {APP_VERSION}</p>
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
