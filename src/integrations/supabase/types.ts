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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      diagnoses: {
        Row: {
          confidence: Database["public"]["Enums"]["diagnosis_confidence"]
          created_at: string | null
          diagnosis: string
          differential_diagnoses: string[] | null
          doctor_id: string
          id: string
          reasoning: string
          symptom_record_id: string
        }
        Insert: {
          confidence: Database["public"]["Enums"]["diagnosis_confidence"]
          created_at?: string | null
          diagnosis: string
          differential_diagnoses?: string[] | null
          doctor_id: string
          id?: string
          reasoning: string
          symptom_record_id: string
        }
        Update: {
          confidence?: Database["public"]["Enums"]["diagnosis_confidence"]
          created_at?: string | null
          diagnosis?: string
          differential_diagnoses?: string[] | null
          doctor_id?: string
          id?: string
          reasoning?: string
          symptom_record_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "diagnoses_symptom_record_id_fkey"
            columns: ["symptom_record_id"]
            isOneToOne: false
            referencedRelation: "symptom_records"
            referencedColumns: ["id"]
          },
        ]
      }
      medical_summaries: {
        Row: {
          created_at: string | null
          doctor_id: string
          id: string
          key_findings: string[] | null
          original_text: string
          patient_id: string
          summary: string
        }
        Insert: {
          created_at?: string | null
          doctor_id: string
          id?: string
          key_findings?: string[] | null
          original_text: string
          patient_id: string
          summary: string
        }
        Update: {
          created_at?: string | null
          doctor_id?: string
          id?: string
          key_findings?: string[] | null
          original_text?: string
          patient_id?: string
          summary?: string
        }
        Relationships: [
          {
            foreignKeyName: "medical_summaries_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      patients: {
        Row: {
          allergies: string | null
          created_at: string | null
          current_medications: string | null
          date_of_birth: string | null
          doctor_id: string
          full_name: string
          gender: string | null
          id: string
          medical_history: string | null
          updated_at: string | null
        }
        Insert: {
          allergies?: string | null
          created_at?: string | null
          current_medications?: string | null
          date_of_birth?: string | null
          doctor_id: string
          full_name: string
          gender?: string | null
          id?: string
          medical_history?: string | null
          updated_at?: string | null
        }
        Update: {
          allergies?: string | null
          created_at?: string | null
          current_medications?: string | null
          date_of_birth?: string | null
          doctor_id?: string
          full_name?: string
          gender?: string | null
          id?: string
          medical_history?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          full_name: string
          id: string
          license_number: string | null
          specialty: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          full_name: string
          id: string
          license_number?: string | null
          specialty?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          full_name?: string
          id?: string
          license_number?: string | null
          specialty?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      symptom_records: {
        Row: {
          additional_notes: string | null
          created_at: string | null
          doctor_id: string
          duration: string | null
          id: string
          patient_id: string
          severity: Database["public"]["Enums"]["symptom_severity"]
          symptoms: string
        }
        Insert: {
          additional_notes?: string | null
          created_at?: string | null
          doctor_id: string
          duration?: string | null
          id?: string
          patient_id: string
          severity: Database["public"]["Enums"]["symptom_severity"]
          symptoms: string
        }
        Update: {
          additional_notes?: string | null
          created_at?: string | null
          doctor_id?: string
          duration?: string | null
          id?: string
          patient_id?: string
          severity?: Database["public"]["Enums"]["symptom_severity"]
          symptoms?: string
        }
        Relationships: [
          {
            foreignKeyName: "symptom_records_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      treatments: {
        Row: {
          created_at: string | null
          diagnosis_id: string
          doctor_id: string
          follow_up_instructions: string | null
          id: string
          medications: string[] | null
          precautions: string | null
          priority: Database["public"]["Enums"]["treatment_priority"]
          treatment_plan: string
        }
        Insert: {
          created_at?: string | null
          diagnosis_id: string
          doctor_id: string
          follow_up_instructions?: string | null
          id?: string
          medications?: string[] | null
          precautions?: string | null
          priority: Database["public"]["Enums"]["treatment_priority"]
          treatment_plan: string
        }
        Update: {
          created_at?: string | null
          diagnosis_id?: string
          doctor_id?: string
          follow_up_instructions?: string | null
          id?: string
          medications?: string[] | null
          precautions?: string | null
          priority?: Database["public"]["Enums"]["treatment_priority"]
          treatment_plan?: string
        }
        Relationships: [
          {
            foreignKeyName: "treatments_diagnosis_id_fkey"
            columns: ["diagnosis_id"]
            isOneToOne: false
            referencedRelation: "diagnoses"
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
      diagnosis_confidence: "low" | "medium" | "high" | "very_high"
      symptom_severity: "mild" | "moderate" | "severe" | "critical"
      treatment_priority: "routine" | "urgent" | "emergency"
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
      diagnosis_confidence: ["low", "medium", "high", "very_high"],
      symptom_severity: ["mild", "moderate", "severe", "critical"],
      treatment_priority: ["routine", "urgent", "emergency"],
    },
  },
} as const
