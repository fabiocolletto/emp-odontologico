import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  Archive,
  BadgeDollarSign,
  CalendarDays,
  Check,
  CheckSquare,
  ChevronsUpDown,
  ChevronRight,
  Globe,
  Layers,
  ListChecks,
  Pencil,
  Phone,
  Plus,
  Search,
  Settings,
  Stethoscope,
  Square,
  Trash2,
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
  loadClinicContext,
  loadClinicRegistration,
  saveClinicRegistration,
  savePatientRecord,
  saveProcedureRecord,
  setActiveClinicRpc
} from './data-gateway.js';
import { loadLightSessionSnapshot } from './session-light.js';
import {
  AdaptiveHeader,
  AdaptiveModal,
  AppDrawer,
  AppSheet,
  AppShell,
  DetailPane,
  FormField,
  RegistrationWorkspace,
  UiButton,
  ViewLayout
} from './components.js';

const Dashboard = () => {
  const PATIENTS_SORT_KEY = 'odontoflow:patients-sort';
  const PATIENTS_SEARCH_VISIBLE_KEY = 'odontoflow:patients-search-visible';
  const ACTIVE_CLINIC_KEY = 'odontoflow:active-clinic-id';
  const [activeTab, setActiveTab] = useState('overview');
  const [availableClinics, setAvailableClinics] = useState(AVAILABLE_CLINICS_FALLBACK);
  const [currentClinic, setCurrentClinic] = useState(null);
  const [allPatients, setAllPatients] = useState(INITIAL_PATIENTS);
  const [allProcedures, setAllProcedures] = useState(INITIAL_PROCEDURES);
  const [appointments, setAppointments] = useState(APPOINTMENTS);
  const [usingFallbackData, setUsingFallbackData] = useState(true);
  const [datasetHydrated, setDatasetHydrated] = useState(false);

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
  const [isClinicEditing, setIsClinicEditing] = useState(false);
  const [activeClinicRegistrationTab, setActiveClinicRegistrationTab] = useState('contact');
  const [isAuxDrawerOpen, setIsAuxDrawerOpen] = useState(false);
  const [isAuxSheetOpen, setIsAuxSheetOpen] = useState(false);
  const [isWideViewport, setIsWideViewport] = useState(false);
  const [viewportWidth, setViewportWidth] = useState(window.innerWidth);
  const [profileStack, setProfileStack] = useState(['root']);
  const [expandedProfileWidgets, setExpandedProfileWidgets] = useState({});
  const [activeProfileModel, setActiveProfileModel] = useState('md3');
  const [lightSessionUser, setLightSessionUser] = useState(() => loadLightSessionSnapshot());
  const [profileWorkspaceState, setProfileWorkspaceState] = useState({
    status: 'idle',
    userProfile: null,
    sections: [],
    models: [],
    errorMessage: '',
    loadedClinicName: ''
  });

  const fiscalRequiredFields = [
    { key: 'legalName', label: 'razão social' },
    { key: 'tradeName', label: 'nome fantasia' },
    { key: 'legalNature', label: 'natureza jurídica' },
    { key: 'primaryCnae', label: 'CNAE principal' },
    { key: 'registrationStatus', label: 'situação cadastral' }
  ];

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
    setLightSessionUser(loadLightSessionSnapshot());
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
    if (isWideViewport && activeTab === 'patients') {
      setModalPatient(false);
    } else {
      setModalPatient(true);
    }
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

  const reloadTenantScopedData = async (clinicId) => {
    try {
      const dataset = await loadClinicContext(clinicId);
      setAllPatients(dataset.patients);
      setAllProcedures(dataset.procedures);
      setAppointments(dataset.appointments);
      if (dataset.clinics?.length) {
        setAvailableClinics(dataset.clinics);
      }
      if (dataset.activeClinicId) {
        const resolvedClinic = (dataset.clinics || []).find((clinic) => clinic.id === dataset.activeClinicId)
          || availableClinics.find((clinic) => clinic.id === dataset.activeClinicId)
          || null;
        setCurrentClinic(resolvedClinic);
        window.localStorage.setItem(ACTIVE_CLINIC_KEY, dataset.activeClinicId);
      }
      setUsingFallbackData(dataset.source === 'offline');
    } catch (error) {
      setUsingFallbackData(true);
    } finally {
      setDatasetHydrated(true);
    }
  };

  useEffect(() => {
    if (datasetHydrated) return;
    const persistedClinicId = window.localStorage.getItem(ACTIVE_CLINIC_KEY);
    reloadTenantScopedData(persistedClinicId);
  }, [datasetHydrated]);

  useEffect(() => {
    if (!modalPatient) return;
    fillPatientForm(selectedPatient);
  }, [modalPatient, selectedPatient]);

  useEffect(() => {
    if (!currentClinic?.id) return;

    const hydrateClinicRegistration = async () => {
      try {
        const data = await loadClinicRegistration(currentClinic.id);
        if (!data) {
          setClinicRegistrationForm({
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
          return;
        }

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
        const hasRegistrationData = Boolean(
          data.contact?.phone
          || data.contact?.email
          || data.contact?.address
          || data.fiscal?.cnpj
          || data.fiscal?.legalName
        );
        setIsClinicEditing(!hasRegistrationData);
      } catch (error) {
        setClinicRegistrationStatus('error');
        setClinicRegistrationMessage(error?.message || 'Não foi possível carregar o cadastro da clínica.');
        setIsClinicEditing(true);
      }
    };

    hydrateClinicRegistration();
  }, [currentClinic?.id]);

  useEffect(() => {
    const evaluateWideViewport = () => {
      const width = window.innerWidth;
      setViewportWidth(width);
      const isLandscapeTablet = width >= 600 && width <= 1023 && window.innerWidth > window.innerHeight;
      setIsWideViewport(width >= 1024 || isLandscapeTablet);
    };

    evaluateWideViewport();
    window.addEventListener('resize', evaluateWideViewport);
    return () => window.removeEventListener('resize', evaluateWideViewport);
  }, []);

  const navItems = [
    { id: 'overview', icon: CalendarDays, label: 'Agenda' },
    { id: 'patients', icon: Users, label: 'Pacientes' },
    { id: 'financial', icon: BadgeDollarSign, label: 'Financeiro' },
    { id: 'profile', icon: User, label: 'Perfil' }
  ];

  const profileSectionsSchema = profileWorkspaceState.sections;
  const profileModels = profileWorkspaceState.models || [];
  const isMobileProfile = viewportWidth < 768;

  const profileItemsById = useMemo(() => (
    profileSectionsSchema.flatMap((section) => section.items).reduce((accumulator, item) => {
      accumulator[item.id] = item;
      return accumulator;
    }, {})
  ), [profileSectionsSchema]);

  const profileActiveScreen = profileStack[profileStack.length - 1];
  const activeProfileItem = profileActiveScreen === 'root' ? null : profileItemsById[profileActiveScreen];

  const handleOpenProfileScreen = (itemId) => {
    if (!profileItemsById[itemId]) return;
    setProfileStack((current) => [...current, itemId]);
  };

  const handleBackProfileScreen = () => {
    setProfileStack((current) => (current.length > 1 ? current.slice(0, -1) : current));
  };

  const handleToggleProfileWidget = (itemId) => {
    setExpandedProfileWidgets((current) => ({ ...current, [itemId]: !current[itemId] }));
  };

  useEffect(() => {
    if (profileWorkspaceState.loadedClinicName === (currentClinic?.name || '')) return;
    setProfileWorkspaceState((current) => ({
      ...current,
      status: 'idle',
      loadedClinicName: currentClinic?.name || ''
    }));
  }, [currentClinic?.name, profileWorkspaceState.loadedClinicName]);

  useEffect(() => {
    if (activeTab !== 'profile' || profileWorkspaceState.status === 'ready' || profileWorkspaceState.status === 'loading') return;
    setProfileWorkspaceState((current) => ({ ...current, status: 'loading', errorMessage: '' }));

    import('./profile-workspace.js')
      .then(({ loadProfileWorkspaceData }) => loadProfileWorkspaceData({ clinicName: currentClinic?.name }))
      .then((payload) => {
        setProfileWorkspaceState({
          status: 'ready',
          userProfile: payload.userProfile,
          sections: payload.sections,
          models: payload.models || [],
          errorMessage: '',
          loadedClinicName: currentClinic?.name || ''
        });
      })
      .catch(() => {
        setProfileWorkspaceState((current) => ({
          ...current,
          status: 'error',
          errorMessage: 'Não foi possível carregar o workspace de perfil.'
        }));
      });
  }, [activeTab, currentClinic?.name, profileWorkspaceState.status]);

  const handleSwitchClinic = async (clinicId) => {
    if (!clinicId || clinicId === currentClinic?.id) return;
    const nextClinic = availableClinics.find((clinic) => clinic.id === clinicId);
    if (!nextClinic) return;

    setClinicSwitchStatus('loading');

    try {
      await setActiveClinicRpc(clinicId);
      window.localStorage.setItem(ACTIVE_CLINIC_KEY, clinicId);
      setCurrentClinic(nextClinic);
      await reloadTenantScopedData(clinicId);
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
      const missingFields = fiscalRequiredFields
        .filter((field) => !company[field.key])
        .map((field) => field.label);

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
      setCnpjLookupMessage(
        missingFields.length > 0
          ? `Dados fiscais preenchidos. Complete manualmente: ${missingFields.join(', ')}.`
          : 'Dados fiscais preenchidos automaticamente.'
      );
    } catch (error) {
      setCnpjLookupStatus('error');
      setCnpjLookupMessage(error?.message || 'Não foi possível consultar o CNPJ.');
    }
  };

  const handleSavePatient = async () => {
    if (!currentClinic?.id || !patientForm.name.trim()) return;

    const saved = await savePatientRecord({
      clinicId: currentClinic.id,
      patient: {
        id: selectedPatient?.id,
        clinic_id: currentClinic.id,
        name: patientForm.name.trim(),
        phone: patientForm.phone.trim(),
        address: {
          cep: patientForm.cep,
          street: patientForm.street,
          number: patientForm.number,
          complement: patientForm.complement,
          neighborhood: patientForm.neighborhood,
          city: patientForm.city,
          state: patientForm.state
        }
      }
    });

    setAllPatients((current) => (
      current.some((item) => item.id === saved.id)
        ? current.map((item) => (item.id === saved.id ? { ...item, ...saved } : item))
        : [...current, saved]
    ));

    setSelectedPatient(saved);
    setIsEditing(false);
    setModalPatient(false);
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
      setIsClinicEditing(false);
    } catch (error) {
      setClinicRegistrationStatus('error');
      setClinicRegistrationMessage(error?.message || 'Não foi possível salvar o cadastro da clínica.');
    }
  };

  const activeSectionTitle = useMemo(() => ({
    overview: 'Agenda',
    patients: 'Base de Pacientes',
    financial: 'Financeiro',
    profile: activeProfileItem?.label || 'Perfil'
  }[activeTab] || 'OdontoFlow'), [activeProfileItem?.label, activeTab]);

  const activeSectionSubtitle = activeTab === 'profile'
    ? `Olá, ${lightSessionUser.firstName}`
    : (currentClinic?.name || 'Clínica não definida');
  const shouldShowLevel1ActionBar = !isWideViewport && activeTab !== 'overview';
  const isPatientsLevel1 = activeTab === 'patients';

  const handleBackToPanel = () => {
    setActiveTab('overview');
    setProfileStack(['root']);
    setIsAuxSheetOpen(false);
  };

  const handleLevel1Insert = () => {
    if (activeTab === 'patients') {
      setSelectedPatient(null);
      setModalPatient(true);
      setIsEditing(true);
      return;
    }

    if (activeTab === 'financial') {
      setIsClinicEditing(true);
      return;
    }

    if (activeTab === 'profile') {
      setIsAuxDrawerOpen(true);
    }
  };

  const handleLevel1Search = () => {
    if (activeTab === 'patients') {
      setIsPatientSearchVisible((current) => !current);
      return;
    }
    setIsAuxSheetOpen(true);
  };

  const handleLevel1Edit = () => {
    if (activeTab === 'patients') {
      handleToggleMultiSelectMode();
      return;
    }

    if (activeTab === 'financial') {
      setIsClinicEditing(true);
      return;
    }

    if (activeTab === 'profile' && profileActiveScreen !== 'root') {
      handleBackProfileScreen();
    }
  };

  return (
    <AppShell
      headerLeading={<div className="app-header__brand"><Stethoscope size={18} /> OdontoFlow</div>}
      headerCenter={(
        <div>
          <h1 className="app-header__title">{activeSectionTitle}</h1>
          <p className="app-header__subtitle">{activeSectionSubtitle}</p>
        </div>
      )}
      headerTrailing={(
        <div className="app-header__actions">
          <UiButton
            onClick={() => { setSelectedPatient(null); setModalPatient(true); setIsEditing(true); }}
            icon={Plus}
            label="Novo paciente"
            tone="primary"
            size="sm"
            className="app-header__primary-action"
          />
          <div className="relative">
            <ChevronsUpDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <select
              value={currentClinic?.id || ''}
              onChange={(event) => handleSwitchClinic(event.target.value)}
              disabled={clinicSwitchStatus === 'loading'}
              className="app-header__select"
            >
              {availableClinics.map((clinic) => (
                <option key={clinic.id} value={clinic.id}>{clinic.name}</option>
              ))}
            </select>
          </div>
          <UiButton
            onClick={() => setIsAuxDrawerOpen(true)}
            icon={Layers}
            labelLayout="hidden"
            tone="neutral"
            size="sm"
            className="app-header__aux-trigger"
            aria-label="Abrir ações auxiliares"
          />
        </div>
      )}
      sidebar={(
        <div className="app-sidebar__inner">
          <div className="app-sidebar__header">
            <div className="app-sidebar__brand">
              <Stethoscope size={18} />
              <span>OdontoFlow</span>
            </div>
          </div>
          <nav className="app-sidebar__nav" aria-label="Navegação principal" data-level="0">
            {navItems.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`app-sidebar__item ${activeTab === item.id ? 'is-active' : ''}`}
                onClick={() => {
                  setActiveTab(item.id);
                  if (item.id === 'profile') setProfileStack(['root']);
                }}
              >
                <span className="app-sidebar__item-icon" aria-hidden="true"><item.icon size={18} /></span>
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
          <div className="app-sidebar__footer">
            <span>{currentClinic?.name || 'Clínica não definida'}</span>
          </div>
        </div>
      )}
      footer={(
        <nav className="bottom-tabbar" aria-label="Navegação principal" data-level="0">
          {navItems.slice(0, 2).map((item) => (
            <a
              key={item.id}
              className={`bottom-tabbar__item ${activeTab === item.id ? 'is-active' : ''}`}
              href="#"
              data-route={item.id === 'overview' ? 'agenda' : 'pacientes'}
              aria-current={activeTab === item.id ? 'page' : undefined}
              onClick={(event) => {
                event.preventDefault();
                setActiveTab(item.id);
                if (item.id === 'profile') setProfileStack(['root']);
              }}
            >
              <span className="bottom-tabbar__icon" aria-hidden="true"><item.icon size={22} /></span>
              <span className="bottom-tabbar__label">{item.label}</span>
            </a>
          ))}
          <button className="bottom-tabbar__fab" type="button" aria-label="Novo paciente" onClick={() => { setSelectedPatient(null); setModalPatient(true); setIsEditing(true); }}>
            <span className="bottom-tabbar__fab-icon" aria-hidden="true"><Plus size={28} /></span>
          </button>
          {navItems.slice(2).map((item) => (
            <a
              key={item.id}
              className={`bottom-tabbar__item ${activeTab === item.id ? 'is-active' : ''}`}
              href="#"
              data-route={item.id === 'financial' ? 'financeiro' : 'perfil'}
              aria-current={activeTab === item.id ? 'page' : undefined}
              onClick={(event) => {
                event.preventDefault();
                setActiveTab(item.id);
                if (item.id === 'profile') setProfileStack(['root']);
              }}
            >
              <span className="bottom-tabbar__icon" aria-hidden="true"><item.icon size={22} /></span>
              <span className="bottom-tabbar__label">{item.label}</span>
            </a>
          ))}
        </nav>
      )}
    >
      {shouldShowLevel1ActionBar && (
        <section className="level1-actionbar" aria-label="Ações do nível 1" data-level="1-actions">
          <UiButton
            onClick={handleBackToPanel}
            icon={ArrowRight}
            label="Painel"
            tone="neutral"
            size="sm"
            className="level1-actionbar__btn level1-actionbar__btn--back"
          />
          <UiButton
            onClick={handleLevel1Insert}
            icon={Plus}
            label="Inserir"
            tone="primary"
            size="sm"
            className="level1-actionbar__btn"
          />
          <UiButton
            onClick={() => setIsAuxSheetOpen(true)}
            icon={ListChecks}
            label="Navegação"
            tone="neutral"
            size="sm"
            className="level1-actionbar__btn"
          />
          <UiButton
            onClick={handleLevel1Search}
            icon={Search}
            label="Pesquisar"
            tone={isPatientsLevel1 && isPatientSearchVisible ? 'info' : 'neutral'}
            size="sm"
            className="level1-actionbar__btn"
          />
          <UiButton
            onClick={handleLevel1Edit}
            icon={isPatientsLevel1 && isMultiSelectMode ? CheckSquare : Pencil}
            label="Editar"
            tone={isPatientsLevel1 && isMultiSelectMode ? 'info' : 'neutral'}
            size="sm"
            className="level1-actionbar__btn"
          />
        </section>
      )}

      {activeTab === 'overview' && (
        <ViewLayout>
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8">
            <h3 className="text-xl font-bold text-slate-900">Agenda</h3>
            <p className="text-sm text-slate-600 mt-2">Placeholder da nova Agenda do nível 0. Em breve com visão diária, filtros e próximos atendimentos.</p>
          </div>
        </ViewLayout>
      )}

      {activeTab === 'patients' && (
        <ViewLayout>
          <div className={`app-level2-layout ${isWideViewport ? 'is-wide' : ''}`} data-level="2-container">
            <div className="app-level2-layout__main">
              <div className={`flex items-center gap-3 mb-4 ${!isWideViewport ? 'hidden' : ''}`.trim()}>
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
            </div>
            <DetailPane
              title={selectedPatient ? selectedPatient.name : 'Detalhe do paciente'}
              isOpen={isWideViewport && Boolean(selectedPatient)}
              onClose={() => setSelectedPatient(null)}
            >
              {selectedPatient ? (
                <div className="space-y-3 text-sm text-slate-700">
                  <p><strong>ID:</strong> {selectedPatient.id}</p>
                  <p><strong>Telefone:</strong> {selectedPatient.phone || '-'}</p>
                  <UiButton
                    onClick={() => {
                      setModalPatient(true);
                      setIsEditing(true);
                    }}
                    icon={Pencil}
                    label="Editar paciente"
                    tone="primary"
                    size="sm"
                  />
                </div>
              ) : null}
            </DetailPane>
          </div>
        </ViewLayout>
      )}

      {activeTab === 'financial' && (
        <ViewLayout>
          <div className="space-y-8">
            <RegistrationWorkspace
              title="Financeiro e cobrança"
              subtitle="Gestão de assinatura, cobrança e dados fiscais"
              icon={UserPlus}
              actions={isClinicEditing ? (
                <div className="flex items-center gap-2 animate-in fade-in zoom-in-95">
                  <UiButton
                    onClick={() => setIsClinicEditing(false)}
                    icon={X}
                    tone="danger"
                    labelLayout="hidden"
                    title="Cancelar edição"
                  />
                  <UiButton
                    onClick={handleSaveClinicRegistration}
                    icon={Check}
                    tone={clinicRegistrationStatus === 'error' ? 'danger' : 'success'}
                    labelLayout="hidden"
                    title={clinicRegistrationStatus === 'loading' ? 'Salvando cadastro...' : 'Salvar cadastro da clínica'}
                    disabled={clinicRegistrationStatus === 'loading'}
                    className="shadow-lg"
                  />
                </div>
              ) : (
                <UiButton
                  onClick={() => setIsClinicEditing(true)}
                  icon={Pencil}
                  label="Editar cadastro"
                  tone="neutral"
                  size="sm"
                />
              )}
              activeTab={activeClinicRegistrationTab}
              onTabChange={setActiveClinicRegistrationTab}
              tabs={[
                {
                  id: 'contact',
                  label: 'Contato',
                  content: (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Telefone
                        <input
                          type="text"
                          disabled={!isClinicEditing}
                          value={clinicRegistrationForm.phone}
                          onChange={(event) => setClinicRegistrationForm((current) => ({ ...current, phone: event.target.value }))}
                          className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-sky-100 disabled:bg-slate-50"
                          placeholder="(00) 00000-0000"
                        />
                      </label>
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Email
                        <input
                          type="email"
                          disabled={!isClinicEditing}
                          value={clinicRegistrationForm.email}
                          onChange={(event) => setClinicRegistrationForm((current) => ({ ...current, email: event.target.value }))}
                          className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-sky-100 disabled:bg-slate-50"
                          placeholder="contato@clinica.com.br"
                        />
                      </label>
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider md:col-span-2">
                        Endereço
                        <input
                          type="text"
                          disabled={!isClinicEditing}
                          value={clinicRegistrationForm.address}
                          onChange={(event) => setClinicRegistrationForm((current) => ({ ...current, address: event.target.value }))}
                          className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-sky-100 disabled:bg-slate-50"
                          placeholder="Rua, número, bairro, cidade/UF"
                        />
                      </label>
                    </div>
                  )
                },
                {
                  id: 'fiscal',
                  label: 'Fiscal',
                  content: (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between gap-3 flex-wrap">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Dados Fiscais</p>
                        <UiButton
                          onClick={handleLookupCnpj}
                          label={cnpjLookupStatus === 'loading' ? 'Consultando CNPJ...' : 'Consultar CNPJ'}
                          tone={cnpjLookupStatus === 'error' ? 'danger' : 'info'}
                          size="sm"
                          disabled={!isClinicEditing || cnpjLookupStatus === 'loading'}
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                          CNPJ
                          <input
                            type="text"
                            disabled={!isClinicEditing}
                            value={clinicRegistrationForm.cnpj}
                            onChange={(event) => setClinicRegistrationForm((current) => ({ ...current, cnpj: formatCnpj(event.target.value) }))}
                            className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-sky-100 disabled:bg-slate-50"
                            placeholder="00.000.000/0000-00"
                          />
                        </label>
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                          Situação Cadastral
                          <input
                            type="text"
                            disabled={!isClinicEditing}
                            value={clinicRegistrationForm.registrationStatus}
                            onChange={(event) => setClinicRegistrationForm((current) => ({ ...current, registrationStatus: event.target.value }))}
                            className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-sky-100 disabled:bg-slate-50"
                            placeholder="Ativa, Inapta..."
                          />
                        </label>
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                          Razão Social
                          <input
                            type="text"
                            disabled={!isClinicEditing}
                            value={clinicRegistrationForm.legalName}
                            onChange={(event) => setClinicRegistrationForm((current) => ({ ...current, legalName: event.target.value }))}
                            className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-sky-100 disabled:bg-slate-50"
                            placeholder="Razão social da clínica"
                          />
                        </label>
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                          Nome Fantasia
                          <input
                            type="text"
                            disabled={!isClinicEditing}
                            value={clinicRegistrationForm.tradeName}
                            onChange={(event) => setClinicRegistrationForm((current) => ({ ...current, tradeName: event.target.value }))}
                            className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-sky-100 disabled:bg-slate-50"
                            placeholder="Nome fantasia"
                          />
                        </label>
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                          Natureza Jurídica
                          <input
                            type="text"
                            disabled={!isClinicEditing}
                            value={clinicRegistrationForm.legalNature}
                            onChange={(event) => setClinicRegistrationForm((current) => ({ ...current, legalNature: event.target.value }))}
                            className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-sky-100 disabled:bg-slate-50"
                            placeholder="Sociedade empresária..."
                          />
                        </label>
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                          CNAE Principal
                          <input
                            type="text"
                            disabled={!isClinicEditing}
                            value={clinicRegistrationForm.primaryCnae}
                            onChange={(event) => setClinicRegistrationForm((current) => ({ ...current, primaryCnae: event.target.value }))}
                            className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-sky-100 disabled:bg-slate-50"
                            placeholder="8630-5/04 - Atividade odontológica"
                          />
                        </label>
                      </div>
                    </div>
                  )
                }
              ]}
              footer={(
                <div className="space-y-2">
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
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                    Janela de cadastro reutilizável com header, body com abas e footer de status.
                  </p>
                </div>
              )}
            />

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
      {activeTab === 'profile' && (
        <ViewLayout>
          <div className="profile-screen">
            {profileActiveScreen !== 'root' && (
              <div className="profile-screen__subheader">
                <button type="button" className="profile-screen__back" onClick={handleBackProfileScreen} aria-label="Voltar para perfil">
                  <ArrowRight size={18} style={{ transform: 'rotate(180deg)' }} />
                  Voltar
                </button>
                <h3>{activeProfileItem?.label || 'Perfil'}</h3>
              </div>
            )}

            {profileActiveScreen === 'root' ? (
              <>
                {profileWorkspaceState.status === 'loading' && (
                  <div className="profile-screen__detail">
                    <h4>Carregando Perfil</h4>
                    <p>Preparando preferências, dados da conta e configurações do workspace.</p>
                  </div>
                )}

                {profileWorkspaceState.status === 'error' && (
                  <div className="profile-screen__detail">
                    <h4>Falha ao carregar</h4>
                    <p>{profileWorkspaceState.errorMessage}</p>
                  </div>
                )}

                {profileWorkspaceState.status === 'ready' && profileWorkspaceState.userProfile && (
                  <>
                    <header className="profile-identity-card">
                      <div className="profile-identity-card__avatar" aria-hidden="true">
                        {profileWorkspaceState.userProfile.name.charAt(0)}
                      </div>
                      <div className="profile-identity-card__content">
                        <h3>{profileWorkspaceState.userProfile.name}</h3>
                        <p>{profileWorkspaceState.userProfile.subtitle}</p>
                        <span>{profileWorkspaceState.userProfile.email}</span>
                      </div>
                      <button
                        type="button"
                        className="profile-identity-card__cta"
                        onClick={() => handleOpenProfileScreen('account-data')}
                      >
                        Ver minha conta <ChevronRight size={16} />
                      </button>
                    </header>

                    <div className="profile-model-picker" role="tablist" aria-label="Modelos de cadastro de perfil">
                      {profileModels.map((model) => (
                        <button
                          key={model.id}
                          type="button"
                          role="tab"
                          aria-selected={activeProfileModel === model.id}
                          className={`profile-model-chip ${activeProfileModel === model.id ? 'is-active' : ''}`}
                          onClick={() => setActiveProfileModel(model.id)}
                        >
                          {model.label}
                        </button>
                      ))}
                    </div>

                    {!isMobileProfile && (
                      <div className="profile-model-summary">
                        {profileModels.find((model) => model.id === activeProfileModel)?.inspiration}
                        {' · '}
                        {profileModels.find((model) => model.id === activeProfileModel)?.description}
                      </div>
                    )}

                    <div className="profile-settings-list">
                      {[...profileSectionsSchema]
                        .sort((a, b) => a.order - b.order)
                        .map((section) => (
                          <section key={section.id} className="profile-settings-section" aria-label={section.title}>
                            {section.title ? <p className="profile-settings-section__title">{section.title}</p> : null}
                            {isMobileProfile ? (
                              <div className="profile-settings-section__items">
                                {[...section.items]
                                  .filter((item) => item.visibility)
                                  .sort((a, b) => a.order - b.order)
                                  .map((item) => (
                                    <div key={item.id} className="profile-settings-row-wrap">
                                      <button
                                        type="button"
                                        className="profile-settings-item"
                                        onClick={() => handleToggleProfileWidget(item.id)}
                                      >
                                        <span className="profile-settings-item__leading" aria-hidden="true">
                                          <item.icon size={18} />
                                        </span>
                                        <span className="profile-settings-item__content">
                                          <span>{item.label}</span>
                                          {item.description ? <small>{item.description}</small> : null}
                                        </span>
                                        {item.badge ? <span className="profile-settings-item__badge">{item.badge}</span> : null}
                                        <ChevronRight size={18} className={`profile-settings-item__chevron ${expandedProfileWidgets[item.id] ? 'is-open' : ''}`} aria-hidden="true" />
                                      </button>
                                      {expandedProfileWidgets[item.id] && (
                                        <div className="profile-settings-item__expand">
                                          <p>{item.description || 'Dados básicos do widget de perfil.'}</p>
                                          <UiButton label="Abrir detalhe" size="sm" tone="info" onClick={() => handleOpenProfileScreen(item.id)} />
                                        </div>
                                      )}
                                    </div>
                                  ))}
                              </div>
                            ) : (
                              <div className="profile-widget-grid">
                                {[...section.items]
                                  .filter((item) => item.visibility)
                                  .sort((a, b) => a.order - b.order)
                                  .map((item) => (
                                    <article key={item.id} className={`profile-widget profile-widget--${item.widgetSize || 'sm'}`}>
                                      <header>
                                        <span className="profile-settings-item__leading" aria-hidden="true"><item.icon size={18} /></span>
                                        <h4>{item.label}</h4>
                                        {item.badge ? <span className="profile-settings-item__badge">{item.badge}</span> : null}
                                      </header>
                                      <p>{item.description || 'Widget de cadastro de perfil replicável.'}</p>
                                      <div className="profile-widget__actions">
                                        <button type="button" onClick={() => handleToggleProfileWidget(item.id)}>
                                          {expandedProfileWidgets[item.id] ? 'Ocultar' : 'Expandir'}
                                        </button>
                                        <button type="button" onClick={() => handleOpenProfileScreen(item.id)}>Abrir</button>
                                      </div>
                                      {expandedProfileWidgets[item.id] && (
                                        <div className="profile-widget__expanded">
                                          Rota preparada: <strong>{item.route}</strong>
                                        </div>
                                      )}
                                    </article>
                                  ))}
                              </div>
                            )}
                          </section>
                        ))}
                    </div>
                  </>
                )}
              </>
            ) : (
              <section className="profile-screen__detail">
                <h4>{activeProfileItem?.label}</h4>
                <p>
                  Tela de nível 1 preparada para rota <strong>{activeProfileItem?.route}</strong>.
                  Conecte este espaço aos dados reais de sessão/perfil sem alterar o shell principal.
                </p>
              </section>
            )}
          </div>
        </ViewLayout>
      )}

      <AppDrawer isOpen={isAuxDrawerOpen} onClose={() => setIsAuxDrawerOpen(false)} title="Ações de nível 3">
        <p className="text-sm text-slate-600">
          Container oficial de tarefa auxiliar (nível 3) para ações contextuais, sem quebrar a navegação principal.
        </p>
      </AppDrawer>

      <AppSheet isOpen={isAuxSheetOpen} onClose={() => setIsAuxSheetOpen(false)} title="Navegação rápida">
        <div className="space-y-3">
          <p className="text-sm text-slate-600">
            Selecione para navegar entre as seções de nível 0.
          </p>
          <div className="grid grid-cols-2 gap-2">
            {navItems.map((item) => (
              <UiButton
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  if (item.id === 'profile') setProfileStack(['root']);
                  setIsAuxSheetOpen(false);
                }}
                icon={item.icon}
                label={item.label}
                tone={activeTab === item.id ? 'info' : 'neutral'}
                size="sm"
              />
            ))}
          </div>
        </div>
      </AppSheet>

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
                onClick={async () => {
                  if (!newProcName.trim() || !currentClinic?.id) return;
                  const saved = await saveProcedureRecord({
                    clinicId: currentClinic.id,
                    procedure: { name: newProcName.trim(), clinic_id: currentClinic.id }
                  });
                  setAllProcedures((current) => [...current, saved.name]);
                  setNewProcName('');
                }}
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
                  <UiButton onClick={handleSavePatient} icon={Check} tone="success" labelLayout="hidden" className="shadow-lg" />
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
    </AppShell>
  );
};

export default Dashboard;
