import { apiClient } from './client'
import type { User, CreateUserInput, CreateUserResponse } from '@/lib/types/user'
import type { PaginatedResponse } from '@/lib/types/common'

export const getUsers = async (params?: Record<string, string>) => {
  const { data } = await apiClient.get<{ data: PaginatedResponse<User> }>(
    '/users/', { params }
  )
  return data.data
}

export const createUser = async (input: CreateUserInput) => {
  const { data } = await apiClient.post<{ data: CreateUserResponse }>('/users/', input)
  return data.data
}

export const updateUser = async (id: string, input: Partial<CreateUserInput>) => {
  const { data } = await apiClient.patch<{ data: User }>(`/users/${id}/`, input)
  return data.data
}

export const deactivateUser = async (id: string) => {
  await apiClient.delete(`/users/${id}/`)
}

export const assignRole = async (id: string, role: string) => {
  await apiClient.post(`/users/${id}/assign-role/`, { role })
}
