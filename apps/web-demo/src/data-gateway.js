const CSV_PATH = './backend/supabase/sample-data';

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

export const loadClinicDataset = async () => {
  const [patientsCsv, proceduresCsv, appointmentsCsv] = await Promise.all([
    fetchCsv('patients.csv'),
    fetchCsv('procedures.csv'),
    fetchCsv('appointments.csv')
  ]);

  const patientsRaw = parseCsv(patientsCsv);
  const proceduresRaw = parseCsv(proceduresCsv);
  const appointmentsRaw = parseCsv(appointmentsCsv);

  const proceduresById = new Map(
    proceduresRaw.map((item) => [item.id, item])
  );

  const patients = patientsRaw.map((item) => ({
    id: item.id,
    name: item.full_name,
    phone: item.phone || '-',
    email: item.email || '-',
    birth: toLocaleDate(item.birth_date),
    gender: item.gender || 'Não informar',
    lastVisit: '-',
    notes: item.notes || ''
  }));

  const appointments = appointmentsRaw.map((item) => {
    const patient = patients.find((p) => p.id === item.patient_id);
    const procedure = proceduresById.get(item.procedure_id);

    return {
      id: item.id,
      name: patient?.name || 'Paciente não encontrado',
      time: toTime(item.starts_at),
      procedure: procedure?.name || 'Procedimento não encontrado',
      date: item.starts_at
    };
  });

  const patientLastVisitMap = new Map();
  appointmentsRaw.forEach((item) => {
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
    procedures: proceduresRaw.map((item) => item.name),
    appointments
  };
};
