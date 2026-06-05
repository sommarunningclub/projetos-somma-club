import { RepasseConfigForm } from "@/components/admin/repasse-config-form"

export const dynamic = "force-dynamic"
export const metadata = { title: "Configurações de Repasse · Somma" }

export default function ConfigPage() {
  return (
    <div className="min-h-full p-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white">Configurações de Repasse</h1>
        <p className="text-xs text-white/50 mt-0.5">Defina a taxa padrão do Somma e isenções/taxas por professor.</p>
      </div>
      <RepasseConfigForm />
    </div>
  )
}
