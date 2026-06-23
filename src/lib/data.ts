import type { Config, FonteId, Lancamento } from "@/rules";

// SISTEMA INICIA VAZIO (para teste local). Sem lançamentos e sem renda cadastrada.
// Mantém a estrutura das 4 fontes e as regras de categoria→fonte (configuração, não "dados").
export const config: Config = {
  fallback: "salario",
  categoriaPadrao: "salario",
  fontes: [
    { id: "salario", nome: "Salário", acumula: true, entradaMensal: 0, repeteMensal: false },
    { id: "beneficio", nome: "Benefício", acumula: true, entradaMensal: 0, repeteMensal: false },
    { id: "vale", nome: "Vale alimentação", acumula: true, entradaMensal: 0, repeteMensal: false },
    { id: "outros", nome: "Outros", acumula: true, entradaMensal: 0, repeteMensal: false },
  ],
  categorias: [
    { categoria: "Luz", fonte: "beneficio", travada: true },
    { categoria: "Internet", fonte: "beneficio", travada: true },
    { categoria: "Água", fonte: "beneficio", travada: true },
    { categoria: "Gasolina / Combustível", fonte: "beneficio", travada: true },
    { categoria: "Mercado", fonte: "vale", travada: true },
    { categoria: "iFood / restaurante", fonte: "vale", travada: false },
    { categoria: "Aluguel", fonte: "salario", travada: false },
    { categoria: "Transporte", fonte: "salario", travada: false },
    { categoria: "Lazer", fonte: "salario", travada: false },
    { categoria: "Saúde", fonte: "salario", travada: false },
  ],
};

// Categorias disponíveis no seletor de lançamento.
export const CATEGORIAS: string[] = [
  "Luz", "Internet", "Água", "Gasolina / Combustível", "Mercado",
  "iFood / restaurante", "Aluguel", "Moradia", "Transporte", "Lazer", "Saúde",
  "Assinaturas", "Compras", "Outros gastos",
];

export const MES_ATUAL = "Junho 2026";

// Sem renda cadastrada (o usuário cadastra na página Renda).
export const rendaMes: Record<string, Partial<Record<FonteId, number>>> = {};

// Histórico mensal zerado (gráfico Entradas × Saídas dos Relatórios).
export const historicoMensal: { mes: string; entradas: number; saidas: number }[] = [
  "Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez",
].map((mes) => ({ mes, entradas: 0, saidas: 0 }));

// Sem lançamentos.
export const lancamentos: Lancamento[] = [];
