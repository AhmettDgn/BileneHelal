-- ============================================================================
-- Oyun akisini merkezi faz-zaman modeli ile yonetir.
-- Aktif soru id'si tek kaynak olur; host ve oyuncu ayni state makinesini izler.
-- ============================================================================

DROP FUNCTION IF EXISTS public.get_game_session_sync(uuid, uuid);
DROP FUNCTION IF EXISTS public.sync_game_phase(uuid, uuid);
DROP FUNCTION IF EXISTS public.get_playable_game_state(uuid, uuid);
DROP FUNCTION IF EXISTS public.submit_player_answer(uuid, uuid, uuid, integer, integer);
DROP FUNCTION IF EXISTS public.get_leaderboard_entries(uuid, uuid, integer);

ALTER TABLE game_sessions
  ADD COLUMN IF NOT EXISTS phase_started_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS phase_ends_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS current_phase text,
  ADD COLUMN IF NOT EXISTS active_question_id uuid;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'game_sessions_current_phase_check'
  ) THEN
    ALTER TABLE game_sessions
      ADD CONSTRAINT game_sessions_current_phase_check
      CHECK (current_phase IN ('question', 'intermission'));
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'game_sessions_active_question_id_fkey'
  ) THEN
    ALTER TABLE game_sessions
      ADD CONSTRAINT game_sessions_active_question_id_fkey
      FOREIGN KEY (active_question_id)
      REFERENCES questions(id)
      ON DELETE SET NULL;
  END IF;
END;
$$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'game_sessions'
      AND column_name = 'question_started_at'
  ) THEN
    EXECUTE $sql$
      UPDATE game_sessions gs
      SET phase_started_at = COALESCE(gs.phase_started_at, gs.question_started_at),
          current_phase = COALESCE(gs.current_phase, 'question'),
          active_question_id = COALESCE(
            gs.active_question_id,
            (
              SELECT q.id
              FROM questions q
              WHERE q.quiz_id = gs.quiz_id
              ORDER BY q."order" ASC, q.created_at ASC
              OFFSET GREATEST(gs.current_question_index, 0)
              LIMIT 1
            )
          )
    $sql$;

    EXECUTE 'ALTER TABLE game_sessions DROP COLUMN IF EXISTS question_started_at';
  ELSE
    UPDATE game_sessions gs
    SET phase_started_at = COALESCE(gs.phase_started_at, gs.started_at),
        current_phase = COALESCE(gs.current_phase, 'question'),
        active_question_id = COALESCE(
          gs.active_question_id,
          (
            SELECT q.id
            FROM questions q
            WHERE q.quiz_id = gs.quiz_id
            ORDER BY q."order" ASC, q.created_at ASC
            OFFSET GREATEST(gs.current_question_index, 0)
            LIMIT 1
          )
        );
  END IF;
END;
$$;

ALTER TABLE game_sessions
  ALTER COLUMN current_phase SET DEFAULT 'question';

UPDATE game_sessions
SET current_phase = COALESCE(current_phase, 'question');

ALTER TABLE game_sessions
  ALTER COLUMN current_phase SET NOT NULL;

CREATE OR REPLACE FUNCTION public.sync_game_phase(
  p_game_session_id uuid,
  p_participant_id uuid DEFAULT NULL
)
RETURNS TABLE (
  current_question_index integer,
  game_status text,
  current_phase text,
  active_question_id uuid,
  phase_started_at timestamptz,
  phase_ends_at timestamptz,
  total_questions integer,
  has_next_question boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_session game_sessions%ROWTYPE;
  v_question_count integer;
BEGIN
  SELECT *
  INTO v_session
  FROM game_sessions
  WHERE id = p_game_session_id
  LIMIT 1;

  IF v_session.id IS NULL THEN
    RAISE EXCEPTION 'Oyun oturumu bulunamadi' USING ERRCODE = 'P0002';
  END IF;

  IF auth.uid() <> v_session.host_id THEN
    IF p_participant_id IS NULL THEN
      RAISE EXCEPTION 'Bu oturumu goruntuleme yetkiniz yok' USING ERRCODE = 'P0003';
    END IF;

    IF NOT EXISTS (
      SELECT 1
      FROM participants
      WHERE id = p_participant_id
        AND game_session_id = v_session.id
    ) THEN
      RAISE EXCEPTION 'Bu oturumu goruntuleme yetkiniz yok' USING ERRCODE = 'P0003';
    END IF;
  END IF;

  SELECT COUNT(*)
  INTO v_question_count
  FROM questions
  WHERE quiz_id = v_session.quiz_id;

  IF v_session.active_question_id IS NULL AND v_question_count > 0 THEN
    UPDATE game_sessions
    SET active_question_id = (
      SELECT q.id
      FROM questions q
      WHERE q.quiz_id = v_session.quiz_id
      ORDER BY q."order" ASC, q.created_at ASC
      OFFSET GREATEST(v_session.current_question_index, 0)
      LIMIT 1
    )
    WHERE id = v_session.id
    RETURNING * INTO v_session;
  END IF;

  IF v_session.status = 'in_progress'
    AND v_session.current_phase = 'question'
    AND v_session.phase_ends_at IS NOT NULL
    AND now() >= v_session.phase_ends_at THEN
    UPDATE game_sessions
    SET current_phase = 'intermission',
        phase_started_at = now(),
        phase_ends_at = NULL
    WHERE id = v_session.id
    RETURNING * INTO v_session;
  END IF;

  RETURN QUERY
  SELECT
    v_session.current_question_index,
    v_session.status,
    v_session.current_phase,
    v_session.active_question_id,
    v_session.phase_started_at,
    v_session.phase_ends_at,
    v_question_count,
    (v_session.current_question_index + 1) < v_question_count;
END;
$$;

GRANT EXECUTE ON FUNCTION public.sync_game_phase(uuid, uuid) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.get_game_session_sync(
  p_game_session_id uuid,
  p_participant_id uuid DEFAULT NULL
)
RETURNS TABLE (
  current_question_index integer,
  game_status text,
  current_phase text,
  active_question_id uuid,
  phase_started_at timestamptz,
  phase_ends_at timestamptz,
  total_questions integer,
  has_next_question boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM public.sync_game_phase(p_game_session_id, p_participant_id);
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_game_session_sync(uuid, uuid) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.get_playable_game_state(
  p_game_session_id uuid,
  p_participant_id uuid DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_session game_sessions%ROWTYPE;
  v_quiz quizzes%ROWTYPE;
BEGIN
  PERFORM *
  FROM public.sync_game_phase(p_game_session_id, p_participant_id);

  SELECT *
  INTO v_session
  FROM game_sessions
  WHERE id = p_game_session_id
  LIMIT 1;

  IF v_session.id IS NULL THEN
    RAISE EXCEPTION 'Oyun oturumu bulunamadi' USING ERRCODE = 'P0002';
  END IF;

  IF auth.uid() <> v_session.host_id THEN
    IF p_participant_id IS NULL THEN
      RAISE EXCEPTION 'Bu oyunu goruntuleme yetkiniz yok' USING ERRCODE = 'P0003';
    END IF;

    IF NOT EXISTS (
      SELECT 1
      FROM participants
      WHERE id = p_participant_id
        AND game_session_id = v_session.id
    ) THEN
      RAISE EXCEPTION 'Bu oyunu goruntuleme yetkiniz yok' USING ERRCODE = 'P0003';
    END IF;
  END IF;

  SELECT *
  INTO v_quiz
  FROM quizzes
  WHERE id = v_session.quiz_id
  LIMIT 1;

  IF v_quiz.id IS NULL THEN
    RAISE EXCEPTION 'Quiz bilgisi alinamadi' USING ERRCODE = 'P0002';
  END IF;

  RETURN jsonb_build_object(
    'quiz_title', v_quiz.title,
    'active_question_id', v_session.active_question_id,
    'questions',
    COALESCE((
      SELECT jsonb_agg(
        jsonb_build_object(
          'id', questions.id,
          'text', questions.text,
          'options', questions.options,
          'points', questions.points,
          'time_limit_seconds', questions.time_limit_seconds
        )
        ORDER BY questions."order", questions.created_at
      )
      FROM questions
      WHERE questions.quiz_id = v_session.quiz_id
    ), '[]'::jsonb),
    'participant_answers',
    COALESCE((
      SELECT jsonb_agg(
        jsonb_build_object(
          'question_id', answers.question_id,
          'selected_option_index', answers.selected_option_index,
          'points_earned', answers.points_earned
        )
      )
      FROM answers
      WHERE answers.game_session_id = v_session.id
        AND answers.participant_id = p_participant_id
    ), '[]'::jsonb)
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_playable_game_state(uuid, uuid) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.submit_player_answer(
  p_game_session_id uuid,
  p_participant_id uuid,
  p_question_id uuid,
  p_selected_option_index integer,
  p_response_time_ms integer
)
RETURNS TABLE (
  accepted boolean,
  already_answered boolean,
  locked_option_index integer,
  points_earned integer
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_session game_sessions%ROWTYPE;
  v_question questions%ROWTYPE;
  v_answer answers%ROWTYPE;
  v_is_correct boolean;
  v_points integer;
BEGIN
  SELECT *
  INTO v_session
  FROM game_sessions
  WHERE id = p_game_session_id
  LIMIT 1;

  IF v_session.id IS NULL THEN
    RAISE EXCEPTION 'Oyun oturumu bulunamadi' USING ERRCODE = 'P0002';
  END IF;

  IF auth.uid() <> v_session.host_id THEN
    IF NOT EXISTS (
      SELECT 1
      FROM participants
      WHERE id = p_participant_id
        AND game_session_id = p_game_session_id
    ) THEN
      RAISE EXCEPTION 'Katilimci dogrulanamadi' USING ERRCODE = 'P0003';
    END IF;
  END IF;

  PERFORM *
  FROM public.sync_game_phase(p_game_session_id, p_participant_id);

  SELECT *
  INTO v_session
  FROM game_sessions
  WHERE id = p_game_session_id
  LIMIT 1;

  IF v_session.status <> 'in_progress' OR v_session.current_phase <> 'question' THEN
    RAISE EXCEPTION 'Bu soru icin cevap su an kabul edilmiyor' USING ERRCODE = 'P0004';
  END IF;

  IF v_session.phase_ends_at IS NOT NULL AND now() >= v_session.phase_ends_at THEN
    RAISE EXCEPTION 'Bu sorunun suresi doldu' USING ERRCODE = 'P0004';
  END IF;

  IF v_session.active_question_id IS NULL OR v_session.active_question_id <> p_question_id THEN
    RAISE EXCEPTION 'Aktif olmayan soruya cevap gonderilemez' USING ERRCODE = 'P0004';
  END IF;

  SELECT *
  INTO v_question
  FROM questions
  WHERE id = v_session.active_question_id
  LIMIT 1;

  IF v_question.id IS NULL THEN
    RAISE EXCEPTION 'Aktif soru dogrulanamadi' USING ERRCODE = 'P0004';
  END IF;

  SELECT *
  INTO v_answer
  FROM answers
  WHERE participant_id = p_participant_id
    AND question_id = p_question_id
  LIMIT 1;

  IF v_answer.id IS NOT NULL THEN
    RETURN QUERY
    SELECT
      v_answer.selected_option_index = p_selected_option_index,
      true,
      v_answer.selected_option_index,
      v_answer.points_earned;
    RETURN;
  END IF;

  v_is_correct := p_selected_option_index = v_question.correct_option_index;
  v_points := CASE WHEN v_is_correct THEN v_question.points ELSE 0 END;

  INSERT INTO answers (
    game_session_id,
    participant_id,
    question_id,
    selected_option_index,
    is_correct,
    response_time_ms,
    points_earned
  )
  VALUES (
    p_game_session_id,
    p_participant_id,
    p_question_id,
    p_selected_option_index,
    v_is_correct,
    GREATEST(p_response_time_ms, 0),
    v_points
  )
  ON CONFLICT (participant_id, question_id) DO NOTHING
  RETURNING * INTO v_answer;

  IF v_answer.id IS NULL THEN
    SELECT *
    INTO v_answer
    FROM answers
    WHERE participant_id = p_participant_id
      AND question_id = p_question_id
    LIMIT 1;

    RETURN QUERY
    SELECT
      v_answer.selected_option_index = p_selected_option_index,
      true,
      v_answer.selected_option_index,
      v_answer.points_earned;
    RETURN;
  END IF;

  INSERT INTO scores (
    game_session_id,
    participant_id,
    total_score,
    correct_answers,
    total_questions_answered,
    updated_at
  )
  VALUES (
    p_game_session_id,
    p_participant_id,
    v_points,
    CASE WHEN v_is_correct THEN 1 ELSE 0 END,
    1,
    now()
  )
  ON CONFLICT (game_session_id, participant_id)
  DO UPDATE SET
    total_score = scores.total_score + EXCLUDED.total_score,
    correct_answers = scores.correct_answers + EXCLUDED.correct_answers,
    total_questions_answered = scores.total_questions_answered + 1,
    updated_at = now();

  RETURN QUERY SELECT true, false, p_selected_option_index, v_points;
END;
$$;

GRANT EXECUTE ON FUNCTION public.submit_player_answer(uuid, uuid, uuid, integer, integer) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.get_leaderboard_entries(
  p_game_session_id uuid,
  p_participant_id uuid DEFAULT NULL,
  p_limit integer DEFAULT 5
)
RETURNS TABLE (
  participant_id uuid,
  display_name text,
  total_score integer,
  correct_answers integer
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_session game_sessions%ROWTYPE;
  v_safe_limit integer;
BEGIN
  SELECT *
  INTO v_session
  FROM game_sessions
  WHERE id = p_game_session_id
  LIMIT 1;

  IF v_session.id IS NULL THEN
    RAISE EXCEPTION 'Oyun oturumu bulunamadi' USING ERRCODE = 'P0002';
  END IF;

  IF auth.uid() <> v_session.host_id THEN
    IF p_participant_id IS NULL THEN
      RAISE EXCEPTION 'Bu skorlari goruntuleme yetkiniz yok' USING ERRCODE = 'P0003';
    END IF;

    IF NOT EXISTS (
      SELECT 1
      FROM participants
      WHERE id = p_participant_id
        AND game_session_id = v_session.id
    ) THEN
      RAISE EXCEPTION 'Bu skorlari goruntuleme yetkiniz yok' USING ERRCODE = 'P0003';
    END IF;
  END IF;

  v_safe_limit := GREATEST(COALESCE(p_limit, 5), 1);

  RETURN QUERY
  SELECT
    scores.participant_id,
    participants.display_name,
    scores.total_score,
    scores.correct_answers
  FROM scores
  INNER JOIN participants ON participants.id = scores.participant_id
  WHERE scores.game_session_id = p_game_session_id
  ORDER BY scores.total_score DESC, scores.correct_answers DESC, participants.display_name ASC
  LIMIT v_safe_limit;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_leaderboard_entries(uuid, uuid, integer) TO anon, authenticated;
