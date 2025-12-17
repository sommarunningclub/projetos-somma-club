"use client"

import Image from "next/image"
import { useEffect, useState } from "react"
import { ResourcesDropdown } from "./resources-dropdown"
import { MobileMenu } from "./mobile-menu"

export function Navbar() {
  const [isVisible, setIsVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY

      if (currentScrollY < lastScrollY || currentScrollY < 10) {
        setIsVisible(true)
      } else if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false)
      }

      setLastScrollY(currentScrollY)
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [lastScrollY])

  return (
    <nav
      className={`fixed left-1/2 -translate-x-1/2 z-50 px-3 sm:px-6 w-full max-w-7xl transition-all duration-700 ease-in-out ${
        isVisible ? "top-4 sm:top-8 opacity-100" : "-top-24 opacity-0"
      }`}
    >
      <div className="bg-black/50 backdrop-blur-[120px] rounded-full px-4 sm:px-8 py-2 sm:py-3 flex items-center gap-4 sm:gap-8 shadow-lg border border-white/10 w-full">
        {/* Logo */}
        <div className="flex items-center flex-shrink-0">
          <Image src="/webrenew-brandmark.png" alt="webrenew" width={225} height={48} className="h-8 sm:h-12 w-auto" />
        </div>

        {/* Desktop Menu Links */}
        <div className="hidden md:flex items-center justify-end gap-2 sm:gap-4 flex-1 pr-2 sm:pr-4">
          <ResourcesDropdown />
          <a
            href="https://wa.me/5561991780334?text=Ol%C3%A1%2C%20quero%20saber%20mais%20sobre%20o%20clube%20de%20membros%20do%20Somma."
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 sm:px-[18px] py-2 sm:py-[10px] rounded-full border border-[#ff4f2d] bg-[#ff4f2d]/50 text-white font-medium text-sm hover:scale-105 transition-transform duration-500"
          >
            Contato
          </a>
        </div>

        {/* Mobile Menu */}
        <div className="flex md:hidden items-center justify-end flex-1 pr-2 sm:pr-4">
          <MobileMenu />
        </div>
      </div>
    </nav>
  )
}
