import { headers } from "next/headers"
import { AlertTriangle } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StatusBadge } from "@/components/admin/status-badge"
import { WhatsAppButton } from "@/components/admin/whatsapp-button"

interface Alerta {
  id: string
  nome: string
  celular: string | null
  plano: string | null
  professor: string | null
  totalVencido: number
  totalPendente: number
  status: string
  acaoRecomendada: string
}

export const dynamic = "force-dynamic"
export const metadata = { title: "Alertas · PACE 360" }

function fmtBRL(v: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v ?? 0)
}

async function getAlertas(): Promise<Alerta[]> {
  const h = await headers()
  const host = h.get("host")!
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https")
  const cookie = h.get("cookie") ?? ""
  const res = await fetch(`${proto}://${host}/api/admin/dashboard`, {
    headers: { cookie },
    cache: "no-store",
  })
  if (!res.ok) throw new Error(`Dashboard API: ${res.status}`)
  const data = await res.json()
  return data.alertas as Alerta[]
}

export default async function AlertasPage() {
  const alertas = await getAlertas()
  const vencidos = alertas.filter(a => a.status === "Vencido")
  const pendentes = alertas.filter(a => a.status === "Pendente")

  return (
    <div className="min-h-full p-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white">Alertas</h1>
        <p className="text-xs text-white/50 mt-0.5">
          {vencidos.length} vencidos · {pendentes.length} pendentes
        </p>
      </div>

      {alertas.length === 0 ? (
        <Card className="bg-zinc-950 border-zinc-900">
          <CardContent className="p-12 text-center">
            <p className="text-emerald-400 text-base">✓ Tudo em ordem</p>
            <p className="text-xs text-white/40 mt-2">Nenhum aluno com cobrança vencida ou pendente.</p>
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-zinc-950 border-zinc-900">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-white flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              Alunos com pendência
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
                  <TableHead className="text-white/60">Ação recomendada</TableHead>
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
                    <TableCell>
                      <StatusBadge status={a.status} />
                    </TableCell>
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
    </div>
  )
}
