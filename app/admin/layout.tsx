import Link from "next/link"
import { Home, Users, CreditCard, AlertTriangle, LogOut } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { logoutAction } from "./actions"

export const metadata = { title: "PACE 360 · Somma Club" }

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Sem user → /admin/login é a única rota acessível (middleware deixa passar).
  // Renderiza sem chrome para não exibir sidebar antes do login.
  if (!user) return <>{children}</>

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex">
      {/* Sidebar */}
      <aside className="w-60 shrink-0 bg-black border-r border-zinc-900 flex flex-col">
        <div className="px-5 py-5 border-b border-zinc-900">
          <Link href="/admin" className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center font-black text-white"
              style={{ backgroundColor: "#ff2c03" }}
            >
              S
            </div>
            <div>
              <p className="font-bold text-sm leading-none">Somma Club</p>
              <p className="text-[10px] text-white/50 mt-1 tracking-wider uppercase">PACE 360</p>
            </div>
          </Link>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          <NavLink href="/admin" icon={Home} label="Dashboard" />
          <NavLink href="/admin/alunos" icon={Users} label="Alunos" />
          <NavLink href="/admin/cobrancas" icon={CreditCard} label="Cobranças" />
          <NavLink href="/admin/alertas" icon={AlertTriangle} label="Alertas" />
        </nav>

        <div className="p-3 border-t border-zinc-900">
          <p className="text-xs text-white/40 px-3 pb-2 truncate">{user.email}</p>
          <form action={logoutAction}>
            <button
              type="submit"
              className="w-full flex items-center gap-3 px-3 py-2 text-sm text-white/70 hover:bg-zinc-900 hover:text-white rounded-md transition"
            >
              <LogOut className="w-4 h-4" /> Sair
            </button>
          </form>
        </div>
      </aside>

      {/* Conteúdo */}
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  )
}

function NavLink({ href, icon: Icon, label }: { href: string; icon: React.ElementType; label: string }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 px-3 py-2 text-sm text-white/70 hover:bg-zinc-900 hover:text-white rounded-md transition"
    >
      <Icon className="w-4 h-4" />
      {label}
    </Link>
  )
}
