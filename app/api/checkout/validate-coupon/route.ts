import { NextResponse } from "next/server"

// Cupons cadastrados - edite aqui para adicionar/remover cupons
const COUPONS: Record<string, { type: "PERCENTAGE" | "FIXED"; value: number; description: string; active: boolean }> = {
  "SOMMA5": { type: "PERCENTAGE", value: 5, description: "5% de desconto", active: true },
  "SOMMA10": { type: "PERCENTAGE", value: 10, description: "10% de desconto", active: true },
  "SOMMA20": { type: "PERCENTAGE", value: 20, description: "20% de desconto", active: true },
  "SOMMA50": { type: "FIXED", value: 50, description: "R$ 50,00 de desconto", active: true },
  "PRIMEIRACOMPRA": { type: "PERCENTAGE", value: 15, description: "15% na primeira compra", active: true },
  "SOMMA99": { type: "PERCENTAGE", value: 99, description: "99% de desconto", active: true },
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get("code")?.toUpperCase().trim()
    const valueParam = searchParams.get("value")
    const value = valueParam ? parseFloat(valueParam) : 0

    if (!code) {
      return NextResponse.json(
        { valid: false, error: "Código do cupom não informado" },
        { status: 400 }
      )
    }

    if (!value || value <= 0) {
      return NextResponse.json(
        { valid: false, error: "Valor inválido" },
        { status: 400 }
      )
    }

    const coupon = COUPONS[code]

    if (!coupon) {
      return NextResponse.json(
        { valid: false, error: "Cupom não encontrado" },
        { status: 404 }
      )
    }

    if (!coupon.active) {
      return NextResponse.json(
        { valid: false, error: "Cupom expirado ou inativo" },
        { status: 400 }
      )
    }

    // Valor mínimo exigido pelo Asaas para cartão de crédito
    const MINIMUM_VALUE = 5.00

    // Calcular desconto
    let discountAmount: number
    if (coupon.type === "PERCENTAGE") {
      discountAmount = value * (coupon.value / 100)
    } else {
      discountAmount = Math.min(coupon.value, value) // Não pode ser maior que o valor total
    }

    // Garantir que o valor final não seja menor que o mínimo do Asaas
    let finalValue = value - discountAmount
    if (finalValue < MINIMUM_VALUE) {
      // Ajustar o desconto para garantir o valor mínimo
      discountAmount = value - MINIMUM_VALUE
      finalValue = MINIMUM_VALUE
    }
    
    // Se o desconto ficou zerado ou negativo, o cupom não se aplica
    if (discountAmount <= 0) {
      return NextResponse.json(
        { valid: false, error: "Cupom não aplicável para este valor" },
        { status: 400 }
      )
    }

    return NextResponse.json({
      valid: true,
      coupon: {
        code,
        type: coupon.type,
        value: coupon.value,
        description: coupon.description,
      },
      calculation: {
        originalValue: value,
        discount: discountAmount,
        finalValue,
      },
      asaasDiscount: {
        value: discountAmount,
        dueDateLimitDays: 0,
        type: "FIXED",
      },
    })
  } catch (error) {
    console.error("[validate-coupon] Error:", error)
    return NextResponse.json(
      { valid: false, error: "Erro ao validar cupom" },
      { status: 500 }
    )
  }
}
