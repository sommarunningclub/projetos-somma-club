"use client"

import { useEffect, useState } from "react"
import { Loader2, Download } from "lucide-react"
import { toCSV } from "@/lib/relatorios/csv"

interface ProfResumo {
  professor: string; alunos: number; cobrancas: number
  recebido: number; aReceber: number; vencido: number
  previsaoTotal: number; taxaUnitaria: number; taxaTotal: number; repassePrevisto: number
}
interface AgendaItem {
  asaas_id: string; aluno: string | null; professor: string; plano: string | null
  due_date: string | null; value: number; status: "aReceber" | "vencido"
}
function fmtBRL(v: number | null | undefined) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(v ?? 0))
}
function fmtDate(iso: string | null) {
  if (!iso) return "—"
  const [y, m, d] = iso.slice(0, 10).split("-"); return `${d}/${m}/${y}`
}
function mesAtual() {
  const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
}

const inputCls = "bg-zinc-900 border border-zinc-800 rounded-md px-2 py-1.5 text-sm text-white focus:outline-none focus:border-[#ff2c03]"

function Kpi({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div className="bg-zinc-950 border border-zinc-900 rounded-lg p-4">
      <p className="text-[11px] text-white/50 uppercase tracking-wider">{label}</p>
      <p className={`text-lg font-semibold mt-1 tabular-nums ${accent ?? "text-white"}`}>{value}</p>
    </div>
  )
}

export function VisaoGeralView() {
  const [mes, setMes] = useState(mesAtual())
  const [professor, setProfessor] = useState("")
  const [data, setData] = useState<any | null>(null)
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  useEffect(() => {
    const ctrl = new AbortController()
    setLoading(true); setErro(null)
    const qs = new URLSearchParams({ mes, professor })
    fetch(`/api/admin/visao-geral?${qs}`, { cache: "no-store", signal: ctrl.signal })
      .then(async r => { const j = await r.json(); if (!r.ok) throw new Error(j.error || "Erro"); setData(j) })
      .catch((e: any) => { if (e.name !== "AbortError") setErro(e.message) })
      .finally(() => { if (!ctrl.signal.aborted) setLoading(false) })
    return () => ctrl.abort()
  }, [mes, professor])

  const professoresDisponiveis: string[] = data?.professoresDisponiveis ?? []

  const profs: ProfResumo[] = data?.professores ?? []
  const t = data?.totais
  const agenda: AgendaItem[] = data?.agenda ?? []

  function exportProf() {
    if (!profs.length) return
    const csv = toCSV(profs.map(p => ({
      professor: p.professor, alunos: p.alunos, cobr: p.cobrancas,
      recebido: fmtBRL(p.recebido), aReceber: fmtBRL(p.aReceber), vencido: fmtBRL(p.vencido),
      previsao: fmtBRL(p.previsaoTotal), taxa: fmtBRL(p.taxaTotal), repasse: fmtBRL(p.repassePrevisto),
    })), { professor: "Professor", alunos: "Alunos", cobr: "Cobranças", recebido: "Recebido", aReceber: "A receber", vencido: "Vencido", previsao: "Previsão total", taxa: "Taxa Somma", repasse: "Repasse previsto" })
    baixar(csv, `visao-geral-${mes}.csv`)
  }
  function exportAgenda() {
    if (!agenda.length) return
    const csv = toCSV(agenda.map(a => ({
      aluno: a.aluno, professor: a.professor, plano: a.plano, venc: fmtDate(a.due_date),
      valor: fmtBRL(a.value), status: a.status === "vencido" ? "Vencido" : "A receber",
    })), { aluno: "Aluno", professor: "Professor", plano: "Plano", venc: "Vencimento", valor: "Valor", status: "Status" })
    baixar(csv, `agenda-receber-${mes}.csv`)
  }
  function baixar(csv: string, nome: string) {
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }))
    const a = document.createElement("a"); a.href = url; a.download = nome; a.click(); URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <div className="flex flex-wrap items-end gap-3 bg-zinc-950 border border-zinc-900 rounded-lg p-4">
        <div className="flex flex-col gap-1">
          <label className="text-[11px] text-white/50 uppercase tracking-wider">Mês de referência</label>
          <input type="month" value={mes} onChange={e => setMes(e.target.value)} className={inputCls} />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[11px] text-white/50 uppercase tracking-wider">Professor</label>
          <select value={professor} onChange={e => setProfessor(e.target.value)} className={inputCls}>
            <option value="">Todos</option>
            {professoresDisponiveis.map(p => <option key={p} value={p}>{p}</option>)}
            <option value="Sem professor">Sem professor</option>
          </select>
        </div>
        {loading && <Loader2 className="w-4 h-4 animate-spin text-white/40 self-center" />}
      </div>

      {erro && <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-md p-3">{erro}</div>}

      {/* KPIs */}
      {t && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <Kpi label="Previsão total" value={fmtBRL(t.previsaoTotal)} accent="text-white" />
          <Kpi label="Recebido" value={fmtBRL(t.recebido)} accent="text-emerald-400" />
          <Kpi label="A receber" value={fmtBRL(t.aReceber)} accent="text-amber-400" />
          <Kpi label="Vencido" value={fmtBRL(t.vencido)} accent="text-red-400" />
          <Kpi label="Taxa Somma" value={fmtBRL(t.taxaTotal)} accent="text-white" />
          <Kpi label="Repasse previsto" value={fmtBRL(t.repassePrevisto)} accent="text-emerald-400" />
        </div>
      )}

      {/* Por professor */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-medium text-white">Por professor</h2>
          <button onClick={exportProf} disabled={!profs.length}
            className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-zinc-900 border border-zinc-800 text-xs text-white hover:bg-zinc-800 disabled:opacity-40">
            <Download className="w-3.5 h-3.5" /> CSV
          </button>
        </div>
        <div className="bg-zinc-950 border border-zinc-900 rounded-lg overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-900 text-white/50 text-left">
                <th className="p-3">Professor</th>
                <th className="p-3 text-right">Alunos</th>
                <th className="p-3 text-right">Cobr.</th>
                <th className="p-3 text-right">Recebido</th>
                <th className="p-3 text-right">A receber</th>
                <th className="p-3 text-right">Vencido</th>
                <th className="p-3 text-right">Previsão</th>
                <th className="p-3 text-right">Taxa/cobr</th>
                <th className="p-3 text-right">Taxa Somma</th>
                <th className="p-3 text-right">Repasse prev.</th>
              </tr>
            </thead>
            <tbody>
              {!loading && profs.length === 0 && (
                <tr><td colSpan={10} className="text-center text-white/40 py-8">Sem cobranças neste mês.</td></tr>
              )}
              {profs.map(p => (
                <tr key={p.professor} className="border-b border-zinc-900/50 hover:bg-zinc-900/30">
                  <td className="p-3 text-white">{p.professor}</td>
                  <td className="p-3 text-right text-white/70 tabular-nums">{p.alunos}</td>
                  <td className="p-3 text-right text-white/70 tabular-nums">{p.cobrancas}</td>
                  <td className="p-3 text-right text-emerald-400 tabular-nums">{fmtBRL(p.recebido)}</td>
                  <td className="p-3 text-right text-amber-400 tabular-nums">{fmtBRL(p.aReceber)}</td>
                  <td className="p-3 text-right text-red-400 tabular-nums">{fmtBRL(p.vencido)}</td>
                  <td className="p-3 text-right text-white tabular-nums">{fmtBRL(p.previsaoTotal)}</td>
                  <td className="p-3 text-right text-white/50 tabular-nums">{p.taxaUnitaria === 0 ? "isento" : fmtBRL(p.taxaUnitaria)}</td>
                  <td className="p-3 text-right text-white/70 tabular-nums">{fmtBRL(p.taxaTotal)}</td>
                  <td className="p-3 text-right text-emerald-400 tabular-nums">{fmtBRL(p.repassePrevisto)}</td>
                </tr>
              ))}
            </tbody>
            {t && profs.length > 0 && (
              <tfoot>
                <tr className="border-t-2 border-zinc-800 font-semibold">
                  <td className="p-3 text-white">Total</td>
                  <td className="p-3 text-right text-white tabular-nums">{t.alunos}</td>
                  <td className="p-3 text-right text-white tabular-nums">{t.cobrancas}</td>
                  <td className="p-3 text-right text-emerald-400 tabular-nums">{fmtBRL(t.recebido)}</td>
                  <td className="p-3 text-right text-amber-400 tabular-nums">{fmtBRL(t.aReceber)}</td>
                  <td className="p-3 text-right text-red-400 tabular-nums">{fmtBRL(t.vencido)}</td>
                  <td className="p-3 text-right text-white tabular-nums">{fmtBRL(t.previsaoTotal)}</td>
                  <td className="p-3"></td>
                  <td className="p-3 text-right text-white tabular-nums">{fmtBRL(t.taxaTotal)}</td>
                  <td className="p-3 text-right text-emerald-400 tabular-nums">{fmtBRL(t.repassePrevisto)}</td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      {/* Inadimplência por professor */}
      <div>
        <h2 className="text-sm font-medium text-white mb-2">Inadimplência por professor</h2>
        <div className="bg-zinc-950 border border-zinc-900 rounded-lg overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-900 text-white/50 text-left">
                <th className="p-3">Professor</th>
                <th className="p-3 text-right">Vencido</th>
                <th className="p-3 text-right">% do previsto</th>
              </tr>
            </thead>
            <tbody>
              {profs.filter(p => p.vencido > 0).length === 0 && (
                <tr><td colSpan={3} className="text-center text-white/40 py-6">Nenhuma inadimplência neste mês. 🎉</td></tr>
              )}
              {profs.filter(p => p.vencido > 0).map(p => (
                <tr key={p.professor} className="border-b border-zinc-900/50 hover:bg-zinc-900/30">
                  <td className="p-3 text-white">{p.professor}</td>
                  <td className="p-3 text-right text-red-400 tabular-nums">{fmtBRL(p.vencido)}</td>
                  <td className="p-3 text-right text-white/70 tabular-nums">
                    {p.previsaoTotal > 0 ? `${Math.round((p.vencido / p.previsaoTotal) * 100)}%` : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Agenda a receber por cliente */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-medium text-white">Agenda a receber por cliente</h2>
          <button onClick={exportAgenda} disabled={!agenda.length}
            className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-zinc-900 border border-zinc-800 text-xs text-white hover:bg-zinc-800 disabled:opacity-40">
            <Download className="w-3.5 h-3.5" /> CSV
          </button>
        </div>
        <div className="bg-zinc-950 border border-zinc-900 rounded-lg overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-900 text-white/50 text-left">
                <th className="p-3">Aluno</th>
                <th className="p-3">Professor</th>
                <th className="p-3">Plano</th>
                <th className="p-3">Vencimento</th>
                <th className="p-3 text-right">Valor</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {!loading && agenda.length === 0 && (
                <tr><td colSpan={6} className="text-center text-white/40 py-8">Nada a receber neste mês.</td></tr>
              )}
              {agenda.map(a => (
                <tr key={a.asaas_id} className="border-b border-zinc-900/50 hover:bg-zinc-900/30">
                  <td className="p-3 text-white">{a.aluno ?? "—"}</td>
                  <td className="p-3 text-white/70">{a.professor}</td>
                  <td className="p-3 text-white/70">{a.plano ?? "—"}</td>
                  <td className="p-3 text-white/70">{fmtDate(a.due_date)}</td>
                  <td className="p-3 text-right text-white tabular-nums">{fmtBRL(a.value)}</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs ${a.status === "vencido" ? "bg-red-500/15 text-red-400" : "bg-amber-500/15 text-amber-400"}`}>
                      {a.status === "vencido" ? "Vencido" : "A receber"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
