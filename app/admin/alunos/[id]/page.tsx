import { headers } from "next/headers"
import { notFound } from "next/navigation"
import Link from "next/link"
import {
  ArrowLeft, User, CreditCard, Tag, Shirt,
  Phone, Mail, MapPin, Calendar, TrendingUp,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { StatusBadge } from "@/components/admin/status-badge"
import { WhatsAppButton } from "@/components/admin/whatsapp-button"
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow,
} from "@/components/ui/table"

export const dynamic = "force-dynamic"

function fmtBRL(v: number | null | undefined) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(v ?? 0))
}

function fmtDate(iso: string | null | undefined) {
  if (!iso) return "—"
  const [y, m, d] = iso.slice(0, 10).split("-")
  return `${d}/${m}/${y}`
}

function statusBadgeClass(status: string) {
  if (["RECEIVED", "CONFIRMED", "RECEIVED_IN_CASH"].includes(status))
    return "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
  if (status === "PENDING") return "bg-amber-500/15 text-amber-400 border-amber-500/30"
  if (status === "OVERDUE") return "bg-red-500/15 text-red-400 border-red-500/30"
  if (status === "REFUNDED") return "bg-zinc-500/15 text-zinc-400 border-zinc-500/30"
  return "bg-zinc-500/15 text-zinc-400 border-zinc-500/30"
}

function InfoRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-7 h-7 rounded-md bg-zinc-900 flex items-center justify-center shrink-0 mt-0.5">
        <Icon className="w-3.5 h-3.5 text-white/50" />
      </div>
      <div>
        <p className="text-[10px] text-white/40 uppercase tracking-wider">{label}</p>
        <div className="text-sm text-white mt-0.5">{value ?? "—"}</div>
      </div>
    </div>
  )
}

function StatCard({ label, value, sub, color }: { label: string; value: string; sub?: string; color?: string }) {
  return (
    <div className="bg-zinc-900 rounded-lg p-4">
      <p className="text-[10px] uppercase tracking-widest text-white/50">{label}</p>
      <p className="text-xl font-bold mt-1" style={{ color: color ?? "#fff" }}>{value}</p>
      {sub && <p className="text-xs text-white/40 mt-0.5">{sub}</p>}
    </div>
  )
}

async function getAluno(id: string) {
  const h = await headers()
  const host = h.get("host")!
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https")
  const cookie = h.get("cookie") ?? ""
  const res = await fetch(`${proto}://${host}/api/admin/alunos/${id}`, {
    headers: { cookie },
    cache: "no-store",
  })
  if (res.status === 404) return null
  if (!res.ok) throw new Error(`Erro ${res.status}`)
  return res.json()
}

export default async function AlunoDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const data = await getAluno(id)
  if (!data) notFound()

  const { aluno, cobrancas } = data as {
    aluno: Record<string, unknown>
    cobrancas: Array<Record<string, unknown>>
  }

  const name = aluno.name as string
  const statusPag = (aluno.status_pagamento as string) ?? "Em dia"
  const totalRecebido = Number(aluno.total_recebido ?? 0)
  const totalPendente = Number(aluno.total_pendente ?? 0)
  const totalVencido = Number(aluno.total_vencido ?? 0)
  const valorMensalidade = Number(aluno.valor_mensalidade ?? 0)
  const valorTabela = Number(aluno.valor_tabela ?? 0)
  const temDesconto = aluno.tem_desconto as boolean

  // Agrupar cobranças por mês/ano para timeline
  const cobrancasPorMes = cobrancas.reduce((acc, c) => {
    const key = (c.due_date as string)?.slice(0, 7) ?? "?"
    if (!acc[key]) acc[key] = []
    acc[key].push(c)
    return acc
  }, {} as Record<string, typeof cobrancas>)

  const meses = Object.keys(cobrancasPorMes).sort((a, b) => b.localeCompare(a))

  return (
    <div className="min-h-full p-6 space-y-6 max-w-6xl">
      {/* Voltar + header */}
      <div>
        <Link
          href="/admin/alunos"
          className="inline-flex items-center gap-1.5 text-xs text-white/50 hover:text-white transition mb-4"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Voltar para Alunos
        </Link>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-white">{name}</h1>
              <StatusBadge status={statusPag} />
              {temDesconto && (
                <Badge variant="outline" className="bg-amber-500/10 text-amber-400 border-amber-500/30 text-xs">
                  Desconto ativo
                </Badge>
              )}
            </div>
            <p className="text-sm text-white/50 mt-1">
              {aluno.plano as string ?? "Plano não definido"} · Professor: {aluno.professor as string ?? "—"}
            </p>
          </div>
          {aluno.mobile_phone && statusPag !== "Em dia" && (
            <WhatsAppButton
              celular={aluno.mobile_phone as string}
              nome={name}
              valor={totalVencido || totalPendente}
              status={statusPag}
            />
          )}
        </div>
      </div>

      {/* Stats financeiros */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard
          label="Mensalidade"
          value={fmtBRL(valorMensalidade)}
          sub={temDesconto ? `tabela: ${fmtBRL(valorTabela)}` : "no desconto"}
          color={temDesconto ? "#fb923c" : "#fff"}
        />
        <StatCard label="Total recebido" value={fmtBRL(totalRecebido)} color="#34d399" />
        <StatCard
          label="Pendente"
          value={totalPendente > 0 ? fmtBRL(totalPendente) : "—"}
          color={totalPendente > 0 ? "#fbbf24" : "#fff"}
        />
        <StatCard
          label="Vencido"
          value={totalVencido > 0 ? fmtBRL(totalVencido) : "—"}
          color={totalVencido > 0 ? "#f87171" : "#fff"}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Dados pessoais */}
        <Card className="bg-zinc-950 border-zinc-900">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-white flex items-center gap-2">
              <User className="w-4 h-4" style={{ color: "#ff2c03" }} />
              Dados pessoais
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <InfoRow icon={Mail} label="Email" value={aluno.email as string} />
            <InfoRow icon={Phone} label="Celular" value={aluno.mobile_phone as string} />
            <InfoRow icon={User} label="CPF/CNPJ" value={aluno.cpf_cnpj as string} />
            <InfoRow
              icon={MapPin}
              label="Endereço"
              value={
                aluno.address
                  ? `${aluno.address as string}${aluno.address_number ? `, ${aluno.address_number}` : ""}${aluno.city ? ` · ${aluno.city}/${aluno.state}` : ""}`
                  : null
              }
            />
            <InfoRow icon={Calendar} label="CEP" value={aluno.postal_code as string} />
          </CardContent>
        </Card>

        {/* Dados do plano */}
        <Card className="bg-zinc-950 border-zinc-900">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-white flex items-center gap-2">
              <CreditCard className="w-4 h-4" style={{ color: "#ff2c03" }} />
              Plano & pagamento
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <InfoRow icon={TrendingUp} label="Plano" value={aluno.plano as string} />
            <InfoRow icon={CreditCard} label="Forma de pagamento" value={aluno.forma_pagamento as string} />
            <InfoRow
              icon={Tag}
              label="Mensalidade"
              value={
                <span className="flex items-center gap-2">
                  {fmtBRL(valorMensalidade)}
                  {temDesconto && (
                    <span className="text-xs text-white/40 line-through">{fmtBRL(valorTabela)}</span>
                  )}
                </span>
              }
            />
            {aluno.cupom && (
              <InfoRow
                icon={Tag}
                label="Cupom usado"
                value={
                  <Badge variant="outline" className="bg-amber-500/10 text-amber-400 border-amber-500/30">
                    {aluno.cupom as string}
                  </Badge>
                }
              />
            )}
            <InfoRow icon={User} label="Professor" value={aluno.professor as string} />
            <InfoRow icon={Shirt} label="Camiseta" value={aluno.tamanho_camiseta as string} />
            <InfoRow
              icon={Calendar}
              label="Última sincronização"
              value={fmtDate(aluno.last_synced_at as string)}
            />
          </CardContent>
        </Card>

        {/* Resumo de cobranças */}
        <Card className="bg-zinc-950 border-zinc-900">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4" style={{ color: "#ff2c03" }} />
              Resumo de cobranças
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {[
                { label: "Total de cobranças", value: cobrancas.length },
                { label: "Pagas", value: cobrancas.filter(c => ["RECEIVED","CONFIRMED","RECEIVED_IN_CASH"].includes(c.status as string)).length, color: "#34d399" },
                { label: "Pendentes", value: cobrancas.filter(c => c.status === "PENDING").length, color: "#fbbf24" },
                { label: "Vencidas", value: cobrancas.filter(c => c.status === "OVERDUE").length, color: "#f87171" },
                { label: "Estornadas", value: cobrancas.filter(c => c.status === "REFUNDED").length, color: "#a1a1aa" },
              ].map(row => (
                <div key={row.label} className="flex items-center justify-between py-1.5 border-b border-zinc-900 last:border-0">
                  <span className="text-sm text-white/60">{row.label}</span>
                  <span className="text-sm font-medium" style={{ color: row.color ?? "#fff" }}>
                    {row.value}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Timeline de pagamentos mensais */}
      <Card className="bg-zinc-950 border-zinc-900">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-white flex items-center gap-2">
            <Calendar className="w-4 h-4" style={{ color: "#ff2c03" }} />
            Histórico de cobranças
          </CardTitle>
        </CardHeader>
        <CardContent>
          {meses.length === 0 ? (
            <p className="text-white/40 text-sm text-center py-8">
              Nenhuma cobrança encontrada. Faça uma sincronização.
            </p>
          ) : (
            <div className="space-y-6">
              {meses.map(mes => {
                const [year, month] = mes.split("-")
                const mesLabel = new Date(Number(year), Number(month) - 1).toLocaleDateString("pt-BR", { month: "long", year: "numeric" })
                const cobs = cobrancasPorMes[mes]
                return (
                  <div key={mes}>
                    <p className="text-xs font-medium text-white/50 uppercase tracking-wider mb-2 capitalize">
                      {mesLabel}
                    </p>
                    <Table>
                      <TableHeader>
                        <TableRow className="border-zinc-900 hover:bg-transparent">
                          <TableHead className="text-white/50 text-xs">Vencimento</TableHead>
                          <TableHead className="text-white/50 text-xs">Pagamento</TableHead>
                          <TableHead className="text-white/50 text-xs text-right">Valor</TableHead>
                          <TableHead className="text-white/50 text-xs">Tipo</TableHead>
                          <TableHead className="text-white/50 text-xs">Parcela</TableHead>
                          <TableHead className="text-white/50 text-xs">Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {cobs.map(c => (
                          <TableRow key={c.id as number} className="border-zinc-900 hover:bg-zinc-900/30">
                            <TableCell className="text-sm text-white/80 tabular-nums">{fmtDate(c.due_date as string)}</TableCell>
                            <TableCell className="text-sm text-white/60 tabular-nums">{fmtDate(c.payment_date as string | null)}</TableCell>
                            <TableCell className="text-sm text-white/90 text-right tabular-nums">{fmtBRL(c.value as number)}</TableCell>
                            <TableCell className="text-xs text-white/60">{c.billing_type as string}</TableCell>
                            <TableCell className="text-sm text-white/60 tabular-nums">
                              {c.parcela_numero && c.parcela_total ? `${c.parcela_numero}/${c.parcela_total}` : "—"}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className={statusBadgeClass(c.status as string)}>
                                {(c.situacao_display as string) ?? (c.status as string)}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
