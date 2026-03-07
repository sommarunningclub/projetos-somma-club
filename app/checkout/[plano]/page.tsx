import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { CheckoutForm } from "@/components/checkout-form"
import { createClient } from "@/lib/supabase/server"

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

  const supabase = await createClient()
  const { data: professors } = await supabase
    .from("professores_curriculo_assessoria")
    .select("id, nome, instagram, link_foto")

  return (
    <main className="bg-black">
      <CheckoutForm plan={plan} initialProfessors={professors || []} />
    </main>
  )
}
