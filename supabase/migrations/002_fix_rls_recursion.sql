-- ============================================================================
-- Fix: RLS infinite recursion (Postgres 42P17)
-- ----------------------------------------------------------------------------
-- 001 migrasyonundaki bazı policy'ler birbirine çapraz başvuruyordu:
--   * game_sessions policy -> participants tablosunu okuyor
--   * participants policy  -> game_sessions tablosunu okuyor
-- İkisi de RLS açık olduğu için sonsuz döngüye giriyordu.
--
-- Çözüm: cross-reference içeren kontrolleri SECURITY DEFINER fonksiyonlar
-- arkasına alıyoruz. SECURITY DEFINER fonksiyon RLS'i bypass eder, recursion
-- kırılır. Policy'ler aynı semantik ile yeniden yazılıyor.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1) Yardımcı fonksiyonlar
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.is_host_of_session(session_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM game_sessions
    WHERE id = session_id
      AND host_id = auth.uid()
  );
$$;

CREATE OR REPLACE FUNCTION public.is_participant_of_session(session_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM participants
    WHERE game_session_id = session_id
      AND user_id = auth.uid()
  );
$$;

-- ---------------------------------------------------------------------------
-- 2) Eski policy'leri kaldır
-- ---------------------------------------------------------------------------

DROP POLICY IF EXISTS "Game Sessions: Host can manage"        ON game_sessions;
DROP POLICY IF EXISTS "Game Sessions: Participants can read"  ON game_sessions;

DROP POLICY IF EXISTS "Participants: User can read own"       ON participants;
DROP POLICY IF EXISTS "Participants: Can insert self"         ON participants;
DROP POLICY IF EXISTS "Participants: User can update own"     ON participants;

DROP POLICY IF EXISTS "Answers: User can insert own"          ON answers;
DROP POLICY IF EXISTS "Answers: Host can read own game"       ON answers;

DROP POLICY IF EXISTS "Scores: Readable by participants"      ON scores;
DROP POLICY IF EXISTS "Scores: System can upsert"             ON scores;
DROP POLICY IF EXISTS "Scores: System can update"             ON scores;

-- ---------------------------------------------------------------------------
-- 3) Game Sessions
-- ---------------------------------------------------------------------------

CREATE POLICY "Game Sessions: Host can manage" ON game_sessions
  FOR ALL
  USING (auth.uid() = host_id)
  WITH CHECK (auth.uid() = host_id);

-- Lobby'ye katılmak isteyen oyuncular PIN ile session'ı bulabilmeli.
-- Kimliği doğrulanmış kullanıcılar 'waiting' veya 'in_progress' oturumları
-- okuyabilsin; tamamlananlar yalnızca host ve katılımcılarda kalır.
CREATE POLICY "Game Sessions: Active sessions readable" ON game_sessions
  FOR SELECT
  USING (
    status IN ('waiting', 'in_progress')
    OR auth.uid() = host_id
    OR public.is_participant_of_session(id)
  );

-- ---------------------------------------------------------------------------
-- 4) Participants
-- ---------------------------------------------------------------------------

CREATE POLICY "Participants: Read own or host" ON participants
  FOR SELECT
  USING (
    auth.uid() = user_id
    OR public.is_host_of_session(game_session_id)
  );

CREATE POLICY "Participants: Insert self" ON participants
  FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    OR user_id IS NULL
  );

CREATE POLICY "Participants: Update own" ON participants
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- 5) Answers
-- ---------------------------------------------------------------------------

CREATE POLICY "Answers: Insert own" ON answers
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM participants
      WHERE participants.id = answers.participant_id
        AND (participants.user_id = auth.uid() OR participants.user_id IS NULL)
    )
  );

CREATE POLICY "Answers: Host can read own game" ON answers
  FOR SELECT
  USING (public.is_host_of_session(game_session_id));

-- ---------------------------------------------------------------------------
-- 6) Scores
-- ---------------------------------------------------------------------------

CREATE POLICY "Scores: Readable by host or participant" ON scores
  FOR SELECT
  USING (
    public.is_host_of_session(game_session_id)
    OR EXISTS (
      SELECT 1 FROM participants
      WHERE participants.id = scores.participant_id
        AND (participants.user_id = auth.uid() OR participants.user_id IS NULL)
    )
  );

CREATE POLICY "Scores: System can upsert" ON scores
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Scores: System can update" ON scores
  FOR UPDATE
  USING (true);
