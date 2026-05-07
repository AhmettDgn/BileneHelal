/**
 * Supabase veritabanı şemasının TypeScript karşılığı.
 * Bu dosya TÜM tablo tipleri için tek doğruluk kaynağıdır.
 * @see https://supabase.com/docs/reference/javascript/schema
 */

export type Database = {
  public: {
    Tables: {
      /** Quiz meta verileri — sahip tarafından oluşturulur */
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

      /** Quiz soruları ve seçenekleri */
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

      /** Oyun oturumları — "şu anda oynanıyor" */
      game_sessions: {
        Row: {
          id: string;
          created_at: string;
          quiz_id: string;
          host_id: string;
          game_pin: string;
          status: 'waiting' | 'in_progress' | 'completed';
          current_question_index: number;
          started_at: string | null;
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
          started_at?: string | null;
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
          started_at?: string | null;
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

      /** Oyuncu katılım kaydı */
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

      /** Cevap kaydı — her oyuncu cevabı */
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

      /** Kümülatif puanlar — lider tahtası */
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
      /** Anon/auth kullanıcısını PIN ile bir oyuna katar (SECURITY DEFINER). */
      join_game_session: {
        Args: {
          p_game_pin: string;
          p_display_name: string;
        };
        Returns: unknown;
      };
      /** Katılımcının görünen adını günceller; aynı oyunda eşsizliği zorlar. */
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

/** Tablo satır tipleri çıkarma */
export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row'];

/** Tablo insert tipleri çıkarma */
export type TablesInsert<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert'];

/** Tablo update tipleri çıkarma */
export type TablesUpdate<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update'];
