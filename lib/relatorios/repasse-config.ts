import type { SupabaseClient } from "@supabase/supabase-js"
import { REPASSE_CONFIG_DEFAULT, type RepasseConfig } from "./calculo"

const CHAVE = "repasse_config"

// Lê a config de repasse de pace360_config (chave 'repasse_config'); usa default se ausente.
export async function loadRepasseConfig(supabase: SupabaseClient): Promise<RepasseConfig> {
  const { data } = await supabase.from("pace360_config").select("valor").eq("chave", CHAVE).maybeSingle()
  if (!data?.valor) return REPASSE_CONFIG_DEFAULT
  try {
    const parsed = JSON.parse(data.valor) as RepasseConfig
    return {
      taxaPadrao: typeof parsed.taxaPadrao === "number" ? parsed.taxaPadrao : REPASSE_CONFIG_DEFAULT.taxaPadrao,
      professores: parsed.professores ?? {},
    }
  } catch {
    return REPASSE_CONFIG_DEFAULT
  }
}

export async function saveRepasseConfig(supabase: SupabaseClient, cfg: RepasseConfig): Promise<void> {
  await supabase.from("pace360_config").upsert(
    { chave: CHAVE, valor: JSON.stringify(cfg), atualizado_em: new Date().toISOString() },
    { onConflict: "chave" },
  )
}
