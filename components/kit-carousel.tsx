"use client"

import { useState } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight } from "lucide-react"

const kitImages = [
  {
    src: "https://cdn.shopify.com/s/files/1/0788/1932/8253/files/4_c03974c2-1a3c-4f6a-8735-05e719ee1323.png?v=1772201099",
    alt: "Kit Assessoria completo",
  },
  {
    src: "https://cdn.shopify.com/s/files/1/0788/1932/8253/files/IMG-0722.heic?v=1772275640",
    alt: "Kit Assessoria detalhe 1",
  },
  {
    src: "https://cdn.shopify.com/s/files/1/0788/1932/8253/files/IMG-0725.heic?v=1772275583",
    alt: "Kit Assessoria detalhe 2",
  },
  {
    src: "https://cdn.shopify.com/s/files/1/0788/1932/8253/files/IMG-0718.heic?v=1772275264",
    alt: "Kit Assessoria detalhe 3",
  },
  {
    src: "https://cdn.shopify.com/s/files/1/0788/1932/8253/files/IMG-0719.heic?v=1772275640",
    alt: "Kit Assessoria detalhe 4",
  },
]

export function KitCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0)

  const next = () => {
    setCurrentIndex((prev) => (prev + 1) % kitImages.length)
  }

  const prev = () => {
    setCurrentIndex((prev) => (prev - 1 + kitImages.length) % kitImages.length)
  }

  const goToSlide = (index: number) => {
    setCurrentIndex(index)
  }

  return (
    <div className="space-y-3">
      {/* Carousel */}
      <div className="relative overflow-hidden rounded-lg bg-white/[0.02] border border-white/10 h-64">
        <div className="relative w-full h-full">
          <Image
            src={kitImages[currentIndex].src}
            alt={kitImages[currentIndex].alt}
            fill
            className="object-contain"
          />
        </div>

        {/* Navigation arrows */}
        <button
          onClick={prev}
          className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/40 hover:bg-black/60 rounded-full flex items-center justify-center text-white transition-colors z-10"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button
          onClick={next}
          className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/40 hover:bg-black/60 rounded-full flex items-center justify-center text-white transition-colors z-10"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Dots */}
      <div className="flex justify-center gap-2">
        {kitImages.map((_, idx) => (
          <button
            key={idx}
            onClick={() => goToSlide(idx)}
            className={`w-2 h-2 rounded-full transition-colors ${
              idx === currentIndex ? "bg-[#ff4f2d]" : "bg-white/20 hover:bg-white/40"
            }`}
          />
        ))}
      </div>
    </div>
  )
}
