export interface User {
  id: string
  school_id: string
  full_name: string
  email: string | null
  phone: string | null
  roles: string[]
  is_active: boolean
  must_change_password: boolean
  date_joined: string
  profile_photo: string | null
}

export interface LoginResponse {
  access: string
  refresh: string
  force_password_reset: boolean
  active_role: string
  user: Pick<User, 'id' | 'school_id' | 'full_name' | 'roles'>
}

export interface CreateUserInput {
  first_name: string
  last_name: string
  email?: string
  phone?: string
  password: string
  roles: string[]
}

export interface CreateUserResponse {
  id: string
  school_id: string
  full_name: string
  roles: string[]
  must_change_password: boolean
}
