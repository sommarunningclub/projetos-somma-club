"use client"

import { useEffect, useState } from "react"
import { Loader2, Check } from "lucide-react"
import type { RepasseConfig } from "@/lib/relatorios/calculo"

const inputCls = "bg-zinc-900 border border-zinc-800 rounded-md px-2 py-1.5 text-sm text-white focus:outline-none focus:border-[#ff2c03] w-28"

export function RepasseConfigForm() {
  const [config, setConfig] = useState<RepasseConfig | null>(null)
  const [professores, setProfessores] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  useEffect(() => {
    fetch("/api/admin/repasse-config", { cache: "no-store" })
      .then(r => r.json())
      .then(j => {
        if (j.error) throw new Error(j.error)
        setConfig(j.config)
        setProfessores(j.professores ?? [])
      })
      .catch(e => setErro(e.message))
      .finally(() => setLoading(false))
  }, [])

  function setProf(nome: string, patch: { taxa?: number; isento?: boolean }) {
    setConfig(c => {
      if (!c) return c
      const atual = c.professores[nome] ?? {}
      return { ...c, professores: { ...c.professores, [nome]: { ...atual, ...patch } } }
    })
  }

  async function salvar() {
    if (!config) return
    setSaving(true); setErro(null); setSaved(false)
    try {
      const res = await fetch("/api/admin/repasse-config", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(config),
      })
      const j = await res.json()
      if (!res.ok) throw new Error(j.error || "Erro ao salvar")
      setSaved(true); setTimeout(() => setSaved(false), 2500)
    } catch (e: any) {
      setErro(e.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="flex items-center gap-2 text-white/50 text-sm"><Loader2 className="w-4 h-4 animate-spin" /> Carregando…</div>
  if (!config) return <div className="text-sm text-red-400">{erro ?? "Erro ao carregar configuração."}</div>

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="bg-zinc-950 border border-zinc-900 rounded-lg p-4 space-y-3">
        <div className="flex items-center gap-3">
          <label className="text-sm text-white/70">Taxa padrão por cobrança (R$)</label>
          <input type="number" min={0} step="1" value={config.taxaPadrao}
            onChange={e => setConfig(c => c ? { ...c, taxaPadrao: Number(e.target.value) } : c)}
            className={inputCls} />
        </div>
      </div>

      <div className="bg-zinc-950 border border-zinc-900 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-900 text-white/50 text-left">
              <th className="p-3">Professor</th>
              <th className="p-3 text-center">Isento</th>
              <th className="p-3 text-right">Taxa específica (R$)</th>
            </tr>
          </thead>
          <tbody>
            {professores.length === 0 && (
              <tr><td colSpan={3} className="text-center text-white/40 py-6">Nenhum professor encontrado. Rode a sincronização.</td></tr>
            )}
            {professores.map(nome => {
              const p = config.professores[nome] ?? {}
              return (
                <tr key={nome} className="border-b border-zinc-900/50">
                  <td className="p-3 text-white">{nome}</td>
                  <td className="p-3 text-center">
                    <input type="checkbox" checked={!!p.isento}
                      onChange={e => setProf(nome, { isento: e.target.checked })}
                      className="w-4 h-4 accent-[#ff2c03]" />
                  </td>
                  <td className="p-3 text-right">
                    <input type="number" min={0} step="1" placeholder="padrão"
                      value={p.taxa ?? ""} disabled={!!p.isento}
                      onChange={e => setProf(nome, { taxa: e.target.value === "" ? undefined : Number(e.target.value) })}
                      className={`${inputCls} text-right disabled:opacity-40`} />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div className="flex items-center gap-3">
        <button onClick={salvar} disabled={saving}
          className="flex items-center gap-2 px-4 py-2 rounded-md bg-[#ff2c03] text-white text-sm font-medium hover:bg-[#e6280a] disabled:opacity-50">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <Check className="w-4 h-4" /> : null}
          {saved ? "Salvo!" : "Salvar"}
        </button>
        {erro && <span className="text-sm text-red-400">{erro}</span>}
      </div>
    </div>
  )
}
