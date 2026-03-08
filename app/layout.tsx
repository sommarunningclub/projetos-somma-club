import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { LenisProvider } from "@/components/lenis-provider"
import { Footer } from "@/components/footer"
import { CookieBanner } from "@/components/cookie-banner"
import { PageLoader } from "@/components/page-loader"
import "./globals.css"

const geist = Geist({ subsets: ["latin"], variable: "--font-geist" })
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono" })

export const metadata: Metadata = {
  title: "Assessoria Somma Club",
  description: "Treinamento personalizado para corredores com acompanhamento profissional e planejamento individualizado.",
  generator: "Assessoria Somma Club",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no",
  icons: {
    icon: "https://cdn.shopify.com/s/files/1/0788/1932/8253/files/fav_icon_somma.svg?v=1772597575",
  },
  openGraph: {
    title: "Assessoria Somma Club",
    description: "Treinamento personalizado para corredores com acompanhamento profissional e planejamento individualizado.",
    type: "website",
    locale: "pt_BR",
  },
  twitter: {
    card: "summary_large_image",
    title: "Assessoria Somma Club",
    description: "Treinamento personalizado para corredores com acompanhamento profissional e planejamento individualizado.",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${geist.variable} ${geistMono.variable} font-sans antialiased`}>
        <LenisProvider>
          {children}
          <Footer />
        </LenisProvider>
        <PageLoader />
        <CookieBanner />
        <Analytics />
      </body>
    </html>
  )
}
