// Harmony — engine de regras (núcleo do domínio, independente de UI/stack).
// Implementa as regras de gestao-financeira/regras-de-negocio.md:
//  - 3 fontes principais (Salário, Benefício, Vale) + Outros, cada uma com saldo próprio
//  - amarração categoria→fonte (travas) + fonte-padrão editável
//  - apuração por AGREGADO do ciclo (ordem-independente)
//  - estouro de uma fonte travada desce para o Salário (fallback) com alerta
//  - carryover: fontes que acumulam levam o saldo para o próximo ciclo
//    (Salário pode ficar negativo = mês no vermelho; as demais nunca ficam negativas)

export type FonteId = 'salario' | 'beneficio' | 'vale' | 'outros';

export interface Fonte {
  id: FonteId;
  nome: string;
  acumula: boolean;       // saldo não usado transita para o próximo ciclo
  entradaMensal: number;  // valor padrão/esperado que entra na fonte por mês
  repeteMensal: boolean;  // true = usa entradaMensal automaticamente todo mês; false = cadastra por mês
}

export interface CategoriaRegra {
  categoria: string;
  fonte: FonteId;
  travada: boolean;       // true = sempre sai dessa fonte (não pode trocar no lançamento)
}

export interface Lancamento {
  data: string;
  descricao: string;
  categoria: string;
  valor: number;
  tipo?: 'gasto' | 'entrada';   // default: 'gasto'
  fonteOverride?: FonteId;      // só vale para categoria NÃO-travada
  pago?: boolean;               // só conta no ciclo quando pago (confirmado)
  mes?: string;                 // mês de referência (ex.: "Junho 2026")
}

export interface Config {
  fontes: Fonte[];
  fallback: FonteId;            // fonte que absorve os estouros (Salário)
  categorias: CategoriaRegra[]; // mapa categoria → fonte (travada ou sugestão)
  categoriaPadrao: FonteId;     // fonte para categorias sem regra (Salário)
}

export interface FonteResult {
  id: FonteId;
  nome: string;
  disponivel: number;        // carryover (se acumula) + entrada mensal + entradas avulsas
  saidasPretendidas: number; // total alocado à fonte no ciclo
  estouro: number;           // o que não coube (vai para o fallback) — 0 no fallback
  recebidoFallback: number;  // estouro recebido de outras fontes — só no fallback
  saidasReais: number;       // o que de fato saiu desta fonte
  saldoFinal: number;        // disponivel - saidasReais (≥0, exceto o fallback)
}

export interface CicloResult {
  fontes: Record<FonteId, FonteResult>;
  estouroTotal: number;
  totalEntradas: number;     // entrada mensal + avulsas (sem carryover)
  totalSaidas: number;       // soma das saídas reais (estouro contado uma vez)
  porCategoria: Record<string, number>;
  alertas: string[];
}

/** Resolve de qual fonte um lançamento sai, aplicando travas e override. */
export function resolverFonte(config: Config, l: Lancamento): FonteId {
  const regra = config.categorias.find((c) => c.categoria === l.categoria);
  if (regra && regra.travada) return regra.fonte;        // trava manda sempre
  if (l.fonteOverride) return l.fonteOverride;            // override só em não-travada
  if (regra) return regra.fonte;                          // sugestão da categoria
  return config.categoriaPadrao;                          // padrão (Salário)
}

/** Apura um ciclo (mês) por agregado. saldoInicial = carryover do ciclo anterior. */
export function computeCiclo(
  config: Config,
  lancamentos: Lancamento[],
  saldoInicial: Partial<Record<FonteId, number>> = {},
): CicloResult {
  const fb = config.fallback;
  const disponivel: Record<string, number> = {};
  const saidas: Record<string, number> = {};
  const entradasAvulsas: Record<string, number> = {};
  const porCategoria: Record<string, number> = {};

  for (const f of config.fontes) {
    const ini = f.acumula ? (saldoInicial[f.id] ?? 0) : 0;
    disponivel[f.id] = ini + f.entradaMensal;
    saidas[f.id] = 0;
    entradasAvulsas[f.id] = 0;
  }

  for (const l of lancamentos) {
    const fonte = resolverFonte(config, l);
    if (l.tipo === 'entrada') {
      disponivel[fonte] = (disponivel[fonte] ?? 0) + l.valor;
      entradasAvulsas[fonte] = (entradasAvulsas[fonte] ?? 0) + l.valor;
    } else {
      saidas[fonte] = (saidas[fonte] ?? 0) + l.valor;
      porCategoria[l.categoria] = (porCategoria[l.categoria] ?? 0) + l.valor;
    }
  }

  const res: Record<string, FonteResult> = {};
  const alertas: string[] = [];
  let estouroTotal = 0;
  const nomeFb = config.fontes.find((f) => f.id === fb)?.nome ?? 'Salário';

  // fontes não-fallback: o que estoura desce para o fallback
  for (const f of config.fontes) {
    if (f.id === fb) continue;
    const disp = disponivel[f.id];
    const pret = saidas[f.id];
    const estouro = Math.max(0, pret - disp);
    const reais = pret - estouro;
    if (estouro > 0) {
      estouroTotal += estouro;
      alertas.push(`${f.nome} estourou R$ ${formatBR(estouro)} — coberto pelo ${nomeFb}.`);
    }
    res[f.id] = {
      id: f.id, nome: f.nome, disponivel: disp, saidasPretendidas: pret,
      estouro, recebidoFallback: 0, saidasReais: reais, saldoFinal: disp - reais,
    };
  }

  // fallback (Salário): absorve todos os estouros; pode ficar negativo
  const ff = config.fontes.find((f) => f.id === fb)!;
  const dispFb = disponivel[fb];
  const saidasFb = saidas[fb] + estouroTotal;
  res[fb] = {
    id: fb, nome: ff.nome, disponivel: dispFb, saidasPretendidas: saidas[fb],
    estouro: 0, recebidoFallback: estouroTotal, saidasReais: saidasFb, saldoFinal: dispFb - saidasFb,
  };

  let totalEntradas = 0, totalSaidas = 0;
  for (const f of config.fontes) totalEntradas += f.entradaMensal + entradasAvulsas[f.id];
  for (const id of Object.keys(res)) totalSaidas += res[id].saidasReais;

  return { fontes: res as Record<FonteId, FonteResult>, estouroTotal, totalEntradas, totalSaidas, porCategoria, alertas };
}

function formatBR(n: number): string {
  return n.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}
