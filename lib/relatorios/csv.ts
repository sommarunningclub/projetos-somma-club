// Geração de CSV pura. Usa ; como separador (padrão BR no Excel) e BOM p/ acentos.

function escape(value: unknown): string {
  const s = value === null || value === undefined ? "" : String(value)
  if (/[";\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`
  return s
}

// rows: array de objetos com as MESMAS chaves; headers opcional sobrescreve rótulos.
export function toCSV(rows: Array<Record<string, unknown>>, headers?: Record<string, string>): string {
  if (rows.length === 0) return ""
  const keys = Object.keys(rows[0])
  const head = keys.map(k => escape(headers?.[k] ?? k)).join(";")
  const body = rows.map(r => keys.map(k => escape(r[k])).join(";")).join("\n")
  return "﻿" + head + "\n" + body
}
