import { test } from "node:test"
import assert from "node:assert/strict"
import {
  filtrarRecebidasNoPeriodo, agregarCarteira, calcularRepasse,
  taxaParaProfessor, getCreditDate, REPASSE_CONFIG_DEFAULT,
  type PaymentRow, type RepasseConfig,
} from "./calculo"

function row(p: Partial<PaymentRow>): PaymentRow {
  return {
    asaas_id: "pay_1", customer_asaas_id: "cus_1", value: 220, status: "RECEIVED",
    billing_type: "CREDIT_CARD", due_date: "2026-05-01", payment_date: null,
    plano: "Mensal", professor: "Joseph Pereira", aluno: "Fulano", credit_date: "2026-05-10",
    ...p,
  }
}

test("getCreditDate prioriza credit_date e cai para payment_date", () => {
  assert.equal(getCreditDate({ credit_date: "2026-07-07", payment_date: "2026-06-01" }), "2026-07-07")
  assert.equal(getCreditDate({ credit_date: null, payment_date: "2026-06-01" }), "2026-06-01")
  assert.equal(getCreditDate({ credit_date: null, payment_date: null }), null)
})

test("filtra recebidas dentro do período pela data de crédito", () => {
  const rows = [
    row({ asaas_id: "a", credit_date: "2026-05-10" }),
    row({ asaas_id: "b", credit_date: "2026-04-30" }), // fora (antes)
    row({ asaas_id: "c", credit_date: "2026-06-02" }), // fora (depois)
    row({ asaas_id: "d", status: "PENDING", credit_date: "2026-05-15" }), // não recebida
    row({ asaas_id: "e", credit_date: null }), // sem data
  ]
  const out = filtrarRecebidasNoPeriodo(rows, "2026-05-01", "2026-05-31")
  assert.deepEqual(out.map(r => r.asaas_id), ["a"])
})

test("período aberto (sem de/ate) inclui todas as recebidas com data", () => {
  const rows = [row({ asaas_id: "a" }), row({ asaas_id: "b", credit_date: null })]
  assert.equal(filtrarRecebidasNoPeriodo(rows, "", "").length, 1)
})

test("agrega carteira por professor", () => {
  const rows = [
    row({ professor: "Joseph Pereira", value: 220 }),
    row({ professor: "Joseph Pereira", value: 180 }),
    row({ professor: "Alexandre Alves", value: 200 }),
  ]
  const { grupos, totalGeral, qtdGeral } = agregarCarteira(rows, "professor")
  assert.equal(totalGeral, 600)
  assert.equal(qtdGeral, 3)
  assert.equal(grupos[0].grupo, "Joseph Pereira")
  assert.equal(grupos[0].total, 400)
  assert.equal(grupos[0].qtd, 2)
})

test("agrega carteira por mês usa a data de crédito", () => {
  const rows = [
    row({ credit_date: "2026-05-10", value: 100 }),
    row({ credit_date: "2026-06-03", value: 50 }),
  ]
  const { grupos } = agregarCarteira(rows, "mes")
  const meses = grupos.map(g => g.grupo).sort()
  assert.deepEqual(meses, ["2026-05", "2026-06"])
})

test("taxa padrão e isenção do Alexandre", () => {
  const cfg = REPASSE_CONFIG_DEFAULT
  assert.equal(taxaParaProfessor("Joseph Pereira", cfg), 50)
  assert.equal(taxaParaProfessor("Alexandre Alves", cfg), 0)
  assert.equal(taxaParaProfessor("Mateus Fonseca", cfg), 50)
})

test("taxa customizada por professor sobrescreve padrão", () => {
  const cfg: RepasseConfig = { taxaPadrao: 50, professores: { "Joseph Pereira": { taxa: 30 } } }
  assert.equal(taxaParaProfessor("Joseph Pereira", cfg), 30)
})

test("calcula repasse com taxa e isenção", () => {
  const rows = [
    row({ professor: "Joseph Pereira", value: 220 }),
    row({ professor: "Joseph Pereira", value: 200 }),
    row({ professor: "Alexandre Alves", value: 300 }),
  ]
  const r = calcularRepasse(rows, REPASSE_CONFIG_DEFAULT)
  assert.equal(r.totalBruto, 720)
  assert.equal(r.totalTaxa, 100) // 50 + 50 + 0
  assert.equal(r.totalRepasse, 620)
  const joseph = r.grupos.find(g => g.professor === "Joseph Pereira")!
  assert.equal(joseph.repasse, 320) // (220-50)+(200-50)
  const alex = r.grupos.find(g => g.professor === "Alexandre Alves")!
  assert.equal(alex.repasse, 300) // isento
})

test("repasse nunca fica negativo quando valor < taxa", () => {
  const rows = [row({ professor: "Joseph Pereira", value: 30 })]
  const r = calcularRepasse(rows, REPASSE_CONFIG_DEFAULT)
  assert.equal(r.totalTaxa, 30) // taxa limitada ao bruto
  assert.equal(r.totalRepasse, 0)
})
