"use client"

import { useMemo, useState } from "react"
import { Search } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import type { Cobranca } from "@/app/api/admin/cobrancas/route"

const STATUS_OPTIONS = ["Todas", "PENDING", "RECEIVED", "CONFIRMED", "OVERDUE", "REFUNDED"] as const

function fmtBRL(v: number | null | undefined) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(v ?? 0))
}

function fmtDate(iso: string | null) {
  if (!iso) return "—"
  const [y, m, d] = iso.slice(0, 10).split("-")
  return `${d}/${m}/${y}`
}

function statusBadgeClass(status: string) {
  if (["RECEIVED", "CONFIRMED", "RECEIVED_IN_CASH"].includes(status))
    return "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
  if (status === "PENDING") return "bg-amber-500/15 text-amber-400 border-amber-500/30"
  if (status === "OVERDUE") return "bg-red-500/15 text-red-400 border-red-500/30"
  return "bg-zinc-500/15 text-zinc-400 border-zinc-500/30"
}

export function CobrancasTable({ cobrancas }: { cobrancas: Cobranca[] }) {
  const [busca, setBusca] = useState("")
  const [status, setStatus] = useState<typeof STATUS_OPTIONS[number]>("Todas")

  const filtradas = useMemo(() => {
    let list = cobrancas
    if (status !== "Todas") list = list.filter(c => c.status === status)
    if (busca.trim()) {
      const q = busca.toLowerCase()
      list = list.filter(c =>
        (c.customer_name ?? "").toLowerCase().includes(q) ||
        (c.professor ?? "").toLowerCase().includes(q) ||
        (c.cupom ?? "").toLowerCase().includes(q) ||
        c.asaas_id.toLowerCase().includes(q)
      )
    }
    return list
  }, [cobrancas, busca, status])

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-white/40" />
          <Input
            value={busca}
            onChange={e => setBusca(e.target.value)}
            placeholder="Buscar por aluno, professor, cupom..."
            className="pl-8 bg-zinc-900 border-zinc-800 text-white text-sm h-9"
          />
        </div>
        <div className="flex gap-1 flex-wrap">
          {STATUS_OPTIONS.map(opt => (
            <button
              key={opt}
              onClick={() => setStatus(opt)}
              className={`px-3 py-1.5 text-xs rounded-md border transition ${
                status === opt
                  ? "bg-white text-black border-white"
                  : "bg-zinc-900 text-white/70 border-zinc-800 hover:text-white"
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
        <span className="ml-auto text-xs text-white/50">{filtradas.length} cobranças</span>
      </div>

      <div className="rounded-lg border border-zinc-900 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-zinc-900 hover:bg-transparent">
              <TableHead className="text-white/60">Aluno</TableHead>
              <TableHead className="text-white/60">Plano</TableHead>
              <TableHead className="text-white/60">Vencimento</TableHead>
              <TableHead className="text-white/60">Pagamento</TableHead>
              <TableHead className="text-white/60 text-right">Valor</TableHead>
              <TableHead className="text-white/60">Tipo</TableHead>
              <TableHead className="text-white/60">Parcela</TableHead>
              <TableHead className="text-white/60">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtradas.length === 0 && (
              <TableRow className="border-zinc-900">
                <TableCell colSpan={8} className="text-center text-white/40 py-12">
                  Nenhuma cobrança encontrada.
                </TableCell>
              </TableRow>
            )}
            {filtradas.map(c => (
              <TableRow key={c.id} className="border-zinc-900 hover:bg-zinc-900/30">
                <TableCell>
                  <p className="text-sm font-medium text-white">{c.customer_name ?? "—"}</p>
                  <p className="text-[10px] text-white/40 font-mono">{c.asaas_id}</p>
                </TableCell>
                <TableCell className="text-sm text-white/70">{c.plano ?? "—"}</TableCell>
                <TableCell className="text-sm text-white/70 tabular-nums">{fmtDate(c.due_date)}</TableCell>
                <TableCell className="text-sm text-white/70 tabular-nums">{fmtDate(c.payment_date)}</TableCell>
                <TableCell className="text-sm text-white/90 text-right tabular-nums">{fmtBRL(c.value)}</TableCell>
                <TableCell className="text-xs text-white/60">{c.billing_type}</TableCell>
                <TableCell className="text-sm text-white/70 tabular-nums">
                  {c.parcela_numero && c.parcela_total ? `${c.parcela_numero}/${c.parcela_total}` : "—"}
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={statusBadgeClass(c.status)}>
                    {c.situacao_display ?? c.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
