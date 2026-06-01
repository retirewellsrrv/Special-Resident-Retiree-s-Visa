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
      admin_profiles: {
        Row: {
          name: string
          user_id: string
        }
        Insert: {
          name: string
          user_id: string
        }
        Update: {
          name?: string
          user_id?: string
        }
        Relationships: []
      }
      applications: {
        Row: {
          application_code: string
          created_at: string
          id: number
          payment_id: number
          service_type: Database["public"]["Enums"]["service_type"]
          status: Database["public"]["Enums"]["application_status"]
          updated_at: string | null
          user_id: string
        }
        Insert: {
          application_code: string
          created_at?: string
          id?: number
          payment_id: number
          service_type: Database["public"]["Enums"]["service_type"]
          status?: Database["public"]["Enums"]["application_status"]
          updated_at?: string | null
          user_id: string
        }
        Update: {
          application_code?: string
          created_at?: string
          id?: number
          payment_id?: number
          service_type?: Database["public"]["Enums"]["service_type"]
          status?: Database["public"]["Enums"]["application_status"]
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "applications_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "applications_service_type_fkey"
            columns: ["service_type"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["type"]
          },
          {
            foreignKeyName: "applications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "client_profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      client_profiles: {
        Row: {
          address: string
          age: number
          birthday: string
          name: string
          nationality: string
          sex: Database["public"]["Enums"]["sex"]
          user_id: string
        }
        Insert: {
          address: string
          age: number
          birthday: string
          name: string
          nationality: string
          sex: Database["public"]["Enums"]["sex"]
          user_id: string
        }
        Update: {
          address?: string
          age?: number
          birthday?: string
          name?: string
          nationality?: string
          sex?: Database["public"]["Enums"]["sex"]
          user_id?: string
        }
        Relationships: []
      }
      documents: {
        Row: {
          application_id: number
          created_at: string
          id: number
          path: string
          status: Database["public"]["Enums"]["document_status"]
          type: string
          updated_at: string | null
        }
        Insert: {
          application_id: number
          created_at?: string
          id: number
          path: string
          status: Database["public"]["Enums"]["document_status"]
          type: string
          updated_at?: string | null
        }
        Update: {
          application_id?: number
          created_at?: string
          id?: number
          path?: string
          status?: Database["public"]["Enums"]["document_status"]
          type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "documents_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
        ]
      }
      notifactions: {
        Row: {
          id: number
          is_read: boolean
          notification: string
          user_id: string
        }
        Insert: {
          id?: number
          is_read?: boolean
          notification: string
          user_id: string
        }
        Update: {
          id?: number
          is_read?: boolean
          notification?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "client_profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          id: number
          payment_method: Database["public"]["Enums"]["payment_methods"]
          status: Database["public"]["Enums"]["payment_status"]
          transaction_code: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount: number
          created_at: string
          id?: number
          payment_method: Database["public"]["Enums"]["payment_methods"]
          status: Database["public"]["Enums"]["payment_status"]
          transaction_code: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: number
          payment_method?: Database["public"]["Enums"]["payment_methods"]
          status?: Database["public"]["Enums"]["payment_status"]
          transaction_code?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "client_profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      services: {
        Row: {
          description: string | null
          id: number
          is_available: boolean
          price: number
          type: Database["public"]["Enums"]["service_type"]
        }
        Insert: {
          description?: string | null
          id?: number
          is_available: boolean
          price: number
          type: Database["public"]["Enums"]["service_type"]
        }
        Update: {
          description?: string | null
          id?: number
          is_available?: boolean
          price?: number
          type?: Database["public"]["Enums"]["service_type"]
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
      application_status: "processing" | "paused" | "approved" | "rejected"
      document_status: "processing" | "accepted" | "rejected" | "action need"
      payment_methods: "credit card" | "debit card" | "e-wallet"
      payment_status: "processing" | "pending" | "cancelled" | "success"
      service_type: "basic" | "premium" | "vip"
      sex: "male" | "female"
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
      application_status: ["processing", "paused", "approved", "rejected"],
      document_status: ["processing", "accepted", "rejected", "action need"],
      payment_methods: ["credit card", "debit card", "e-wallet"],
      payment_status: ["processing", "pending", "cancelled", "success"],
      service_type: ["basic", "premium", "vip"],
      sex: ["male", "female"],
    },
  },
} as const
