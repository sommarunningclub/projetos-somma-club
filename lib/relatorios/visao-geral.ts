// Visão geral mensal por professor: recebido, a receber, vencido, taxa e repasse previsto.
// Competência do mês = data de crédito (real ou estimada), com fallback para vencimento.
import { taxaParaProfessor, type RepasseConfig } from "./calculo"

export const ST_RECEBIDO = new Set(["RECEIVED", "CONFIRMED", "RECEIVED_IN_CASH"])
export const ST_PENDENTE = "PENDING"
export const ST_VENCIDO = "OVERDUE"
// Considerados na previsão do mês (demais status — estorno/chargeback — ficam de fora)
const ST_VALIDOS = new Set([...ST_RECEBIDO, ST_PENDENTE, ST_VENCIDO])

export interface VGPayment {
  asaas_id: string
  customer_asaas_id: string | null
  value: number
  status: string
  professor: string | null
  aluno: string | null
  plano: string | null
  due_date: string | null
  credit_date: string | null
  estimated_credit_date: string | null
}

const SEM_PROF = "Sem professor"

// Mês de competência (YYYY-MM): crédito real → crédito estimado → vencimento.
export function competenciaMes(p: VGPayment): string | null {
  const d = p.credit_date ?? p.estimated_credit_date ?? p.due_date
  return d ? d.slice(0, 7) : null
}

export type Categoria = "recebido" | "aReceber" | "vencido" | "outro"
export function categoria(status: string): Categoria {
  if (ST_RECEBIDO.has(status)) return "recebido"
  if (status === ST_PENDENTE) return "aReceber"
  if (status === ST_VENCIDO) return "vencido"
  return "outro"
}

export interface ProfessorResumo {
  professor: string
  alunos: number
  cobrancas: number
  recebido: number
  aReceber: number
  vencido: number
  previsaoTotal: number
  taxaUnitaria: number // taxa por cobrança aplicada a este professor (0 se isento)
  taxaTotal: number
  repassePrevisto: number
}

export interface VisaoGeralResultado {
  professores: ProfessorResumo[]
  totais: {
    alunos: number
    cobrancas: number
    recebido: number
    aReceber: number
    vencido: number
    previsaoTotal: number
    taxaTotal: number
    repassePrevisto: number
  }
}

// Filtra cobranças da competência informada (YYYY-MM) e válidas para a previsão.
export function filtrarMes(rows: VGPayment[], mes: string): VGPayment[] {
  return rows.filter(r => ST_VALIDOS.has(r.status) && competenciaMes(r) === mes)
}

export function resumoPorProfessor(rows: VGPayment[], cfg: RepasseConfig): VisaoGeralResultado {
  const map = new Map<string, ProfessorResumo & { _alunos: Set<string> }>()
  for (const r of rows) {
    const prof = r.professor?.trim() || SEM_PROF
    const cat = categoria(r.status)
    if (cat === "outro") continue
    const v = Number(r.value) || 0
    const taxaUnit = taxaParaProfessor(prof, cfg)
    const g = map.get(prof) ?? {
      professor: prof, alunos: 0, cobrancas: 0, recebido: 0, aReceber: 0, vencido: 0,
      previsaoTotal: 0, taxaUnitaria: taxaUnit, taxaTotal: 0, repassePrevisto: 0,
      _alunos: new Set<string>(),
    }
    g.cobrancas += 1
    g.previsaoTotal += v
    if (cat === "recebido") g.recebido += v
    else if (cat === "aReceber") g.aReceber += v
    else if (cat === "vencido") g.vencido += v
    g.taxaTotal += Math.min(v, taxaUnit)
    if (r.customer_asaas_id) g._alunos.add(r.customer_asaas_id)
    map.set(prof, g)
  }
  const professores: ProfessorResumo[] = [...map.values()].map(g => {
    g.alunos = g._alunos.size
    g.repassePrevisto = Math.max(0, g.previsaoTotal - g.taxaTotal)
    const { _alunos, ...rest } = g
    return rest
  }).sort((a, b) => b.previsaoTotal - a.previsaoTotal)

  const totais = professores.reduce((t, p) => ({
    alunos: t.alunos + p.alunos,
    cobrancas: t.cobrancas + p.cobrancas,
    recebido: t.recebido + p.recebido,
    aReceber: t.aReceber + p.aReceber,
    vencido: t.vencido + p.vencido,
    previsaoTotal: t.previsaoTotal + p.previsaoTotal,
    taxaTotal: t.taxaTotal + p.taxaTotal,
    repassePrevisto: t.repassePrevisto + p.repassePrevisto,
  }), { alunos: 0, cobrancas: 0, recebido: 0, aReceber: 0, vencido: 0, previsaoTotal: 0, taxaTotal: 0, repassePrevisto: 0 })

  return { professores, totais }
}

export interface AgendaItem {
  asaas_id: string
  aluno: string | null
  professor: string
  plano: string | null
  due_date: string | null
  value: number
  status: "aReceber" | "vencido"
}

// Agenda a receber por cliente: pendentes e vencidos da competência, ordenados por vencimento.
export function agendaReceber(rows: VGPayment[]): AgendaItem[] {
  return rows
    .filter(r => r.status === ST_PENDENTE || r.status === ST_VENCIDO)
    .map(r => ({
      asaas_id: r.asaas_id,
      aluno: r.aluno,
      professor: r.professor?.trim() || SEM_PROF,
      plano: r.plano,
      due_date: r.due_date,
      value: Number(r.value) || 0,
      status: (r.status === ST_VENCIDO ? "vencido" : "aReceber") as "aReceber" | "vencido",
    }))
    .sort((a, b) => (a.due_date ?? "").localeCompare(b.due_date ?? ""))
}
