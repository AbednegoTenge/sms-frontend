import type { User } from './user'

export type RecipientType =
  | 'ALL'
  | 'ALL_STUDENTS'
  | 'ALL_TEACHERS'
  | 'BY_PROGRAM'
  | 'BY_LEVEL'
  | 'PRINCIPAL'
  | 'SPECIFIC_USERS'

export interface Announcement {
  id: string
  title: string
  body: string
  created_by: Pick<User, 'id' | 'full_name' | 'roles'>
  recipient_type: RecipientType
  is_published: boolean
  published_at: string | null
  created_at: string
  is_read: boolean
}
