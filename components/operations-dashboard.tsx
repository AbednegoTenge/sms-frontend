'use client'

import { useState } from 'react'
import type React from 'react'
import { useRouter } from 'next/navigation'
import Cookies from 'js-cookie'
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
  Crown,
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
type AdminSection =
  | 'dashboard'
  | 'teachers'
  | 'students'
  | 'classes'
  | 'fees'
  | 'academic'
  | 'announcements'
  | 'schedule'
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

const initialTeachers: Teacher[] = [
  { id: 'TCH-001', name: 'Dr. Sarah Johnson', dept: 'Mathematics', email: 's.johnson@greenfield.edu', status: 'active', joined: '2018-08-15', rating: 4.8 },
  { id: 'TCH-002', name: 'Ms. Emily Carter', dept: 'English', email: 'e.carter@greenfield.edu', status: 'active', joined: '2019-01-10', rating: 4.5 },
  { id: 'TCH-003', name: 'Mr. Robert Chen', dept: 'Physics', email: 'r.chen@greenfield.edu', status: 'active', joined: '2020-03-20', rating: 4.7 },
  { id: 'TCH-004', name: 'Dr. Lisa Park', dept: 'Chemistry', email: 'l.park@greenfield.edu', status: 'active', joined: '2020-08-15', rating: 4.6 },
  { id: 'TCH-005', name: 'Mr. David Kim', dept: 'Computer Science', email: 'd.kim@greenfield.edu', status: 'active', joined: '2022-01-05', rating: 4.3 },
  { id: 'TCH-006', name: 'Mrs. Anna Williams', dept: 'History', email: 'a.williams@greenfield.edu', status: 'active', joined: '2017-09-01', rating: 4.9 },
  { id: 'TCH-007', name: 'Mr. Thomas Brown', dept: 'Biology', email: 't.brown@greenfield.edu', status: 'on-leave', joined: '2021-08-15', rating: 4.2 },
]

const initialClasses: ClassItem[] = [
  { id: 1, name: 'Grade 10 - Section A', code: 'G10-A', teacherId: 'TCH-001', studentCount: 32 },
  { id: 2, name: 'Grade 10 - Section B', code: 'G10-B', teacherId: 'TCH-002', studentCount: 30 },
  { id: 3, name: 'Grade 11 - Section A', code: 'G11-A', teacherId: 'TCH-003', studentCount: 28 },
  { id: 4, name: 'Grade 11 - Section B', code: 'G11-B', teacherId: 'TCH-004', studentCount: 29 },
  { id: 5, name: 'Grade 12 - Section A', code: 'G12-A', teacherId: 'TCH-005', studentCount: 26 },
  { id: 6, name: 'Grade 12 - Section B', code: 'G12-B', teacherId: 'TCH-006', studentCount: 27 },
]

const initialStudents: Student[] = [
  { id: 'STU-001', name: 'Alex Thompson', classId: 1, gender: 'Male', avgGrade: 87, attendance: 94, status: 'active', email: 'a.thompson@greenfield.edu' },
  { id: 'STU-002', name: 'Maria Santos', classId: 1, gender: 'Female', avgGrade: 92, attendance: 98, status: 'active', email: 'm.santos@greenfield.edu' },
  { id: 'STU-003', name: 'James Okonkwo', classId: 1, gender: 'Male', avgGrade: 74, attendance: 88, status: 'active', email: 'j.okonkwo@greenfield.edu' },
  { id: 'STU-004', name: 'Priya Sharma', classId: 1, gender: 'Female', avgGrade: 95, attendance: 99, status: 'active', email: 'p.sharma@greenfield.edu' },
  { id: 'STU-005', name: 'Chen Wei', classId: 2, gender: 'Male', avgGrade: 81, attendance: 91, status: 'active', email: 'c.wei@greenfield.edu' },
  { id: 'STU-006', name: 'David Kim', classId: 2, gender: 'Male', avgGrade: 68, attendance: 82, status: 'warning', email: 'd.kim2@greenfield.edu' },
  { id: 'STU-007', name: 'Aisha Mohammed', classId: 2, gender: 'Female', avgGrade: 90, attendance: 96, status: 'active', email: 'a.mohammed@greenfield.edu' },
  { id: 'STU-008', name: 'Lucas Fernandez', classId: 3, gender: 'Male', avgGrade: 78, attendance: 89, status: 'active', email: 'l.fernandez@greenfield.edu' },
  { id: 'STU-009', name: 'Sophie Laurent', classId: 3, gender: 'Female', avgGrade: 93, attendance: 97, status: 'active', email: 's.laurent@greenfield.edu' },
  { id: 'STU-010', name: 'Olivia Chen', classId: 3, gender: 'Female', avgGrade: 88, attendance: 95, status: 'active', email: 'o.chen@greenfield.edu' },
  { id: 'STU-011', name: 'Marcus Williams', classId: 4, gender: 'Male', avgGrade: 55, attendance: 72, status: 'at-risk', email: 'm.williams@greenfield.edu' },
  { id: 'STU-012', name: 'Fatima Al-Hassan', classId: 4, gender: 'Female', avgGrade: 91, attendance: 97, status: 'active', email: 'f.alhassan@greenfield.edu' },
  { id: 'STU-013', name: 'Yuki Tanaka', classId: 5, gender: 'Female', avgGrade: 96, attendance: 99, status: 'active', email: 'y.tanaka@greenfield.edu' },
  { id: 'STU-014', name: 'Ethan Brooks', classId: 5, gender: 'Male', avgGrade: 62, attendance: 78, status: 'warning', email: 'e.brooks@greenfield.edu' },
  { id: 'STU-015', name: 'Emily Brown', classId: 6, gender: 'Female', avgGrade: 85, attendance: 93, status: 'active', email: 'e.brown@greenfield.edu' },
  { id: 'STU-016', name: 'Ravi Patel', classId: 6, gender: 'Male', avgGrade: 79, attendance: 90, status: 'active', email: 'r.patel@greenfield.edu' },
]

const initialAnnouncements: Announcement[] = [
  { id: 1, title: 'Mid-Term Examination Schedule Released', date: '2025-01-20', source: 'Administration', recipient: 'Everyone', content: 'The mid-term examination schedule has been finalized. Examinations begin February 15.', important: true },
  { id: 2, title: 'Parent-Teacher Meeting - January 28', date: '2025-01-18', source: 'Principal', recipient: 'Parents', content: 'PTM scheduled for January 28, 9:00 AM to 1:00 PM in the main auditorium.', important: true },
  { id: 3, title: 'Staff Development Workshop', date: '2025-01-15', source: 'HR', recipient: 'Teachers', content: 'Workshop on modern teaching methodologies scheduled for February 5.', important: false },
  { id: 4, title: 'New Laboratory Equipment Installed', date: '2025-01-12', source: 'Science Dept', recipient: 'Teachers', content: 'Physics and chemistry lab equipment has been installed and is ready for use.', important: false },
]

const attendance = [
  { classId: 1, present: 30, total: 32, week: [94, 96, 91, 93, 95] },
  { classId: 2, present: 27, total: 30, week: [90, 88, 92, 87, 91] },
  { classId: 3, present: 27, total: 28, week: [96, 97, 95, 98, 97] },
  { classId: 4, present: 25, total: 29, week: [86, 84, 88, 82, 86] },
  { classId: 5, present: 25, total: 26, week: [96, 98, 97, 99, 96] },
  { classId: 6, present: 25, total: 27, week: [93, 91, 94, 92, 93] },
]

const gradeDistribution = [
  { range: 'A (90-100)', count: 38, tone: 'emerald' },
  { range: 'B (80-89)', count: 52, tone: 'blue' },
  { range: 'C (70-79)', count: 41, tone: 'amber' },
  { range: 'D (60-69)', count: 18, tone: 'orange' },
  { range: 'F (Below 60)', count: 11, tone: 'red' },
]

const feeTypes = [
  { type: 'Tuition', amount: 5000 },
  { type: 'Lab Fee', amount: 1500 },
  { type: 'Library', amount: 500 },
  { type: 'Transport', amount: 1200 },
]

const dayChoices = [
  { value: 0, label: 'Monday' },
  { value: 1, label: 'Tuesday' },
  { value: 2, label: 'Wednesday' },
  { value: 3, label: 'Thursday' },
  { value: 4, label: 'Friday' },
]

const timetableSlots = [
  { id: 'slot-001', course: 'Mathematics', teacher: 'Dr. Sarah Johnson', level: 'Grade 10', classSection: 'A', term: 'Second Term', dayOfWeek: 0, startTime: '08:00', endTime: '08:45', room: 'Room 101' },
  { id: 'slot-002', course: 'English Language', teacher: 'Ms. Emily Carter', level: 'Grade 10', classSection: 'B', term: 'Second Term', dayOfWeek: 0, startTime: '08:50', endTime: '09:35', room: 'Room 102' },
  { id: 'slot-003', course: 'Physics', teacher: 'Mr. Robert Chen', level: 'Grade 11', classSection: 'A', term: 'Second Term', dayOfWeek: 1, startTime: '09:40', endTime: '10:25', room: 'Lab 1' },
  { id: 'slot-004', course: 'Chemistry', teacher: 'Dr. Lisa Park', level: 'Grade 11', classSection: 'B', term: 'Second Term', dayOfWeek: 2, startTime: '10:40', endTime: '11:25', room: 'Lab 2' },
  { id: 'slot-005', course: 'Computer Science', teacher: 'Mr. David Kim', level: 'Grade 12', classSection: 'A', term: 'Second Term', dayOfWeek: 3, startTime: '11:30', endTime: '12:15', room: 'ICT Lab' },
  { id: 'slot-006', course: 'History', teacher: 'Mrs. Anna Williams', level: 'Grade 12', classSection: 'B', term: 'Second Term', dayOfWeek: 4, startTime: '12:20', endTime: '13:05', room: 'Room 201' },
]

const examSchedules = [
  { id: 'exam-001', course: 'Mathematics', level: 'Grade 10', term: 'Second Term', examDate: '2025-02-10', startTime: '09:00', endTime: '10:30', room: 'Main Hall', examType: 'MID_TERM' },
  { id: 'exam-002', course: 'English Language', level: 'Grade 10', term: 'Second Term', examDate: '2025-02-11', startTime: '09:00', endTime: '10:30', room: 'Main Hall', examType: 'MID_TERM' },
  { id: 'exam-003', course: 'Physics', level: 'Grade 11', term: 'Second Term', examDate: '2025-03-17', startTime: '11:00', endTime: '13:00', room: 'Lab 1', examType: 'END_OF_TERM' },
  { id: 'exam-004', course: 'Chemistry', level: 'Grade 11', term: 'Second Term', examDate: '2025-03-18', startTime: '11:00', endTime: '13:00', room: 'Lab 2', examType: 'END_OF_TERM' },
]

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
  return `NGN ${value.toLocaleString()}`
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
  const [dark, setDark] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [section, setSection] = useState<Section>('dashboard')
  const [teachers, setTeachers] = useState<Teacher[]>(initialTeachers)
  const [students, setStudents] = useState<Student[]>(initialStudents)
  const [classes, setClasses] = useState<ClassItem[]>(initialClasses)
  const [announcements, setAnnouncements] = useState<Announcement[]>(initialAnnouncements)
  const [search, setSearch] = useState('')
  const [classFilter, setClassFilter] = useState('all')
  const [feeTab, setFeeTab] = useState<'outstanding' | 'paid' | 'history'>('outstanding')
  const [showComposer, setShowComposer] = useState(false)
  const [createRole, setCreateRole] = useState<CreateRole | null>(null)
  const [formNotice, setFormNotice] = useState('')

  const totalStudents = classes.reduce((sum, item) => sum + item.studentCount, 0)
  const activeTeachers = teachers.filter((item) => item.status === 'active').length
  const totalPresent = attendance.reduce((sum, item) => sum + item.present, 0)
  const avgAttendance = pct(totalPresent, attendance.reduce((sum, item) => sum + item.total, 0))
  const atRiskCount = students.filter((item) => item.status === 'at-risk').length
  const totalFees = students.length * feeTypes.reduce((sum, item) => sum + item.amount, 0)
  const collectedFees = Math.round(totalFees * 0.75)
  const pendingFees = totalFees - collectedFees

  const isAdmin = role === 'admin'
  const navItems = isAdmin
    ? [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'teachers', label: 'Teachers', icon: GraduationCap },
        { id: 'students', label: 'Students', icon: Users },
        { id: 'classes', label: 'Classes', icon: School },
        { id: 'fees', label: 'Fee Collection', icon: Wallet },
        { id: 'academic', label: 'Academic', icon: CalendarDays },
        { id: 'announcements', label: 'Announcements', icon: Megaphone },
        { id: 'schedule', label: 'Schedule', icon: Calendar },
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
      ]

  function navigate(next: Section) {
    setSection(next)
    setShowComposer(false)
    setCreateRole(null)
    setFormNotice('')
    setSidebarOpen(false)
  }

  function logout() {
    Cookies.remove('access_token')
    Cookies.remove('refresh_token')
    Cookies.remove('active_role')
    router.push('/')
  }

  function addAnnouncement(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    setAnnouncements((current) => [
      {
        id: Math.max(...current.map((item) => item.id), 0) + 1,
        title: String(form.get('title') || ''),
        content: String(form.get('content') || ''),
        source: isAdmin ? 'Administration' : 'Principal',
        recipient: String(form.get('recipient') || 'Everyone'),
        important: form.get('important') === 'on',
        date: new Date().toISOString().slice(0, 10),
      },
      ...current,
    ])
    setShowComposer(false)
  }

  function openCreateUser(roleToCreate: CreateRole) {
    setCreateRole(roleToCreate)
    setFormNotice('')
  }

  function submitCreateUser(event: React.FormEvent<HTMLFormElement>) {
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

    const fullName = `${firstName} ${lastName}`.trim()
    const selectedRole = String(form.get('role') || createRole)
    const schoolIdPrefix = createRole === 'TEACHER' ? 'TCH' : 'STU'
    const nextId = createRole === 'TEACHER' ? teachers.length + 1 : students.length + 1
    const schoolId = `${schoolIdPrefix}-${String(nextId).padStart(3, '0')}`

    if (createRole === 'TEACHER') {
      setTeachers((current) => [
        ...current,
        {
          id: schoolId,
          name: fullName,
          dept: String(form.get('dept') || 'General Studies'),
          email,
          status: 'active',
          joined: new Date().toISOString().slice(0, 10),
          rating: 4.0,
        },
      ])
    } else {
      const classId = Number(form.get('class_id') || 1)
      setStudents((current) => [
        ...current,
        {
          id: schoolId,
          name: fullName,
          classId,
          gender: String(form.get('gender') || 'Female') as Student['gender'],
          avgGrade: 0,
          attendance: 100,
          status: 'active',
          email,
        },
      ])
      setClasses((current) => current.map((item) => item.id === classId ? { ...item, studentCount: item.studentCount + 1 } : item))
    }

    setFormNotice(`${fullName} created with ${selectedRole} role. Backend payload: first_name, last_name, email, phone, password, roles: ["${selectedRole}"].`)
    setCreateRole(null)
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
            {section === 'dashboard' && <DashboardHome role={role} totalStudents={totalStudents} activeTeachers={activeTeachers} avgAttendance={avgAttendance} atRiskCount={atRiskCount} collectedFees={collectedFees} pendingFees={pendingFees} classes={classes} teachers={teachers} announcements={announcements} navigate={navigate} setShowComposer={setShowComposer} />}
            {section === 'attendance' && <AttendancePage classes={classes} />}
            {section === 'academics' && <AcademicsPage classes={classes} students={students} />}
            {(section === 'staff' || section === 'teachers') && <PeoplePage role={role} kind="teachers" teachers={teachers} setTeachers={setTeachers} openCreateUser={openCreateUser} createRole={createRole} setCreateRole={setCreateRole} submitCreateUser={submitCreateUser} formNotice={formNotice} search={search} setSearch={setSearch} />}
            {section === 'students' && <StudentsPage role={role} students={students} setStudents={setStudents} classes={classes} search={search} setSearch={setSearch} classFilter={classFilter} setClassFilter={setClassFilter} openCreateUser={openCreateUser} createRole={createRole} setCreateRole={setCreateRole} submitCreateUser={submitCreateUser} formNotice={formNotice} />}
            {(section === 'finance' || section === 'fees') && <FinancePage role={role} students={students} classes={classes} totalFees={totalFees} collectedFees={collectedFees} pendingFees={pendingFees} feeTab={feeTab} setFeeTab={setFeeTab} />}
            {section === 'classes' && <ClassesPage classes={classes} setClasses={setClasses} teachers={teachers} addClass={addClass} />}
            {section === 'academic' && <AcademicPage />}
            {section === 'announcements' && <AnnouncementsPage announcements={announcements} setAnnouncements={setAnnouncements} showComposer={showComposer} setShowComposer={setShowComposer} addAnnouncement={addAnnouncement} />}
            {section === 'reports' && <ReportsPage />}
            {section === 'schedule' && <SchedulePage classes={classes} />}
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
        <StatCard icon={Wallet} tone="purple" value={money(props.collectedFees)} label="Fees Collected" badge={<Badge tone="purple">75%</Badge>} />
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
            {attendance.map((item) => {
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
            {gradeDistribution.map((item) => {
              const total = gradeDistribution.reduce((sum, grade) => sum + grade.count, 0)
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
              ['1 student at critical academic risk', 'red'],
              [`Fee collection at 75% - ${money(props.pendingFees)} outstanding`, 'cyan'],
              ['Parent-Teacher Meeting in 3 days', 'purple'],
            ].map(([text, tone]) => <div key={text} className="flex items-center gap-3 rounded-xl p-3 hover:bg-slate-50 dark:hover:bg-slate-800"><span className={`h-2.5 w-2.5 rounded-full ${toneClasses[tone].fill}`} /><p className="text-sm text-slate-700 dark:text-slate-200">{text}</p></div>)}
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
  const totalPresent = attendance.reduce((sum, item) => sum + item.present, 0)
  const total = attendance.reduce((sum, item) => sum + item.total, 0)
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
          {attendance.map((item) => (
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
        {attendance.map((item) => {
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

function FinancePage({ role, students, classes, totalFees, collectedFees, pendingFees, feeTab, setFeeTab }: { role: Role; students: Student[]; classes: ClassItem[]; totalFees: number; collectedFees: number; pendingFees: number; feeTab: 'outstanding' | 'paid' | 'history'; setFeeTab: (value: 'outstanding' | 'paid' | 'history') => void }) {
  const paidStudents = students.filter((_, index) => index % 3 === 0)
  const owingStudents = students.filter((_, index) => index % 3 !== 0)
  const progress = pct(collectedFees, totalFees)
  return (
    <div>
      <PageTitle title={role === 'admin' ? 'Fee Collection' : 'Finance Overview'} subtitle="Fee collection and financial summary" />
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon={Wallet} tone="cyan" value={money(totalFees)} label="Total Expected" />
        <StatCard icon={CheckCircle2} tone="emerald" value={money(collectedFees)} label="Collected" badge={<Badge tone="emerald">{progress}%</Badge>} />
        <StatCard icon={Calendar} tone="amber" value={money(pendingFees)} label="Outstanding" />
        <StatCard icon={FileBarChart} tone="blue" value={87} label="Receipts Issued" />
      </div>
      <Card className="mb-6 p-5">
        <div className="mb-2 flex items-center justify-between"><span className="text-sm font-medium text-slate-700 dark:text-slate-200">Collection Progress</span><span className="text-lg font-bold text-emerald-600">{progress}%</span></div>
        <div className="h-3 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800"><div className="h-full rounded-full bg-emerald-500" style={{ width: `${progress}%` }} /></div>
      </Card>
      {role === 'admin' && <div className="mb-5 flex gap-2 overflow-x-auto">{(['outstanding', 'paid', 'history'] as const).map((tab) => <button key={tab} onClick={() => setFeeTab(tab)} className={`rounded-lg border px-4 py-2.5 text-sm font-medium capitalize ${feeTab === tab ? 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950' : 'border-slate-200 bg-white text-slate-500 dark:border-slate-800 dark:bg-slate-900'}`}>{tab}</button>)}</div>}
      {role === 'admin' && feeTab !== 'history' ? <FeeStudentList students={feeTab === 'paid' ? paidStudents : owingStudents} classes={classes} paid={feeTab === 'paid'} /> : <ClassCollection classes={classes} />}
    </div>
  )
}

function FeeStudentList({ students, classes, paid }: { students: Student[]; classes: ClassItem[]; paid: boolean }) {
  return (
    <div className="space-y-2">
      {students.map((student, index) => <Card key={student.id} className={`flex items-center gap-4 p-4 ${paid ? 'border-emerald-100' : 'border-red-100'}`}><Avatar label={student.name} tone={paid ? 'emerald' : 'blue'} /><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><p className="text-sm font-medium text-slate-800 dark:text-slate-100">{student.name}</p><Badge tone={paid ? 'emerald' : index % 2 ? 'amber' : 'red'}>{paid ? 'Paid' : index % 2 ? 'Partial' : 'Unpaid'}</Badge></div><p className="text-xs text-slate-400">{student.id} - {classCode(classes, student.classId)}</p></div><div className="text-right"><p className={`text-[10px] font-medium uppercase ${paid ? 'text-emerald-500' : 'text-red-400'}`}>{paid ? 'Paid' : 'Owed'}</p><p className={`text-lg font-bold ${paid ? 'text-emerald-600' : 'text-red-500'}`}>{money(paid ? 8200 : 4100 + index * 250)}</p></div></Card>)}
    </div>
  )
}

function ClassCollection({ classes }: { classes: ClassItem[] }) {
  return <Card className="overflow-hidden"><div className="border-b border-slate-100 px-6 py-4 dark:border-slate-800"><h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Collection by Class</h2></div><div className="divide-y divide-slate-100 dark:divide-slate-800">{classes.map((item, index) => { const value = 70 + index * 4; return <div key={item.id} className="flex items-center gap-4 px-6 py-4"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-purple-50 text-purple-600 dark:bg-purple-950"><School className="h-5 w-5" /></div><div className="min-w-0 flex-1"><div className="mb-1 flex items-center justify-between"><p className="text-sm font-medium text-slate-800 dark:text-slate-100">{item.name}</p><span className="text-xs font-semibold text-emerald-600">{value}%</span></div><div className="h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800"><div className="h-full rounded-full bg-emerald-400" style={{ width: `${value}%` }} /></div></div></div> })}</div></Card>
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
  const terms = [
    ['First Term', '2024/2025', 'Sep 2, 2024', 'Dec 13, 2024', 'Completed'],
    ['Second Term', '2024/2025', 'Jan 6, 2025', 'Mar 28, 2025', 'Active'],
    ['Third Term', '2024/2025', 'Apr 14, 2025', 'Jul 4, 2025', 'Upcoming'],
  ]
  const events = ['Term Begins', 'Parent-Teacher Meeting', 'Mid-Term Examinations', 'Final Examinations', 'Report Cards Issued']
  return (
    <div>
      <PageTitle title="Academic" subtitle="Term management, calendar events, and holidays" />
      <Card className="mb-6 border-emerald-200 bg-emerald-50 p-6 dark:border-emerald-900 dark:bg-emerald-950">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-300">Current Term</p>
        <h2 className="mt-1 text-xl font-semibold text-emerald-900 dark:text-emerald-100">2024/2025 - Second Term</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-3"><InfoTile label="Start" value="Jan 6, 2025" /><InfoTile label="End" value="Mar 28, 2025" /><InfoTile label="Duration" value="81 days" /></div>
      </Card>
      <div className="grid gap-6 lg:grid-cols-2">
        <DataTable headers={['Term', 'Year', 'Start', 'End', 'Status']}>{terms.map((term) => <tr key={term[0]} className="border-b border-slate-100 dark:border-slate-800">{term.map((value, index) => <td key={value} className="px-5 py-3 text-sm">{index === 4 ? <Badge tone={value === 'Upcoming' ? 'amber' : 'emerald'}>{value}</Badge> : value}</td>)}</tr>)}</DataTable>
        <Card className="p-5"><h2 className="mb-4 text-sm font-semibold text-slate-900 dark:text-slate-100">Calendar Events</h2><div className="space-y-3">{events.map((event, index) => <div key={event} className="flex items-center gap-3 rounded-xl p-3 hover:bg-slate-50 dark:hover:bg-slate-800"><div className="text-center"><p className="text-lg font-semibold text-slate-800 dark:text-slate-100">{6 + index * 7}</p><p className="text-[10px] uppercase text-slate-400">Jan</p></div><p className="text-sm font-medium text-slate-700 dark:text-slate-200">{event}</p></div>)}</div></Card>
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

function SchedulePage({ classes }: { classes: ClassItem[] }) {
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
