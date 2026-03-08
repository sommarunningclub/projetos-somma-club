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
      className={`fixed left-1/2 -translate-x-1/2 z-50 w-full px-4 sm:px-6 lg:px-12 transition-all duration-700 ease-in-out ${
        isVisible ? "top-0 opacity-100" : "-top-24 opacity-0"
      }`}
    >
      <div className="h-20 flex items-center justify-between border-b border-white/10 bg-black/50 backdrop-blur-md">
        {/* Logo */}
        <div className="flex items-center flex-shrink-0">
          <Image
            src="https://cdn.shopify.com/s/files/1/0788/1932/8253/files/Logo_Nova_Somma_Branca_Laranja.svg?v=1772736456"
            alt="SOMMA Club"
            width={150}
            height={40}
            className="h-6 sm:h-7 lg:h-8 w-auto"
          />
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center justify-end gap-8 flex-1">
          <ResourcesDropdown />
          <a
            href="https://wa.me/5561995372477?text=Ol%C3%A1%2C%20tudo%20bem%3F%20Quero%20saber%20mais%20informa%C3%A7%C3%B5es%20sobre%20a%20Assessoria%20Somma"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white hover:text-[#ff4f2d] transition-colors text-xs sm:text-sm font-light"
          >
            Contato ↗
          </a>
        </div>

        {/* Mobile Menu */}
        <div className="flex md:hidden items-center justify-end flex-1">
          <MobileMenu />
        </div>
      </div>
    </nav>
  )
}
