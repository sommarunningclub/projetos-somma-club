import { headers } from "next/headers"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlunosTable } from "@/components/admin/alunos-table"
import type { AlunoDashboard } from "@/app/api/admin/dashboard/route"

export const dynamic = "force-dynamic"
export const metadata = { title: "Alunos · PACE 360" }

async function getAlunos(): Promise<AlunoDashboard[]> {
  const h = await headers()
  const host = h.get("host")!
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https")
  const cookie = h.get("cookie") ?? ""
  const res = await fetch(`${proto}://${host}/api/admin/dashboard`, {
    headers: { cookie },
    cache: "no-store",
  })
  if (!res.ok) throw new Error(`Dashboard API: ${res.status}`)
  const data = await res.json()
  return data.alunos as AlunoDashboard[]
}

export default async function AlunosPage() {
  const alunos = await getAlunos()
  return (
    <div className="min-h-full p-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white">Alunos</h1>
        <p className="text-xs text-white/50 mt-0.5">{alunos.length} cadastrados</p>
      </div>
      <Card className="bg-zinc-950 border-zinc-900">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-white">Lista completa</CardTitle>
        </CardHeader>
        <CardContent>
          <AlunosTable alunos={alunos} />
        </CardContent>
      </Card>
    </div>
  )
}
