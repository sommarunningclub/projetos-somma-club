import { type NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { loadRepasseConfig, saveRepasseConfig } from "@/lib/relatorios/repasse-config"
import type { RepasseConfig } from "@/lib/relatorios/calculo"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const supabase = createAdminClient()
    const cfg = await loadRepasseConfig(supabase)
    // lista de professores conhecidos (grupos) para montar a tela
    const { data: clientes } = await supabase
      .from("asaas_customers_sync")
      .select("professor")
      .eq("deleted", false)
    const professores = [...new Set((clientes ?? []).map(c => c.professor?.trim()).filter(Boolean))].sort() as string[]
    return NextResponse.json({ config: cfg, professores })
  } catch (err) {
    console.error("[repasse-config] GET erro:", err)
    return NextResponse.json({ error: "Erro ao carregar configuração" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as RepasseConfig
    if (typeof body?.taxaPadrao !== "number" || body.taxaPadrao < 0 || !Number.isFinite(body.taxaPadrao) || typeof body?.professores !== "object" || body.professores === null) {
      return NextResponse.json({ error: "Configuração inválida" }, { status: 400 })
    }
    const supabase = createAdminClient()
    await saveRepasseConfig(supabase, body)
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("[repasse-config] POST erro:", err)
    return NextResponse.json({ error: "Erro ao salvar configuração" }, { status: 500 })
  }
}
