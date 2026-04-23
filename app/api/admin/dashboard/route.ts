import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"

export interface AlunoDashboard {
  id: string
  asaas_id: string
  name: string
  email: string | null
  mobile_phone: string | null
  cpf_cnpj: string | null
  plano: string | null
  professor: string | null
  forma_pagamento: string | null
  valor_mensalidade: number | null
  valor_tabela: number | null
  tem_desconto: boolean
  cupom: string | null
  status_pagamento: "Em dia" | "Pendente" | "Vencido"
  total_recebido: number
  total_pendente: number
  total_vencido: number
}

export async function GET() {
  try {
    const supabase = createAdminClient()

    const [alunosRes, configRes] = await Promise.all([
      supabase
        .from("asaas_customers_sync")
        .select(
          "id, asaas_id, name, email, mobile_phone, cpf_cnpj, plano, professor, forma_pagamento, valor_mensalidade, valor_tabela, tem_desconto, cupom, status_pagamento, total_recebido, total_pendente, total_vencido"
        )
        .eq("deleted", false)
        .order("name"),
      supabase.from("pace360_config").select("chave, valor"),
    ])

    if (alunosRes.error) throw alunosRes.error

    const alunos = (alunosRes.data ?? []) as AlunoDashboard[]
    const configs = Object.fromEntries((configRes.data ?? []).map(c => [c.chave, c.valor]))

    const kpis = {
      totalAlunos: alunos.length,
      emDia: alunos.filter(a => a.status_pagamento === "Em dia").length,
      pendentes: alunos.filter(a => a.status_pagamento === "Pendente").length,
      vencidos: alunos.filter(a => a.status_pagamento === "Vencido").length,
      comDesconto: alunos.filter(a => a.tem_desconto).length,
      totalRecebido: alunos.reduce((s, a) => s + Number(a.total_recebido ?? 0), 0),
      totalPendente: alunos.reduce((s, a) => s + Number(a.total_pendente ?? 0), 0),
      totalVencido: alunos.reduce((s, a) => s + Number(a.total_vencido ?? 0), 0),
    }

    const planos = ["Mensal", "Semestral", "Semestral_avista", "Anual", "Anual_avista", "Avulso"]
    const porPlano = planos
      .map(plano => {
        const g = alunos.filter(a => a.plano === plano)
        return {
          plano,
          alunos: g.length,
          emDia: g.filter(a => a.status_pagamento === "Em dia").length,
          pendentes: g.filter(a => a.status_pagamento === "Pendente").length,
          vencidos: g.filter(a => a.status_pagamento === "Vencido").length,
          receitaRealizada: g.reduce((s, a) => s + Number(a.total_recebido ?? 0), 0),
          aReceber: g.reduce((s, a) => s + Number(a.total_pendente ?? 0), 0),
          comDesconto: g.filter(a => a.tem_desconto).length,
          pctEmDia:
            g.length > 0
              ? Math.round((g.filter(a => a.status_pagamento === "Em dia").length / g.length) * 100)
              : 0,
        }
      })
      .filter(p => p.alunos > 0)

    const alertas = alunos
      .filter(a => a.status_pagamento !== "Em dia")
      .map(a => ({
        id: a.id,
        nome: a.name,
        celular: a.mobile_phone,
        plano: a.plano,
        professor: a.professor,
        totalVencido: Number(a.total_vencido ?? 0),
        totalPendente: Number(a.total_pendente ?? 0),
        status: a.status_pagamento,
        acaoRecomendada:
          Number(a.total_vencido ?? 0) > 0
            ? "CONTATO URGENTE — Suspender acesso"
            : "Cobrar via WhatsApp",
      }))

    return NextResponse.json({
      kpis,
      porPlano,
      alunos,
      alertas,
      ultimaSync: configs.ultima_sync_asaas || null,
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error("[admin/dashboard] erro:", msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
