"use client"

import type React from "react"
import { useState } from "react"
import {
  CreditCard,
  Loader2,
  Check,
  AlertCircle,
  Lock,
  ShieldCheck,
  Tag,
} from "lucide-react"
import Image from "next/image"

interface Plan {
  name: string
  period: string
  price: number
  total: number
  installments: number
  type: "recurring" | "installment"
}

interface CheckoutFormProps {
  plan: Plan
  initialProfessors: Professor[]
}

interface CustomerData {
  name: string
  email: string
  cpfCnpj: string
  phone: string
  postalCode: string
  addressNumber: string
  street: string
  neighborhood: string
  city: string
  state: string
}

interface CreditCardData {
  holderName: string
  number: string
  expiryMonth: string
  expiryYear: string
  ccv: string
}

interface CepResponse {
  cep: string
  state: string
  city: string
  neighborhood: string
  street: string
}

interface CouponData {
  valid: boolean
  coupon: {
    code: string
    type: "PERCENTAGE" | "FIXED"
    value: number
    description: string
  }
  calculation: {
    originalValue: number
    discount: number
    finalValue: number
  }
  asaasDiscount: {
    value: number
    dueDateLimitDays: number
    type: string
  }
}

interface Professor {
  id: string
  nome: string
  instagram: string
  link_foto: string
  telefone: string
}

const SHIRT_SIZES = ["P", "M", "G", "GG", "XG"]

function formatCPF(value: string) {
  const n = value.replace(/\D/g, "").slice(0, 11)
  return n
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2")
}

function formatPhone(value: string) {
  const n = value.replace(/\D/g, "").slice(0, 11)
  return n.replace(/(\d{2})(\d)/, "($1) $2").replace(/(\d{5})(\d)/, "$1-$2")
}

function formatCEP(value: string) {
  const n = value.replace(/\D/g, "").slice(0, 8)
  return n.replace(/(\d{5})(\d)/, "$1-$2")
}

function formatCardNumber(value: string) {
  const n = value.replace(/\D/g, "").slice(0, 16)
  return n.replace(/(\d{4})(?=\d)/g, "$1 ")
}

function fmtBRL(value: number) {
  return value.toFixed(2).replace(".", ",")
}

export function CheckoutForm({ plan, initialProfessors }: CheckoutFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pageState, setPageState] = useState<"form" | "processing" | "success" | "error">("form")
  const [isCepLoading, setIsCepLoading] = useState(false)
  const [cepError, setCepError] = useState<string | null>(null)

  const [professors, setProfessors] = useState<Professor[]>(initialProfessors)
  const [professor, setProfessor] = useState("")
  const [shirtSize, setShirtSize] = useState("")
  const [installments, setInstallments] = useState(plan.installments)

  const [couponCode, setCouponCode] = useState("")
  const [couponData, setCouponData] = useState<CouponData | null>(null)
  const [isCouponLoading, setIsCouponLoading] = useState(false)
  const [couponError, setCouponError] = useState<string | null>(null)

  const [customerData, setCustomerData] = useState<CustomerData>({
    name: "", email: "", cpfCnpj: "", phone: "",
    postalCode: "", addressNumber: "", street: "", neighborhood: "", city: "", state: "",
  })

  const [cardData, setCardData] = useState<CreditCardData>({
    holderName: "", number: "", expiryMonth: "", expiryYear: "", ccv: "",
  })

  const baseTotalForInstallments = plan.type === "installment" ? (plan.total / plan.installments) * installments : plan.total
  const discountedPrice = couponData ? couponData.calculation.finalValue : plan.price
  const discountAmount = couponData ? couponData.calculation.discount : 0
  const discountedTotal = couponData ? baseTotalForInstallments - discountAmount * installments : baseTotalForInstallments

  // ─── CEP ─────────────────────────────────────────────────────────────────
  const fetchAddressByCep = async (cep: string) => {
    setIsCepLoading(true)
    setCepError(null)
    try {
      const res = await fetch(`https://brasilapi.com.br/api/cep/v2/${cep}`)
      if (!res.ok) throw new Error()
      const data: CepResponse = await res.json()
      setCustomerData((prev) => ({
        ...prev,
        street: data.street || "",
        neighborhood: data.neighborhood || "",
        city: data.city || "",
        state: data.state || "",
      }))
    } catch {
      setCepError("CEP nao encontrado.")
    } finally {
      setIsCepLoading(false)
    }
  }

  const handleCepChange = (value: string) => {
    const formatted = formatCEP(value)
    setCustomerData((prev) => ({ ...prev, postalCode: formatted }))
    const clean = value.replace(/\D/g, "")
    if (clean.length === 8) fetchAddressByCep(clean)
    else setCepError(null)
  }

  // ─── Coupon ───────────────────────────────────────────────────────────────
  const validateCoupon = async () => {
    if (!couponCode.trim()) { setCouponError("Digite um cupom"); return }
    setIsCouponLoading(true)
    setCouponError(null)
    try {
      const res = await fetch(`/api/checkout/validate-coupon?code=${encodeURIComponent(couponCode)}&value=${plan.price}`)
      const data = await res.json()
      if (!data.valid) { setCouponError(data.error || "Cupom invalido"); setCouponData(null); return }
      setCouponData(data)
    } catch {
      setCouponError("Erro ao validar cupom")
    } finally {
      setIsCouponLoading(false)
    }
  }

  // ─── Submit ──────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setPageState("processing")

    try {
      // 0. Get client IP
      const ipRes = await fetch("/api/client-ip")
      const ipData = await ipRes.json()
      const clientIp = ipData.ip || "0.0.0.0"

      // 1. Create customer
      const customerRes = await fetch("/api/asaas/customer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(customerData),
      })
      const customerResult = await customerRes.json()
      if (!customerRes.ok) throw new Error(customerResult.error || "Erro ao salvar dados")

      // 2. Create payment/subscription
      const paymentPayload: Record<string, unknown> = {
        customerId: customerResult.id,
        type: plan.type,
        description: `Somma Assessoria - Plano ${plan.name} | Prof: ${professor} | Camiseta: ${shirtSize}${couponData ? ` | Cupom: ${couponData.coupon.code}` : ""}`,
        creditCard: {
          holderName: cardData.holderName,
          number: cardData.number.replace(/\s/g, ""),
          expiryMonth: cardData.expiryMonth,
          expiryYear: cardData.expiryYear,
          ccv: cardData.ccv,
        },
        creditCardHolderInfo: {
          name: customerData.name,
          email: customerData.email,
          cpfCnpj: customerData.cpfCnpj.replace(/\D/g, ""),
          postalCode: customerData.postalCode.replace(/\D/g, ""),
          addressNumber: customerData.addressNumber,
          phone: customerData.phone.replace(/\D/g, ""),
        },
        remoteIp: clientIp,
      }

      if (plan.type === "recurring") {
        paymentPayload.value = discountedPrice
      } else {
        paymentPayload.installmentCount = installments
        paymentPayload.installmentValue = discountedPrice
      }

      const paymentRes = await fetch("/api/asaas/subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(paymentPayload),
      })
      const paymentResult = await paymentRes.json()
      if (!paymentRes.ok) throw new Error(paymentResult.error || "Erro ao processar pagamento")

      // 3. Salvar cliente na tabela de gestão
      await fetch("/api/supabase/cliente", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: customerData.name,
          email: customerData.email,
          telefone: customerData.phone,
          cpf: customerData.cpfCnpj,
          rua: customerData.street,
          numero: customerData.addressNumber,
          bairro: customerData.neighborhood,
          cidade: customerData.city,
          cep: customerData.postalCode,
          estado: customerData.state,
          veste: shirtSize || null,
          professor: professor || null,
          tipo_plano: plan.name,
          valor: discountedPrice,
        }),
      })

      setPageState("success")
    } catch (err: any) {
      setError(err.message)
      setPageState("error")
    } finally {
      setIsLoading(false)
    }
  }

  // ─── Input styles ────────────────────────────────────────────────────────
  const inputClass =
    "w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-white/[0.03] border border-white/10 rounded-lg text-base sm:text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#ff4f2d] focus:bg-white/[0.05] transition-all"

  // ─── PROCESSING ──────────────────────────────────────────────────────────
  if (pageState === "processing") {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-2 border-white/10 border-t-[#ff4f2d] rounded-full animate-spin mx-auto mb-6" />
          <h2 className="text-xl font-light text-white mb-2">Processando pagamento</h2>
          <p className="text-sm text-white/40">Aguarde, estamos confirmando sua assinatura...</p>
        </div>
      </div>
    )
  }

  // ─── SUCCESS ─────────────────────────────────────────────────────────────
  if (pageState === "success") {
    const professorData = professors.find(p => p.nome === professor)
    const professorPhone = professorData?.telefone || ""
    const whatsappProfessor = professorPhone ? `https://wa.me/${professorPhone.replace(/\D/g, "")}?text=${encodeURIComponent(`Olá, acabei de adiquirir a Assessoria Somma ${plan.name}.`)}` : ""
    const whatsappConcierge = "https://wa.me/61995372477?text=" + encodeURIComponent("Olá, acabei de adiquirir a assessoria somma e tenho algumas dúvidas, pode me ajudar?")

    return (
      <div className="min-h-screen bg-black text-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
          {/* Success banner */}
          <div className="text-center mb-12">
            <div className="w-20 h-20 bg-green-500/10 border border-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="w-10 h-10 text-green-400" strokeWidth={1.5} />
            </div>
            <h1 className="text-3xl font-light text-white mb-2">Bem-vindo a Somma!</h1>
            <p className="text-white/50">Sua assinatura do Plano {plan.name} foi ativada com sucesso.</p>
          </div>

          {/* Kit Assessoria */}
          <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 sm:p-8 mb-8">
            <h2 className="text-sm font-medium text-white mb-6 uppercase tracking-wider">Kit Assessoria Somma</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <a
                href="https://loja.sommaclub.com.br/products/kit-assessoria-somma-club"
                target="_blank"
                rel="noopener noreferrer"
                className="p-4 border border-white/10 rounded-xl hover:border-[#ff4f2d]/50 hover:bg-white/[0.02] transition-all group"
              >
                <p className="text-xs text-white/50 mb-2 group-hover:text-white/70">KIT COMPLETO</p>
                <p className="text-sm font-medium text-white mb-2">Ecobag + Camisa</p>
                <p className="text-xs text-white/40 line-through mb-1">De R$ 125,00</p>
                <p className="text-lg font-semibold text-[#ff4f2d]">por R$ 80,00</p>
                <p className="text-xs text-white/50 mt-3">Cupom: ALUNOASSESSORIA</p>
              </a>
              <a
                href="https://loja.sommaclub.com.br/products/camisa-assessoria-somma-club"
                target="_blank"
                rel="noopener noreferrer"
                className="p-4 border border-white/10 rounded-xl hover:border-[#ff4f2d]/50 hover:bg-white/[0.02] transition-all group"
              >
                <p className="text-xs text-white/50 mb-2 group-hover:text-white/70">APENAS CAMISA</p>
                <p className="text-sm font-medium text-white mb-3">Camisa Assessoria</p>
                <p className="text-xs text-white/50">Clique para comprar</p>
              </a>
            </div>
          </div>

          {/* Contato - Professor e Concierge */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
            {/* Professor */}
            {professorData && (
              <a
                href={whatsappProfessor}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 hover:border-[#ff4f2d]/50 hover:bg-white/[0.05] transition-all text-center"
              >
                <p className="text-xs text-white/50 mb-3 uppercase tracking-wider">Conecte com seu professor</p>
                <p className="text-sm font-medium text-white mb-4">{professorData.nome}</p>
                <div className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#25D366] hover:bg-[#20BA58] rounded-lg transition-colors w-full">
                  <svg className="w-4 h-4" fill="white" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.272-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.67-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.076 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421-7.403h-.004a9.87 9.87 0 00-9.746 9.798c0 2.687.733 5.308 2.122 7.618L2.06 23.766l8.25-2.166c2.213 1.201 4.708 1.86 7.332 1.86 5.736 0 10.562-4.652 10.562-10.38 0-2.777-1.132-5.388-3.188-7.36A10.56 10.56 0 0012.051 6.979z" />
                  </svg>
                  <span className="text-sm font-semibold">Enviar mensagem</span>
                </div>
              </a>
            )}

            {/* Concierge */}
            <a
              href={whatsappConcierge}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 hover:border-[#ff4f2d]/50 hover:bg-white/[0.05] transition-all text-center"
            >
              <p className="text-xs text-white/50 mb-3 uppercase tracking-wider">Dúvidas?</p>
              <p className="text-sm font-medium text-white mb-4">Concierge Somma</p>
              <div className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#25D366] hover:bg-[#20BA58] rounded-lg transition-colors w-full">
                <svg className="w-4 h-4" fill="white" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.272-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.67-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.076 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421-7.403h-.004a9.87 9.87 0 00-9.746 9.798c0 2.687.733 5.308 2.122 7.618L2.06 23.766l8.25-2.166c2.213 1.201 4.708 1.86 7.332 1.86 5.736 0 10.562-4.652 10.562-10.38 0-2.777-1.132-5.388-3.188-7.36A10.56 10.56 0 0012.051 6.979z" />
                </svg>
                <span className="text-sm font-semibold">Fale conosco</span>
              </div>
            </a>
          </div>

          {/* Voltar ao site */}
          <a
            href="/"
            className="block w-full py-3 text-center bg-white/10 hover:bg-white/15 text-white font-light rounded-xl transition-colors"
          >
            Voltar ao site
          </a>
        </div>
      </div>
    )
  }

  // ─── ERROR ───────────────────────────────────────────────────────────────
  if (pageState === "error") {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-10 h-10 text-red-400" strokeWidth={1.5} />
          </div>
          <h2 className="text-2xl font-light text-white mb-2">Erro no pagamento</h2>
          <p className="text-sm text-white/50 mb-2">{error || "Ocorreu um erro ao processar seu pagamento."}</p>
          <p className="text-xs text-white/30 mb-8">Verifique os dados do cartao e tente novamente.</p>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => { setPageState("form"); setError(null) }}
              className="w-full py-3 bg-[#ff4f2d] hover:bg-[#e6452a] text-black font-medium rounded-xl transition-colors"
            >
              Tentar novamente
            </button>
            <a
              href="/"
              className="w-full py-3 bg-white/10 hover:bg-white/15 text-white font-light rounded-xl transition-colors text-center"
            >
              Voltar ao site
            </a>
          </div>
        </div>
      </div>
    )
  }

  // ─── MAIN: Stripe-like single page ───────────────────────────────────────
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Top bar */}
      <div className="border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <a href="/">
            <Image
              src="https://cdn.shopify.com/s/files/1/0788/1932/8253/files/Logo_Nova_Somma_Branca_Laranja.svg"
              alt="Somma"
              width={110}
              height={32}
              className="h-8 w-auto"
            />
          </a>
          <div className="flex items-center gap-1.5 text-xs text-white/40">
            <Lock className="w-3.5 h-3.5" />
            <span>Checkout seguro</span>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-3 sm:px-6 py-6 sm:py-8 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6 sm:gap-8 lg:gap-16">

          {/* ── LEFT: Form ──────────────────────────────────────────────── */}
          <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8 lg:space-y-10">

            {/* Professor */}
            <section>
              <h2 className="text-xs sm:text-sm font-medium text-white/50 uppercase tracking-wider mb-3 sm:mb-4">
                1. Selecione seu professor
              </h2>
              {professors.length === 0 ? (
                <div className="flex items-center gap-2 text-white/30 text-sm py-4">
                  <Loader2 className="w-4 h-4 animate-spin" /> Carregando professores...
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-4">
                  {professors.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setProfessor(p.nome)}
                      className={`rounded-xl border overflow-hidden transition-all ${
                        professor === p.nome
                          ? "border-[#ff4f2d] ring-1 ring-[#ff4f2d]"
                          : "border-white/10 hover:border-white/20"
                      }`}
                    >
                      <div className="relative aspect-square w-full">
                        <Image
                          src={p.link_foto}
                          alt={p.nome}
                          fill
                          className="object-cover"
                          sizes="(max-width: 640px) 100vw, 33vw"
                        />
                        {professor === p.nome && (
                          <div className="absolute top-2 right-2 w-6 h-6 bg-[#ff4f2d] rounded-full flex items-center justify-center">
                            <Check className="w-3.5 h-3.5 text-black" strokeWidth={3} />
                          </div>
                        )}
                      </div>
                      <div className="p-3 bg-white/[0.02]">
                        <p className="text-sm font-medium text-white">{p.nome}</p>
                        <a
                          href={p.instagram}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-xs text-[#ff4f2d] hover:underline mt-0.5 inline-block"
                        >
                          @{p.instagram.split("/").filter(Boolean).pop()}
                        </a>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </section>

            {/* Shirt size — only for semestral/anual */}
            {plan.type === "installment" && (
              <section>
                <h2 className="text-xs sm:text-sm font-medium text-white/50 uppercase tracking-wider mb-3 sm:mb-4">
                  2. Tamanho da camiseta
                </h2>
                <div className="flex gap-3 flex-wrap">
                  {SHIRT_SIZES.map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setShirtSize(size)}
                      className={`w-14 h-14 rounded-lg border text-sm font-medium transition-all ${
                        shirtSize === size
                          ? "border-[#ff4f2d] bg-[#ff4f2d]/10 text-white"
                          : "border-white/10 bg-white/[0.02] text-white/60 hover:border-white/20"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </section>
            )}

            {/* Installments — only for semestral/anual */}
            {plan.type === "installment" && (
              <section>
                <h2 className="text-xs sm:text-sm font-medium text-white/50 uppercase tracking-wider mb-3 sm:mb-4">
                  3. Quantidade de parcelas
                </h2>
                <select
                  value={installments}
                  onChange={(e) => setInstallments(Number(e.target.value))}
                  className={inputClass + " cursor-pointer"}
                >
                  {Array.from({ length: plan.installments }, (_, i) => i + 1).map((num) => {
                    const installmentValue = plan.total / num
                    return (
                      <option key={num} value={num} className="bg-black text-white">
                        {num}x de R$ {installmentValue.toFixed(2).replace(".", ",")}
                      </option>
                    )
                  })}
                </select>
              </section>
            )}

            {/* Contact info */}
            <section>
              <h2 className="text-xs sm:text-sm font-medium text-white/50 uppercase tracking-wider mb-3 sm:mb-4">
                {plan.type === "installment" ? "4" : "2"}. Seus dados
              </h2>
              <div className="space-y-2 sm:space-y-3">
                <input
                  type="text" required
                  value={customerData.name}
                  onChange={(e) => setCustomerData((p) => ({ ...p, name: e.target.value }))}
                  placeholder="Nome completo"
                  className={inputClass}
                />
                <input
                  type="email" required
                  value={customerData.email}
                  onChange={(e) => setCustomerData((p) => ({ ...p, email: e.target.value }))}
                  placeholder="E-mail"
                  className={inputClass}
                  autoComplete="email"
                />
                <div className="grid grid-cols-2 gap-2 sm:gap-3">
                  <input
                    type="text" required
                    value={customerData.cpfCnpj}
                    onChange={(e) => setCustomerData((p) => ({ ...p, cpfCnpj: formatCPF(e.target.value) }))}
                    placeholder="CPF"
                    className={inputClass}
                    inputMode="numeric"
                  />
                  <input
                    type="text" required
                    value={customerData.phone}
                    onChange={(e) => setCustomerData((p) => ({ ...p, phone: formatPhone(e.target.value) }))}
                    placeholder="WhatsApp"
                    className={inputClass}
                    inputMode="tel"
                  />
                </div>
              </div>
            </section>

            {/* Address */}
            <section>
              <h2 className="text-xs sm:text-sm font-medium text-white/50 uppercase tracking-wider mb-3 sm:mb-4">
                {plan.type === "installment" ? "5" : "3"}. Endereco
              </h2>
              <div className="space-y-2 sm:space-y-3">
                <div className="grid grid-cols-2 gap-2 sm:gap-3">
                  <div className="relative">
                    <input
                      type="text" required
                      value={customerData.postalCode}
                      onChange={(e) => handleCepChange(e.target.value)}
                      placeholder="CEP"
                      className={`${inputClass} ${cepError ? "!border-red-500/50" : ""}`}
                      inputMode="numeric"
                    />
                    {isCepLoading && (
                      <Loader2 className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 animate-spin" />
                    )}
                  </div>
                  <input
                    type="text" required
                    value={customerData.addressNumber}
                    onChange={(e) => setCustomerData((p) => ({ ...p, addressNumber: e.target.value }))}
                    placeholder="Numero"
                    className={inputClass}
                  />
                </div>
                {cepError && (
                  <p className="text-xs text-red-400 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />{cepError}
                  </p>
                )}
                {customerData.street && (
                  <div className="p-3 bg-green-500/5 border border-green-500/20 rounded-lg">
                    <p className="text-xs text-green-400 flex items-center gap-1.5 mb-1">
                      <Check className="w-3 h-3" /> Endereco encontrado
                    </p>
                    <p className="text-sm text-white/70">
                      {customerData.street}, {customerData.neighborhood} — {customerData.city}/{customerData.state}
                    </p>
                  </div>
                )}
              </div>
            </section>

            {/* Card */}
            <section>
              <h2 className="text-xs sm:text-sm font-medium text-white/50 uppercase tracking-wider mb-3 sm:mb-4">
                {plan.type === "installment" ? "6" : "4"}. Cartao de credito
              </h2>
              <div className="space-y-2 sm:space-y-3">
                <input
                  type="text" required
                  value={cardData.number}
                  onChange={(e) => setCardData((p) => ({ ...p, number: formatCardNumber(e.target.value) }))}
                  placeholder="Numero do cartao"
                  maxLength={19}
                  className={inputClass}
                  autoComplete="cc-number"
                  inputMode="numeric"
                />
                <input
                  type="text" required
                  value={cardData.holderName}
                  onChange={(e) => setCardData((p) => ({ ...p, holderName: e.target.value.toUpperCase() }))}
                  placeholder="Nome impresso no cartao"
                  className={`${inputClass} uppercase text-sm`}
                  autoComplete="cc-name"
                />
                <div className="grid grid-cols-3 gap-2 sm:gap-3">
                  <input
                    type="text" required maxLength={2}
                    value={cardData.expiryMonth}
                    onChange={(e) => setCardData((p) => ({ ...p, expiryMonth: e.target.value.replace(/\D/g, "") }))}
                    placeholder="MM"
                    className={inputClass}
                    autoComplete="cc-exp-month"
                    inputMode="numeric"
                  />
                  <input
                    type="text" required maxLength={4}
                    value={cardData.expiryYear}
                    onChange={(e) => setCardData((p) => ({ ...p, expiryYear: e.target.value.replace(/\D/g, "") }))}
                    placeholder="AAAA"
                    className={inputClass}
                    autoComplete="cc-exp-year"
                    inputMode="numeric"
                  />
                  <div className="relative">
                    <input
                      type="text" required maxLength={4}
                      value={cardData.ccv}
                      onChange={(e) => setCardData((p) => ({ ...p, ccv: e.target.value.replace(/\D/g, "") }))}
                      placeholder="CVV"
                      className={inputClass}
                      autoComplete="cc-csc"
                      inputMode="numeric"
                    />
                    <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/20" />
                  </div>
                </div>
              </div>
            </section>

            {/* Coupon */}
            <section>
              <h2 className="text-xs sm:text-sm font-medium text-white/50 uppercase tracking-wider mb-3 sm:mb-4">
                Cupom de desconto
              </h2>
              {couponData ? (
                <div className="flex items-center justify-between p-3 bg-green-500/5 border border-green-500/20 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-400" />
                    <span className="text-sm text-green-400 font-medium">{couponData.coupon.code}</span>
                    <span className="text-xs text-white/40">— {couponData.coupon.description}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => { setCouponData(null); setCouponCode("") }}
                    className="text-xs text-white/30 hover:text-red-400 transition-colors"
                  >
                    Remover
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => { setCouponCode(e.target.value.toUpperCase()); setCouponError(null) }}
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), validateCoupon())}
                      placeholder="CODIGO DO CUPOM"
                      className={`flex-1 px-4 py-3 bg-white/[0.03] border rounded-lg text-sm text-white placeholder-white/25 focus:outline-none transition-all uppercase ${
                        couponError ? "border-red-500/50" : "border-white/10 focus:border-[#ff4f2d]"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={validateCoupon}
                      disabled={isCouponLoading || !couponCode.trim()}
                      className="px-5 py-3 bg-white/[0.05] hover:bg-white/10 border border-white/10 text-white text-sm rounded-lg transition-colors disabled:opacity-40"
                    >
                      {isCouponLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Aplicar"}
                    </button>
                  </div>
                  {couponError && (
                    <p className="text-xs text-red-400 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />{couponError}
                    </p>
                  )}
                </div>
              )}
            </section>

            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-3">
                <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            {/* Mobile summary */}
            <div className="lg:hidden">
              <OrderSummary
                plan={plan}
                professor={professor}
                shirtSize={shirtSize}
                couponData={couponData}
                discountedPrice={discountedPrice}
                discountAmount={discountAmount}
                discountedTotal={discountedTotal}
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading || !professor || (plan.type === "installment" && !shirtSize) || !customerData.street || !customerData.addressNumber}
              className="w-full py-3 sm:py-4 bg-[#ff4f2d] hover:bg-[#e6452a] disabled:opacity-40 disabled:cursor-not-allowed text-black font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 text-sm active:scale-95"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  {plan.type === "recurring"
                    ? `Assinar por R$ ${fmtBRL(discountedPrice)}/mes`
                    : `Pagar ${plan.installments}x de R$ ${fmtBRL(discountedPrice)}`
                  }
                </>
              )}
            </button>

            <div className="flex items-center justify-center gap-2 pb-4">
              <ShieldCheck className="w-4 h-4 text-green-400/60" />
              <p className="text-xs text-white/30">Pagamento 100% seguro com criptografia SSL</p>
            </div>
          </form>

          {/* ── RIGHT: Sticky summary (desktop) ─────────────────────────── */}
          <div className="hidden lg:block">
            <div className="sticky top-8">
              <OrderSummary
                plan={plan}
                professor={professor}
                shirtSize={shirtSize}
                couponData={couponData}
                discountedPrice={discountedPrice}
                discountAmount={discountAmount}
                discountedTotal={discountedTotal}
              />
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

// ─── Order Summary Component ───────────────────────────────────────────────
function OrderSummary({
  plan,
  professor,
  shirtSize,
  couponData,
  discountedPrice,
  discountAmount,
  discountedTotal,
}: {
  plan: Plan
  professor: string
  shirtSize: string
  couponData: CouponData | null
  discountedPrice: number
  discountAmount: number
  discountedTotal: number
}) {
  return (
    <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-6 space-y-5">
      <div>
        <p className="text-xs text-white/40 uppercase tracking-wider mb-1">Resumo</p>
        <h3 className="text-white font-medium text-base">Somma Assessoria — Plano {plan.name}</h3>
        <p className="text-white/50 text-sm mt-0.5">
          {plan.type === "recurring"
            ? "Cobranca mensal recorrente"
            : `${plan.installments}x de R$ ${fmtBRL(plan.price)} sem juros`
          }
        </p>
      </div>

      {(professor || shirtSize) && (
        <div className="border-t border-white/10 pt-4 space-y-2">
          {professor && (
            <div className="flex justify-between text-sm">
              <span className="text-white/50">Professor</span>
              <span className="text-white">{professor}</span>
            </div>
          )}
          {shirtSize && (
            <div className="flex justify-between text-sm">
              <span className="text-white/50">Camiseta</span>
              <span className="text-white">{shirtSize}</span>
            </div>
          )}
        </div>
      )}

      <div className="border-t border-white/10 pt-4 space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-white/60">
            {plan.type === "recurring" ? "Valor mensal" : "Valor por parcela"}
          </span>
          <span className="text-white">R$ {fmtBRL(plan.price)}</span>
        </div>
        {plan.type === "installment" && (
          <div className="flex justify-between text-sm">
            <span className="text-white/60">Total ({plan.installments}x)</span>
            <span className="text-white">R$ {fmtBRL(plan.total)}</span>
          </div>
        )}
        {couponData && (
          <div className="flex justify-between text-sm">
            <span className="text-green-400 flex items-center gap-1">
              <Tag className="w-3 h-3" /> {couponData.coupon.code}
            </span>
            <span className="text-green-400">-R$ {fmtBRL(discountAmount)}/parcela</span>
          </div>
        )}
      </div>

      <div className="border-t border-white/10 pt-4">
        <div className="flex justify-between items-baseline">
          <span className="text-white/60 text-sm">
            {plan.type === "recurring" ? "Cobrado agora" : "Total"}
          </span>
          <div className="text-right">
            {couponData && plan.type === "installment" && (
              <span className="text-white/30 line-through text-sm mr-2">R$ {fmtBRL(plan.total)}</span>
            )}
            <span className="text-2xl font-light text-white">
              R$ {fmtBRL(plan.type === "recurring" ? discountedPrice : discountedTotal)}
            </span>
          </div>
        </div>
        {plan.type === "installment" && (
          <p className="text-xs text-white/40 mt-1 text-right">
            em {plan.installments}x de R$ {fmtBRL(discountedPrice)}
          </p>
        )}
      </div>

      <div className="flex items-center gap-2 pt-1">
        <ShieldCheck className="w-4 h-4 text-green-400 flex-shrink-0" />
        <p className="text-xs text-white/40">Pagamento 100% seguro via Asaas</p>
      </div>
    </div>
  )
}
