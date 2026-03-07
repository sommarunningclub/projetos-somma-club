"use client"

import { useState } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight, X } from "lucide-react"

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
  const [isModalOpen, setIsModalOpen] = useState(false)

  const next = () => {
    setCurrentIndex((prev) => (prev + 1) % kitImages.length)
  }

  const prev = () => {
    setCurrentIndex((prev) => (prev - 1 + kitImages.length) % kitImages.length)
  }

  const goToSlide = (index: number) => {
    setCurrentIndex(index)
  }

  const handleModalNext = () => {
    setCurrentIndex((prev) => (prev + 1) % kitImages.length)
  }

  const handleModalPrev = () => {
    setCurrentIndex((prev) => (prev - 1 + kitImages.length) % kitImages.length)
  }

  return (
    <>
      <div className="space-y-3">
        {/* Carousel */}
        <button
          onClick={() => setIsModalOpen(true)}
          className="relative w-full overflow-hidden rounded-lg bg-white/[0.02] border border-white/10 aspect-square group"
        >
          <Image
            src={kitImages[currentIndex].src}
            alt={kitImages[currentIndex].alt}
            fill
            className="object-cover group-hover:opacity-90 transition-opacity"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
            <div className="opacity-0 group-hover:opacity-100 transition-opacity text-white text-sm font-light">
              Clique para ampliar
            </div>
          </div>
        </button>

        {/* Navigation arrows */}
        <div className="flex justify-between gap-2">
          <button
            onClick={prev}
            className="flex-1 py-2 px-3 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center text-white transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={next}
            className="flex-1 py-2 px-3 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center text-white transition-colors"
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
              title={`Slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4">
          {/* Close button */}
          <button
            onClick={() => setIsModalOpen(false)}
            className="absolute top-4 right-4 p-2 text-white/60 hover:text-white transition-colors z-10"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Modal content */}
          <div className="w-full h-full max-w-4xl max-h-[90vh] flex flex-col items-center justify-center gap-4">
            {/* Image */}
            <div className="relative w-full h-full max-h-[80vh] rounded-lg overflow-hidden bg-white/5">
              <Image
                src={kitImages[currentIndex].src}
                alt={kitImages[currentIndex].alt}
                fill
                className="object-contain"
              />
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between w-full gap-3">
              <button
                onClick={handleModalPrev}
                className="p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              {/* Dots */}
              <div className="flex justify-center gap-2">
                {kitImages.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentIndex(idx)}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      idx === currentIndex ? "bg-[#ff4f2d]" : "bg-white/20 hover:bg-white/40"
                    }`}
                  />
                ))}
              </div>

              <button
                onClick={handleModalNext}
                className="p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Counter */}
            <p className="text-xs text-white/50">
              {currentIndex + 1} de {kitImages.length}
            </p>
          </div>
        </div>
      )}
    </>
  )
}
