export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          full_name: string | null
          avatar_url: string | null
          email: string
          created_at: string
          last_login: string | null
        }
        Insert: {
          id: string
          full_name?: string | null
          avatar_url?: string | null
          email: string
          created_at?: string
          last_login?: string | null
        }
        Update: {
          id?: string
          full_name?: string | null
          avatar_url?: string | null
          email?: string
          created_at?: string
          last_login?: string | null
        }
      }
      documents: {
        Row: {
          id: string
          title: string
          content: string | null
          file_url: string | null
          created_by: string
          created_at: string
          updated_at: string
          document_type: string
          status: string
        }
        Insert: {
          id?: string
          title: string
          content?: string | null
          file_url?: string | null
          created_by: string
          created_at?: string
          updated_at?: string
          document_type: string
          status?: string
        }
        Update: {
          id?: string
          title?: string
          content?: string | null
          file_url?: string | null
          created_by?: string
          created_at?: string
          updated_at?: string
          document_type?: string
          status?: string
        }
      }
      document_permissions: {
        Row: {
          id: string
          document_id: string
          user_id: string
          permission_level: string
          created_at: string
        }
        Insert: {
          id?: string
          document_id: string
          user_id: string
          permission_level: string
          created_at?: string
        }
        Update: {
          id?: string
          document_id?: string
          user_id?: string
          permission_level?: string
          created_at?: string
        }
      }
    }
  }
}