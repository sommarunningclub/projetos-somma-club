import { createClient } from "@supabase/supabase-js"
import {
  getAllAsaasCustomers,
  getAllAsaasPayments,
  inferPlanFromPayment,
  extractProfessor,
  extractCamiseta,
  extractCupom,
  extractParcelaTotal,
  translateStatus,
  PROFESSOR_CPFS,
  PRECO_TABELA,
  type AsaasPayment,
} from "./client"

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!
  return createClient(url, key)
}

const RECEBIDAS = new Set(["RECEIVED", "CONFIRMED", "RECEIVED_IN_CASH"])

function mode<T>(values: T[]): T | undefined {
  if (values.length === 0) return undefined
  const counts = new Map<T, number>()
  for (const v of values) counts.set(v, (counts.get(v) ?? 0) + 1)
  return [...counts.entries()].sort((a, b) => b[1] - a[1])[0][0]
}

function median(values: number[]): number {
  if (values.length === 0) return 0
  const sorted = [...values].sort((a, b) => a - b)
  return sorted[Math.floor(sorted.length / 2)]
}

const BILLING_LABEL: Record<string, string> = {
  CREDIT_CARD: "Cartão de Crédito",
  DEBIT_CARD: "Cartão de Débito",
  PIX: "Pix",
  BOLETO: "Boleto",
  TRANSFER: "Transferência",
  DEPOSIT: "Depósito",
  UNDEFINED: "Indefinido",
}

export interface SyncResult {
  alunos: number
  cobrancas: number
  erros: string[]
  duracao_ms: number
}

export async function syncAsaasToSupabase(): Promise<SyncResult> {
  const startedAt = Date.now()
  const supabase = getSupabase()
  const erros: string[] = []
  let alunosUpserted = 0
  let cobrancasUpserted = 0

  // Log: início
  const { data: logRow } = await supabase
    .from("asaas_sync_logs")
    .insert({ sync_type: "full", status: "running", started_at: new Date().toISOString() })
    .select("id")
    .single()
  const logId = logRow?.id

  try {
    // 1. Buscar customers e excluir CPFs internos
    const customers = (await getAllAsaasCustomers()).filter(
      c => !PROFESSOR_CPFS.has((c.cpfCnpj ?? "").replace(/\D/g, ""))
    )

    // 2. Buscar payments (sem filtrar deletados ainda — webhook pode ter marcado)
    const allPayments = await getAllAsaasPayments()

    // Filtrar: ignorar deletados, valor <= 5 (testes SOMMA99) e estornos
    const paymentsValidos = allPayments.filter(
      p => !p.deleted && p.value > 5 && p.status !== "REFUNDED"
    )

    // 3. Agrupar por customer
    const byCustomer = new Map<string, AsaasPayment[]>()
    for (const p of paymentsValidos) {
      const arr = byCustomer.get(p.customer) ?? []
      arr.push(p)
      byCustomer.set(p.customer, arr)
    }

    // 4. Para cada customer com cobranças, computar e upsert
    for (const customer of customers) {
      const payments = byCustomer.get(customer.id) ?? []

      // Mesmo sem cobranças válidas, o customer existe — manter dado básico
      const planos = payments.map(inferPlanFromPayment).filter(p => p !== "Avulso")
      const planoFinal = mode(planos) ?? "Avulso"
      const professor = payments.map(p => extractProfessor(p.description)).find(Boolean) ?? null
      const camiseta = payments.map(p => extractCamiseta(p.description)).find(Boolean) ?? null
      const cupom = payments.map(p => extractCupom(p.description)).find(Boolean) ?? null

      const formaPagamento = mode(
        payments.map(p => BILLING_LABEL[p.billingType] ?? p.billingType)
      ) ?? null

      const valorMensalidade = median(payments.map(p => p.value))
      const valorTabela = PRECO_TABELA[planoFinal] ?? 220

      const totalRecebido = payments.filter(p => RECEBIDAS.has(p.status)).reduce((s, p) => s + p.value, 0)
      const totalPendente = payments.filter(p => p.status === "PENDING").reduce((s, p) => s + p.value, 0)
      const totalVencido = payments.filter(p => p.status === "OVERDUE").reduce((s, p) => s + p.value, 0)
      const statusPagamento = totalVencido > 0 ? "Vencido" : totalPendente > 0 ? "Pendente" : "Em dia"

      const { error: alunoErr } = await supabase
        .from("asaas_customers_sync")
        .upsert(
          {
            asaas_id: customer.id,
            name: customer.name,
            email: customer.email ?? null,
            cpf_cnpj: customer.cpfCnpj ?? null,
            mobile_phone: customer.mobilePhone ?? null,
            phone: customer.phone ?? null,
            postal_code: customer.postalCode ?? null,
            address: customer.address ?? null,
            address_number: customer.addressNumber ?? null,
            province: customer.province ?? null,
            city: customer.city ?? null,
            state: customer.state ?? null,
            deleted: customer.deleted ?? false,
            // Campos PACE 360
            plano: planoFinal,
            valor_mensalidade: valorMensalidade,
            valor_tabela: valorTabela,
            cupom,
            professor,
            tamanho_camiseta: camiseta,
            forma_pagamento: formaPagamento,
            status_pagamento: statusPagamento,
            total_recebido: totalRecebido,
            total_pendente: totalPendente,
            total_vencido: totalVencido,
            last_synced_at: new Date().toISOString(),
            sync_status: "synced",
            sync_error: null,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "asaas_id" }
        )

      if (alunoErr) {
        erros.push(`Aluno ${customer.name}: ${alunoErr.message}`)
        continue
      }
      alunosUpserted++

      // Upsert de cada cobrança
      for (const payment of payments) {
        const { error: cobErr } = await supabase
          .from("payments")
          .upsert(
            {
              asaas_id: payment.id,
              customer_asaas_id: payment.customer,
              value: payment.value,
              net_value: payment.netValue ?? null,
              due_date: payment.dueDate,
              payment_date: payment.paymentDate ?? null,
              status: payment.status,
              billing_type: payment.billingType,
              description: payment.description ?? null,
              external_reference: payment.externalReference ?? null,
              raw_data: payment as unknown as Record<string, unknown>,
              // Campos PACE 360
              plano: inferPlanFromPayment(payment),
              subscription_id: payment.subscription ?? null,
              installment_id: payment.installment ?? null,
              parcela_numero: payment.installmentNumber ?? null,
              parcela_total: extractParcelaTotal(payment.description),
              situacao_display: translateStatus(payment.status),
              professor: extractProfessor(payment.description),
              cupom: extractCupom(payment.description),
              tamanho_camiseta: extractCamiseta(payment.description),
              deleted: payment.deleted ?? false,
              updated_at: new Date().toISOString(),
            },
            { onConflict: "asaas_id" }
          )

        if (cobErr) erros.push(`Cobrança ${payment.id}: ${cobErr.message}`)
        else cobrancasUpserted++
      }
    }

    // Atualizar config: timestamp da última sync bem-sucedida
    await supabase
      .from("pace360_config")
      .upsert(
        { chave: "ultima_sync_asaas", valor: new Date().toISOString(), atualizado_em: new Date().toISOString() },
        { onConflict: "chave" }
      )

    const duracao_ms = Date.now() - startedAt

    if (logId) {
      await supabase
        .from("asaas_sync_logs")
        .update({
          status: erros.length > 0 ? "partial" : "success",
          total_customers: customers.length,
          synced_customers: alunosUpserted,
          failed_customers: erros.length,
          error_message: erros.length > 0 ? erros.slice(0, 5).join(" | ") : null,
          completed_at: new Date().toISOString(),
        })
        .eq("id", logId)
    }

    return { alunos: alunosUpserted, cobrancas: cobrancasUpserted, erros, duracao_ms }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    if (logId) {
      await supabase
        .from("asaas_sync_logs")
        .update({
          status: "failed",
          error_message: msg,
          completed_at: new Date().toISOString(),
        })
        .eq("id", logId)
    }
    throw err
  }
}
