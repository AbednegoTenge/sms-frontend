import { apiClient } from './client'
import type { LoginResponse } from '@/lib/types/user'

export const login = async (school_id: string, password: string, role: string) => {
  const { data } = await apiClient.post<{ data: LoginResponse }>('/auth/login/', {
    school_id,
    password,
    role,
  })
  return data.data
}

export const logout = async (refresh: string) => {
  await apiClient.post('/auth/logout/', { refresh })
}

export const refreshToken = async (refresh: string) => {
  const { data } = await apiClient.post<{ data: { access: string } }>(
    '/auth/refresh/',
    { refresh }
  )
  return data.data.access
}

export const firstLoginReset = async (
  new_password: string,
  confirm_password: string
) => {
  const { data } = await apiClient.post<{ data: { access: string; refresh: string } }>(
    '/auth/first-login-reset/',
    { new_password, confirm_password }
  )
  return data.data
}

export const changePassword = async (
  old_password: string,
  new_password: string,
  confirm_password: string
) => {
  await apiClient.post('/auth/change-password/', {
    old_password,
    new_password,
    confirm_password,
  })
}
