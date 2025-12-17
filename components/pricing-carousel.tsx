"use client"

import { useState, useRef, useEffect } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

const plans = [
  {
    name: "Mensal",
    duration: "1 mês",
    monthlyPrice: 49.9,
    totalPrice: 49.9,
    savings: null,
    isPopular: false,
  },
  {
    name: "Trimestral",
    duration: "3 meses",
    monthlyPrice: 44.9,
    totalPrice: 134.7,
    savings: 10,
    isPopular: false,
  },
  {
    name: "Semestral",
    duration: "6 meses",
    monthlyPrice: 39.9,
    totalPrice: 239.4,
    savings: 20,
    isPopular: true,
  },
  {
    name: "Anual",
    duration: "12 meses",
    monthlyPrice: 34.9,
    totalPrice: 418.8,
    savings: 30,
    isPopular: false,
  },
]

export function PricingCarousel() {
  const [currentIndex, setCurrentIndex] = useState(1)
  const carouselRef = useRef<HTMLDivElement>(null)

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? plans.length - 1 : prev - 1))
  }

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === plans.length - 1 ? 0 : prev + 1))
  }

  useEffect(() => {
    if (carouselRef.current) {
      carouselRef.current.style.transform = `translateX(-${currentIndex * 100}%)`
    }
  }, [currentIndex])

  return (
    <div className="lg:hidden space-y-6">
      {/* Carousel Container */}
      <div className="relative overflow-hidden">
        <div ref={carouselRef} className="flex transition-transform duration-500 ease-out">
          {plans.map((plan, index) => (
            <div key={index} className="w-full flex-shrink-0 px-4">
              <div
                className={`relative rounded-xl border p-8 ${
                  plan.isPopular ? "border-[#ff4f2d]/50 bg-zinc-950/50" : "border-zinc-800 bg-zinc-950/50"
                } hover:border-zinc-700 transition-colors`}
              >
                {plan.isPopular && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                    <span className="px-4 py-1 bg-[#ff4f2d] text-black text-xs font-bold rounded-full">
                      MAIS POPULAR
                    </span>
                  </div>
                )}

                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-2xl font-light text-white">{plan.name}</h3>
                    {plan.savings && (
                      <span className="px-2 py-1 bg-[#ff4f2d]/20 text-[#ff4f2d] text-xs font-light rounded">
                        -{plan.savings}%
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-zinc-400">{plan.duration}</p>
                </div>

                <div className="mb-8">
                  <div className="flex items-baseline gap-1 mb-1">
                    <span className="text-4xl font-light text-white">
                      R$ {plan.monthlyPrice.toFixed(2).replace(".", ",")}
                    </span>
                    <span className="text-zinc-400">/mês</span>
                  </div>
                  <p className="text-sm text-zinc-500">Total: R$ {plan.totalPrice.toFixed(2).replace(".", ",")}</p>
                </div>

                <button
                  className={`w-full py-3 px-4 rounded-lg font-light transition-colors ${
                    plan.isPopular
                      ? "bg-[#ff4f2d] text-black hover:bg-[#ff6647]"
                      : "border border-zinc-700 text-white hover:bg-zinc-900"
                  }`}
                >
                  Começar Agora
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Navigation Buttons */}
        <button
          onClick={handlePrev}
          className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-6 z-10 p-2 rounded-full border border-zinc-800 hover:border-[#ff4f2d] hover:text-[#ff4f2d] transition-colors"
          aria-label="Plano anterior"
        >
          <ChevronLeft size={20} />
        </button>
        <button
          onClick={handleNext}
          className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-6 z-10 p-2 rounded-full border border-zinc-800 hover:border-[#ff4f2d] hover:text-[#ff4f2d] transition-colors"
          aria-label="Próximo plano"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Indicator Dots */}
      <div className="flex justify-center gap-2">
        {plans.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`h-2 rounded-full transition-all ${
              index === currentIndex ? "bg-[#ff4f2d] w-8" : "bg-zinc-700 w-2 hover:bg-zinc-600"
            }`}
            aria-label={`Ir para plano ${index + 1}`}
          />
        ))}
      </div>
    </div>
  )
}
