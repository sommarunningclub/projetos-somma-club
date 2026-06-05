import { type NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { loadRepasseConfig } from "@/lib/relatorios/repasse-config"
import { expandirCompetencias, calendarioAno, detalheMes, type CompPayment } from "@/lib/relatorios/competencia"

export const dynamic = "force-dynamic"
export const maxDuration = 60

export async function GET(request: NextRequest) {
  try {
    const sp = request.nextUrl.searchParams
    const ano = sp.get("ano") || String(new Date().getFullYear())
    const mesDetalhe = sp.get("mes") || "" // YYYY-MM opcional

    const supabase = createAdminClient()
    const { data: clientes } = await supabase
      .from("asaas_customers_sync")
      .select("asaas_id, name, professor")
      .eq("deleted", false)
    const clienteMap = new Map((clientes ?? []).map(c => [c.asaas_id, c]))

    // Considera cobranças não-deletadas e não estornadas (todos os status restantes)
    const { data: pagamentos } = await supabase
      .from("payments")
      .select("asaas_id, customer_asaas_id, value, status, due_date, payment_date, plano, professor, raw_data")
      .eq("deleted", false)
      .neq("status", "REFUNDED")
      .limit(8000)

    const num = (x: unknown) => { const n = Number(x); return Number.isFinite(n) ? n : 0 }

    const rows: CompPayment[] = (pagamentos ?? []).map(p => {
      const cli = p.customer_asaas_id ? clienteMap.get(p.customer_asaas_id) : null
      const raw = (p.raw_data ?? {}) as Record<string, unknown>
      const credit = (raw.creditDate as string | undefined) ?? p.payment_date ?? (raw.estimatedCreditDate as string | undefined) ?? null
      return {
        asaas_id: p.asaas_id,
        customer_asaas_id: p.customer_asaas_id,
        professor: cli?.professor ?? p.professor ?? null,
        aluno: cli?.name ?? null,
        plano: p.plano,
        value: num(p.value),
        status: p.status,
        due_date: p.due_date ? p.due_date.slice(0, 10) : null,
        credit_date: credit ? credit.slice(0, 10) : null,
      }
    })

    const cfg = await loadRepasseConfig(supabase)
    const items = expandirCompetencias(rows)
    const calendario = calendarioAno(items, cfg, ano)
    const detalhe = mesDetalhe ? detalheMes(items, cfg, mesDetalhe) : []

    return NextResponse.json({ ano, ...calendario, mesDetalhe, detalhe })
  } catch (err) {
    console.error("[competencia] erro:", err)
    return NextResponse.json({ error: "Erro ao gerar calendário" }, { status: 500 })
  }
}
