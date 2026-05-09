import type { User } from './user'
import type { Term, Level, Program } from './academics'

export type PaymentStatus = 'NOT_PAID' | 'PARTIALLY_PAID' | 'FULLY_PAID' | 'OVERDUE'

export interface StudentFee {
  id: string
  student: Pick<User, 'id' | 'school_id' | 'full_name'>
  term: Term
  base_amount: string
  additional_amount: string
  total_amount: string
  amount_paid: string
  payment_status: PaymentStatus
  generated_at: string
}

export interface Payment {
  id: string
  amount: string
  payment_method: 'CASH' | 'BANK_TRANSFER' | 'MOBILE_MONEY' | 'OTHER'
  reference: string | null
  recorded_by: Pick<User, 'id' | 'full_name'>
  paid_at: string
  notes: string | null
}

export interface FeeStructure {
  id: string
  level: Level
  program: Program | null
  base_amount: string
  description: string
  effective_from: string
  is_active: boolean
}
