import { RelatorioView } from "@/components/admin/relatorio-view"

export const dynamic = "force-dynamic"
export const metadata = { title: "Relatório de Repasse · Somma" }

export default function RepassePage() {
  return (
    <div className="min-h-full p-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white">Relatório de Repasse</h1>
        <p className="text-xs text-white/50 mt-0.5">
          Repasse por professor = bruto − taxa Somma (R$50/cobrança · Alexandre isento). Configurável em Configurações.
        </p>
      </div>
      <RelatorioView tipo="repasse" />
    </div>
  )
}
