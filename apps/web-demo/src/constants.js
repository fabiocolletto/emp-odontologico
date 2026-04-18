// Fallback local: usado somente quando os CSVs do backend/supabase não estiverem disponíveis.

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
