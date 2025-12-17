"use client"

import { ChevronDown } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

export function ResourcesDropdown() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-4 py-2 text-white hover:text-zinc-300 transition-colors flex items-center gap-2"
      >
        Mundo Somma
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-48 bg-zinc-900 border border-zinc-700 rounded-lg shadow-lg z-50">
          <Link
            href="https://sommaclub.com.br/"
            target="_blank"
            rel="noopener noreferrer"
            className="block px-4 py-3 text-white hover:bg-zinc-800 hover:text-[#ff4f2d] transition-colors border-b border-zinc-700"
          >
            Site
          </Link>
          <Link
            href="https://loja.sommaclub.com.br/"
            target="_blank"
            rel="noopener noreferrer"
            className="block px-4 py-3 text-white hover:bg-zinc-800 hover:text-[#ff4f2d] transition-colors"
          >
            Loja Somma
          </Link>
        </div>
      )}
    </div>
  )
}
