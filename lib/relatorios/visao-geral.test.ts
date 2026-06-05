import { test } from "node:test"
import assert from "node:assert/strict"
import {
  competenciaMes, categoria, filtrarMes, resumoPorProfessor, agendaReceber,
  type VGPayment,
} from "./visao-geral"
import { REPASSE_CONFIG_DEFAULT } from "./calculo"

function p(o: Partial<VGPayment>): VGPayment {
  return {
    asaas_id: "pay", customer_asaas_id: "cus_1", value: 220, status: "RECEIVED",
    professor: "Joseph Pereira", aluno: "Fulano", plano: "Mensal",
    due_date: "2026-06-10", credit_date: "2026-06-12", estimated_credit_date: null,
    ...o,
  }
}

test("competência usa crédito real, depois estimado, depois vencimento", () => {
  assert.equal(competenciaMes(p({ credit_date: "2026-07-05" })), "2026-07")
  assert.equal(competenciaMes(p({ credit_date: null, estimated_credit_date: "2026-08-03" })), "2026-08")
  assert.equal(competenciaMes(p({ credit_date: null, estimated_credit_date: null, due_date: "2026-09-01" })), "2026-09")
  assert.equal(competenciaMes(p({ credit_date: null, estimated_credit_date: null, due_date: null })), null)
})

test("categoriza status", () => {
  assert.equal(categoria("RECEIVED"), "recebido")
  assert.equal(categoria("CONFIRMED"), "recebido")
  assert.equal(categoria("PENDING"), "aReceber")
  assert.equal(categoria("OVERDUE"), "vencido")
  assert.equal(categoria("REFUNDED"), "outro")
})

test("filtra cobranças do mês e ignora status inválidos", () => {
  const rows = [
    p({ asaas_id: "a", credit_date: "2026-06-12" }),
    p({ asaas_id: "b", credit_date: "2026-07-01" }),
    p({ asaas_id: "c", status: "REFUNDED", credit_date: "2026-06-05" }),
    p({ asaas_id: "d", status: "PENDING", credit_date: null, estimated_credit_date: "2026-06-20" }),
  ]
  const out = filtrarMes(rows, "2026-06").map(r => r.asaas_id).sort()
  assert.deepEqual(out, ["a", "d"])
})

test("resumo por professor: recebido, a receber, vencido, taxa e repasse", () => {
  const rows = [
    p({ professor: "Joseph Pereira", status: "RECEIVED", value: 220, customer_asaas_id: "c1" }),
    p({ professor: "Joseph Pereira", status: "PENDING", value: 220, customer_asaas_id: "c2" }),
    p({ professor: "Joseph Pereira", status: "OVERDUE", value: 220, customer_asaas_id: "c3" }),
    p({ professor: "Alexandre Alves", status: "RECEIVED", value: 200, customer_asaas_id: "c4" }),
  ]
  const { professores, totais } = resumoPorProfessor(rows, REPASSE_CONFIG_DEFAULT)
  const joseph = professores.find(x => x.professor === "Joseph Pereira")!
  assert.equal(joseph.alunos, 3)
  assert.equal(joseph.cobrancas, 3)
  assert.equal(joseph.recebido, 220)
  assert.equal(joseph.aReceber, 220)
  assert.equal(joseph.vencido, 220)
  assert.equal(joseph.previsaoTotal, 660)
  assert.equal(joseph.taxaTotal, 150) // 3 × 50
  assert.equal(joseph.repassePrevisto, 510) // 660 - 150
  const alex = professores.find(x => x.professor === "Alexandre Alves")!
  assert.equal(alex.taxaTotal, 0) // isento
  assert.equal(alex.repassePrevisto, 200)
  assert.equal(totais.previsaoTotal, 860)
  assert.equal(totais.taxaTotal, 150)
})

test("agenda a receber lista pendentes e vencidos ordenados por vencimento", () => {
  const rows = [
    p({ asaas_id: "r", status: "RECEIVED" }), // não entra
    p({ asaas_id: "v", status: "OVERDUE", due_date: "2026-06-05" }),
    p({ asaas_id: "a", status: "PENDING", due_date: "2026-06-02" }),
  ]
  const ag = agendaReceber(rows)
  assert.deepEqual(ag.map(x => x.asaas_id), ["a", "v"])
  assert.equal(ag[0].status, "aReceber")
  assert.equal(ag[1].status, "vencido")
})
