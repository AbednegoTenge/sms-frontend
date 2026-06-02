export const PAYMENT_STATUS_COLORS = {
  NOT_PAID:       'bg-red-100 text-red-800',
  PARTIALLY_PAID: 'bg-yellow-100 text-yellow-800',
  FULLY_PAID:     'bg-green-100 text-green-800',
  OVERDUE:        'bg-red-900 text-red-100',
}

export const STUDENT_STATUS_COLORS = {
  ACTIVE:    'bg-green-100 text-green-800',
  INACTIVE:  'bg-gray-100 text-gray-800',
  GRADUATED: 'bg-blue-100 text-blue-800',
  SUSPENDED: 'bg-red-100 text-red-800',
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

export const ROLES = {
  ADMIN:       'ADMIN',
  SUPER_ADMIN: 'SUPER_ADMIN',
  STUDENT:     'STUDENT',
  TEACHER:     'TEACHER',
  PRINCIPAL:   'PRINCIPAL',
  IT_SUPPORT:  'IT_SUPPORT',
} as const

export const ROLE_LABELS: Record<string, string> = {
  ADMIN:       'Admin',
  SUPER_ADMIN: 'Super Admin',
  STUDENT:     'Student',
  TEACHER:     'Teacher',
  PRINCIPAL:   'Principal',
  IT_SUPPORT:  'IT Support',
}

export const PORTAL_MAP: Record<string, string> = {
  ADMIN:       '/admin/dashboard',
  SUPER_ADMIN: '/admin/dashboard',
  STUDENT:     '/student/dashboard',
  TEACHER:     '/teacher/dashboard',
  PRINCIPAL:   '/principal/dashboard',
  IT_SUPPORT:  '/it-support/dashboard',
}

export const SCHOOL_ID_ROLE_PREFIXES: Record<string, string> = {
  STD: 'STUDENT',
  TCH: 'TEACHER',
  PRI: 'PRINCIPAL',
  ADM: 'ADMIN',
  SAD: 'SUPER_ADMIN',
  ITS: 'IT_SUPPORT',
}

export function inferRoleFromSchoolId(schoolId: string) {
  const normalized = schoolId.trim().toUpperCase()
  const match = Object.entries(SCHOOL_ID_ROLE_PREFIXES).find(([prefix]) =>
    normalized.startsWith(prefix)
  )
  return match?.[1] ?? ''
}
