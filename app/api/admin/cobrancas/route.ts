import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"

export interface Cobranca {
  id: number
  asaas_id: string
  customer_asaas_id: string
  customer_name: string | null
  value: number
  net_value: number | null
  due_date: string
  payment_date: string | null
  status: string
  situacao_display: string | null
  billing_type: string
  plano: string | null
  professor: string | null
  cupom: string | null
  parcela_numero: number | null
  parcela_total: number | null
  description: string | null
}

export async function GET() {
  try {
    const supabase = createAdminClient()

    const [cobRes, alunosRes] = await Promise.all([
      supabase
        .from("payments")
        .select(
          "id, asaas_id, customer_asaas_id, value, net_value, due_date, payment_date, status, situacao_display, billing_type, plano, professor, cupom, parcela_numero, parcela_total, description"
        )
        .eq("deleted", false)
        .order("due_date", { ascending: false })
        .limit(500),
      supabase.from("asaas_customers_sync").select("asaas_id, name"),
    ])

    if (cobRes.error) throw cobRes.error

    const nomesByAsaasId = new Map(
      (alunosRes.data ?? []).map(a => [a.asaas_id, a.name as string])
    )

    const cobrancas: Cobranca[] = (cobRes.data ?? []).map(c => ({
      ...c,
      customer_name: nomesByAsaasId.get(c.customer_asaas_id) ?? null,
    }))

    return NextResponse.json({ cobrancas })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error("[admin/cobrancas] erro:", msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
