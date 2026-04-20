# Frontend API Integration — School Management System

## TypeScript Types (lib/types/)

### user.ts

```typescript
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
  active_role: string        // the role the user logged in under
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
```

### academics.ts

```typescript
export interface AcademicYear {
  id: string
  name: string
  start_date: string
  end_date: string
  is_current: boolean
}

export interface Term {
  id: string
  academic_year: AcademicYear
  term_number: 1 | 2 | 3
  start_date: string
  end_date: string
  is_current: boolean
}

export interface Level {
  id: string
  number: 1 | 2 | 3
  name: string
}

export interface Program {
  id: string
  name: string
  code: string
}

export interface Course {
  id: string
  name: string
  code: string
  course_type: 'CORE' | 'ELECTIVE'
  program: Program | null
  is_active: boolean
}

export interface TeacherCourseAssignment {
  id: string
  teacher: User
  course: Course
  term: Term
  level: Level
  is_active: boolean
}

export interface WeeklyTopic {
  week_number: number
  title: string
  description: string
}

export interface CourseOutline {
  id: string
  assignment: TeacherCourseAssignment
  weekly_topics: WeeklyTopic[]
}
```

### enrollment.ts

```typescript
export interface StudentProfile {
  id: string
  school_id: string
  full_name: string
  level: Level
  program: Program | null
  class_section: string | null
  status: 'ACTIVE' | 'INACTIVE' | 'GRADUATED' | 'SUSPENDED'
  enrolled_date: string
  must_change_password: boolean
}

export interface Enrollment {
  id: string
  course: Course
  term: Term
  level: Level
  enrollment_type: 'CORE' | 'ELECTIVE'
  enrolled_at: string
}
```

### assessments.ts

```typescript
export type QuestionType =
  | 'MULTIPLE_CHOICE'
  | 'MULTIPLE_ANSWER'
  | 'TRUE_FALSE'
  | 'SHORT_ANSWER'

export interface QuestionChoice {
  id: string
  text: string
  is_correct?: boolean  // only visible to teacher/admin
}

export interface Question {
  id: string
  question_text: string
  question_type: QuestionType
  marks: number
  order: number
  choices: QuestionChoice[]
}

export interface Quiz {
  id: string
  title: string
  instructions: string | null
  max_attempts: number
  due_datetime: string
  status: 'DRAFT' | 'OPEN' | 'CLOSED'
  total_marks: number
  questions: Question[]
}

export interface QuizAttempt {
  id: string
  quiz: string
  attempt_number: number
  started_at: string
  submitted_at: string | null
  score: number | null
  status: 'IN_PROGRESS' | 'SUBMITTED' | 'GRADED'
}

export interface Assignment {
  id: string
  title: string
  description: string
  due_datetime: string
  submission_type: 'DOCUMENT' | 'TEXT' | 'BOTH'
  max_marks: number
  status: 'DRAFT' | 'OPEN' | 'CLOSED'
}

export interface AssignmentSubmission {
  id: string
  assignment: string
  submitted_at: string
  text_content: string | null
  file_url: string | null
  marks_obtained: number | null
  feedback: string | null
  status: 'SUBMITTED' | 'GRADED' | 'LATE'
}

export interface Resource {
  id: string
  title: string
  resource_type: 'VIDEO_LINK' | 'PDF' | 'PRESENTATION' | 'OTHER'
  url: string | null
  file_url: string | null
  uploaded_at: string
}

export interface TeacherEvaluation {
  id: string
  rating: 1 | 2 | 3 | 4 | 5
  comment: string | null
  submitted_at: string
}
```

### fees.ts

```typescript
export type PaymentStatus = 'NOT_PAID' | 'PARTIALLY_PAID' | 'FULLY_PAID' | 'OVERDUE'

export interface StudentFee {
  id: string
  student: Pick<User, 'id' | 'school_id' | 'full_name'>
  term: Term
  base_amount: string
  additional_amount: string
  total_amount: string
  amount_paid: string
  payment_status: PaymentStatus
  generated_at: string
}

export interface Payment {
  id: string
  amount: string
  payment_method: 'CASH' | 'BANK_TRANSFER' | 'MOBILE_MONEY' | 'OTHER'
  reference: string | null
  recorded_by: Pick<User, 'id' | 'full_name'>
  paid_at: string
  notes: string | null
}

export interface FeeStructure {
  id: string
  level: Level
  program: Program | null
  base_amount: string
  description: string
  effective_from: string
  is_active: boolean
}
```

### announcements.ts

```typescript
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
  is_read: boolean  // annotated per requesting user
}
```

---

## API Functions (lib/api/)

### auth.ts

```typescript
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
  const { data } = await apiClient.post('/auth/first-login-reset/', {
    new_password,
    confirm_password,
  })
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
```

### users.ts

```typescript
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
  const { data } = await apiClient.post<{ data: CreateUserResponse }>(
    '/users/', input
  )
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
```

---

## React Query Hooks (lib/hooks/)

### useAuth.ts

```typescript
import { useMutation } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import Cookies from 'js-cookie'
import { login, logout, firstLoginReset } from '@/lib/api/auth'
import { useAuthStore } from '@/lib/store/authStore'
import { handleApiError } from '@/lib/utils/errorHandler'
import { toast } from 'sonner'

export function useLogin() {
  const router = useRouter()
  const setUser = useAuthStore(s => s.setUser)

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
      setUser({ ...data.user, active_role: data.active_role } as any)

      if (data.force_password_reset) {
        router.push('/reset-password')
        return
      }

      // Route directly to portal based on active_role (the role they logged in under)
      const portalMap: Record<string, string> = {
        ADMIN:       '/admin/dashboard',
        SUPER_ADMIN: '/admin/dashboard',
        STUDENT:     '/student/dashboard',
        TEACHER:     '/teacher/dashboard',
        PRINCIPAL:   '/principal/dashboard',
        IT_SUPPORT:  '/it-support/dashboard',
      }
      router.push(portalMap[data.active_role] ?? '/')
    },
    onError: handleApiError,
  })
}

export function useLogout() {
  const router = useRouter()
  const clearUser = useAuthStore(s => s.clearUser)

  return useMutation({
    mutationFn: () => logout(Cookies.get('refresh_token') ?? ''),
    onSettled: () => {
      Cookies.remove('access_token')
      Cookies.remove('refresh_token')
      clearUser()
      router.push('/login')
    },
  })
}

export function useFirstLoginReset() {
  const router = useRouter()

  return useMutation({
    mutationFn: ({ new_password, confirm_password }: {
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
```

### useStudents.ts

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getStudents, createStudent, assignProgram, enrollElectives } from '@/lib/api/students'
import { handleApiError } from '@/lib/utils/errorHandler'
import { toast } from 'sonner'

export function useStudents(params?: Record<string, string>) {
  return useQuery({
    queryKey: ['students', params],
    queryFn: () => getStudents(params),
  })
}

export function useCreateStudent() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createStudent,
    onSuccess: (data) => {
      toast.success(`Student ${data.school_id} created successfully.`)
      queryClient.invalidateQueries({ queryKey: ['students'] })
    },
    onError: handleApiError,
  })
}

export function useAssignProgram(studentId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (program_id: string) => assignProgram(studentId, program_id),
    onSuccess: () => {
      toast.success('Program assigned. Core courses enrolled automatically.')
      queryClient.invalidateQueries({ queryKey: ['students', studentId] })
    },
    onError: handleApiError,
  })
}

export function useEnrollElectives(studentId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (course_ids: string[]) => enrollElectives(studentId, course_ids),
    onSuccess: () => {
      toast.success('Enrolled in 4 elective courses.')
      queryClient.invalidateQueries({ queryKey: ['students', studentId] })
    },
    onError: handleApiError,
  })
}
```

---

## Common Types (lib/types/common.ts)

```typescript
export interface PaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

export interface ApiResponse<T> {
  success: boolean
  data: T
  message: string
}

export interface ApiError {
  success: false
  data: null
  message: string
  errors: Record<string, string[]>
}

export type SortOrder = 'asc' | 'desc'

export interface TableParams {
  page: number
  page_size: number
  search?: string
  ordering?: string
}
```

---

## Formatters (lib/utils/formatters.ts)

```typescript
// Date formatting
export const formatDate = (date: string) =>
  new Intl.DateTimeFormat('en-GH', {
    day: 'numeric', month: 'short', year: 'numeric'
  }).format(new Date(date))

export const formatDateTime = (date: string) =>
  new Intl.DateTimeFormat('en-GH', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  }).format(new Date(date))

// Currency — Ghana Cedis
export const formatCurrency = (amount: string | number) =>
  new Intl.NumberFormat('en-GH', {
    style: 'currency', currency: 'GHS'
  }).format(Number(amount))

// Relative time
export const formatRelative = (date: string) => {
  const diff = Date.now() - new Date(date).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  return formatDate(date)
}

// Due date with urgency
export const getDueDateStatus = (due: string) => {
  const now = new Date()
  const dueDate = new Date(due)
  const diffHours = (dueDate.getTime() - now.getTime()) / 3600000
  if (diffHours < 0)   return { label: 'Overdue', color: 'text-red-600' }
  if (diffHours < 24)  return { label: 'Due today', color: 'text-orange-600' }
  if (diffHours < 72)  return { label: 'Due soon', color: 'text-yellow-600' }
  return { label: formatDateTime(due), color: 'text-gray-600' }
}
```
