import { AxiosError } from 'axios'
import { toast } from 'sonner'

export function handleApiError(error: unknown): void {
  if (error instanceof AxiosError) {
    const data = error.response?.data
    if (data?.message) {
      toast.error(data.message)
    } else if (error.response?.status === 403) {
      toast.error('You do not have permission to perform this action.')
    } else if (error.response?.status === 429) {
      toast.error('Too many requests. Please wait a moment.')
    } else {
      toast.error('Something went wrong. Please try again.')
    }
  }
}

export function extractFieldErrors(error: unknown): Record<string, string> {
  if (error instanceof AxiosError) {
    const errors = error.response?.data?.errors || {}
    return Object.fromEntries(
      Object.entries(errors).map(([key, val]) => [
        key,
        Array.isArray(val) ? val[0] : String(val),
      ])
    )
  }
  return {}
}
