-- ============================================================================
-- join_game_session RPC
-- ----------------------------------------------------------------------------
-- Anon kullanıcılar PIN ile bir game_session'a katılırken participants tablosuna
-- doğrudan INSERT atıyordu. RLS politikaları bunu reddediyordu (anon rolünde
-- INSERT WITH CHECK koşulu istikrarsız davrandı). Bu RPC, akışı SECURITY
-- DEFINER bir fonksiyon arkasına alır:
--   * RLS bypass edilir, fonksiyon kendi validasyonlarını yapar
--   * PIN, oyun durumu ve görünen ad sunucu tarafında doğrulanır
--   * Anon ve giriş yapmış kullanıcılar aynı yolu kullanır (auth.uid() ile)
--   * Yanıt JSON: { participant, game_session }
-- ============================================================================

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
  v_session   game_sessions%ROWTYPE;
  v_part      participants%ROWTYPE;
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

  INSERT INTO participants (game_session_id, user_id, display_name, is_online, last_seen)
  VALUES (v_session.id, auth.uid(), v_clean_name, true, now())
  RETURNING * INTO v_part;

  RETURN jsonb_build_object(
    'participant',  to_jsonb(v_part),
    'game_session', to_jsonb(v_session)
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.join_game_session(text, text) TO anon, authenticated;
