import { type NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { loadRepasseConfig } from "@/lib/relatorios/repasse-config"
import {
  filtrarMes, resumoPorProfessor, agendaReceber, type VGPayment,
} from "@/lib/relatorios/visao-geral"

export const dynamic = "force-dynamic"
export const maxDuration = 60

function mesAtual(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
}

export async function GET(request: NextRequest) {
  try {
    const mes = request.nextUrl.searchParams.get("mes") || mesAtual()
    const supabase = createAdminClient()

    const { data: clientes } = await supabase
      .from("asaas_customers_sync")
      .select("asaas_id, name, professor")
      .eq("deleted", false)
    const clienteMap = new Map((clientes ?? []).map(c => [c.asaas_id, c]))

    // Todas as cobranças não-deletadas (todos os status); classificação acontece na lógica pura.
    const { data: pagamentos } = await supabase
      .from("payments")
      .select("asaas_id, customer_asaas_id, value, status, due_date, payment_date, plano, professor, raw_data")
      .eq("deleted", false)
      .limit(8000)

    const num = (x: unknown) => { const n = Number(x); return Number.isFinite(n) ? n : 0 }

    const rows: VGPayment[] = (pagamentos ?? []).map(p => {
      const cli = p.customer_asaas_id ? clienteMap.get(p.customer_asaas_id) : null
      const raw = (p.raw_data ?? {}) as Record<string, unknown>
      const credit = (raw.creditDate as string | undefined) ?? p.payment_date ?? null
      const estimated = (raw.estimatedCreditDate as string | undefined) ?? null
      return {
        asaas_id: p.asaas_id,
        customer_asaas_id: p.customer_asaas_id,
        value: num(p.value),
        status: p.status,
        professor: cli?.professor ?? p.professor ?? null,
        aluno: cli?.name ?? null,
        plano: p.plano,
        due_date: p.due_date ? p.due_date.slice(0, 10) : null,
        credit_date: credit ? credit.slice(0, 10) : null,
        estimated_credit_date: estimated ? estimated.slice(0, 10) : null,
      }
    })

    const fProfessor = request.nextUrl.searchParams.get("professor") ?? ""

    // Professores conhecidos (grupos) — para o filtro e para exibir mesmo sem movimento
    const conhecidos = [...new Set((clientes ?? []).map(c => c.professor?.trim()).filter(Boolean))].sort() as string[]

    let doMes = filtrarMes(rows, mes)
    if (fProfessor) doMes = doMes.filter(r => (r.professor?.trim() || "Sem professor") === fProfessor)

    const cfg = await loadRepasseConfig(supabase)
    const resumo = resumoPorProfessor(doMes, cfg)

    // Garante que todo professor conhecido apareça (zerado) quando não filtrando
    if (!fProfessor) {
      const presentes = new Set(resumo.professores.map(p => p.professor))
      for (const nome of conhecidos) {
        if (!presentes.has(nome)) {
          resumo.professores.push({
            professor: nome, alunos: 0, cobrancas: 0, recebido: 0, aReceber: 0, vencido: 0,
            previsaoTotal: 0, taxaUnitaria: cfg.professores[nome]?.isento ? 0 : (cfg.professores[nome]?.taxa ?? cfg.taxaPadrao),
            taxaTotal: 0, repassePrevisto: 0,
          })
        }
      }
      resumo.professores.sort((a, b) => b.previsaoTotal - a.previsaoTotal || a.professor.localeCompare(b.professor))
    }

    const agenda = agendaReceber(doMes)

    return NextResponse.json({ mes, ...resumo, agenda, professoresDisponiveis: conhecidos })
  } catch (err) {
    console.error("[visao-geral] erro:", err)
    return NextResponse.json({ error: "Erro ao gerar visão geral" }, { status: 500 })
  }
}
