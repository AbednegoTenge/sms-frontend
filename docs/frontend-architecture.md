# Frontend Architecture — School Management System

## Overview

Next.js 14 App Router with route groups for each portal. Each portal is a
completely isolated layout with its own sidebar, navigation, and permission
context. Route protection happens at the middleware level — not client-side.

---

## Route Group Architecture

```
app/
  (auth)/           → public routes, no layout wrapper
  (admin)/          → AdminLayout: admin sidebar + topbar
  (student)/        → StudentLayout: student sidebar + topbar
  (teacher)/        → TeacherLayout: teacher sidebar + topbar
  (principal)/      → PrincipalLayout: principal sidebar + topbar
  (it-support)/     → ITSupportLayout: IT support sidebar + topbar
```

Each route group has its own `layout.tsx` that:

* Renders the correct sidebar for that role
* Wraps content in the portal's permission context
* Shows the user's name and school_id in the topbar

---

## Middleware — Route Protection

```
middleware.ts runs on every request before the page renders.

Flow:
1. Read access token from cookie
2. If no token and not on public route → redirect to /
3. Decode JWT (without verifying — verification is backend's job)
4. Extract active_role and must_change_password from JWT claims
5. If must_change_password=true → redirect to /reset-password
   (unless already on /reset-password)
6. Check if current path matches active_role:
   - /admin/*      → requires active_role: ADMIN or SUPER_ADMIN
   - /student/*    → requires active_role: STUDENT
   - /teacher/*    → requires active_role: TEACHER
   - /principal/*  → requires active_role: PRINCIPAL
   - /it-support/* → requires active_role: IT_SUPPORT
7. If active_role mismatch → redirect to / (role selection)
```

```typescript
// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { decodeJWT } from '@/lib/utils/jwt'

const PORTAL_ROLES: Record<string, string[]> = {
  '/admin':      ['ADMIN', 'SUPER_ADMIN'],
  '/student':    ['STUDENT'],
  '/teacher':    ['TEACHER'],
  '/principal':  ['PRINCIPAL'],
  '/it-support': ['IT_SUPPORT'],
}

const PUBLIC_ROUTES = ['/', '/login', '/reset-password']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get('access_token')?.value

  if (PUBLIC_ROUTES.some(r => pathname === r || pathname.startsWith(r + '?'))) {
    return NextResponse.next()
  }

  if (!token) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  const payload = decodeJWT(token)
  if (!payload) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  if (payload.must_change_password && pathname !== '/reset-password') {
    return NextResponse.redirect(new URL('/reset-password', request.url))
  }

  // active_role determines which portal the user entered
  const activeRole: string = payload.active_role || ''

  for (const [route, allowedRoles] of Object.entries(PORTAL_ROLES)) {
    if (pathname.startsWith(route)) {
      if (!allowedRoles.includes(activeRole)) {
        return NextResponse.redirect(new URL('/', request.url))
      }
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
```

---

## Axios Instance + Interceptors

```typescript
// lib/api/client.ts
import axios from 'axios'
import Cookies from 'js-cookie'

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
})

// Request interceptor — attach access token
apiClient.interceptors.request.use((config) => {
  const token = Cookies.get('access_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Response interceptor — auto-refresh on 401
let isRefreshing = false
let failedQueue: any[] = []

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config

    if (error.response?.status === 401 && !original._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        }).then(token => {
          original.headers.Authorization = `Bearer ${token}`
          return apiClient(original)
        })
      }

      original._retry = true
      isRefreshing = true

      try {
        const refresh = Cookies.get('refresh_token')
        const { data } = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh/`,
          { refresh }
        )
        const newToken = data.data.access
        Cookies.set('access_token', newToken)
        failedQueue.forEach(p => p.resolve(newToken))
        failedQueue = []
        original.headers.Authorization = `Bearer ${newToken}`
        return apiClient(original)
      } catch {
        failedQueue.forEach(p => p.reject(error))
        failedQueue = []
        Cookies.remove('access_token')
        Cookies.remove('refresh_token')
        window.location.href = '/login'
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)
```

---

## React Query Setup

```typescript
// app/providers.tsx
'use client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useState } from 'react'

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,       // 1 min before refetch
        retry: 1,
        refetchOnWindowFocus: false,
      },
    },
  }))

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}
```

---

## Auth State (Zustand)

```typescript
// lib/store/authStore.ts
import { create } from 'zustand'

interface User {
  id: string
  school_id: string
  full_name: string
  roles: string[]
  must_change_password: boolean
}

interface AuthStore {
  user: User | null
  setUser: (user: User) => void
  clearUser: () => void
  hasRole: (role: string) => boolean
  hasAnyRole: (roles: string[]) => boolean
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  setUser: (user) => set({ user }),
  clearUser: () => set({ user: null }),
  hasRole: (role) => get().user?.roles.includes(role) ?? false,
  hasAnyRole: (roles) => roles.some(r => get().user?.roles.includes(r)) ?? false,
}))
```

---

## Portal Layouts

Each portal layout follows the same pattern:

```
┌─────────────────────────────────────────┐
│  Topbar: Logo | Page title | User menu  │
├──────────────┬──────────────────────────┤
│              │                          │
│   Sidebar    │      Page Content        │
│   (nav       │                          │
│    links)    │                          │
│              │                          │
└──────────────┴──────────────────────────┘
```

```typescript
// app/(admin)/layout.tsx
import { AdminSidebar } from '@/components/admin/AdminSidebar'
import { Topbar } from '@/components/shared/Topbar'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
```

---

## Sidebar Navigation per Portal

### Admin Sidebar

```
Dashboard
Students
  ├── All Students
  ├── Enroll Student
  └── Programs
Teachers
Courses
Schedules
  ├── Timetable
  ├── Exam Schedule
  └── Holidays
Fees
  ├── Fee Structures
  ├── Student Fees
  └── Payments
Announcements
Reports
  ├── Academic Performance
  ├── Fee Collection
  └── Teacher Evaluations
```

### Student Sidebar

```
Dashboard
My Courses
  └── [Course Name]
      ├── Overview
      ├── Resources
      ├── Course Outline
      ├── Quizzes
      └── Assignments
My Fees
Announcements
```

### Teacher Sidebar

```
Dashboard
My Courses
  └── [Course Name]
      ├── Students
      ├── Resources
      ├── Course Outline
      ├── Quizzes
      └── Assignments
Evaluations
Announcements
```

### Principal Sidebar

```
Dashboard
Reports
  ├── Academic Performance
  ├── Fee Collection
  └── Teacher Evaluations
Announcements
```

### IT Support Sidebar

```
Dashboard
Support Tickets
User Management
  └── Reset Password
Announcements
```

---

## Error Handling Pattern

All API errors are handled consistently:

```typescript
// lib/utils/errorHandler.ts
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

// Field-level errors from DRF (errors: { field: [msg, ...] })
export function extractFieldErrors(
  error: unknown
): Record<string, string> {
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
```

---

## Server-Side Pagination Pattern

All list pages use server-side pagination:

```typescript
// Standard paginated query hook
export function useStudents(params: StudentFilters) {
  return useQuery({
    queryKey: ['students', params],
    queryFn: () => getStudents(params),
    placeholderData: keepPreviousData,
  })
}

// In the component:
const [page, setPage] = useState(1)
const { data, isLoading } = useStudents({ page, page_size: 20, ...filters })

// TanStack Table handles display
// Pagination controls call setPage()
```

---

## Form Pattern (React Hook Form + Zod)

```typescript
// Always define Zod schema first
const createStudentSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name:  z.string().min(1, 'Last name is required'),
  email:      z.string().email('Invalid email').optional(),
  password:   z.string().min(8, 'Password must be at least 8 characters'),
  roles:      z.array(z.string()).min(1, 'At least one role required'),
})

type CreateStudentInput = z.infer<typeof createStudentSchema>

// In component:
const form = useForm<CreateStudentInput>({
  resolver: zodResolver(createStudentSchema),
})

const mutation = useMutation({
  mutationFn: createUser,
  onSuccess: () => {
    toast.success('Student created successfully.')
    queryClient.invalidateQueries({ queryKey: ['students'] })
    form.reset()
  },
  onError: (error) => {
    const fieldErrors = extractFieldErrors(error)
    Object.entries(fieldErrors).forEach(([field, message]) => {
      form.setError(field as any, { message })
    })
    handleApiError(error)
  },
})
```

---

## Status Badge Color Map

```typescript
// lib/constants.ts
export const PAYMENT_STATUS_COLORS = {
  NOT_PAID:       'bg-red-100 text-red-800',
  PARTIALLY_PAID: 'bg-yellow-100 text-yellow-800',
  FULLY_PAID:     'bg-green-100 text-green-800',
  OVERDUE:        'bg-red-900 text-red-100',
}

export const STUDENT_STATUS_COLORS = {
  ACTIVE:     'bg-green-100 text-green-800',
  INACTIVE:   'bg-gray-100 text-gray-800',
  GRADUATED:  'bg-blue-100 text-blue-800',
  SUSPENDED:  'bg-red-100 text-red-800',
}

export const QUIZ_STATUS_COLORS = {
  DRAFT:  'bg-gray-100 text-gray-800',
  OPEN:   'bg-green-100 text-green-800',
  CLOSED: 'bg-red-100 text-red-800',
}

export const TICKET_PRIORITY_COLORS = {
  LOW:      'bg-gray-100 text-gray-800',
  MEDIUM:   'bg-yellow-100 text-yellow-800',
  HIGH:     'bg-orange-100 text-orange-800',
  CRITICAL: 'bg-red-100 text-red-800',
}
```
