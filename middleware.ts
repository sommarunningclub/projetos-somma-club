import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

// Protege /admin/* e /api/admin/* exigindo:
// 1. Sessão Supabase Auth válida
// 2. user.id presente em admin_roles com role='admin'
//
// /admin/login fica fora da proteção. Webhook /api/webhook/* é público.

const PROTECTED_PREFIXES = ["/admin", "/api/admin"]
const PUBLIC_ADMIN_PATHS = ["/admin/login"]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const isProtected = PROTECTED_PREFIXES.some(p => pathname.startsWith(p))
  const isPublic = PUBLIC_ADMIN_PATHS.some(p => pathname === p)

  if (!isProtected || isPublic) {
    return NextResponse.next()
  }

  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return redirectOrUnauthorized(request, pathname, "no_session")
  }

  const { data: role } = await supabase
    .from("admin_roles")
    .select("role")
    .eq("user_id", user.id)
    .eq("role", "admin")
    .maybeSingle()

  if (!role) {
    return redirectOrUnauthorized(request, pathname, "no_admin_role")
  }

  return response
}

function redirectOrUnauthorized(request: NextRequest, pathname: string, reason: string) {
  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "Unauthorized", reason }, { status: 401 })
  }
  const url = request.nextUrl.clone()
  url.pathname = "/admin/login"
  url.searchParams.set("from", pathname)
  return NextResponse.redirect(url)
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
}
