const lancamentos = [
  {
    id: 1,
    tipo: "entrada",
    descricao: "Consulta clínica",
    categoria: "Atendimento",
    subcategoria: "Consulta",
    valor: 250,
    status: "recebido",
    data_competencia: "2026-04-10",
    data_vencimento: "2026-04-10",
    data_pagamento: "2026-04-10",
    origem: "Paciente João",
    paciente_id: 1,
    profissional_id: 2,
    observacoes: "Pagamento no cartão"
  },
  {
    id: 2,
    tipo: "entrada",
    descricao: "Implante unitário",
    categoria: "Procedimento",
    subcategoria: "Implantodontia",
    valor: 2850,
    status: "recebido",
    data_competencia: "2026-04-11",
    data_vencimento: "2026-04-11",
    data_pagamento: "2026-04-11",
    origem: "Paciente Maria",
    paciente_id: 3,
    profissional_id: 5,
    observacoes: "Pacote com retorno"
  },
  {
    id: 3,
    tipo: "entrada",
    descricao: "Clareamento dental",
    categoria: "Estética",
    subcategoria: "Clareamento",
    valor: 900,
    status: "previsto",
    data_competencia: "2026-04-14",
    data_vencimento: "2026-05-04",
    data_pagamento: "",
    origem: "Paciente Lucas",
    paciente_id: 4,
    profissional_id: 2,
    observacoes: "Entrada + 2 parcelas"
  },
  {
    id: 4,
    tipo: "entrada",
    descricao: "Convênio OdontoPrev",
    categoria: "Convênio",
    subcategoria: "Repasse",
    valor: 4300,
    status: "recebido",
    data_competencia: "2026-04-15",
    data_vencimento: "2026-04-20",
    data_pagamento: "2026-04-20",
    origem: "Convênio",
    paciente_id: null,
    profissional_id: null,
    observacoes: "Lote abril"
  },
  {
    id: 5,
    tipo: "saida",
    descricao: "Aluguel da clínica",
    categoria: "Estrutura",
    subcategoria: "Aluguel",
    valor: 5300,
    status: "pago",
    data_competencia: "2026-04-01",
    data_vencimento: "2026-04-05",
    data_pagamento: "2026-04-05",
    origem: "Imobiliária Centro",
    paciente_id: null,
    profissional_id: null,
    observacoes: "Mensal"
  },
  {
    id: 6,
    tipo: "saida",
    descricao: "Laboratório de prótese",
    categoria: "Laboratório",
    subcategoria: "Prótese",
    valor: 1980,
    status: "pago",
    data_competencia: "2026-04-12",
    data_vencimento: "2026-04-17",
    data_pagamento: "2026-04-17",
    origem: "Lab Sorriso",
    paciente_id: null,
    profissional_id: null,
    observacoes: "3 casos"
  },
  {
    id: 7,
    tipo: "saida",
    descricao: "Folha de pagamento",
    categoria: "Pessoal",
    subcategoria: "Equipe",
    valor: 13190,
    status: "pago",
    data_competencia: "2026-04-22",
    data_vencimento: "2026-04-25",
    data_pagamento: "2026-04-25",
    origem: "Equipe clínica",
    paciente_id: null,
    profissional_id: null,
    observacoes: "Salários + encargos"
  },
  {
    id: 8,
    tipo: "saida",
    descricao: "Marketing digital",
    categoria: "Marketing",
    subcategoria: "Campanhas",
    valor: 2080,
    status: "vencido",
    data_competencia: "2026-04-08",
    data_vencimento: "2026-04-20",
    data_pagamento: "",
    origem: "Agência Pixel",
    paciente_id: null,
    profissional_id: null,
    observacoes: "Meta leads abril"
  }
];

const evolucaoFinanceira = {
  labels: ["01/04", "05/04", "10/04", "15/04", "20/04", "25/04", "30/04"],
  receita: [8000, 12000, 15000, 10800, 18300, 20500, 17350],
  despesa: [3500, 4900, 4200, 6100, 5700, 6300, 3420]
};

const receitaPorOrigem = {
  labels: ["Particular", "Convênio", "Procedimentos", "Outros"],
  valores: [37620, 31500, 8490, 550],
  cores: ["#22c55e", "#3b82f6", "#14b8a6", "#f59e0b"]
};

const despesasPorCategoria = {
  labels: ["Pessoal", "Aluguel", "Laboratório", "Marketing", "Insumos", "Outros"],
  valores: [13190, 5250, 3990, 2080, 4500, 1100],
  cores: ["#ef4444", "#f97316", "#f59e0b", "#e11d48", "#60a5fa", "#8b5cf6"]
};

const alertasFinanceiros = [
  { tipo: "alerta", texto: "Queda de 8% na receita da última semana." },
  { tipo: "critico", texto: "2 contas a pagar vencidas somando R$ 2.630,00." },
  { tipo: "aviso", texto: "Despesas de laboratório acima da média mensal." }
];

function resumoFinanceiro(items = lancamentos) {
  const receitaRecebida = items
    .filter((i) => i.tipo === "entrada" && ["recebido", "pago"].includes(i.status))
    .reduce((acc, cur) => acc + cur.valor, 0);

  const despesasPagas = items
    .filter((i) => i.tipo === "saida" && i.status === "pago")
    .reduce((acc, cur) => acc + cur.valor, 0);

  const aReceber = items
    .filter((i) => i.tipo === "entrada" && !["recebido", "pago"].includes(i.status))
    .reduce((acc, cur) => acc + cur.valor, 0);

  const ticketMedio = receitaRecebida / Math.max(items.filter((i) => i.tipo === "entrada").length, 1);

  const inadimplenciaBase = items.filter((i) => i.tipo === "entrada");
  const inadimplencia = inadimplenciaBase.length
    ? (inadimplenciaBase.filter((i) => i.status === "vencido").length / inadimplenciaBase.length) * 100
    : 0;

  return {
    receitaRecebida,
    despesasPagas,
    resultadoLiquido: receitaRecebida - despesasPagas,
    aReceber,
    ticketMedio,
    inadimplencia
  };
}

window.financeiroMock = {
  lancamentos,
  evolucaoFinanceira,
  receitaPorOrigem,
  despesasPorCategoria,
  alertasFinanceiros,
  resumoFinanceiro
};
