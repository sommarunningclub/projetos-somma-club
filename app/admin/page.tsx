import { headers } from "next/headers"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { KpiCard } from "@/components/admin/kpi-card"
import { SyncButton } from "@/components/admin/sync-button"
import { AlunosTable } from "@/components/admin/alunos-table"
import { StatusBadge } from "@/components/admin/status-badge"
import { WhatsAppButton } from "@/components/admin/whatsapp-button"
import type { AlunoDashboard } from "@/app/api/admin/dashboard/route"

interface DashboardData {
  kpis: {
    totalAlunos: number
    emDia: number
    pendentes: number
    vencidos: number
    comDesconto: number
    totalRecebido: number
    totalPendente: number
    totalVencido: number
  }
  porPlano: Array<{
    plano: string
    alunos: number
    emDia: number
    pendentes: number
    vencidos: number
    receitaRealizada: number
    aReceber: number
    comDesconto: number
    pctEmDia: number
  }>
  alunos: AlunoDashboard[]
  alertas: Array<{
    id: string
    nome: string
    celular: string | null
    plano: string | null
    professor: string | null
    totalVencido: number
    totalPendente: number
    status: string
    acaoRecomendada: string
  }>
  ultimaSync: string | null
}

function fmtBRL(v: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v ?? 0)
}

function fmtRelativeDate(iso: string | null) {
  if (!iso) return "nunca"
  const d = new Date(iso)
  const diff = Date.now() - d.getTime()
  const min = Math.floor(diff / 60000)
  if (min < 1) return "agora"
  if (min < 60) return `há ${min} min`
  const h = Math.floor(min / 60)
  if (h < 24) return `há ${h}h`
  const days = Math.floor(h / 24)
  return `há ${days}d`
}

async function getDashboardData(): Promise<DashboardData> {
  const h = await headers()
  const host = h.get("host")!
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https")
  const cookie = h.get("cookie") ?? ""
  const res = await fetch(`${proto}://${host}/api/admin/dashboard`, {
    headers: { cookie },
    cache: "no-store",
  })
  if (!res.ok) throw new Error(`Dashboard API: ${res.status}`)
  return res.json()
}

export const dynamic = "force-dynamic"

export default async function AdminDashboardPage() {
  const data = await getDashboardData()
  const { kpis, porPlano, alunos, alertas, ultimaSync } = data

  return (
    <div className="min-h-full p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white">Dashboard</h1>
          <p className="text-xs text-white/50 mt-0.5">
            Última sincronização: {fmtRelativeDate(ultimaSync)}
          </p>
        </div>
        <SyncButton />
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <KpiCard label="Total Alunos" value={kpis.totalAlunos} accent="primary" />
        <KpiCard label="Em Dia"       value={kpis.emDia}       accent="success" />
        <KpiCard label="Pendentes"    value={kpis.pendentes}   accent="warning" />
        <KpiCard label="Vencidos"     value={kpis.vencidos}    accent="error" />
        <KpiCard label="Recebido"     value={fmtBRL(kpis.totalRecebido)} sub="confirmado" accent="success" />
        <KpiCard label="A Receber"    value={fmtBRL(kpis.totalPendente)} sub="pendente"   accent="primary" />
      </div>

      {/* Distribuição por Plano */}
      <Card className="bg-zinc-950 border-zinc-900">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-white">Distribuição por plano</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-zinc-900 hover:bg-transparent">
                <TableHead className="text-white/60">Plano</TableHead>
                <TableHead className="text-white/60 text-right">Alunos</TableHead>
                <TableHead className="text-white/60 text-right">Em dia</TableHead>
                <TableHead className="text-white/60 text-right">Pendentes</TableHead>
                <TableHead className="text-white/60 text-right">Vencidos</TableHead>
                <TableHead className="text-white/60 text-right">Receita</TableHead>
                <TableHead className="text-white/60 text-right">A receber</TableHead>
                <TableHead className="text-white/60 text-right">% Em dia</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {porPlano.length === 0 && (
                <TableRow className="border-zinc-900">
                  <TableCell colSpan={8} className="text-center text-white/40 py-8">
                    Sem dados. Clique em "Sincronizar Asaas" para iniciar.
                  </TableCell>
                </TableRow>
              )}
              {porPlano.map(p => (
                <TableRow key={p.plano} className="border-zinc-900 hover:bg-zinc-900/30">
                  <TableCell className="text-sm text-white">{p.plano}</TableCell>
                  <TableCell className="text-sm text-white/80 text-right tabular-nums">{p.alunos}</TableCell>
                  <TableCell className="text-sm text-emerald-400 text-right tabular-nums">{p.emDia}</TableCell>
                  <TableCell className="text-sm text-amber-400 text-right tabular-nums">{p.pendentes}</TableCell>
                  <TableCell className="text-sm text-red-400 text-right tabular-nums">{p.vencidos}</TableCell>
                  <TableCell className="text-sm text-white/80 text-right tabular-nums">{fmtBRL(p.receitaRealizada)}</TableCell>
                  <TableCell className="text-sm text-white/80 text-right tabular-nums">{fmtBRL(p.aReceber)}</TableCell>
                  <TableCell className="text-sm text-white/80 text-right tabular-nums">{p.pctEmDia}%</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Alertas */}
      {alertas.length > 0 && (
        <Card className="bg-zinc-950 border-zinc-900">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-white">
              Alertas ({alertas.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="border-zinc-900 hover:bg-transparent">
                  <TableHead className="text-white/60">Aluno</TableHead>
                  <TableHead className="text-white/60">Plano</TableHead>
                  <TableHead className="text-white/60">Professor</TableHead>
                  <TableHead className="text-white/60 text-right">Vencido</TableHead>
                  <TableHead className="text-white/60 text-right">Pendente</TableHead>
                  <TableHead className="text-white/60">Status</TableHead>
                  <TableHead className="text-white/60">Ação</TableHead>
                  <TableHead className="text-white/60"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {alertas.map(a => (
                  <TableRow key={a.id} className="border-zinc-900 hover:bg-zinc-900/30">
                    <TableCell className="text-sm text-white">{a.nome}</TableCell>
                    <TableCell className="text-sm text-white/70">{a.plano ?? "—"}</TableCell>
                    <TableCell className="text-sm text-white/70">{a.professor ?? "—"}</TableCell>
                    <TableCell className="text-sm text-red-400 text-right tabular-nums">
                      {a.totalVencido > 0 ? fmtBRL(a.totalVencido) : "—"}
                    </TableCell>
                    <TableCell className="text-sm text-amber-400 text-right tabular-nums">
                      {a.totalPendente > 0 ? fmtBRL(a.totalPendente) : "—"}
                    </TableCell>
                    <TableCell><StatusBadge status={a.status} /></TableCell>
                    <TableCell className="text-xs text-white/60">{a.acaoRecomendada}</TableCell>
                    <TableCell>
                      {a.celular && (
                        <WhatsAppButton
                          celular={a.celular}
                          nome={a.nome}
                          valor={a.totalVencido || a.totalPendente}
                          status={a.status}
                        />
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Alunos */}
      <Card className="bg-zinc-950 border-zinc-900">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-white">Alunos</CardTitle>
        </CardHeader>
        <CardContent>
          <AlunosTable alunos={alunos} />
        </CardContent>
      </Card>
    </div>
  )
}
