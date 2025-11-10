// Database types for Supabase
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
      participants: {
        Row: {
          id: string
          name: string
          email: string
          whatsapp_no: string
          category: 'video' | 'ui_ux' | 'graphics'
          city: string
          portfolio_url: string
          is_present: boolean
          whatsapp_opt_in: boolean | null
          whatsapp_opt_in_at: string | null
          whatsapp_opt_in_source: string | null
          whatsapp_opt_out_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          email: string
          whatsapp_no: string
          category: 'video' | 'ui_ux' | 'graphics'
          city: string
          portfolio_url: string
          is_present?: boolean
          whatsapp_opt_in?: boolean | null
          whatsapp_opt_in_at?: string | null
          whatsapp_opt_in_source?: string | null
          whatsapp_opt_out_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          whatsapp_no?: string
          category?: 'video' | 'ui_ux' | 'graphics'
          city?: string
          portfolio_url?: string
          is_present?: boolean
          whatsapp_opt_in?: boolean | null
          whatsapp_opt_in_at?: string | null
          whatsapp_opt_in_source?: string | null
          whatsapp_opt_out_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      tasks: {
        Row: {
          id: string
          category: 'video' | 'ui_ux' | 'graphics'
          title: string
          description: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          category: 'video' | 'ui_ux' | 'graphics'
          title: string
          description: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          category?: 'video' | 'ui_ux' | 'graphics'
          title?: string
          description?: string
          created_at?: string
          updated_at?: string
        }
      }
      submissions: {
        Row: {
          id: string
          participant_id: string
          task_id: string
          drive_link: string
          submitted_at: string
          judge_id: string | null
          preview_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          participant_id: string
          task_id: string
          drive_link: string
          submitted_at?: string
          judge_id?: string | null
          preview_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          participant_id?: string
          task_id?: string
          drive_link?: string
          submitted_at?: string
          judge_id?: string | null
          preview_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      judges: {
        Row: {
          id: string
          name: string
          email: string
          password_hash: string
          assigned_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          email: string
          password_hash: string
          assigned_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          password_hash?: string
          assigned_count?: number
          created_at?: string
          updated_at?: string
        }
      }
      admins: {
        Row: {
          id: string
          email: string
          password_hash: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          password_hash: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          password_hash?: string
          created_at?: string
          updated_at?: string
        }
      }
      winners: {
        Row: {
          id: string
          participant_id: string
          position: number
          category: 'video' | 'ui_ux' | 'graphics'
          announcement_text: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          participant_id: string
          position: number
          category: 'video' | 'ui_ux' | 'graphics'
          announcement_text: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          participant_id?: string
          position?: number
          category?: 'video' | 'ui_ux' | 'graphics'
          announcement_text?: string
          created_at?: string
          updated_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          message: string
          scheduled_time: string
          target_audience: 'all' | 'winners' | 'specific'
          target_ids: string[] | null
          status: 'pending' | 'sent' | 'failed'
          sent_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          message: string
          scheduled_time: string
          target_audience: 'all' | 'winners' | 'specific'
          target_ids?: string[] | null
          status?: 'pending' | 'sent' | 'failed'
          sent_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          message?: string
          scheduled_time?: string
          target_audience?: 'all' | 'winners' | 'specific'
          target_ids?: string[] | null
          status?: 'pending' | 'sent' | 'failed'
          sent_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      event_settings: {
        Row: {
          id: string
          key: string
          value: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          key: string
          value: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          key?: string
          value?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      participant_statistics: {
        Row: {
          category: 'video' | 'ui_ux' | 'graphics'
          total_participants: number
          present_participants: number
        }
      }
      submission_statistics: {
        Row: {
          category: 'video' | 'ui_ux' | 'graphics'
          total_submissions: number
        }
      }
    }
    Functions: {
      increment_judge_count: {
        Args: { judge_id: string }
        Returns: void
      }
      decrement_judge_count: {
        Args: { judge_id: string }
        Returns: void
      }
    }
    Enums: {
      category_enum: 'video' | 'ui_ux' | 'graphics'
      notification_target: 'all' | 'winners' | 'specific'
      notification_status: 'pending' | 'sent' | 'failed'
    }
  }
}

// Helper types
export type Participant = Database['public']['Tables']['participants']['Row']
export type ParticipantInsert = Database['public']['Tables']['participants']['Insert']
export type ParticipantUpdate = Database['public']['Tables']['participants']['Update']

export type Task = Database['public']['Tables']['tasks']['Row']
export type TaskInsert = Database['public']['Tables']['tasks']['Insert']
export type TaskUpdate = Database['public']['Tables']['tasks']['Update']

export type Submission = Database['public']['Tables']['submissions']['Row']
export type SubmissionInsert = Database['public']['Tables']['submissions']['Insert']
export type SubmissionUpdate = Database['public']['Tables']['submissions']['Update']

export type Judge = Database['public']['Tables']['judges']['Row']
export type JudgeInsert = Database['public']['Tables']['judges']['Insert']
export type JudgeUpdate = Database['public']['Tables']['judges']['Update']

export type Admin = Database['public']['Tables']['admins']['Row']
export type AdminInsert = Database['public']['Tables']['admins']['Insert']
export type AdminUpdate = Database['public']['Tables']['admins']['Update']

export type Winner = Database['public']['Tables']['winners']['Row']
export type WinnerInsert = Database['public']['Tables']['winners']['Insert']
export type WinnerUpdate = Database['public']['Tables']['winners']['Update']

export type Notification = Database['public']['Tables']['notifications']['Row']
export type NotificationInsert = Database['public']['Tables']['notifications']['Insert']
export type NotificationUpdate = Database['public']['Tables']['notifications']['Update']

export type EventSetting = Database['public']['Tables']['event_settings']['Row']
export type EventSettingInsert = Database['public']['Tables']['event_settings']['Insert']
export type EventSettingUpdate = Database['public']['Tables']['event_settings']['Update']

export type Category = 'video' | 'ui_ux' | 'graphics'
export type NotificationTarget = 'all' | 'winners' | 'specific'
export type NotificationStatus = 'pending' | 'sent' | 'failed'
