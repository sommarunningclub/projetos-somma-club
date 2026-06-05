"use client"

import { useEffect, useMemo, useState } from "react"
import { Loader2, Download, Filter } from "lucide-react"
import { toCSV } from "@/lib/relatorios/csv"

type Tipo = "carteira" | "repasse"
type Visao = "sintetico" | "analitico" | "extrato"

interface ApiResponse {
  tipo: Tipo
  agrupar?: string
  filtrosDisponiveis: { professores: string[]; planos: string[]; formas: string[] }
  sintetico: any[]
  analitico: any[]
  totais: Record<string, number>
}

function fmtBRL(v: number | null | undefined) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(v ?? 0))
}
function fmtDate(iso: string | null) {
  if (!iso) return "—"
  const [y, m, d] = iso.slice(0, 10).split("-")
  return `${d}/${m}/${y}`
}
function firstDayOfMonth() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`
}
function today() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}

const inputCls = "bg-zinc-900 border border-zinc-800 rounded-md px-2 py-1.5 text-sm text-white focus:outline-none focus:border-[#ff2c03]"

export function RelatorioView({ tipo }: { tipo: Tipo }) {
  const [de, setDe] = useState(firstDayOfMonth())
  const [ate, setAte] = useState(today())
  const [agrupar, setAgrupar] = useState("professor")
  const [professor, setProfessor] = useState("")
  const [plano, setPlano] = useState("")
  const [forma, setForma] = useState("")
  const [visao, setVisao] = useState<Visao>("sintetico")
  const [data, setData] = useState<ApiResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  // Carrega ao montar e quando filtros mudam; cancela fetch anterior (evita race condition)
  useEffect(() => {
    const ctrl = new AbortController()
    setLoading(true); setErro(null)
    const qs = new URLSearchParams({ tipo, de, ate, agrupar, professor, plano, forma })
    fetch(`/api/admin/relatorios?${qs}`, { cache: "no-store", signal: ctrl.signal })
      .then(async res => {
        const j = await res.json()
        if (!res.ok) throw new Error(j.error || "Erro ao carregar")
        setData(j)
      })
      .catch((e: any) => { if (e.name !== "AbortError") setErro(e.message) })
      .finally(() => { if (!ctrl.signal.aborted) setLoading(false) })
    return () => ctrl.abort()
  }, [de, ate, agrupar, professor, plano, forma, tipo])

  const rows: any[] = visao === "sintetico" ? data?.sintetico ?? [] : data?.analitico ?? []
  const colSpan = tipo === "carteira"
    ? (visao === "sintetico" ? 3 : 7)
    : (visao === "sintetico" ? 5 : 7)

  // Extrato de PIX por professor (agrupa o analítico do repasse)
  const extrato = useMemo(() => {
    if (tipo !== "repasse") return []
    const map = new Map<string, { professor: string; itens: any[]; bruto: number; taxa: number; repasse: number }>()
    for (const r of ((data?.analitico ?? []) as any[])) {
      const g = map.get(r.professor) ?? { professor: r.professor, itens: [] as any[], bruto: 0, taxa: 0, repasse: 0 }
      g.itens.push(r); g.bruto += Number(r.bruto ?? 0); g.taxa += Number(r.taxa ?? 0); g.repasse += Number(r.repasse ?? 0)
      map.set(r.professor, g)
    }
    return [...map.values()].sort((a, b) => b.repasse - a.repasse)
  }, [data, tipo])

  function exportarCSV() {
    if (!rows.length) return
    let csv = ""
    if (tipo === "carteira" && visao === "sintetico") {
      csv = toCSV(rows.map(r => ({ grupo: r.grupo, qtd: r.qtd, total: fmtBRL(r.total) })),
        { grupo: "Grupo", qtd: "Qtd", total: "Total creditado" })
    } else if (tipo === "carteira") {
      csv = toCSV(rows.map(r => ({ aluno: r.aluno, professor: r.professor, plano: r.plano, venc: fmtDate(r.due_date), credito: fmtDate(r.credit_date), forma: r.forma, valor: fmtBRL(r.value) })),
        { aluno: "Aluno", professor: "Professor", plano: "Plano", venc: "Vencimento", credito: "Crédito", forma: "Forma", valor: "Valor" })
    } else if (tipo === "repasse" && visao === "sintetico") {
      csv = toCSV(rows.map(r => ({ professor: r.professor, qtd: r.qtd, bruto: fmtBRL(r.bruto), taxa: fmtBRL(r.taxa), repasse: fmtBRL(r.repasse) })),
        { professor: "Professor", qtd: "Qtd", bruto: "Bruto", taxa: "Taxa Somma", repasse: "Repasse" })
    } else {
      csv = toCSV(rows.map(r => ({ aluno: r.aluno, professor: r.professor, plano: r.plano, credito: fmtDate(r.credit_date), bruto: fmtBRL(r.bruto), taxa: fmtBRL(r.taxa), repasse: fmtBRL(r.repasse) })),
        { aluno: "Aluno", professor: "Professor", plano: "Plano", credito: "Crédito", bruto: "Bruto", taxa: "Taxa Somma", repasse: "Repasse" })
    }
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `relatorio-${tipo}-${visao}-${de}_a_${ate}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const fd = data?.filtrosDisponiveis

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <div className="flex flex-wrap items-end gap-3 bg-zinc-950 border border-zinc-900 rounded-lg p-4">
        <div className="flex flex-col gap-1">
          <label className="text-[11px] text-white/50 uppercase tracking-wider">De (crédito)</label>
          <input type="date" value={de} onChange={e => setDe(e.target.value)} className={inputCls} />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[11px] text-white/50 uppercase tracking-wider">Até (crédito)</label>
          <input type="date" value={ate} onChange={e => setAte(e.target.value)} className={inputCls} />
        </div>
        {tipo === "carteira" && (
          <div className="flex flex-col gap-1">
            <label className="text-[11px] text-white/50 uppercase tracking-wider">Agrupar por</label>
            <select value={agrupar} onChange={e => setAgrupar(e.target.value)} className={inputCls}>
              <option value="professor">Professor</option>
              <option value="plano">Plano</option>
              <option value="forma">Forma de pagamento</option>
              <option value="mes">Mês</option>
            </select>
          </div>
        )}
        <div className="flex flex-col gap-1">
          <label className="text-[11px] text-white/50 uppercase tracking-wider">Professor</label>
          <select value={professor} onChange={e => setProfessor(e.target.value)} className={inputCls}>
            <option value="">Todos</option>
            {(fd?.professores ?? []).map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[11px] text-white/50 uppercase tracking-wider">Plano</label>
          <select value={plano} onChange={e => setPlano(e.target.value)} className={inputCls}>
            <option value="">Todos</option>
            {(fd?.planos ?? []).map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[11px] text-white/50 uppercase tracking-wider">Forma</label>
          <select value={forma} onChange={e => setForma(e.target.value)} className={inputCls}>
            <option value="">Todas</option>
            {(fd?.formas ?? []).map(f => <option key={f} value={f}>{f}</option>)}
          </select>
        </div>
        <div className="flex-1" />
        <button onClick={exportarCSV} disabled={!rows.length}
          className="flex items-center gap-2 px-3 py-2 rounded-md bg-zinc-900 border border-zinc-800 text-sm text-white hover:bg-zinc-800 disabled:opacity-40">
          <Download className="w-4 h-4" /> Exportar CSV
        </button>
      </div>

      {/* Toggle de visão */}
      <div className="flex items-center gap-2">
        {((tipo === "repasse" ? ["sintetico", "analitico", "extrato"] : ["sintetico", "analitico"]) as Visao[]).map(v => (
          <button key={v} onClick={() => setVisao(v)}
            className={`px-3 py-1.5 rounded-md text-sm border ${visao === v ? "bg-[#ff2c03] border-[#ff2c03] text-white" : "bg-zinc-900 border-zinc-800 text-white/60 hover:text-white"}`}>
            {v === "sintetico" ? "Sintético" : v === "analitico" ? "Analítico" : "Extrato (PIX)"}
          </button>
        ))}
        {loading && <Loader2 className="w-4 h-4 animate-spin text-white/40 ml-2" />}
      </div>

      {erro && <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-md p-3">{erro}</div>}

      {/* Extrato de PIX por professor */}
      {tipo === "repasse" && visao === "extrato" && (
        <div className="space-y-4">
          {!loading && extrato.length === 0 && (
            <div className="bg-zinc-950 border border-zinc-900 rounded-lg p-8 text-center text-white/40">Nenhum recebimento no período/filtros.</div>
          )}
          {extrato.map(g => (
            <div key={g.professor} className="bg-zinc-950 border border-zinc-900 rounded-lg overflow-hidden">
              <div className="flex flex-wrap items-center justify-between gap-3 p-4 border-b border-zinc-900 bg-zinc-900/30">
                <div>
                  <p className="text-[11px] text-white/50 uppercase tracking-wider">PIX a fazer para</p>
                  <p className="text-base font-semibold text-white">{g.professor}</p>
                </div>
                <div className="text-right">
                  <p className="text-[11px] text-white/50 uppercase tracking-wider">Valor do PIX</p>
                  <p className="text-2xl font-bold text-emerald-400 tabular-nums">{fmtBRL(g.repasse)}</p>
                  <p className="text-[11px] text-white/40 mt-0.5">{g.itens.length} cobr. · bruto {fmtBRL(g.bruto)} − taxa {fmtBRL(g.taxa)}</p>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-zinc-900 text-white/50 text-left">
                      <th className="p-3">Aluno</th><th className="p-3">Plano</th><th className="p-3">Crédito</th>
                      <th className="p-3 text-right">Bruto</th><th className="p-3 text-right">Taxa Somma</th><th className="p-3 text-right">Repasse</th>
                    </tr>
                  </thead>
                  <tbody>
                    {g.itens.map((r, i) => (
                      <tr key={i} className="border-b border-zinc-900/50 hover:bg-zinc-900/30">
                        <td className="p-3 text-white">{r.aluno ?? "—"}</td>
                        <td className="p-3 text-white/70">{r.plano ?? "—"}</td>
                        <td className="p-3 text-white/70">{fmtDate(r.credit_date)}</td>
                        <td className="p-3 text-right text-white/70 tabular-nums">{fmtBRL(r.bruto)}</td>
                        <td className="p-3 text-right text-amber-400 tabular-nums">{r.taxa > 0 ? `− ${fmtBRL(r.taxa)}` : fmtBRL(0)}</td>
                        <td className="p-3 text-right text-emerald-400 tabular-nums">{fmtBRL(r.repasse)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-zinc-800 font-semibold">
                      <td className="p-3 text-white" colSpan={3}>Total a repassar (PIX)</td>
                      <td className="p-3 text-right text-white/70 tabular-nums">{fmtBRL(g.bruto)}</td>
                      <td className="p-3 text-right text-amber-400 tabular-nums">{fmtBRL(g.taxa)}</td>
                      <td className="p-3 text-right text-emerald-400 tabular-nums">{fmtBRL(g.repasse)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tabela (sintético/analítico) */}
      {visao !== "extrato" && (
      <div className="bg-zinc-950 border border-zinc-900 rounded-lg overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-900 text-white/50 text-left">
              {tipo === "carteira" && visao === "sintetico" && (
                <><th className="p-3">Grupo</th><th className="p-3 text-right">Qtd</th><th className="p-3 text-right">Total creditado</th></>
              )}
              {tipo === "carteira" && visao === "analitico" && (
                <><th className="p-3">Aluno</th><th className="p-3">Professor</th><th className="p-3">Plano</th><th className="p-3">Venc.</th><th className="p-3">Crédito</th><th className="p-3">Forma</th><th className="p-3 text-right">Valor</th></>
              )}
              {tipo === "repasse" && visao === "sintetico" && (
                <><th className="p-3">Professor</th><th className="p-3 text-right">Qtd</th><th className="p-3 text-right">Bruto</th><th className="p-3 text-right">Taxa Somma</th><th className="p-3 text-right">Repasse</th></>
              )}
              {tipo === "repasse" && visao === "analitico" && (
                <><th className="p-3">Aluno</th><th className="p-3">Professor</th><th className="p-3">Plano</th><th className="p-3">Crédito</th><th className="p-3 text-right">Bruto</th><th className="p-3 text-right">Taxa</th><th className="p-3 text-right">Repasse</th></>
              )}
            </tr>
          </thead>
          <tbody>
            {!loading && rows.length === 0 && (
              <tr><td colSpan={colSpan} className="text-center text-white/40 py-10">Nenhum recebimento no período/filtros.</td></tr>
            )}
            {tipo === "carteira" && visao === "sintetico" && rows.map((r, i) => (
              <tr key={i} className="border-b border-zinc-900/50 hover:bg-zinc-900/30">
                <td className="p-3 text-white">{r.grupo}</td>
                <td className="p-3 text-right text-white/70 tabular-nums">{r.qtd}</td>
                <td className="p-3 text-right text-emerald-400 tabular-nums">{fmtBRL(r.total)}</td>
              </tr>
            ))}
            {tipo === "carteira" && visao === "analitico" && rows.map((r, i) => (
              <tr key={i} className="border-b border-zinc-900/50 hover:bg-zinc-900/30">
                <td className="p-3 text-white">{r.aluno ?? "—"}</td>
                <td className="p-3 text-white/70">{r.professor}</td>
                <td className="p-3 text-white/70">{r.plano ?? "—"}</td>
                <td className="p-3 text-white/70">{fmtDate(r.due_date)}</td>
                <td className="p-3 text-white/70">{fmtDate(r.credit_date)}</td>
                <td className="p-3 text-white/70">{r.forma}</td>
                <td className="p-3 text-right text-emerald-400 tabular-nums">{fmtBRL(r.value)}</td>
              </tr>
            ))}
            {tipo === "repasse" && visao === "sintetico" && rows.map((r, i) => (
              <tr key={i} className="border-b border-zinc-900/50 hover:bg-zinc-900/30">
                <td className="p-3 text-white">{r.professor}</td>
                <td className="p-3 text-right text-white/70 tabular-nums">{r.qtd}</td>
                <td className="p-3 text-right text-white/70 tabular-nums">{fmtBRL(r.bruto)}</td>
                <td className="p-3 text-right text-amber-400 tabular-nums">{fmtBRL(r.taxa)}</td>
                <td className="p-3 text-right text-emerald-400 tabular-nums">{fmtBRL(r.repasse)}</td>
              </tr>
            ))}
            {tipo === "repasse" && visao === "analitico" && rows.map((r, i) => (
              <tr key={i} className="border-b border-zinc-900/50 hover:bg-zinc-900/30">
                <td className="p-3 text-white">{r.aluno ?? "—"}</td>
                <td className="p-3 text-white/70">{r.professor}</td>
                <td className="p-3 text-white/70">{r.plano ?? "—"}</td>
                <td className="p-3 text-white/70">{fmtDate(r.credit_date)}</td>
                <td className="p-3 text-right text-white/70 tabular-nums">{fmtBRL(r.bruto)}</td>
                <td className="p-3 text-right text-amber-400 tabular-nums">{fmtBRL(r.taxa)}</td>
                <td className="p-3 text-right text-emerald-400 tabular-nums">{fmtBRL(r.repasse)}</td>
              </tr>
            ))}
          </tbody>
          {/* Totais */}
          {data && rows.length > 0 && visao === "sintetico" && (
            <tfoot>
              {tipo === "carteira" ? (
                <tr className="border-t-2 border-zinc-800 font-semibold">
                  <td className="p-3 text-white">Total</td>
                  <td className="p-3 text-right text-white tabular-nums">{data.totais.qtd}</td>
                  <td className="p-3 text-right text-emerald-400 tabular-nums">{fmtBRL(data.totais.total)}</td>
                </tr>
              ) : (
                <tr className="border-t-2 border-zinc-800 font-semibold">
                  <td className="p-3 text-white">Total</td>
                  <td className="p-3 text-right text-white tabular-nums">{data.totais.qtd}</td>
                  <td className="p-3 text-right text-white tabular-nums">{fmtBRL(data.totais.bruto)}</td>
                  <td className="p-3 text-right text-amber-400 tabular-nums">{fmtBRL(data.totais.taxa)}</td>
                  <td className="p-3 text-right text-emerald-400 tabular-nums">{fmtBRL(data.totais.repasse)}</td>
                </tr>
              )}
            </tfoot>
          )}
        </table>
      </div>
      )}
    </div>
  )
}
