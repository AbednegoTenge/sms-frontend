import { apiClient } from './client'

type Params = Record<string, string | number | boolean | undefined | null>
type Json = Record<string, unknown>

const unwrap = <T>(response: { data: { data: T } }) => response.data.data

export const studentsApi = {
  list: async (params?: Params) => unwrap(await apiClient.get('/students/', { params })),
  detail: async (id: string) => unwrap(await apiClient.get(`/students/${id}/`)),
  update: async (id: string, input: Json) => unwrap(await apiClient.patch(`/students/${id}/`, input)),
  assignProgram: async (id: string, program_id: string) => unwrap(await apiClient.post(`/students/${id}/assign-program/`, { program_id })),
  enrollElectives: async (id: string, course_ids: string[]) => unwrap(await apiClient.post(`/students/${id}/enroll-electives/`, { course_ids })),
  courses: async (id: string) => unwrap(await apiClient.get(`/students/${id}/courses/`)),
  fees: async (id: string) => unwrap(await apiClient.get(`/students/${id}/fees/`)),
}

export const academicsApi = {
  academicYears: async (params?: Params) => unwrap(await apiClient.get('/academic-years/', { params })),
  createAcademicYear: async (input: Json) => unwrap(await apiClient.post('/academic-years/', input)),
  academicYear: async (id: string) => unwrap(await apiClient.get(`/academic-years/${id}/`)),
  updateAcademicYear: async (id: string, input: Json) => unwrap(await apiClient.patch(`/academic-years/${id}/`, input)),
  deleteAcademicYear: async (id: string) => unwrap(await apiClient.delete(`/academic-years/${id}/`)),
  terms: async (params?: Params) => unwrap(await apiClient.get('/terms/', { params })),
  createTerm: async (input: Json) => unwrap(await apiClient.post('/terms/', input)),
  term: async (id: string) => unwrap(await apiClient.get(`/terms/${id}/`)),
  updateTerm: async (id: string, input: Json) => unwrap(await apiClient.patch(`/terms/${id}/`, input)),
  deleteTerm: async (id: string) => unwrap(await apiClient.delete(`/terms/${id}/`)),
  transitionTerm: async (term_id: string) => unwrap(await apiClient.post('/terms/transition/', { term_id })),
  levels: async (params?: Params) => unwrap(await apiClient.get('/levels/', { params })),
  level: async (id: string) => unwrap(await apiClient.get(`/levels/${id}/`)),
  programs: async (params?: Params) => unwrap(await apiClient.get('/programs/', { params })),
  program: async (id: string) => unwrap(await apiClient.get(`/programs/${id}/`)),
  assignments: async (params?: Params) => unwrap(await apiClient.get('/assignments/', { params })),
  createAssignment: async (input: Json) => unwrap(await apiClient.post('/assignments/', input)),
  assignment: async (id: string) => unwrap(await apiClient.get(`/assignments/${id}/`)),
  updateAssignment: async (id: string, input: Json) => unwrap(await apiClient.patch(`/assignments/${id}/`, input)),
  deleteAssignment: async (id: string) => unwrap(await apiClient.delete(`/assignments/${id}/`)),
}

export const coursesApi = {
  list: async (params?: Params) => unwrap(await apiClient.get('/courses/', { params })),
  create: async (input: Json) => unwrap(await apiClient.post('/courses/', input)),
  detail: async (id: string) => unwrap(await apiClient.get(`/courses/${id}/`)),
  update: async (id: string, input: Json) => unwrap(await apiClient.patch(`/courses/${id}/`, input)),
  remove: async (id: string) => unwrap(await apiClient.delete(`/courses/${id}/`)),
  assignTeacher: async (id: string, input: { teacher_id: string; term_id: string; level_id: string }) => unwrap(await apiClient.post(`/courses/${id}/assign-teacher/`, input)),
}

export const courseContentApi = {
  resources: async (assignmentId: string) => unwrap(await apiClient.get(`/assignments/${assignmentId}/resources/`)),
  uploadResource: async (assignmentId: string, input: FormData) => unwrap(await apiClient.post(`/assignments/${assignmentId}/resources/`, input, { headers: { 'Content-Type': 'multipart/form-data' } })),
  outline: async (assignmentId: string) => unwrap(await apiClient.get(`/assignments/${assignmentId}/outline/`)),
  updateOutline: async (assignmentId: string, weekly_topics: Json[]) => unwrap(await apiClient.put(`/assignments/${assignmentId}/outline/`, { weekly_topics })),
}

export const quizzesApi = {
  list: async (params?: Params) => unwrap(await apiClient.get('/quizzes/', { params })),
  create: async (input: Json) => unwrap(await apiClient.post('/quizzes/', input)),
  detail: async (id: string) => unwrap(await apiClient.get(`/quizzes/${id}/`)),
  update: async (id: string, input: Json) => unwrap(await apiClient.patch(`/quizzes/${id}/`, input)),
  publish: async (id: string) => unwrap(await apiClient.post(`/quizzes/${id}/publish/`)),
  startAttempt: async (id: string) => unwrap(await apiClient.post(`/quizzes/${id}/attempts/`)),
  submitAttempt: async (attemptId: string, answers: Json[]) => unwrap(await apiClient.post(`/quiz-attempts/${attemptId}/submit/`, { answers })),
  submissions: async (id: string) => unwrap(await apiClient.get(`/quizzes/${id}/submissions/`)),
}

export const assignmentsApi = {
  list: async (params?: Params) => unwrap(await apiClient.get('/course-assignments/', { params })),
  create: async (input: Json) => unwrap(await apiClient.post('/course-assignments/', input)),
  detail: async (id: string) => unwrap(await apiClient.get(`/course-assignments/${id}/`)),
  update: async (id: string, input: Json) => unwrap(await apiClient.patch(`/course-assignments/${id}/`, input)),
  publish: async (id: string) => unwrap(await apiClient.post(`/course-assignments/${id}/publish/`)),
  submit: async (id: string, input: FormData) => unwrap(await apiClient.post(`/course-assignments/${id}/submit/`, input, { headers: { 'Content-Type': 'multipart/form-data' } })),
  submissions: async (id: string) => unwrap(await apiClient.get(`/course-assignments/${id}/submissions/`)),
  grade: async (id: string, input: { marks_obtained: number; feedback?: string }) => unwrap(await apiClient.patch(`/assignment-submissions/${id}/grade/`, input)),
}

export const feesApi = {
  structures: async (params?: Params) => unwrap(await apiClient.get('/fee-structures/', { params })),
  createStructure: async (input: Json) => unwrap(await apiClient.post('/fee-structures/', input)),
  updateStructure: async (id: string, input: Json) => unwrap(await apiClient.patch(`/fee-structures/${id}/`, input)),
  deleteStructure: async (id: string) => unwrap(await apiClient.delete(`/fee-structures/${id}/`)),
  studentFees: async (params?: Params) => unwrap(await apiClient.get('/student-fees/', { params })),
  studentFee: async (id: string) => unwrap(await apiClient.get(`/student-fees/${id}/`)),
  recordPayment: async (id: string, input: Json) => unwrap(await apiClient.post(`/student-fees/${id}/payments/`, input)),
  sendReminder: async (student_ids: string[], message: string) => unwrap(await apiClient.post('/student-fees/send-reminder/', { student_ids, message })),
}

export const schedulesApi = {
  timetables: async (params?: Params) => unwrap(await apiClient.get('/timetables/', { params })),
  createTimetable: async (input: Json) => unwrap(await apiClient.post('/timetables/', input)),
  updateTimetable: async (id: string, input: Json) => unwrap(await apiClient.patch(`/timetables/${id}/`, input)),
  deleteTimetable: async (id: string) => unwrap(await apiClient.delete(`/timetables/${id}/`)),
  examSchedules: async (params?: Params) => unwrap(await apiClient.get('/exam-schedules/', { params })),
  createExamSchedule: async (input: Json) => unwrap(await apiClient.post('/exam-schedules/', input)),
  updateExamSchedule: async (id: string, input: Json) => unwrap(await apiClient.patch(`/exam-schedules/${id}/`, input)),
  deleteExamSchedule: async (id: string) => unwrap(await apiClient.delete(`/exam-schedules/${id}/`)),
  holidays: async (params?: Params) => unwrap(await apiClient.get('/holidays/', { params })),
  createHoliday: async (input: Json) => unwrap(await apiClient.post('/holidays/', input)),
  updateHoliday: async (id: string, input: Json) => unwrap(await apiClient.patch(`/holidays/${id}/`, input)),
  deleteHoliday: async (id: string) => unwrap(await apiClient.delete(`/holidays/${id}/`)),
}

export const announcementsApi = {
  list: async (params?: Params) => unwrap(await apiClient.get('/announcements/', { params })),
  create: async (input: Json) => unwrap(await apiClient.post('/announcements/', input)),
  detail: async (id: string) => unwrap(await apiClient.get(`/announcements/${id}/`)),
  update: async (id: string, input: Json) => unwrap(await apiClient.patch(`/announcements/${id}/`, input)),
  delete: async (id: string) => unwrap(await apiClient.delete(`/announcements/${id}/`)),
  publish: async (id: string) => unwrap(await apiClient.post(`/announcements/${id}/publish/`)),
  markRead: async (id: string) => unwrap(await apiClient.post(`/announcements/${id}/read/`)),
}

export const reportsApi = {
  academicPerformance: async (params?: Params) => unwrap(await apiClient.get('/reports/academic-performance/', { params })),
  feeCollection: async (params?: Params) => unwrap(await apiClient.get('/reports/fee-collection/', { params })),
  teacherEvaluations: async (params?: Params) => unwrap(await apiClient.get('/reports/teacher-evaluations/', { params })),
  export: async (input: Json) => unwrap(await apiClient.post('/reports/export/', input)),
  exportStatus: async (taskId: string) => unwrap(await apiClient.get(`/reports/export/${taskId}/`)),
}

export const supportApi = {
  tickets: async (params?: Params) => unwrap(await apiClient.get('/support-tickets/', { params })),
  createTicket: async (input: Json) => unwrap(await apiClient.post('/support-tickets/', input)),
  updateTicket: async (id: string, input: Json) => unwrap(await apiClient.patch(`/support-tickets/${id}/`, input)),
  resetPassword: async (input: { user_id: string; new_password: string; reason: string }) => unwrap(await apiClient.post('/support/reset-password/', input)),
}

export const evaluationsApi = {
  list: async (params?: Params) => unwrap(await apiClient.get('/evaluations/', { params })),
  create: async (input: Json) => unwrap(await apiClient.post('/evaluations/', input)),
}
