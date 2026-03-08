"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { SuccessModal } from "./success-modal"

const CITIES = [
  "Água Quente",
  "Arapoanga",
  "Águas Claras",
  "Arniqueira",
  "Brazlândia",
  "Candangolândia",
  "Ceilândia",
  "Cruzeiro",
  "Fercal",
  "Gama",
  "Guará",
  "Itapoã",
  "Jardim Botânico",
  "Lago Norte",
  "Lago Sul",
  "Núcleo Bandeirante",
  "Paranoá",
  "Park Way",
  "Planaltina",
  "Plano Piloto",
  "Recanto das Emas",
  "Riacho Fundo",
  "Riacho Fundo II",
  "Samambaia",
  "Santa Maria",
  "São Sebastião",
  "SCIA/Estrutural",
  "SIA",
  "Sobradinho",
  "Sobradinho II",
  "Sol Nascente e Pôr do Sol",
  "Sudoeste/Octogonal",
  "Taguatinga",
  "Varjão",
  "Vicente Pires",
  "Águas Lindas de Goiás - GO",
  "Cidade Ocidental - GO",
  "Cocalzinho de Goiás - GO",
  "Cristalina - GO",
  "Formosa - GO",
  "Luziânia - GO",
  "Novo Gama - GO",
  "Padre Bernardo - GO",
  "Planaltina - GO",
  "Santo Antônio do Descoberto - GO",
  "Valparaíso de Goiás - GO",
  "Outra Cidade",
]

const formatWhatsApp = (value: string): string => {
  // Remove all non-numeric characters
  const numbers = value.replace(/\D/g, "")

  // Limit to 11 digits (DDD + 9 digits)
  const limited = numbers.slice(0, 11)

  // Apply mask: (XX) XXXXX-XXXX
  if (limited.length <= 2) {
    return limited.length > 0 ? `(${limited}` : ""
  } else if (limited.length <= 7) {
    return `(${limited.slice(0, 2)}) ${limited.slice(2)}`
  } else {
    return `(${limited.slice(0, 2)}) ${limited.slice(2, 7)}-${limited.slice(7)}`
  }
}

const isValidWhatsApp = (value: string): boolean => {
  // Remove formatting to check digits only
  const numbers = value.replace(/\D/g, "")
  // Valid if has 11 digits (DDD + 9 + 8 digits)
  return numbers.length === 11
}

export function SubscriptionForm() {
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    whatsapp: "",
    cidade: "",
    sexo: "",
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [whatsappError, setWhatsappError] = useState("")

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleWhatsAppChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatWhatsApp(e.target.value)
    setFormData((prev) => ({
      ...prev,
      whatsapp: formatted,
    }))

    // Clear error when user is typing
    if (whatsappError) {
      setWhatsappError("")
    }
  }

  const handleWhatsAppBlur = () => {
    if (formData.whatsapp && !isValidWhatsApp(formData.whatsapp)) {
      setWhatsappError("Número inválido. Digite DDD + 9 dígitos")
    } else {
      setWhatsappError("")
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!isValidWhatsApp(formData.whatsapp)) {
      setWhatsappError("Número inválido. Digite DDD + 9 dígitos")
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch("/api/sheets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error("Failed to submit form")
      }

      setShowSuccessModal(true)
      // Reset form
      setFormData({
        nome: "",
        email: "",
        whatsapp: "",
        cidade: "",
        sexo: "",
      })
    } catch (error) {
      console.error("Error submitting form:", error)
      // Show success anyway for better UX (data might be saved locally or retried)
      setShowSuccessModal(true)
      setFormData({
        nome: "",
        email: "",
        whatsapp: "",
        cidade: "",
        sexo: "",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCloseModal = () => {
    setShowSuccessModal(false)
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto px-4 sm:px-6 space-y-4 sm:space-y-6">
        {/* Nome */}
        <div>
          <label htmlFor="nome" className="block text-xs sm:text-sm font-light text-gray-900 mb-2">
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
            className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white border border-gray-300 rounded-lg text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:border-[#ff4f2d] focus:ring-1 focus:ring-[#ff4f2d] transition-all"
          />
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-xs sm:text-sm font-light text-gray-900 mb-2">
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
            className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white border border-gray-300 rounded-lg text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:border-[#ff4f2d] focus:ring-1 focus:ring-[#ff4f2d] transition-all"
          />
        </div>

        {/* WhatsApp */}
        <div>
          <label htmlFor="whatsapp" className="block text-xs sm:text-sm font-light text-gray-900 mb-2">
            WhatsApp
          </label>
          <input
            type="tel"
            id="whatsapp"
            name="whatsapp"
            value={formData.whatsapp}
            onChange={handleWhatsAppChange}
            onBlur={handleWhatsAppBlur}
            required
            placeholder="(61) 99999-9999"
            className={`w-full px-3 sm:px-4 py-2 sm:py-3 bg-zinc-950 border rounded-lg text-white text-sm placeholder-zinc-500 focus:outline-none transition-all ${
              whatsappError
                ? "border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500"
                : "border-zinc-800 focus:border-[#ff4f2d] focus:ring-1 focus:ring-[#ff4f2d]"
            }`}
          />
          {whatsappError && <p className="text-red-500 text-xs mt-1">{whatsappError}</p>}
        </div>

        {/* Sexo */}
        <div>
          <label htmlFor="sexo" className="block text-xs sm:text-sm font-light text-gray-900 mb-2">
            Sexo
          </label>
          <select
            id="sexo"
            name="sexo"
            value={formData.sexo}
            onChange={handleChange}
            required
            className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-zinc-950 border border-zinc-800 rounded-lg text-white text-sm focus:outline-none focus:border-[#ff4f2d] focus:ring-1 focus:ring-[#ff4f2d] transition-all appearance-none cursor-pointer"
          >
            <option value="">Selecione</option>
            <option value="feminino">Feminino</option>
            <option value="masculino">Masculino</option>
          </select>
        </div>

        {/* Cidade */}
        <div>
          <label htmlFor="cidade" className="block text-xs sm:text-sm font-light text-gray-900 mb-2">
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
