import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = createAdminClient()

    const [alunoRes, cobrancasRes] = await Promise.all([
      supabase
        .from("asaas_customers_sync")
        .select("*")
        .eq("id", id)
        .single(),
      supabase
        .from("payments")
        .select(
          "id, asaas_id, value, net_value, due_date, payment_date, status, situacao_display, billing_type, plano, parcela_numero, parcela_total, cupom, description, subscription_id, installment_id, ultimo_evento"
        )
        .eq("customer_asaas_id",
          // buscar asaas_id via subquery
          supabase.from("asaas_customers_sync").select("asaas_id").eq("id", id).single()
            .then(r => r.data?.asaas_id ?? "")
        )
        .eq("deleted", false)
        .order("due_date", { ascending: false }),
    ])

    if (alunoRes.error) throw alunoRes.error

    // Refetch cobrancas usando o asaas_id real
    const asaasId = alunoRes.data.asaas_id
    const { data: cobrancas, error: cobErr } = await supabase
      .from("payments")
      .select(
        "id, asaas_id, value, net_value, due_date, payment_date, status, situacao_display, billing_type, plano, parcela_numero, parcela_total, cupom, description, subscription_id, installment_id, ultimo_evento"
      )
      .eq("customer_asaas_id", asaasId)
      .eq("deleted", false)
      .order("due_date", { ascending: false })

    if (cobErr) throw cobErr

    return NextResponse.json({ aluno: alunoRes.data, cobrancas: cobrancas ?? [] })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error("[admin/alunos/id] erro:", msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
