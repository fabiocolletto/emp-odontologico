// Fallback local: usado somente quando os CSVs do backend/supabase não estiverem disponíveis.
export const APP_VERSION = '1.0.0';

export const VERSION_LOG = [
  {
    version: '1.0.0',
    date: '2026-04-21',
    notes: [
      'Framework v0 consolidado como base oficial e início do ciclo de aplicação em v1.'
    ]
  },
  {
    version: '0.1.33',
    date: '2026-04-21',
    notes: [
      'Consolidação do framework como base oficial em andamento, com check-up e plano de fechamento da versão 0.'
    ]
  },
  {
    version: '0.1.11',
    date: '2026-04-19',
    notes: [
      'Correção de abertura da tela nível 1 de pacientes (header mobile).'
    ]
  },
  {
    version: '0.1.10',
    date: '2026-04-19',
    notes: [
      'Padrão mobile por níveis: retorno ao nível anterior como primeiro link rápido em níveis acima de 0.'
    ]
  },
  {
    version: '0.1.9',
    date: '2026-04-19',
    notes: [
      'Header N0 com ícone 1:1 e botões de links rápidos com glassmorphism temático.'
    ]
  },
  {
    version: '0.1.8',
    date: '2026-04-19',
    notes: [
      'Carrossel de links rápidos ajusta posição apenas após o fim da rolagem.'
    ]
  },
  {
    version: '0.1.7',
    date: '2026-04-19',
    notes: [
      'Versão da landing passa a ser extraída automaticamente do CHANGELOG.md.'
    ]
  },
  {
    version: '0.1.3',
    date: '2026-04-19',
    notes: [
      'Badge de versão Vx.y.z adicionado no rodapé da tela inicial com CTA de acesso.'
    ]
  },
  {
    version: '0.1.1',
    date: '2026-04-19',
    notes: [
      'Removida a navegação redundante do header mobile do nível 0.',
      'Navegação mobile passa a usar exclusivamente o drawer lateral.'
    ]
  },
  {
    version: '0.1.0',
    date: '2026-04-19',
    notes: [
      'Janela lateral de navegação inteligente no mobile.',
      'Header mobile do nível 0 com ações em grid 2x2.',
      'Exibição de versão na tela inicial para validar deploy no GitHub Pages.'
    ]
  }
];

export const OFFLINE_CLINIC_DATA = {
  'clinic-matriz-sp': {
    clinic: { id: 'clinic-matriz-sp', name: 'Clínica Matriz SP', phone: '(11) 4002-1111', email: 'matriz@odontoflow.local' },
    staffProfiles: [
      { id: 'staff-local-1', clinic_id: 'clinic-matriz-sp', full_name: 'Dra. Ana Prado', role: 'admin', active: true }
    ],
    patients: [
      { id: 'local-1', clinic_id: 'clinic-matriz-sp', name: 'Ana Paula Souza', phone: '(11) 98877-6655', lastVisit: '12/04/2024', gender: 'Feminino', birth: '15/05/1992', email: 'ana@email.com' },
      { id: 'local-2', clinic_id: 'clinic-matriz-sp', name: 'Ricardo Albuquerque', phone: '(11) 97766-5544', lastVisit: '08/04/2024', gender: 'Masculino', birth: '22/10/1985', email: 'ricardo@email.com' },
      { id: 'local-3', clinic_id: 'clinic-matriz-sp', name: 'Juliana Ferreira', phone: '(11) 96655-4433', lastVisit: '15/04/2024', gender: 'Feminino', birth: '03/01/1998', email: 'juliana@email.com' }
    ],
    procedures: [
      { id: 'proc-local-1', clinic_id: 'clinic-matriz-sp', name: 'Limpeza Profilática' },
      { id: 'proc-local-2', clinic_id: 'clinic-matriz-sp', name: 'Restauração em Resina' },
      { id: 'proc-local-3', clinic_id: 'clinic-matriz-sp', name: 'Tratamento de Canal' }
    ],
    appointments: [
      { id: 'local-a1', clinic_id: 'clinic-matriz-sp', patient_id: 'local-1', procedure_id: 'proc-local-1', name: 'Ana Paula Souza', time: '09:00', procedure: 'Limpeza Profilática', date: '2024-04-18T09:00:00Z' },
      { id: 'local-a2', clinic_id: 'clinic-matriz-sp', patient_id: 'local-2', procedure_id: 'proc-local-2', name: 'Ricardo Albuquerque', time: '10:30', procedure: 'Restauração em Resina', date: '2024-04-18T10:30:00Z' }
    ]
  },
  'clinic-zona-sul': {
    clinic: { id: 'clinic-zona-sul', name: 'Unidade Zona Sul', phone: '(11) 4002-2222', email: 'zonasul@odontoflow.local' },
    staffProfiles: [
      { id: 'staff-local-2', clinic_id: 'clinic-zona-sul', full_name: 'Dr. Bruno Mota', role: 'dentist', active: true }
    ],
    patients: [
      { id: 'local-zs-1', clinic_id: 'clinic-zona-sul', name: 'Patrícia Nunes', phone: '(11) 95544-3322', lastVisit: '10/04/2024', gender: 'Feminino', birth: '10/12/1990', email: 'patricia@email.com' }
    ],
    procedures: [
      { id: 'proc-zs-1', clinic_id: 'clinic-zona-sul', name: 'Avaliação Ortodôntica' },
      { id: 'proc-zs-2', clinic_id: 'clinic-zona-sul', name: 'Extração Siso' }
    ],
    appointments: [
      { id: 'local-zs-a1', clinic_id: 'clinic-zona-sul', patient_id: 'local-zs-1', procedure_id: 'proc-zs-1', name: 'Patrícia Nunes', time: '14:15', procedure: 'Avaliação Ortodôntica', date: '2024-04-18T14:15:00Z' }
    ]
  },
  'clinic-zona-leste': {
    clinic: { id: 'clinic-zona-leste', name: 'Unidade Zona Leste', phone: '(11) 4002-3333', email: 'zonaleste@odontoflow.local' },
    staffProfiles: [
      { id: 'staff-local-3', clinic_id: 'clinic-zona-leste', full_name: 'Dra. Luiza Campos', role: 'assistant', active: true }
    ],
    patients: [],
    procedures: [
      { id: 'proc-zl-1', clinic_id: 'clinic-zona-leste', name: 'Clareamento Dental' }
    ],
    appointments: []
  }
};

export const AVAILABLE_CLINICS_FALLBACK = Object.values(OFFLINE_CLINIC_DATA).map((item) => item.clinic);
export const INITIAL_PATIENTS = OFFLINE_CLINIC_DATA['clinic-matriz-sp'].patients;
export const INITIAL_PROCEDURES = OFFLINE_CLINIC_DATA['clinic-matriz-sp'].procedures.map((item) => item.name);
export const APPOINTMENTS = OFFLINE_CLINIC_DATA['clinic-matriz-sp'].appointments;
