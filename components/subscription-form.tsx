"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { SuccessModal } from "./success-modal"

const CITIES = [
  "Brasília",
  "Águas Claras",
  "Arniqueira",
  "Ceilândia",
  "Cruzeiro",
  "Gama",
  "Guará",
  "Lago Norte",
  "Lago Sul",
  "Paranoá",
  "Park Way",
  "Recanto das Emas",
  "Riacho Fundo",
  "Riacho Fundo II",
  "Samambaia",
  "Santa Maria",
  "São Sebastião",
  "Setor Complementar de Indústria e Abastecimento (SCIA)",
  "Setor de Indústria e Abastecimento (SIA)",
  "Setor Tradicional",
  "Sobradinho",
  "Sobradinho II",
  "Sudoeste",
  "Taguatinga",
  "Varjão",
  "Vicente Pires",
  "Planaltina",
  "Novo Gama",
  "Santo Antônio do Descoberto",
  "Cidade Ocidental",
  "Luziânia",
  "Valparaíso de Goiás",
  "Águas Lindas de Goiás",
  "Cristalina",
  "Unaí",
  "Pirenópolis",
  "Anápolis",
  "Goiânia",
]

export function SubscriptionForm() {
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    whatsapp: "",
    cidade: "",
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate form submission
    setTimeout(() => {
      console.log("Form submitted:", formData)
      setIsSubmitting(false)
      setShowSuccessModal(true)
      // Reset form
      setFormData({
        nome: "",
        email: "",
        whatsapp: "",
        cidade: "",
      })
    }, 1000)
  }

  const handleCloseModal = () => {
    setShowSuccessModal(false)
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto px-4 sm:px-6 space-y-4 sm:space-y-6">
        {/* Nome */}
        <div>
          <label htmlFor="nome" className="block text-xs sm:text-sm font-light text-white mb-2">
            Nome
          </label>
          <input
            type="text"
            id="nome"
            name="nome"
            value={formData.nome}
            onChange={handleChange}
            required
            placeholder="Seu nome completo"
            className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-zinc-950 border border-zinc-800 rounded-lg text-white text-sm placeholder-zinc-500 focus:outline-none focus:border-[#ff4f2d] focus:ring-1 focus:ring-[#ff4f2d] transition-all"
          />
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-xs sm:text-sm font-light text-white mb-2">
            E-mail
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            placeholder="seu@email.com"
            className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-zinc-950 border border-zinc-800 rounded-lg text-white text-sm placeholder-zinc-500 focus:outline-none focus:border-[#ff4f2d] focus:ring-1 focus:ring-[#ff4f2d] transition-all"
          />
        </div>

        {/* WhatsApp */}
        <div>
          <label htmlFor="whatsapp" className="block text-xs sm:text-sm font-light text-white mb-2">
            WhatsApp
          </label>
          <input
            type="tel"
            id="whatsapp"
            name="whatsapp"
            value={formData.whatsapp}
            onChange={handleChange}
            required
            placeholder="(61) 98765-4321"
            className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-zinc-950 border border-zinc-800 rounded-lg text-white text-sm placeholder-zinc-500 focus:outline-none focus:border-[#ff4f2d] focus:ring-1 focus:ring-[#ff4f2d] transition-all"
          />
        </div>

        {/* Cidade */}
        <div>
          <label htmlFor="cidade" className="block text-xs sm:text-sm font-light text-white mb-2">
            Cidade
          </label>
          <select
            id="cidade"
            name="cidade"
            value={formData.cidade}
            onChange={handleChange}
            required
            className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-zinc-950 border border-zinc-800 rounded-lg text-white text-sm focus:outline-none focus:border-[#ff4f2d] focus:ring-1 focus:ring-[#ff4f2d] transition-all appearance-none cursor-pointer"
          >
            <option value="">Selecione uma cidade</option>
            {CITIES.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-[#ff4f2d] hover:bg-[#ff6647] text-white py-2 sm:py-3 rounded-lg font-light text-sm sm:text-base transition-all duration-300 mt-6 sm:mt-8"
        >
          {isSubmitting ? "Inscrevendo..." : "Inscreva-se no SOMMA Club"}
        </Button>
      </form>
      <SuccessModal isOpen={showSuccessModal} onClose={handleCloseModal} />
    </>
  )
}
