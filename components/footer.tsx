"use client"

import Link from "next/link"

export function Footer() {
  return (
    <footer className="bg-zinc-950 border-t border-zinc-800">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          {/* Left: Copyright and CNPJ */}
          <div className="text-center sm:text-left">
            <p className="text-sm font-light text-zinc-400">
              © 2025 SOMMA Running Club Membros | CNPJ 61.315.987/0001-28
            </p>
          </div>

          {/* Right: Social Links */}
          <div className="flex items-center gap-6">
            {/* Instagram Link */}
            <Link
              href="https://www.instagram.com/somma.club/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 text-neutral-600 dark:text-neutral-400 hover:text-[#ff4f2d] dark:hover:text-[#ff6b4a] transition-colors duration-200 group focus:outline-none focus:ring-2 focus:ring-[#ff4f2d] rounded-lg px-2 py-1"
              aria-label="Seguir SOMMA Running Club no Instagram"
            >
              <svg
                className="w-5 h-5 group-hover:scale-110 transition-transform duration-200"
                aria-hidden="true"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5" stroke="currentColor" strokeWidth="2" />
                <circle cx="12" cy="12" r="3.5" stroke="currentColor" strokeWidth="2" />
                <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" />
              </svg>
            </Link>

            {/* Strava Link */}
            <Link
              href="https://www.strava.com/clubs/1608501?share_sig=D8C84ECD1759146345&_branch_match_id=1529495780547950083&_branch_referrer=H4sIAAAAAAAAA8soKSkottLXLy4pSixL1EssKNDLyczL1jcxdsmPCgmrNA5Psq8rSk1LLSrKzEuPTyrKLy9OLbJ1zijKz00FAFnkwLM9AAAA"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 text-neutral-600 dark:text-neutral-400 hover:text-[#ff4f2d] dark:hover:text-[#ff6b4a] transition-colors duration-200 group focus:outline-none focus:ring-2 focus:ring-[#ff4f2d] rounded-lg px-2 py-1"
              aria-label="Seguir SOMMA Running Club no Strava"
            >
              <svg
                className="w-5 h-5 group-hover:scale-110 transition-transform duration-200"
                aria-hidden="true"
                viewBox="0 0 512 512"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <polygon
                  points="226.172,26.001 90.149,288.345 170.29,288.345 226.172,184.036 281.605,288.345 361.116,288.345"
                  fill="currentColor"
                />
                <polygon
                  points="361.116,288.345 321.675,367.586 281.605,288.345 220.871,288.345 321.675,485.999 421.851,288.345"
                  fill="currentColor"
                />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
