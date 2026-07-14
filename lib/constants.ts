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
