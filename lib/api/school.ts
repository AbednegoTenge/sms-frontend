import { apiClient } from './client'
import type { PaginatedResponse } from '@/lib/types/common'
import type { StudentProfile, Enrollment } from '@/lib/types/enrollment'
import type {
  AcademicYear,
  Term,
  Level,
  Program,
  Course,
  TeacherCourseAssignment,
  CourseOutline,
  WeeklyTopic,
} from '@/lib/types/academics'
import type {
  Quiz,
  QuizAttempt,
  Assignment,
  AssignmentSubmission,
  Resource,
  TeacherEvaluation,
} from '@/lib/types/assessments'
import type { StudentFee, Payment, FeeStructure } from '@/lib/types/fees'
import type { Announcement } from '@/lib/types/announcements'

type Params = Record<string, string | number | boolean | undefined | null>
type Json = Record<string, unknown>

const unwrap = <T>(response: { data: { data: T } }) => response.data.data

// Compact shape returned by GET /students/{id}/dashboard/ — assignments are
// pre-filtered to OPEN ones and carry only what the dashboard widgets need,
// not the full course-assignment record shape used elsewhere.
export interface StudentDashboardAssignment {
  id: string
  course_name: string
  title: string
  due_datetime: string
  max_marks: number
  status: string
  score: number | null
  submission_status: string | null
}

export interface StudentDashboardData {
  enrolled_courses: Enrollment[]
  assignments: StudentDashboardAssignment[]
  announcements: Announcement[]
}

export const studentsApi = {
  list: async (params?: Params) => unwrap<PaginatedResponse<StudentProfile>>(await apiClient.get('/students/', { params })),
  detail: async (id: string) => unwrap<StudentProfile>(await apiClient.get(`/students/${id}/`)),
  update: async (id: string, input: Json) => unwrap<StudentProfile>(await apiClient.patch(`/students/${id}/`, input)),
  assignProgram: async (id: string, program_id: string) => unwrap<StudentProfile>(await apiClient.post(`/students/${id}/assign-program/`, { program_id })),
  enrollElectives: async (id: string, course_ids: string[]) => unwrap<StudentProfile>(await apiClient.post(`/students/${id}/enroll-electives/`, { course_ids })),
  courses: async (id: string) => unwrap<PaginatedResponse<Enrollment>>(await apiClient.get(`/students/${id}/courses/`)),
  fees: async (id: string) => unwrap<PaginatedResponse<StudentFee>>(await apiClient.get(`/students/${id}/fees/`)),
  dashboard: async (id: string) => unwrap<StudentDashboardData>(await apiClient.get(`/students/${id}/dashboard/`)),
}

export const academicsApi = {
  academicYears: async (params?: Params) => unwrap<PaginatedResponse<AcademicYear>>(await apiClient.get('/academic-years/', { params })),
  createAcademicYear: async (input: Json) => unwrap<AcademicYear>(await apiClient.post('/academic-years/', input)),
  academicYear: async (id: string) => unwrap<AcademicYear>(await apiClient.get(`/academic-years/${id}/`)),
  updateAcademicYear: async (id: string, input: Json) => unwrap<AcademicYear>(await apiClient.patch(`/academic-years/${id}/`, input)),
  deleteAcademicYear: async (id: string) => unwrap<void>(await apiClient.delete(`/academic-years/${id}/`)),
  terms: async (params?: Params) => unwrap<PaginatedResponse<Term>>(await apiClient.get('/terms/', { params })),
  createTerm: async (input: Json) => unwrap<Term>(await apiClient.post('/terms/', input)),
  term: async (id: string) => unwrap<Term>(await apiClient.get(`/terms/${id}/`)),
  updateTerm: async (id: string, input: Json) => unwrap<Term>(await apiClient.patch(`/terms/${id}/`, input)),
  deleteTerm: async (id: string) => unwrap<void>(await apiClient.delete(`/terms/${id}/`)),
  transitionTerm: async (term_id: string) => unwrap<Term>(await apiClient.post('/terms/transition/', { term_id })),
  levels: async (params?: Params) => unwrap<PaginatedResponse<Level>>(await apiClient.get('/levels/', { params })),
  level: async (id: string) => unwrap<Level>(await apiClient.get(`/levels/${id}/`)),
  programs: async (params?: Params) => unwrap<PaginatedResponse<Program>>(await apiClient.get('/programs/', { params })),
  program: async (id: string) => unwrap<Program>(await apiClient.get(`/programs/${id}/`)),
  assignments: async (params?: Params) => unwrap<PaginatedResponse<TeacherCourseAssignment>>(await apiClient.get('/assignments/', { params })),
  createAssignment: async (input: Json) => unwrap<TeacherCourseAssignment>(await apiClient.post('/assignments/', input)),
  assignment: async (id: string) => unwrap<TeacherCourseAssignment>(await apiClient.get(`/assignments/${id}/`)),
  updateAssignment: async (id: string, input: Json) => unwrap<TeacherCourseAssignment>(await apiClient.patch(`/assignments/${id}/`, input)),
  deleteAssignment: async (id: string) => unwrap<void>(await apiClient.delete(`/assignments/${id}/`)),
}

export const coursesApi = {
  list: async (params?: Params) => unwrap<PaginatedResponse<Course>>(await apiClient.get('/courses/', { params })),
  create: async (input: Json) => unwrap<Course>(await apiClient.post('/courses/', input)),
  detail: async (id: string) => unwrap<Course>(await apiClient.get(`/courses/${id}/`)),
  update: async (id: string, input: Json) => unwrap<Course>(await apiClient.patch(`/courses/${id}/`, input)),
  remove: async (id: string) => unwrap<void>(await apiClient.delete(`/courses/${id}/`)),
  assignTeacher: async (id: string, input: { teacher_id: string; term_id: string; level_id: string }) => unwrap<TeacherCourseAssignment>(await apiClient.post(`/courses/${id}/assign-teacher/`, input)),
}

export const courseContentApi = {
  resources: async (assignmentId: string) => unwrap<PaginatedResponse<Resource>>(await apiClient.get(`/assignments/${assignmentId}/resources/`)),
  uploadResource: async (assignmentId: string, input: FormData) => unwrap<Resource>(await apiClient.post(`/assignments/${assignmentId}/resources/`, input, { headers: { 'Content-Type': 'multipart/form-data' } })),
  outline: async (assignmentId: string) => unwrap<CourseOutline>(await apiClient.get(`/assignments/${assignmentId}/outline/`)),
  updateOutline: async (assignmentId: string, weekly_topics: WeeklyTopic[]) => unwrap<CourseOutline>(await apiClient.put(`/assignments/${assignmentId}/outline/`, { weekly_topics })),
}

export const quizzesApi = {
  list: async (params?: Params) => unwrap<PaginatedResponse<Quiz>>(await apiClient.get('/quizzes/', { params })),
  create: async (input: Json) => unwrap<Quiz>(await apiClient.post('/quizzes/', input)),
  detail: async (id: string) => unwrap<Quiz>(await apiClient.get(`/quizzes/${id}/`)),
  update: async (id: string, input: Json) => unwrap<Quiz>(await apiClient.patch(`/quizzes/${id}/`, input)),
  publish: async (id: string) => unwrap<Quiz>(await apiClient.post(`/quizzes/${id}/publish/`)),
  startAttempt: async (id: string) => unwrap<QuizAttempt>(await apiClient.post(`/quizzes/${id}/attempts/`)),
  submitAttempt: async (attemptId: string, answers: Json[]) => unwrap<QuizAttempt>(await apiClient.post(`/quiz-attempts/${attemptId}/submit/`, { answers })),
  submissions: async (id: string) => unwrap<PaginatedResponse<QuizAttempt>>(await apiClient.get(`/quizzes/${id}/submissions/`)),
}

export const assignmentsApi = {
  list: async (params?: Params) => unwrap<PaginatedResponse<Assignment>>(await apiClient.get('/course-assignments/', { params })),
  create: async (input: Json) => unwrap<Assignment>(await apiClient.post('/course-assignments/', input)),
  detail: async (id: string) => unwrap<Assignment>(await apiClient.get(`/course-assignments/${id}/`)),
  update: async (id: string, input: Json) => unwrap<Assignment>(await apiClient.patch(`/course-assignments/${id}/`, input)),
  publish: async (id: string) => unwrap<Assignment>(await apiClient.post(`/course-assignments/${id}/publish/`)),
  submit: async (id: string, input: FormData) => unwrap<AssignmentSubmission>(await apiClient.post(`/course-assignments/${id}/submit/`, input, { headers: { 'Content-Type': 'multipart/form-data' } })),
  submissions: async (id: string) => unwrap<PaginatedResponse<AssignmentSubmission>>(await apiClient.get(`/course-assignments/${id}/submissions/`)),
  grade: async (id: string, input: { marks_obtained: number; feedback?: string }) => unwrap<AssignmentSubmission>(await apiClient.patch(`/assignment-submissions/${id}/grade/`, input)),
}

export const feesApi = {
  structures: async (params?: Params) => unwrap<PaginatedResponse<FeeStructure>>(await apiClient.get('/fee-structures/', { params })),
  createStructure: async (input: Json) => unwrap<FeeStructure>(await apiClient.post('/fee-structures/', input)),
  updateStructure: async (id: string, input: Json) => unwrap<FeeStructure>(await apiClient.patch(`/fee-structures/${id}/`, input)),
  deleteStructure: async (id: string) => unwrap<void>(await apiClient.delete(`/fee-structures/${id}/`)),
  studentFees: async (params?: Params) => unwrap<PaginatedResponse<StudentFee>>(await apiClient.get('/student-fees/', { params })),
  studentFee: async (id: string) => unwrap<StudentFee>(await apiClient.get(`/student-fees/${id}/`)),
  recordPayment: async (id: string, input: Json) => unwrap<Payment>(await apiClient.post(`/student-fees/${id}/payments/`, input)),
  sendReminder: async (student_ids: string[], message: string) => unwrap<unknown>(await apiClient.post('/student-fees/send-reminder/', { student_ids, message })),
}

// No confirmed backend response shape for schedules yet — kept as `unknown`
// (not `any`) so call sites must explicitly narrow via listItems()/asRecord().
export const schedulesApi = {
  timetables: async (params?: Params) => unwrap<unknown>(await apiClient.get('/timetables/', { params })),
  createTimetable: async (input: Json) => unwrap<unknown>(await apiClient.post('/timetables/', input)),
  updateTimetable: async (id: string, input: Json) => unwrap<unknown>(await apiClient.patch(`/timetables/${id}/`, input)),
  deleteTimetable: async (id: string) => unwrap<void>(await apiClient.delete(`/timetables/${id}/`)),
  examSchedules: async (params?: Params) => unwrap<unknown>(await apiClient.get('/exam-schedules/', { params })),
  createExamSchedule: async (input: Json) => unwrap<unknown>(await apiClient.post('/exam-schedules/', input)),
  updateExamSchedule: async (id: string, input: Json) => unwrap<unknown>(await apiClient.patch(`/exam-schedules/${id}/`, input)),
  deleteExamSchedule: async (id: string) => unwrap<void>(await apiClient.delete(`/exam-schedules/${id}/`)),
  holidays: async (params?: Params) => unwrap<unknown>(await apiClient.get('/holidays/', { params })),
  createHoliday: async (input: Json) => unwrap<unknown>(await apiClient.post('/holidays/', input)),
  updateHoliday: async (id: string, input: Json) => unwrap<unknown>(await apiClient.patch(`/holidays/${id}/`, input)),
  deleteHoliday: async (id: string) => unwrap<void>(await apiClient.delete(`/holidays/${id}/`)),
}

export const announcementsApi = {
  list: async (params?: Params) => unwrap<PaginatedResponse<Announcement>>(await apiClient.get('/announcements/', { params })),
  create: async (input: Json) => unwrap<Announcement>(await apiClient.post('/announcements/', input)),
  detail: async (id: string) => unwrap<Announcement>(await apiClient.get(`/announcements/${id}/`)),
  update: async (id: string, input: Json) => unwrap<Announcement>(await apiClient.patch(`/announcements/${id}/`, input)),
  delete: async (id: string) => unwrap<void>(await apiClient.delete(`/announcements/${id}/`)),
  publish: async (id: string) => unwrap<Announcement>(await apiClient.post(`/announcements/${id}/publish/`)),
  markRead: async (id: string) => unwrap<void>(await apiClient.post(`/announcements/${id}/read/`)),
}

// No confirmed backend response shape for reports/support yet — kept as
// `unknown` (not `any`) so call sites must explicitly narrow the result.
export const reportsApi = {
  academicPerformance: async (params?: Params) => unwrap<unknown>(await apiClient.get('/reports/academic-performance/', { params })),
  feeCollection: async (params?: Params) => unwrap<unknown>(await apiClient.get('/reports/fee-collection/', { params })),
  teacherEvaluations: async (params?: Params) => unwrap<unknown>(await apiClient.get('/reports/teacher-evaluations/', { params })),
  export: async (input: Json) => unwrap<unknown>(await apiClient.post('/reports/export/', input)),
  exportStatus: async (taskId: string) => unwrap<unknown>(await apiClient.get(`/reports/export/${taskId}/`)),
}

export const supportApi = {
  tickets: async (params?: Params) => unwrap<unknown>(await apiClient.get('/support-tickets/', { params })),
  createTicket: async (input: Json) => unwrap<unknown>(await apiClient.post('/support-tickets/', input)),
  updateTicket: async (id: string, input: Json) => unwrap<unknown>(await apiClient.patch(`/support-tickets/${id}/`, input)),
  resetPassword: async (input: { user_id: string; new_password: string; reason: string }) => unwrap<unknown>(await apiClient.post('/support/reset-password/', input)),
}

export const evaluationsApi = {
  list: async (params?: Params) => unwrap<PaginatedResponse<TeacherEvaluation>>(await apiClient.get('/evaluations/', { params })),
  create: async (input: Json) => unwrap<TeacherEvaluation>(await apiClient.post('/evaluations/', input)),
}
