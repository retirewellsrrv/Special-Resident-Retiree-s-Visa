import type { Database } from './supabase'

export type ServicePlan = Database['public']['Tables']['service_plans']['Row']
export type ServicePlanInsert = Database['public']['Tables']['service_plans']['Insert']
export type ServicePlanUpdate = Database['public']['Tables']['service_plans']['Update']
