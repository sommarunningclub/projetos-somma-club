import { Card, CardContent } from "@/components/ui/card"

export function KpiCard({
  label,
  value,
  sub,
  accent,
}: {
  label: string
  value: string | number
  sub?: string
  accent?: "primary" | "success" | "warning" | "error" | "muted"
}) {
  const accentClass = {
    primary: "text-white",
    success: "text-emerald-400",
    warning: "text-amber-400",
    error: "text-red-400",
    muted: "text-white/80",
  }[accent ?? "muted"]

  const accentStyle = accent === "primary" ? { color: "#ff2c03" } : undefined

  return (
    <Card className="bg-zinc-950 border-zinc-900">
      <CardContent className="p-4">
        <p className="text-[10px] uppercase tracking-widest text-white/50">{label}</p>
        <p className={`text-2xl font-bold mt-2 ${accentClass}`} style={accentStyle}>
          {value}
        </p>
        {sub && <p className="text-xs text-white/40 mt-1">{sub}</p>}
      </CardContent>
    </Card>
  )
}
