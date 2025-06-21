import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Create a function to get the Supabase client instead of creating it immediately
export function getSupabaseClient() {
  if (!supabaseUrl) {
    throw new Error("Missing env.NEXT_PUBLIC_SUPABASE_URL")
  }

  if (!supabaseAnonKey) {
    throw new Error("Missing env.NEXT_PUBLIC_SUPABASE_ANON_KEY")
  }

  return createClient(supabaseUrl, supabaseAnonKey)
}

// Only create the client if environment variables are available
export const supabase = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null

// Helper function to check if Supabase is configured
export const isSupabaseConfigured = () => {
  return !!(supabaseUrl && supabaseAnonKey)
}

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          role: "admin" | "student"
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          role?: "admin" | "student"
          avatar_url?: string | null
        }
        Update: {
          full_name?: string | null
          role?: "admin" | "student"
          avatar_url?: string | null
        }
      }
      quizzes: {
        Row: {
          id: string
          title: string
          description: string | null
          questions: any[]
          total_points: number
          time_limit: number | null
          created_by: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          title: string
          description?: string | null
          questions: any[]
          total_points?: number
          time_limit?: number | null
          created_by?: string | null
          is_active?: boolean
        }
        Update: {
          title?: string
          description?: string | null
          questions?: any[]
          total_points?: number
          time_limit?: number | null
          is_active?: boolean
        }
      }
      quiz_submissions: {
        Row: {
          id: string
          quiz_id: string
          user_id: string
          answers: any[]
          score: number
          total_possible: number
          percentage: number
          time_taken: number | null
          submitted_at: string
        }
        Insert: {
          quiz_id: string
          user_id: string
          answers: any[]
          score: number
          total_possible: number
          percentage: number
          time_taken?: number | null
        }
        Update: {
          answers?: any[]
          score?: number
          total_possible?: number
          percentage?: number
          time_taken?: number | null
        }
      }
    }
  }
}
