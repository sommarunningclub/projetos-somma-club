// Competência mensal de repasse: distribui planos pagos à vista pelos meses de
// serviço. O professor recebe por mês (valor mensal − taxa Somma), independente
// de o aluno ter pago à vista ou parcelado.
import { taxaParaProfessor, type RepasseConfig } from "./calculo"

export const ST_RECEBIDO = new Set(["RECEIVED", "CONFIRMED", "RECEIVED_IN_CASH"])
const SEM_PROF = "Sem professor"

export interface CompPayment {
  asaas_id: string
  customer_asaas_id: string | null
  professor: string | null
  aluno: string | null
  plano: string | null
  value: number
  status: string
  due_date: string | null   // YYYY-MM-DD
  credit_date: string | null // YYYY-MM-DD (real ou estimada)
}

export interface CompItem {
  mes: string // YYYY-MM
  customer: string | null
  professor: string
  aluno: string | null
  plano: string | null
  valorMensal: number
  recebido: boolean
  origem: string // asaas_id da cobrança que originou
}

function isAvista(plano: string | null): boolean {
  return !!plano && plano.endsWith("_avista")
}
function mesesDoPlano(plano: string | null): number {
  if (!plano) return 1
  if (plano.startsWith("Anual")) return 12
  if (plano.startsWith("Semestral")) return 6
  return 1
}
// Soma k meses a YYYY-MM (aritmética pura, sem Date).
export function addMonths(ym: string, k: number): string {
  const [y, m] = ym.split("-").map(Number)
  const total = (y * 12 + (m - 1)) + k
  const ny = Math.floor(total / 12)
  const nm = (total % 12) + 1
  return `${ny}-${String(nm).padStart(2, "0")}`
}

// Expande uma cobrança em competências mensais.
export function expandirPagamento(p: CompPayment): CompItem[] {
  const professor = p.professor?.trim() || SEM_PROF
  const recebido = ST_RECEBIDO.has(p.status)
  const baseDate = p.due_date ?? p.credit_date
  const base = baseDate ? baseDate.slice(0, 7) : null
  if (!base) return []
  const value = Number(p.value) || 0

  if (isAvista(p.plano)) {
    const n = mesesDoPlano(p.plano)
    const valorMensal = Math.round((value / n) * 100) / 100
    return Array.from({ length: n }, (_, k) => ({
      mes: addMonths(base, k), customer: p.customer_asaas_id, professor,
      aluno: p.aluno, plano: p.plano, valorMensal, recebido, origem: p.asaas_id,
    }))
  }
  // Mensal ou parcela de semestral/anual parcelado: 1 competência (mês do vencimento)
  return [{
    mes: base, customer: p.customer_asaas_id, professor, aluno: p.aluno,
    plano: p.plano, valorMensal: value, recebido, origem: p.asaas_id,
  }]
}

export function expandirCompetencias(payments: CompPayment[]): CompItem[] {
  return payments.flatMap(expandirPagamento)
}

export interface CelulaMes {
  mes: string
  valorMensal: number
  taxa: number
  repasse: number
  recebido: number   // repasse cujo dinheiro já está na conta
  aReceber: number   // repasse ainda não creditado
  cobrancas: number
}
export interface LinhaProfessor {
  professor: string
  meses: Record<string, CelulaMes> // chave YYYY-MM
  totalRepasse: number
  totalTaxa: number
  totalRecebido: number
}

// Agrega por professor × mês para o ano informado (YYYY).
export function calendarioAno(items: CompItem[], cfg: RepasseConfig, ano: string): {
  professores: LinhaProfessor[]
  totaisMes: Record<string, { repasse: number; recebido: number; aReceber: number }>
  meses: string[]
} {
  const meses = Array.from({ length: 12 }, (_, i) => `${ano}-${String(i + 1).padStart(2, "0")}`)
  const map = new Map<string, LinhaProfessor>()
  const totaisMes: Record<string, { repasse: number; recebido: number; aReceber: number }> = {}
  meses.forEach(m => { totaisMes[m] = { repasse: 0, recebido: 0, aReceber: 0 } })

  for (const it of items) {
    if (!it.mes.startsWith(ano + "-")) continue
    const taxa = Math.min(it.valorMensal, taxaParaProfessor(it.professor, cfg))
    const repasse = Math.max(0, it.valorMensal - taxa)
    const linha = map.get(it.professor) ?? {
      professor: it.professor, meses: {}, totalRepasse: 0, totalTaxa: 0, totalRecebido: 0,
    }
    const cel = linha.meses[it.mes] ?? { mes: it.mes, valorMensal: 0, taxa: 0, repasse: 0, recebido: 0, aReceber: 0, cobrancas: 0 }
    cel.valorMensal += it.valorMensal
    cel.taxa += taxa
    cel.repasse += repasse
    cel.cobrancas += 1
    if (it.recebido) cel.recebido += repasse; else cel.aReceber += repasse
    linha.meses[it.mes] = cel
    linha.totalRepasse += repasse
    linha.totalTaxa += taxa
    if (it.recebido) linha.totalRecebido += repasse
    map.set(it.professor, linha)
    if (totaisMes[it.mes]) {
      totaisMes[it.mes].repasse += repasse
      if (it.recebido) totaisMes[it.mes].recebido += repasse; else totaisMes[it.mes].aReceber += repasse
    }
  }
  const professores = [...map.values()].sort((a, b) => b.totalRepasse - a.totalRepasse)
  return { professores, totaisMes, meses }
}

export interface DetalheMesItem {
  professor: string
  aluno: string | null
  plano: string | null
  valorMensal: number
  taxa: number
  repasse: number
  recebido: boolean
}
// Detalhe de um mês específico (YYYY-MM): uma linha por aluno/competência.
export function detalheMes(items: CompItem[], cfg: RepasseConfig, mes: string): DetalheMesItem[] {
  return items
    .filter(it => it.mes === mes)
    .map(it => {
      const taxa = Math.min(it.valorMensal, taxaParaProfessor(it.professor, cfg))
      return {
        professor: it.professor, aluno: it.aluno, plano: it.plano,
        valorMensal: it.valorMensal, taxa, repasse: Math.max(0, it.valorMensal - taxa),
        recebido: it.recebido,
      }
    })
    .sort((a, b) => a.professor.localeCompare(b.professor) || (a.aluno ?? "").localeCompare(b.aluno ?? ""))
}
