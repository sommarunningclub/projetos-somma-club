"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Lock, LockOpen } from "lucide-react"
import ReflectiveCard from "./reflective-card"
import "./reflective-card.css"

export function PasswordLock({ children }: { children: React.ReactNode }) {
  const [isUnlocked, setIsUnlocked] = useState(false)
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [mounted, setMounted] = useState(false)

  const CORRECT_PASSWORD = "somma@2026"

  useEffect(() => {
    setMounted(true)
    const unlocked = localStorage.getItem("somma-club-unlocked") === "true"
    setIsUnlocked(unlocked)
  }, [])

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (password === CORRECT_PASSWORD) {
      setIsUnlocked(true)
      localStorage.setItem("somma-club-unlocked", "true")
    } else {
      setError("Senha incorreta. Tente novamente.")
      setPassword("")
    }
  }

  if (!mounted) return <>{children}</>

  if (!isUnlocked) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xl">
        <div className="absolute inset-0 bg-gradient-to-b from-zinc-900/50 to-black/50 backdrop-blur-md" />

        <div className="absolute inset-0 flex items-center justify-center opacity-20">
          <div style={{ height: "600px", width: "400px", position: "relative" }}>
            <ReflectiveCard
              overlayColor="rgba(0, 0, 0, 0.2)"
              blurStrength={10}
              glassDistortion={15}
              metalness={0.8}
              roughness={0.5}
              displacementStrength={25}
              noiseScale={1.5}
              specularConstant={2.0}
              grayscale={0.5}
              color="#ffffff"
            />
          </div>
        </div>

        <div className="relative z-10 w-full max-w-sm px-6 py-12 flex flex-col items-center justify-center">
          <div className="mb-8 relative">
            <div className="absolute inset-0 bg-[#ff4f2d]/20 blur-2xl rounded-full" />
            <Lock className="relative w-16 h-16 text-[#ff4f2d] animate-pulse" />
          </div>

          <div className="mb-8">
            <Image
              src="/webrenew-brandmark.png"
              alt="SOMMA Club Logo"
              width={120}
              height={120}
              priority
              className="object-contain"
            />
          </div>

          <h1 className="text-3xl font-light text-center text-white mb-2">Em breve</h1>
          <p className="text-center text-zinc-400 font-light mb-8 text-sm">Um Clube de Membros Somma</p>

          <form onSubmit={handleUnlock} className="w-full space-y-4">
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Digite a senha"
                className="w-full px-4 py-3 bg-zinc-900/50 border border-zinc-700 rounded-lg text-white placeholder-zinc-600 focus:outline-none focus:border-[#ff4f2d] focus:ring-2 focus:ring-[#ff4f2d]/30 transition-all backdrop-blur-sm font-light"
              />
            </div>

            {error && <p className="text-red-500 text-sm text-center font-light">{error}</p>}

            <button
              type="submit"
              className="w-full px-4 py-3 bg-[#ff4f2d] hover:bg-[#ff6b4a] text-white font-light rounded-lg transition-all duration-200 flex items-center justify-center gap-2 group"
            >
              <LockOpen className="w-4 h-4 group-hover:scale-110 transition-transform" />
              Desbloquear
            </button>
          </form>

          <p className="text-center text-zinc-600 text-xs mt-8 font-light">Acesso exclusivo para membros SOMMA</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
