import { Badge } from "@/components/ui/badge"

const config: Record<string, { label: string; className: string }> = {
  "Em dia":   { label: "Em dia",   className: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" },
  "Pendente": { label: "Pendente", className: "bg-amber-500/15 text-amber-400 border-amber-500/30" },
  "Vencido":  { label: "Vencido",  className: "bg-red-500/15 text-red-400 border-red-500/30" },
}

export function StatusBadge({ status }: { status: string }) {
  const cfg = config[status] ?? { label: status, className: "bg-zinc-500/15 text-zinc-400 border-zinc-500/30" }
  return (
    <Badge variant="outline" className={cfg.className}>
      {cfg.label}
    </Badge>
  )
}
