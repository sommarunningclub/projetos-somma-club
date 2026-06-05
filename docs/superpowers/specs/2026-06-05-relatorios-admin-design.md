# Spec: Relatórios gerenciais no /admin (Carteira e Repasse)

Data: 2026-06-05
Status: aprovado para planejamento

## Contexto

O painel `/admin` (PACE 360) hoje tem Dashboard, Alunos, Cobranças e Alertas, alimentados por uma sincronização do Asaas para o Supabase. O usuário quer **substituir o foco do admin por relatórios gerenciais financeiros**, organizados por professor/grupo, com filtro de período e baseados na **data de recebimento real do dinheiro** (não na data de cobrança ao cliente).

São dois relatórios:
1. **Carteira** — total efetivamente creditado no período, com cruzamentos e visões sintética/analítica.
2. **Repasse** — quanto repassar a cada professor, descontando a taxa do Somma (R$50 por cobrança; Alexandre é isento).

## Decisões tomadas (do brainstorming)

- **Data base = `creditDate` do Asaas** (data de crédito real na conta). Confirmado empiricamente: cartão `CONFIRMED` tem `paymentDate: null` e `creditDate` ~D+30; PIX/boleto creditam ~D+1. O campo `payment_date` atual é insuficiente (vazio para cartão).
- **Taxa de repasse = R$50 por cobrança recebida** (por parcela/cobrança, não por mês contratado). Alexandre Alves é isento (recebe integral). A Somma arca com as taxas do Asaas — por isso o cálculo usa `value` (bruto), não `net_value`.
- **Taxa e isenção editáveis pelo painel** (persistidas no Supabase).
- **Novo admin focado em relatórios.** Páginas antigas saem da navegação (arquivadas, não deletadas, por segurança). O motor de sync é **mantido** (é a fonte dos dados).
- **Exportar CSV** nos dois relatórios.
- **Agrupamento por professor = grupo de clientes do Asaas.** Cruzamentos adicionais: plano, forma de pagamento, mês.

## Mudança de dados (Supabase)

Migration idempotente (`scripts/00X_relatorios.sql`):

1. **`payments.credit_date`** (DATE, nullable) — data de crédito real. Índice `idx_payments_credit_date`.
2. Nova tabela **`repasse_config`**:
   - `professor` (TEXT, PK) — nome do professor/grupo; linha especial `__default__` para a taxa padrão.
   - `taxa` (NUMERIC(10,2)) — taxa do Somma por cobrança.
   - `isento` (BOOLEAN, default false).
   - `updated_at` (TIMESTAMPTZ).
   - Seed: `__default__` taxa=50; `Alexandre Alves` isento=true (taxa=0).

## Sincronização

- `lib/asaas/client.ts`: adicionar `creditDate?: string` à interface `AsaasPayment`.
- `lib/asaas/sync.ts`: gravar `credit_date: payment.creditDate ?? null` no upsert de `payments`.
- `app/api/webhook/asaas/route.ts`: gravar `credit_date` quando o evento trouxer (idealmente; senão a próxima sync completa preenche).
- Backfill: rodar a sync completa uma vez após a migration preenche `credit_date` de todo o histórico (a sync varre todos os payments do Asaas).

## Relatório de Carteira

**Entrada (filtros):** período (de/até sobre `credit_date`), professor, plano, forma de pagamento, status.
**Dimensão de agrupamento (cruzamento):** professor | plano | forma de pagamento | mês.

**Regra de inclusão:** status ∈ {RECEIVED, CONFIRMED, RECEIVED_IN_CASH}, `deleted=false`, e `credit_date` dentro do período.

**Sintético:** uma linha por grupo → { grupo, qtd_cobranças, total_creditado }. Linha de total geral.
**Analítico:** por grupo, lista de cobranças → { aluno, plano, due_date, credit_date, forma, value }.

## Relatório de Repasse

**Entrada:** período (de/até sobre `credit_date`); reaproveita os mesmos filtros.
**Cálculo por cobrança elegível** (mesma regra de inclusão da Carteira):
- `bruto = value`
- `taxa = repasse_config[professor].isento ? 0 : (repasse_config[professor].taxa ?? repasse_config.__default__.taxa)`
- `repasse = bruto - taxa`

**Sintético:** por professor → { professor, qtd, bruto, taxa_total, repasse }. Total geral + total retido pela Somma.
**Analítico:** cada cobrança → { aluno, plano, credit_date, bruto, taxa, repasse }.

## Configuração de taxas (UI)

Tela simples em `/admin/relatorios/config` (ou seção na página de repasse): lista professores conhecidos + taxa padrão; permite editar `taxa` e marcar `isento`. Persiste em `repasse_config` via rota `POST /api/admin/repasse-config`.

## Arquitetura

- **Rota** `GET /api/admin/relatorios` — params: `tipo` (carteira|repasse), `de`, `ate`, `agrupar`, filtros. Query em `payments` por `credit_date`, join com `asaas_customers_sync` (nome do aluno), aplica `repasse_config`, retorna `{ sintetico: [...], analitico: [...] , totais }`. Reusa padrão das rotas admin existentes (Supabase service client + agregação em JS).
- **Páginas**:
  - `app/admin/page.tsx` → redireciona/serve a Carteira (home do novo admin).
  - `app/admin/relatorios/carteira/page.tsx`, `.../repasse/page.tsx` (ou abas numa página). Toggle sintético/analítico, filtros, botão **Exportar CSV** (geração client-side a partir dos dados já carregados).
  - `app/admin/relatorios/config` para taxas.
- **Navegação**: `components/admin/sidebar.tsx` → `NAV_ITEMS` passa a ser Carteira, Repasse, Config. Itens antigos removidos da lista.
- **Arquivamento**: páginas antigas (`alunos`, `cobrancas`, `alertas`, dashboard atual) saem da navegação. Código mantido (pode ser deletado depois mediante confirmação). Sync, webhook e APIs de dados permanecem.
- **Config central** de fallback no código (`lib/relatorios/config.ts`): taxa padrão e isentos default, usados se a tabela estiver vazia.

## Componentes (isolamento)

- `lib/relatorios/calculo.ts` — funções **puras**: `agregarCarteira(payments, agrupar)` e `calcularRepasse(payments, config)`. Testáveis isoladamente (TDD).
- `components/admin/relatorio-table.tsx` — tabela sintético/analítico genérica.
- `lib/relatorios/csv.ts` — `toCSV(rows)` puro.

## Testes

- Unitários (node:test + tsx, como em `lib/asaas/groups.test.ts`):
  - `calcularRepasse`: taxa padrão, isenção do Alexandre, múltiplas cobranças, valor < taxa (não deve negativar — clamp em 0).
  - `agregarCarteira`: agrupamento por cada dimensão, soma e contagem.
  - `toCSV`: escaping de vírgula/aspas, cabeçalho.
- Verificação manual: rodar sync para preencher `credit_date`, abrir os relatórios, conferir totais de um mês contra o painel do Asaas, exportar CSV.

## Fora de escopo (YAGNI)

- Gráficos/charts (só tabelas + totais por enquanto).
- Agendamento/e-mail automático de relatórios.
- Deleção definitiva das páginas antigas (fica para confirmação posterior).
- Sincronizar o campo `groups` do Asaas (agrupamento usa `payments.professor`, que já existe).
