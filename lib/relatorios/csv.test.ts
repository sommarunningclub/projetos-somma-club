import { test } from "node:test"
import assert from "node:assert/strict"
import { toCSV } from "./csv"

test("gera CSV com cabeçalho e separador ;", () => {
  const out = toCSV([{ a: 1, b: "x" }, { a: 2, b: "y" }])
  const linhas = out.replace("﻿", "").split("\n")
  assert.equal(linhas[0], "a;b")
  assert.equal(linhas[1], "1;x")
  assert.equal(linhas[2], "2;y")
})

test("aplica rótulos customizados", () => {
  const out = toCSV([{ prof: "Joseph", total: 100 }], { prof: "Professor", total: "Total" })
  assert.ok(out.includes("Professor;Total"))
})

test("escapa valores com ponto-e-vírgula, aspas e quebra de linha", () => {
  const out = toCSV([{ nome: 'Silva; "Jr"', obs: "linha1\nlinha2" }])
  assert.ok(out.includes('"Silva; ""Jr"""'))
  assert.ok(out.includes('"linha1\nlinha2"'))
})

test("lista vazia retorna string vazia", () => {
  assert.equal(toCSV([]), "")
})
