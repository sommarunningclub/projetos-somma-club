"use client"

import { useState } from "react"
import { ChevronDown } from "lucide-react"

const faqs = [
  {
    question: "Quanto tempo irá durar meu acesso? Tem fidelidade?",
    answer:
      "O seu acesso ao SOMMA Club tem a duração do plano que você escolher, que pode ser mensal, trimestral, semestral ou anual. Não há nenhum tipo de fidelidade. Você tem total liberdade para fazer parte da nossa comunidade pelo tempo que fizer sentido para você.",
  },
  {
    question: "Como acesso os benefícios do clube?",
    answer:
      "Assim que sua assinatura for confirmada, você receberá um convite para entrar no nosso grupo exclusivo de membros no WhatsApp. É por lá que toda a mágica acontece: compartilhamos todas as informações, anunciamos os benefícios, organizamos os encontros e fortalecemos nossa comunidade.",
  },
  {
    question: "Quais são as formas de pagamento? É seguro?",
    answer:
      "Aceitamos pagamentos via Cartão de Crédito (com opção de parcelamento para planos longos) e PIX. Todo o processo de pagamento é gerenciado pela plataforma HUBLA, uma das mais seguras e confiáveis do mercado, garantindo total proteção aos seus dados.",
  },
  {
    question: "Como funciona a garantia, cancelamento e reembolso?",
    answer:
      "Sua satisfação é nossa prioridade. Ao assinar, você conta com uma garantia incondicional de 7 dias. Se por qualquer motivo você decidir que o clube não é para você nesse período, pode solicitar o cancelamento e o reembolso total do valor investido. Após os 7 dias, você pode cancelar a qualquer momento para evitar cobranças futuras, e seu acesso continuará ativo pelo período que já foi pago.",
  },
  {
    question: "A assinatura renova automaticamente?",
    answer:
      "Sim. Para sua comodidade e para que você não perca o acesso aos benefícios, a renovação do seu plano é automática ao final do período contratado. Caso não deseje renovar, basta solicitar o cancelamento antes da data de renovação.",
  },
  {
    question: "Posso cancelar minha assinatura?",
    answer:
      "Claro. O cancelamento é simples e pode ser feito a qualquer momento, diretamente na plataforma Hubla. Sem burocracia e sem perguntas. Você sempre estará no controle da sua assinatura.",
  },
]

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <section className="relative z-20 py-24">
      <div className="container mx-auto px-6 lg:px-12">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-light mb-6 text-balance">Perguntas Frequentes</h2>

          <p className="text-lg md:text-xl text-zinc-400 mb-16">
            Tire suas dúvidas sobre o SOMMA Club e entenda como funciona a experiência de ser membro da nossa
            comunidade.
          </p>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="border border-zinc-800 rounded-lg overflow-hidden transition-all duration-300 hover:border-zinc-700"
              >
                <button
                  onClick={() => setOpenIndex(openIndex === index ? null : index)}
                  className="w-full px-6 py-5 md:py-6 flex items-start justify-between gap-4 hover:bg-zinc-950/50 transition-colors text-left"
                >
                  <span className="text-base md:text-lg font-light text-white text-balance pr-4">{faq.question}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-[#ff4f2d] flex-shrink-0 transition-transform duration-300 ${
                      openIndex === index ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {openIndex === index && (
                  <div className="px-6 pb-6 border-t border-zinc-800 bg-zinc-950/30">
                    <p className="text-zinc-300 text-base md:text-lg font-light leading-relaxed">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
