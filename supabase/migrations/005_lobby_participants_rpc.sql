-- ============================================================================
-- Phase 6 - Lobby participants read RPC
-- ----------------------------------------------------------------------------
-- Host ve anonim oyuncular ayni katilimci snapshot'ini gorebilsin diye
-- participants okumasini kontrollu bir SECURITY DEFINER RPC arkasina alir.
-- waiting/in_progress oturumlari okunabilir, completed oturumlar host ile sinirli
-- kalir.
-- ============================================================================

CREATE OR REPLACE FUNCTION public.get_lobby_participants(
  p_game_session_id uuid
)
RETURNS SETOF participants
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
DECLARE
  v_session game_sessions%ROWTYPE;
BEGIN
  SELECT *
  INTO v_session
  FROM game_sessions
  WHERE id = p_game_session_id
  LIMIT 1;

  IF v_session.id IS NULL THEN
    RAISE EXCEPTION 'Oyun oturumu bulunamadi' USING ERRCODE = 'P0002';
  END IF;

  IF v_session.status NOT IN ('waiting', 'in_progress')
     AND v_session.host_id <> auth.uid() THEN
    RAISE EXCEPTION 'Katilimci listesine erisim yok' USING ERRCODE = 'P0003';
  END IF;

  RETURN QUERY
  SELECT participants.*
  FROM participants
  WHERE participants.game_session_id = v_session.id
  ORDER BY participants.is_online DESC, participants.created_at ASC;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_lobby_participants(uuid) TO anon, authenticated;
