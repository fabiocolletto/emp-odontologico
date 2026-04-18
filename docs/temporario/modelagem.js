/**
 * ============================================================================
 * DIRETRIZES DE ARQUITETURA ATÔMICA - ODONTOFLOW (MILESTONE GOLD - V14)
 * ============================================================================
 * CORREÇÃO DE EXECUÇÃO E EVOLUÇÃO DE WIDGETS DE CONFIGURAÇÃO.
 * * 1. FIX DE AMBIENTE: 
 * - Adicionado 'Settings' ao import da lucide-react.
 * - Validada a renderização de ícones para evitar erros de "Objects as React child".
 * * 2. CONFIGURAÇÕES (NÍVEL 1): 
 * - Widget "Catálogo de Serviços" consolidado.
 * - Preparado para novos widgets administrativos.
 * * 3. HIERARQUIA DE NÍVEIS (ARQUITETURA DE WIDGETS):
 * - Nível 1: Dashboards de Widgets (Overview, Base de Pacientes, Configurações).
 * - Nível 2: Modais de Registro/Edição (Ficha Clínica, Editor de Catálogo).
 * - Nível 3: Seletores Atômicos (Pickers de Data, Hora, Procedimentos).
 * ============================================================================
 */

import React, { useState, useEffect } from 'react';
import { 
  X, Plus, Search, Users, TrendingUp, Stethoscope, Calendar, Activity, 
  UserPlus, ClipboardList, Clock, ArrowRight, MapPin, Pencil, 
  Check, Filter, ChevronLeft, ChevronRight, Bell, Copy, Trash2, 
  CalendarDays, Edit3, LayoutDashboard, Layers, ListChecks, Globe,
  Settings, Phone, Activity as ActivityIcon
} from 'lucide-react';

// --- DADOS DO ECOSSISTEMA ---

const INITIAL_PATIENTS = [
  { id: 1, name: 'Ana Paula Souza', phone: '(11) 98877-6655', lastVisit: '12 Abr 2024', gender: 'Feminino', birth: '15/05/1992' },
  { id: 2, name: 'Ricardo Albuquerque', phone: '(11) 97766-5544', lastVisit: '08 Abr 2024', gender: 'Masculino', birth: '22/10/1985' },
  { id: 3, name: 'Juliana Ferreira', phone: '(11) 96655-4433', lastVisit: '15 Abr 2024', gender: 'Feminino', birth: '03/01/1998' }
];

const INITIAL_PROCEDURES = [
  "Limpeza Profilática", "Restauração em Resina", "Tratamento de Canal", 
  "Avaliação Ortodôntica", "Extração Siso", "Clareamento Dental", "Prótese Protocolo"
];

const APPOINTMENTS = [
  { id: 1, name: 'Ana Paula Souza', time: '09:00', procedure: 'Limpeza Profilática', date: '2024-04-18T09:00' },
  { id: 2, name: 'Ricardo Albuquerque', time: '10:30', procedure: 'Extração Siso', date: '2024-04-18T10:30' },
  { id: 3, name: 'Juliana Ferreira', time: '14:15', procedure: 'Avaliação Ortodôntica', date: '2024-04-18T14:15' }
];

// --- COMPONENTES ATÔMICOS (NÍVEL 0) ---

const FormField = ({ label, children, icon: Icon, disabled }) => (
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

const KpiCard = ({ title, value, subtitle, trend, trendValue, icon: Icon, color }) => (
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

// --- COMPONENTES DE ESTRUTURA (NÍVEL 1, 2 E 3) ---

/**
 * ViewLayout: Elemento Atômico de Nível 1.
 */
const ViewLayout = ({ title, badge, actions, children }) => (
  <div className="flex-1 flex flex-col overflow-y-auto scroll-smooth bg-[#EAEEF2]">
    <header className="px-8 pt-12 pb-8 md:pt-20 md:pb-12 bg-white/50 backdrop-blur-sm sticky top-0 z-30 md:relative md:bg-transparent border-b md:border-none border-slate-100">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-6 md:gap-0">
        <div className="flex flex-col gap-4">
          <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 tracking-tighter leading-none">{title}</h1>
          {badge && (
            <div className="flex items-center gap-2 text-[10px] font-black uppercase text-sky-700 bg-sky-50 px-4 py-1.5 rounded-full w-fit ring-1 ring-sky-100 shadow-sm animate-in fade-in slide-in-from-top-1">
              <MapPin size={10}/> {badge}
            </div>
          )}
        </div>
        <div className="flex items-center gap-4 mb-2">
           {actions ? actions : (
             <>
               <div className="p-3 bg-white rounded-xl shadow-sm border border-slate-100 text-slate-400 hover:text-sky-700 transition-all cursor-pointer"><Bell size={20}/></div>
               <div className="w-10 h-10 bg-sky-700 rounded-xl text-white flex items-center justify-center font-bold shadow-lg shadow-sky-100 ring-4 ring-white">L</div>
             </>
           )}
        </div>
      </div>
    </header>
    <section className="max-w-6xl mx-auto w-full p-8 pb-40">
      {children}
    </section>
  </div>
);

/**
 * AdaptiveHeader: Cabeçalho Unificado para Níveis 2 e 3.
 */
const AdaptiveHeader = ({ title, subtitle, icon: Icon, iconColor = "bg-sky-700", actions }) => (
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

/**
 * AdaptiveModal: Container de Nível 2.
 */
const AdaptiveModal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-xl animate-in fade-in duration-500" onClick={onClose}></div>
      <div className={`relative bg-white w-full max-w-xl md:max-w-3xl max-h-[90vh] rounded-3xl shadow-2xl flex flex-col animate-in zoom-in-95 duration-300 overflow-hidden border border-white/20`}>
        {children}
      </div>
    </div>
  );
};

// --- ESTRUTURA DASHBOARD (ORQUESTRADOR) ---

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [allPatients, setAllPatients] = useState(INITIAL_PATIENTS);
  const [allProcedures, setAllProcedures] = useState(INITIAL_PROCEDURES);
  
  const [modalPatient, setModalPatient] = useState(false);
  const [modalSettingsProc, setModalSettingsProc] = useState(false);
  
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [newProcName, setNewProcName] = useState("");

  const handleOpenPatientRecord = (patient) => {
    setSelectedPatient(patient);
    setModalPatient(true);
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen bg-[#EAEEF2] flex flex-col md:flex-row font-sans selection:bg-sky-100">
      
      {/* SIDEBAR PADRONIZADA */}
      <aside className="hidden md:flex flex-col bg-white border-r border-slate-200 h-screen sticky top-0 w-72 z-40 shrink-0">
        <div className="p-8 pb-10 flex items-center gap-4 overflow-hidden">
          <div className="bg-sky-700 p-3 rounded-2xl text-white shadow-xl shadow-sky-100 shrink-0"><Stethoscope size={24}/></div>
          <span className="text-2xl font-light text-slate-900 italic tracking-tighter leading-none shrink-0">Odonto<span className="text-sky-700 font-bold not-italic">Flow</span></span>
        </div>
        <nav className="flex-1 px-6 space-y-4">
          {[
            { id: 'overview', icon: LayoutDashboard, label: 'Painel Clínico' }, 
            { id: 'patients', icon: Users, label: 'Base de Pacientes' },
            { id: 'settings', icon: Settings, label: 'Configurações' }
          ].map(item => (
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

      {/* NÍVEL 1: PAINEL DIÁRIO (WIDGETS DE KPI E AGENDA) */}
      {activeTab === 'overview' && (
        <ViewLayout title="Painel Diário" badge="Clínica Matriz SP">
           <div className="space-y-12">
              <div className="flex md:grid md:grid-cols-3 gap-6 overflow-x-auto scrollbar-hide pb-4 px-1">
                 <KpiCard title="Atendimentos" value="12" subtitle="Agendados hoje" trend="up" trendValue="24" icon={Calendar} color="bg-sky-600" />
                 <KpiCard title="Faturamento" value="R$ 8.4k" subtitle="Projeção diária" trend="up" trendValue="12" icon={TrendingUp} color="bg-emerald-600" />
                 <KpiCard title="Ocupação" value="92%" subtitle="Cadeiras ativas" trend="down" trendValue="2" icon={ActivityIcon} color="bg-indigo-600" />
              </div>
              
              <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden divide-y divide-slate-50">
                <div className="p-10 flex justify-between items-center bg-slate-50/30">
                   <h3 className="text-xs font-black uppercase text-slate-400 tracking-widest">Agenda de Hoje</h3>
                </div>
                {APPOINTMENTS.map((item, idx) => (
                  <button key={idx} onClick={() => handleOpenPatientRecord(allPatients.find(p => p.name === item.name))} className="w-full flex items-center justify-between px-10 py-8 hover:bg-slate-50 transition-all text-left group">
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

      {/* NÍVEL 1: BASE DE PACIENTES (WIDGETS DE PRONTUÁRIO) */}
      {activeTab === 'patients' && (
        <ViewLayout 
          title="Base de Pacientes" 
          badge="Índice de Prontuários"
          actions={
            <button 
              onClick={() => { setSelectedPatient(null); setModalPatient(true); setIsEditing(true); }}
              className="flex items-center gap-3 px-6 py-3 bg-sky-700 text-white rounded-xl font-bold text-xs uppercase tracking-widest shadow-xl shadow-sky-100 hover:bg-sky-800 transition-all"
            >
              <UserPlus size={18} />
              <span className="hidden md:inline">Novo Cadastro</span>
            </button>
          }
        >
           <div className="space-y-10">
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
                 <Search className="text-slate-300" size={20} />
                 <input type="text" placeholder="Pesquisar..." className="flex-1 bg-transparent border-none outline-none text-base font-bold text-slate-900 placeholder:text-slate-300" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {allPatients.map(p => (
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

      {/* NÍVEL 1: CONFIGURAÇÕES (WIDGETS ADMINISTRATIVOS) */}
      {activeTab === 'settings' && (
        <ViewLayout title="Configurações" badge="Gestão Administrativa">
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* WIDGET: CATÁLOGO DE SERVIÇOS */}
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

              {/* PLACEHOLDER: ESTÉTICA PRESERVADA */}
              <div className="bg-slate-50/50 p-10 rounded-3xl border border-dashed border-slate-200 flex flex-col items-center justify-center text-center opacity-60">
                 <div className="w-16 h-16 bg-white rounded-2xl border border-slate-200 flex items-center justify-center text-slate-300 mb-6"><Settings size={28}/></div>
                 <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Novos Ajustes em Breve</p>
              </div>
           </div>
        </ViewLayout>
      )}

      {/* TAB BAR MOBILE */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-slate-200 h-24 px-8 pt-2 pb-8 flex justify-around items-center z-[50] md:hidden">
        {[
          { id: 'overview', icon: LayoutDashboard, label: 'Hoje' }, 
          { id: 'patients', icon: Users, label: 'Base' }, 
          { id: 'settings', icon: Settings, label: 'Ajustes' }
        ].map(item => (
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

      {/* NÍVEL 2: GESTÃO DE SERVIÇOS (ABERTO POR WIDGET) */}
      <AdaptiveModal isOpen={modalSettingsProc} onClose={() => setModalSettingsProc(false)}>
        <AdaptiveHeader 
          title="Catálogo de Serviços" 
          subtitle="Configuração do Portfólio" 
          icon={Layers}
          actions={
            <button onClick={() => setModalSettingsProc(false)} className="p-3 bg-slate-100 text-slate-400 hover:text-slate-900 rounded-xl transition-all"><X size={20} /></button>
          }
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
                onClick={() => { if(newProcName.trim()) { setAllProcedures([...allProcedures, newProcName.trim()]); setNewProcName(""); } }}
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
                    onClick={() => setAllProcedures(allProcedures.filter(p => p !== proc))}
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

      {/* NÍVEL 2: FICHA DO PACIENTE (ABERTA POR WIDGET) */}
      <AdaptiveModal isOpen={modalPatient} onClose={() => setModalPatient(false)}>
        <AdaptiveHeader 
          title={isEditing ? (selectedPatient ? "Editando Prontuário" : "Novo Cadastro") : "Ficha Clínica"} 
          subtitle={selectedPatient?.name || "Cadastro de Dados"} 
          icon={User}
          iconColor={isEditing ? "bg-emerald-600" : "bg-sky-700"}
          actions={
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
          }
        />
        <div className="p-10 space-y-10 pb-32 overflow-y-auto scrollbar-hide">
           <div className="bg-white rounded-3xl overflow-hidden border border-slate-100 divide-y divide-slate-50 shadow-sm">
             <FormField label="Nome Completo" icon={User} disabled={!isEditing}>
               <input 
                type="text" 
                disabled={!isEditing} 
                defaultValue={selectedPatient?.name || ""} 
                className="w-full bg-transparent border-none text-lg font-bold text-slate-900 outline-none" 
                placeholder="João da Silva" 
               />
             </FormField>
             <FormField label="WhatsApp" icon={Phone} disabled={!isEditing}>
               <input 
                type="text" 
                disabled={!isEditing} 
                defaultValue={selectedPatient?.phone || ""} 
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

const App = () => {
  const [view, setView] = useState('landing');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-white space-y-4">
      <div className="w-10 h-10 border-[3px] border-sky-700 border-t-transparent rounded-full animate-spin"></div>
      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300">Sincronizando Ecossistema</p>
    </div>
  );

  if (view === 'landing') return (
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

  return <Dashboard />;
};

export default App;
