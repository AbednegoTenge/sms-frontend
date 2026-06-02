import { apiClient } from './client'
import type { LoginResponse } from '@/lib/types/user'

export const login = async (school_id: string, password: string, role: string) => {
  const { data } = await apiClient.post<{ data: LoginResponse }>('/login/', {
    school_id,
    password,
    role,
  })
  return data.data
}

export const logout = async (refresh: string) => {
  await apiClient.post('/logout/', { refresh })
}

export const refreshToken = async (refresh: string) => {
  const { data } = await apiClient.post<{ data: { access: string } }>(
    '/refresh/',
    { refresh }
  )
  return data.data.access
}

export const firstLoginReset = async (
  new_password: string,
  confirm_password: string,
  refresh?: string
) => {
  const { data } = await apiClient.post<{ data: { access: string; refresh: string } }>(
    '/first-login-reset/',
    { new_password, new_password_confirm: confirm_password, refresh }
  )
  return data.data
}

export const changePassword = async (
  old_password: string,
  new_password: string,
  confirm_password: string
) => {
  await apiClient.post('/change-password/', {
    old_password,
    new_password,
    confirm_password,
  })
}
