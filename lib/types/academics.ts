import type { User } from './user'

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
