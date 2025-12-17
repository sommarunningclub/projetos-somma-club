import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { LenisProvider } from "@/components/lenis-provider"
import { Footer } from "@/components/footer"
import { PasswordLock } from "@/components/password-lock"
import "./globals.css"

const geist = Geist({ subsets: ["latin"], variable: "--font-geist" })
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono" })

export const metadata: Metadata = {
  title: "Somma Running Club Membros",
  description: "Grupo Exclusivo de Membros para ajudar na sua performance.",
  generator: "Somma Running Club",
  openGraph: {
    title: "Somma Running Club Membros",
    description: "Grupo Exclusivo de Membros para ajudar na sua performance.",
    type: "website",
    locale: "pt_BR",
  },
  twitter: {
    card: "summary_large_image",
    title: "Somma Running Club Membros",
    description: "Grupo Exclusivo de Membros para ajudar na sua performance.",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${geist.variable} ${geistMono.variable} font-sans antialiased`}>
        <LenisProvider>
          <PasswordLock>
            {children}
            <Footer />
          </PasswordLock>
        </LenisProvider>
        <Analytics />
      </body>
    </html>
  )
}
