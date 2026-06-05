import { RelatorioView } from "@/components/admin/relatorio-view"
import { SyncButton } from "@/components/admin/sync-button"

export const dynamic = "force-dynamic"
export const metadata = { title: "Relatório de Carteira · Somma" }

export default function CarteiraPage() {
  return (
    <div className="min-h-full p-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white">Relatório de Carteira</h1>
          <p className="text-xs text-white/50 mt-0.5">Total creditado por período (data de crédito real)</p>
        </div>
        <SyncButton />
      </div>
      <RelatorioView tipo="carteira" />
    </div>
  )
}
