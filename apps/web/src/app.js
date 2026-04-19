/**
 * DIRETRIZES DE ARQUITETURA ATÔMICA - ODONTOFLOW (MILESTONE GOLD - V15)
 * Refatoração: decomposição de `modelagem.js` em módulos.
 */

import React, { useEffect, useState } from 'react';
import Dashboard from './dashboard.js';
import { APP_VERSION } from './constants.js';

const App = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-white space-y-4">
        <div className="w-10 h-10 border-[3px] border-sky-700 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300">Sincronizando Ecossistema</p>
        <p className="text-[10px] font-semibold text-slate-400">Versão {APP_VERSION}</p>
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
