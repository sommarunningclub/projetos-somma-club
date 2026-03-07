import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { CheckoutForm } from "@/components/checkout-form"
import { createClient as createAnonClient } from "@supabase/supabase-js"

const planData = {
  mensal: {
    name: "Mensal",
    period: "mensal",
    price: 220,
    total: 220,
    installments: 1,
    type: "recurring" as const,
  },
  semestral: {
    name: "Semestral",
    period: "semestral",
    price: 200,
    total: 1200,
    installments: 6,
    type: "installment" as const,
  },
  anual: {
    name: "Anual",
    period: "anual",
    price: 180,
    total: 2160,
    installments: 12,
    type: "installment" as const,
  },
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ plano: string }>
}): Promise<Metadata> {
  const { plano } = await params
  const plan = planData[plano as keyof typeof planData]

  if (!plan) {
    return {
      title: "Plano não encontrado",
    }
  }

  return {
    title: `Checkout - Plano ${plan.name} | Assessoria Somma`,
    description: `Finalize seu pedido para o plano ${plan.name} da Assessoria Somma Club`,
  }
}

export default async function CheckoutPage({
  params,
}: {
  params: Promise<{ plano: string }>
}) {
  const { plano } = await params
  const plan = planData[plano as keyof typeof planData]

  if (!plan) {
    redirect("/")
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !anonKey) {
    console.error("[CheckoutPage] Missing env vars:", { supabaseUrl: !!supabaseUrl, anonKey: !!anonKey })
    return (
      <main className="bg-black">
        <div className="min-h-screen flex items-center justify-center text-red-400">
          <p>Configuracao ausente: NEXT_PUBLIC_SUPABASE_ANON_KEY</p>
        </div>
      </main>
    )
  }

  const supabase = createAnonClient(supabaseUrl, anonKey)
  const { data: professors, error } = await supabase
    .from("professores_curriculo_assessoria")
    .select("id, nome, instagram, link_foto, telefone")

  if (error) {
    console.error("[CheckoutPage] Supabase error:", JSON.stringify(error))
    return (
      <main className="bg-black">
        <div className="min-h-screen flex items-center justify-center text-red-400">
          <div className="text-center">
            <p className="mb-2">Erro ao carregar professores:</p>
            <p className="text-sm font-mono">{JSON.stringify(error)}</p>
          </div>
        </div>
      </main>
    )
  }

  console.log("[CheckoutPage] Loaded professors:", professors?.length ?? 0, professors)

  return (
    <main className="bg-black">
      <CheckoutForm plan={plan} initialProfessors={professors || []} />
    </main>
  )
}
