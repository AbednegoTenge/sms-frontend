'use client'

import { useEffect, useState } from 'react'
import type React from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Cookies from 'js-cookie'
import { createUser, getUsers } from '@/lib/api/users'
import { academicsApi, announcementsApi, coursesApi, feesApi, reportsApi, schedulesApi, studentsApi } from '@/lib/api/school'
import {
  AlertTriangle,
  BarChart3,
  Bell,
  BookOpen,
  Briefcase,
  Calendar,
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  Clock,
  // Crown,
  Download,
  FileBarChart,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Megaphone,
  Menu,
  Moon,
  Plus,
  School,
  Search,
  ShieldCheck,
  Sun,
  Trash2,
  User,
  UserPlus,
  Users,
  Wallet,
  X,
} from 'lucide-react'

type Role = 'principal' | 'admin'
type PrincipalSection =
  | 'dashboard'
  | 'attendance'
  | 'academics'
  | 'staff'
  | 'students'
  | 'finance'
  | 'announcements'
  | 'reports'
  | 'evaluations'
  | 'support'
type AdminSection =
  | 'dashboard'
  | 'users'
  | 'teachers'
  | 'students'
  | 'classes'
  | 'course-management'
  | 'enrollment'
  | 'fees'
  | 'academic'
  | 'announcements'
  | 'schedule'
  | 'support'
  | 'evaluations'
type Section = PrincipalSection | AdminSection
type CreateRole = 'STUDENT' | 'TEACHER'

type Teacher = {
  id: string
  name: string
  dept: string
  email: string
  status: 'active' | 'on-leave'
  joined: string
  rating: number
}

type Student = {
  id: string
  name: string
  classId: number
  gender: 'Male' | 'Female'
  avgGrade: number
  attendance: number
  status: 'active' | 'warning' | 'at-risk'
  email: string
  phone?: string
}

type ClassItem = {
  id: number
  name: string
  code: string
  teacherId: string
  studentCount: number
}

type Announcement = {
  id: number
  title: string
  date: string
  source: string
  recipient: string
  content: string
  important: boolean
}

type FeeReceipt = {
  id: string
  studentId: string
  feeType: string
  amount: number
  method: string
  date: string
  status: 'pending' | 'validated'
}

type TimetableSlot = {
  id: string
  course: string
  teacher: string
  level: string
  classSection: string
  term: string
  dayOfWeek: number
  startTime: string
  endTime: string
  room: string
}

type ExamScheduleItem = {
  id: string
  course: string
  level: string
  term: string
  examDate: string
  startTime: string
  endTime: string
  room: string
  examType: string
}

type FeeStructureItem = {
  id: string
  type: string
  amount: number
}

type StudentFeeRecord = {
  id: string
  studentId: string
  studentName: string
  amount: number
  amountPaid: number
  status: string
}

function listItems<T = Record<string, unknown>>(value: unknown): T[] {
  if (Array.isArray(value)) return value as T[]
  if (value && typeof value === 'object' && Array.isArray((value as { results?: unknown }).results)) {
    return (value as { results: T[] }).results
  }
  return []
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' ? value as Record<string, unknown> : {}
}

function textValue(value: unknown, fallback = '') {
  return typeof value === 'string' && value.trim() ? value : fallback
}

function numberValue(value: unknown, fallback = 0) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

// No attendance API — mock data retained for attendance UI only
const MOCK_ATTENDANCE = [
  { classId: 1, present: 30, total: 32, week: [94, 96, 91, 93, 95] },
  { classId: 2, present: 27, total: 30, week: [90, 88, 92, 87, 91] },
  { classId: 3, present: 27, total: 28, week: [96, 97, 95, 98, 97] },
  { classId: 4, present: 25, total: 29, week: [86, 84, 88, 82, 86] },
  { classId: 5, present: 25, total: 26, week: [96, 98, 97, 99, 96] },
  { classId: 6, present: 25, total: 27, week: [93, 91, 94, 92, 93] },
]

// No grade-range distribution API — mock retained; summary stats use /reports/academic-performance/
const MOCK_GRADE_DISTRIBUTION = [
  { range: 'A (90-100)', count: 38, tone: 'emerald' },
  { range: 'B (80-89)', count: 52, tone: 'blue' },
  { range: 'C (70-79)', count: 41, tone: 'amber' },
  { range: 'D (60-69)', count: 18, tone: 'orange' },
  { range: 'F (Below 60)', count: 11, tone: 'red' },
]

const dayChoices = [
  { value: 0, label: 'Monday' },
  { value: 1, label: 'Tuesday' },
  { value: 2, label: 'Wednesday' },
  { value: 3, label: 'Thursday' },
  { value: 4, label: 'Friday' },
]

const adminSections: AdminSection[] = ['dashboard', 'users', 'teachers', 'students', 'classes', 'course-management', 'enrollment', 'fees', 'academic', 'announcements', 'schedule', 'support', 'evaluations']
const principalSections: PrincipalSection[] = ['dashboard', 'attendance', 'academics', 'staff', 'students', 'finance', 'announcements', 'reports', 'evaluations', 'support']

const toneClasses: Record<string, { bg: string; text: string; border: string; fill: string }> = {
  emerald: { bg: 'bg-emerald-50 dark:bg-emerald-950', text: 'text-emerald-700 dark:text-emerald-300', border: 'border-emerald-200 dark:border-emerald-900', fill: 'bg-emerald-500' },
  blue: { bg: 'bg-blue-50 dark:bg-blue-950', text: 'text-blue-700 dark:text-blue-300', border: 'border-blue-200 dark:border-blue-900', fill: 'bg-blue-500' },
  amber: { bg: 'bg-amber-50 dark:bg-amber-950', text: 'text-amber-700 dark:text-amber-300', border: 'border-amber-200 dark:border-amber-900', fill: 'bg-amber-500' },
  purple: { bg: 'bg-purple-50 dark:bg-purple-950', text: 'text-purple-700 dark:text-purple-300', border: 'border-purple-200 dark:border-purple-900', fill: 'bg-purple-500' },
  cyan: { bg: 'bg-cyan-50 dark:bg-cyan-950', text: 'text-cyan-700 dark:text-cyan-300', border: 'border-cyan-200 dark:border-cyan-900', fill: 'bg-cyan-500' },
  red: { bg: 'bg-red-50 dark:bg-red-950', text: 'text-red-700 dark:text-red-300', border: 'border-red-200 dark:border-red-900', fill: 'bg-red-500' },
  orange: { bg: 'bg-orange-50 dark:bg-orange-950', text: 'text-orange-700 dark:text-orange-300', border: 'border-orange-200 dark:border-orange-900', fill: 'bg-orange-500' },
  slate: { bg: 'bg-slate-50 dark:bg-slate-900', text: 'text-slate-600 dark:text-slate-300', border: 'border-slate-200 dark:border-slate-700', fill: 'bg-slate-500' },
}

function pct(a: number, b: number) {
  return b > 0 ? Math.round((a / b) * 100) : 0
}

function money(value: number) {
  return `${value.toLocaleString()}`
}

function fmtDate(date: string) {
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function classCode(classes: ClassItem[], id: number) {
  return classes.find((item) => item.id === id)?.code ?? '-'
}

function Badge({ children, tone = 'slate' }: { children: React.ReactNode; tone?: string }) {
  const colors = toneClasses[tone] ?? toneClasses.slate
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-medium ${colors.bg} ${colors.text}`}>{children}</span>
}

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 ${className}`}>{children}</div>
}

function StatCard({ icon: Icon, tone, value, label, badge }: { icon: React.ElementType; tone: string; value: string | number; label: string; badge?: React.ReactNode }) {
  const colors = toneClasses[tone] ?? toneClasses.slate
  return (
    <Card className="relative overflow-hidden p-5">
      <div className={`absolute right-0 top-0 h-16 w-16 rounded-bl-[32px] opacity-60 ${colors.bg}`} />
      <div className="relative">
        <div className="mb-3 flex items-center justify-between">
          <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${colors.bg}`}>
            <Icon className={`h-5 w-5 ${colors.text}`} />
          </div>
          {badge}
        </div>
        <p className="text-2xl font-semibold text-slate-900 dark:text-slate-100">{value}</p>
        <p className="mt-0.5 text-xs text-slate-400">{label}</p>
      </div>
    </Card>
  )
}

export function OperationsDashboard({ role }: { role: Role }) {
  const router = useRouter()
  const pathname = usePathname()
  const [dark, setDark] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [section, setSection] = useState<Section>('dashboard')
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [classes, setClasses] = useState<ClassItem[]>([])
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [search, setSearch] = useState('')
  const [classFilter, setClassFilter] = useState('all')
  const [feeTab, setFeeTab] = useState<'outstanding' | 'paid' | 'history'>('outstanding')
  const [showComposer, setShowComposer] = useState(false)
  const [createRole, setCreateRole] = useState<CreateRole | null>(null)
  const [formNotice, setFormNotice] = useState('')
  const [loadingData, setLoadingData] = useState(true)
  const [dataError, setDataError] = useState('')
  const [reportTotals, setReportTotals] = useState({ totalFees: 0, collectedFees: 0, pendingFees: 0 })
  const [timetableSlots, setTimetableSlots] = useState<TimetableSlot[]>([])
  const [examSchedules, setExamSchedules] = useState<ExamScheduleItem[]>([])
  const [feeStructures, setFeeStructures] = useState<FeeStructureItem[]>([])
  const [studentFeeRecords, setStudentFeeRecords] = useState<StudentFeeRecord[]>([])
  const [academicSummary, setAcademicSummary] = useState({ avgScore: 0, passRate: 0, totalStudents: 0 })

  const totalStudents = classes.reduce((sum, item) => sum + item.studentCount, 0)
  const activeTeachers = teachers.filter((item) => item.status === 'active').length
  const totalPresent = MOCK_ATTENDANCE.reduce((sum, item) => sum + item.present, 0)
  const avgAttendance = pct(totalPresent, MOCK_ATTENDANCE.reduce((sum, item) => sum + item.total, 0))
  const atRiskCount = students.filter((item) => item.status === 'at-risk').length
  const feeStructureTotal = feeStructures.reduce((sum, item) => sum + item.amount, 0)
  const fallbackTotalFees = feeStructureTotal > 0 ? students.length * feeStructureTotal : 0
  const totalFees = reportTotals.totalFees || fallbackTotalFees
  const collectedFees = reportTotals.collectedFees
  const pendingFees = reportTotals.pendingFees || Math.max(totalFees - collectedFees, 0)
  const feeCollectionProgress = totalFees > 0 ? pct(collectedFees, totalFees) : 0

  const isAdmin = role === 'admin'
  const validSections = isAdmin ? adminSections : principalSections
  const basePath = isAdmin ? '/admin/dashboard' : '/principal/dashboard'
  const navItems = isAdmin
    ? [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'users', label: 'Users & Roles', icon: UserPlus },
        { id: 'teachers', label: 'Teachers', icon: GraduationCap },
        { id: 'students', label: 'Students', icon: Users },
        { id: 'classes', label: 'Classes', icon: School },
        { id: 'course-management', label: 'Courses', icon: BookOpen },
        { id: 'enrollment', label: 'Enrollment', icon: CheckCircle2 },
        { id: 'fees', label: 'Fee Collection', icon: Wallet },
        { id: 'academic', label: 'Academic', icon: CalendarDays },
        { id: 'announcements', label: 'Announcements', icon: Megaphone },
        { id: 'schedule', label: 'Schedule', icon: Calendar },
        { id: 'support', label: 'Support', icon: AlertTriangle },
        { id: 'evaluations', label: 'Evaluations', icon: BarChart3 },
      ]
    : [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'attendance', label: 'Attendance', icon: ClipboardCheck },
        { id: 'academics', label: 'Academics', icon: BarChart3 },
        { id: 'staff', label: 'Staff', icon: Briefcase },
        { id: 'students', label: 'Students', icon: Users },
        { id: 'finance', label: 'Finance', icon: Wallet },
        { id: 'announcements', label: 'Announcements', icon: Megaphone },
        { id: 'reports', label: 'Reports', icon: FileBarChart },
        { id: 'evaluations', label: 'Evaluations', icon: BarChart3 },
        { id: 'support', label: 'Support', icon: AlertTriangle },
      ]

  useEffect(() => {
    const parts = pathname.split('/').filter(Boolean)
    const pathSection = parts[2] as Section | undefined
    const nextSection = pathSection && (validSections as Section[]).includes(pathSection) ? pathSection : 'dashboard'
    setSection(nextSection)
  }, [pathname, validSections])

  useEffect(() => {
    let cancelled = false

    async function loadDashboardData() {
      setLoadingData(true)
      setDataError('')

      try {
        const [teacherUsers, studentRecords, courseRecords, announcementRecords, feeReport, timetableRecords, examRecords, structureRecords, studentFeesRecords, academicReport] = await Promise.all([
          getUsers({ role: 'TEACHER', page_size: '100' }),
          studentsApi.list({ page_size: 100 }),
          coursesApi.list({ page_size: 100 }),
          announcementsApi.list({ page_size: 20 }),
          reportsApi.feeCollection().catch(() => null),
          schedulesApi.timetables({ page_size: 100 }).catch(() => null),
          schedulesApi.examSchedules({ page_size: 100 }).catch(() => null),
          feesApi.structures({ page_size: 100 }).catch(() => null),
          feesApi.studentFees({ page_size: 100 }).catch(() => null),
          reportsApi.academicPerformance().catch(() => null),
        ])

        if (cancelled) return

        const apiTeachers = listItems(teacherUsers).map((item, index): Teacher => {
          const record = asRecord(item)
          return {
            id: textValue(record.school_id, textValue(record.id, `TCH-${String(index + 1).padStart(3, '0')}`)),
            name: textValue(record.full_name, 'Unnamed Teacher'),
            dept: textValue(record.department, textValue(record.dept, 'Teaching Staff')),
            email: textValue(record.email),
            status: record.is_active === false ? 'on-leave' : 'active',
            joined: textValue(record.date_joined, new Date().toISOString()),
            rating: numberValue(record.rating, 0),
          }
        })

        const apiStudents = listItems(studentRecords).map((item, index): Student => {
          const record = asRecord(item)
          const classKey = `${record.level ?? ''}${record.class_section ?? ''}` || String(record.class_section ?? index + 1)
          return {
            id: textValue(record.data_id, textValue(record.id, `STD-${String(index + 1).padStart(3, '0')}`)),
            name: textValue(record.full_name, 'Unnamed Student'),
            classId: Math.max(1, Math.abs(classKey.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0)) % 50),
            gender: record.gender === 'Male' ? 'Male' : 'Female',
            avgGrade: numberValue(record.avg_grade, 0),
            attendance: numberValue(record.attendance, 0),
            status: record.status === 'SUSPENDED' ? 'at-risk' : record.status === 'INACTIVE' ? 'warning' : 'active',
            email: textValue(record.email),
          }
        })

        const derivedClasses = Array.from(new Map(apiStudents.map((student) => {
          const source = asRecord(listItems(studentRecords).find((item) => textValue(asRecord(item).school_id, textValue(asRecord(item).id)) === student.id))
          const code = `${source.level ? `L${source.level}` : 'L'}-${textValue(source.class_section, String(student.classId))}`
          return [student.classId, {
            id: student.classId,
            name: `${source.level ? `Level ${source.level}` : 'Class'} ${textValue(source.class_section, String(student.classId))}`,
            code,
            teacherId: apiTeachers[0]?.id ?? '',
            studentCount: apiStudents.filter((item) => item.classId === student.classId).length,
          } satisfies ClassItem]
        })).values())

        const courseClasses = derivedClasses.length > 0 ? derivedClasses : listItems(courseRecords).map((item, index): ClassItem => {
          const record = asRecord(item)
          return {
            id: index + 1,
            name: textValue(record.name, `Course ${index + 1}`),
            code: textValue(record.code, `CRS-${index + 1}`),
            teacherId: apiTeachers[0]?.id ?? '',
            studentCount: 0,
          }
        })

        const apiAnnouncements = listItems(announcementRecords).map((item, index): Announcement => {
          const record = asRecord(item)
          return {
            id: numberValue(record.id, index + 1),
            title: textValue(record.title, 'Untitled announcement'),
            date: textValue(record.created_at, textValue(record.date, new Date().toISOString())),
            source: textValue(record.source, textValue(record.created_by, 'Administration')),
            recipient: textValue(record.recipient_type, 'Everyone'),
            content: textValue(record.body, textValue(record.content)),
            important: Boolean(record.important || record.is_important),
          }
        })

        const feeRecord = asRecord(feeReport)
        const academicRecord = asRecord(academicReport)

        setTeachers(apiTeachers)
        setStudents(apiStudents)
        setClasses(courseClasses)
        setAnnouncements(apiAnnouncements)
        setReportTotals({
          totalFees: numberValue(feeRecord.total_expected),
          collectedFees: numberValue(feeRecord.total_collected),
          pendingFees: numberValue(feeRecord.outstanding),
        })
        setAcademicSummary({
          avgScore: numberValue(academicRecord.avg_score),
          passRate: numberValue(academicRecord.pass_rate) * (numberValue(academicRecord.pass_rate) <= 1 ? 100 : 1),
          totalStudents: numberValue(academicRecord.total_students),
        })
        setTimetableSlots(listItems(timetableRecords).map((item, index): TimetableSlot => {
          const record = asRecord(item)
          const course = asRecord(record.course)
          const teacher = asRecord(record.teacher)
          const level = asRecord(record.level)
          const term = asRecord(record.term)
          return {
            id: textValue(record.id, `slot-${index + 1}`),
            course: textValue(course.name, textValue(record.course_name, 'Course')),
            teacher: textValue(teacher.full_name, textValue(record.teacher_name, 'Teacher')),
            level: textValue(level.name, textValue(record.level_name, 'Level')),
            classSection: textValue(record.class_section, '-'),
            term: textValue(term.name, textValue(record.term_name, 'Term')),
            dayOfWeek: numberValue(record.day_of_week, numberValue(record.day, 0)),
            startTime: textValue(record.start_time, '08:00'),
            endTime: textValue(record.end_time, '09:00'),
            room: textValue(record.room, '-'),
          }
        }))
        setExamSchedules(listItems(examRecords).map((item, index): ExamScheduleItem => {
          const record = asRecord(item)
          const course = asRecord(record.course)
          const level = asRecord(record.level)
          const term = asRecord(record.term)
          return {
            id: textValue(record.id, `exam-${index + 1}`),
            course: textValue(course.name, textValue(record.course_name, 'Course')),
            level: textValue(level.name, textValue(record.level_name, 'Level')),
            term: textValue(term.name, textValue(record.term_name, 'Term')),
            examDate: textValue(record.exam_date, textValue(record.date, new Date().toISOString())),
            startTime: textValue(record.start_time, '09:00'),
            endTime: textValue(record.end_time, '10:30'),
            room: textValue(record.room, '-'),
            examType: textValue(record.exam_type, 'MID_TERM'),
          }
        }))
        setFeeStructures(listItems(structureRecords).map((item, index): FeeStructureItem => {
          const record = asRecord(item)
          return {
            id: textValue(record.id, `fee-${index + 1}`),
            type: textValue(record.fee_type, textValue(record.name, `Fee ${index + 1}`)),
            amount: numberValue(record.amount, 0),
          }
        }))
        setStudentFeeRecords(listItems(studentFeesRecords).map((item, index): StudentFeeRecord => {
          const record = asRecord(item)
          const student = asRecord(record.student)
          return {
            id: textValue(record.id, `sf-${index + 1}`),
            studentId: textValue(student.school_id, textValue(record.student_id, '')),
            studentName: textValue(student.full_name, textValue(record.student_name, 'Student')),
            amount: numberValue(record.amount, numberValue(record.total_amount, 0)),
            amountPaid: numberValue(record.amount_paid, 0),
            status: textValue(record.status, 'PENDING'),
          }
        }))
      } catch (error) {
        if (!cancelled) {
          setTeachers([])
          setStudents([])
          setClasses([])
          setAnnouncements([])
          setReportTotals({ totalFees: 0, collectedFees: 0, pendingFees: 0 })
          setTimetableSlots([])
          setExamSchedules([])
          setFeeStructures([])
          setStudentFeeRecords([])
          setAcademicSummary({ avgScore: 0, passRate: 0, totalStudents: 0 })
          setDataError(error instanceof Error ? error.message : 'Could not load dashboard data from the API.')
        }
      } finally {
        if (!cancelled) setLoadingData(false)
      }
    }

    loadDashboardData()
    return () => {
      cancelled = true
    }
  }, [])

  function sectionHref(next: Section) {
    return next === 'dashboard' ? basePath : `${basePath}/${next}`
  }

  function navigate(next: Section) {
    setSection(next)
    setShowComposer(false)
    setCreateRole(null)
    setFormNotice('')
    setSidebarOpen(false)
    window.history.pushState(null, '', sectionHref(next))
  }

  function logout() {
    Cookies.remove('access_token')
    Cookies.remove('refresh_token')
    Cookies.remove('active_role')
    router.push('/')
  }

  async function addAnnouncement(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const recipientMap: Record<string, string> = {
      Everyone: 'ALL',
      Students: 'STUDENTS',
      Teachers: 'TEACHERS',
      Staff: 'STAFF',
    }
    const recipientLabel = String(form.get('recipient') || 'Everyone')
    try {
      const created = asRecord(await announcementsApi.create({
        title: String(form.get('title') || ''),
        body: String(form.get('content') || ''),
        recipient_type: recipientMap[recipientLabel] ?? 'ALL',
      }))
      const createdId = textValue(created.id)
      if (createdId) {
        await announcementsApi.publish(createdId).catch(() => null)
      }
      setAnnouncements((current) => [
        {
          id: numberValue(created.id, Math.max(...current.map((item) => item.id), 0) + 1),
          title: textValue(created.title, String(form.get('title') || '')),
          content: textValue(created.body, String(form.get('content') || '')),
          source: isAdmin ? 'Administration' : 'Principal',
          recipient: recipientLabel,
          important: form.get('important') === 'on',
          date: textValue(created.created_at, new Date().toISOString().slice(0, 10)),
        },
        ...current,
      ])
      setShowComposer(false)
    } catch (error) {
      setFormNotice(error instanceof Error ? error.message : 'Could not publish announcement.')
    }
  }

  function openCreateUser(roleToCreate: CreateRole) {
    setCreateRole(roleToCreate)
    setFormNotice('')
  }

  async function submitCreateUser(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!createRole) return

    const form = new FormData(event.currentTarget)
    const firstName = String(form.get('first_name') || '').trim()
    const lastName = String(form.get('last_name') || '').trim()
    const email = String(form.get('email') || '').trim()
    const phone = String(form.get('phone') || '').trim()
    const password = String(form.get('password') || '').trim()
    const confirmPassword = String(form.get('confirm_password') || '').trim()

    if (password !== confirmPassword) {
      setFormNotice('Passwords do not match.')
      return
    }

    const selectedRole = String(form.get('role') || createRole)

    try {
      const created = await createUser({
        first_name: firstName,
        last_name: lastName,
        email: email || undefined,
        phone: phone || undefined,
        password,
        roles: [selectedRole],
      })

      const fullName = created.full_name || `${firstName} ${lastName}`.trim()

      if (createRole === 'TEACHER') {
        setTeachers((current) => [
          ...current,
          {
            id: created.school_id,
            name: fullName,
            dept: String(form.get('dept') || 'General Studies'),
            email,
            status: 'active',
            joined: new Date().toISOString().slice(0, 10),
            rating: 0,
          },
        ])
      } else {
        const classId = Number(form.get('class_id') || 1)
        setStudents((current) => [
          ...current,
          {
            id: created.school_id,
            name: fullName,
            classId,
            gender: String(form.get('gender') || 'Female') as Student['gender'],
            avgGrade: 0,
            attendance: 0,
            status: 'active',
            email,
          },
        ])
        setClasses((current) => current.map((item) => item.id === classId ? { ...item, studentCount: item.studentCount + 1 } : item))
      }

      setFormNotice(`${fullName} created with ${selectedRole} role.`)
      setCreateRole(null)
    } catch (error) {
      setFormNotice(error instanceof Error ? error.message : 'Could not create user.')
    }
  }

  function addClass() {
    const next = classes.length + 1
    setClasses((current) => [
      ...current,
      { id: next, name: `Grade ${9 + next} - Section A`, code: `G${9 + next}-A`, teacherId: teachers[0]?.id ?? '', studentCount: 0 },
    ])
  }

  const shellClass = dark ? 'dark' : ''
  const currentUser = isAdmin ? 'System Admin' : 'Dr. A. Mensah'
  const roleTitle = isAdmin ? 'Admin Portal' : 'Principal Portal'
  const RoleIcon = isAdmin ? ShieldCheck : GraduationCap

  return (
    <div className={shellClass}>
      <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
        <header className="fixed inset-x-0 top-0 z-30 flex h-14 items-center justify-between border-b border-slate-200 bg-white px-4 dark:border-slate-800 dark:bg-slate-900 lg:hidden">
          <div className="flex items-center gap-2.5">
            <button onClick={() => setSidebarOpen(true)} className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800" aria-label="Open menu">
              <Menu className="h-5 w-5 text-slate-600 dark:text-slate-300" />
            </button>
            <Brand icon={RoleIcon} subtitle={roleTitle} role={role} compact />
          </div>
          <ThemeButton dark={dark} setDark={setDark} />
        </header>

        {sidebarOpen && <button className="fixed inset-0 z-40 bg-black/40 lg:hidden" onClick={() => setSidebarOpen(false)} aria-label="Close menu" />}

        <aside className={`fixed inset-y-0 left-0 z-50 flex w-60 flex-col border-r border-slate-200 bg-white transition-transform dark:border-slate-800 dark:bg-slate-900 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
          <div className="hidden h-16 items-center border-b border-slate-100 px-5 dark:border-slate-800 lg:flex">
            <Brand icon={RoleIcon} subtitle={roleTitle} role={role} />
          </div>
          <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
            {navItems.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => navigate(id as Section)}
                className={`flex w-full items-center gap-3 rounded-l-lg px-3 py-2.5 text-left text-sm font-medium transition-colors ${
                  section === id
                    ? 'border-r-4 border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                    : 'text-slate-500 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800'
                }`}
              >
                <Icon className="h-5 w-5" />
                {label}
              </button>
            ))}
          </nav>
          <div className="space-y-3 border-t border-slate-100 p-4 dark:border-slate-800">
            <button onClick={() => setDark((value) => !value)} className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm text-slate-600 transition-colors hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800">
              <span className="flex items-center gap-2.5">{dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}{dark ? 'Light Mode' : 'Dark Mode'}</span>
              <span className={`relative h-[22px] w-10 rounded-full transition-colors ${dark ? 'bg-emerald-500' : 'bg-slate-200'}`}><span className={`absolute top-[3px] h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${dark ? 'translate-x-[21px]' : 'translate-x-[3px]'}`} /></span>
            </button>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                {isAdmin ? <ShieldCheck className="h-5 w-5" /> : <User className="h-5 w-5" />}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-slate-800 dark:text-slate-100">{currentUser}</p>
                <p className="truncate text-[11px] text-slate-400">{isAdmin ? 'Administrator' : 'Principal'}</p>
              </div>
              <button onClick={logout} className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950" aria-label="Sign out">
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </aside>

        <main className="min-h-screen pt-14 lg:pl-60 lg:pt-0">
          <div className="max-w-7xl p-5 lg:p-8">
            {loadingData && <Notice>Loading live dashboard data from the backend API...</Notice>}
            {dataError && <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-xs font-medium text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">{dataError}</div>}
            {section === 'dashboard' && <DashboardHome role={role} totalStudents={totalStudents} activeTeachers={activeTeachers} avgAttendance={avgAttendance} atRiskCount={atRiskCount} collectedFees={collectedFees} pendingFees={pendingFees} feeCollectionProgress={feeCollectionProgress} academicSummary={academicSummary} classes={classes} teachers={teachers} announcements={announcements} navigate={navigate} setShowComposer={setShowComposer} />}
            {section === 'attendance' && <AttendancePage classes={classes} />}
            {section === 'academics' && <AcademicsPage classes={classes} students={students} />}
            {(section === 'staff' || section === 'teachers') && <PeoplePage role={role} kind="teachers" teachers={teachers} setTeachers={setTeachers} openCreateUser={openCreateUser} createRole={createRole} setCreateRole={setCreateRole} submitCreateUser={submitCreateUser} formNotice={formNotice} search={search} setSearch={setSearch} />}
            {section === 'students' && <StudentsPage role={role} students={students} setStudents={setStudents} classes={classes} search={search} setSearch={setSearch} classFilter={classFilter} setClassFilter={setClassFilter} openCreateUser={openCreateUser} createRole={createRole} setCreateRole={setCreateRole} submitCreateUser={submitCreateUser} formNotice={formNotice} />}
            {(section === 'finance' || section === 'fees') && <FinancePage role={role} students={students} classes={classes} totalFees={totalFees} collectedFees={collectedFees} pendingFees={pendingFees} feeTab={feeTab} setFeeTab={setFeeTab} feeStructures={feeStructures} studentFeeRecords={studentFeeRecords} onPaymentRecorded={async () => {
              const feeReport = await reportsApi.feeCollection().catch(() => null)
              const studentFeesRecords = await feesApi.studentFees({ page_size: 100 }).catch(() => null)
              const feeRecord = asRecord(feeReport)
              setReportTotals({
                totalFees: numberValue(feeRecord.total_expected),
                collectedFees: numberValue(feeRecord.total_collected),
                pendingFees: numberValue(feeRecord.outstanding),
              })
              setStudentFeeRecords(listItems(studentFeesRecords).map((item, index): StudentFeeRecord => {
                const record = asRecord(item)
                const student = asRecord(record.student)
                return {
                  id: textValue(record.id, `sf-${index + 1}`),
                  studentId: textValue(student.school_id, textValue(record.student_id, '')),
                  studentName: textValue(student.full_name, textValue(record.student_name, 'Student')),
                  amount: numberValue(record.amount, numberValue(record.total_amount, 0)),
                  amountPaid: numberValue(record.amount_paid, 0),
                  status: textValue(record.status, 'PENDING'),
                }
              }))
            }} />}
            {section === 'classes' && <ClassesPage classes={classes} setClasses={setClasses} teachers={teachers} addClass={addClass} />}
            {section === 'users' && <ApiFeaturePage title="Users & Roles" subtitle="Create accounts, deactivate users, edit profiles, and assign roles." features={['GET /users with role/status/search filters', 'POST /users for teacher, student, and principal accounts', 'PATCH /users/{id} for profile updates', 'DELETE /users/{id} soft-deactivation', 'POST /users/{id}/assign-role for role assignment']} />}
            {section === 'course-management' && <ApiFeaturePage title="Course Management" subtitle="Manage courses and teacher assignments from the backend course APIs." features={['GET/POST /courses', 'GET/PATCH/DELETE /courses/{id}', 'POST /courses/{id}/assign-teacher', 'Filter courses by type, program, and search text']} />}
            {section === 'enrollment' && <ApiFeaturePage title="Program & Elective Enrollment" subtitle="Assign student programs and manage elective course enrollment." features={['POST /students/{id}/assign-program', 'POST /students/{id}/enroll-electives', 'GET /students/{id}/courses', 'Validate exactly four electives before submit']} />}
            {section === 'academic' && <AcademicPage />}
            {section === 'announcements' && <AnnouncementsPage announcements={announcements} setAnnouncements={setAnnouncements} showComposer={showComposer} setShowComposer={setShowComposer} addAnnouncement={addAnnouncement} />}
            {section === 'reports' && <ReportsPage />}
            {section === 'schedule' && <SchedulePage classes={classes} timetableSlots={timetableSlots} examSchedules={examSchedules} />}
            {section === 'support' && <ApiFeaturePage title="Support Desk" subtitle="Expose support tickets and IT password reset workflows." features={['GET/POST /support-tickets for user ticket creation', 'PATCH /support-tickets/{id} for IT support status updates', 'POST /support/reset-password for IT support resets']} />}
            {section === 'evaluations' && <ApiFeaturePage title="Teacher Evaluations" subtitle="Collect student ratings and review aggregate evaluation data." features={['POST /evaluations from enrolled students', 'GET /evaluations for admin/principal aggregate views', 'GET /evaluations for teacher received-evaluation views']} />}
          </div>
        </main>
      </div>
    </div>
  )
}

function Brand({ icon: Icon, subtitle, role, compact }: { icon: React.ElementType; subtitle: string; role: Role; compact?: boolean }) {
  const isAdmin = role === 'admin'
  return (
    <div className="flex items-center gap-3">
      <div className={`flex ${compact ? 'h-7 w-7 rounded-md' : 'h-9 w-9 rounded-lg'} items-center justify-center ${isAdmin ? 'bg-slate-900 dark:bg-slate-100' : 'bg-emerald-600 dark:bg-emerald-500'}`}>
        <Icon className={`${compact ? 'h-4 w-4' : 'h-5 w-5'} ${isAdmin ? 'text-emerald-400 dark:text-emerald-600' : 'text-white'}`} />
      </div>
      <div>
        <span className="block text-sm font-semibold leading-tight text-slate-900 dark:text-slate-100">Greenfield Academy</span>
        {!compact && <span className="text-[10px] text-slate-400">{subtitle}</span>}
      </div>
    </div>
  )
}

function ThemeButton({ dark, setDark }: { dark: boolean; setDark: (value: boolean) => void }) {
  return (
    <button onClick={() => setDark(!dark)} className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800" aria-label="Toggle theme">
      {dark ? <Sun className="h-5 w-5 text-slate-400" /> : <Moon className="h-5 w-5 text-slate-500" />}
    </button>
  )
}

function DashboardHome(props: {
  role: Role
  totalStudents: number
  activeTeachers: number
  avgAttendance: number
  atRiskCount: number
  collectedFees: number
  pendingFees: number
  feeCollectionProgress: number
  academicSummary: { avgScore: number; passRate: number; totalStudents: number }
  classes: ClassItem[]
  teachers: Teacher[]
  announcements: Announcement[]
  navigate: (section: Section) => void
  setShowComposer: (value: boolean) => void
}) {
  const isAdmin = props.role === 'admin'
  return (
    <div>
      <div className="mb-8 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="mb-1 text-2xl font-semibold text-slate-900 dark:text-slate-100">{isAdmin ? 'Admin Dashboard' : 'Principal Dashboard'}</h1>
          <p className="text-sm text-slate-400">2024/2025 - Second Term - {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => props.navigate(isAdmin ? 'fees' : 'reports')} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800">
            <Download className="h-4 w-4" />Export Report
          </button>
          <button onClick={() => { props.navigate('announcements'); props.setShowComposer(true) }} className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-emerald-500">
            <Megaphone className="h-4 w-4" />Announce
          </button>
        </div>
      </div>

      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-5">
        <StatCard icon={Users} tone="blue" value={props.totalStudents} label="Total Students" />
        <StatCard icon={GraduationCap} tone="emerald" value={props.activeTeachers} label={isAdmin ? 'Active Teachers' : 'Active Staff'} />
        <StatCard icon={ClipboardCheck} tone="cyan" value={`${props.avgAttendance}%`} label="Avg Attendance" badge={<Badge tone={props.avgAttendance >= 90 ? 'emerald' : 'amber'}>{props.avgAttendance >= 90 ? 'Good' : 'Low'}</Badge>} />
        <StatCard icon={Wallet} tone="purple" value={money(props.collectedFees)} label="Fees Collected" badge={<Badge tone="purple">{props.feeCollectionProgress}%</Badge>} />
        <StatCard icon={AlertTriangle} tone="red" value={props.atRiskCount} label={isAdmin ? 'Open Alerts' : 'At-Risk Students'} badge={props.atRiskCount > 0 ? <Badge tone="red">Action</Badge> : undefined} />
      </div>

      {isAdmin && (
        <div className="mb-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: 'Add Teacher', icon: UserPlus, section: 'teachers' },
            { label: 'Add Student', icon: Users, section: 'students' },
            { label: 'Fee Collection', icon: Wallet, section: 'fees' },
            { label: 'Academic Settings', icon: CalendarDays, section: 'academic' },
          ].map(({ label, icon: Icon, section }) => (
            <button key={label} onClick={() => props.navigate(section as Section)} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 text-left transition-colors hover:border-emerald-200 hover:bg-emerald-50 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-emerald-950">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-300"><Icon className="h-5 w-5" /></span>
              <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{label}</span>
            </button>
          ))}
        </div>
      )}

      <div className="mb-6 grid gap-6 lg:grid-cols-2">
        <Card className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-slate-100"><ClipboardCheck className="h-4 w-4 text-cyan-500" />Today&apos;s Attendance</h2>
            <button onClick={() => props.navigate(isAdmin ? 'schedule' : 'attendance')} className="text-xs font-medium text-emerald-600">View all</button>
          </div>
          <div className="space-y-3">
            {MOCK_ATTENDANCE.map((item) => {
              const percent = pct(item.present, item.total)
              return <ProgressRow key={item.classId} label={classCode(props.classes, item.classId)} value={percent} tone={percent >= 95 ? 'emerald' : percent >= 85 ? 'blue' : 'amber'} suffix={`${percent}%`} />
            })}
          </div>
        </Card>
        <Card className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-slate-100"><BarChart3 className="h-4 w-4 text-purple-500" />Grade Distribution</h2>
            <button onClick={() => props.navigate(isAdmin ? 'academic' : 'academics')} className="text-xs font-medium text-emerald-600">View all</button>
          </div>
          <div className="space-y-3">
            {MOCK_GRADE_DISTRIBUTION.map((item) => {
              const total = props.academicSummary.totalStudents || MOCK_GRADE_DISTRIBUTION.reduce((sum, grade) => sum + grade.count, 0)
              return <ProgressRow key={item.range} label={item.range} value={Math.round((item.count / total) * 100)} tone={item.tone} suffix={item.count} />
            })}
          </div>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-5">
          <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-slate-100"><Bell className="h-4 w-4 text-amber-500" />Priority Notifications</h2>
          <div className="space-y-3">
            {[
              props.atRiskCount > 0 ? `${props.atRiskCount} student(s) at critical academic risk` : 'No students flagged at critical risk',
              props.pendingFees > 0 ? `Fee collection at ${props.feeCollectionProgress}% - ${money(props.pendingFees)} outstanding` : 'Fee collection is up to date',
              props.academicSummary.avgScore > 0 ? `School average score: ${props.academicSummary.avgScore.toFixed(1)}%` : 'Academic performance data loading',
            ].map((text, index) => {
              const tones = ['red', 'cyan', 'purple'] as const
              const tone = tones[index] ?? 'purple'
              return <div key={text} className="flex items-center gap-3 rounded-xl p-3 hover:bg-slate-50 dark:hover:bg-slate-800"><span className={`h-2.5 w-2.5 rounded-full ${toneClasses[tone].fill}`} /><p className="text-sm text-slate-700 dark:text-slate-200">{text}</p></div>
            })}
          </div>
        </Card>
        <Card className="p-5">
          <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-slate-100"><Megaphone className="h-4 w-4 text-purple-500" />Recent Announcements</h2>
          <div className="space-y-3">
            {props.announcements.slice(0, 4).map((item) => <AnnouncementMini key={item.id} item={item} />)}
          </div>
        </Card>
      </div>
    </div>
  )
}

function ProgressRow({ label, value, tone, suffix }: { label: string; value: number; tone: string; suffix: React.ReactNode }) {
  const colors = toneClasses[tone] ?? toneClasses.slate
  return (
    <div className="flex items-center gap-3">
      <div className="w-24 shrink-0 truncate text-xs font-medium text-slate-600 dark:text-slate-300">{label}</div>
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
        <div className={`h-full rounded-full ${colors.fill}`} style={{ width: `${value}%` }} />
      </div>
      <span className={`w-12 text-right text-xs font-semibold ${colors.text}`}>{suffix}</span>
    </div>
  )
}

function AnnouncementMini({ item }: { item: Announcement }) {
  return (
    <div className="flex items-start gap-2.5">
      {item.important ? <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" /> : <Megaphone className="mt-0.5 h-4 w-4 shrink-0 text-slate-300" />}
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-slate-800 dark:text-slate-100">{item.title}</p>
        <p className="mt-0.5 text-[11px] text-slate-400">{fmtDate(item.date)} - {item.recipient}</p>
      </div>
    </div>
  )
}

function AttendancePage({ classes }: { classes: ClassItem[] }) {
  const totalPresent = MOCK_ATTENDANCE.reduce((sum, item) => sum + item.present, 0)
  const total = MOCK_ATTENDANCE.reduce((sum, item) => sum + item.total, 0)
  return (
    <div>
      <PageTitle title="Attendance" subtitle="Daily and weekly attendance tracking by class" />
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon={Users} tone="blue" value={total} label="Total Enrolled" />
        <StatCard icon={CheckCircle2} tone="emerald" value={totalPresent} label="Present Today" />
        <StatCard icon={ClipboardCheck} tone="cyan" value={`${pct(totalPresent, total)}%`} label="Overall Rate" />
        <StatCard icon={X} tone="red" value={total - totalPresent} label="Absent Today" />
      </div>
      <Card className="mb-6 p-5">
        <h2 className="mb-5 flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-slate-100"><BarChart3 className="h-4 w-4 text-cyan-500" />Weekly Attendance Trend</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {MOCK_ATTENDANCE.map((item) => (
            <div key={item.classId} className="text-center">
              <p className="mb-3 text-xs font-medium text-slate-600 dark:text-slate-300">{classCode(classes, item.classId)}</p>
              <div className="flex h-24 items-end justify-center gap-1">
                {item.week.map((value, index) => <div key={index} className={`w-3 rounded-t ${value >= 95 ? 'bg-emerald-400' : value >= 85 ? 'bg-blue-400' : 'bg-amber-400'}`} style={{ height: `${value}%`, minHeight: 8 }} />)}
              </div>
              <p className="mt-2 text-[10px] text-slate-400">{pct(item.present, item.total)}% today</p>
            </div>
          ))}
        </div>
      </Card>
      <DataTable headers={['Class', 'Present', 'Total', 'Rate']}>
        {MOCK_ATTENDANCE.map((item) => {
          const cls = classes.find((entry) => entry.id === item.classId)
          const rate = pct(item.present, item.total)
          return <tr key={item.classId} className="border-b border-slate-100 dark:border-slate-800"><td className="px-5 py-3"><p className="font-medium text-slate-800 dark:text-slate-100">{cls?.name}</p><p className="text-xs text-slate-400">{cls?.code}</p></td><td className="px-5 py-3 text-center">{item.present}</td><td className="px-5 py-3 text-center text-slate-400">{item.total}</td><td className="px-5 py-3"><ProgressRow label="" value={rate} tone={rate >= 95 ? 'emerald' : rate >= 85 ? 'blue' : 'amber'} suffix={`${rate}%`} /></td></tr>
        })}
      </DataTable>
    </div>
  )
}

function AcademicsPage({ classes, students }: { classes: ClassItem[]; students: Student[] }) {
  const sorted = [...students].sort((a, b) => b.avgGrade - a.avgGrade)
  return (
    <div>
      <PageTitle title="Academics" subtitle="Student performance analytics and grade tracking" />
      <div className="mb-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {classes.map((item) => {
          const group = students.filter((student) => student.classId === item.id)
          const avg = group.length ? Math.round(group.reduce((sum, student) => sum + student.avgGrade, 0) / group.length) : 0
          return (
            <Card key={item.id} className="p-5">
              <div className="mb-4 flex items-center justify-between">
                <div><h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">{item.name}</h3><span className="text-xs text-slate-400">{item.code} - {item.studentCount} students</span></div>
                <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${avg >= 85 ? toneClasses.emerald.bg : avg >= 70 ? toneClasses.blue.bg : toneClasses.amber.bg}`}><span className={`text-sm font-bold ${avg >= 85 ? toneClasses.emerald.text : avg >= 70 ? toneClasses.blue.text : toneClasses.amber.text}`}>{avg}%</span></div>
              </div>
              <ProgressRow label="Average" value={avg} tone={avg >= 85 ? 'emerald' : avg >= 70 ? 'blue' : 'amber'} suffix={`${group.filter((student) => student.avgGrade >= 90).length} A`} />
            </Card>
          )
        })}
      </div>
      <DataTable headers={['Rank', 'Student', 'Class', 'Avg Grade', 'Attendance']}>
        {sorted.slice(0, 10).map((student, index) => <tr key={student.id} className="border-b border-slate-100 dark:border-slate-800"><td className="px-5 py-3"><div className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${index < 3 ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500 dark:bg-slate-800'}`}>{index + 1}</div></td><td className="px-5 py-3"><StudentCell student={student} /></td><td className="px-5 py-3"><Badge tone="purple">{classCode(classes, student.classId)}</Badge></td><td className="px-5 py-3 text-center font-semibold text-emerald-600">{student.avgGrade}%</td><td className="px-5 py-3 text-center text-slate-500">{student.attendance}%</td></tr>)}
      </DataTable>
    </div>
  )
}

function PeoplePage({ role, teachers, setTeachers, openCreateUser, createRole, setCreateRole, submitCreateUser, formNotice, search, setSearch }: { role: Role; kind: 'teachers'; teachers: Teacher[]; setTeachers: (value: Teacher[]) => void; openCreateUser: (role: CreateRole) => void; createRole: CreateRole | null; setCreateRole: (role: CreateRole | null) => void; submitCreateUser: (event: React.FormEvent<HTMLFormElement>) => void; formNotice: string; search: string; setSearch: (value: string) => void }) {
  const filtered = teachers.filter((item) => !search || item.name.toLowerCase().includes(search.toLowerCase()) || item.dept.toLowerCase().includes(search.toLowerCase()))
  return (
    <div>
      <HeaderActions title="Teachers" subtitle={`${teachers.length} registered - ${teachers.filter((item) => item.status === 'active').length} active`} action={role === 'admin' ? 'Add Teacher' : undefined} onAction={() => openCreateUser('TEACHER')} />
      {role === 'admin' && createRole === 'TEACHER' && <CreateUserForm role="TEACHER" classes={[]} onCancel={() => setCreateRole(null)} onSubmit={submitCreateUser} />}
      {formNotice && <Notice>{formNotice}</Notice>}
      <SearchBox value={search} setValue={setSearch} placeholder="Search by name or department..." />
      <DataTable headers={['Teacher', 'Department', 'Email', 'Status', 'Joined', '']}>
        {filtered.map((teacher) => <tr key={teacher.id} className="border-b border-slate-100 dark:border-slate-800"><td className="px-5 py-3"><div className="flex items-center gap-3"><Avatar label={teacher.name} tone="emerald" /><div><p className="font-medium text-slate-800 dark:text-slate-100">{teacher.name}</p><p className="font-mono text-xs text-slate-400">{teacher.id}</p></div></div></td><td className="px-5 py-3 text-slate-600 dark:text-slate-300">{teacher.dept}</td><td className="px-5 py-3 text-xs text-slate-400">{teacher.email}</td><td className="px-5 py-3 text-center"><Badge tone={teacher.status === 'active' ? 'emerald' : 'amber'}>{teacher.status === 'active' ? 'Active' : 'On Leave'}</Badge></td><td className="px-5 py-3 text-xs text-slate-400">{fmtDate(teacher.joined)}</td><td className="px-5 py-3 text-right"><button onClick={() => setTeachers(teachers.filter((item) => item.id !== teacher.id))} className="p-1 text-slate-300 hover:text-red-500"><Trash2 className="h-4 w-4" /></button></td></tr>)}
      </DataTable>
    </div>
  )
}

function StudentsPage(props: { role: Role; students: Student[]; setStudents: (value: Student[]) => void; classes: ClassItem[]; search: string; setSearch: (value: string) => void; classFilter: string; setClassFilter: (value: string) => void; openCreateUser: (role: CreateRole) => void; createRole: CreateRole | null; setCreateRole: (role: CreateRole | null) => void; submitCreateUser: (event: React.FormEvent<HTMLFormElement>) => void; formNotice: string }) {
  const filtered = props.students.filter((student) => (!props.search || student.name.toLowerCase().includes(props.search.toLowerCase()) || student.id.toLowerCase().includes(props.search.toLowerCase())) && (props.classFilter === 'all' || String(student.classId) === props.classFilter))
  return (
    <div>
      <HeaderActions title="Students" subtitle={`${props.students.length} enrolled - ${props.students.filter((item) => item.status === 'at-risk').length} at-risk`} action={props.role === 'admin' ? 'Add Student' : undefined} onAction={() => props.openCreateUser('STUDENT')} />
      {props.role === 'admin' && props.createRole === 'STUDENT' && <CreateUserForm role="STUDENT" classes={props.classes} onCancel={() => props.setCreateRole(null)} onSubmit={props.submitCreateUser} />}
      {props.formNotice && <Notice>{props.formNotice}</Notice>}
      <div className="mb-5 flex flex-col gap-3 sm:flex-row">
        <SearchBox value={props.search} setValue={props.setSearch} placeholder="Search by name or ID..." />
        <select value={props.classFilter} onChange={(event) => props.setClassFilter(event.target.value)} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
          <option value="all">All Classes</option>
          {props.classes.map((item) => <option key={item.id} value={item.id}>{item.code}</option>)}
        </select>
      </div>
      <DataTable headers={['Student', 'Class', 'Avg Grade', 'Attendance', 'Status', '']}>
        {filtered.map((student) => <tr key={student.id} className="border-b border-slate-100 dark:border-slate-800"><td className="px-5 py-3"><StudentCell student={student} /></td><td className="px-5 py-3"><Badge tone="purple">{classCode(props.classes, student.classId)}</Badge></td><td className="px-5 py-3 text-center font-semibold">{student.avgGrade}%</td><td className="px-5 py-3 text-center text-slate-500">{student.attendance}%</td><td className="px-5 py-3 text-center"><Badge tone={student.status === 'active' ? 'emerald' : student.status === 'warning' ? 'amber' : 'red'}>{student.status === 'active' ? 'Active' : student.status === 'warning' ? 'Warning' : 'At Risk'}</Badge></td><td className="px-5 py-3 text-right">{props.role === 'admin' && <button onClick={() => props.setStudents(props.students.filter((item) => item.id !== student.id))} className="p-1 text-slate-300 hover:text-red-500"><Trash2 className="h-4 w-4" /></button>}</td></tr>)}
      </DataTable>
    </div>
  )
}

function CreateUserForm({ role, classes, onCancel, onSubmit }: { role: CreateRole; classes: ClassItem[]; onCancel: () => void; onSubmit: (event: React.FormEvent<HTMLFormElement>) => void }) {
  const isTeacher = role === 'TEACHER'
  return (
    <form onSubmit={onSubmit} className="mb-5 space-y-4 rounded-xl border border-emerald-200 bg-white p-5 shadow-sm dark:border-emerald-900 dark:bg-slate-900">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">Create {isTeacher ? 'Teacher' : 'Student'} Account</h2>
        </div>
        <button type="button" onClick={onCancel} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800" aria-label="Close form">
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <FormField name="first_name" label="First Name" placeholder="Sarah" required />
        <FormField name="last_name" label="Last Name" placeholder="Johnson" required />
        <FormField name="email" label="Email" placeholder="name@greenfield.edu" type="email" />
        <FormField name="phone" label="Phone" placeholder="+233 20 000 0000" />
        <FormField name="password" label="Temporary Password" placeholder="Pass123" type="password" required />
        <FormField name="confirm_password" label="Confirm Password" placeholder="Pass123" type="password" required />
      </div>

      {isTeacher ? (
        <div className="grid gap-3 sm:grid-cols-2">
          <FormField name="dept" label="Department" placeholder="Mathematics" required />
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500">Role</label>
            <input value="TEACHER" readOnly className="w-full rounded-lg border border-slate-200 bg-slate-100 px-3 py-2.5 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-800" />
          </div>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500">Role</label>
            <select name="role" defaultValue="STUDENT" className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200">
              <option value="STUDENT">Student</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500">Class</label>
            <select name="class_id" required className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200">
              {classes.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500">Gender</label>
            <select name="gender" className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200">
              <option>Female</option>
              <option>Male</option>
            </select>
          </div>
        </div>
      )}

      <div className="flex justify-end gap-2">
        <button type="button" onClick={onCancel} className="rounded-lg px-4 py-2 text-sm font-medium text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800">Cancel</button>
        <button type="submit" className="rounded-lg bg-emerald-600 px-5 py-2 text-sm font-medium text-white hover:bg-emerald-500">Create {isTeacher ? 'Teacher' : 'Student'}</button>
      </div>
    </form>
  )
}

function FormField({ name, label, placeholder, type = 'text', required }: { name: string; label: string; placeholder: string; type?: string; required?: boolean }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-slate-500">{label}</label>
      <input name={name} type={type} placeholder={placeholder} required={required} className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200" />
    </div>
  )
}

function Notice({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-5 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-medium text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300">
      {children}
    </div>
  )
}

function FinancePage({ role, students, classes, totalFees, collectedFees, pendingFees, feeTab, setFeeTab, feeStructures, studentFeeRecords, onPaymentRecorded }: {
  role: Role
  students: Student[]
  classes: ClassItem[]
  totalFees: number
  collectedFees: number
  pendingFees: number
  feeTab: 'outstanding' | 'paid' | 'history'
  setFeeTab: (value: 'outstanding' | 'paid' | 'history') => void
  feeStructures: FeeStructureItem[]
  studentFeeRecords: StudentFeeRecord[]
  onPaymentRecorded: () => Promise<void>
}) {
  const feeTotal = feeStructures.reduce((sum, item) => sum + item.amount, 0)
  const [selectedFeeId, setSelectedFeeId] = useState<string | null>(null)
  const [recording, setRecording] = useState(false)
  const [notice, setNotice] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const payments = Object.fromEntries(
    studentFeeRecords.map((record) => [record.studentId, record.amountPaid])
  )
  const feeTotalsByStudent = Object.fromEntries(
    studentFeeRecords.map((record) => [record.studentId, record.amount])
  )

  const getStudentFeeTotal = (studentId: string) => feeTotalsByStudent[studentId] ?? feeTotal
  const paidStudents = students.filter((student) => (payments[student.id] ?? 0) >= getStudentFeeTotal(student.id) && getStudentFeeTotal(student.id) > 0)
  const owingStudents = students.filter((student) => getStudentFeeTotal(student.id) > 0 && (payments[student.id] ?? 0) < getStudentFeeTotal(student.id))
  const collected = studentFeeRecords.reduce((sum, record) => sum + record.amountPaid, 0)
  const expected = totalFees || studentFeeRecords.reduce((sum, record) => sum + record.amount, 0) || students.length * feeTotal
  const progress = pct(collected || collectedFees, expected)

  const selectedStudent = students.find((student) => studentFeeRecords.find((record) => record.id === selectedFeeId)?.studentId === student.id) ?? null
  const selectedFeeRecord = studentFeeRecords.find((record) => record.id === selectedFeeId) ?? null

  async function recordPayment(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!selectedFeeRecord) return
    const form = new FormData(event.currentTarget)
    const amount = Number(form.get('amount') || 0)
    const balance = selectedFeeRecord.amount - selectedFeeRecord.amountPaid
    if (!amount || amount <= 0 || amount > balance) {
      setNotice(`Enter an amount between 1 and ${money(balance)}.`)
      return
    }
    setSubmitting(true)
    try {
      const methodMap: Record<string, string> = {
        Cash: 'CASH',
        'Bank Transfer': 'BANK_TRANSFER',
        Card: 'CARD',
        'Mobile Money': 'MOBILE_MONEY',
      }
      await feesApi.recordPayment(selectedFeeRecord.id, {
        amount,
        payment_method: methodMap[String(form.get('method') || 'Cash')] ?? 'CASH',
        reference: `PAY-${Date.now()}`,
        paid_at: new Date().toISOString(),
      })
      await onPaymentRecorded()
      setRecording(false)
      setNotice('')
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Could not record payment.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      <PageTitle title={role === 'admin' ? 'Fee Collection' : 'Finance Overview'} subtitle="Fee collection and financial summary" />
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon={Wallet} tone="cyan" value={money(expected)} label="Total Expected" />
        <StatCard icon={CheckCircle2} tone="emerald" value={money(collected || collectedFees)} label="Collected" badge={<Badge tone="emerald">{progress}%</Badge>} />
        <StatCard icon={Calendar} tone="amber" value={money(pendingFees || Math.max(expected - (collected || collectedFees), 0))} label="Outstanding" />
        <StatCard icon={FileBarChart} tone="blue" value={studentFeeRecords.length} label="Fee Records" />
      </div>
      <Card className="mb-6 p-5">
        <div className="mb-2 flex items-center justify-between"><span className="text-sm font-medium text-slate-700 dark:text-slate-200">Collection Progress</span><span className="text-lg font-bold text-emerald-600">{progress}%</span></div>
        <div className="h-3 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800"><div className="h-full rounded-full bg-emerald-500" style={{ width: `${progress}%` }} /></div>
      </Card>
      {role === 'admin' && <div className="mb-5 flex gap-2 overflow-x-auto">{(['outstanding', 'paid', 'history'] as const).map((tab) => <button key={tab} onClick={() => { setFeeTab(tab); setSelectedFeeId(null); setRecording(false) }} className={`inline-flex items-center gap-2 whitespace-nowrap rounded-lg border px-4 py-2.5 text-sm font-medium capitalize ${feeTab === tab ? 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950' : 'border-slate-200 bg-white text-slate-500 dark:border-slate-800 dark:bg-slate-900'}`}>{tab}<span className={`inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] ${feeTab === tab ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-500 dark:bg-slate-800'}`}>{tab === 'outstanding' ? owingStudents.length : tab === 'paid' ? paidStudents.length : studentFeeRecords.length}</span></button>)}</div>}
      {role !== 'admin' ? <ClassCollection classes={classes} studentFeeRecords={studentFeeRecords} /> : (
        <div className="grid items-start gap-6 lg:grid-cols-[1fr_420px]">
          <div>
            {feeTab === 'history'
              ? <StudentFeeHistory records={studentFeeRecords} students={students} />
              : <FeeStudentList students={feeTab === 'paid' ? paidStudents : owingStudents} classes={classes} payments={payments} feeTotalsByStudent={feeTotalsByStudent} feeTotal={feeTotal} onSelect={(studentId) => {
                const record = studentFeeRecords.find((item) => item.studentId === studentId)
                setSelectedFeeId(record?.id ?? null)
                setRecording(false)
                setNotice('')
              }} selectedStudentId={selectedStudent?.id ?? null} />}
          </div>
          <div>
            {selectedStudent && selectedFeeRecord ? (
              <FeeInvoice student={selectedStudent} classCode={classCode(classes, selectedStudent.classId)} feeStructures={feeStructures} feeTotal={selectedFeeRecord.amount} paid={selectedFeeRecord.amountPaid} status={selectedFeeRecord.status} recording={recording} notice={notice} submitting={submitting} onRecord={() => setRecording(true)} onCancel={() => setRecording(false)} onSubmit={recordPayment} />
            ) : (
              <Card className="hidden rounded-2xl p-10 text-center lg:block">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-50 text-slate-200 dark:bg-slate-800"><Wallet className="h-7 w-7" /></div>
                <p className="mb-1 text-sm font-medium text-slate-500">Select a Student</p>
                <p className="text-xs text-slate-400">Click a student to view their invoice and record payments.</p>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function FeeStudentList({ students, classes, payments, feeTotal, feeTotalsByStudent, selectedStudentId, onSelect }: { students: Student[]; classes: ClassItem[]; payments: Record<string, number>; feeTotal: number; feeTotalsByStudent: Record<string, number>; selectedStudentId: string | null; onSelect: (studentId: string) => void }) {
  return (
    <div className="space-y-2">
      {students.length === 0 && <Card className="p-12 text-center text-sm text-slate-400">No students found.</Card>}
      {students.map((student) => {
        const bill = feeTotalsByStudent[student.id] ?? feeTotal
        const paid = payments[student.id] ?? 0
        const balance = bill - paid
        const isPaid = bill > 0 && balance <= 0
        const isSelected = selectedStudentId === student.id
        return (
          <button key={student.id} type="button" onClick={() => onSelect(student.id)} className={`flex w-full items-center gap-4 rounded-xl border bg-white p-4 text-left transition-all dark:bg-slate-900 ${isSelected ? 'border-emerald-200 ring-1 ring-emerald-200 dark:border-emerald-900' : isPaid ? 'border-emerald-100 hover:bg-emerald-50/30 dark:border-emerald-900 dark:hover:bg-emerald-950/30' : 'border-slate-200 hover:border-red-200 hover:bg-red-50/20 dark:border-slate-800 dark:hover:bg-red-950/20'}`}>
            <Avatar label={student.name} tone={isPaid ? 'emerald' : 'blue'} />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2"><p className="text-sm font-medium text-slate-800 dark:text-slate-100">{student.name}</p><Badge tone={isPaid ? 'emerald' : paid > 0 ? 'amber' : 'red'}>{isPaid ? 'Paid' : paid > 0 ? 'Partial' : 'Unpaid'}</Badge></div>
              <p className="text-xs text-slate-400">{student.id} - {classCode(classes, student.classId)} - Bill: {money(bill)}</p>
            </div>
            <div className="border-l border-slate-100 pl-3 text-right dark:border-slate-800"><p className={`text-[10px] font-medium uppercase ${isPaid ? 'text-emerald-500' : 'text-red-400'}`}>{isPaid ? 'Paid' : 'Owed'}</p><p className={`text-lg font-bold ${isPaid ? 'text-emerald-600' : 'text-red-500'}`}>{money(isPaid ? paid : balance)}</p></div>
          </button>
        )
      })}
    </div>
  )
}

function StudentFeeHistory({ records, students }: { records: StudentFeeRecord[]; students: Student[] }) {
  return (
    <Card className="overflow-hidden rounded-2xl">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950">{['Student', 'Expected', 'Paid', 'Status'].map((header) => <th key={header} className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">{header}</th>)}</tr></thead>
          <tbody>{records.map((record) => { const student = students.find((item) => item.id === record.studentId); return <tr key={record.id} className="border-b border-slate-100 dark:border-slate-800"><td className="px-4 py-3"><p className="text-sm font-medium text-slate-800 dark:text-slate-100">{student?.name ?? record.studentName}</p><p className="font-mono text-[11px] text-slate-400">{record.studentId}</p></td><td className="px-4 py-3 font-semibold text-slate-800 dark:text-slate-100">{money(record.amount)}</td><td className="px-4 py-3 font-semibold text-emerald-600">{money(record.amountPaid)}</td><td className="px-4 py-3"><Badge tone={record.status === 'FULLY_PAID' ? 'emerald' : record.status === 'OVERDUE' ? 'red' : 'amber'}>{record.status.replace(/_/g, ' ')}</Badge></td></tr> })}</tbody>
        </table>
      </div>
    </Card>
  )
}

function FeeInvoice(props: { student: Student; classCode: string; feeStructures: FeeStructureItem[]; feeTotal: number; paid: number; status: string; recording: boolean; notice: string; submitting: boolean; onRecord: () => void; onCancel: () => void; onSubmit: (event: React.FormEvent<HTMLFormElement>) => void }) {
  const balance = props.feeTotal - props.paid
  const cleared = balance <= 0 || props.status === 'FULLY_PAID'
  return (
    <Card className="overflow-hidden rounded-2xl">
      <div className="bg-slate-900 px-5 py-4 text-white dark:bg-slate-100 dark:text-slate-950">
        <div className="flex items-center gap-3"><div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-100/20"><ShieldCheck className="h-5 w-5 text-emerald-400" /></div><div className="flex-1"><p className="text-sm font-semibold">Greenfield Academy</p><p className="text-[10px] text-slate-400">Fee Invoice</p></div>{cleared && <Badge tone="emerald">Cleared</Badge>}</div>
      </div>
      <div className="grid grid-cols-2 gap-3 border-b border-slate-100 px-5 py-4 dark:border-slate-800"><InfoBlock label="Student" value={props.student.name} /><InfoBlock label="ID / Class" value={`${props.student.id} - ${props.classCode}`} /></div>
      <div className="border-b border-slate-100 px-5 py-4 dark:border-slate-800">
        <h4 className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-slate-400">Fee Breakdown</h4>
        <table className="w-full text-sm"><tbody>{(props.feeStructures.length ? props.feeStructures : [{ id: 'total', type: 'Total Fees', amount: props.feeTotal }]).map((fee) => <tr key={fee.id} className="border-t border-slate-50 dark:border-slate-800"><td className="py-2.5 text-slate-700 dark:text-slate-200">{fee.type}</td><td className="py-2.5 text-right text-slate-500">{money(fee.amount)}</td></tr>)}</tbody></table>
      </div>
      <div className="flex justify-between bg-slate-50 px-5 py-3 text-sm dark:bg-slate-950"><span className="font-semibold text-slate-700 dark:text-slate-200">Total</span><div className="flex gap-5"><span className="text-slate-500">{money(props.feeTotal)}</span><span className="font-semibold text-emerald-600">{money(props.paid)}</span><span className="font-bold text-red-500">{balance > 0 ? money(balance) : '-'}</span></div></div>
      {props.notice && <div className="mx-5 mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-xs font-medium text-red-600 dark:border-red-900 dark:bg-red-950">{props.notice}</div>}
      {props.recording && <form onSubmit={props.onSubmit} className="mx-5 my-4 space-y-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-900 dark:bg-emerald-950/30"><h4 className="flex items-center gap-2 text-sm font-semibold text-emerald-700 dark:text-emerald-300"><Wallet className="h-4 w-4" />Record Payment</h4><div className="grid grid-cols-2 gap-3"><input name="amount" type="number" min={1} max={balance} defaultValue={balance} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900" /><select name="method" className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"><option>Cash</option><option>Bank Transfer</option><option>Card</option><option>Mobile Money</option></select></div><div className="flex gap-2"><button disabled={props.submitting} className="flex-1 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-60">{props.submitting ? 'Saving...' : 'Confirm Payment'}</button><button type="button" onClick={props.onCancel} className="rounded-lg px-4 py-2.5 text-sm font-medium text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800">Cancel</button></div></form>}
      <div className="space-y-2 border-t border-slate-100 p-5 dark:border-slate-800">{!props.recording && balance > 0 && <button onClick={props.onRecord} className="flex w-full items-center justify-center gap-2 rounded-lg bg-slate-900 py-2.5 text-sm font-medium text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-950"><Wallet className="h-4 w-4" />Record Payment</button>}{cleared && <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-center text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300"><ShieldCheck className="mx-auto h-6 w-6" /><p className="mt-1 text-sm font-semibold">Fee Cleared</p><p className="text-[11px]">{props.status.replace(/_/g, ' ')}</p></div>}</div>
    </Card>
  )
}

function InfoBlock({ label, value }: { label: string; value: string }) {
  return <div><p className="text-[10px] uppercase tracking-wider text-slate-400">{label}</p><p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{value}</p></div>
}

function ClassCollection({ classes, studentFeeRecords }: { classes: ClassItem[]; studentFeeRecords: StudentFeeRecord[] }) {
  const expected = studentFeeRecords.reduce((sum, record) => sum + record.amount, 0)
  const collected = studentFeeRecords.reduce((sum, record) => sum + record.amountPaid, 0)
  const value = expected > 0 ? pct(collected, expected) : 0
  return <Card className="overflow-hidden"><div className="border-b border-slate-100 px-6 py-4 dark:border-slate-800"><h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Collection by Class</h2></div><div className="divide-y divide-slate-100 dark:divide-slate-800">{classes.map((item) => (
    <div key={item.id} className="flex items-center gap-4 px-6 py-4"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-purple-50 text-purple-600 dark:bg-purple-950"><School className="h-5 w-5" /></div><div className="min-w-0 flex-1"><div className="mb-1 flex items-center justify-between"><p className="text-sm font-medium text-slate-800 dark:text-slate-100">{item.name}</p><span className="text-xs font-semibold text-emerald-600">{value}%</span></div><div className="h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800"><div className="h-full rounded-full bg-emerald-400" style={{ width: `${value}%` }} /></div></div></div>
  ))}</div></Card>
}

function ClassesPage({ classes, setClasses, teachers, addClass }: { classes: ClassItem[]; setClasses: (value: ClassItem[]) => void; teachers: Teacher[]; addClass: () => void }) {
  return (
    <div>
      <HeaderActions title="Classes" subtitle={`${classes.length} configured`} action="Add Class" onAction={addClass} />
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {classes.map((item) => {
          const teacher = teachers.find((entry) => entry.id === item.teacherId)
          return <Card key={item.id} className="p-6"><div className="mb-3 flex items-start justify-between"><div><h3 className="font-semibold text-slate-900 dark:text-slate-100">{item.name}</h3><span className="mt-1 inline-flex items-center gap-1.5 text-xs text-slate-400">{item.code}</span></div><button onClick={() => setClasses(classes.filter((entry) => entry.id !== item.id))} className="p-1 text-slate-300 hover:text-red-500"><Trash2 className="h-4 w-4" /></button></div><div className="space-y-2 text-xs text-slate-500"><p className="flex items-center gap-2"><User className="h-4 w-4 text-slate-300" />{teacher?.name ?? 'Unassigned'}</p><p className="flex items-center gap-2"><Users className="h-4 w-4 text-slate-300" />{item.studentCount} students</p></div></Card>
        })}
      </div>
    </div>
  )
}

function AcademicPage() {
  const [terms, setTerms] = useState<Array<{ name: string; year: string; start: string; end: string; status: string }>>([])
  const [holidays, setHolidays] = useState<Array<{ name: string; date: string }>>([])
  const [loading, setLoading] = useState(true)
  // No calendar-events API — mock events retained
  const events = ['Term Begins', 'Parent-Teacher Meeting', 'Mid-Term Examinations', 'Final Examinations', 'Report Cards Issued']

  useEffect(() => {
    let cancelled = false
    async function loadAcademicData() {
      setLoading(true)
      try {
        const [termRecords, holidayRecords] = await Promise.all([
          academicsApi.terms({ page_size: 100 }),
          schedulesApi.holidays({ page_size: 100 }).catch(() => null),
        ])
        if (cancelled) return
        setTerms(listItems(termRecords).map((item) => {
          const record = asRecord(item)
          const year = asRecord(record.academic_year)
          return {
            name: textValue(record.name, `Term ${textValue(record.term_number, '')}`),
            year: textValue(year.name, textValue(record.academic_year_name, '-')),
            start: fmtDate(textValue(record.start_date, new Date().toISOString())),
            end: fmtDate(textValue(record.end_date, new Date().toISOString())),
            status: record.is_active === true ? 'Active' : record.is_completed === true ? 'Completed' : 'Upcoming',
          }
        }))
        setHolidays(listItems(holidayRecords).map((item) => {
          const record = asRecord(item)
          return {
            name: textValue(record.name, 'Holiday'),
            date: fmtDate(textValue(record.date, new Date().toISOString())),
          }
        }))
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    loadAcademicData()
    return () => { cancelled = true }
  }, [])

  const currentTerm = terms.find((term) => term.status === 'Active') ?? terms[0]

  return (
    <div>
      <PageTitle title="Academic" subtitle="Term management, calendar events, and holidays" />
      {loading && <Notice>Loading academic calendar from the API...</Notice>}
      {currentTerm && (
        <Card className="mb-6 border-emerald-200 bg-emerald-50 p-6 dark:border-emerald-900 dark:bg-emerald-950">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-300">Current Term</p>
          <h2 className="mt-1 text-xl font-semibold text-emerald-900 dark:text-emerald-100">{currentTerm.year} - {currentTerm.name}</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-3"><InfoTile label="Start" value={currentTerm.start} /><InfoTile label="End" value={currentTerm.end} /><InfoTile label="Status" value={currentTerm.status} /></div>
        </Card>
      )}
      <div className="grid gap-6 lg:grid-cols-2">
        <DataTable headers={['Term', 'Year', 'Start', 'End', 'Status']}>{terms.map((term) => <tr key={`${term.year}-${term.name}`} className="border-b border-slate-100 dark:border-slate-800"><td className="px-5 py-3 text-sm">{term.name}</td><td className="px-5 py-3 text-sm">{term.year}</td><td className="px-5 py-3 text-sm">{term.start}</td><td className="px-5 py-3 text-sm">{term.end}</td><td className="px-5 py-3 text-sm"><Badge tone={term.status === 'Upcoming' ? 'amber' : 'emerald'}>{term.status}</Badge></td></tr>)}</DataTable>
        <Card className="p-5"><h2 className="mb-4 text-sm font-semibold text-slate-900 dark:text-slate-100">Calendar Events</h2><div className="space-y-3">{events.map((event) => <div key={event} className="flex items-center gap-3 rounded-xl p-3 hover:bg-slate-50 dark:hover:bg-slate-800"><Megaphone className="h-4 w-4 text-slate-300" /><p className="text-sm font-medium text-slate-700 dark:text-slate-200">{event}</p></div>)}</div>{holidays.length > 0 && <div className="mt-6 border-t border-slate-100 pt-4 dark:border-slate-800"><h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Holidays</h3><div className="space-y-2">{holidays.map((holiday) => <div key={`${holiday.name}-${holiday.date}`} className="flex items-center justify-between text-sm"><span>{holiday.name}</span><span className="text-slate-400">{holiday.date}</span></div>)}</div></div>}</Card>
      </div>
    </div>
  )
}

function AnnouncementsPage(props: { announcements: Announcement[]; setAnnouncements: (value: Announcement[]) => void; showComposer: boolean; setShowComposer: (value: boolean) => void; addAnnouncement: (event: React.FormEvent<HTMLFormElement>) => void }) {
  return (
    <div>
      <HeaderActions title="Announcements" subtitle={`${props.announcements.length} published`} action="New Announcement" onAction={() => props.setShowComposer(true)} />
      {props.showComposer && <form onSubmit={props.addAnnouncement} className="mb-5 space-y-3 rounded-xl border border-emerald-200 bg-white p-5 dark:border-emerald-900 dark:bg-slate-900"><div className="flex items-center justify-between"><h3 className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">New Announcement</h3><button type="button" onClick={() => props.setShowComposer(false)} className="text-slate-400 hover:text-slate-600"><X className="h-4 w-4" /></button></div><input name="title" required placeholder="Announcement title" className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950" /><div className="grid gap-3 sm:grid-cols-2"><select name="recipient" className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"><option>Everyone</option><option>Students</option><option>Teachers</option><option>Parents</option><option>Staff</option></select><label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300"><input name="important" type="checkbox" className="accent-emerald-500" />Mark as important</label></div><textarea name="content" required rows={3} placeholder="Announcement content..." className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950" /><div className="flex justify-end gap-2"><button type="button" onClick={() => props.setShowComposer(false)} className="rounded-lg px-4 py-2 text-sm font-medium text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800">Cancel</button><button type="submit" className="rounded-lg bg-emerald-600 px-5 py-2 text-sm font-medium text-white hover:bg-emerald-500">Publish</button></div></form>}
      <div className="space-y-4">{props.announcements.map((item) => <Card key={item.id} className={`overflow-hidden ${item.important ? 'border-l-4 border-l-amber-400' : ''}`}><div className="p-6"><div className="flex items-start justify-between gap-4"><div className="min-w-0 flex-1">{item.important && <Badge tone="amber">Important</Badge>}<h3 className="mt-2 font-semibold text-slate-900 dark:text-slate-100">{item.title}</h3><p className="mt-1.5 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{item.content}</p><div className="mt-3 flex flex-wrap items-center gap-3"><Badge tone="purple">{item.recipient}</Badge><span className="text-xs text-slate-400">{fmtDate(item.date)}</span><span className="text-xs text-slate-400">{item.source}</span></div></div><button onClick={() => props.setAnnouncements(props.announcements.filter((entry) => entry.id !== item.id))} className="shrink-0 p-1 text-slate-300 hover:text-red-500"><Trash2 className="h-4 w-4" /></button></div></div></Card>)}</div>
    </div>
  )
}

function ReportsPage() {
  const reports = [
    ['Student Performance Report', 'Comprehensive grade analysis by class and subject', BarChart3, 'purple'],
    ['Attendance Summary Report', 'Daily, weekly, and monthly attendance trends', ClipboardCheck, 'cyan'],
    ['Fee Collection Report', 'Payment status, outstanding fees, and receipts', Wallet, 'emerald'],
    ['Staff Overview Report', 'Teacher ratings, leave records, and assignments', Briefcase, 'blue'],
    ['At-Risk Students Report', 'Students requiring academic or behavioral intervention', AlertTriangle, 'red'],
    ['End-of-Term Report', 'Complete term summary for board review', FileBarChart, 'amber'],
  ] as const
  return <div><PageTitle title="Reports" subtitle="Generate and download school reports" /><div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{reports.map(([title, desc, Icon, tone]) => <Card key={title} className="p-6"><div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl ${toneClasses[tone].bg}`}><Icon className={`h-6 w-6 ${toneClasses[tone].text}`} /></div><h3 className="mb-1 text-sm font-semibold text-slate-900 dark:text-slate-100">{title}</h3><p className="mb-4 text-xs text-slate-400">{desc}</p><button className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"><Download className="h-4 w-4" />Generate Report</button></Card>)}</div></div>
}

function ApiFeaturePage({ title, subtitle, features }: { title: string; subtitle: string; features: string[] }) {
  return (
    <div>
      <PageTitle title={title} subtitle={subtitle} />
      <div className="grid gap-5 lg:grid-cols-2">
        {features.map((feature) => (
          <Card key={feature} className="p-5">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-300">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">{feature}</h3>
                <p className="mt-1 text-xs leading-relaxed text-slate-400">Frontend surface added for this backend capability. Wire this card to the matching service in <span className="font-mono">lib/api/school.ts</span> when the API base URL is available.</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

function SchedulePage({ classes, timetableSlots, examSchedules }: { classes: ClassItem[]; timetableSlots: TimetableSlot[]; examSchedules: ExamScheduleItem[] }) {
  const sortedSlots = [...timetableSlots].sort((a, b) => a.dayOfWeek - b.dayOfWeek || a.startTime.localeCompare(b.startTime))
  const sortedExams = [...examSchedules].sort((a, b) => a.examDate.localeCompare(b.examDate) || a.startTime.localeCompare(b.startTime))
  const examTypeLabel: Record<string, string> = { MID_TERM: 'Mid Term', END_OF_TERM: 'End of Term' }

  return (
    <div>
      <PageTitle title="Schedule" subtitle="Weekly class timetable and examination schedule" />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-300"><Calendar className="h-5 w-5" /></div>
            <div><p className="text-2xl font-semibold text-slate-900 dark:text-slate-100">{sortedSlots.length}</p><p className="text-xs text-slate-400">Timetable Slots</p></div>
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-50 text-purple-600 dark:bg-purple-950 dark:text-purple-300"><School className="h-5 w-5" /></div>
            <div><p className="text-2xl font-semibold text-slate-900 dark:text-slate-100">{classes.length}</p><p className="text-xs text-slate-400">Classes</p></div>
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-300"><FileBarChart className="h-5 w-5" /></div>
            <div><p className="text-2xl font-semibold text-slate-900 dark:text-slate-100">{sortedExams.length}</p><p className="text-xs text-slate-400">Exam Entries</p></div>
          </div>
        </Card>
      </div>

      <div className="space-y-6">
        <Card className="overflow-hidden rounded-2xl">
          <div className="border-b border-slate-100 px-6 py-4 dark:border-slate-800">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Class Timetable</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950">
                  {['Day', 'Time', 'Course', 'Teacher', 'Level / Section', 'Term', 'Room'].map((header) => <th key={header} className="px-5 py-3 text-left text-xs font-medium uppercase text-slate-500">{header}</th>)}
                </tr>
              </thead>
              <tbody>
                {sortedSlots.map((slot) => (
                  <tr key={slot.id} className="border-b border-slate-100 dark:border-slate-800">
                    <td className="px-5 py-3 font-medium text-slate-800 dark:text-slate-100">{dayChoices.find((day) => day.value === slot.dayOfWeek)?.label}</td>
                    <td className="px-5 py-3 text-slate-600 dark:text-slate-300"><span className="inline-flex items-center gap-1.5"><Clock className="h-3.5 w-3.5 text-slate-300" />{slot.startTime} - {slot.endTime}</span></td>
                    <td className="px-5 py-3"><span className="inline-flex items-center gap-2 font-medium text-slate-800 dark:text-slate-100"><BookOpen className="h-4 w-4 text-emerald-500" />{slot.course}</span></td>
                    <td className="px-5 py-3 text-slate-600 dark:text-slate-300">{slot.teacher}</td>
                    <td className="px-5 py-3"><Badge tone="purple">{slot.level} {slot.classSection}</Badge></td>
                    <td className="px-5 py-3 text-slate-500">{slot.term}</td>
                    <td className="px-5 py-3 text-slate-500">{slot.room}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card className="overflow-hidden rounded-2xl">
          <div className="border-b border-slate-100 px-6 py-4 dark:border-slate-800">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Exam Schedule</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950">
                  {['Date', 'Time', 'Course', 'Level', 'Term', 'Room', 'Type'].map((header) => <th key={header} className="px-5 py-3 text-left text-xs font-medium uppercase text-slate-500">{header}</th>)}
                </tr>
              </thead>
              <tbody>
                {sortedExams.map((exam) => (
                  <tr key={exam.id} className="border-b border-slate-100 dark:border-slate-800">
                    <td className="px-5 py-3 font-medium text-slate-800 dark:text-slate-100">{fmtDate(exam.examDate)}</td>
                    <td className="px-5 py-3 text-slate-600 dark:text-slate-300">{exam.startTime} - {exam.endTime}</td>
                    <td className="px-5 py-3 font-medium text-slate-800 dark:text-slate-100">{exam.course}</td>
                    <td className="px-5 py-3 text-slate-500">{exam.level}</td>
                    <td className="px-5 py-3 text-slate-500">{exam.term}</td>
                    <td className="px-5 py-3 text-slate-500">{exam.room}</td>
                    <td className="px-5 py-3"><Badge tone={exam.examType === 'MID_TERM' ? 'blue' : 'amber'}>{examTypeLabel[exam.examType]}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  )
}

function HeaderActions({ title, subtitle, action, onAction }: { title: string; subtitle: string; action?: string; onAction?: () => void }) {
  return <div className="mb-6 flex items-center justify-between gap-3"><div><h1 className="mb-1 text-2xl font-semibold text-slate-900 dark:text-slate-100">{title}</h1><p className="text-sm text-slate-400">{subtitle}</p></div>{action && <button onClick={onAction} className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-emerald-500"><Plus className="h-4 w-4" />{action}</button>}</div>
}

function PageTitle({ title, subtitle }: { title: string; subtitle: string }) {
  return <div className="mb-6"><h1 className="mb-1 text-2xl font-semibold text-slate-900 dark:text-slate-100">{title}</h1><p className="text-sm text-slate-400">{subtitle}</p></div>
}

function SearchBox({ value, setValue, placeholder }: { value: string; setValue: (value: string) => void; placeholder: string }) {
  return <div className="relative w-full flex-1"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input value={value} onChange={(event) => setValue(event.target.value)} placeholder={placeholder} className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200" /></div>
}

function DataTable({ headers, children }: { headers: string[]; children: React.ReactNode }) {
  return <Card className="overflow-hidden"><div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950">{headers.map((header) => <th key={header} className="px-5 py-3 text-left text-xs font-medium uppercase text-slate-500">{header}</th>)}</tr></thead><tbody>{children}</tbody></table></div></Card>
}

function Avatar({ label, tone }: { label: string; tone: string }) {
  const colors = toneClasses[tone] ?? toneClasses.slate
  return <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${colors.bg} ${colors.text}`}>{label.charAt(0)}</div>
}

function StudentCell({ student }: { student: Student }) {
  return <div className="flex items-center gap-3"><Avatar label={student.name} tone="blue" /><div><p className="font-medium text-slate-800 dark:text-slate-100">{student.name}</p><p className="font-mono text-xs text-slate-400">{student.id}</p></div></div>
}

function InfoTile({ label, value }: { label: string; value: string }) {
  return <div className="rounded-lg border border-emerald-100 bg-white p-3 dark:border-emerald-900 dark:bg-slate-900"><p className="mb-0.5 text-[10px] uppercase tracking-wider text-slate-400">{label}</p><p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{value}</p></div>
}
