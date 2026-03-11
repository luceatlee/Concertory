export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      artists: {
        Row: {
          created_at: string | null
          debut_date: string | null
          id: string
          is_active: boolean | null
          name: string
          name_en: string | null
          profile_image_url: string | null
          slug: string
          theme_color: string | null
          type: string | null
        }
        Insert: {
          created_at?: string | null
          debut_date?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          name_en?: string | null
          profile_image_url?: string | null
          slug: string
          theme_color?: string | null
          type?: string | null
        }
        Update: {
          created_at?: string | null
          debut_date?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          name_en?: string | null
          profile_image_url?: string | null
          slug?: string
          theme_color?: string | null
          type?: string | null
        }
        Relationships: []
      }
      comment_reactions: {
        Row: {
          comment_id: string | null
          created_at: string | null
          id: string
          reaction_type: string | null
          user_id: string | null
        }
        Insert: {
          comment_id?: string | null
          created_at?: string | null
          id?: string
          reaction_type?: string | null
          user_id?: string | null
        }
        Update: {
          comment_id?: string | null
          created_at?: string | null
          id?: string
          reaction_type?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "comment_reactions_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "song_comments"
            referencedColumns: ["id"]
          },
        ]
      }
      concert_reviews: {
        Row: {
          concert_id: string | null
          created_at: string | null
          feedback: string | null
          id: string
          liked_points: string | null
          user_id: string | null
        }
        Insert: {
          concert_id?: string | null
          created_at?: string | null
          feedback?: string | null
          id?: string
          liked_points?: string | null
          user_id?: string | null
        }
        Update: {
          concert_id?: string | null
          created_at?: string | null
          feedback?: string | null
          id?: string
          liked_points?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "concert_reviews_concert_id_fkey"
            columns: ["concert_id"]
            isOneToOne: false
            referencedRelation: "concerts"
            referencedColumns: ["id"]
          },
        ]
      }
      concerts: {
        Row: {
          artist_id: string | null
          city: string | null
          country: string | null
          created_at: string | null
          date: string
          day_sequence: number | null
          id: string
          title: string
          total_duration_min: number | null
          tour_name: string | null
          venue: string | null
          venue_id: string | null
        }
        Insert: {
          artist_id?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          date: string
          day_sequence?: number | null
          id?: string
          title: string
          total_duration_min?: number | null
          tour_name?: string | null
          venue?: string | null
          venue_id?: string | null
        }
        Update: {
          artist_id?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          date?: string
          day_sequence?: number | null
          id?: string
          title?: string
          total_duration_min?: number | null
          tour_name?: string | null
          venue?: string | null
          venue_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "concerts_artist_id_fkey"
            columns: ["artist_id"]
            isOneToOne: false
            referencedRelation: "artists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "concerts_venue_id_fkey"
            columns: ["venue_id"]
            isOneToOne: false
            referencedRelation: "venues"
            referencedColumns: ["id"]
          },
        ]
      }
      log_media: {
        Row: {
          created_at: string | null
          id: string
          log_id: string | null
          media_type: string | null
          media_url: string | null
          order_num: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          log_id?: string | null
          media_type?: string | null
          media_url?: string | null
          order_num?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          log_id?: string | null
          media_type?: string | null
          media_url?: string | null
          order_num?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "log_media_log_id_fkey"
            columns: ["log_id"]
            isOneToOne: false
            referencedRelation: "my_concert_logs"
            referencedColumns: ["id"]
          },
        ]
      }
      members: {
        Row: {
          artist_id: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          name: string
          name_en: string | null
          profile_image_url: string | null
        }
        Insert: {
          artist_id?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          name_en?: string | null
          profile_image_url?: string | null
        }
        Update: {
          artist_id?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          name_en?: string | null
          profile_image_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "members_artist_id_fkey"
            columns: ["artist_id"]
            isOneToOne: false
            referencedRelation: "artists"
            referencedColumns: ["id"]
          },
        ]
      }
      my_concert_logs: {
        Row: {
          concert_id: string | null
          content: string | null
          created_at: string | null
          emotion: string | null
          fan_event_memo: string | null
          id: string
          is_public: boolean | null
          physical_condition: string | null
          seat: string | null
          user_id: string | null
          weather: string | null
        }
        Insert: {
          concert_id?: string | null
          content?: string | null
          created_at?: string | null
          emotion?: string | null
          fan_event_memo?: string | null
          id?: string
          is_public?: boolean | null
          physical_condition?: string | null
          seat?: string | null
          user_id?: string | null
          weather?: string | null
        }
        Update: {
          concert_id?: string | null
          content?: string | null
          created_at?: string | null
          emotion?: string | null
          fan_event_memo?: string | null
          id?: string
          is_public?: boolean | null
          physical_condition?: string | null
          seat?: string | null
          user_id?: string | null
          weather?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "my_concert_logs_concert_id_fkey"
            columns: ["concert_id"]
            isOneToOne: false
            referencedRelation: "concerts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "my_concert_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      setlist_items: {
        Row: {
          concert_id: string | null
          created_at: string | null
          id: string
          order_num: number
          outfit_description: string | null
          outfit_image_url: string | null
          section: string | null
          sing_along_event: string | null
          slogan_event: string | null
          song_id: string | null
          video_url: string | null
        }
        Insert: {
          concert_id?: string | null
          created_at?: string | null
          id?: string
          order_num: number
          outfit_description?: string | null
          outfit_image_url?: string | null
          section?: string | null
          sing_along_event?: string | null
          slogan_event?: string | null
          song_id?: string | null
          video_url?: string | null
        }
        Update: {
          concert_id?: string | null
          created_at?: string | null
          id?: string
          order_num?: number
          outfit_description?: string | null
          outfit_image_url?: string | null
          section?: string | null
          sing_along_event?: string | null
          slogan_event?: string | null
          song_id?: string | null
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "setlist_items_concert_id_fkey"
            columns: ["concert_id"]
            isOneToOne: false
            referencedRelation: "concerts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "setlist_items_song_id_fkey"
            columns: ["song_id"]
            isOneToOne: false
            referencedRelation: "songs"
            referencedColumns: ["id"]
          },
        ]
      }
      setlist_votes: {
        Row: {
          artist_id: string | null
          created_at: string | null
          id: string
          song_id: string | null
          user_id: string | null
        }
        Insert: {
          artist_id?: string | null
          created_at?: string | null
          id?: string
          song_id?: string | null
          user_id?: string | null
        }
        Update: {
          artist_id?: string | null
          created_at?: string | null
          id?: string
          song_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "setlist_votes_artist_id_fkey"
            columns: ["artist_id"]
            isOneToOne: false
            referencedRelation: "artists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "setlist_votes_song_id_fkey"
            columns: ["song_id"]
            isOneToOne: false
            referencedRelation: "songs"
            referencedColumns: ["id"]
          },
        ]
      }
      song_comments: {
        Row: {
          content: string
          created_at: string | null
          id: string
          member_id: string | null
          setlist_item_id: string | null
          user_id: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          member_id?: string | null
          setlist_item_id?: string | null
          user_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          member_id?: string | null
          setlist_item_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "song_comments_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "song_comments_setlist_item_id_fkey"
            columns: ["setlist_item_id"]
            isOneToOne: false
            referencedRelation: "setlist_items"
            referencedColumns: ["id"]
          },
        ]
      }
      songs: {
        Row: {
          artist_id: string | null
          cheer_guide: string | null
          created_at: string | null
          id: string
          release_date: string | null
          title: string
          title_en: string | null
        }
        Insert: {
          artist_id?: string | null
          cheer_guide?: string | null
          created_at?: string | null
          id?: string
          release_date?: string | null
          title: string
          title_en?: string | null
        }
        Update: {
          artist_id?: string | null
          cheer_guide?: string | null
          created_at?: string | null
          id?: string
          release_date?: string | null
          title?: string
          title_en?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "songs_artist_id_fkey"
            columns: ["artist_id"]
            isOneToOne: false
            referencedRelation: "artists"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          id: string
          nickname: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          id: string
          nickname?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          id?: string
          nickname?: string | null
        }
        Relationships: []
      }
      venue_reviews: {
        Row: {
          content: string | null
          created_at: string | null
          id: string
          image_url: string | null
          seat_section: string | null
          user_id: string | null
          venue_id: string | null
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          id?: string
          image_url?: string | null
          seat_section?: string | null
          user_id?: string | null
          venue_id?: string | null
        }
        Update: {
          content?: string | null
          created_at?: string | null
          id?: string
          image_url?: string | null
          seat_section?: string | null
          user_id?: string | null
          venue_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "venue_reviews_venue_id_fkey"
            columns: ["venue_id"]
            isOneToOne: false
            referencedRelation: "venues"
            referencedColumns: ["id"]
          },
        ]
      }
      venues: {
        Row: {
          capacity: number | null
          city: string | null
          country: string | null
          created_at: string | null
          id: string
          name: string
          seat_map_url: string | null
        }
        Insert: {
          capacity?: number | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          id?: string
          name: string
          seat_map_url?: string | null
        }
        Update: {
          capacity?: number | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          id?: string
          name?: string
          seat_map_url?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
