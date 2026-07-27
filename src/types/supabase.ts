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
          is_active: boolean | null
          name: string
          user_id: string
        }
        Insert: {
          is_active?: boolean | null
          name: string
          user_id: string
        }
        Update: {
          is_active?: boolean | null
          name?: string
          user_id?: string
        }
        Relationships: []
      }
      applicant_profiles: {
        Row: {
          application_id: number | null
          civil_status: Database["public"]["Enums"]["marital_status"]
          date_of_birth: string
          gender: Database["public"]["Enums"]["sex"]
          height: number
          id: number
          name: string
          nationality: string
          place_of_birth: string
          religion: string
          weight: number
        }
        Insert: {
          application_id?: number | null
          civil_status: Database["public"]["Enums"]["marital_status"]
          date_of_birth: string
          gender: Database["public"]["Enums"]["sex"]
          height: number
          id?: number
          name: string
          nationality: string
          place_of_birth: string
          religion: string
          weight: number
        }
        Update: {
          application_id?: number | null
          civil_status?: Database["public"]["Enums"]["marital_status"]
          date_of_birth?: string
          gender?: Database["public"]["Enums"]["sex"]
          height?: number
          id?: number
          name?: string
          nationality?: string
          place_of_birth?: string
          religion?: string
          weight?: number
        }
        Relationships: [
          {
            foreignKeyName: "applicant_profiles_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: true
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
        ]
      }
      applications: {
        Row: {
          application_code: string
          created_at: string
          future_plans: string | null
          id: number
          payment_id: number | null
          status: Database["public"]["Enums"]["application_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          application_code: string
          created_at?: string
          future_plans?: string | null
          id?: number
          payment_id?: number | null
          status?: Database["public"]["Enums"]["application_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          application_code?: string
          created_at?: string
          future_plans?: string | null
          id?: number
          payment_id?: number | null
          status?: Database["public"]["Enums"]["application_status"]
          updated_at?: string
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
          age: number
          birthday: string
          marital_status: Database["public"]["Enums"]["marital_status"]
          name: string
          nationality: string
          sex: Database["public"]["Enums"]["sex"]
          user_id: string
        }
        Insert: {
          age: number
          birthday: string
          marital_status?: Database["public"]["Enums"]["marital_status"]
          name: string
          nationality: string
          sex: Database["public"]["Enums"]["sex"]
          user_id: string
        }
        Update: {
          age?: number
          birthday?: string
          marital_status?: Database["public"]["Enums"]["marital_status"]
          name?: string
          nationality?: string
          sex?: Database["public"]["Enums"]["sex"]
          user_id?: string
        }
        Relationships: []
      }
      contacts: {
        Row: {
          application_id: number | null
          email: string
          fax_no: string | null
          home_country_address: string
          id: number
          mobile_no: string
          primary_address_ph: string | null
          secondary_address_ph: string | null
          tel_no: string | null
        }
        Insert: {
          application_id?: number | null
          email: string
          fax_no?: string | null
          home_country_address: string
          id?: number
          mobile_no: string
          primary_address_ph?: string | null
          secondary_address_ph?: string | null
          tel_no?: string | null
        }
        Update: {
          application_id?: number | null
          email?: string
          fax_no?: string | null
          home_country_address?: string
          id?: number
          mobile_no?: string
          primary_address_ph?: string | null
          secondary_address_ph?: string | null
          tel_no?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contacts_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: true
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
        ]
      }
      dependents: {
        Row: {
          age: number
          application_id: number | null
          id: number
          is_included: boolean
          name: string
          passport_no: string
          relationship: string
        }
        Insert: {
          age: number
          application_id?: number | null
          id?: number
          is_included?: boolean
          name: string
          passport_no: string
          relationship: string
        }
        Update: {
          age?: number
          application_id?: number | null
          id?: number
          is_included?: boolean
          name?: string
          passport_no?: string
          relationship?: string
        }
        Relationships: [
          {
            foreignKeyName: "dependents_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          application_id: number
          created_at: string
          format: Database["public"]["Enums"]["document_format"]
          id: number
          name: string
          path: string
          review_note: string | null
          status: Database["public"]["Enums"]["document_status"]
          type: Database["public"]["Enums"]["document_type"]
          updated_at: string
        }
        Insert: {
          application_id: number
          created_at?: string
          format: Database["public"]["Enums"]["document_format"]
          id?: number
          name: string
          path: string
          review_note?: string | null
          status?: Database["public"]["Enums"]["document_status"]
          type: Database["public"]["Enums"]["document_type"]
          updated_at?: string
        }
        Update: {
          application_id?: number
          created_at?: string
          format?: Database["public"]["Enums"]["document_format"]
          id?: number
          name?: string
          path?: string
          review_note?: string | null
          status?: Database["public"]["Enums"]["document_status"]
          type?: Database["public"]["Enums"]["document_type"]
          updated_at?: string
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
      educations: {
        Row: {
          application_id: number | null
          end_date: string
          id: number
          location: string
          school: string
          start_date: string
        }
        Insert: {
          application_id?: number | null
          end_date: string
          id?: number
          location: string
          school: string
          start_date: string
        }
        Update: {
          application_id?: number | null
          end_date?: string
          id?: number
          location?: string
          school?: string
          start_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "educations_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
        ]
      }
      emergency_contacts: {
        Row: {
          application_id: number | null
          id: number
          name: string
          phone_no: string
          relationship: string
        }
        Insert: {
          application_id?: number | null
          id?: number
          name: string
          phone_no: string
          relationship: string
        }
        Update: {
          application_id?: number | null
          id?: number
          name?: string
          phone_no?: string
          relationship?: string
        }
        Relationships: [
          {
            foreignKeyName: "emergency_contacts_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: true
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
        ]
      }
      employments: {
        Row: {
          application_id: number | null
          company_address: string | null
          company_name: string | null
          contact_no: string | null
          end_date: string | null
          id: number
          is_current: boolean | null
          job_title: string | null
          start_date: string | null
        }
        Insert: {
          application_id?: number | null
          company_address?: string | null
          company_name?: string | null
          contact_no?: string | null
          end_date?: string | null
          id?: number
          is_current?: boolean | null
          job_title?: string | null
          start_date?: string | null
        }
        Update: {
          application_id?: number | null
          company_address?: string | null
          company_name?: string | null
          contact_no?: string | null
          end_date?: string | null
          id?: number
          is_current?: boolean | null
          job_title?: string | null
          start_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "employments_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
        ]
      }
      family_backgrounds: {
        Row: {
          application_id: number | null
          father_age: number | null
          father_name: string
          id: number
          mother_age: number | null
          mother_name: string
        }
        Insert: {
          application_id?: number | null
          father_age?: number | null
          father_name: string
          id?: number
          mother_age?: number | null
          mother_name: string
        }
        Update: {
          application_id?: number | null
          father_age?: number | null
          father_name?: string
          id?: number
          mother_age?: number | null
          mother_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "family_backgrounds_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: true
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
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
      passports: {
        Row: {
          application_id: number | null
          date_of_issue: string
          expiration: string
          id: number
          passport_number: string
          place_of_issue: string
        }
        Insert: {
          application_id?: number | null
          date_of_issue: string
          expiration: string
          id?: number
          passport_number: string
          place_of_issue: string
        }
        Update: {
          application_id?: number | null
          date_of_issue?: string
          expiration?: string
          id?: number
          passport_number?: string
          place_of_issue?: string
        }
        Relationships: [
          {
            foreignKeyName: "passports_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: true
            referencedRelation: "applications"
            referencedColumns: ["id"]
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
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at: string
          id?: number
          payment_method: Database["public"]["Enums"]["payment_methods"]
          status: Database["public"]["Enums"]["payment_status"]
          transaction_code: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: number
          payment_method?: Database["public"]["Enums"]["payment_methods"]
          status?: Database["public"]["Enums"]["payment_status"]
          transaction_code?: string
          updated_at?: string
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
      service_plans: {
        Row: {
          created_at: string
          description: string
          highlighted: boolean
          id: number
          is_available: boolean
          name: string
          price: number
          price_note: string | null
          subtitle: string
          tags: string[]
          updated_at: string
        }
        Insert: {
          created_at?: string
          description: string
          highlighted?: boolean
          id?: number
          is_available?: boolean
          name: string
          price: number
          price_note?: string | null
          subtitle: string
          tags?: string[]
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          highlighted?: boolean
          id?: number
          is_available?: boolean
          name?: string
          price?: number
          price_note?: string | null
          subtitle?: string
          tags?: string[]
          updated_at?: string
        }
        Relationships: []
      }
      super_admin_profiles: {
        Row: {
          name: string | null
          user_id: string
        }
        Insert: {
          name?: string | null
          user_id: string
        }
        Update: {
          name?: string | null
          user_id?: string
        }
        Relationships: []
      }
      visa_details: {
        Row: {
          application_id: number | null
          date_of_arrival: string | null
          entry_visa_type: string | null
          exp_date_tourist_visa: string | null
          id: number
        }
        Insert: {
          application_id?: number | null
          date_of_arrival?: string | null
          entry_visa_type?: string | null
          exp_date_tourist_visa?: string | null
          id?: number
        }
        Update: {
          application_id?: number | null
          date_of_arrival?: string | null
          entry_visa_type?: string | null
          exp_date_tourist_visa?: string | null
          id?: number
        }
        Relationships: [
          {
            foreignKeyName: "visa_details_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: true
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      application_status:
        | "processing"
        | "paused"
        | "approved"
        | "rejected"
        | "pending"
        | "payment_failed"
      document_format:
        | "pdf"
        | "doc"
        | "docx"
        | "jpg"
        | "png"
        | "gif"
        | "bmp"
        | "webp"
        | "tiff"
        | "tif"
        | "jpeg"
      document_status:
        | "processing"
        | "accepted"
        | "rejected"
        | "action need"
        | "pending"
      document_type:
        | "passport"
        | "photo_2x2"
        | "pra_application"
        | "police"
        | "medical"
        | "bicc"
        | "bank_cert"
        | "proof_payment"
        | "proof_pension"
        | "proof_relationship"
      marital_status: "single" | "married" | "widowed" | "divorced"
      payment_methods:
        | "pool"
        | "callback_virtual_account"
        | "credit_card"
        | "retail_outlet"
        | "qr_code"
        | "qris"
        | "ewallet"
        | "direct_debit"
        | "bank_transfer"
        | "paylater"
        | "cryptocurrency"
      payment_status:
        | "processing"
        | "pending"
        | "cancelled"
        | "success"
        | "failed"
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
      application_status: [
        "processing",
        "paused",
        "approved",
        "rejected",
        "pending",
        "payment_failed",
      ],
      document_format: [
        "pdf",
        "doc",
        "docx",
        "jpg",
        "png",
        "gif",
        "bmp",
        "webp",
        "tiff",
        "tif",
        "jpeg",
      ],
      document_status: [
        "processing",
        "accepted",
        "rejected",
        "action need",
        "pending",
      ],
      document_type: [
        "passport",
        "photo_2x2",
        "pra_application",
        "police",
        "medical",
        "bicc",
        "bank_cert",
        "proof_payment",
        "proof_pension",
        "proof_relationship",
      ],
      marital_status: ["single", "married", "widowed", "divorced"],
      payment_methods: [
        "pool",
        "callback_virtual_account",
        "credit_card",
        "retail_outlet",
        "qr_code",
        "qris",
        "ewallet",
        "direct_debit",
        "bank_transfer",
        "paylater",
        "cryptocurrency",
      ],
      payment_status: [
        "processing",
        "pending",
        "cancelled",
        "success",
        "failed",
      ],
      sex: ["male", "female"],
    },
  },
} as const
