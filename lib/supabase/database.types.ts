/**
 * Supabase veritabani semasinin TypeScript karsiligi.
 * Bu dosya tum tablo ve fonksiyon tipleri icin tek dogruluk kaynagidir.
 */

export type Database = {
  public: {
    Tables: {
      quizzes: {
        Row: {
          id: string;
          created_at: string;
          owner_id: string;
          title: string;
          description: string | null;
          is_published: boolean;
          duration_seconds: number | null;
        };
        Insert: {
          id?: string;
          created_at?: string;
          owner_id: string;
          title: string;
          description?: string | null;
          is_published?: boolean;
          duration_seconds?: number | null;
        };
        Update: {
          id?: string;
          created_at?: string;
          owner_id?: string;
          title?: string;
          description?: string | null;
          is_published?: boolean;
          duration_seconds?: number | null;
        };
        Relationships: [];
      };
      questions: {
        Row: {
          id: string;
          created_at: string;
          quiz_id: string;
          order: number;
          text: string;
          options: string[];
          correct_option_index: number;
          time_limit_seconds: number;
          points: number;
        };
        Insert: {
          id?: string;
          created_at?: string;
          quiz_id: string;
          order: number;
          text: string;
          options: string[];
          correct_option_index: number;
          time_limit_seconds?: number;
          points?: number;
        };
        Update: {
          id?: string;
          created_at?: string;
          quiz_id?: string;
          order?: number;
          text?: string;
          options?: string[];
          correct_option_index?: number;
          time_limit_seconds?: number;
          points?: number;
        };
        Relationships: [
          {
            foreignKeyName: 'questions_quiz_id_fkey';
            columns: ['quiz_id'];
            referencedRelation: 'quizzes';
            referencedColumns: ['id'];
          },
        ];
      };
      game_sessions: {
        Row: {
          id: string;
          created_at: string;
          quiz_id: string;
          host_id: string;
          game_pin: string;
          status: 'waiting' | 'in_progress' | 'completed';
          current_question_index: number;
          current_phase: 'question' | 'intermission';
          active_question_id: string | null;
          started_at: string | null;
          phase_started_at: string | null;
          phase_ends_at: string | null;
          ended_at: string | null;
          total_questions: number;
        };
        Insert: {
          id?: string;
          created_at?: string;
          quiz_id: string;
          host_id: string;
          game_pin: string;
          status?: 'waiting' | 'in_progress' | 'completed';
          current_question_index?: number;
          current_phase?: 'question' | 'intermission';
          active_question_id?: string | null;
          started_at?: string | null;
          phase_started_at?: string | null;
          phase_ends_at?: string | null;
          ended_at?: string | null;
          total_questions: number;
        };
        Update: {
          id?: string;
          created_at?: string;
          quiz_id?: string;
          host_id?: string;
          game_pin?: string;
          status?: 'waiting' | 'in_progress' | 'completed';
          current_question_index?: number;
          current_phase?: 'question' | 'intermission';
          active_question_id?: string | null;
          started_at?: string | null;
          phase_started_at?: string | null;
          phase_ends_at?: string | null;
          ended_at?: string | null;
          total_questions?: number;
        };
        Relationships: [
          {
            foreignKeyName: 'game_sessions_quiz_id_fkey';
            columns: ['quiz_id'];
            referencedRelation: 'quizzes';
            referencedColumns: ['id'];
          },
        ];
      };
      participants: {
        Row: {
          id: string;
          created_at: string;
          game_session_id: string;
          user_id: string | null;
          display_name: string;
          is_online: boolean;
          last_seen: string | null;
        };
        Insert: {
          id?: string;
          created_at?: string;
          game_session_id: string;
          user_id?: string | null;
          display_name: string;
          is_online?: boolean;
          last_seen?: string | null;
        };
        Update: {
          id?: string;
          created_at?: string;
          game_session_id?: string;
          user_id?: string | null;
          display_name?: string;
          is_online?: boolean;
          last_seen?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'participants_game_session_id_fkey';
            columns: ['game_session_id'];
            referencedRelation: 'game_sessions';
            referencedColumns: ['id'];
          },
        ];
      };
      answers: {
        Row: {
          id: string;
          created_at: string;
          game_session_id: string;
          participant_id: string;
          question_id: string;
          selected_option_index: number;
          is_correct: boolean;
          response_time_ms: number;
          points_earned: number;
        };
        Insert: {
          id?: string;
          created_at?: string;
          game_session_id: string;
          participant_id: string;
          question_id: string;
          selected_option_index: number;
          is_correct?: boolean;
          response_time_ms: number;
          points_earned?: number;
        };
        Update: {
          id?: string;
          created_at?: string;
          game_session_id?: string;
          participant_id?: string;
          question_id?: string;
          selected_option_index?: number;
          is_correct?: boolean;
          response_time_ms?: number;
          points_earned?: number;
        };
        Relationships: [
          {
            foreignKeyName: 'answers_game_session_id_fkey';
            columns: ['game_session_id'];
            referencedRelation: 'game_sessions';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'answers_participant_id_fkey';
            columns: ['participant_id'];
            referencedRelation: 'participants';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'answers_question_id_fkey';
            columns: ['question_id'];
            referencedRelation: 'questions';
            referencedColumns: ['id'];
          },
        ];
      };
      scores: {
        Row: {
          id: string;
          created_at: string;
          game_session_id: string;
          participant_id: string;
          total_score: number;
          correct_answers: number;
          total_questions_answered: number;
          updated_at: string;
        };
        Insert: {
          id?: string;
          created_at?: string;
          game_session_id: string;
          participant_id: string;
          total_score?: number;
          correct_answers?: number;
          total_questions_answered?: number;
          updated_at?: string;
        };
        Update: {
          id?: string;
          created_at?: string;
          game_session_id?: string;
          participant_id?: string;
          total_score?: number;
          correct_answers?: number;
          total_questions_answered?: number;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'scores_game_session_id_fkey';
            columns: ['game_session_id'];
            referencedRelation: 'game_sessions';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'scores_participant_id_fkey';
            columns: ['participant_id'];
            referencedRelation: 'participants';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: {
      join_game_session: {
        Args: {
          p_game_pin: string;
          p_display_name: string | null;
        };
        Returns: unknown;
      };
      get_game_session_sync: {
        Args: {
          p_game_session_id: string;
          p_participant_id?: string | null;
        };
        Returns: {
          current_question_index: number;
          game_status: 'waiting' | 'in_progress' | 'completed';
          current_phase: 'question' | 'intermission';
          active_question_id: string | null;
          phase_started_at: string | null;
          phase_ends_at: string | null;
          total_questions: number;
          has_next_question: boolean;
        }[];
      };
      get_playable_game_state: {
        Args: {
          p_game_session_id: string;
          p_participant_id?: string | null;
        };
        Returns: unknown;
      };
      submit_player_answer: {
        Args: {
          p_game_session_id: string;
          p_participant_id: string;
          p_question_id: string;
          p_selected_option_index: number;
          p_response_time_ms: number;
        };
        Returns: {
          accepted: boolean;
          already_answered: boolean;
          locked_option_index: number;
          points_earned: number;
        }[];
      };
      get_leaderboard_entries: {
        Args: {
          p_game_session_id: string;
          p_participant_id?: string | null;
          p_limit?: number | null;
        };
        Returns: {
          participant_id: string;
          display_name: string;
          total_score: number;
          correct_answers: number;
        }[];
      };
      sync_game_phase: {
        Args: {
          p_game_session_id: string;
          p_participant_id?: string | null;
        };
        Returns: {
          current_question_index: number;
          game_status: 'waiting' | 'in_progress' | 'completed';
          current_phase: 'question' | 'intermission';
          active_question_id: string | null;
          phase_started_at: string | null;
          phase_ends_at: string | null;
          total_questions: number;
          has_next_question: boolean;
        }[];
      };
      get_lobby_participants: {
        Args: {
          p_game_session_id: string;
        };
        Returns: {
          id: string;
          created_at: string;
          game_session_id: string;
          user_id: string | null;
          display_name: string;
          is_online: boolean;
          last_seen: string | null;
        }[];
      };
      update_participant_name: {
        Args: {
          p_participant_id: string;
          p_display_name: string;
        };
        Returns: unknown;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row'];

export type TablesInsert<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert'];

export type TablesUpdate<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update'];
