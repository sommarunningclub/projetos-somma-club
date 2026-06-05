import { type NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { loadRepasseConfig } from "@/lib/relatorios/repasse-config"
import {
  RECEBIDAS, filtrarRecebidasNoPeriodo, agregarCarteira, calcularRepasse,
  type PaymentRow, type Agrupamento,
} from "@/lib/relatorios/calculo"

export const dynamic = "force-dynamic"
export const maxDuration = 60

const BILLING_LABEL: Record<string, string> = {
  CREDIT_CARD: "Cartão de Crédito", DEBIT_CARD: "Cartão de Débito", PIX: "Pix",
  BOLETO: "Boleto", TRANSFER: "Transferência", DEPOSIT: "Depósito", UNDEFINED: "Indefinido",
}

export async function GET(request: NextRequest) {
  try {
    const sp = request.nextUrl.searchParams
    const tipo = (sp.get("tipo") ?? "carteira") as "carteira" | "repasse"
    const de = sp.get("de") ?? ""
    const ate = sp.get("ate") ?? ""
    const agrupar = (sp.get("agrupar") ?? "professor") as Agrupamento
    const fProfessor = sp.get("professor") ?? ""
    const fPlano = sp.get("plano") ?? ""
    const fForma = sp.get("forma") ?? ""

    const supabase = createAdminClient()

    // Clientes: mapa asaas_id -> { nome, professor(grupo) }
    const { data: clientes } = await supabase
      .from("asaas_customers_sync")
      .select("asaas_id, name, professor")
      .eq("deleted", false)
    const clienteMap = new Map((clientes ?? []).map(c => [c.asaas_id, c]))

    // Pagamentos recebidos (não deletados). raw_data traz creditDate.
    const { data: pagamentos } = await supabase
      .from("payments")
      .select("asaas_id, customer_asaas_id, value, status, billing_type, due_date, payment_date, plano, professor, raw_data")
      .eq("deleted", false)
      .in("status", [...RECEBIDAS])
      .limit(5000)

    const num = (x: unknown) => { const n = Number(x); return Number.isFinite(n) ? n : 0 }

    // Monta PaymentRow resolvendo professor (grupo) e data de crédito
    const rows: PaymentRow[] = (pagamentos ?? []).map(p => {
      const cli = p.customer_asaas_id ? clienteMap.get(p.customer_asaas_id) : null
      const raw = (p.raw_data ?? {}) as Record<string, unknown>
      // Data de crédito real; cadeia de fallback para não perder recebimentos (ex.: dinheiro)
      const creditDate =
        (raw.creditDate as string | undefined) ??
        p.payment_date ??
        (raw.clientPaymentDate as string | undefined) ??
        (raw.confirmedDate as string | undefined) ??
        null
      return {
        asaas_id: p.asaas_id,
        customer_asaas_id: p.customer_asaas_id,
        value: num(p.value),
        status: p.status,
        billing_type: p.billing_type,
        due_date: p.due_date,
        payment_date: p.payment_date,
        plano: p.plano,
        professor: cli?.professor ?? p.professor ?? null,
        aluno: cli?.name ?? null,
        credit_date: creditDate ? creditDate.slice(0, 10) : null,
      }
    })

    // Opções de filtro (antes de aplicar filtros)
    const filtrosDisponiveis = {
      professores: [...new Set(rows.map(r => r.professor?.trim()).filter(Boolean))].sort() as string[],
      planos: [...new Set(rows.map(r => r.plano?.trim()).filter(Boolean))].sort() as string[],
      formas: [...new Set(rows.map(r => BILLING_LABEL[r.billing_type ?? ""] ?? r.billing_type).filter(Boolean))].sort() as string[],
    }

    // Período + filtros adicionais
    let elegiveis = filtrarRecebidasNoPeriodo(rows, de, ate)
    if (fProfessor) elegiveis = elegiveis.filter(r => (r.professor?.trim() || "Sem professor") === fProfessor)
    if (fPlano) elegiveis = elegiveis.filter(r => (r.plano?.trim() || "Sem plano") === fPlano)
    if (fForma) elegiveis = elegiveis.filter(r => (BILLING_LABEL[r.billing_type ?? ""] ?? r.billing_type ?? "Indefinido") === fForma)

    if (tipo === "repasse") {
      const cfg = await loadRepasseConfig(supabase)
      const r = calcularRepasse(elegiveis, cfg)
      return NextResponse.json({
        tipo, de, ate, filtrosDisponiveis,
        sintetico: r.grupos,
        analitico: r.analitico,
        totais: { bruto: r.totalBruto, taxa: r.totalTaxa, repasse: r.totalRepasse, qtd: r.analitico.length },
      })
    }

    // Carteira
    const agg = agregarCarteira(elegiveis, agrupar)
    const analitico = elegiveis
      .map(r => ({
        professor: r.professor?.trim() || "Sem professor",
        aluno: r.aluno, plano: r.plano, due_date: r.due_date, credit_date: r.credit_date,
        forma: BILLING_LABEL[r.billing_type ?? ""] ?? r.billing_type ?? "Indefinido",
        value: r.value,
      }))
      .sort((a, b) => (b.credit_date ?? "").localeCompare(a.credit_date ?? ""))

    return NextResponse.json({
      tipo, de, ate, agrupar, filtrosDisponiveis,
      sintetico: agg.grupos,
      analitico,
      totais: { total: agg.totalGeral, qtd: agg.qtdGeral },
    })
  } catch (err) {
    console.error("[relatorios] erro:", err)
    return NextResponse.json({ error: "Erro ao gerar relatório" }, { status: 500 })
  }
}
