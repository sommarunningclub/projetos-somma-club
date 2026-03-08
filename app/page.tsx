"use client"

import Image from "next/image"
import { PricingPlans } from "@/components/pricing-plans"
import { Navbar } from "@/components/navbar"
import Link from "next/link"

export default function Home() {
  return (
    <main className="bg-black text-white overflow-hidden">
      <Navbar />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center border-b border-white/10 pt-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-12">
          <div className="max-w-4xl mx-auto">
            {/* Stats Header */}
            <div className="flex flex-col sm:flex-row gap-6 sm:gap-12 mb-16 pb-16 border-b border-white/10">
              <div className="flex-1">
                <p className="text-xs sm:text-sm font-light text-white/60 mb-2">BRASÍLIA, DF</p>
                <p className="text-xs sm:text-sm font-light text-white/60">ASSESSORIA SOMMA CLUB</p>
              </div>
              <div className="flex-1 text-right">
                <p className="text-xs sm:text-sm font-light text-white/60 mb-2">50+ ATLETAS</p>
                <p className="text-xs sm:text-sm font-light text-white/60">ASSESSORADOS</p>
              </div>
            </div>

            {/* Main Headline */}
            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-light leading-[1] mb-6 text-balance">
              Treinamento
              <br />
              <span className="text-[#ff4f2d]">Inteligente</span>
            </h1>

            {/* Subheading */}
            <p className="text-sm sm:text-base md:text-lg text-white/70 mb-12 max-w-xl leading-relaxed">
              Planejamento profissional, acompanhamento personalizado e resultados comprovados. Para corredores que buscam evoluir com propósito.
            </p>

            {/* CTA Links */}
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
              <Link
                href="#beneficios"
                className="text-white hover:text-[#ff4f2d] transition-colors text-sm font-light border-b border-white/30 hover:border-[#ff4f2d] pb-2"
              >
                Explorar Benefícios ↗
              </Link>
              <Link
                href="#planos"
                className="text-white hover:text-[#ff4f2d] transition-colors text-sm font-light border-b border-white/30 hover:border-[#ff4f2d] pb-2"
              >
                Escolha seu plano ↓
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* O que é Somma */}
      <section className="border-b border-white/10 py-20 md:py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20">
            {/* Left: Stats */}
            <div className="flex items-center">
              <div>
                <div className="text-6xl sm:text-7xl md:text-8xl font-light text-[#ff4f2d] mb-4">50+</div>
                <p className="text-xs sm:text-sm font-light text-white/60">ATLETAS ASSESSORADOS</p>
              </div>
            </div>

            {/* Right: Text */}
            <div>
              <h2 className="text-sm font-light text-white/60 mb-6 uppercase tracking-wider">O QUE É</h2>
              <h3 className="text-3xl sm:text-4xl md:text-5xl font-light leading-[1.2] mb-8">
                Somma Running Club
              </h3>
              <div className="space-y-6 text-sm sm:text-base text-white/70 leading-relaxed">
                <p>
                  O Somma Running Club é mais do que um grupo de corrida. Somos um movimento que mistura esporte, comunidade, estilo de vida e pertencimento. Fundado em Brasília, conectamos corredores de todos os níveis em torno de um objetivo comum: transformar a corrida em uma experiência coletiva.
                </p>
                <p>
                  Nossa estrutura funciona em dois níveis: o Running Club, que representa a comunidade ampla; e a Assessoria Somma, que oferece acompanhamento técnico profissional para quem deseja evoluir.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Para Quem É */}
      <section className="border-b border-white/10 py-20 md:py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-12">
          <h2 className="text-sm font-light text-white/60 mb-16 uppercase tracking-wider">QUEM SOMOS NÓS</h2>

          <div className="space-y-16 md:space-y-20">
            {/* Item 01 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-start pb-12 md:pb-16 border-b border-white/10">
              <div>
                <div className="text-5xl sm:text-6xl font-light text-white/20 mb-4">01</div>
                <h3 className="text-xl sm:text-2xl md:text-3xl font-light mb-4">Corredores Iniciantes</h3>
                <p className="text-sm sm:text-base text-white/60 leading-relaxed">
                  Buscando estrutura para começar de forma segura, com planejamento individualizado que respeita seus limites.
                </p>
              </div>
              <div className="relative h-72 md:h-96 border border-white/10 rounded-sm overflow-hidden">
                <Image
                  src="https://cdn.shopify.com/s/files/1/0788/1932/8253/files/Design_sem_nome_26.png?v=1772737763"
                  alt="Corredores Iniciantes"
                  fill
                  className="object-cover object-center"
                />
              </div>
            </div>

            {/* Item 02 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-start pb-12 md:pb-16 border-b border-white/10">
              <div>
                <div className="text-5xl sm:text-6xl font-light text-white/20 mb-4">02</div>
                <h3 className="text-xl sm:text-2xl md:text-3xl font-light mb-4">Atletas Experientes</h3>
                <p className="text-sm sm:text-base text-white/60 leading-relaxed">
                  Querendo alcançar novos objetivos e melhorar performance com acompanhamento técnico de nível profissional.
                </p>
              </div>
              <div className="relative h-72 md:h-96 border border-white/10 rounded-sm overflow-hidden">
                <Image
                  src="https://cdn.shopify.com/s/files/1/0788/1932/8253/files/Design_sem_nome_28.png?v=1772914791"
                  alt="Atletas Experientes"
                  fill
                  className="object-cover object-center"
                />
              </div>
            </div>

            {/* Item 03 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-start">
              <div>
                <div className="text-5xl sm:text-6xl font-light text-white/20 mb-4">03</div>
                <h3 className="text-xl sm:text-2xl md:text-3xl font-light mb-4">Comunidade</h3>
                <p className="text-sm sm:text-base text-white/60 leading-relaxed">
                  Fazendo parte de um movimento que leva a corrida a sério, com networking, amizades e transformação pessoal.
                </p>
              </div>
              <div className="relative h-72 md:h-96 border border-white/10 rounded-sm overflow-hidden">
                <Image
                  src="https://cdn.shopify.com/s/files/1/0788/1932/8253/files/Design_sem_nome_29.png?v=1772915059"
                  alt="Comunidade"
                  fill
                  className="object-cover object-center"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Metodologia */}
      <section className="border-b border-white/10 py-20 md:py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-12 max-w-4xl">
          <h2 className="text-sm font-light text-white/60 mb-12 uppercase tracking-wider">METODOLOGIA</h2>

          <h3 className="text-4xl sm:text-5xl md:text-6xl font-light leading-[1.2] mb-12">
            Treinamento Baseado em Ciência
          </h3>

          <div className="space-y-8 text-sm sm:text-base text-white/70 leading-relaxed">
            <p>
              Na Assessoria Somma, acreditamos em treinamento personalizado para cada atleta. Não se trata apenas de correr mais, mas de treinar de forma inteligente, respeitando seus limites e potencializando seus resultados.
            </p>

            <p>
              Nossa metodologia combina periodização, controle de cargas, análise de métricas e acompanhamento individualizado para garantir evolução constante e segura.
            </p>

            <p className="text-[#ff4f2d]">
              Com integração de tecnologia via app, monitoramento Strava e feedback contínuo, você terá o suporte necessário para alcançar seus objetivos na corrida.
            </p>
          </div>
        </div>
      </section>

      {/* Como Funciona */}
      <section className="border-b border-white/10 py-20 md:py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-12 max-w-4xl">
          <h2 className="text-sm font-light text-white/60 mb-12 uppercase tracking-wider">COMO FUNCIONA</h2>

          <h3 className="text-4xl sm:text-5xl md:text-6xl font-light leading-[1.2] mb-12">
            Acompanhamento Digital
          </h3>

          <div className="space-y-8">
            <div className="pb-8 border-b border-white/10">
              <h4 className="text-sm font-light text-white/60 mb-4 uppercase">PLANEJAMENTO</h4>
              <p className="text-sm sm:text-base text-white/70 leading-relaxed">
                Você receberá seu planejamento de treinos semanalmente via aplicativo integrado. Todo o acompanhamento é feito de forma digital, com análise das suas métricas, ajustes de plano e feedback personalizado.
              </p>
            </div>

            <div className="pb-8 border-b border-white/10">
              <h4 className="text-sm font-light text-white/60 mb-4 uppercase">MONITORAMENTO</h4>
              <p className="text-sm sm:text-base text-white/70 leading-relaxed">
                Através da integração com Strava e relógios GPS, monitoramos sua evolução, ritmos, frequência cardíaca e demais dados importantes para otimizar seus resultados.
              </p>
            </div>

            <div>
              <h4 className="text-sm font-light text-white/60 mb-4 uppercase">COMUNIDADE</h4>
              <p className="text-sm sm:text-base text-white/70 leading-relaxed">
                Você terá acesso a um grupo exclusivo para tirar dúvidas e interagir com outros assessorados, além de encontros mensais e eventos especiais.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefícios & Planos */}
      <section id="beneficios" className="py-20 md:py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-12">
          <h2 className="text-sm font-light text-white/60 mb-8 uppercase tracking-wider">ASSESSORIA SOMMA</h2>

          <div id="planos">
            <PricingPlans />
          </div>
        </div>
      </section>
    </main>
  )
}
