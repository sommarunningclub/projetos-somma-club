"use client"

import Link from "next/link"
import { Check } from "lucide-react"

const benefits = [
  { category: "Comunidade", items: ["Presença VIP nas provas Somma", "Estrutura Somma em eventos", "Encontros mensais exclusivos", "Palestras e experiências"] },
  { category: "Parcerias", items: ["Descontos em Tex Barbearia", "Descontos em Dopahmina", "Descontos em Academia Evolve"] },
  { category: "Exclusivos", items: ["Treinamento personalizado via app", "Integração com Strava e relógios GPS", "Acompanhamento de métricas", "Camiseta oficial de membro", "Desconto em camisetas extras"] },
]

const pricingPlans = [
  {
    name: "Mensal",
    price: 220,
    period: "mensal",
    description: "Cobrança mensal recorrente",
    savings: null,
  },
  {
    name: "Semestral",
    price: 200,
    total: 1200,
    period: "semestral",
    installments: 6,
    description: "6x R$ 200,00 sem juros",
    savings: "R$ 120 de economia",
  },
  {
    name: "Anual",
    price: 180,
    total: 2160,
    period: "anual",
    installments: 12,
    description: "12x R$ 180,00 sem juros",
    savings: "R$ 480 de economia",
  },
]

export function PricingPlans() {

  return (
    <div className="space-y-20 md:space-y-32">
      {/* Benefits Checklist */}
      <div>
        <h3 className="text-2xl sm:text-3xl md:text-4xl font-light text-white mb-12 md:mb-16">
          Tudo que você recebe
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16">
          {benefits.map((section, idx) => (
            <div key={idx}>
              <h4 className="text-xs sm:text-sm font-light text-white/60 mb-6 uppercase tracking-wider">
                {section.category}
              </h4>
              <ul className="space-y-4 md:space-y-5">
                {section.items.map((item, itemIdx) => (
                  <li key={itemIdx} className="flex items-start gap-3 md:gap-4">
                    <div className="flex-shrink-0 mt-1">
                      <Check className="w-5 h-5 md:w-6 md:h-6 text-[#ff4f2d]" strokeWidth={1.5} />
                    </div>
                    <span className="text-sm md:text-base font-light text-white/80">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Pricing Plans */}
      <div>
        <h3 className="text-2xl sm:text-3xl md:text-4xl font-light text-white mb-12 md:mb-16">
          Escolha seu plano
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {pricingPlans.map((plan, idx) => (
            <div
              key={idx}
              className="relative border border-white/10 bg-white/[0.02] p-8 md:p-10 hover:bg-white/[0.05] transition-colors"
            >
              {/* Badge Popular */}
              {idx === 1 && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="px-3 py-1 text-xs font-light text-black bg-[#ff4f2d] uppercase tracking-wider">
                    Popular
                  </span>
                </div>
              )}

              {/* Plan Name */}
              <div className="mb-8">
                <h4 className="text-lg md:text-xl font-light text-white mb-1">{plan.name}</h4>
                <p className="text-xs text-white/50 uppercase tracking-wider">{plan.period}</p>
              </div>

              {/* Price */}
              <div className="mb-8 pb-8 border-b border-white/10">
                <div className="flex items-baseline gap-2 mb-3">
                  <span className="text-4xl md:text-5xl font-light text-white">
                    R$ {plan.price}
                  </span>
                  <span className="text-white/60 text-sm">/mês</span>
                </div>

                {plan.total && (
                  <div className="space-y-1">
                    <p className="text-xs text-white/60">
                      Total: <span className="text-white font-light">R$ {plan.total.toLocaleString("pt-BR")}</span>
                    </p>
                    <p className="text-xs text-white/60">{plan.description}</p>
                  </div>
                )}

                {plan.savings && (
                  <p className="text-xs text-[#ff4f2d] mt-2 font-light">{plan.savings}</p>
                )}
              </div>

              {/* CTA Button */}
              <Link
                href={`/checkout/${plan.period.toLowerCase()}`}
                className="block w-full py-3 px-4 bg-[#ff4f2d] text-black hover:bg-[#ff6647] transition-colors text-sm font-light uppercase tracking-wider text-center"
              >
                Assinar
              </Link>
            </div>
          ))}
        </div>

        <p className="text-center text-xs text-white/50 mt-8 md:mt-12 font-light">
          Cancele quando quiser. Sem compromisso de longo prazo.
        </p>
      </div>

      {/* Comparison Table */}
      <div>
        <h3 className="text-2xl sm:text-3xl md:text-4xl font-light text-white mb-12 md:mb-16">
          Comparativa detalhada
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-sm md:text-base">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-4 md:py-6 px-4 md:px-6 font-light text-white/80 uppercase text-xs tracking-wider">
                  Recurso
                </th>
                <th className="text-center py-4 md:py-6 px-4 md:px-6 font-light text-white/80 uppercase text-xs tracking-wider">
                  Incluído
                </th>
              </tr>
            </thead>
            <tbody>
              {benefits.map((section, secIdx) => (
                <tr key={`section-${secIdx}`} className="border-b border-white/5">
                  <td colSpan={2} className="py-6 md:py-8 px-4 md:px-6">
                    <p className="text-xs text-white/60 uppercase tracking-wider font-light mb-4">
                      {section.category}
                    </p>
                    <div className="space-y-3">
                      {section.items.map((item, itemIdx) => (
                        <div key={`item-${itemIdx}`} className="grid grid-cols-[1fr_auto] gap-4 items-start">
                          <span className="text-white/70 font-light">{item}</span>
                          <Check className="w-4 h-4 md:w-5 md:h-5 text-[#ff4f2d] flex-shrink-0 mt-0.5" strokeWidth={1.5} />
                        </div>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  )
}
