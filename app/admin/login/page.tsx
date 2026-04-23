import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { LoginForm } from "./login-form"

export const metadata = { title: "Login Admin · PACE 360" }

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; error?: string }>
}) {
  const { from, error } = await searchParams

  // Se já estiver autenticado E for admin, redireciona pro destino
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (user) {
    const { data: role } = await supabase
      .from("admin_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle()
    if (role) redirect(from || "/admin")
  }

  return (
    <main className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-black text-white tracking-tight">
            <span style={{ color: "#ff2c03" }}>PACE</span> 360
          </h1>
          <p className="text-sm text-white/50 mt-1">Painel administrativo Somma Club</p>
        </div>
        <LoginForm fromPath={from} initialError={error} />
      </div>
    </main>
  )
}
