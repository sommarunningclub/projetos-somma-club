"use client"

import { Menu, X, ChevronRight } from "lucide-react"
import { useState } from "react"

export function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false)
  const [showMundoSomma, setShowMundoSomma] = useState(false)

  const closeMenu = () => {
    setIsOpen(false)
    setShowMundoSomma(false)
  }

  return (
    <div className="relative">
      <button
        className="p-1.5 sm:p-2 text-white hover:text-[#ff4f2d] transition-colors duration-300"
        aria-label="Menu"
        aria-expanded={isOpen}
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={closeMenu} aria-hidden="true" />

          {/* Menu panel */}
          <div className="absolute right-0 top-full mt-2 bg-zinc-950/95 backdrop-blur-xl border border-zinc-800 rounded-xl w-56 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-200 overflow-hidden">
            <div className="py-2">
              {/* Mundo Somma */}
              <button
                onClick={() => setShowMundoSomma(!showMundoSomma)}
                className="w-full px-4 py-3 text-sm text-white hover:bg-zinc-900/50 transition-colors flex items-center justify-between"
              >
                <span>Mundo Somma</span>
                <ChevronRight
                  className={`w-4 h-4 text-zinc-500 transition-transform duration-200 ${showMundoSomma ? "rotate-90" : ""}`}
                />
              </button>

              {showMundoSomma && (
                <div className="bg-zinc-900/30 border-t border-zinc-800">
                  <a
                    href="https://sommaclub.com.br/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block px-6 py-2.5 text-sm text-zinc-400 hover:text-[#ff4f2d] transition-colors"
                    onClick={closeMenu}
                  >
                    Site
                  </a>
                  <a
                    href="https://loja.sommaclub.com.br/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block px-6 py-2.5 text-sm text-zinc-400 hover:text-[#ff4f2d] transition-colors"
                    onClick={closeMenu}
                  >
                    Loja Somma
                  </a>
                </div>
              )}

              {/* Divider */}
              <div className="h-px bg-zinc-800 my-2" />
              <a
                href="https://wa.me/5561995372477?text=Ol%C3%A1%2C%20tudo%20bem%3F%20Quero%20saber%20mais%20informa%C3%A7%C3%B5es%20sobre%20a%20Assessoria%20Somma"
                target="_blank"
                rel="noopener noreferrer"
                className="block px-4 py-3 text-sm text-white hover:bg-zinc-900/50 transition-colors"
                onClick={closeMenu}
              >
                Contato
              </a>

            </div>
          </div>
        </>
      )}
    </div>
  )
}
