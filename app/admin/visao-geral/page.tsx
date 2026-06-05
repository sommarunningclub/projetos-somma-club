import { VisaoGeralView } from "@/components/admin/visao-geral-view"
import { SyncButton } from "@/components/admin/sync-button"

export const dynamic = "force-dynamic"
export const metadata = { title: "Visão Geral · Somma" }

export default function VisaoGeralPage() {
  return (
    <div className="min-h-full p-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white">Visão Geral</h1>
          <p className="text-xs text-white/50 mt-0.5">Previsão mensal por professor · agenda a receber · inadimplência</p>
        </div>
        <SyncButton />
      </div>
      <VisaoGeralView />
    </div>
  )
}
