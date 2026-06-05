import { CalendarioRepasseView } from "@/components/admin/calendario-repasse-view"
import { SyncButton } from "@/components/admin/sync-button"

export const dynamic = "force-dynamic"
export const metadata = { title: "Calendário de Repasse · Somma" }

export default function CalendarioPage() {
  return (
    <div className="min-h-full p-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white">Calendário de Repasse</h1>
          <p className="text-xs text-white/50 mt-0.5">Repasse mês a mês por professor · planos à vista distribuídos pelos meses de serviço</p>
        </div>
        <SyncButton />
      </div>
      <CalendarioRepasseView />
    </div>
  )
}
