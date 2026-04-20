// Fallback local: usado somente quando os CSVs do backend/supabase não estiverem disponíveis.
export const APP_VERSION = '0.1.11';

export const VERSION_LOG = [
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

export const INITIAL_PATIENTS = [
  { id: 'local-1', name: 'Ana Paula Souza', phone: '(11) 98877-6655', lastVisit: '12/04/2024', gender: 'Feminino', birth: '15/05/1992', email: 'ana@email.com' },
  { id: 'local-2', name: 'Ricardo Albuquerque', phone: '(11) 97766-5544', lastVisit: '08/04/2024', gender: 'Masculino', birth: '22/10/1985', email: 'ricardo@email.com' },
  { id: 'local-3', name: 'Juliana Ferreira', phone: '(11) 96655-4433', lastVisit: '15/04/2024', gender: 'Feminino', birth: '03/01/1998', email: 'juliana@email.com' }
];

export const INITIAL_PROCEDURES = [
  'Limpeza Profilática',
  'Restauração em Resina',
  'Tratamento de Canal',
  'Avaliação Ortodôntica',
  'Extração Siso',
  'Clareamento Dental',
  'Prótese Protocolo'
];

export const APPOINTMENTS = [
  { id: 'local-a1', name: 'Ana Paula Souza', time: '09:00', procedure: 'Limpeza Profilática', date: '2024-04-18T09:00:00Z' },
  { id: 'local-a2', name: 'Ricardo Albuquerque', time: '10:30', procedure: 'Extração Siso', date: '2024-04-18T10:30:00Z' },
  { id: 'local-a3', name: 'Juliana Ferreira', time: '14:15', procedure: 'Avaliação Ortodôntica', date: '2024-04-18T14:15:00Z' }
];


export const AVAILABLE_CLINICS_FALLBACK = [
  { id: 'clinic-matriz-sp', name: 'Clínica Matriz SP' },
  { id: 'clinic-zona-sul', name: 'Unidade Zona Sul' },
  { id: 'clinic-zona-leste', name: 'Unidade Zona Leste' }
];
