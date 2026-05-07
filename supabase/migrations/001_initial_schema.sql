-- ============================================================================
-- BileneHalal — Başlangıç Şeması
-- Quizzes, Questions, Game Sessions, Participants, Answers, Scores
-- ============================================================================

-- Quizzes Tablosu
CREATE TABLE IF NOT EXISTS quizzes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  is_published BOOLEAN DEFAULT false,
  duration_seconds INTEGER,
  UNIQUE (id)
);

CREATE INDEX idx_quizzes_owner_id ON quizzes(owner_id);

-- Questions Tablosu
CREATE TABLE IF NOT EXISTS questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  "order" INTEGER NOT NULL,
  text TEXT NOT NULL,
  options TEXT[] NOT NULL,
  correct_option_index INTEGER NOT NULL,
  time_limit_seconds INTEGER DEFAULT 30,
  points INTEGER DEFAULT 10,
  UNIQUE (id),
  UNIQUE (quiz_id, "order")
);

CREATE INDEX idx_questions_quiz_id ON questions(quiz_id);

-- Game Sessions Tablosu
CREATE TABLE IF NOT EXISTS game_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  host_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  game_pin TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL CHECK (status IN ('waiting', 'in_progress', 'completed')),
  current_question_index INTEGER DEFAULT 0,
  started_at TIMESTAMP WITH TIME ZONE,
  ended_at TIMESTAMP WITH TIME ZONE,
  total_questions INTEGER NOT NULL,
  UNIQUE (id)
);

CREATE INDEX idx_game_sessions_quiz_id ON game_sessions(quiz_id);
CREATE INDEX idx_game_sessions_host_id ON game_sessions(host_id);
CREATE INDEX idx_game_sessions_game_pin ON game_sessions(game_pin);
CREATE INDEX idx_game_sessions_status ON game_sessions(status);

-- Participants Tablosu
CREATE TABLE IF NOT EXISTS participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  game_session_id UUID NOT NULL REFERENCES game_sessions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  display_name TEXT NOT NULL,
  is_online BOOLEAN DEFAULT true,
  last_seen TIMESTAMP WITH TIME ZONE,
  UNIQUE (id)
);

CREATE INDEX idx_participants_game_session_id ON participants(game_session_id);
CREATE INDEX idx_participants_user_id ON participants(user_id);

-- Answers Tablosu
CREATE TABLE IF NOT EXISTS answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  game_session_id UUID NOT NULL REFERENCES game_sessions(id) ON DELETE CASCADE,
  participant_id UUID NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  selected_option_index INTEGER NOT NULL,
  is_correct BOOLEAN DEFAULT false,
  response_time_ms INTEGER NOT NULL,
  points_earned INTEGER DEFAULT 0,
  UNIQUE (id),
  UNIQUE (participant_id, question_id)
);

CREATE INDEX idx_answers_game_session_id ON answers(game_session_id);
CREATE INDEX idx_answers_participant_id ON answers(participant_id);
CREATE INDEX idx_answers_question_id ON answers(question_id);

-- Scores Tablosu (Lider Tahtası)
CREATE TABLE IF NOT EXISTS scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  game_session_id UUID NOT NULL REFERENCES game_sessions(id) ON DELETE CASCADE,
  participant_id UUID NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
  total_score INTEGER DEFAULT 0,
  correct_answers INTEGER DEFAULT 0,
  total_questions_answered INTEGER DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE (id),
  UNIQUE (game_session_id, participant_id)
);

CREATE INDEX idx_scores_game_session_id ON scores(game_session_id);
CREATE INDEX idx_scores_participant_id ON scores(participant_id);
CREATE INDEX idx_scores_total_score ON scores(total_score DESC);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) Politikaları
-- ============================================================================

-- Quizzes RLS
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Quizzes: Owner can CRUD" ON quizzes
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Quizzes: Public quizzes readable" ON quizzes
  FOR SELECT USING (is_published = true);

-- Questions RLS
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Questions: Readable by all (quiz check)" ON questions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM quizzes
      WHERE quizzes.id = questions.quiz_id
        AND (is_published = true OR auth.uid() = owner_id)
    )
  );

CREATE POLICY "Questions: Owner can CRUD" ON questions
  USING (
    EXISTS (
      SELECT 1 FROM quizzes
      WHERE quizzes.id = questions.quiz_id
        AND auth.uid() = owner_id
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM quizzes
      WHERE quizzes.id = questions.quiz_id
        AND auth.uid() = owner_id
    )
  );

-- Game Sessions RLS
ALTER TABLE game_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Game Sessions: Host can manage" ON game_sessions
  USING (auth.uid() = host_id)
  WITH CHECK (auth.uid() = host_id);

CREATE POLICY "Game Sessions: Participants can read" ON game_sessions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM participants
      WHERE participants.game_session_id = game_sessions.id
        AND participants.user_id = auth.uid()
    )
    OR auth.uid() = host_id
  );

-- Participants RLS
ALTER TABLE participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Participants: User can read own" ON participants
  FOR SELECT USING (auth.uid() = user_id OR auth.uid() IN (
    SELECT host_id FROM game_sessions
    WHERE game_sessions.id = participants.game_session_id
  ));

CREATE POLICY "Participants: Can insert self" ON participants
  FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Participants: User can update own" ON participants
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Answers RLS
ALTER TABLE answers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Answers: User can insert own" ON answers
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM participants
      WHERE participants.id = answers.participant_id
        AND (participants.user_id = auth.uid() OR participants.user_id IS NULL)
    )
  );

CREATE POLICY "Answers: Host can read own game" ON answers
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM game_sessions
      WHERE game_sessions.id = answers.game_session_id
        AND game_sessions.host_id = auth.uid()
    )
  );

-- Scores RLS
ALTER TABLE scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Scores: Readable by participants" ON scores
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM participants
      WHERE participants.id = scores.participant_id
        AND (participants.user_id = auth.uid() OR participants.user_id IS NULL)
    )
    OR EXISTS (
      SELECT 1 FROM game_sessions
      WHERE game_sessions.id = scores.game_session_id
        AND game_sessions.host_id = auth.uid()
    )
  );

CREATE POLICY "Scores: System can upsert" ON scores
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Scores: System can update" ON scores
  FOR UPDATE USING (true);
