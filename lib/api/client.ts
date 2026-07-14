import axios from 'axios'
import Cookies from 'js-cookie'
import { authCookieOptions } from '@/lib/utils/cookies'

const API_BASE_URL = (() => {
  const rawUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1'
  const trimmedUrl = rawUrl.replace(/\/+$/, '')
  return trimmedUrl.endsWith('/api/v1') ? trimmedUrl : `${trimmedUrl}/api/v1`
})()

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
})

apiClient.interceptors.request.use((config) => {
  const token = Cookies.get('access_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

let isRefreshing = false
let failedQueue: { resolve: (token: string) => void; reject: (err: unknown) => void }[] = []

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config

    if (original.url?.includes('/auth/login/')) {
      return Promise.reject(error)
    }

    if (error.response?.status === 401 && !original._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        }).then((token) => {
          original.headers.Authorization = `Bearer ${token}`
          return apiClient(original)
        })
      }

      original._retry = true
      isRefreshing = true

      try {
        const refresh = Cookies.get('refresh_token')
        if (!refresh) throw new Error('No refresh token available')

        const { data } = await axios.post(`${API_BASE_URL}/refresh/`, { refresh })
        const newToken = data.data.access
        Cookies.set('access_token', newToken, authCookieOptions())
        failedQueue.forEach((p) => p.resolve(newToken))
        failedQueue = []
        original.headers.Authorization = `Bearer ${newToken}`
        return apiClient(original)
      } catch (err) {
        failedQueue.forEach((p) => p.reject(err))
        failedQueue = []
        Cookies.remove('access_token', { path: '/' })
        Cookies.remove('refresh_token', { path: '/' })
        Cookies.remove('active_role', { path: '/' })
        if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
          window.location.href = '/login'
        }
        return Promise.reject(err)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)
