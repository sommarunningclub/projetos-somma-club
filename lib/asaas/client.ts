// ASAAS_BASE_URL pode vir com/sem barra final, com/sem /v3
// Normalizamos para sempre ter /v3 sem barra final.
function normalizeAsaasUrl(raw: string | undefined): string {
  const base = (raw || "https://api.asaas.com/v3").replace(/\/+$/, "")
  return base.endsWith("/v3") ? base : `${base}/v3`
}

const ASAAS_API_URL = normalizeAsaasUrl(process.env.ASAAS_BASE_URL)
const ASAAS_API_KEY = process.env.ASAAS_API_KEY

export type AsaasPaymentStatus =
  | "PENDING" | "RECEIVED" | "CONFIRMED" | "OVERDUE"
  | "REFUNDED" | "RECEIVED_IN_CASH" | "REFUND_REQUESTED"
  | "REFUND_IN_PROGRESS" | "CHARGEBACK_REQUESTED" | "CHARGEBACK_DISPUTE"
  | "AWAITING_CHARGEBACK_REVERSAL" | "DUNNING_REQUESTED" | "DUNNING_RECEIVED"
  | "AWAITING_RISK_ANALYSIS"

export interface AsaasCustomer {
  id: string
  name: string
  email?: string
  phone?: string
  mobilePhone?: string
  cpfCnpj?: string
  postalCode?: string
  address?: string
  addressNumber?: string
  province?: string
  city?: string
  state?: string
  externalReference?: string
  dateCreated?: string
  deleted?: boolean
  groups?: { name: string }[]
}

export interface AsaasPayment {
  id: string
  customer: string
  subscription?: string
  installment?: string
  installmentNumber?: number
  billingType: "UNDEFINED" | "BOLETO" | "CREDIT_CARD" | "DEBIT_CARD" | "TRANSFER" | "DEPOSIT" | "PIX"
  value: number
  netValue?: number
  originalValue?: number
  dueDate: string
  originalDueDate?: string
  paymentDate?: string
  clientPaymentDate?: string
  dateCreated: string
  status: AsaasPaymentStatus
  description?: string
  externalReference?: string
  deleted?: boolean
}

export interface AsaasListResponse<T> {
  object: "list"
  hasMore: boolean
  totalCount: number
  limit: number
  offset: number
  data: T[]
}

function headers() {
  if (!ASAAS_API_KEY) throw new Error("ASAAS_API_KEY não configurada")
  return {
    "Content-Type": "application/json",
    access_token: ASAAS_API_KEY,
  }
}

// CRÍTICO: GET com body retorna 403 — nunca passar body em GET
async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${ASAAS_API_URL}${path}`, { method: "GET", headers: headers() })
  if (!res.ok) throw new Error(`Asaas GET ${path} falhou: ${res.status} ${await res.text()}`)
  return res.json()
}

export async function listAsaasCustomers(offset = 0, limit = 100) {
  return get<AsaasListResponse<AsaasCustomer>>(`/customers?limit=${limit}&offset=${offset}`)
}

export async function getAllAsaasCustomers(): Promise<AsaasCustomer[]> {
  const all: AsaasCustomer[] = []
  let offset = 0
  while (true) {
    const page = await listAsaasCustomers(offset, 100)
    all.push(...page.data.filter(c => !c.deleted))
    if (!page.hasMore) break
    offset += 100
    await new Promise(r => setTimeout(r, 200))
  }
  return all
}

export async function listAsaasPayments(params: Record<string, string> = {}, offset = 0, limit = 100) {
  const qs = new URLSearchParams({ limit: String(limit), offset: String(offset), ...params })
  return get<AsaasListResponse<AsaasPayment>>(`/payments?${qs}`)
}

export async function getAllAsaasPayments(params: Record<string, string> = {}): Promise<AsaasPayment[]> {
  const all: AsaasPayment[] = []
  let offset = 0
  while (true) {
    const page = await listAsaasPayments(params, offset, 100)
    all.push(...page.data)
    if (!page.hasMore) break
    offset += 100
    await new Promise(r => setTimeout(r, 200))
  }
  return all
}

// ─── Helpers de extração da descrição ───────────────────────────────────────
// Formato: "Somma Assessoria - Plano Mensal | Prof: Joseph Pereira | Camiseta: M | Cupom: SOMMA10"
// Parcelado: "Parcela 1 de 6. Somma Assessoria - Plano Semestral | Prof: ..."

export function extractProfessor(description?: string): string | null {
  if (!description) return null
  const m = description.match(/Prof[:\.]?\s*([^|]+)/i)
  return m ? m[1].trim() : null
}

export function extractCamiseta(description?: string): string | null {
  if (!description) return null
  const m = description.match(/Camiseta[:\s]+([^|]+)/i)
  return m ? m[1].trim() : null
}

export function extractCupom(description?: string): string | null {
  if (!description) return null
  const m = description.match(/Cupom[:\s]+([A-Z0-9]+)/i)
  return m ? m[1].trim() : null
}

export function extractParcelaTotal(description?: string): number | null {
  if (!description) return null
  const m = description.match(/Parcela\s+\d+\s+de\s+(\d+)/i)
  return m ? parseInt(m[1]) : null
}

export function inferPlanFromPayment(payment: AsaasPayment): string {
  const desc = payment.description ?? ""
  if (/Plano Anual/i.test(desc)) return "Anual"
  if (/Plano Semestral/i.test(desc)) return "Semestral"
  if (/Plano Mensal/i.test(desc)) return "Mensal"

  const total = extractParcelaTotal(desc)
  if (total === 12) return "Anual"
  if (total === 6) return "Semestral"

  if (payment.value === 2160) return "Anual_avista"
  if (payment.value === 1200) return "Semestral_avista"

  if (payment.subscription) return "Mensal"
  return "Avulso"
}

export function translateStatus(status: AsaasPaymentStatus): string {
  const map: Record<string, string> = {
    PENDING: "Aguardando pagamento",
    RECEIVED: "Recebida",
    CONFIRMED: "Confirmada",
    OVERDUE: "Vencida",
    REFUNDED: "Estornada",
    RECEIVED_IN_CASH: "Recebida em dinheiro",
    REFUND_REQUESTED: "Estorno solicitado",
    REFUND_IN_PROGRESS: "Estorno em andamento",
    CHARGEBACK_REQUESTED: "Chargeback solicitado",
    DUNNING_REQUESTED: "Em negativação",
    DUNNING_RECEIVED: "Negativação recebida",
    AWAITING_RISK_ANALYSIS: "Aguardando análise de risco",
  }
  return map[status] ?? status
}

// CPFs internos (professores/testes) — filtrar nas syncs
export const PROFESSOR_CPFS = new Set(["5205279176", "6992119133"])

export const PRECO_TABELA: Record<string, number> = {
  Mensal: 220,
  Semestral: 200,
  Anual: 180,
  Semestral_avista: 1200,
  Anual_avista: 2160,
  Avulso: 0,
}
