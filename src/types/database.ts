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
      products: {
        Row: {
          id: string
          name: string
          description: string
          image_url: string
          price: number
          category: string
          features: Json
          available: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description: string
          image_url: string
          price: number
          category?: string
          features?: Json
          available?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string
          image_url?: string
          price?: number
          category?: string
          features?: Json
          available?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      customers: {
        Row: {
          id: string
          name: string
          email: string
          phone: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          email: string
          phone: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          phone?: string
          created_at?: string
        }
      }
      bookings: {
        Row: {
          id: string
          customer_id: string
          product_id: string
          event_date: string
          event_time: string
          duration: number
          address: string
          event_type: string
          guests_count: number | null
          special_requests: string | null
          total_price: number
          status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
          deposit_paid: boolean
          full_payment_paid: boolean
          deposit_amount: number
          paid_amount: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          customer_id: string
          product_id: string
          event_date: string
          event_time: string
          duration?: number
          address: string
          event_type: string
          guests_count?: number | null
          special_requests?: string | null
          total_price: number
          status?: 'pending' | 'confirmed' | 'cancelled' | 'completed'
          deposit_paid?: boolean
          full_payment_paid?: boolean
          deposit_amount?: number
          paid_amount?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          customer_id?: string
          product_id?: string
          event_date?: string
          event_time?: string
          duration?: number
          address?: string
          event_type?: string
          guests_count?: number | null
          special_requests?: string | null
          total_price?: number
          status?: 'pending' | 'confirmed' | 'cancelled' | 'completed'
          deposit_paid?: boolean
          full_payment_paid?: boolean
          deposit_amount?: number
          paid_amount?: number
          created_at?: string
          updated_at?: string
        }
      }
      gallery: {
        Row: {
          id: string
          image_url: string
          caption: string
          is_public: boolean
          created_at: string
        }
        Insert: {
          id?: string
          image_url: string
          caption: string
          is_public?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          image_url?: string
          caption?: string
          is_public?: boolean
          created_at?: string
        }
      }
      gallery_tags: {
        Row: {
          id: string
          name: string
          color: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          color?: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          color?: string
          created_at?: string
        }
      }
      gallery_image_tags: {
        Row: {
          id: string
          image_id: string
          tag_id: string
          created_at: string
        }
        Insert: {
          id?: string
          image_id: string
          tag_id: string
          created_at?: string
        }
        Update: {
          id?: string
          image_id?: string
          tag_id?: string
          created_at?: string
        }
      }
      contact_messages: {
        Row: {
          id: string
          name: string
          email: string
          phone: string | null
          message: string
          status: 'new' | 'read' | 'replied'
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          email: string
          phone?: string | null
          message: string
          status?: 'new' | 'read' | 'replied'
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          phone?: string | null
          message?: string
          status?: 'new' | 'read' | 'replied'
          created_at?: string
        }
      }
      availability_blocks: {
        Row: {
          id: string
          product_id: string | null
          block_date: string
          reason: string | null
          created_at: string
        }
        Insert: {
          id?: string
          product_id?: string | null
          block_date: string
          reason?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          product_id?: string | null
          block_date?: string
          reason?: string | null
          created_at?: string
        }
      }
      user_profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          role: 'admin' | 'staff'
          created_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          role?: 'admin' | 'staff'
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          role?: 'admin' | 'staff'
          created_at?: string
        }
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
  }
}
