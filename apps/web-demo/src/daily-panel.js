import React, { useMemo } from 'react';
import { Activity as ActivityIcon, ArrowRight, Bell, Calendar, Settings, TrendingUp, User, Users } from 'lucide-react';
import { KpiCard, UiButton, ViewLayout } from './components.js';

const isToday = (dateString) => {
  if (!dateString) return false;

  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return false;

  const today = new Date();
  return (
    date.getFullYear() === today.getFullYear()
    && date.getMonth() === today.getMonth()
    && date.getDate() === today.getDate()
  );
};

const DailyPanel = ({ appointments, allPatients, usingFallbackData, onOpenPatientRecord, onNavigateTab }) => {
  const patientIndicators = useMemo(() => {
    const total = allPatients.length;
    const dailyTrend = Math.max(appointments.filter((item) => isToday(item.date)).length, 1);

    return {
      total,
      dailyTrend
    };
  }, [allPatients, appointments]);

  return (
    <ViewLayout
      title="Painel Diário"
      badge="Clínica Matriz SP"
      actions={(
        <>
          <div className="grid grid-cols-2 gap-2 w-full md:hidden">
            <UiButton icon={Users} label="Pacientes" tone="info" onClick={() => onNavigateTab('patients')} className="w-full justify-start" />
            <UiButton icon={Settings} label="Configurações" tone="neutral" onClick={() => onNavigateTab('settings')} className="w-full justify-start" />
            <UiButton icon={Bell} label="Alertas" tone="neutral" className="w-full justify-start" />
            <UiButton icon={User} label="Perfil" tone="neutral" className="w-full justify-start" />
          </div>
          <div className="hidden md:flex items-center gap-4">
            <UiButton icon={Bell} size="md" tone="neutral" labelLayout="hidden" />
            <div className="w-10 h-10 bg-sky-700 rounded-xl text-white flex items-center justify-center font-bold shadow-lg shadow-sky-100 ring-4 ring-white">L</div>
          </div>
        </>
      )}
    >
      <div className="space-y-12">
        {usingFallbackData && (
          <div className="bg-amber-50 border border-amber-200 text-amber-700 rounded-2xl px-5 py-4 text-xs font-semibold">
            Dados locais de contingência ativos. Assim que os arquivos em <code>backend/supabase/sample-data</code> estiverem disponíveis no servidor, a UI passa a usar esses dados automaticamente.
          </div>
        )}

        <div className="flex md:grid md:grid-cols-4 gap-6 overflow-x-auto scrollbar-hide pb-4 px-1">
          <KpiCard title="Atendimentos" value="12" subtitle="Agendados hoje" trend="up" trendValue="24" icon={Calendar} color="bg-sky-600" />
          <KpiCard title="Faturamento" value="R$ 8.4k" subtitle="Projeção diária" trend="up" trendValue="12" icon={TrendingUp} color="bg-emerald-600" />
          <KpiCard title="Ocupação" value="92%" subtitle="Cadeiras ativas" trend="down" trendValue="2" icon={ActivityIcon} color="bg-indigo-600" />
          <KpiCard
            title="Cadastros"
            value={String(patientIndicators.total)}
            subtitle="Pacientes cadastrados"
            trend="up"
            trendValue={String(patientIndicators.dailyTrend)}
            icon={Users}
            color="bg-violet-600"
          />
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden divide-y divide-slate-50">
          <div className="p-10 flex justify-between items-center bg-slate-50/30">
            <h3 className="text-xs font-black uppercase text-slate-400 tracking-widest">Agenda de Hoje</h3>
          </div>
          {appointments.map((item, idx) => (
            <UiButton
              key={idx}
              onClick={() => onOpenPatientRecord(allPatients.find((p) => p.name === item.name))}
              className="w-full h-auto justify-between rounded-none border-none bg-transparent px-10 py-8 text-left group hover:bg-slate-50 shadow-none"
            >
              <div className="flex items-center gap-10">
                <span className="text-sm font-black text-sky-700 w-12">{item.time}</span>
                <div><p className="text-xl font-bold text-slate-900 mb-1">{item.name}</p><p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{item.procedure}</p></div>
              </div>
              <ArrowRight size={24} className="text-slate-200 group-hover:text-sky-700 transition-all group-hover:translate-x-2" />
            </UiButton>
          ))}
        </div>
      </div>
    </ViewLayout>
  );
};

export default DailyPanel;
