import { NextResponse } from "next/server"
import { syncAsaasToSupabase } from "@/lib/asaas/sync"

// Sync pode ser longa (paginação completa do Asaas) — desabilitar timeout padrão
export const maxDuration = 300

export async function POST() {
  try {
    const result = await syncAsaasToSupabase()
    return NextResponse.json(result)
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error("[admin/sync] erro:", msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
