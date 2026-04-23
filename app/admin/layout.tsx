import { createClient } from "@/lib/supabase/server"
import { logoutAction } from "./actions"
import { Sidebar } from "@/components/admin/sidebar"

export const metadata = { title: "PACE 360 · Somma Club" }

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return <>{children}</>

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex">
      <Sidebar email={user.email ?? ""} logoutAction={logoutAction} />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  )
}
