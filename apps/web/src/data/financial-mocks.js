(function registerFinancialMocks(global) {
  const namespace = global.OdontoFlowMockData = global.OdontoFlowMockData || {};

  namespace.financial = {
    launches: [
      { id: 1, tipo: 'entrada', descricao: 'Consulta clínica', categoria: 'Atendimento', subcategoria: 'Consulta', valor: 250, status: 'recebido', data_competencia: '2026-04-10', data_vencimento: '2026-04-10', data_pagamento: '2026-04-10', origem: 'Paciente João', paciente_id: 1, profissional_id: 2, observacoes: 'Pagamento no cartão' },
      { id: 2, tipo: 'entrada', descricao: 'Implante unitário', categoria: 'Procedimento', subcategoria: 'Implantodontia', valor: 2850, status: 'recebido', data_competencia: '2026-04-11', data_vencimento: '2026-04-11', data_pagamento: '2026-04-11', origem: 'Paciente Maria', paciente_id: 3, profissional_id: 5, observacoes: 'Pacote com retorno' },
      { id: 3, tipo: 'entrada', descricao: 'Convênio OdontoPrev', categoria: 'Convênio', subcategoria: 'Repasse', valor: 4300, status: 'previsto', data_competencia: '2026-04-15', data_vencimento: '2026-04-20', data_pagamento: '', origem: 'Convênio', paciente_id: null, profissional_id: null, observacoes: 'Lote abril' },
      { id: 4, tipo: 'saida', descricao: 'Aluguel da clínica', categoria: 'Estrutura', subcategoria: 'Aluguel', valor: 5300, status: 'pago', data_competencia: '2026-04-01', data_vencimento: '2026-04-05', data_pagamento: '2026-04-05', origem: 'Imobiliária Centro', paciente_id: null, profissional_id: null, observacoes: 'Mensal' },
      { id: 5, tipo: 'saida', descricao: 'Laboratório de prótese', categoria: 'Laboratório', subcategoria: 'Prótese', valor: 1980, status: 'vencido', data_competencia: '2026-04-12', data_vencimento: '2026-04-17', data_pagamento: '', origem: 'Lab Sorriso', paciente_id: null, profissional_id: null, observacoes: '3 casos' },
      { id: 6, tipo: 'entrada', descricao: 'Consulta retorno ortodontia', categoria: 'Atendimento', subcategoria: 'Retorno', valor: 180, status: 'recebido', data_competencia: '2026-03-03', data_vencimento: '2026-03-03', data_pagamento: '2026-03-03', origem: 'Paciente Lucas', paciente_id: 8, profissional_id: 4, observacoes: 'Pagamento PIX' },
      { id: 7, tipo: 'entrada', descricao: 'Clareamento dental', categoria: 'Procedimento', subcategoria: 'Estética', valor: 1200, status: 'recebido', data_competencia: '2026-03-09', data_vencimento: '2026-03-09', data_pagamento: '2026-03-09', origem: 'Paciente Camila', paciente_id: 12, profissional_id: 3, observacoes: 'Entrada + 2 parcelas' },
      { id: 8, tipo: 'entrada', descricao: 'Repasse convênio - março', categoria: 'Convênio', subcategoria: 'Repasse', valor: 3980, status: 'recebido', data_competencia: '2026-03-20', data_vencimento: '2026-03-20', data_pagamento: '2026-03-21', origem: 'Convênio OdontoPrev', paciente_id: null, profissional_id: null, observacoes: 'Lote mensal' },
      { id: 9, tipo: 'saida', descricao: 'Compra de insumos clínicos', categoria: 'Insumos', subcategoria: 'Materiais', valor: 2140, status: 'pago', data_competencia: '2026-03-14', data_vencimento: '2026-03-14', data_pagamento: '2026-03-14', origem: 'Dental Supply', paciente_id: null, profissional_id: null, observacoes: 'Reposição mensal' },
      { id: 10, tipo: 'saida', descricao: 'Campanha mídia local', categoria: 'Marketing', subcategoria: 'Ads', valor: 980, status: 'pago', data_competencia: '2026-03-06', data_vencimento: '2026-03-10', data_pagamento: '2026-03-10', origem: 'Agência Prisma', paciente_id: null, profissional_id: null, observacoes: 'Campanha sazonal' },
      { id: 11, tipo: 'entrada', descricao: 'Avaliação clínica inicial', categoria: 'Atendimento', subcategoria: 'Primeira consulta', valor: 220, status: 'recebido', data_competencia: '2026-02-04', data_vencimento: '2026-02-04', data_pagamento: '2026-02-04', origem: 'Paciente Bruno', paciente_id: 15, profissional_id: 2, observacoes: 'Agendamento online' },
      { id: 12, tipo: 'entrada', descricao: 'Prótese parcial removível', categoria: 'Procedimento', subcategoria: 'Prótese', valor: 1740, status: 'recebido', data_competencia: '2026-02-11', data_vencimento: '2026-02-11', data_pagamento: '2026-02-12', origem: 'Paciente Helena', paciente_id: 18, profissional_id: 5, observacoes: 'Entrega em 2 etapas' },
      { id: 13, tipo: 'entrada', descricao: 'Repasse convênio - fevereiro', categoria: 'Convênio', subcategoria: 'Repasse', valor: 3650, status: 'recebido', data_competencia: '2026-02-24', data_vencimento: '2026-02-24', data_pagamento: '2026-02-25', origem: 'Convênio Uniodonto', paciente_id: null, profissional_id: null, observacoes: 'Lote mensal' },
      { id: 14, tipo: 'saida', descricao: 'Manutenção de equipamentos', categoria: 'Estrutura', subcategoria: 'Manutenção', valor: 1490, status: 'pago', data_competencia: '2026-02-16', data_vencimento: '2026-02-18', data_pagamento: '2026-02-18', origem: 'Tech Odonto Service', paciente_id: null, profissional_id: null, observacoes: 'Preventiva trimestral' },
      { id: 15, tipo: 'saida', descricao: 'Energia elétrica', categoria: 'Estrutura', subcategoria: 'Utilidades', valor: 760, status: 'pago', data_competencia: '2026-02-08', data_vencimento: '2026-02-15', data_pagamento: '2026-02-15', origem: 'Concessionária local', paciente_id: null, profissional_id: null, observacoes: 'Conta mensal' },
      { id: 16, tipo: 'entrada', descricao: 'Plano odontológico corporativo', categoria: 'Convênio', subcategoria: 'Corporativo', valor: 5200, status: 'previsto', data_competencia: '2026-04-26', data_vencimento: '2026-04-29', data_pagamento: '', origem: 'Empresa Parceira', paciente_id: null, profissional_id: null, observacoes: 'Faturamento em aberto' },
      { id: 17, tipo: 'saida', descricao: 'Serviços de contabilidade', categoria: 'Administrativo', subcategoria: 'Contábil', valor: 1180, status: 'previsto', data_competencia: '2026-04-22', data_vencimento: '2026-04-30', data_pagamento: '', origem: 'Contábil Centro', paciente_id: null, profissional_id: null, observacoes: 'Mensalidade' },
      { id: 18, tipo: 'saida', descricao: 'Laboratório ortodôntico', categoria: 'Laboratório', subcategoria: 'Ortodontia', valor: 2340, status: 'pago', data_competencia: '2026-03-27', data_vencimento: '2026-03-29', data_pagamento: '2026-03-29', origem: 'Lab Ortodonto Prime', paciente_id: null, profissional_id: null, observacoes: '8 dispositivos' }
    ],
    accounts: [
      { id: 1, nome: 'Conta Principal Clínica', banco: 'Odonto Bank', tipo: 'corrente', saldo_inicial: 15000 },
      { id: 2, nome: 'Conta Operacional', banco: 'Banco Sul', tipo: 'corrente', saldo_inicial: 8200 },
      { id: 3, nome: 'Reserva de Caixa', banco: 'Cooperativa Saúde', tipo: 'poupanca', saldo_inicial: 12000 }
    ],
    categories: {
      entradas: ['Consulta', 'Procedimento', 'Convênio', 'Ortodontia', 'Implantodontia', 'Estética'],
      saidas: ['Aluguel', 'Laboratório', 'Insumos', 'Marketing', 'Pessoal', 'Administrativo', 'Estrutura']
    },
    recurring: [
      { id: 1, descricao: 'Aluguel da clínica', valor: 5300, periodicidade: 'mensal', categoria: 'Aluguel', status: 'pago', ultima_quitacao: '2026-03-05' },
      { id: 2, descricao: 'Folha de pagamento', valor: 13190, periodicidade: 'mensal', categoria: 'Pessoal', status: 'pendente', ultima_quitacao: '2026-02-28' },
      { id: 3, descricao: 'Contrato software gestão', valor: 690, periodicidade: 'mensal', categoria: 'Administrativo', status: 'pago', ultima_quitacao: '2026-03-15' },
      { id: 4, descricao: 'Limpeza técnica equipamentos', valor: 980, periodicidade: 'mensal', categoria: 'Estrutura', status: 'pendente', ultima_quitacao: '2026-01-22' },
      { id: 5, descricao: 'Serviço de esterilização externa', valor: 1240, periodicidade: 'semanal', categoria: 'Insumos', status: 'pendente', ultima_quitacao: '2026-03-21' }
    ],
    forecasts: [
      { id: 1, descricao: 'Previsão de insumos', valor: 4200, periodo: 'Próximos 30 dias', comprometido: false },
      { id: 2, descricao: 'Previsão de laboratório', valor: 3600, periodo: 'Próximos 30 dias', comprometido: true },
      { id: 3, descricao: 'Campanha sazonal inverno', valor: 2500, periodo: 'Próximos 15 dias', comprometido: false },
      { id: 4, descricao: 'Atualização cadeira odontológica', valor: 7800, periodo: 'Próximos 90 dias', comprometido: false },
      { id: 5, descricao: 'Treinamento de equipe clínica', valor: 3100, periodo: 'Próximos 90 dias', comprometido: true }
    ]
  };
}(globalThis));
