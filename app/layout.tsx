import type React from "react"
import type { Metadata, Viewport } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { LenisProvider } from "@/components/lenis-provider"
import { Footer } from "@/components/footer"
import { CookieBanner } from "@/components/cookie-banner"
import { PageLoader } from "@/components/page-loader"
import "./globals.css"

const geist = Geist({ subsets: ["latin"], variable: "--font-geist" })
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono" })

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

const jsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "SportsActivityLocation",
    name: "Assessoria Somma Club",
    alternateName: "Assessoria Somma · SOMMA Running Club",
    url: "https://assessoria.sommaclub.com.br",
    logo: "https://assessoria.sommaclub.com.br/apple-icon.png",
    image: "https://assessoria.sommaclub.com.br/apple-icon.png",
    description: "Assessoria esportiva de corrida em Brasília DF, braço técnico do Somma Running Club, o maior running club do Distrito Federal, com mais de 5 mil membros. Treinamento personalizado, acompanhamento via Strava e planejamento individualizado.",
    parentOrganization: {
      "@type": "SportsOrganization",
      name: "Somma Running Club",
      url: "https://sommaclub.com.br",
      description: "Maior running club do Distrito Federal: comunidade gratuita de corrida, wellness e conexão social em Brasília, com mais de 5 mil membros cadastrados.",
      sameAs: [
        "https://www.instagram.com/somma.club/",
        "https://www.strava.com/clubs/1608501",
      ],
    },
    address: {
      "@type": "PostalAddress",
      addressLocality: "Brasília",
      addressRegion: "DF",
      addressCountry: "BR",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: -15.7942,
      longitude: -47.8825,
    },
    telephone: "+55-61-99537-2477",
    priceRange: "R$ 180 - R$ 220/mês",
    sameAs: [
      "https://www.instagram.com/somma.club/",
      "https://www.strava.com/clubs/1608501",
    ],
    sport: "Corrida",
    areaServed: {
      "@type": "City",
      name: "Brasília",
      addressRegion: "DF",
      addressCountry: "BR",
    },
    offers: [
      {
        "@type": "Offer",
        name: "Plano Mensal",
        price: "220.00",
        priceCurrency: "BRL",
        billingIncrement: "P1M",
        url: "https://assessoria.sommaclub.com.br/checkout/mensal",
      },
      {
        "@type": "Offer",
        name: "Plano Semestral",
        price: "200.00",
        priceCurrency: "BRL",
        billingIncrement: "P6M",
        url: "https://assessoria.sommaclub.com.br/checkout/semestral",
      },
      {
        "@type": "Offer",
        name: "Plano Anual",
        price: "180.00",
        priceCurrency: "BRL",
        billingIncrement: "P1Y",
        url: "https://assessoria.sommaclub.com.br/checkout/anual",
      },
    ],
  },
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Assessoria Somma Club",
    url: "https://assessoria.sommaclub.com.br",
    description: "Site oficial da Assessoria Somma Club: treinamento de corrida em Brasília DF.",
    inLanguage: "pt-BR",
    publisher: {
      "@type": "Organization",
      name: "SOMMA Running Club",
      url: "https://assessoria.sommaclub.com.br",
      logo: {
        "@type": "ImageObject",
        url: "https://assessoria.sommaclub.com.br/apple-icon.png",
        width: 180,
        height: 180,
      },
      sameAs: [
        "https://www.instagram.com/somma.club/",
        "https://www.strava.com/clubs/1608501",
      ],
    },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: "https://assessoria.sommaclub.com.br/?q={search_term_string}",
      },
      "query-input": "required name=search_term_string",
    },
  },
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "O que é a Assessoria Somma Club?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "A Assessoria Somma é o braço técnico do Somma Running Club, maior running club do Distrito Federal, com mais de 5 mil membros. Oferece treinamento de corrida personalizado em Brasília, com planejamento individualizado, acompanhamento via Strava e metodologia baseada em ciência, para corredores iniciantes e experientes.",
        },
      },
      {
        "@type": "Question",
        name: "A Assessoria Somma é em Brasília?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Sim. A Assessoria Somma atua em Brasília, Distrito Federal, e está ligada ao Somma Running Club, comunidade gratuita de corrida com mais de 5 mil membros no DF. O acompanhamento é digital, com treinos disponibilizados via aplicativo.",
        },
      },
      {
        "@type": "Question",
        name: "Quanto tempo dura a Assessoria? Tem fidelidade?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "A Assessoria Somma tem a duração do plano escolhido: mensal, semestral ou anual. Não há fidelidade, você permanece pelo tempo que fizer sentido para seus objetivos.",
        },
      },
      {
        "@type": "Question",
        name: "Como funciona o planejamento de treinos?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Após a confirmação da assinatura, você recebe acesso ao aplicativo de treinamento, onde seu plano personalizado é disponibilizado semanalmente. O planejamento considera seu nível atual, objetivos e disponibilidade, com ajustes conforme sua evolução.",
        },
      },
      {
        "@type": "Question",
        name: "Quais são as formas de pagamento? É seguro?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Aceitamos pagamentos via Cartão de Crédito, com parcelamento nos planos semestrais e anuais. O processo é protegido e seguro, garantindo proteção total dos seus dados.",
        },
      },
      {
        "@type": "Question",
        name: "Como funciona a garantia e o cancelamento?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Ao assinar, você tem 7 dias de garantia incondicional para cancelar e receber reembolso total. Após esse período, pode cancelar a qualquer momento e seu acesso continua ativo até o fim do período já pago.",
        },
      },
      {
        "@type": "Question",
        name: "A assinatura renova automaticamente?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Sim. A renovação é automática ao final do período contratado para garantir continuidade no treinamento. Caso não deseje renovar, basta cancelar antes da data de renovação.",
        },
      },
      {
        "@type": "Question",
        name: "Preciso ser corredor experiente para entrar na Assessoria Somma?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Não. A Assessoria Somma atende corredores iniciantes, intermediários e experientes. O plano é individualizado e respeita seu ponto de partida, com evolução progressiva e segura.",
        },
      },
      {
        "@type": "Question",
        name: "Preciso de equipamentos especiais?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Recomendamos um relógio GPS ou smartphone com app de corrida (como Strava) para registro dos treinos. Isso permite acompanhamento preciso de métricas e ajustes mais eficientes no planejamento.",
        },
      },
    ],
  },
]

export const metadata: Metadata = {
  metadataBase: new URL("https://assessoria.sommaclub.com.br"),

  title: {
    default: "Assessoria Somma Club | Treinamento de Corrida em Brasília",
    template: "%s | Assessoria Somma Club",
  },

  description:
    "Assessoria de corrida em Brasília DF, braço técnico do Somma Running Club, maior running club do Distrito Federal, com mais de 5 mil membros. Treinamento personalizado, acompanhamento via Strava e planejamento individualizado. Planos a partir de R$ 180/mês.",

  keywords: [
    "assessoria esportiva Brasília",
    "assessoria de corrida Brasília",
    "treinamento personalizado para corredores",
    "running club Brasília",
    "running coach Brasília DF",
    "grupo de corrida Brasília",
    "treinamento inteligente corrida",
    "Somma Club",
    "SOMMA Running Club",
    "coach de corrida Brasília",
    "planilha de treino corrida",
    "assessoria esportiva DF",
  ],

  alternates: {
    canonical: "https://assessoria.sommaclub.com.br",
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/icon-light-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }],
    shortcut: "/favicon.ico",
  },

  openGraph: {
    title: "Assessoria Somma Club | Treinamento de Corrida em Brasília",
    description:
      "Assessoria esportiva de corrida em Brasília DF. Treinamento personalizado, acompanhamento com Strava, planejamento individualizado e comunidade SOMMA Running Club.",
    type: "website",
    locale: "pt_BR",
    url: "https://assessoria.sommaclub.com.br",
    siteName: "Assessoria Somma Club",
    images: [
      {
        url: "/apple-icon.png",
        width: 180,
        height: 180,
        alt: "Assessoria Somma Club · SOMMA Running Club Brasília",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Assessoria Somma Club | Treinamento de Corrida em Brasília",
    description:
      "Assessoria esportiva de corrida em Brasília DF. Treinamento personalizado com Strava, planejamento individualizado e comunidade SOMMA Running Club.",
    images: ["/apple-icon.png"],
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
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
