"use client"

import { X } from "lucide-react"

interface SuccessModalProps {
  isOpen: boolean
  onClose: () => void
}

export function SuccessModal({ isOpen, onClose }: SuccessModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-md w-full p-8 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-white transition-colors"
          aria-label="Fechar"
        >
          <X size={24} />
        </button>

        {/* Success Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-[#ff4f2d] rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-2xl font-light text-white text-center mb-4">Inscrição Realizada com Sucesso!</h3>

        {/* Description */}
        <p className="text-zinc-300 text-center text-sm leading-relaxed mb-6">
          Parabéns! Você agora está na nossa lista VIP do SOMMA Club. Você será notificado assim que as inscrições
          oficiais abrirem com condições exclusivas de lançamento.
        </p>

        {/* Social Networks */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 mb-6">
          <p className="text-white text-sm font-light mb-3">Fique ligado(a) nas nossas redes:</p>
          <div className="flex gap-3 justify-center">
            <a
              href="https://instagram.com/sommaclub"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#ff4f2d] hover:text-[#ff6647] transition-colors text-sm"
            >
              Instagram
            </a>
            <span className="text-zinc-600">•</span>
            <a
              href="https://facebook.com/sommaclub"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#ff4f2d] hover:text-[#ff6647] transition-colors text-sm"
            >
              Facebook
            </a>
            <span className="text-zinc-600">•</span>
            <a
              href="https://tiktok.com/@sommaclub"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#ff4f2d] hover:text-[#ff6647] transition-colors text-sm"
            >
              TikTok
            </a>
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="w-full bg-[#ff4f2d] hover:bg-[#ff6647] text-white py-3 rounded-lg font-light transition-all duration-300"
        >
          Fechar
        </button>
      </div>
    </div>
  )
}
