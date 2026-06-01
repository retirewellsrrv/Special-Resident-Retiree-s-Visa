export type Service = {
  id: number
  type: 'basic' | 'premium' | 'vip'
  price: number
  description: string | null
  is_available: boolean
}