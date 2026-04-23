-- ─────────────────────────────────────────────────────────────────────────────
-- PACE 360 — Migração inicial
-- Estende tabelas existentes (asaas_customers_sync, payments) e cria
-- pace360_config. Idempotente: pode ser rodada múltiplas vezes sem efeito.
-- ─────────────────────────────────────────────────────────────────────────────

-- ─── 1. asaas_customers_sync (alunos) ───────────────────────────────────────
ALTER TABLE asaas_customers_sync
  ADD COLUMN IF NOT EXISTS plano                TEXT,
  ADD COLUMN IF NOT EXISTS valor_mensalidade    NUMERIC(10,2),
  ADD COLUMN IF NOT EXISTS valor_tabela         NUMERIC(10,2),
  ADD COLUMN IF NOT EXISTS cupom                TEXT,
  ADD COLUMN IF NOT EXISTS professor            TEXT,
  ADD COLUMN IF NOT EXISTS tamanho_camiseta     TEXT,
  ADD COLUMN IF NOT EXISTS forma_pagamento      TEXT,
  ADD COLUMN IF NOT EXISTS status_pagamento     TEXT DEFAULT 'Em dia',
  ADD COLUMN IF NOT EXISTS total_recebido       NUMERIC(10,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_pendente       NUMERIC(10,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_vencido        NUMERIC(10,2) DEFAULT 0;

-- Coluna gerada: true quando há desconto aplicado
ALTER TABLE asaas_customers_sync DROP COLUMN IF EXISTS tem_desconto;
ALTER TABLE asaas_customers_sync
  ADD COLUMN tem_desconto BOOLEAN GENERATED ALWAYS AS (
    valor_mensalidade IS NOT NULL
    AND valor_tabela IS NOT NULL
    AND valor_mensalidade < valor_tabela
  ) STORED;

-- Validações
ALTER TABLE asaas_customers_sync
  DROP CONSTRAINT IF EXISTS asaas_customers_sync_plano_check;
ALTER TABLE asaas_customers_sync
  ADD CONSTRAINT asaas_customers_sync_plano_check
  CHECK (plano IS NULL OR plano IN (
    'Mensal','Semestral','Semestral_avista','Anual','Anual_avista','Avulso'
  ));

ALTER TABLE asaas_customers_sync
  DROP CONSTRAINT IF EXISTS asaas_customers_sync_status_pagamento_check;
ALTER TABLE asaas_customers_sync
  ADD CONSTRAINT asaas_customers_sync_status_pagamento_check
  CHECK (status_pagamento IN ('Em dia','Pendente','Vencido'));


-- ─── 2. payments (cobranças) ────────────────────────────────────────────────
ALTER TABLE payments
  ADD COLUMN IF NOT EXISTS plano            TEXT,
  ADD COLUMN IF NOT EXISTS subscription_id  TEXT,
  ADD COLUMN IF NOT EXISTS installment_id   TEXT,
  ADD COLUMN IF NOT EXISTS parcela_numero   INTEGER,
  ADD COLUMN IF NOT EXISTS parcela_total    INTEGER,
  ADD COLUMN IF NOT EXISTS situacao_display TEXT,
  ADD COLUMN IF NOT EXISTS professor        TEXT,
  ADD COLUMN IF NOT EXISTS cupom            TEXT,
  ADD COLUMN IF NOT EXISTS tamanho_camiseta TEXT,
  ADD COLUMN IF NOT EXISTS ultimo_evento    TEXT,
  ADD COLUMN IF NOT EXISTS deleted          BOOLEAN DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS idx_payments_status       ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_due_date     ON payments(due_date);
CREATE INDEX IF NOT EXISTS idx_payments_customer     ON payments(customer_asaas_id);
CREATE INDEX IF NOT EXISTS idx_payments_subscription ON payments(subscription_id);


-- ─── 3. pace360_config ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS pace360_config (
  chave         TEXT PRIMARY KEY,
  valor         TEXT NOT NULL,
  descricao     TEXT,
  atualizado_em TIMESTAMPTZ DEFAULT now()
);

INSERT INTO pace360_config (chave, valor, descricao) VALUES
  ('preco_mensal',           '220',  'Preço tabela Mensal (R$/mês)'),
  ('preco_semestral',        '200',  'Preço tabela Semestral (R$/mês)'),
  ('preco_anual',            '180',  'Preço tabela Anual (R$/mês)'),
  ('preco_semestral_avista', '1200', 'Preço tabela Semestral à vista'),
  ('preco_anual_avista',     '2160', 'Preço tabela Anual à vista'),
  ('ultima_sync_asaas',      '',     'Timestamp da última sincronização')
ON CONFLICT (chave) DO NOTHING;

ALTER TABLE pace360_config ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS pace360_config_service_role ON pace360_config;
CREATE POLICY pace360_config_service_role ON pace360_config FOR ALL USING (true);
