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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      ai_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          role: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          role: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: []
      }
      community_comments: {
        Row: {
          author_id: string
          content: string
          created_at: string
          id: string
          post_id: string
        }
        Insert: {
          author_id: string
          content: string
          created_at?: string
          id?: string
          post_id: string
        }
        Update: {
          author_id?: string
          content?: string
          created_at?: string
          id?: string
          post_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      community_group_members: {
        Row: {
          group_id: string
          joined_at: string
          role: string
          user_id: string
        }
        Insert: {
          group_id: string
          joined_at?: string
          role?: string
          user_id: string
        }
        Update: {
          group_id?: string
          joined_at?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_group_members_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "community_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      community_groups: {
        Row: {
          cover: string
          created_at: string
          description: string
          id: string
          is_private: boolean
          name: string
          owner_id: string
        }
        Insert: {
          cover?: string
          created_at?: string
          description?: string
          id?: string
          is_private?: boolean
          name: string
          owner_id: string
        }
        Update: {
          cover?: string
          created_at?: string
          description?: string
          id?: string
          is_private?: boolean
          name?: string
          owner_id?: string
        }
        Relationships: []
      }
      community_posts: {
        Row: {
          author_id: string
          category: string
          content: string
          created_at: string
          group_id: string | null
          id: string
          image: string
          media_type: string
          media_url: string
          title: string
          updated_at: string
        }
        Insert: {
          author_id: string
          category?: string
          content?: string
          created_at?: string
          group_id?: string | null
          id?: string
          image?: string
          media_type?: string
          media_url?: string
          title: string
          updated_at?: string
        }
        Update: {
          author_id?: string
          category?: string
          content?: string
          created_at?: string
          group_id?: string | null
          id?: string
          image?: string
          media_type?: string
          media_url?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_posts_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "community_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      equipment: {
        Row: {
          brand: string
          created_at: string
          description: string
          district: string
          fuel: string
          id: string
          image: string
          insured: boolean
          name: string
          owner_id: string
          power_kw: number
          price_per_day: number
          price_per_hour: number
          region: string
          status: string
          type: string
          updated_at: string
          year: number
        }
        Insert: {
          brand?: string
          created_at?: string
          description?: string
          district?: string
          fuel?: string
          id?: string
          image?: string
          insured?: boolean
          name: string
          owner_id: string
          power_kw?: number
          price_per_day?: number
          price_per_hour?: number
          region?: string
          status?: string
          type?: string
          updated_at?: string
          year?: number
        }
        Update: {
          brand?: string
          created_at?: string
          description?: string
          district?: string
          fuel?: string
          id?: string
          image?: string
          insured?: boolean
          name?: string
          owner_id?: string
          power_kw?: number
          price_per_day?: number
          price_per_hour?: number
          region?: string
          status?: string
          type?: string
          updated_at?: string
          year?: number
        }
        Relationships: []
      }
      job_applications: {
        Row: {
          applicant_id: string
          created_at: string
          id: string
          job_id: string
          message: string
          status: Database["public"]["Enums"]["application_status"]
        }
        Insert: {
          applicant_id: string
          created_at?: string
          id?: string
          job_id: string
          message?: string
          status?: Database["public"]["Enums"]["application_status"]
        }
        Update: {
          applicant_id?: string
          created_at?: string
          id?: string
          job_id?: string
          message?: string
          status?: Database["public"]["Enums"]["application_status"]
        }
        Relationships: [
          {
            foreignKeyName: "job_applications_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      jobs: {
        Row: {
          created_at: string
          daily_rate: number
          description: string
          district: string | null
          employer_name: string
          end_date: string | null
          id: string
          owner_id: string
          region: string
          skills: string[]
          start_date: string | null
          task_type: string
          title: string
          updated_at: string
          urgent: boolean
          workers_needed: number
        }
        Insert: {
          created_at?: string
          daily_rate?: number
          description?: string
          district?: string | null
          employer_name?: string
          end_date?: string | null
          id?: string
          owner_id: string
          region: string
          skills?: string[]
          start_date?: string | null
          task_type: string
          title: string
          updated_at?: string
          urgent?: boolean
          workers_needed?: number
        }
        Update: {
          created_at?: string
          daily_rate?: number
          description?: string
          district?: string | null
          employer_name?: string
          end_date?: string | null
          id?: string
          owner_id?: string
          region?: string
          skills?: string[]
          start_date?: string | null
          task_type?: string
          title?: string
          updated_at?: string
          urgent?: boolean
          workers_needed?: number
        }
        Relationships: []
      }
      products: {
        Row: {
          bnpl: boolean
          created_at: string
          description: string
          id: string
          image: string
          organic: boolean
          owner_id: string
          price: number
          rating: number
          region: string
          seller: string
          stock: number
          title: string
          unit: string
          updated_at: string
        }
        Insert: {
          bnpl?: boolean
          created_at?: string
          description?: string
          id?: string
          image?: string
          organic?: boolean
          owner_id: string
          price?: number
          rating?: number
          region?: string
          seller?: string
          stock?: number
          title: string
          unit?: string
          updated_at?: string
        }
        Update: {
          bnpl?: boolean
          created_at?: string
          description?: string
          id?: string
          image?: string
          organic?: boolean
          owner_id?: string
          price?: number
          rating?: number
          region?: string
          seller?: string
          stock?: number
          title?: string
          unit?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string
          id: string
          is_verified: boolean
          language: string
          phone: string | null
          region: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string
          id: string
          is_verified?: boolean
          language?: string
          phone?: string | null
          region?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string
          id?: string
          is_verified?: boolean
          language?: string
          phone?: string | null
          region?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      user_ratings: {
        Row: {
          comment: string
          created_at: string
          id: string
          rated_user_id: string
          rater_id: string
          stars: number
        }
        Insert: {
          comment?: string
          created_at?: string
          id?: string
          rated_user_id: string
          rater_id: string
          stars: number
        }
        Update: {
          comment?: string
          created_at?: string
          id?: string
          rated_user_id?: string
          rater_id?: string
          stars?: number
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_group_member: {
        Args: { _group: string; _user: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "farmer" | "employer" | "worker" | "equipment_owner" | "admin"
      application_status: "pending" | "accepted" | "rejected"
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
    Enums: {
      app_role: ["farmer", "employer", "worker", "equipment_owner", "admin"],
      application_status: ["pending", "accepted", "rejected"],
    },
  },
} as const
