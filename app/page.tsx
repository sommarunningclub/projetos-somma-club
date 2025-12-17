"use client"

import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { CircleArrowRight } from "lucide-react"
import { useEffect, useState } from "react"
import { Navbar } from "@/components/navbar"
import Script from "next/script"
import { SubscriptionForm } from "@/components/subscription-form"
import { FAQSection } from "@/components/faq-section"
import { PricingCarousel } from "@/components/pricing-carousel"

export default function Home() {
  const [scrollProgress, setScrollProgress] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY
      const viewportHeight = window.innerHeight
      // Calculate progress from 0 to 1 over one viewport height
      const progress = Math.min(scrollY / viewportHeight, 1)
      setScrollProgress(progress)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Calculate opacity and scale based on scroll
  const linesOpacity = 1 - scrollProgress
  const linesScale = 1 - scrollProgress * 0.3 // Scale from 1 to 0.7

  const scrollToCapabilities = () => {
    const capabilitiesSection = document.getElementById("capabilities")
    if (capabilitiesSection) {
      capabilitiesSection.scrollIntoView({ behavior: "smooth" })
    }
  }

  return (
    <main className="relative min-h-[200vh] bg-black text-white overflow-hidden">
      <Script
        src="https://unpkg.com/@splinetool/viewer@1.0.17/build/spline-viewer.js"
        type="module"
        strategy="afterInteractive"
      />

      <Navbar />

      <div
        className="fixed inset-0 z-0 w-screen h-screen pointer-events-none transition-all duration-100"
        style={{
          opacity: linesOpacity,
          transform: `scale(${linesScale})`,
        }}
      >
        <div className="bg-lines-container">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="2269"
            height="2108"
            viewBox="0 0 2269 2108"
            fill="none"
            className="w-full h-full"
            preserveAspectRatio="xMidYMid slice"
          >
            {/* Animated Purple Lines */}
            <path
              d="M510.086 0.543457L507.556 840.047C506.058 1337.18 318.091 1803.4 1.875 2094.29"
              stroke="#ff4f2d"
              strokeWidth="2"
              strokeMiterlimit="10"
              strokeDasharray="100px 99999px"
              className="animate-line-race-1"
            />
            <path
              d="M929.828 0.543457L927.328 829.877C925.809 1334 737.028 1807.4 418.435 2106"
              stroke="#ff4f2d"
              strokeWidth="2"
              strokeMiterlimit="10"
              strokeDasharray="100px 99999px"
              className="animate-line-race-2"
            />
            <path
              d="M1341.9 0.543457L1344.4 829.876C1345.92 1334 1534.7 1807.4 1853.29 2106"
              stroke="#ff4f2d"
              strokeWidth="2"
              strokeMiterlimit="10"
              strokeDasharray="100px 99999px"
              className="animate-line-race-3"
            />
            <path
              d="M1758.96 0.543457L1761.49 840.047C1762.99 1337.18 1950.96 1803.4 2267.17 2094.29"
              stroke="#ff4f2d"
              strokeWidth="2"
              strokeMiterlimit="10"
              strokeDasharray="100px 99999px"
              className="animate-line-race-4"
            />

            {/* Static White Background Lines */}
            <path
              opacity="0.2"
              d="M929.828 0.543457L927.328 829.877C925.809 1334 737.028 1807.4 418.435 2106"
              stroke="white"
              strokeWidth="1"
              strokeMiterlimit="10"
            />
            <path
              opacity="0.2"
              d="M510.086 0.543457L507.556 840.047C506.058 1337.18 318.091 1803.4 1.875 2094.29"
              stroke="white"
              strokeWidth="1"
              strokeMiterlimit="10"
            />
            <path
              opacity="0.2"
              d="M1758.96 0.543457L1761.49 840.047C1762.99 1337.18 1950.96 1803.4 2267.17 2094.29"
              stroke="white"
              strokeWidth="1"
              strokeMiterlimit="10"
            />
            <path
              opacity="0.2"
              d="M1341.9 0.543457L1344.4 829.876C1345.92 1334 1534.7 1807.4 1853.29 2106"
              stroke="white"
              strokeWidth="1"
              strokeMiterlimit="10"
            />
          </svg>
        </div>
      </div>

      {/* 3D Spline Viewer */}
      <div
        className="fixed right-0 top-0 w-1/2 h-screen pointer-events-none z-10"
        style={{
          opacity: linesOpacity,
          transform: `scale(${linesScale})`,
        }}
      >
        <div className="track">
          <spline-viewer
            url="https://prod.spline.design/ZxKIijKh056svcM5/scene.splinecode"
            className="w-full h-full"
            style={{ position: "sticky", top: "0px", height: "100vh" }}
          />
        </div>
      </div>

      {/* Hero Content */}
      <div className="relative z-20 container mx-auto px-4 sm:px-6 lg:px-12 pt-16 sm:pt-24 pb-16 sm:pb-32 min-h-screen flex flex-col justify-center">
        <div className="max-w-3xl">
          {/* Status Toggle */}
          <div className="flex items-center gap-3 mb-6 sm:mb-12 animate-fade-in">
            <div className="relative w-14 h-7 bg-gradient-to-r from-green-400 to-green-500 rounded-full">
              <div className="absolute right-1 top-1 w-5 h-5 bg-white rounded-full transition-transform duration-300" />
            </div>
            <span className="text-xs sm:text-sm text-zinc-300">Entre na lista de espera e fiquei por dentro</span>
          </div>

          {/* Main Heading */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-light mb-6 sm:mb-8 leading-[1.1] sm:leading-[1] animate-fade-in text-balance">
            Somma Running Club Membros
          </h1>

          {/* Subheading */}
          <p className="text-base sm:text-lg md:text-xl text-zinc-400 mb-6 sm:mb-12 animate-fade-in-up animation-delay-200">
            Grupo Exclusivo de Membros para ajudar na sua performance.
          </p>

          {/* CTA Button */}
          <div className="animate-fade-in-up animation-delay-400">
            <Button
              size="lg"
              onClick={scrollToCapabilities}
              className="group bg-[#ff4f2d] hover:bg-[#ff6647] text-white px-6 sm:px-8 py-4 sm:py-6 text-sm sm:text-base rounded-full transition-all duration-[650ms] hover:scale-[1.02] w-full sm:w-auto"
            >
              Inscreva-se
              <CircleArrowRight className="ml-2 h-4 sm:h-5 w-4 sm:w-5 transition-transform duration-[650ms] group-hover:rotate-90" />
            </Button>
          </div>
        </div>
      </div>

      {/* Capabilities section with tabs */}
      <section id="capabilities" className="relative z-20 py-24">
        <div className="container p-12 rounded-2xl z-50 bg-[#09090b] border border-zinc-800 mx-auto px-6 lg:px-12">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-light mb-6 text-balance">
            Lista VIP Somma Club Membros
          </h2>

          <p className="text-lg md:text-xl text-zinc-400 mb-12">
            Estamos preparando algo especial para a nossa comunidade. O SOMMA Club ainda não está aberto, mas você pode
            garantir seu lugar na lista VIP e ser o primeiro a saber quando as inscrições abrirem com condições
            exclusivas de lançamento.
          </p>

          <Tabs defaultValue="development" className="w-full">
            <TabsList className="bg-zinc-950 border border-zinc-800 p-1 mb-8 rounded-full">
              <TabsTrigger
                value="development"
                className="text-zinc-500 data-[state=active]:bg-[#ff4f2d] data-[state=active]:text-white px-8 py-3 rounded-full transition-all"
              >
                Inscreva-se
              </TabsTrigger>
            </TabsList>

            <TabsContent value="development" className="mt-8">
              <SubscriptionForm />
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* SOMMA Club Section */}
      <section className="relative z-20 py-24">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-light mb-8 text-balance">Para quem é o SOMMA Club?</h2>

            <p className="text-lg md:text-xl text-zinc-300 leading-relaxed space-y-6">
              <span className="block">
                O SOMMA Club é a comunidade para membros do nosso clube de corrida em Brasília. É para você que já é
                parte da nossa família aos sábados e quer mais, e também para você que busca um incentivo para começar.
              </span>

              <span className="block">
                Seja você um corredor iniciante, que ainda está descobrindo o prazer da corrida, ou um atleta experiente
                em busca de novos desafios e conexões, aqui é o seu lugar.
              </span>

              <span className="block">
                Se você valoriza a constância, acredita no poder da união e quer fazer parte de um movimento que vai
                além do esporte, o SOMMA Club foi feito para você.
              </span>
            </p>
          </div>
        </div>
      </section>

      {/* SOMMA Club Filosofia Section */}
      <section className="relative z-20 py-24">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-light mb-8 text-balance">Nossa Filosofia</h2>

            <p className="text-lg md:text-xl text-zinc-300 leading-relaxed space-y-6">
              <span className="block">
                No SOMMA, acreditamos que correr é um ato coletivo. Não se trata apenas de bater metas e quebrar
                recordes, mas de compartilhar a jornada, celebrar cada conquista e apoiar uns aos outros.
              </span>

              <span className="block">
                Somos uma comunidade que encontra na corrida uma forma de cuidar da saúde, fortalecer laços e aproveitar
                o melhor que a vida ao ar livre pode oferecer.
              </span>

              <span className="block font-light text-[#ff4f2d]">
                Somos os "The Real Connection Runners". Aqui, a conversa flui para criar conexões verdadeiras,
                compartilhar experiências e fortalecer nosso espírito de equipe.
              </span>
            </p>
          </div>
        </div>
      </section>

      {/* SOMMA Club Interaction Section */}
      <section className="relative z-20 py-24">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-light mb-8 text-balance">
              Como funciona a interação?
            </h2>

            <p className="text-lg md:text-xl text-zinc-400 leading-relaxed">
              Ao se tornar membro do SOMMA Club, você terá acesso a um grupo exclusivo no WhatsApp. Este será nosso
              ponto de encontro virtual, onde todos os membros, gestores e profissionais parceiros se conectam.
            </p>

            <p className="text-lg md:text-xl text-zinc-400 leading-relaxed mt-6">
              É lá que você ficará por dentro de todas as novidades, receberá dicas, participará de desafios e, claro,
              combinará os próximos treinos e encontros.
            </p>
          </div>
        </div>
      </section>

      {/* SOMMA Club Benefits Section */}
      <section className="relative z-20 py-24">
        <div className="container p-12 rounded-2xl z-50 bg-[#09090b] border border-zinc-800 mx-auto px-6 lg:px-12">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-light mb-6 text-balance">Vantagens de ser Membro</h2>

          <p className="text-lg md:text-xl text-zinc-400 mb-12">
            Ao se tornar membro do SOMMA Club, você terá acesso a um universo de benefícios pensados para potencializar
            sua experiência como corredor e membro da nossa comunidade.
          </p>

          <div className="overflow-x-auto rounded-xl border border-zinc-800">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-800 bg-zinc-950/50">
                  <th className="text-left px-6 py-4 font-light text-white text-lg">Benefício</th>
                  <th className="text-left px-6 py-4 font-light text-white text-lg">O que você ganha</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                <tr className="hover:bg-zinc-950/50 transition-colors">
                  <td className="px-6 py-6">
                    <span className="font-light text-white text-base">Grupo Exclusivo de Membros</span>
                  </td>
                  <td className="px-6 py-6">
                    <span className="text-zinc-300">
                      Acesso ao grupo VIP no WhatsApp com todos os membros, gestores e profissionais parceiros
                    </span>
                  </td>
                </tr>

                <tr className="hover:bg-zinc-950/50 transition-colors">
                  <td className="px-6 py-6">
                    <span className="font-light text-white text-base">Encontros Mensais Especiais</span>
                  </td>
                  <td className="px-6 py-6">
                    <span className="text-zinc-300">
                      Eventos exclusivos para membros além dos treinos de sábado, incluindo corridas temáticas e
                      confraternizações
                    </span>
                  </td>
                </tr>

                <tr className="hover:bg-zinc-950/50 transition-colors">
                  <td className="px-6 py-6">
                    <span className="font-light text-white text-base">Descontos em Parceiros</span>
                  </td>
                  <td className="px-6 py-6">
                    <span className="text-zinc-300">
                      Vantagens exclusivas em lojas de artigos esportivos, nutricionistas, fisioterapeutas e outros
                      parceiros
                    </span>
                  </td>
                </tr>

                <tr className="hover:bg-zinc-950/50 transition-colors">
                  <td className="px-6 py-6">
                    <span className="font-light text-white text-base">Acesso Antecipado</span>
                  </td>
                  <td className="px-6 py-6">
                    <span className="text-zinc-300">
                      Prioridade na inscrição de eventos, provas e lançamentos de produtos do SOMMA
                    </span>
                  </td>
                </tr>

                <tr className="hover:bg-zinc-950/50 transition-colors">
                  <td className="px-6 py-6">
                    <span className="font-light text-white text-base">Conteúdos Exclusivos</span>
                  </td>
                  <td className="px-6 py-6">
                    <span className="text-zinc-300">
                      Dicas de treino, nutrição, prevenção de lesões e preparação para provas
                    </span>
                  </td>
                </tr>

                <tr className="hover:bg-zinc-950/50 transition-colors">
                  <td className="px-6 py-6">
                    <span className="font-light text-white text-base">Ativações de Parceiros</span>
                  </td>
                  <td className="px-6 py-6">
                    <span className="text-zinc-300">
                      Participação em ações especiais com marcas parceiras (testes de produtos, brindes, sorteios)
                    </span>
                  </td>
                </tr>

                <tr className="hover:bg-zinc-950/50 transition-colors">
                  <td className="px-6 py-6">
                    <span className="font-light text-white text-base">Concierge para Provas</span>
                  </td>
                  <td className="px-6 py-6">
                    <span className="text-zinc-300">
                      Suporte na organização de caravanas para provas em outras cidades, incluindo logística e
                      hospedagem
                    </span>
                  </td>
                </tr>

                <tr className="hover:bg-zinc-950/50 transition-colors">
                  <td className="px-6 py-6">
                    <span className="font-light text-white text-base">Kit de Boas-Vindas</span>
                  </td>
                  <td className="px-6 py-6">
                    <span className="text-zinc-300">
                      Brinde exclusivo para novos membros (sujeito a disponibilidade)
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* SOMMA Club Pricing Section */}
      <section className="relative z-20 py-20 md:py-24 lg:pb-32">
        <div className="container p-8 md:p-12 rounded-2xl z-50 bg-[#09090b] border border-zinc-800 mx-auto px-6 lg:px-12">
          <h2 className="text-3xl md:text-4xl lg:text-6xl font-light mb-4 md:mb-6 text-balance">
            Planos de Assinatura
          </h2>

          <p className="text-base md:text-lg lg:text-xl text-zinc-400 mb-8 md:mb-12">
            O SOMMA Club oferece opções flexíveis para você escolher o plano que melhor se encaixa na sua rotina e
            objetivos.
          </p>

          <div className="relative min-h-[600px] md:min-h-[500px]">
            {/* Mobile Carousel - Blurred */}
            <div className="lg:hidden relative">
              <div className="blur-sm pointer-events-none">
                <PricingCarousel />
              </div>
            </div>

            {/* Desktop Grid - Blurred */}
            <div className="hidden lg:grid grid-cols-4 gap-6 blur-sm pointer-events-none">
              {/* Mensal Plan */}
              <div className="relative rounded-xl border border-zinc-800 bg-zinc-950/50 p-8 hover:border-zinc-700 transition-colors">
                <div className="mb-6">
                  <h3 className="text-2xl font-light text-white mb-2">Mensal</h3>
                  <p className="text-sm text-zinc-400">1 mês</p>
                </div>

                <div className="mb-8">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-light text-white">R$ 49,90</span>
                    <span className="text-zinc-400">/mês</span>
                  </div>
                </div>

                <button className="w-full py-3 px-4 rounded-lg border border-zinc-700 text-white font-light hover:bg-zinc-900 transition-colors">
                  Começar Agora
                </button>
              </div>

              {/* Trimestral Plan */}
              <div className="relative rounded-xl border border-zinc-800 bg-zinc-950/50 p-8 hover:border-zinc-700 transition-colors">
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-2xl font-light text-white">Trimestral</h3>
                    <span className="px-2 py-1 bg-[#ff4f2d]/20 text-[#ff4f2d] text-xs font-light rounded">-10%</span>
                  </div>
                  <p className="text-sm text-zinc-400">3 meses</p>
                </div>

                <div className="mb-8">
                  <div className="flex items-baseline gap-1 mb-1">
                    <span className="text-4xl font-light text-white">R$ 44,90</span>
                    <span className="text-zinc-400">/mês</span>
                  </div>
                  <p className="text-sm text-zinc-500">Total: R$ 134,70</p>
                </div>

                <button className="w-full py-3 px-4 rounded-lg bg-[#ff4f2d]/10 border border-[#ff4f2d]/50 text-[#ff4f2d] font-light hover:bg-[#ff4f2d]/20 transition-colors">
                  Começar Agora
                </button>
              </div>

              {/* Semestral Plan */}
              <div className="relative rounded-xl border border-[#ff4f2d]/50 bg-zinc-950/50 p-8 hover:border-[#ff4f2d] transition-colors">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                  <span className="px-4 py-1 bg-[#ff4f2d] text-black text-xs font-bold rounded-full">MAIS POPULAR</span>
                </div>

                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-2xl font-light text-white">Semestral</h3>
                    <span className="px-2 py-1 bg-[#ff4f2d]/20 text-[#ff4f2d] text-xs font-light rounded">-20%</span>
                  </div>
                  <p className="text-sm text-zinc-400">6 meses</p>
                </div>

                <div className="mb-8">
                  <div className="flex items-baseline gap-1 mb-1">
                    <span className="text-4xl font-light text-white">R$ 39,90</span>
                    <span className="text-zinc-400">/mês</span>
                  </div>
                  <p className="text-sm text-zinc-500">Total: R$ 239,40</p>
                </div>

                <button className="w-full py-3 px-4 rounded-lg bg-[#ff4f2d] text-black font-light hover:bg-[#ff6647] transition-colors">
                  Começar Agora
                </button>
              </div>

              {/* Anual Plan */}
              <div className="relative rounded-xl border border-zinc-800 bg-zinc-950/50 p-8 hover:border-zinc-700 transition-colors">
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-2xl font-light text-white">Anual</h3>
                    <span className="px-2 py-1 bg-[#ff4f2d]/20 text-[#ff4f2d] text-xs font-light rounded">-30%</span>
                  </div>
                  <p className="text-sm text-zinc-400">12 meses</p>
                </div>

                <div className="mb-8">
                  <div className="flex items-baseline gap-1 mb-1">
                    <span className="text-4xl font-light text-white">R$ 34,90</span>
                    <span className="text-zinc-400">/mês</span>
                  </div>
                  <p className="text-sm text-zinc-500">Total: R$ 418,80</p>
                </div>

                <button className="w-full py-3 px-4 rounded-lg border border-zinc-700 text-white font-light hover:bg-zinc-900 transition-colors">
                  Começar Agora
                </button>
              </div>
            </div>

            <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px] rounded-xl">
              <button
                onClick={scrollToCapabilities}
                className="group bg-[#ff4f2d] hover:bg-[#ff6647] text-white px-6 md:px-8 py-3 md:py-4 text-base md:text-lg font-light rounded-full transition-all duration-[650ms] hover:scale-[1.05]"
              >
                Entre na lista VIP
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <FAQSection />
    </main>
  )
}
