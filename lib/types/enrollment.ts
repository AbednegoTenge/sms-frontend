import type { Level, Program, Course, Term } from './academics'

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
