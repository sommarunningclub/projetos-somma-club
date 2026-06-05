// Lógica pura dos relatórios gerenciais (carteira e repasse).
// Sem dependências de I/O — testável isoladamente.

export const RECEBIDAS = new Set(["RECEIVED", "CONFIRMED", "RECEIVED_IN_CASH"])

export type Agrupamento = "professor" | "plano" | "forma" | "mes"

// Linha de pagamento já normalizada para os cálculos
export interface PaymentRow {
  asaas_id: string
  customer_asaas_id: string | null
  value: number
  status: string
  billing_type: string | null
  due_date: string | null
  payment_date: string | null
  plano: string | null
  professor: string | null // já resolvido (grupo do Asaas ou descrição)
  aluno: string | null
  credit_date: string | null // data de crédito real (YYYY-MM-DD)
}

export interface RepasseConfig {
  taxaPadrao: number
  // chave = nome do professor; { taxa? sobrescreve padrão, isento? zera }
  professores: Record<string, { taxa?: number; isento?: boolean }>
}

export const REPASSE_CONFIG_DEFAULT: RepasseConfig = {
  taxaPadrao: 50,
  professores: { "Alexandre Alves": { isento: true } },
}

const SEM_PROF = "Sem professor"
const BILLING_LABEL: Record<string, string> = {
  CREDIT_CARD: "Cartão de Crédito",
  DEBIT_CARD: "Cartão de Débito",
  PIX: "Pix",
  BOLETO: "Boleto",
  TRANSFER: "Transferência",
  DEPOSIT: "Depósito",
  UNDEFINED: "Indefinido",
}

// Data de crédito real: prioriza creditDate; cai para payment_date.
// `raw` é o objeto raw_data do Asaas (pode trazer creditDate/confirmedDate).
export function getCreditDate(p: { credit_date?: string | null; payment_date?: string | null }): string | null {
  const cd = p.credit_date ?? null
  return cd ? cd.slice(0, 10) : p.payment_date ? p.payment_date.slice(0, 10) : null
}

// Filtra recebidas dentro do período [de, ate] pela data de crédito.
// `de` e `ate` em YYYY-MM-DD (ate inclusivo). Qualquer um pode ser vazio.
export function filtrarRecebidasNoPeriodo(rows: PaymentRow[], de: string, ate: string): PaymentRow[] {
  return rows.filter(r => {
    if (!RECEBIDAS.has(r.status)) return false
    const cd = r.credit_date ? r.credit_date.slice(0, 10) : null
    if (!cd) return false
    if (de && cd < de) return false
    if (ate && cd > ate) return false
    return true
  })
}

function chaveAgrupamento(r: PaymentRow, agrupar: Agrupamento): string {
  switch (agrupar) {
    case "professor": return r.professor?.trim() || SEM_PROF
    case "plano": return r.plano?.trim() || "Sem plano"
    case "forma": return BILLING_LABEL[r.billing_type ?? ""] ?? r.billing_type ?? "Indefinido"
    case "mes": return (r.credit_date ?? "").slice(0, 7) || "—"
  }
}

export interface CarteiraGrupo {
  grupo: string
  qtd: number
  total: number
}

// Agrega total creditado por dimensão. Retorna grupos ordenados desc por total.
export function agregarCarteira(rows: PaymentRow[], agrupar: Agrupamento): {
  grupos: CarteiraGrupo[]
  totalGeral: number
  qtdGeral: number
} {
  const map = new Map<string, CarteiraGrupo>()
  for (const r of rows) {
    const k = chaveAgrupamento(r, agrupar)
    const g = map.get(k) ?? { grupo: k, qtd: 0, total: 0 }
    g.qtd += 1
    g.total += Number(r.value ?? 0)
    map.set(k, g)
  }
  const grupos = [...map.values()].sort((a, b) => b.total - a.total)
  return {
    grupos,
    totalGeral: grupos.reduce((s, g) => s + g.total, 0),
    qtdGeral: grupos.reduce((s, g) => s + g.qtd, 0),
  }
}

// Taxa do Somma para um professor, conforme config.
export function taxaParaProfessor(professor: string | null, cfg: RepasseConfig): number {
  const nome = (professor ?? "").trim()
  const p = cfg.professores[nome]
  if (p?.isento) return 0
  if (typeof p?.taxa === "number") return p.taxa
  return cfg.taxaPadrao
}

export interface RepasseLinha {
  asaas_id: string
  professor: string
  aluno: string | null
  plano: string | null
  credit_date: string | null
  bruto: number
  taxa: number
  repasse: number
}

export interface RepasseGrupo {
  professor: string
  qtd: number
  bruto: number
  taxa: number
  repasse: number
}

// Calcula repasse por professor. repasse = bruto - taxa (nunca negativo).
export function calcularRepasse(rows: PaymentRow[], cfg: RepasseConfig): {
  grupos: RepasseGrupo[]
  analitico: RepasseLinha[]
  totalBruto: number
  totalTaxa: number
  totalRepasse: number
} {
  const analitico: RepasseLinha[] = []
  const map = new Map<string, RepasseGrupo>()
  for (const r of rows) {
    const professor = r.professor?.trim() || SEM_PROF
    const bruto = Number(r.value ?? 0)
    const taxa = Math.min(bruto, taxaParaProfessor(professor, cfg))
    const repasse = Math.max(0, bruto - taxa)
    analitico.push({
      asaas_id: r.asaas_id, professor, aluno: r.aluno, plano: r.plano,
      credit_date: r.credit_date ? r.credit_date.slice(0, 10) : null,
      bruto, taxa, repasse,
    })
    const g = map.get(professor) ?? { professor, qtd: 0, bruto: 0, taxa: 0, repasse: 0 }
    g.qtd += 1; g.bruto += bruto; g.taxa += taxa; g.repasse += repasse
    map.set(professor, g)
  }
  const grupos = [...map.values()].sort((a, b) => b.repasse - a.repasse)
  return {
    grupos,
    analitico: analitico.sort((a, b) => a.professor.localeCompare(b.professor) || (a.credit_date ?? "").localeCompare(b.credit_date ?? "")),
    totalBruto: grupos.reduce((s, g) => s + g.bruto, 0),
    totalTaxa: grupos.reduce((s, g) => s + g.taxa, 0),
    totalRepasse: grupos.reduce((s, g) => s + g.repasse, 0),
  }
}
