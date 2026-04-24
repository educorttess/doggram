-- ─────────────────────────────────────────────────────────────────────────────
-- 0005_engagement.sql
-- Sistema de engajamento: XP/Levels, Dog of Day, Conquistas, Desafios, Quiz
-- ─────────────────────────────────────────────────────────────────────────────


-- ── 1. Campos de engajamento em profiles ─────────────────────────────────────

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS xp            INT  NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS level         INT  NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS quiz_streak   INT  NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_quiz_date DATE;


-- ── 2. XP events (log imutável de cada ganho de XP) ─────────────────────────

CREATE TABLE IF NOT EXISTS xp_events (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  amount     INT         NOT NULL,
  reason     TEXT        NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS xp_events_profile_idx ON xp_events (profile_id);

ALTER TABLE xp_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profile can read own xp events"
  ON xp_events FOR SELECT
  USING (profile_id IN (SELECT id FROM profiles WHERE owner_id = auth.uid()));

CREATE POLICY "profile can insert own xp events"
  ON xp_events FOR INSERT
  WITH CHECK (profile_id IN (SELECT id FROM profiles WHERE owner_id = auth.uid()));


-- ── 3. Conquistas (achievements) ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS achievements (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  description TEXT NOT NULL,
  emoji       TEXT NOT NULL,
  xp_reward   INT  NOT NULL DEFAULT 0,
  category    TEXT NOT NULL CHECK (category IN ('social','post','level','quiz','challenge'))
);

-- Sem RLS: leitura pública (são definições estáticas)
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "achievements are public" ON achievements FOR SELECT USING (true);


CREATE TABLE IF NOT EXISTS profile_achievements (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id     UUID        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  achievement_id TEXT        NOT NULL REFERENCES achievements(id),
  earned_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (profile_id, achievement_id)
);

CREATE INDEX IF NOT EXISTS profile_achievements_profile_idx ON profile_achievements (profile_id);

ALTER TABLE profile_achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profile can read own achievements"
  ON profile_achievements FOR SELECT
  USING (profile_id IN (SELECT id FROM profiles WHERE owner_id = auth.uid()));

CREATE POLICY "profile can insert own achievements"
  ON profile_achievements FOR INSERT
  WITH CHECK (profile_id IN (SELECT id FROM profiles WHERE owner_id = auth.uid()));


-- ── 4. Desafios semanais ─────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS challenges (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title       TEXT NOT NULL,
  description TEXT NOT NULL,
  emoji       TEXT NOT NULL DEFAULT '📸',
  xp_reward   INT  NOT NULL DEFAULT 150,
  week_start  DATE NOT NULL,
  week_end    DATE NOT NULL,
  UNIQUE (week_start)
);

ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "challenges are public" ON challenges FOR SELECT USING (true);


CREATE TABLE IF NOT EXISTS challenge_entries (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id UUID        NOT NULL REFERENCES challenges(id) ON DELETE CASCADE,
  profile_id   UUID        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  post_id      UUID        REFERENCES posts(id) ON DELETE SET NULL,
  xp_awarded   BOOLEAN     NOT NULL DEFAULT FALSE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (challenge_id, profile_id)
);

CREATE INDEX IF NOT EXISTS challenge_entries_challenge_idx ON challenge_entries (challenge_id);
CREATE INDEX IF NOT EXISTS challenge_entries_profile_idx   ON challenge_entries (profile_id);

ALTER TABLE challenge_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "challenge entries are public to read"
  ON challenge_entries FOR SELECT USING (true);

CREATE POLICY "profile can insert own entry"
  ON challenge_entries FOR INSERT
  WITH CHECK (profile_id IN (SELECT id FROM profiles WHERE owner_id = auth.uid()));

CREATE POLICY "profile can update own entry"
  ON challenge_entries FOR UPDATE
  USING (profile_id IN (SELECT id FROM profiles WHERE owner_id = auth.uid()));


-- ── 5. Quiz de raças ─────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS quiz_attempts (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id  UUID        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  dog_profile_id UUID     REFERENCES profiles(id) ON DELETE SET NULL,
  correct_breed  TEXT     NOT NULL,
  chosen_breed   TEXT     NOT NULL,
  correct        BOOLEAN  NOT NULL,
  xp_awarded     INT      NOT NULL DEFAULT 0,
  attempted_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS quiz_attempts_profile_idx ON quiz_attempts (profile_id);
CREATE INDEX IF NOT EXISTS quiz_attempts_date_idx    ON quiz_attempts (profile_id, attempted_at);

ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profile can read own attempts"
  ON quiz_attempts FOR SELECT
  USING (profile_id IN (SELECT id FROM profiles WHERE owner_id = auth.uid()));

CREATE POLICY "profile can insert own attempts"
  ON quiz_attempts FOR INSERT
  WITH CHECK (profile_id IN (SELECT id FROM profiles WHERE owner_id = auth.uid()));


-- ── 6. RPC: award_xp (atômica, evita race conditions) ───────────────────────

CREATE OR REPLACE FUNCTION award_xp(
  p_profile_id UUID,
  p_amount     INT,
  p_reason     TEXT
)
RETURNS INT   -- retorna o novo total de XP
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_new_xp    INT;
  v_new_level INT;
BEGIN
  UPDATE profiles
     SET xp = xp + p_amount
   WHERE id = p_profile_id
  RETURNING xp INTO v_new_xp;

  -- Calcula nível baseado em XP total
  v_new_level := CASE
    WHEN v_new_xp >= 3000 THEN 5
    WHEN v_new_xp >= 1200 THEN 4
    WHEN v_new_xp >= 500  THEN 3
    WHEN v_new_xp >= 200  THEN 2
    ELSE 1
  END;

  UPDATE profiles SET level = v_new_level WHERE id = p_profile_id;

  INSERT INTO xp_events (profile_id, amount, reason)
  VALUES (p_profile_id, p_amount, p_reason);

  RETURN v_new_xp;
END;
$$;


-- ── 7. RPC: top_dogs_this_week ───────────────────────────────────────────────

CREATE OR REPLACE FUNCTION top_dogs_this_week(limit_count INT DEFAULT 10)
RETURNS TABLE (
  profile_id   UUID,
  dog_name     TEXT,
  username     TEXT,
  breed        TEXT,
  avatar_url   TEXT,
  is_verified  BOOLEAN,
  week_likes   BIGINT
)
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT
    p.id,
    p.dog_name,
    p.username,
    p.breed,
    p.avatar_url,
    p.is_verified,
    COUNT(l.id) AS week_likes
  FROM profiles p
  JOIN posts   po ON po.profile_id = p.id
  JOIN likes   l  ON l.post_id     = po.id
  WHERE l.created_at >= NOW() - INTERVAL '7 days'
  GROUP BY p.id, p.dog_name, p.username, p.breed, p.avatar_url, p.is_verified
  ORDER BY week_likes DESC
  LIMIT limit_count;
$$;


-- ── 8. RPC: dog_of_today ─────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION dog_of_today()
RETURNS TABLE (
  profile_id   UUID,
  dog_name     TEXT,
  username     TEXT,
  breed        TEXT,
  avatar_url   TEXT,
  is_verified  BOOLEAN,
  today_likes  BIGINT
)
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT
    p.id,
    p.dog_name,
    p.username,
    p.breed,
    p.avatar_url,
    p.is_verified,
    COUNT(l.id) AS today_likes
  FROM profiles p
  JOIN posts   po ON po.profile_id = p.id
  JOIN likes   l  ON l.post_id     = po.id
  WHERE l.created_at >= CURRENT_DATE
    AND l.created_at <  CURRENT_DATE + INTERVAL '1 day'
  GROUP BY p.id, p.dog_name, p.username, p.breed, p.avatar_url, p.is_verified
  ORDER BY today_likes DESC
  LIMIT 1;
$$;


-- ── 9. Seed: conquistas ───────────────────────────────────────────────────────

INSERT INTO achievements (id, name, description, emoji, xp_reward, category) VALUES
  ('primeiro_au_au',   'Primeiro Au-au',        'Curtiu um post pela primeira vez',           '❤️',  10,  'social'),
  ('social_butterfly', 'Farejador Social',       'Farejou 10 dogs no PawMatch',                '🦋',  50,  'social'),
  ('paw_match_star',   'Primeiro PawMatch',      'Fez o primeiro PawMatch!',                   '🐾',  100, 'social'),
  ('dog_of_day',       'Dog do Dia',             'Foi o dog mais curtido do dia',               '👑',  200, 'social'),
  ('foto_estreia',     'Estreia nas Redes',      'Publicou a primeira foto',                    '📸',  50,  'post'),
  ('fotografo',        'Fotogênico',             'Publicou 10 fotos',                           '📷',  100, 'post'),
  ('influencer',       'Influencer Canino',      'Publicou 25 fotos',                           '🌟',  250, 'post'),
  ('level_jovem',      'Jovem Promissor',        'Atingiu o nível Jovem',                       '🌱',  0,   'level'),
  ('level_adulto',     'Dog Adulto',             'Atingiu o nível Adulto',                      '🦴',  0,   'level'),
  ('level_alpha',      'Dog Alpha',              'Atingiu o nível Alpha',                       '👑',  0,   'level'),
  ('level_lenda',      'Lenda Canina',           'Tornou-se uma Lenda — o ápice!',              '🏆',  500, 'level'),
  ('quiz_iniciante',   'Farejador de Raças',     'Acertou o primeiro quiz de raças',            '🧠',  10,  'quiz'),
  ('quiz_expert',      'Especialista em Raças',  'Acertou 10 quizzes',                          '🎓',  100, 'quiz'),
  ('streak_3',         'Em Chamas!',             'Manteve 3 dias de streak no quiz',            '🔥',  50,  'quiz'),
  ('streak_7',         'Imparável!',             'Manteve 7 dias de streak no quiz',            '💥',  150, 'quiz'),
  ('desafio_mestre',   'Mestre dos Desafios',    'Completou 5 desafios semanais',               '🏅',  200, 'challenge')
ON CONFLICT (id) DO NOTHING;


-- ── 10. Seed: desafio da semana atual ────────────────────────────────────────
-- Ajuste week_start/week_end conforme a semana corrente ao aplicar a migration.

INSERT INTO challenges (title, description, emoji, xp_reward, week_start, week_end)
VALUES (
  'Dog Dormindo',
  'Poste uma foto do seu dog dormindo da forma mais fofa ou engraçada possível!',
  '😴',
  150,
  date_trunc('week', CURRENT_DATE)::DATE,
  (date_trunc('week', CURRENT_DATE) + INTERVAL '6 days')::DATE
)
ON CONFLICT (week_start) DO NOTHING;
