import { MessageCircle } from "lucide-react"

export function WhatsAppButton({
  celular,
  nome,
  valor,
  status,
}: {
  celular: string
  nome: string
  valor: number
  status: string
}) {
  const numero = celular.replace(/\D/g, "")
  const fone = numero.startsWith("55") ? numero : `55${numero}`
  const primeiroNome = nome.split(" ")[0]
  const valorFmt = valor.toFixed(2).replace(".", ",")
  const msg =
    status === "Vencido"
      ? `Olá ${primeiroNome}! Identificamos uma cobrança vencida de R$ ${valorFmt} referente ao Somma Club. Podemos resolver?`
      : `Olá ${primeiroNome}! Passando para lembrar da mensalidade do Somma Club. Qualquer dúvida, estou à disposição!`
  const url = `https://wa.me/${fone}?text=${encodeURIComponent(msg)}`

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 rounded-md transition"
    >
      <MessageCircle className="w-3 h-3" />
      WhatsApp
    </a>
  )
}
