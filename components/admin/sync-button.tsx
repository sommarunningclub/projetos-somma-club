"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Loader2, RefreshCw, CheckCircle2, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"

interface SyncResult {
  alunos: number
  cobrancas: number
  erros: string[]
  duracao_ms: number
}

export function SyncButton() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [result, setResult] = useState<SyncResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  function handleSync() {
    setError(null)
    setResult(null)
    startTransition(async () => {
      try {
        const res = await fetch("/api/admin/sync", { method: "POST" })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || `Erro ${res.status}`)
        setResult(data)
        router.refresh()
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err))
      }
    })
  }

  return (
    <div className="flex items-center gap-3">
      {result && (
        <div className="flex items-center gap-1.5 text-xs text-emerald-400">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>
            {result.alunos} alunos · {result.cobrancas} cobranças
            {result.erros.length > 0 && ` · ${result.erros.length} erros`}
          </span>
        </div>
      )}
      {error && (
        <div className="flex items-center gap-1.5 text-xs text-red-400">
          <AlertTriangle className="w-3.5 h-3.5" />
          <span className="truncate max-w-xs">{error}</span>
        </div>
      )}
      <Button
        onClick={handleSync}
        disabled={isPending}
        size="sm"
        className="text-white"
        style={{ backgroundColor: "#ff2c03" }}
      >
        {isPending ? (
          <>
            <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />
            Sincronizando...
          </>
        ) : (
          <>
            <RefreshCw className="w-3.5 h-3.5 mr-2" />
            Sincronizar Asaas
          </>
        )}
      </Button>
    </div>
  )
}
