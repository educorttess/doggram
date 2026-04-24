-- ─────────────────────────────────────────────────────────────────────────────
-- 0004_pawmatch.sql
-- PawMatch — sistema de descoberta mútua entre perfis de cachorros
-- ─────────────────────────────────────────────────────────────────────────────

-- ── 1. paw_swipes ────────────────────────────────────────────────────────────
-- Registra cada decisão: "farejar" (like) ou "pular" (skip).
-- A constraint UNIQUE(swiper_id, swiped_id) impede swipes duplicados.

CREATE TABLE IF NOT EXISTS paw_swipes (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  swiper_id  UUID        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  swiped_id  UUID        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  direction  TEXT        NOT NULL CHECK (direction IN ('like', 'skip')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (swiper_id, swiped_id)
);

CREATE INDEX IF NOT EXISTS paw_swipes_swiper_idx ON paw_swipes (swiper_id);
CREATE INDEX IF NOT EXISTS paw_swipes_swiped_idx ON paw_swipes (swiped_id);

ALTER TABLE paw_swipes ENABLE ROW LEVEL SECURITY;

-- Cada perfil só pode inserir swipes onde ele é o swiper
CREATE POLICY "swiper can insert own swipes"
  ON paw_swipes
  FOR INSERT
  WITH CHECK (
    swiper_id IN (SELECT id FROM profiles WHERE owner_id = auth.uid())
  );

-- Cada perfil só pode ler os swipes que ele deu
-- (necessário para checar se o outro dog já farejou de volta)
CREATE POLICY "swiper can read own swipes"
  ON paw_swipes
  FOR SELECT
  USING (
    swiper_id IN (SELECT id FROM profiles WHERE owner_id = auth.uid())
  );

-- Permite ler swipes RECEBIDOS para detectar match mútuo no lado do servidor
-- (o app precisa verificar se target.swiper_id == nosso profile)
CREATE POLICY "swiped can read swipes received"
  ON paw_swipes
  FOR SELECT
  USING (
    swiped_id IN (SELECT id FROM profiles WHERE owner_id = auth.uid())
  );


-- ── 2. paw_matches ───────────────────────────────────────────────────────────
-- Criado quando dois dogs se "farejam" mutuamente.
-- profile_a_id < profile_b_id (ordem lexicográfica de UUID) garante que
-- a constraint UNIQUE nunca gere duplicatas independente da ordem de inserção.

CREATE TABLE IF NOT EXISTS paw_matches (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_a_id  UUID        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  profile_b_id  UUID        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (profile_a_id, profile_b_id),
  -- Garante a invariante de ordenação a nível de banco
  CONSTRAINT paw_matches_ordered CHECK (profile_a_id < profile_b_id)
);

CREATE INDEX IF NOT EXISTS paw_matches_a_idx ON paw_matches (profile_a_id);
CREATE INDEX IF NOT EXISTS paw_matches_b_idx ON paw_matches (profile_b_id);

ALTER TABLE paw_matches ENABLE ROW LEVEL SECURITY;

-- Qualquer um dos dois perfis do match pode ler o registro
CREATE POLICY "matched profiles can read their matches"
  ON paw_matches
  FOR SELECT
  USING (
    profile_a_id IN (SELECT id FROM profiles WHERE owner_id = auth.uid())
    OR
    profile_b_id IN (SELECT id FROM profiles WHERE owner_id = auth.uid())
  );

-- Qualquer um dos dois perfis pode criar o match
-- (o app insere com profile_a < profile_b; o CHECK acima valida)
CREATE POLICY "matched profiles can insert matches"
  ON paw_matches
  FOR INSERT
  WITH CHECK (
    profile_a_id IN (SELECT id FROM profiles WHERE owner_id = auth.uid())
    OR
    profile_b_id IN (SELECT id FROM profiles WHERE owner_id = auth.uid())
  );

-- Qualquer um dos dois perfis pode desfazer o match
CREATE POLICY "matched profiles can delete their matches"
  ON paw_matches
  FOR DELETE
  USING (
    profile_a_id IN (SELECT id FROM profiles WHERE owner_id = auth.uid())
    OR
    profile_b_id IN (SELECT id FROM profiles WHERE owner_id = auth.uid())
  );
