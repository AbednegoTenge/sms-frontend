'use client'

import { useMutation } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import Cookies from 'js-cookie'
import { login, logout, firstLoginReset } from '@/lib/api/auth'
import { useAuthStore } from '@/lib/store/authStore'
import { handleApiError } from '@/lib/utils/errorHandler'
import { authCookieOptions } from '@/lib/utils/cookies'
import { toast } from 'sonner'
import { inferRoleFromSchoolId, PORTAL_MAP } from '@/lib/constants'

const normalizeRole = (role: string) => role.trim().toUpperCase()

export function useLogin() {
  const router = useRouter()
  const setUser = useAuthStore((s) => s.setUser)

  return useMutation({
    mutationFn: ({
      school_id,
      password,
      selected_role,
    }: {
      school_id: string
      password: string
      selected_role: string
    }) => login(school_id, password, selected_role),
    onSuccess: (data, variables) => {
      const user = data.user
      const roles = (user?.roles ?? data.roles ?? []).map(normalizeRole)
      const selectedRole = normalizeRole(variables.selected_role)
      const serverRole = normalizeRole(data.active_role || '')
      const schoolId = user?.school_id || variables.school_id
      const inferredRole = inferRoleFromSchoolId(schoolId)
      const activeRole =
        (serverRole && roles.includes(serverRole) && serverRole) ||
        (selectedRole && roles.includes(selectedRole) && selectedRole) ||
        (inferredRole && roles.includes(inferredRole) && inferredRole) ||
        roles[0] ||
        ''

      Cookies.set('access_token', data.access, authCookieOptions())
      Cookies.set('refresh_token', data.refresh, authCookieOptions())
      Cookies.set('active_role', activeRole, authCookieOptions())
      setUser({
        id: user?.id ?? '',
        school_id: schoolId,
        full_name: user?.full_name ?? '',
        roles,
        active_role: activeRole,
        must_change_password: data.force_password_reset,
      })

      if (data.force_password_reset) {
        router.push('/reset-password')
        return
      }

      router.push(PORTAL_MAP[activeRole] ?? '/')
    },
    onError: handleApiError,
  })
}

export function useLogout() {
  const router = useRouter()
  const clearUser = useAuthStore((s) => s.clearUser)

  return useMutation({
    mutationFn: () => logout(Cookies.get('refresh_token') ?? ''),
    onSettled: () => {
      Cookies.remove('access_token', { path: '/' })
      Cookies.remove('refresh_token', { path: '/' })
      Cookies.remove('active_role', { path: '/' })
      clearUser()
      router.push('/')
    },
  })
}

export function useFirstLoginReset() {
  const router = useRouter()

  return useMutation({
    mutationFn: ({
      new_password,
      confirm_password,
    }: {
      new_password: string
      confirm_password: string
    }) => firstLoginReset(new_password, confirm_password, Cookies.get('refresh_token')),
    onSuccess: (data) => {
      Cookies.set('access_token', data.access, authCookieOptions())
      Cookies.set('refresh_token', data.refresh, authCookieOptions())
      toast.success('Password updated. Welcome!')
      const activeRole = Cookies.get('active_role') ?? ''
      router.push(PORTAL_MAP[activeRole] ?? '/')
    },
    onError: handleApiError,
  })
}
