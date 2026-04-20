import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  Archive,
  Check,
  CheckSquare,
  ChevronsUpDown,
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
  Square,
  Trash2,
  Menu,
  User,
  UserPlus,
  Users,
  X
} from 'lucide-react';
import { APPOINTMENTS, AVAILABLE_CLINICS_FALLBACK, INITIAL_PATIENTS, INITIAL_PROCEDURES } from './constants.js';
import {
  fetchAddressByCep,
  fetchCompanyByCnpj,
  formatCnpj,
  isValidCnpj,
  loadClinicDataset,
  loadClinicRegistration,
  saveClinicRegistration,
  setActiveClinicRpc
} from './data-gateway.js';
import { AdaptiveHeader, AdaptiveModal, FormField, UiButton, ViewLayout } from './components.js';
import DailyPanel from './daily-panel.js';

const Dashboard = () => {
  const PATIENTS_SORT_KEY = 'odontoflow:patients-sort';
  const PATIENTS_SEARCH_VISIBLE_KEY = 'odontoflow:patients-search-visible';
  const ACTIVE_CLINIC_KEY = 'odontoflow:active-clinic-id';
  const [activeTab, setActiveTab] = useState('overview');
  const [availableClinics] = useState(AVAILABLE_CLINICS_FALLBACK);
  const [currentClinic, setCurrentClinic] = useState(null);
  const [allPatients, setAllPatients] = useState(INITIAL_PATIENTS);
  const [allProcedures, setAllProcedures] = useState(INITIAL_PROCEDURES);
  const [appointments, setAppointments] = useState(APPOINTMENTS);
  const [usingFallbackData, setUsingFallbackData] = useState(true);
  const [datasetHydrated, setDatasetHydrated] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const [modalPatient, setModalPatient] = useState(false);
  const [modalSettingsProc, setModalSettingsProc] = useState(false);

  const [selectedPatient, setSelectedPatient] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [patientForm, setPatientForm] = useState({
    name: '',
    phone: '',
    cep: '',
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: ''
  });
  const [cepLookupStatus, setCepLookupStatus] = useState('idle');
  const [cepLookupMessage, setCepLookupMessage] = useState('');
  const [newProcName, setNewProcName] = useState('');
  const [patientsSort, setPatientsSort] = useState('name-asc');
  const [patientSearch, setPatientSearch] = useState('');
  const [isPatientSearchVisible, setIsPatientSearchVisible] = useState(false);
  const [isMultiSelectMode, setIsMultiSelectMode] = useState(false);
  const [selectedPatientIds, setSelectedPatientIds] = useState([]);
  const [clinicSwitchStatus, setClinicSwitchStatus] = useState('idle');
  const [clinicRegistrationForm, setClinicRegistrationForm] = useState({
    phone: '',
    email: '',
    address: '',
    cnpj: '',
    legalName: '',
    tradeName: '',
    legalNature: '',
    primaryCnae: '',
    registrationStatus: ''
  });
  const [cnpjLookupStatus, setCnpjLookupStatus] = useState('idle');
  const [cnpjLookupMessage, setCnpjLookupMessage] = useState('');
  const [clinicRegistrationStatus, setClinicRegistrationStatus] = useState('idle');
  const [clinicRegistrationMessage, setClinicRegistrationMessage] = useState('');

  useEffect(() => {
    const savedSortPreference = window.localStorage.getItem(PATIENTS_SORT_KEY);
    const savedSearchVisibility = window.localStorage.getItem(PATIENTS_SEARCH_VISIBLE_KEY);

    if (savedSortPreference) {
      setPatientsSort(savedSortPreference);
    }
    if (savedSearchVisibility !== null) {
      setIsPatientSearchVisible(savedSearchVisibility === 'true');
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(PATIENTS_SORT_KEY, patientsSort);
  }, [patientsSort]);

  useEffect(() => {
    window.localStorage.setItem(PATIENTS_SEARCH_VISIBLE_KEY, String(isPatientSearchVisible));
  }, [isPatientSearchVisible]);

  const sortedPatients = useMemo(() => {
    const patients = [...allPatients];

    switch (patientsSort) {
      case 'name-desc':
        return patients.sort((a, b) => b.name.localeCompare(a.name, 'pt-BR'));
      case 'id-asc':
        return patients.sort((a, b) => a.id - b.id);
      case 'id-desc':
        return patients.sort((a, b) => b.id - a.id);
      case 'name-asc':
      default:
        return patients.sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
    }
  }, [allPatients, patientsSort]);

  const visiblePatients = useMemo(() => (
    sortedPatients.filter((patient) => !patient.archivedAt)
  ), [sortedPatients]);

  const filteredPatients = useMemo(() => {
    const normalizedTerm = patientSearch.trim().toLocaleLowerCase('pt-BR');
    if (!normalizedTerm) return visiblePatients;

    return visiblePatients.filter((patient) => (
      patient.name.toLocaleLowerCase('pt-BR').includes(normalizedTerm)
      || String(patient.id).toLocaleLowerCase('pt-BR').includes(normalizedTerm)
      || String(patient.phone || '').toLocaleLowerCase('pt-BR').includes(normalizedTerm)
    ));
  }, [visiblePatients, patientSearch]);

  const handleOpenPatientRecord = (patient) => {
    setSelectedPatient(patient);
    setModalPatient(true);
    setIsEditing(false);
  };

  const formatCep = (rawValue) => {
    const digits = String(rawValue || '').replace(/\D/g, '').slice(0, 8);
    if (digits.length <= 5) return digits;
    return `${digits.slice(0, 5)}-${digits.slice(5)}`;
  };

  const fillPatientForm = (patient) => {
    const address = patient?.address || {};

    setPatientForm({
      name: patient?.name || '',
      phone: patient?.phone || '',
      cep: address.cep ? formatCep(address.cep) : '',
      street: address.street || '',
      number: address.number || '',
      complement: address.complement || '',
      neighborhood: address.neighborhood || '',
      city: address.city || '',
      state: address.state || ''
    });
    setCepLookupStatus('idle');
    setCepLookupMessage('');
  };

  const handleCepLookup = async () => {
    if (!isEditing) return;
    setCepLookupStatus('loading');
    setCepLookupMessage('Buscando endereço pelo CEP...');

    try {
      const address = await fetchAddressByCep(patientForm.cep);

      setPatientForm((current) => ({
        ...current,
        cep: formatCep(address.cep),
        street: address.street || current.street,
        neighborhood: address.neighborhood || current.neighborhood,
        city: address.city || current.city,
        state: address.state || current.state
      }));

      setCepLookupStatus('success');
      setCepLookupMessage('Campos principais preenchidos. Complete número e complemento.');
    } catch (error) {
      setCepLookupStatus('error');
      setCepLookupMessage(error?.message || 'Não foi possível consultar o CEP.');
    }
  };

  useEffect(() => {
    const persistedClinicId = window.localStorage.getItem(ACTIVE_CLINIC_KEY);
    const fallbackClinic = AVAILABLE_CLINICS_FALLBACK[0] || null;
    const resolvedClinic = availableClinics.find((clinic) => clinic.id === persistedClinicId) || fallbackClinic;

    if (!persistedClinicId && resolvedClinic?.id) {
      window.localStorage.setItem(ACTIVE_CLINIC_KEY, resolvedClinic.id);
    }
    setCurrentClinic(resolvedClinic);
  }, [availableClinics]);

  const reloadTenantScopedData = async () => {
    try {
      const dataset = await loadClinicDataset();
      setAllPatients(dataset.patients);
      setAllProcedures(dataset.procedures);
      setAppointments(dataset.appointments);
      setUsingFallbackData(false);
    } catch (error) {
      setUsingFallbackData(true);
    } finally {
      setDatasetHydrated(true);
    }
  };

  useEffect(() => {
    if (datasetHydrated) return;
    reloadTenantScopedData();
  }, [datasetHydrated]);

  useEffect(() => {
    if (!modalPatient) return;
    fillPatientForm(selectedPatient);
  }, [modalPatient, selectedPatient]);

  useEffect(() => {
    const hydrateClinicRegistration = async () => {
      try {
        const data = await loadClinicRegistration();
        if (!data) return;

        setClinicRegistrationForm({
          phone: data.contact?.phone || '',
          email: data.contact?.email || '',
          address: data.contact?.address || '',
          cnpj: formatCnpj(data.fiscal?.cnpj || ''),
          legalName: data.fiscal?.legalName || '',
          tradeName: data.fiscal?.tradeName || '',
          legalNature: data.fiscal?.legalNature || '',
          primaryCnae: data.fiscal?.primaryCnae || '',
          registrationStatus: data.fiscal?.registrationStatus || ''
        });
      } catch (error) {
        setClinicRegistrationStatus('error');
        setClinicRegistrationMessage(error?.message || 'Não foi possível carregar o cadastro da clínica.');
      }
    };

    hydrateClinicRegistration();
  }, []);

  useEffect(() => {
    const shouldLockScroll = mobileNavOpen;
    document.body.style.overflow = shouldLockScroll ? 'hidden' : '';

    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileNavOpen]);

  const navItems = [
    { id: 'overview', icon: LayoutDashboard, label: 'Painel Diário (Nível 0)' },
    { id: 'patients', icon: Users, label: 'Base de Pacientes' },
    { id: 'settings', icon: Settings, label: 'Configurações' }
  ];

  const handleMobileNavSelect = (tabId) => {
    setActiveTab(tabId);
    setMobileNavOpen(false);
  };

  const handleSwitchClinic = async (clinicId) => {
    if (!clinicId || clinicId === currentClinic?.id) return;
    const nextClinic = availableClinics.find((clinic) => clinic.id === clinicId);
    if (!nextClinic) return;

    setClinicSwitchStatus('loading');

    try {
      await setActiveClinicRpc(clinicId);
      window.localStorage.setItem(ACTIVE_CLINIC_KEY, clinicId);
      setCurrentClinic(nextClinic);
      await reloadTenantScopedData();
      setClinicSwitchStatus('success');
    } catch (error) {
      setClinicSwitchStatus('error');
    }
  };

  const handleTogglePatientSelection = (patientId) => {
    setSelectedPatientIds((current) => (
      current.includes(patientId)
        ? current.filter((id) => id !== patientId)
        : [...current, patientId]
    ));
  };

  const handleToggleMultiSelectMode = () => {
    setIsMultiSelectMode((current) => {
      if (current) {
        setSelectedPatientIds([]);
      }
      return !current;
    });
  };

  const handleSelectAllPatients = () => {
    const allVisibleIds = filteredPatients.map((patient) => patient.id);
    const isAllSelected = allVisibleIds.length > 0 && allVisibleIds.every((id) => selectedPatientIds.includes(id));
    setSelectedPatientIds(isAllSelected ? [] : allVisibleIds);
  };

  const handleArchiveSelectedPatients = () => {
    if (selectedPatientIds.length === 0) return;
    const archiveDate = new Date().toISOString();

    setAllPatients((current) => (
      current.map((patient) => (
        selectedPatientIds.includes(patient.id)
          ? { ...patient, archivedAt: archiveDate }
          : patient
      ))
    ));
    setSelectedPatientIds([]);
    setIsMultiSelectMode(false);
  };

  const handleLookupCnpj = async () => {
    const cnpj = clinicRegistrationForm.cnpj;
    if (!isValidCnpj(cnpj)) {
      setCnpjLookupStatus('error');
      setCnpjLookupMessage('CNPJ inválido. Confira os dígitos verificadores antes de consultar.');
      return;
    }

    setCnpjLookupStatus('loading');
    setCnpjLookupMessage('Consultando dados fiscais...');

    try {
      const company = await fetchCompanyByCnpj(cnpj);
      setClinicRegistrationForm((current) => ({
        ...current,
        cnpj: formatCnpj(company.cnpj || cnpj),
        legalName: company.legalName || current.legalName,
        tradeName: company.tradeName || current.tradeName,
        legalNature: company.legalNature || current.legalNature,
        primaryCnae: company.primaryCnae || current.primaryCnae,
        registrationStatus: company.registrationStatus || current.registrationStatus
      }));
      setCnpjLookupStatus('success');
      setCnpjLookupMessage('Dados fiscais preenchidos. Complete manualmente os campos que faltarem.');
    } catch (error) {
      setCnpjLookupStatus('error');
      setCnpjLookupMessage(error?.message || 'Não foi possível consultar o CNPJ.');
    }
  };

  const handleSaveClinicRegistration = async () => {
    if (!isValidCnpj(clinicRegistrationForm.cnpj)) {
      setClinicRegistrationStatus('error');
      setClinicRegistrationMessage('CNPJ inválido. Ajuste o CNPJ antes de salvar.');
      return;
    }

    setClinicRegistrationStatus('loading');
    setClinicRegistrationMessage('Salvando cadastro da clínica...');

    try {
      await saveClinicRegistration({
        clinicId: currentClinic?.id || null,
        contact: {
          phone: clinicRegistrationForm.phone,
          email: clinicRegistrationForm.email,
          address: clinicRegistrationForm.address
        },
        fiscal: {
          cnpj: clinicRegistrationForm.cnpj,
          legalName: clinicRegistrationForm.legalName,
          tradeName: clinicRegistrationForm.tradeName,
          legalNature: clinicRegistrationForm.legalNature,
          primaryCnae: clinicRegistrationForm.primaryCnae,
          registrationStatus: clinicRegistrationForm.registrationStatus
        }
      });

      setClinicRegistrationStatus('success');
      setClinicRegistrationMessage('Cadastro da clínica salvo com sucesso.');
    } catch (error) {
      setClinicRegistrationStatus('error');
      setClinicRegistrationMessage(error?.message || 'Não foi possível salvar o cadastro da clínica.');
    }
  };

  return (
    <div className="min-h-screen bg-[#EAEEF2] flex flex-col md:flex-row font-sans selection:bg-sky-100">
      <div className="mobile-nav-trigger md:hidden">
        <UiButton
          icon={Menu}
          label="Navegação"
          tone="neutral"
          size="md"
          className="mobile-nav-trigger__button"
          onClick={() => setMobileNavOpen(true)}
        />
      </div>

      {mobileNavOpen && (
        <div className="mobile-smart-window md:hidden" role="dialog" aria-modal="true" aria-label="Navegação inteligente">
          <button className="mobile-smart-window__overlay" type="button" aria-label="Fechar navegação" onClick={() => setMobileNavOpen(false)} />
          <aside className="mobile-smart-window__panel">
            <div className="mobile-smart-window__header">
              <div>
                <p className="mobile-smart-window__kicker">Navegação Inteligente</p>
                <h2>OdontoFlow</h2>
                <p className="text-xs text-slate-500 mt-1 font-semibold">{currentClinic?.name || 'Clínica não definida'}</p>
              </div>
              <UiButton icon={X} labelLayout="hidden" tone="neutral" onClick={() => setMobileNavOpen(false)} aria-label="Fechar" />
            </div>

            <nav className="mobile-smart-window__nav" aria-label="Menu principal">
              {navItems.map((item) => (
                <UiButton
                  key={item.id}
                  onClick={() => handleMobileNavSelect(item.id)}
                  icon={item.icon}
                  label={item.label}
                  size="lg"
                  labelLayout="side"
                  className={`sidebar-nav-btn ${activeTab === item.id ? 'is-active' : ''}`}
                />
              ))}
            </nav>
            <div className="px-4 mt-4 space-y-2">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Trocar clínica</p>
              <div className="relative">
                <ChevronsUpDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <select
                  value={currentClinic?.id || ''}
                  onChange={(event) => handleSwitchClinic(event.target.value)}
                  disabled={clinicSwitchStatus === 'loading'}
                  className="w-full appearance-none rounded-2xl border border-slate-200 bg-white px-4 py-3 pr-10 text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-sky-100 disabled:opacity-50"
                >
                  {availableClinics.map((clinic) => (
                    <option key={clinic.id} value={clinic.id}>{clinic.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </aside>
        </div>
      )}

      <aside className="hidden md:flex flex-col bg-white border-r border-slate-200 h-screen sticky top-0 w-72 z-40 shrink-0">
        <div className="p-8 pb-10 flex items-center gap-4 overflow-hidden">
          <div className="bg-sky-700 p-3 rounded-2xl text-white shadow-xl shadow-sky-100 shrink-0"><Stethoscope size={24} /></div>
          <div>
            <span className="text-2xl font-light text-slate-900 italic tracking-tighter leading-none shrink-0">Odonto<span className="text-sky-700 font-bold not-italic">Flow</span></span>
            <p className="text-xs text-slate-500 mt-1 font-semibold">{currentClinic?.name || 'Clínica não definida'}</p>
          </div>
        </div>
        <nav className="flex-1 px-6 space-y-4">
          {navItems.map((item) => (
            <UiButton
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              icon={item.icon}
              label={item.label}
              size="lg"
              labelLayout="side"
              className={`sidebar-nav-btn ${activeTab === item.id ? 'is-active' : ''}`}
            />
          ))}
        </nav>
        <div className="px-6 pb-8 space-y-2">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Trocar clínica</p>
          <div className="relative">
            <ChevronsUpDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <select
              value={currentClinic?.id || ''}
              onChange={(event) => handleSwitchClinic(event.target.value)}
              disabled={clinicSwitchStatus === 'loading'}
              className="w-full appearance-none rounded-2xl border border-slate-200 bg-white px-4 py-3 pr-10 text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-sky-100 disabled:opacity-50"
            >
              {availableClinics.map((clinic) => (
                <option key={clinic.id} value={clinic.id}>{clinic.name}</option>
              ))}
            </select>
          </div>
        </div>
      </aside>

      {activeTab === 'overview' && (
        <DailyPanel
          appointments={appointments}
          allPatients={allPatients}
          usingFallbackData={usingFallbackData}
          onOpenPatientRecord={handleOpenPatientRecord}
          currentClinic={currentClinic}
        />
      )}

      {activeTab === 'patients' && (
        <ViewLayout
          title="Base de Pacientes"
          badge="Índice de Prontuários"
          actions={(
            <div className="flex items-center gap-3">
              <UiButton
                onClick={() => { setSelectedPatient(null); setModalPatient(true); setIsEditing(true); }}
                icon={UserPlus}
                label="Novo Cadastro"
                tone="primary"
                size="md"
                className="uppercase tracking-widest shadow-xl shadow-sky-100"
              />
              <UiButton
                onClick={() => setIsPatientSearchVisible((current) => !current)}
                icon={Search}
                label="Pesquisa"
                tone={isPatientSearchVisible ? 'info' : 'neutral'}
                size="md"
                className="uppercase tracking-widest"
              />
              <UiButton
                onClick={handleToggleMultiSelectMode}
                icon={isMultiSelectMode ? CheckSquare : Square}
                label="Multi"
                tone={isMultiSelectMode ? 'info' : 'neutral'}
                size="md"
                className="uppercase tracking-widest"
              />
            </div>
          )}
        >
          <div className="space-y-10">
            {isPatientSearchVisible && (
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
                <Search className="text-slate-300" size={20} />
                <input
                  type="text"
                  placeholder="Pesquisar..."
                  value={patientSearch}
                  onChange={(event) => setPatientSearch(event.target.value)}
                  className="flex-1 bg-transparent border-none outline-none text-base font-bold text-slate-900 placeholder:text-slate-300"
                />
                <div className="flex items-center gap-3 pl-3 border-l border-slate-100">
                  <label htmlFor="patients-sort" className="text-[10px] font-black uppercase tracking-widest text-slate-400">Ordenar</label>
                  <select
                    id="patients-sort"
                    value={patientsSort}
                    onChange={(event) => setPatientsSort(event.target.value)}
                    className="bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-sky-100"
                  >
                    <option value="name-asc">Nome (A → Z)</option>
                    <option value="name-desc">Nome (Z → A)</option>
                    <option value="id-asc">ID (menor → maior)</option>
                    <option value="id-desc">ID (maior → menor)</option>
                  </select>
                </div>
              </div>
            )}

            {isMultiSelectMode && (
              <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <p className="text-xs font-black uppercase tracking-widest text-slate-500">
                  Multi seleção ativa · {selectedPatientIds.length} selecionado(s)
                </p>
                <div className="flex items-center gap-3">
                  <UiButton
                    onClick={handleSelectAllPatients}
                    icon={CheckSquare}
                    label={selectedPatientIds.length === filteredPatients.length && filteredPatients.length > 0 ? 'Limpar todos' : 'Selecionar todos'}
                    tone="neutral"
                    size="sm"
                  />
                  <UiButton
                    onClick={handleArchiveSelectedPatients}
                    icon={Archive}
                    label="Arquivar selecionados"
                    tone="danger"
                    size="sm"
                    disabled={selectedPatientIds.length === 0}
                  />
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPatients.map((p) => (
                <div key={p.id} onClick={() => (isMultiSelectMode ? handleTogglePatientSelection(p.id) : handleOpenPatientRecord(p))} className={`bg-white p-8 rounded-3xl border shadow-sm hover:shadow-xl hover:translate-y-[-4px] transition-all cursor-pointer group ${selectedPatientIds.includes(p.id) ? 'border-sky-300 ring-2 ring-sky-100' : 'border-slate-50'}`}>
                  <div className="flex items-center gap-5 mb-8">
                    <div className="w-14 h-14 rounded-2xl bg-sky-50 flex items-center justify-center text-sky-700 font-bold text-xl group-hover:bg-sky-700 group-hover:text-white transition-all">{p.name[0]}</div>
                    <div className="flex-1">
                      <p className="text-lg font-bold text-slate-900 group-hover:text-sky-700 transition-colors">{p.name}</p>
                      <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">ID: {p.id.toString().padStart(4, '0')}</p>
                    </div>
                    {isMultiSelectMode && (
                      <div className={`w-7 h-7 rounded-lg border flex items-center justify-center transition-all ${selectedPatientIds.includes(p.id) ? 'bg-sky-700 border-sky-700 text-white' : 'bg-white border-slate-300 text-slate-300'}`}>
                        <Check size={14} />
                      </div>
                    )}
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
          <div className="space-y-8">
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 md:p-8 space-y-6">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Cadastro da Clínica</p>
                  <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">Dados de Contato e Fiscal</h3>
                </div>
                <UiButton
                  onClick={handleSaveClinicRegistration}
                  label={clinicRegistrationStatus === 'loading' ? 'Salvando...' : 'Salvar Cadastro'}
                  tone={clinicRegistrationStatus === 'error' ? 'danger' : 'primary'}
                  disabled={clinicRegistrationStatus === 'loading'}
                />
              </div>

              <div className="space-y-3">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Contato</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Telefone
                    <input
                      type="text"
                      value={clinicRegistrationForm.phone}
                      onChange={(event) => setClinicRegistrationForm((current) => ({ ...current, phone: event.target.value }))}
                      className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-sky-100"
                      placeholder="(00) 00000-0000"
                    />
                  </label>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Email
                    <input
                      type="email"
                      value={clinicRegistrationForm.email}
                      onChange={(event) => setClinicRegistrationForm((current) => ({ ...current, email: event.target.value }))}
                      className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-sky-100"
                      placeholder="contato@clinica.com.br"
                    />
                  </label>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider md:col-span-2">
                    Endereço
                    <input
                      type="text"
                      value={clinicRegistrationForm.address}
                      onChange={(event) => setClinicRegistrationForm((current) => ({ ...current, address: event.target.value }))}
                      className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-sky-100"
                      placeholder="Rua, número, bairro, cidade/UF"
                    />
                  </label>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Fiscal</p>
                  <UiButton
                    onClick={handleLookupCnpj}
                    label={cnpjLookupStatus === 'loading' ? 'Consultando CNPJ...' : 'Consultar CNPJ'}
                    tone={cnpjLookupStatus === 'error' ? 'danger' : 'info'}
                    size="sm"
                    disabled={cnpjLookupStatus === 'loading'}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    CNPJ
                    <input
                      type="text"
                      value={clinicRegistrationForm.cnpj}
                      onChange={(event) => setClinicRegistrationForm((current) => ({ ...current, cnpj: formatCnpj(event.target.value) }))}
                      className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-sky-100"
                      placeholder="00.000.000/0000-00"
                    />
                  </label>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Situação Cadastral
                    <input
                      type="text"
                      value={clinicRegistrationForm.registrationStatus}
                      onChange={(event) => setClinicRegistrationForm((current) => ({ ...current, registrationStatus: event.target.value }))}
                      className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-sky-100"
                      placeholder="Ativa, Inapta..."
                    />
                  </label>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Razão Social
                    <input
                      type="text"
                      value={clinicRegistrationForm.legalName}
                      onChange={(event) => setClinicRegistrationForm((current) => ({ ...current, legalName: event.target.value }))}
                      className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-sky-100"
                      placeholder="Razão social da clínica"
                    />
                  </label>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Nome Fantasia
                    <input
                      type="text"
                      value={clinicRegistrationForm.tradeName}
                      onChange={(event) => setClinicRegistrationForm((current) => ({ ...current, tradeName: event.target.value }))}
                      className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-sky-100"
                      placeholder="Nome fantasia"
                    />
                  </label>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Natureza Jurídica
                    <input
                      type="text"
                      value={clinicRegistrationForm.legalNature}
                      onChange={(event) => setClinicRegistrationForm((current) => ({ ...current, legalNature: event.target.value }))}
                      className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-sky-100"
                      placeholder="Sociedade empresária..."
                    />
                  </label>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    CNAE Principal
                    <input
                      type="text"
                      value={clinicRegistrationForm.primaryCnae}
                      onChange={(event) => setClinicRegistrationForm((current) => ({ ...current, primaryCnae: event.target.value }))}
                      className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-sky-100"
                      placeholder="8630-5/04 - Atividade odontológica"
                    />
                  </label>
                </div>
              </div>

              {cnpjLookupMessage && (
                <p className={`text-xs font-semibold ${cnpjLookupStatus === 'error' ? 'text-rose-600' : 'text-sky-700'}`}>
                  {cnpjLookupMessage}
                </p>
              )}

              {clinicRegistrationMessage && (
                <p className={`text-xs font-semibold ${clinicRegistrationStatus === 'error' ? 'text-rose-600' : 'text-emerald-700'}`}>
                  {clinicRegistrationMessage}
                </p>
              )}
            </div>

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
          </div>
        </ViewLayout>
      )}

      <AdaptiveModal isOpen={modalSettingsProc} onClose={() => setModalSettingsProc(false)}>
        <AdaptiveHeader
          title="Catálogo de Serviços"
          subtitle="Configuração do Portfólio"
          icon={Layers}
          actions={<UiButton onClick={() => setModalSettingsProc(false)} icon={X} labelLayout="hidden" tone="neutral" />}
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
              <UiButton
                onClick={() => { if (newProcName.trim()) { setAllProcedures([...allProcedures, newProcName.trim()]); setNewProcName(''); } }}
                label="Adicionar"
                tone="primary"
                className="px-8 uppercase tracking-widest shadow-lg shadow-sky-100"
              />
            </div>

            <div className="space-y-3">
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] mb-4">Itens Cadastrados</p>
              {allProcedures.map((proc, idx) => (
                <div key={idx} className="flex items-center justify-between p-6 bg-slate-50/50 border border-slate-100 rounded-2xl group animate-in fade-in slide-in-from-left-2 duration-300">
                  <span className="text-lg font-bold text-slate-900">{proc}</span>
                  <UiButton
                    onClick={() => setAllProcedures(allProcedures.filter((p) => p !== proc))}
                    icon={Trash2}
                    tone="danger"
                    labelLayout="hidden"
                    size="sm"
                    className="opacity-0 group-hover:opacity-100"
                  />
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
                  <UiButton onClick={() => { setIsEditing(false); fillPatientForm(selectedPatient); }} icon={X} tone="danger" labelLayout="hidden" />
                  <UiButton onClick={() => { setIsEditing(false); setModalPatient(false); }} icon={Check} tone="success" labelLayout="hidden" className="shadow-lg" />
                </div>
              ) : (
                <div className="flex items-center gap-2 animate-in fade-in zoom-in-95">
                  <UiButton icon={Globe} tone="info" labelLayout="hidden" title="Compartilhar" />
                  <UiButton icon={Trash2} tone="danger" labelLayout="hidden" title="Excluir" />
                  <div className="w-px h-8 bg-slate-200 mx-1"></div>
                  <UiButton onClick={() => setIsEditing(true)} icon={Pencil} tone="neutral" labelLayout="hidden" title="Editar" />
                </div>
              )}
              <UiButton onClick={() => setModalPatient(false)} icon={X} tone="neutral" labelLayout="hidden" />
            </>
          )}
        />
        <div className="p-10 space-y-10 pb-32 overflow-y-auto scrollbar-hide">
          <div className="bg-white rounded-3xl overflow-hidden border border-slate-100 divide-y divide-slate-50 shadow-sm">
            <FormField label="Nome Completo" icon={User} disabled={!isEditing}>
              <input
                type="text"
                disabled={!isEditing}
                value={patientForm.name}
                onChange={(event) => setPatientForm((current) => ({ ...current, name: event.target.value }))}
                className="w-full bg-transparent border-none text-lg font-bold text-slate-900 outline-none"
                placeholder="João da Silva"
              />
            </FormField>
            <FormField label="WhatsApp" icon={Phone} disabled={!isEditing}>
              <input
                type="text"
                disabled={!isEditing}
                value={patientForm.phone}
                onChange={(event) => setPatientForm((current) => ({ ...current, phone: event.target.value }))}
                className="w-full bg-transparent border-none text-lg font-bold text-slate-900 outline-none"
                placeholder="(00) 00000-0000"
              />
            </FormField>
          </div>

          <div className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm p-6 md:p-8 space-y-5">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Etapa</p>
                <h4 className="text-lg font-bold text-slate-900">Cadastro de Endereço</h4>
              </div>
              <UiButton
                onClick={handleCepLookup}
                label={cepLookupStatus === 'loading' ? 'Buscando...' : 'Buscar CEP'}
                tone={cepLookupStatus === 'error' ? 'danger' : 'info'}
                size="sm"
                disabled={!isEditing || cepLookupStatus === 'loading'}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                CEP
                <input
                  type="text"
                  disabled={!isEditing}
                  value={patientForm.cep}
                  onChange={(event) => setPatientForm((current) => ({ ...current, cep: formatCep(event.target.value) }))}
                  className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-sky-100 disabled:bg-slate-50"
                  placeholder="00000-000"
                />
              </label>

              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Número
                <input
                  type="text"
                  disabled={!isEditing}
                  value={patientForm.number}
                  onChange={(event) => setPatientForm((current) => ({ ...current, number: event.target.value }))}
                  className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-sky-100 disabled:bg-slate-50"
                  placeholder="Preencher manualmente"
                />
              </label>

              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider md:col-span-2">
                Rua / Logradouro
                <input
                  type="text"
                  disabled={!isEditing}
                  value={patientForm.street}
                  onChange={(event) => setPatientForm((current) => ({ ...current, street: event.target.value }))}
                  className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-sky-100 disabled:bg-slate-50"
                  placeholder="Preenchido automaticamente pelo CEP"
                />
              </label>

              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Bairro
                <input
                  type="text"
                  disabled={!isEditing}
                  value={patientForm.neighborhood}
                  onChange={(event) => setPatientForm((current) => ({ ...current, neighborhood: event.target.value }))}
                  className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-sky-100 disabled:bg-slate-50"
                  placeholder="Preenchido automaticamente pelo CEP"
                />
              </label>

              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Cidade
                <input
                  type="text"
                  disabled={!isEditing}
                  value={patientForm.city}
                  onChange={(event) => setPatientForm((current) => ({ ...current, city: event.target.value }))}
                  className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-sky-100 disabled:bg-slate-50"
                  placeholder="Preenchido automaticamente pelo CEP"
                />
              </label>

              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                UF
                <input
                  type="text"
                  disabled={!isEditing}
                  value={patientForm.state}
                  onChange={(event) => setPatientForm((current) => ({ ...current, state: event.target.value.toUpperCase().slice(0, 2) }))}
                  className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-sky-100 disabled:bg-slate-50"
                  placeholder="UF"
                />
              </label>

              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider md:col-span-2">
                Complemento
                <input
                  type="text"
                  disabled={!isEditing}
                  value={patientForm.complement}
                  onChange={(event) => setPatientForm((current) => ({ ...current, complement: event.target.value }))}
                  className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-sky-100 disabled:bg-slate-50"
                  placeholder="Apartamento, bloco, referência..."
                />
              </label>
            </div>

            {cepLookupMessage && (
              <p className={`text-xs font-semibold ${cepLookupStatus === 'error' ? 'text-rose-600' : 'text-sky-700'}`}>
                {cepLookupMessage}
              </p>
            )}
          </div>
        </div>
      </AdaptiveModal>
    </div>
  );
};

export default Dashboard;
