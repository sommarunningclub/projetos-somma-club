"use client"

import { useEffect, useState } from "react"
import { Loader2, Download, Check } from "lucide-react"
import { toCSV } from "@/lib/relatorios/csv"

const MESES_LABEL = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"]

function fmtBRL(v: number | null | undefined) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(v ?? 0))
}
function fmtNum(v: number) {
  return new Intl.NumberFormat("pt-BR", { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(v)
}
const inputCls = "bg-zinc-900 border border-zinc-800 rounded-md px-2 py-1.5 text-sm text-white focus:outline-none focus:border-[#ff2c03]"

export function CalendarioRepasseView() {
  const [ano, setAno] = useState(String(new Date().getFullYear()))
  const [mesDetalhe, setMesDetalhe] = useState("")
  const [data, setData] = useState<any | null>(null)
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  useEffect(() => {
    const ctrl = new AbortController()
    setLoading(true); setErro(null)
    const qs = new URLSearchParams({ ano, mes: mesDetalhe })
    fetch(`/api/admin/competencia?${qs}`, { cache: "no-store", signal: ctrl.signal })
      .then(async r => { const j = await r.json(); if (!r.ok) throw new Error(j.error || "Erro"); setData(j) })
      .catch((e: any) => { if (e.name !== "AbortError") setErro(e.message) })
      .finally(() => { if (!ctrl.signal.aborted) setLoading(false) })
    return () => ctrl.abort()
  }, [ano, mesDetalhe])

  const professores = data?.professores ?? []
  const meses: string[] = data?.meses ?? []
  const totaisMes = data?.totaisMes ?? {}
  const detalhe = data?.detalhe ?? []

  function exportCalendario() {
    if (!professores.length) return
    const rows = professores.map((p: any) => {
      const o: Record<string, unknown> = { professor: p.professor }
      meses.forEach((m, i) => { o[MESES_LABEL[i]] = fmtBRL(p.meses[m]?.repasse ?? 0) })
      o["Total"] = fmtBRL(p.totalRepasse)
      return o
    })
    const blob = new Blob([toCSV(rows)], { type: "text/csv;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a"); a.href = url; a.download = `calendario-repasse-${ano}.csv`; a.click(); URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      {/* Controles */}
      <div className="flex flex-wrap items-end gap-3 bg-zinc-950 border border-zinc-900 rounded-lg p-4">
        <div className="flex flex-col gap-1">
          <label className="text-[11px] text-white/50 uppercase tracking-wider">Ano</label>
          <input type="number" value={ano} min="2024" max="2030" onChange={e => { setAno(e.target.value); setMesDetalhe("") }} className={`${inputCls} w-24`} />
        </div>
        <div className="flex-1" />
        <div className="flex items-center gap-3 text-xs text-white/50">
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-emerald-500/30 border border-emerald-500/50" /> recebido (na conta)</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-amber-500/20 border border-amber-500/40" /> previsto (a receber)</span>
        </div>
        <button onClick={exportCalendario} disabled={!professores.length}
          className="flex items-center gap-2 px-3 py-2 rounded-md bg-zinc-900 border border-zinc-800 text-sm text-white hover:bg-zinc-800 disabled:opacity-40">
          <Download className="w-4 h-4" /> CSV
        </button>
        {loading && <Loader2 className="w-4 h-4 animate-spin text-white/40 self-center" />}
      </div>

      {erro && <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-md p-3">{erro}</div>}

      {/* Calendário do ano */}
      <div>
        <h2 className="text-sm font-medium text-white mb-2">Repasse por professor · mês a mês ({ano})</h2>
        <p className="text-xs text-white/40 mb-3">Clique no mês para ver o detalhe por aluno. Valores = repasse ao professor (já descontada a taxa Somma).</p>
        <div className="bg-zinc-950 border border-zinc-900 rounded-lg overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-zinc-900 text-white/50">
                <th className="p-2 text-left sticky left-0 bg-zinc-950">Professor</th>
                {meses.map((m, i) => (
                  <th key={m} className={`p-2 text-right cursor-pointer hover:text-white ${mesDetalhe === m ? "text-[#ff2c03]" : ""}`}
                    onClick={() => setMesDetalhe(mesDetalhe === m ? "" : m)} title="Ver detalhe deste mês">
                    {MESES_LABEL[i]}
                  </th>
                ))}
                <th className="p-2 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {!loading && professores.length === 0 && (
                <tr><td colSpan={14} className="text-center text-white/40 py-8">Sem dados para {ano}.</td></tr>
              )}
              {professores.map((p: any) => (
                <tr key={p.professor} className="border-b border-zinc-900/50 hover:bg-zinc-900/20">
                  <td className="p-2 text-white sticky left-0 bg-zinc-950 whitespace-nowrap">{p.professor}</td>
                  {meses.map(m => {
                    const cel = p.meses[m]
                    const rep = cel?.repasse ?? 0
                    const allRecebido = cel && cel.aReceber === 0 && cel.repasse > 0
                    const parcial = cel && cel.recebido > 0 && cel.aReceber > 0
                    return (
                      <td key={m} className={`p-2 text-right tabular-nums cursor-pointer ${mesDetalhe === m ? "bg-[#ff2c03]/5" : ""} ${rep === 0 ? "text-white/20" : allRecebido ? "text-emerald-400" : parcial ? "text-amber-300" : "text-amber-400"}`}
                        onClick={() => setMesDetalhe(mesDetalhe === m ? "" : m)}
                        title={cel ? `Recebido ${fmtBRL(cel.recebido)} · A receber ${fmtBRL(cel.aReceber)}` : ""}>
                        {rep === 0 ? "—" : fmtNum(rep)}
                      </td>
                    )
                  })}
                  <td className="p-2 text-right tabular-nums text-white font-semibold">{fmtNum(p.totalRepasse)}</td>
                </tr>
              ))}
            </tbody>
            {professores.length > 0 && (
              <tfoot>
                <tr className="border-t-2 border-zinc-800 font-semibold">
                  <td className="p-2 text-white sticky left-0 bg-zinc-950">Total (se todos pagarem)</td>
                  {meses.map(m => (
                    <td key={m} className="p-2 text-right tabular-nums text-white">{fmtNum(totaisMes[m]?.repasse ?? 0)}</td>
                  ))}
                  <td className="p-2 text-right tabular-nums text-emerald-400">
                    {fmtNum(professores.reduce((s: number, p: any) => s + p.totalRepasse, 0))}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      {/* Detalhe do mês */}
      {mesDetalhe && (
        <div>
          <h2 className="text-sm font-medium text-white mb-2">
            Detalhe de {MESES_LABEL[Number(mesDetalhe.slice(5)) - 1]}/{mesDetalhe.slice(0, 4)} — por aluno
          </h2>
          <div className="bg-zinc-950 border border-zinc-900 rounded-lg overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-900 text-white/50 text-left">
                  <th className="p-3">Aluno</th><th className="p-3">Professor</th><th className="p-3">Plano</th>
                  <th className="p-3 text-right">Valor mês</th><th className="p-3 text-right">Taxa Somma</th>
                  <th className="p-3 text-right">Repasse</th><th className="p-3 text-center">Dinheiro na conta?</th>
                </tr>
              </thead>
              <tbody>
                {detalhe.length === 0 && (
                  <tr><td colSpan={7} className="text-center text-white/40 py-6">Sem competências neste mês.</td></tr>
                )}
                {detalhe.map((d: any, i: number) => (
                  <tr key={i} className="border-b border-zinc-900/50 hover:bg-zinc-900/30">
                    <td className="p-3 text-white">{d.aluno ?? "—"}</td>
                    <td className="p-3 text-white/70">{d.professor}</td>
                    <td className="p-3 text-white/70">{d.plano ?? "—"}</td>
                    <td className="p-3 text-right text-white/70 tabular-nums">{fmtBRL(d.valorMensal)}</td>
                    <td className="p-3 text-right text-amber-400 tabular-nums">{d.taxa > 0 ? `− ${fmtBRL(d.taxa)}` : "isento"}</td>
                    <td className="p-3 text-right text-emerald-400 tabular-nums">{fmtBRL(d.repasse)}</td>
                    <td className="p-3 text-center">
                      {d.recebido
                        ? <span className="inline-flex items-center gap-1 text-emerald-400 text-xs"><Check className="w-3.5 h-3.5" /> Sim</span>
                        : <span className="text-amber-400 text-xs">A receber</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
