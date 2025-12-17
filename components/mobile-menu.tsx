"use client"

import { Menu, X } from "lucide-react"
import { useState } from "react"
import { ResourcesDropdown } from "./resources-dropdown"

export function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false)

  const closeMenu = () => setIsOpen(false)

  return (
    <div className="relative">
      <button
        className="p-2 text-white hover:text-[#ff4f2d] transition-colors duration-300"
        aria-label="Menu"
        aria-expanded={isOpen}
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 bg-black/30 z-40 md:hidden" onClick={closeMenu} aria-hidden="true" />

          <div className="absolute right-0 top-full mt-2 bg-black/90 border border-zinc-800 rounded-lg w-48 shadow-lg z-50 animate-in fade-in slide-in-from-top-2 duration-200">
            {/* Menu content */}
            <div className="flex flex-col divide-y divide-zinc-800">
              {/* Mundo Somma link */}
              <div className="px-4 py-3">
                <ResourcesDropdown />
              </div>

              {/* Contact link */}
              <a
                href="https://wa.me/5561991780334?text=Ol%C3%A1%2C%20quero%20saber%20mais%20sobre%20o%20clube%20de%20membros%20do%20Somma."
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-3 text-sm text-white hover:text-[#ff4f2d] transition-colors duration-300"
                onClick={closeMenu}
              >
                Contato
              </a>

              {/* CTA Button */}
              <button
                onClick={() => {
                  document.getElementById("subscription-form")?.scrollIntoView({ behavior: "smooth" })
                  closeMenu()
                }}
                className="px-4 py-3 text-sm font-semibold text-white bg-[#ff4f2d] hover:bg-[#ff5e3f] transition-colors duration-300"
              >
                Inscreva-se
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
