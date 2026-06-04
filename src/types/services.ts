import type { Database } from './supabase'

export type Service = Database['public']['Tables']['services']['Row']
