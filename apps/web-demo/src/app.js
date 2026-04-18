/**
 * DIRETRIZES DE ARQUITETURA ATÔMICA - ODONTOFLOW (MILESTONE GOLD - V15)
 * Refatoração: decomposição de `modelagem.js` em módulos.
 */

import React, { useEffect, useState } from 'react';
import { Stethoscope } from 'lucide-react';
import Dashboard from './dashboard.js';

const App = () => {
  const [view, setView] = useState('landing');
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
      </div>
    );
  }

  if (view === 'landing') {
    return (
      <div className="h-screen flex flex-col items-center justify-between bg-[#F2F2F7] p-10 py-24 text-center animate-in fade-in duration-1000">
        <div className="space-y-8">
          <div className="w-20 h-20 bg-sky-700 rounded-2xl flex items-center justify-center text-white shadow-2xl mx-auto shadow-blue-100/40 animate-bounce duration-[3000ms]">
            <Stethoscope size={40} />
          </div>
          <div className="space-y-3">
            <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 tracking-tighter leading-none italic">Odonto<span className="text-sky-700 font-bold not-italic">Flow</span></h1>
            <p className="text-slate-400 text-lg md:text-2xl font-medium leading-snug tracking-tight italic">Design Consistente. <span className="text-slate-900 font-semibold not-italic">Gestão Ágil.</span></p>
          </div>
        </div>
        <button onClick={() => setView('dashboard')} className="w-full max-w-sm py-5 bg-sky-700 text-white rounded-2xl font-bold text-xl shadow-xl shadow-blue-200 active:scale-95 transition-all hover:bg-sky-800">Acessar Unidade</button>
      </div>
    );
  }

  return <Dashboard />;
};

export default App;
