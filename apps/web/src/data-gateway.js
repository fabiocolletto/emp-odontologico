import { OFFLINE_CLINIC_DATA } from './constants.js';

const CSV_PATH = './backend/supabase/sample-data';
const CLINIC_PROFILE_STORAGE_KEY = 'odontoflow:clinic-registration';
const OFFLINE_DATASET_STORAGE_KEY = 'odontoflow:offline-dataset-v1';
const ACTIVE_CLINIC_KEY = 'odontoflow:active-clinic-id';

const parseCsv = (csvText) => {
  const [headerLine, ...rows] = csvText.trim().split('\n');
  if (!headerLine) return [];

  const headers = headerLine.split(',').map((h) => h.trim());

  return rows
    .map((row) => row.trim())
    .filter(Boolean)
    .map((row) => {
      const values = row.split(',').map((value) => value.trim());
      return headers.reduce((acc, key, index) => {
        acc[key] = values[index] ?? '';
        return acc;
      }, {});
    });
};

const toLocaleDate = (isoDate) => {
  if (!isoDate) return '-';
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleDateString('pt-BR');
};

const toTime = (isoDate) => {
  if (!isoDate) return '--:--';
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return '--:--';
  return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
};

const fetchCsv = async (fileName) => {
  const response = await fetch(`${CSV_PATH}/${fileName}`);
  if (!response.ok) {
    throw new Error(`Falha ao carregar ${fileName}`);
  }
  return response.text();
};

const normalizeCnpjDigits = (value) => String(value || '').replace(/\D/g, '').slice(0, 14);

export const formatCnpj = (value) => {
  const digits = normalizeCnpjDigits(value);
  if (digits.length <= 2) return digits;
  if (digits.length <= 5) return `${digits.slice(0, 2)}.${digits.slice(2)}`;
  if (digits.length <= 8) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5)}`;
  if (digits.length <= 12) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8)}`;
  return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12)}`;
};

const calcCnpjDigit = (baseDigits, weights) => {
  const sum = baseDigits.reduce((acc, digit, index) => acc + (digit * weights[index]), 0);
  const remainder = sum % 11;
  return remainder < 2 ? 0 : 11 - remainder;
};

export const isValidCnpj = (value) => {
  const digits = normalizeCnpjDigits(value);
  if (digits.length !== 14) return false;
  if (/^(\d)\1{13}$/.test(digits)) return false;

  const numbers = digits.split('').map(Number);
  const firstWeights = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const secondWeights = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

  const firstDigit = calcCnpjDigit(numbers.slice(0, 12), firstWeights);
  const secondDigit = calcCnpjDigit([...numbers.slice(0, 12), firstDigit], secondWeights);

  return firstDigit === numbers[12] && secondDigit === numbers[13];
};

export const loadClinicDataset = async (clinicId) => {
  const [patientsCsv, proceduresCsv, appointmentsCsv, clinicsCsv, staffProfilesCsv] = await Promise.all([
    fetchCsv('patients.csv'),
    fetchCsv('procedures.csv'),
    fetchCsv('appointments.csv'),
    fetchCsv('clinics.csv'),
    fetchCsv('staff_profiles.csv')
  ]);

  const patientsRaw = parseCsv(patientsCsv);
  const proceduresRaw = parseCsv(proceduresCsv);
  const appointmentsRaw = parseCsv(appointmentsCsv);
  const clinicsRaw = parseCsv(clinicsCsv);
  const staffProfilesRaw = parseCsv(staffProfilesCsv);

  const persistedClinicId = clinicId || window.localStorage.getItem(ACTIVE_CLINIC_KEY);
  const clinicIdsFromStaff = [...new Set(staffProfilesRaw.filter((item) => item.active !== 'false').map((item) => item.clinic_id))];
  const clinicIds = clinicIdsFromStaff.length > 0 ? clinicIdsFromStaff : clinicsRaw.map((item) => item.id);
  const availableClinics = clinicsRaw
    .filter((item) => clinicIds.includes(item.id))
    .map((clinic) => ({ id: clinic.id, name: clinic.name }));
  const activeClinicId = persistedClinicId && clinicIds.includes(persistedClinicId)
    ? persistedClinicId
    : (clinicIds[0] || clinicsRaw[0]?.id || null);

  const scopedPatientsRaw = patientsRaw.filter((item) => item.clinic_id === activeClinicId);
  const scopedProceduresRaw = proceduresRaw.filter((item) => item.clinic_id === activeClinicId);
  const scopedAppointmentsRaw = appointmentsRaw.filter((item) => item.clinic_id === activeClinicId);
  const scopedStaffProfiles = staffProfilesRaw.filter((item) => item.clinic_id === activeClinicId);

  const proceduresById = new Map(
    scopedProceduresRaw.map((item) => [item.id, item])
  );

  const patients = scopedPatientsRaw.map((item) => ({
    id: item.id,
    clinic_id: item.clinic_id,
    name: item.full_name,
    phone: item.phone || '-',
    email: item.email || '-',
    birth: toLocaleDate(item.birth_date),
    gender: item.gender || 'Não informar',
    lastVisit: '-',
    notes: item.notes || ''
  }));

  const appointments = scopedAppointmentsRaw.map((item) => {
    const patient = patients.find((p) => p.id === item.patient_id);
    const procedure = proceduresById.get(item.procedure_id);

    return {
      id: item.id,
      clinic_id: item.clinic_id,
      patient_id: item.patient_id,
      procedure_id: item.procedure_id,
      name: patient?.name || 'Paciente não encontrado',
      time: toTime(item.starts_at),
      procedure: procedure?.name || 'Procedimento não encontrado',
      date: item.starts_at
    };
  });

  const patientLastVisitMap = new Map();
  scopedAppointmentsRaw.forEach((item) => {
    if (item.status !== 'done') return;
    const prev = patientLastVisitMap.get(item.patient_id);
    if (!prev || new Date(item.starts_at) > new Date(prev)) {
      patientLastVisitMap.set(item.patient_id, item.starts_at);
    }
  });

  const enrichedPatients = patients.map((patient) => ({
    ...patient,
    lastVisit: toLocaleDate(patientLastVisitMap.get(patient.id))
  }));

  return {
    patients: enrichedPatients,
    procedures: scopedProceduresRaw.map((item) => item.name),
    proceduresRaw: scopedProceduresRaw,
    appointments,
    clinics: availableClinics,
    staffProfiles: scopedStaffProfiles,
    activeClinicId,
    source: 'csv'
  };
};

const parseOfflineStorage = () => {
  try {
    const value = window.localStorage.getItem(OFFLINE_DATASET_STORAGE_KEY);
    return value ? JSON.parse(value) : {};
  } catch (error) {
    return {};
  }
};

const saveOfflineStorage = (payload) => {
  window.localStorage.setItem(OFFLINE_DATASET_STORAGE_KEY, JSON.stringify(payload));
};

const buildOfflineDataset = (clinicId) => {
  const localOverrides = parseOfflineStorage();
  const availableClinics = Object.values(OFFLINE_CLINIC_DATA).map((item) => item.clinic);
  const fallbackClinicId = clinicId || window.localStorage.getItem(ACTIVE_CLINIC_KEY) || availableClinics[0]?.id || null;
  const source = OFFLINE_CLINIC_DATA[fallbackClinicId] || OFFLINE_CLINIC_DATA[availableClinics[0]?.id] || null;
  if (!source) {
    return { patients: [], procedures: [], proceduresRaw: [], appointments: [], clinics: [], staffProfiles: [], activeClinicId: null, source: 'offline' };
  }

  const merged = {
    patients: localOverrides?.[fallbackClinicId]?.patients || source.patients,
    proceduresRaw: localOverrides?.[fallbackClinicId]?.proceduresRaw || source.procedures,
    appointments: localOverrides?.[fallbackClinicId]?.appointments || source.appointments
  };

  return {
    patients: merged.patients,
    procedures: merged.proceduresRaw.map((item) => item.name || item),
    proceduresRaw: merged.proceduresRaw,
    appointments: merged.appointments,
    clinics: availableClinics,
    staffProfiles: source.staffProfiles,
    activeClinicId: fallbackClinicId,
    source: 'offline'
  };
};

const saveOfflineEntity = (clinicId, key, value) => {
  const current = parseOfflineStorage();
  const clinicScope = current[clinicId] || {};
  saveOfflineStorage({
    ...current,
    [clinicId]: {
      ...clinicScope,
      [key]: value
    }
  });
};

export const loadClinicContext = async (clinicId) => {
  try {
    return await loadClinicDataset(clinicId);
  } catch (error) {
    return buildOfflineDataset(clinicId);
  }
};

export const savePatientRecord = async ({ clinicId, patient }) => {
  const normalizedClinicId = clinicId || patient?.clinic_id || window.localStorage.getItem(ACTIVE_CLINIC_KEY);
  if (!normalizedClinicId) throw new Error('Clínica ativa não encontrada para salvar paciente.');

  const payload = {
    id: patient?.id || `local-patient-${Date.now()}`,
    clinic_id: normalizedClinicId,
    name: patient?.name || '',
    phone: patient?.phone || '',
    email: patient?.email || '-',
    birth: patient?.birth || '-',
    gender: patient?.gender || 'Não informar',
    lastVisit: patient?.lastVisit || '-',
    notes: patient?.notes || '',
    address: patient?.address || {}
  };

  const dataset = buildOfflineDataset(normalizedClinicId);
  const nextPatients = dataset.patients.some((item) => item.id === payload.id)
    ? dataset.patients.map((item) => (item.id === payload.id ? { ...item, ...payload, clinic_id: normalizedClinicId } : item))
    : [...dataset.patients, payload];

  saveOfflineEntity(normalizedClinicId, 'patients', nextPatients);
  return payload;
};

export const saveProcedureRecord = async ({ clinicId, procedure }) => {
  const normalizedClinicId = clinicId || procedure?.clinic_id || window.localStorage.getItem(ACTIVE_CLINIC_KEY);
  if (!normalizedClinicId) throw new Error('Clínica ativa não encontrada para salvar procedimento.');

  const payload = {
    id: procedure?.id || `local-proc-${Date.now()}`,
    clinic_id: normalizedClinicId,
    name: procedure?.name || ''
  };

  const dataset = buildOfflineDataset(normalizedClinicId);
  const nextProcedures = dataset.proceduresRaw.some((item) => item.id === payload.id)
    ? dataset.proceduresRaw.map((item) => (item.id === payload.id ? { ...item, ...payload, clinic_id: normalizedClinicId } : item))
    : [...dataset.proceduresRaw, payload];

  saveOfflineEntity(normalizedClinicId, 'proceduresRaw', nextProcedures);
  return payload;
};

export const saveAppointmentRecord = async ({ clinicId, appointment }) => {
  const normalizedClinicId = clinicId || appointment?.clinic_id || window.localStorage.getItem(ACTIVE_CLINIC_KEY);
  if (!normalizedClinicId) throw new Error('Clínica ativa não encontrada para salvar consulta.');

  const payload = {
    ...appointment,
    id: appointment?.id || `local-appt-${Date.now()}`,
    clinic_id: normalizedClinicId
  };

  const dataset = buildOfflineDataset(normalizedClinicId);
  const nextAppointments = dataset.appointments.some((item) => item.id === payload.id)
    ? dataset.appointments.map((item) => (item.id === payload.id ? { ...item, ...payload, clinic_id: normalizedClinicId } : item))
    : [...dataset.appointments, payload];

  saveOfflineEntity(normalizedClinicId, 'appointments', nextAppointments);
  return payload;
};

export const fetchAddressByCep = async (cep) => {
  const normalizedCep = String(cep || '').replace(/\D/g, '');

  if (normalizedCep.length !== 8) {
    throw new Error('CEP deve conter 8 dígitos.');
  }

  const response = await fetch(`https://viacep.com.br/ws/${normalizedCep}/json/`);
  if (!response.ok) {
    throw new Error('Serviço de CEP indisponível no momento.');
  }

  const data = await response.json();
  if (data.erro) {
    throw new Error('CEP não encontrado.');
  }

  return {
    cep: data.cep || '',
    street: data.logradouro || '',
    neighborhood: data.bairro || '',
    city: data.localidade || '',
    state: data.uf || '',
    ibgeCode: data.ibge || ''
  };
};

export const fetchCompanyByCnpj = async (cnpj) => {
  const normalizedCnpj = normalizeCnpjDigits(cnpj);

  if (!isValidCnpj(normalizedCnpj)) {
    throw new Error('CNPJ inválido. Confira os 14 dígitos e tente novamente.');
  }

  let response;
  try {
    response = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${normalizedCnpj}`);
  } catch (error) {
    throw new Error('Falha de conexão ao consultar CNPJ.');
  }

  if (response.status === 429) {
    throw new Error('Limite de consultas de CNPJ atingido. Aguarde alguns instantes e tente novamente.');
  }

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('CNPJ não encontrado na base pública.');
    }

    throw new Error('Serviço de CNPJ indisponível no momento.');
  }

  const data = await response.json();

  return {
    cnpj: data.cnpj || normalizedCnpj,
    legalName: data.razao_social || '',
    tradeName: data.nome_fantasia || '',
    legalNature: data.natureza_juridica || '',
    primaryCnae: data.cnae_fiscal_descricao
      ? `${data.cnae_fiscal || ''} - ${data.cnae_fiscal_descricao}`.trim()
      : (data.cnae_fiscal || ''),
    registrationStatus: data.descricao_situacao_cadastral || data.situacao_cadastral || ''
  };
};

const readLocalClinicRegistration = () => {
  try {
    const serialized = window.localStorage.getItem(CLINIC_PROFILE_STORAGE_KEY);
    return serialized ? JSON.parse(serialized) : null;
  } catch (error) {
    return null;
  }
};

const writeLocalClinicRegistration = (payload) => {
  window.localStorage.setItem(CLINIC_PROFILE_STORAGE_KEY, JSON.stringify(payload));
};

export const loadClinicRegistration = async (clinicId) => {
  const supabaseClient = globalThis?.window?.supabase;

  if (supabaseClient?.from) {
    let clinicQuery = supabaseClient
      .from('clinics')
      .select('id, phone, email, address');

    if (clinicId) {
      clinicQuery = clinicQuery.eq('id', clinicId);
    } else {
      clinicQuery = clinicQuery.limit(1);
    }

    const { data: clinicData, error: clinicError } = await clinicQuery.maybeSingle();

    if (clinicError) {
      throw new Error(clinicError.message || 'Falha ao carregar dados da clínica.');
    }

    if (!clinicData) {
      return readLocalClinicRegistration();
    }

    const { data: fiscalData, error: fiscalError } = await supabaseClient
      .from('clinic_fiscal_profiles')
      .select('cnpj, legal_name, trade_name, legal_nature, primary_cnae, registration_status')
      .eq('clinic_id', clinicData.id)
      .limit(1)
      .maybeSingle();

    if (fiscalError) {
      throw new Error(fiscalError.message || 'Falha ao carregar dados fiscais da clínica.');
    }

    return {
      clinicId: clinicData.id,
      contact: {
        phone: clinicData.phone || '',
        email: clinicData.email || '',
        address: clinicData.address || ''
      },
      fiscal: {
        cnpj: fiscalData?.cnpj || '',
        legalName: fiscalData?.legal_name || '',
        tradeName: fiscalData?.trade_name || '',
        legalNature: fiscalData?.legal_nature || '',
        primaryCnae: fiscalData?.primary_cnae || '',
        registrationStatus: fiscalData?.registration_status || ''
      }
    };
  }

  return readLocalClinicRegistration();
};

export const saveClinicRegistration = async ({ clinicId, contact, fiscal }) => {
  if (!isValidCnpj(fiscal?.cnpj)) {
    throw new Error('CNPJ inválido para salvar.');
  }

  const normalizedCnpj = normalizeCnpjDigits(fiscal.cnpj);
  const payload = {
    clinicId: clinicId || null,
    contact: {
      phone: contact?.phone || '',
      email: contact?.email || '',
      address: contact?.address || ''
    },
    fiscal: {
      cnpj: normalizedCnpj,
      legalName: fiscal?.legalName || '',
      tradeName: fiscal?.tradeName || '',
      legalNature: fiscal?.legalNature || '',
      primaryCnae: fiscal?.primaryCnae || '',
      registrationStatus: fiscal?.registrationStatus || ''
    }
  };

  const supabaseClient = globalThis?.window?.supabase;

  if (supabaseClient?.from && clinicId) {
    const { error: clinicError } = await supabaseClient
      .from('clinics')
      .update({
        phone: payload.contact.phone,
        email: payload.contact.email,
        address: payload.contact.address
      })
      .eq('id', clinicId);

    if (clinicError) {
      throw new Error(clinicError.message || 'Falha ao salvar contato da clínica.');
    }

    const { error: fiscalError } = await supabaseClient
      .from('clinic_fiscal_profiles')
      .upsert({
        clinic_id: clinicId,
        cnpj: payload.fiscal.cnpj,
        legal_name: payload.fiscal.legalName,
        trade_name: payload.fiscal.tradeName,
        legal_nature: payload.fiscal.legalNature,
        primary_cnae: payload.fiscal.primaryCnae,
        registration_status: payload.fiscal.registrationStatus
      }, { onConflict: 'clinic_id' });

    if (fiscalError) {
      throw new Error(fiscalError.message || 'Falha ao salvar perfil fiscal da clínica.');
    }
  }

  writeLocalClinicRegistration(payload);
  return payload;
};

export const setActiveClinicRpc = async (clinicId) => {
  if (!clinicId) {
    throw new Error('Informe uma clínica válida para ativação.');
  }

  const supabaseClient = globalThis?.window?.supabase;

  if (supabaseClient?.rpc) {
    const { error } = await supabaseClient.rpc('set_active_clinic', {
      clinic_id_input: clinicId
    });

    if (error) {
      throw new Error(error.message || 'Falha ao trocar de clínica.');
    }

    return { ok: true };
  }

  return { ok: true, simulated: true };
};
