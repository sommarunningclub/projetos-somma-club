import type { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
  const baseUrl = "https://assessoria.sommaclub.com.br"

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/politica-de-cookies"],
        disallow: ["/checkout/", "/dashboard/", "/api/", "/_next/"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  }
}
