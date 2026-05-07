-- ============================================================================
-- Phase 5 — Oyuncu Lobby Eklentileri
-- ----------------------------------------------------------------------------
-- 1) Aynı oyun oturumunda iki katılımcının aynı görünen adı kullanmasını engelle.
-- 2) join_game_session RPC'sini bu yeni kısıt ile uyumlu hale getir.
-- 3) Katılımcının kendi adını yeniden adlandırmasını sağlayan SECURITY DEFINER
--    RPC ekle (anon kullanıcılar için RLS'i baypas eder, ad benzersizliğini
--    DB tarafında doğrular).
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1) Unique constraint
-- ---------------------------------------------------------------------------

ALTER TABLE participants
  ADD CONSTRAINT participants_session_display_name_key
  UNIQUE (game_session_id, display_name);

-- ---------------------------------------------------------------------------
-- 2) join_game_session: aynı isim hatasını insancıl mesaja çevir
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.join_game_session(
  p_game_pin text,
  p_display_name text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_session    game_sessions%ROWTYPE;
  v_part       participants%ROWTYPE;
  v_clean_name text;
BEGIN
  IF p_game_pin IS NULL OR length(trim(p_game_pin)) = 0 THEN
    RAISE EXCEPTION 'PIN kodu gerekli' USING ERRCODE = 'P0001';
  END IF;

  v_clean_name := trim(coalesce(p_display_name, ''));
  IF length(v_clean_name) = 0 THEN
    RAISE EXCEPTION 'Görünen ad boş olamaz' USING ERRCODE = 'P0001';
  END IF;

  SELECT *
  INTO   v_session
  FROM   game_sessions
  WHERE  game_pin = trim(p_game_pin)
  LIMIT  1;

  IF v_session.id IS NULL THEN
    RAISE EXCEPTION 'Oyun bulunamadı' USING ERRCODE = 'P0002';
  END IF;

  IF v_session.status NOT IN ('waiting', 'in_progress') THEN
    RAISE EXCEPTION 'Oyun şu an katılıma açık değil' USING ERRCODE = 'P0003';
  END IF;

  BEGIN
    INSERT INTO participants (game_session_id, user_id, display_name, is_online, last_seen)
    VALUES (v_session.id, auth.uid(), v_clean_name, true, now())
    RETURNING * INTO v_part;
  EXCEPTION
    WHEN unique_violation THEN
      RAISE EXCEPTION 'Bu görünen ad bu oyunda zaten kullanılıyor' USING ERRCODE = 'P0004';
  END;

  RETURN jsonb_build_object(
    'participant',  to_jsonb(v_part),
    'game_session', to_jsonb(v_session)
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.join_game_session(text, text) TO anon, authenticated;

-- ---------------------------------------------------------------------------
-- 3) update_participant_name RPC
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.update_participant_name(
  p_participant_id uuid,
  p_display_name   text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_part       participants%ROWTYPE;
  v_clean_name text;
BEGIN
  v_clean_name := trim(coalesce(p_display_name, ''));
  IF length(v_clean_name) = 0 THEN
    RAISE EXCEPTION 'Görünen ad boş olamaz' USING ERRCODE = 'P0001';
  END IF;

  SELECT *
  INTO   v_part
  FROM   participants
  WHERE  id = p_participant_id
  LIMIT  1;

  IF v_part.id IS NULL THEN
    RAISE EXCEPTION 'Katılımcı bulunamadı' USING ERRCODE = 'P0002';
  END IF;

  -- Anonim katılımcılar (user_id NULL) sadece kendi participant id'lerini
  -- bildikleri için güncelleme yapabilir. Giriş yapmış kullanıcılar yalnızca
  -- kendi user_id'leri ile eşleşen kaydı güncelleyebilir.
  IF v_part.user_id IS NOT NULL AND v_part.user_id <> auth.uid() THEN
    RAISE EXCEPTION 'Bu katılımcıyı güncelleme yetkiniz yok' USING ERRCODE = 'P0003';
  END IF;

  IF v_part.display_name = v_clean_name THEN
    RETURN to_jsonb(v_part);
  END IF;

  BEGIN
    UPDATE participants
    SET    display_name = v_clean_name,
           last_seen    = now()
    WHERE  id = v_part.id
    RETURNING * INTO v_part;
  EXCEPTION
    WHEN unique_violation THEN
      RAISE EXCEPTION 'Bu görünen ad bu oyunda zaten kullanılıyor' USING ERRCODE = 'P0004';
  END;

  RETURN to_jsonb(v_part);
END;
$$;

GRANT EXECUTE ON FUNCTION public.update_participant_name(uuid, text) TO anon, authenticated;
