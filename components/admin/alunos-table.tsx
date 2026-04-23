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
import { StatusBadge } from "./status-badge"
import { WhatsAppButton } from "./whatsapp-button"
import type { AlunoDashboard } from "@/app/api/admin/dashboard/route"

const STATUS_OPTIONS = ["Todos", "Em dia", "Pendente", "Vencido"] as const

function fmtBRL(v: number | null | undefined) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(v ?? 0))
}

export function AlunosTable({ alunos }: { alunos: AlunoDashboard[] }) {
  const [busca, setBusca] = useState("")
  const [status, setStatus] = useState<typeof STATUS_OPTIONS[number]>("Todos")

  const filtrados = useMemo(() => {
    let list = alunos
    if (status !== "Todos") list = list.filter(a => a.status_pagamento === status)
    if (busca.trim()) {
      const q = busca.toLowerCase()
      list = list.filter(a =>
        a.name.toLowerCase().includes(q) ||
        (a.email ?? "").toLowerCase().includes(q) ||
        (a.professor ?? "").toLowerCase().includes(q)
      )
    }
    return list
  }, [alunos, busca, status])

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-white/40" />
          <Input
            value={busca}
            onChange={e => setBusca(e.target.value)}
            placeholder="Buscar por nome, email ou professor..."
            className="pl-8 bg-zinc-900 border-zinc-800 text-white text-sm h-9"
          />
        </div>
        <div className="flex gap-1">
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
        <span className="ml-auto text-xs text-white/50">{filtrados.length} alunos</span>
      </div>

      <div className="rounded-lg border border-zinc-900 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-zinc-900 hover:bg-transparent">
              <TableHead className="text-white/60">Aluno</TableHead>
              <TableHead className="text-white/60">Plano</TableHead>
              <TableHead className="text-white/60">Professor</TableHead>
              <TableHead className="text-white/60 text-right">Mensalidade</TableHead>
              <TableHead className="text-white/60 text-right">Pago</TableHead>
              <TableHead className="text-white/60 text-right">Pendente</TableHead>
              <TableHead className="text-white/60 text-right">Vencido</TableHead>
              <TableHead className="text-white/60">Status</TableHead>
              <TableHead className="text-white/60"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtrados.length === 0 && (
              <TableRow className="border-zinc-900">
                <TableCell colSpan={9} className="text-center text-white/40 py-12">
                  Nenhum aluno encontrado.
                </TableCell>
              </TableRow>
            )}
            {filtrados.map(a => (
              <TableRow key={a.id} className="border-zinc-900 hover:bg-zinc-900/30">
                <TableCell>
                  <div>
                    <p className="text-sm font-medium text-white">{a.name}</p>
                    {a.email && <p className="text-[11px] text-white/40">{a.email}</p>}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm text-white/80">{a.plano ?? "—"}</span>
                    {a.tem_desconto && (
                      <Badge variant="outline" className="bg-amber-500/10 text-amber-400 border-amber-500/30 text-[10px] px-1.5 py-0">
                        desc.
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-sm text-white/70">{a.professor ?? "—"}</TableCell>
                <TableCell className="text-sm text-white/80 text-right tabular-nums">
                  {fmtBRL(a.valor_mensalidade)}
                </TableCell>
                <TableCell className="text-sm text-emerald-400 text-right tabular-nums">
                  {fmtBRL(a.total_recebido)}
                </TableCell>
                <TableCell className="text-sm text-amber-400 text-right tabular-nums">
                  {Number(a.total_pendente) > 0 ? fmtBRL(a.total_pendente) : "—"}
                </TableCell>
                <TableCell className="text-sm text-red-400 text-right tabular-nums">
                  {Number(a.total_vencido) > 0 ? fmtBRL(a.total_vencido) : "—"}
                </TableCell>
                <TableCell>
                  <StatusBadge status={a.status_pagamento} />
                </TableCell>
                <TableCell>
                  {a.mobile_phone && a.status_pagamento !== "Em dia" && (
                    <WhatsAppButton
                      celular={a.mobile_phone}
                      nome={a.name}
                      valor={Number(a.total_vencido) || Number(a.total_pendente)}
                      status={a.status_pagamento}
                    />
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
