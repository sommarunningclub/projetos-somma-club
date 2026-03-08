"use client"

import Link from "next/link"

export function Footer() {
  return (
    <footer className="bg-black border-t border-white/10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-8 sm:gap-12">
          {/* Left: Info */}
          <div className="text-center sm:text-left">
            <p className="text-xs sm:text-sm font-light text-white/80">© 2026 Assessoria Somma Club</p>
            <p className="text-xs sm:text-sm font-light text-white/60 mt-2">CNPJ 61.315.987/0001-28</p>
          </div>

          {/* Right: Links */}
          <div className="flex items-center gap-8 sm:gap-12">
            <Link
              href="https://www.instagram.com/somma.club/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/60 hover:text-[#ff4f2d] transition-colors text-xs"
            >
              Instagram ↗
            </Link>
            <Link
              href="https://www.strava.com/clubs/1608501?share_sig=D8C84ECD1759146345&_branch_match_id=1529495780547950083&_branch_referrer=H4sIAAAAAAAAA8soKSkottLXLy4pSixL1EssKNDLyczL1jcxdsmPCgmrNA5Psq8rSk1LLSrKzEuPTyrKLy9OLbJ1zijKz00FAFnkwLM9AAAA"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/60 hover:text-[#ff4f2d] transition-colors text-xs"
            >
              Strava ↗
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
