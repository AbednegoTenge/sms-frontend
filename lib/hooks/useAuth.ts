'use client'

import { useMutation } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import Cookies from 'js-cookie'
import { login, logout, firstLoginReset } from '@/lib/api/auth'
import { useAuthStore } from '@/lib/store/authStore'
import { handleApiError } from '@/lib/utils/errorHandler'
import { toast } from 'sonner'
import { PORTAL_MAP } from '@/lib/constants'

export function useLogin() {
  const router = useRouter()
  const setUser = useAuthStore((s) => s.setUser)

  return useMutation({
    mutationFn: ({
      school_id,
      password,
      role,
    }: {
      school_id: string
      password: string
      role: string
    }) => login(school_id, password, role),
    onSuccess: (data) => {
      Cookies.set('access_token', data.access, { secure: true, sameSite: 'strict' })
      Cookies.set('refresh_token', data.refresh, { secure: true, sameSite: 'strict' })
      Cookies.set('active_role', data.active_role, { secure: true, sameSite: 'strict' })
      setUser({
        ...data.user,
        active_role: data.active_role,
        must_change_password: data.force_password_reset,
      })

      if (data.force_password_reset) {
        router.push('/reset-password')
        return
      }

      router.push(PORTAL_MAP[data.active_role] ?? '/')
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
      Cookies.remove('access_token')
      Cookies.remove('refresh_token')
      Cookies.remove('active_role')
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
    }) => firstLoginReset(new_password, confirm_password),
    onSuccess: (data) => {
      Cookies.set('access_token', data.access, { secure: true, sameSite: 'strict' })
      Cookies.set('refresh_token', data.refresh, { secure: true, sameSite: 'strict' })
      toast.success('Password updated. Welcome!')
      router.push('/login')
    },
    onError: handleApiError,
  })
}
