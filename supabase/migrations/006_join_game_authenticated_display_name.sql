-- ============================================================================
-- Authenticated oyuncular PIN ile katilirken gorunen adin auth profilinden
-- otomatik alinmasini saglar. Anon akista mevcut zorunlu ad kuralini korur.
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
  v_session    game_sessions%ROWTYPE;
  v_part       participants%ROWTYPE;
  v_clean_name text;
BEGIN
  IF p_game_pin IS NULL OR length(trim(p_game_pin)) = 0 THEN
    RAISE EXCEPTION 'PIN kodu gerekli' USING ERRCODE = 'P0001';
  END IF;

  v_clean_name := nullif(trim(coalesce(p_display_name, '')), '');

  IF auth.uid() IS NOT NULL AND v_clean_name IS NULL THEN
    SELECT coalesce(
      nullif(trim(raw_user_meta_data ->> 'display_name'), ''),
      nullif(trim(email), '')
    )
    INTO v_clean_name
    FROM auth.users
    WHERE id = auth.uid()
    LIMIT 1;
  END IF;

  IF v_clean_name IS NULL THEN
    RAISE EXCEPTION 'Gorunen ad bos olamaz' USING ERRCODE = 'P0001';
  END IF;

  SELECT *
  INTO   v_session
  FROM   game_sessions
  WHERE  game_pin = trim(p_game_pin)
  LIMIT  1;

  IF v_session.id IS NULL THEN
    RAISE EXCEPTION 'Oyun bulunamadi' USING ERRCODE = 'P0002';
  END IF;

  IF v_session.status NOT IN ('waiting', 'in_progress') THEN
    RAISE EXCEPTION 'Oyun su an katilima acik degil' USING ERRCODE = 'P0003';
  END IF;

  BEGIN
    INSERT INTO participants (game_session_id, user_id, display_name, is_online, last_seen)
    VALUES (v_session.id, auth.uid(), v_clean_name, true, now())
    RETURNING * INTO v_part;
  EXCEPTION
    WHEN unique_violation THEN
      RAISE EXCEPTION 'Bu gorunen ad bu oyunda zaten kullaniliyor' USING ERRCODE = 'P0004';
  END;

  RETURN jsonb_build_object(
    'participant',  to_jsonb(v_part),
    'game_session', to_jsonb(v_session)
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.join_game_session(text, text) TO anon, authenticated;
