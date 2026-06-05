import { test } from "node:test"
import assert from "node:assert/strict"
import { resolveGroupName } from "./groups"

test("nome exato canônico retorna o próprio grupo", () => {
  assert.equal(resolveGroupName("Mateus Fonseca"), "Mateus Fonseca")
  assert.equal(resolveGroupName("Alexandre Alves"), "Alexandre Alves")
  assert.equal(resolveGroupName("Joseph Pereira"), "Joseph Pereira")
})

test('tolera grafia antiga "Matheus" com h', () => {
  assert.equal(resolveGroupName("Matheus Fonseca"), "Mateus Fonseca")
})

test("é insensível a caixa, acentos e espaços extras", () => {
  assert.equal(resolveGroupName("  MATEUS   fonseca "), "Mateus Fonseca")
  assert.equal(resolveGroupName("joseph pereira"), "Joseph Pereira")
  assert.equal(resolveGroupName("ALEXANDRE ALVES"), "Alexandre Alves")
})

test("retorna null para entradas vazias ou nulas", () => {
  assert.equal(resolveGroupName(null), null)
  assert.equal(resolveGroupName(undefined), null)
  assert.equal(resolveGroupName(""), null)
  assert.equal(resolveGroupName("   "), null)
})

test("mapeia apelidos da planilha de gestão", () => {
  assert.equal(resolveGroupName("JôJô"), "Joseph Pereira")
  assert.equal(resolveGroupName("jojo"), "Joseph Pereira")
  assert.equal(resolveGroupName("Alexandre"), "Alexandre Alves")
  assert.equal(resolveGroupName("Matheus"), "Mateus Fonseca")
})

test("retorna null para professor desconhecido (nunca inventa grupo)", () => {
  assert.equal(resolveGroupName("Fulano de Tal"), null)
})
