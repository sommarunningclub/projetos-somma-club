import { test } from "node:test"
import assert from "node:assert/strict"
import {
  addMonths, expandirPagamento, expandirCompetencias, calendarioAno, detalheMes,
  type CompPayment,
} from "./competencia"
import { REPASSE_CONFIG_DEFAULT, type RepasseConfig } from "./calculo"

function pay(o: Partial<CompPayment>): CompPayment {
  return {
    asaas_id: "pay", customer_asaas_id: "c1", professor: "Joseph Pereira", aluno: "Fulano",
    plano: "Mensal", value: 220, status: "RECEIVED", due_date: "2026-06-10", credit_date: "2026-06-12",
    ...o,
  }
}

test("addMonths atravessa o ano corretamente", () => {
  assert.equal(addMonths("2026-02", 0), "2026-02")
  assert.equal(addMonths("2026-11", 2), "2027-01")
  assert.equal(addMonths("2026-02", 11), "2027-01")
})

test("mensal gera 1 competência no mês do vencimento", () => {
  const out = expandirPagamento(pay({ plano: "Mensal", value: 220, due_date: "2026-06-10" }))
  assert.equal(out.length, 1)
  assert.equal(out[0].mes, "2026-06")
  assert.equal(out[0].valorMensal, 220)
})

test("anual à vista distribui em 12 meses de R$180", () => {
  const out = expandirPagamento(pay({ plano: "Anual_avista", value: 2160, due_date: "2026-02-28", status: "RECEIVED" }))
  assert.equal(out.length, 12)
  assert.equal(out[0].mes, "2026-02")
  assert.equal(out[11].mes, "2027-01")
  assert.equal(out[0].valorMensal, 180)
  assert.ok(out.every(c => c.recebido === true)) // pago à vista = dinheiro na conta
})

test("semestral à vista distribui em 6 meses de R$200", () => {
  const out = expandirPagamento(pay({ plano: "Semestral_avista", value: 1200, due_date: "2026-03-01", status: "RECEIVED" }))
  assert.equal(out.length, 6)
  assert.equal(out[0].valorMensal, 200)
  assert.equal(out[5].mes, "2026-08")
})

test("parcela de semestral parcelado conta como 1 mês", () => {
  const out = expandirPagamento(pay({ plano: "Semestral", value: 200, due_date: "2026-07-05", status: "PENDING" }))
  assert.equal(out.length, 1)
  assert.equal(out[0].valorMensal, 200)
  assert.equal(out[0].recebido, false)
})

test("calendário do ano agrega repasse por professor e mês", () => {
  const items = expandirCompetencias([
    pay({ professor: "Joseph Pereira", plano: "Anual_avista", value: 2160, due_date: "2026-01-15", status: "RECEIVED" }),
    pay({ professor: "Joseph Pereira", plano: "Mensal", value: 220, due_date: "2026-01-10", status: "RECEIVED" }),
    pay({ professor: "Alexandre Alves", plano: "Mensal", value: 200, due_date: "2026-01-10", status: "PENDING" }),
  ])
  const { professores, totaisMes } = calendarioAno(items, REPASSE_CONFIG_DEFAULT, "2026")
  const joseph = professores.find(p => p.professor === "Joseph Pereira")!
  // jan: anual(180-50=130) + mensal(220-50=170) = 300
  assert.equal(joseph.meses["2026-01"].repasse, 300)
  assert.equal(joseph.meses["2026-02"].repasse, 130) // só a parcela anual
  // Alexandre isento: repasse = valor cheio
  const alex = professores.find(p => p.professor === "Alexandre Alves")!
  assert.equal(alex.meses["2026-01"].repasse, 200)
  assert.equal(alex.meses["2026-01"].aReceber, 200) // pendente
  assert.equal(totaisMes["2026-01"].repasse, 500) // 300 + 200
})

test("detalhe do mês lista por aluno com taxa e status", () => {
  const items = expandirCompetencias([
    pay({ professor: "Joseph Pereira", aluno: "Ana", plano: "Mensal", value: 220, due_date: "2026-06-10", status: "RECEIVED" }),
    pay({ professor: "Joseph Pereira", aluno: "Bia", plano: "Anual_avista", value: 2160, due_date: "2026-06-01", status: "RECEIVED" }),
  ])
  const det = detalheMes(items, REPASSE_CONFIG_DEFAULT, "2026-06")
  assert.equal(det.length, 2)
  assert.equal(det.find(d => d.aluno === "Ana")!.repasse, 170)
  assert.equal(det.find(d => d.aluno === "Bia")!.repasse, 130)
})
