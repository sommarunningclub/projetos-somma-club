"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Search, SlidersHorizontal, X } from "lucide-react"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { StatusBadge } from "./status-badge"
import { WhatsAppButton } from "./whatsapp-button"
import type { AlunoDashboard } from "@/app/api/admin/dashboard/route"

function fmtBRL(v: number | null | undefined) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(v ?? 0))
}

type StatusFilter = "Todos" | "Em dia" | "Pendente" | "Vencido"
type PlanoFilter = "Todos" | "Mensal" | "Semestral" | "Anual" | "Avulso"
type DescontoFilter = "Todos" | "Com desconto" | "Sem desconto"

interface Filters {
  busca: string
  status: StatusFilter
  plano: PlanoFilter
  professor: string
  desconto: DescontoFilter
}

function FilterChip({
  label,
  active,
  onClick,
}: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 text-xs rounded-md border transition whitespace-nowrap ${
        active
          ? "bg-white text-black border-white font-medium"
          : "bg-zinc-900 text-white/60 border-zinc-800 hover:text-white"
      }`}
    >
      {label}
    </button>
  )
}

export function AlunosTable({ alunos }: { alunos: AlunoDashboard[] }) {
  const router = useRouter()

  const [filters, setFilters] = useState<Filters>({
    busca: "",
    status: "Todos",
    plano: "Todos",
    professor: "Todos",
    desconto: "Todos",
  })
  const [showFilters, setShowFilters] = useState(false)

  const set = <K extends keyof Filters>(key: K, val: Filters[K]) =>
    setFilters(f => ({ ...f, [key]: val }))

  const professores = useMemo(() => {
    const set = new Set(alunos.map(a => a.professor).filter(Boolean) as string[])
    return ["Todos", ...Array.from(set).sort()]
  }, [alunos])

  const hasActiveFilters =
    filters.busca || filters.status !== "Todos" || filters.plano !== "Todos" ||
    filters.professor !== "Todos" || filters.desconto !== "Todos"

  function resetFilters() {
    setFilters({ busca: "", status: "Todos", plano: "Todos", professor: "Todos", desconto: "Todos" })
  }

  const filtrados = useMemo(() => {
    let list = alunos
    if (filters.status !== "Todos") list = list.filter(a => a.status_pagamento === filters.status)
    if (filters.plano !== "Todos") {
      list = list.filter(a => {
        if (filters.plano === "Semestral") return a.plano?.startsWith("Semestral")
        if (filters.plano === "Anual") return a.plano?.startsWith("Anual")
        return a.plano === filters.plano
      })
    }
    if (filters.professor !== "Todos") list = list.filter(a => a.professor === filters.professor)
    if (filters.desconto === "Com desconto") list = list.filter(a => a.tem_desconto)
    if (filters.desconto === "Sem desconto") list = list.filter(a => !a.tem_desconto)
    if (filters.busca.trim()) {
      const q = filters.busca.toLowerCase()
      list = list.filter(a =>
        a.name.toLowerCase().includes(q) ||
        (a.email ?? "").toLowerCase().includes(q) ||
        (a.professor ?? "").toLowerCase().includes(q) ||
        (a.cupom ?? "").toLowerCase().includes(q) ||
        (a.plano ?? "").toLowerCase().includes(q)
      )
    }
    return list
  }, [alunos, filters])

  return (
    <div className="space-y-3">
      {/* Barra de busca + toggle filtros */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-white/40" />
          <Input
            value={filters.busca}
            onChange={e => set("busca", e.target.value)}
            placeholder="Buscar por nome, email, professor, cupom..."
            className="pl-8 bg-zinc-900 border-zinc-800 text-white text-sm h-9"
          />
        </div>
        <button
          onClick={() => setShowFilters(v => !v)}
          className={`flex items-center gap-1.5 px-3 py-2 text-sm rounded-md border transition ${
            showFilters || hasActiveFilters
              ? "bg-white text-black border-white"
              : "bg-zinc-900 text-white/70 border-zinc-800 hover:text-white"
          }`}
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          Filtros
          {hasActiveFilters && (
            <span className="w-1.5 h-1.5 rounded-full bg-orange-500 inline-block" />
          )}
        </button>
        {hasActiveFilters && (
          <button
            onClick={resetFilters}
            className="flex items-center gap-1 px-2 py-2 text-xs text-white/50 hover:text-white transition"
          >
            <X className="w-3.5 h-3.5" /> Limpar
          </button>
        )}
        <span className="ml-auto text-xs text-white/50 shrink-0">{filtrados.length} alunos</span>
      </div>

      {/* Painel de filtros */}
      {showFilters && (
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-white/40 mb-2">Status</p>
              <div className="flex flex-wrap gap-1">
                {(["Todos", "Em dia", "Pendente", "Vencido"] as StatusFilter[]).map(o => (
                  <FilterChip key={o} label={o} active={filters.status === o} onClick={() => set("status", o)} />
                ))}
              </div>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-white/40 mb-2">Plano</p>
              <div className="flex flex-wrap gap-1">
                {(["Todos", "Mensal", "Semestral", "Anual", "Avulso"] as PlanoFilter[]).map(o => (
                  <FilterChip key={o} label={o} active={filters.plano === o} onClick={() => set("plano", o)} />
                ))}
              </div>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-white/40 mb-2">Professor</p>
              <div className="flex flex-wrap gap-1">
                {professores.map(o => (
                  <FilterChip key={o} label={o} active={filters.professor === o} onClick={() => set("professor", o)} />
                ))}
              </div>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-white/40 mb-2">Desconto</p>
              <div className="flex flex-wrap gap-1">
                {(["Todos", "Com desconto", "Sem desconto"] as DescontoFilter[]).map(o => (
                  <FilterChip key={o} label={o} active={filters.desconto === o} onClick={() => set("desconto", o)} />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabela */}
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
                  Nenhum aluno encontrado com esses filtros.
                </TableCell>
              </TableRow>
            )}
            {filtrados.map(a => (
              <TableRow
                key={a.id}
                className="border-zinc-900 hover:bg-zinc-900/40 cursor-pointer"
                onClick={() => router.push(`/admin/alunos/${a.id}`)}
              >
                <TableCell>
                  <div>
                    <p className="text-sm font-medium text-white hover:underline">{a.name}</p>
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
                <TableCell onClick={e => e.stopPropagation()}>
                  <StatusBadge status={a.status_pagamento} />
                </TableCell>
                <TableCell onClick={e => e.stopPropagation()}>
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
