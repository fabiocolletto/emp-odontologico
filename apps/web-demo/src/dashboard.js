import React, { useEffect, useState } from 'react';
import {
  Activity as ActivityIcon,
  ArrowRight,
  Calendar,
  Check,
  Globe,
  Layers,
  LayoutDashboard,
  ListChecks,
  Pencil,
  Phone,
  Plus,
  Search,
  Settings,
  Stethoscope,
  Trash2,
  TrendingUp,
  User,
  UserPlus,
  Users,
  X
} from 'lucide-react';
import { APPOINTMENTS, INITIAL_PATIENTS, INITIAL_PROCEDURES } from './constants.js';
import { loadClinicDataset } from './data-gateway.js';
import { AdaptiveHeader, AdaptiveModal, FormField, KpiCard, ViewLayout } from './components.js';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [allPatients, setAllPatients] = useState(INITIAL_PATIENTS);
  const [allProcedures, setAllProcedures] = useState(INITIAL_PROCEDURES);
  const [appointments, setAppointments] = useState(APPOINTMENTS);
  const [usingFallbackData, setUsingFallbackData] = useState(true);

  const [modalPatient, setModalPatient] = useState(false);
  const [modalSettingsProc, setModalSettingsProc] = useState(false);

  const [selectedPatient, setSelectedPatient] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [newProcName, setNewProcName] = useState('');

  const handleOpenPatientRecord = (patient) => {
    setSelectedPatient(patient);
    setModalPatient(true);
    setIsEditing(false);
  };

  useEffect(() => {
    let mounted = true;

    const hydrateFromSupabaseFiles = async () => {
      try {
        const dataset = await loadClinicDataset();
        if (!mounted) return;

        setAllPatients(dataset.patients);
        setAllProcedures(dataset.procedures);
        setAppointments(dataset.appointments);
        setUsingFallbackData(false);
      } catch (error) {
        if (!mounted) return;
        setUsingFallbackData(true);
      }
    };

    hydrateFromSupabaseFiles();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#EAEEF2] flex flex-col md:flex-row font-sans selection:bg-sky-100">
      <aside className="hidden md:flex flex-col bg-white border-r border-slate-200 h-screen sticky top-0 w-72 z-40 shrink-0">
        <div className="p-8 pb-10 flex items-center gap-4 overflow-hidden">
          <div className="bg-sky-700 p-3 rounded-2xl text-white shadow-xl shadow-sky-100 shrink-0"><Stethoscope size={24} /></div>
          <span className="text-2xl font-light text-slate-900 italic tracking-tighter leading-none shrink-0">Odonto<span className="text-sky-700 font-bold not-italic">Flow</span></span>
        </div>
        <nav className="flex-1 px-6 space-y-4">
          {[
            { id: 'overview', icon: LayoutDashboard, label: 'Painel Clínico' },
            { id: 'patients', icon: Users, label: 'Base de Pacientes' },
            { id: 'settings', icon: Settings, label: 'Configurações' }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-5 p-4 rounded-2xl transition-all ${activeTab === item.id ? 'bg-slate-900 text-white shadow-2xl' : 'text-slate-500 hover:bg-sky-50'}`}
            >
              <item.icon size={20} />
              <span className="font-bold text-sm tracking-wide">{item.label}</span>
            </button>
          ))}
        </nav>
      </aside>

      {activeTab === 'overview' && (
        <ViewLayout title="Painel Diário" badge="Clínica Matriz SP">
          <div className="space-y-12">
            {usingFallbackData && (
              <div className="bg-amber-50 border border-amber-200 text-amber-700 rounded-2xl px-5 py-4 text-xs font-semibold">
                Dados locais de contingência ativos. Assim que os arquivos em <code>backend/supabase/sample-data</code> estiverem disponíveis no servidor, a UI passa a usar esses dados automaticamente.
              </div>
            )}
            <div className="flex md:grid md:grid-cols-3 gap-6 overflow-x-auto scrollbar-hide pb-4 px-1">
              <KpiCard title="Atendimentos" value="12" subtitle="Agendados hoje" trend="up" trendValue="24" icon={Calendar} color="bg-sky-600" />
              <KpiCard title="Faturamento" value="R$ 8.4k" subtitle="Projeção diária" trend="up" trendValue="12" icon={TrendingUp} color="bg-emerald-600" />
              <KpiCard title="Ocupação" value="92%" subtitle="Cadeiras ativas" trend="down" trendValue="2" icon={ActivityIcon} color="bg-indigo-600" />
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden divide-y divide-slate-50">
              <div className="p-10 flex justify-between items-center bg-slate-50/30">
                <h3 className="text-xs font-black uppercase text-slate-400 tracking-widest">Agenda de Hoje</h3>
              </div>
              {appointments.map((item, idx) => (
                <button key={idx} onClick={() => handleOpenPatientRecord(allPatients.find((p) => p.name === item.name))} className="w-full flex items-center justify-between px-10 py-8 hover:bg-slate-50 transition-all text-left group">
                  <div className="flex items-center gap-10">
                    <span className="text-sm font-black text-sky-700 w-12">{item.time}</span>
                    <div><p className="text-xl font-bold text-slate-900 mb-1">{item.name}</p><p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{item.procedure}</p></div>
                  </div>
                  <ArrowRight size={24} className="text-slate-200 group-hover:text-sky-700 transition-all group-hover:translate-x-2" />
                </button>
              ))}
            </div>
          </div>
        </ViewLayout>
      )}

      {activeTab === 'patients' && (
        <ViewLayout
          title="Base de Pacientes"
          badge="Índice de Prontuários"
          actions={(
            <button
              onClick={() => { setSelectedPatient(null); setModalPatient(true); setIsEditing(true); }}
              className="flex items-center gap-3 px-6 py-3 bg-sky-700 text-white rounded-xl font-bold text-xs uppercase tracking-widest shadow-xl shadow-sky-100 hover:bg-sky-800 transition-all"
            >
              <UserPlus size={18} />
              <span className="hidden md:inline">Novo Cadastro</span>
            </button>
          )}
        >
          <div className="space-y-10">
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
              <Search className="text-slate-300" size={20} />
              <input type="text" placeholder="Pesquisar..." className="flex-1 bg-transparent border-none outline-none text-base font-bold text-slate-900 placeholder:text-slate-300" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {allPatients.map((p) => (
                <div key={p.id} onClick={() => handleOpenPatientRecord(p)} className="bg-white p-8 rounded-3xl border border-slate-50 shadow-sm hover:shadow-xl hover:translate-y-[-4px] transition-all cursor-pointer group">
                  <div className="flex items-center gap-5 mb-8">
                    <div className="w-14 h-14 rounded-2xl bg-sky-50 flex items-center justify-center text-sky-700 font-bold text-xl group-hover:bg-sky-700 group-hover:text-white transition-all">{p.name[0]}</div>
                    <div><p className="text-lg font-bold text-slate-900 group-hover:text-sky-700 transition-colors">{p.name}</p><p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">ID: {p.id.toString().padStart(4, '0')}</p></div>
                  </div>
                  <div className="space-y-4 border-t border-slate-50 pt-6 text-sm">
                    <div className="flex justify-between"><span className="text-slate-400 font-medium">WhatsApp:</span><span className="text-slate-900 font-bold">{p.phone}</span></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ViewLayout>
      )}

      {activeTab === 'settings' && (
        <ViewLayout title="Configurações" badge="Gestão Administrativa">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div
              onClick={() => setModalSettingsProc(true)}
              className="bg-white p-10 rounded-3xl border border-slate-100 shadow-sm hover:shadow-2xl hover:translate-y-[-6px] transition-all cursor-pointer group flex flex-col h-full animate-in zoom-in-95 duration-500"
            >
              <div className="flex items-start justify-between mb-10">
                <div className="p-5 bg-sky-50 text-sky-700 rounded-2xl shadow-inner group-hover:bg-sky-700 group-hover:text-white transition-all duration-500">
                  <Layers size={32} />
                </div>
                <div className="px-3 py-1.5 bg-sky-50 text-sky-700 rounded-full text-[10px] font-black tracking-widest uppercase border border-sky-100">Catálogo</div>
              </div>

              <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight mb-2">Serviços Clínicos</h3>
              <p className="text-sm text-slate-400 font-medium leading-relaxed mb-8 flex-1">Gerencie a lista mestre de procedimentos, valores sugeridos e tempos de cadeira.</p>

              <div className="pt-8 border-t border-slate-50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ListChecks size={16} className="text-emerald-500" />
                  <span className="text-xs font-bold text-slate-900">{allProcedures.length} Ativos</span>
                </div>
                <ArrowRight size={20} className="text-slate-200 group-hover:text-sky-700 group-hover:translate-x-2 transition-all" />
              </div>
            </div>

            <div className="bg-slate-50/50 p-10 rounded-3xl border border-dashed border-slate-200 flex flex-col items-center justify-center text-center opacity-60">
              <div className="w-16 h-16 bg-white rounded-2xl border border-slate-200 flex items-center justify-center text-slate-300 mb-6"><Settings size={28} /></div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Novos Ajustes em Breve</p>
            </div>
          </div>
        </ViewLayout>
      )}

      <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-slate-200 h-24 px-8 pt-2 pb-8 flex justify-around items-center z-[50] md:hidden">
        {[
          { id: 'overview', icon: LayoutDashboard, label: 'Hoje' },
          { id: 'patients', icon: Users, label: 'Base' },
          { id: 'settings', icon: Settings, label: 'Ajustes' }
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex flex-col items-center gap-1.5 transition-all ${activeTab === item.id ? 'text-sky-700' : 'text-slate-400'}`}
          >
            <item.icon size={22} className={activeTab === item.id ? 'fill-sky-700/10' : ''} />
            <span className="text-[10px] font-bold leading-none tracking-tight">{item.label}</span>
          </button>
        ))}
      </nav>

      <AdaptiveModal isOpen={modalSettingsProc} onClose={() => setModalSettingsProc(false)}>
        <AdaptiveHeader
          title="Catálogo de Serviços"
          subtitle="Configuração do Portfólio"
          icon={Layers}
          actions={<button onClick={() => setModalSettingsProc(false)} className="p-3 bg-slate-100 text-slate-400 hover:text-slate-900 rounded-xl transition-all"><X size={20} /></button>}
        />
        <div className="p-10 space-y-10 pb-32 overflow-y-auto scrollbar-hide">
          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Plus size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                <input
                  type="text"
                  value={newProcName}
                  onChange={(e) => setNewProcName(e.target.value)}
                  placeholder="Nome do novo serviço..."
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-base font-bold text-slate-900 outline-none focus:ring-2 focus:ring-sky-100 transition-all"
                />
              </div>
              <button
                onClick={() => { if (newProcName.trim()) { setAllProcedures([...allProcedures, newProcName.trim()]); setNewProcName(''); } }}
                className="px-8 bg-sky-700 text-white rounded-2xl font-bold uppercase tracking-widest text-xs shadow-lg shadow-sky-100 hover:bg-sky-800 transition-all"
              >
                Adicionar
              </button>
            </div>

            <div className="space-y-3">
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] mb-4">Itens Cadastrados</p>
              {allProcedures.map((proc, idx) => (
                <div key={idx} className="flex items-center justify-between p-6 bg-slate-50/50 border border-slate-100 rounded-2xl group animate-in fade-in slide-in-from-left-2 duration-300">
                  <span className="text-lg font-bold text-slate-900">{proc}</span>
                  <button
                    onClick={() => setAllProcedures(allProcedures.filter((p) => p !== proc))}
                    className="p-3 text-red-400 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </AdaptiveModal>

      <AdaptiveModal isOpen={modalPatient} onClose={() => setModalPatient(false)}>
        <AdaptiveHeader
          title={isEditing ? (selectedPatient ? 'Editando Prontuário' : 'Novo Cadastro') : 'Ficha Clínica'}
          subtitle={selectedPatient?.name || 'Cadastro de Dados'}
          icon={User}
          iconColor={isEditing ? 'bg-emerald-600' : 'bg-sky-700'}
          actions={(
            <>
              {isEditing ? (
                <div className="flex items-center gap-2 animate-in fade-in zoom-in-95">
                  <button onClick={() => setIsEditing(false)} className="p-3 rounded-xl bg-red-50 text-red-500 hover:bg-red-100 transition-all"><X size={20} /></button>
                  <button onClick={() => { setIsEditing(false); setModalPatient(false); }} className="p-3 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition-all shadow-lg"><Check size={20} /></button>
                </div>
              ) : (
                <div className="flex items-center gap-2 animate-in fade-in zoom-in-95">
                  <button className="p-3 rounded-xl bg-slate-100 text-slate-400 hover:text-sky-700" title="Compartilhar"><Globe size={18} /></button>
                  <button className="p-3 rounded-xl bg-slate-100 text-slate-400 hover:text-red-600" title="Excluir"><Trash2 size={18} /></button>
                  <div className="w-px h-8 bg-slate-200 mx-1"></div>
                  <button onClick={() => setIsEditing(true)} className="p-3 rounded-xl bg-slate-100 text-slate-400 hover:text-sky-700" title="Editar"><Pencil size={18} /></button>
                </div>
              )}
              <button onClick={() => setModalPatient(false)} className="p-3 bg-slate-100 text-slate-400 hover:text-slate-900 rounded-xl transition-all"><X size={20} /></button>
            </>
          )}
        />
        <div className="p-10 space-y-10 pb-32 overflow-y-auto scrollbar-hide">
          <div className="bg-white rounded-3xl overflow-hidden border border-slate-100 divide-y divide-slate-50 shadow-sm">
            <FormField label="Nome Completo" icon={User} disabled={!isEditing}>
              <input
                type="text"
                disabled={!isEditing}
                defaultValue={selectedPatient?.name || ''}
                className="w-full bg-transparent border-none text-lg font-bold text-slate-900 outline-none"
                placeholder="João da Silva"
              />
            </FormField>
            <FormField label="WhatsApp" icon={Phone} disabled={!isEditing}>
              <input
                type="text"
                disabled={!isEditing}
                defaultValue={selectedPatient?.phone || ''}
                className="w-full bg-transparent border-none text-lg font-bold text-slate-900 outline-none"
                placeholder="(00) 00000-0000"
              />
            </FormField>
          </div>
        </div>
      </AdaptiveModal>
    </div>
  );
};

export default Dashboard;
