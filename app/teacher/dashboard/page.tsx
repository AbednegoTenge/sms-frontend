'use client'

/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */

import { FormEvent, useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Cookies from 'js-cookie'
import { academicsApi, announcementsApi, assignmentsApi, quizzesApi, schedulesApi } from '@/lib/api/school'
import { useAuthStore } from '@/lib/store/authStore'
import {
  BarChart3,
  BookOpen,
  Calendar,
  Check,
  ChevronRight,
  ClipboardList,
  Download,
  GraduationCap,
  HelpCircle,
  LayoutDashboard,
  LogOut,
  Megaphone,
  Menu,
  Moon,
  Plus,
  Printer,
  Sun,
  Users,
  X,
} from 'lucide-react'

type Section =
  | 'dashboard'
  | 'classes'
  | 'class-detail'
  | 'assignments'
  | 'assign-create'
  | 'assign-detail'
  | 'quizzes'
  | 'quiz-create'
  | 'quiz-subs'
  | 'gradebook'
  | 'content'
  | 'evaluations'
  | 'support'
  | 'schedule'
  | 'announcements'
type ClassTab = 'students' | 'assignments' | 'quizzes' | 'grades'
type Submission = { id?: string; studentId: string; type: 'text' | 'file'; fileName?: string; fileSize?: string; text?: string; date: string; score: number | null }
type Assignment = { id: number; apiId: string; title: string; classId: number; due: string; maxScore: number; question: string; submissions: Submission[] }
type Quiz = { id: number; apiId: string; title: string; classId: number; due: string; maxScore: number; instructions: string; questions: { q: string; opts: string[]; correct: number }[]; submissions: { studentId: string; answers: number[]; score: number }[] }

type TeacherClass = { id: number; apiAssignmentId?: string; name: string; code: string; students: { id: string; name: string }[] }
type AnnouncementItem = { title: string; date: string; source: string; content: string; important: boolean }
type TimetableEntry = { dayOfWeek: number; startTime: string; endTime: string; courseCode: string; courseName: string }

const dayLabels = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
const periodLabels = ['8:00-8:45', '8:50-9:35', '9:40-10:25', '10:40-11:25', '11:30-12:15', '12:20-1:05', '1:10-1:55', '2:00-2:45']
const listItems = <T,>(value: unknown): T[] => {
  if (Array.isArray(value)) return value as T[]
  if (value && typeof value === 'object' && Array.isArray((value as { results?: unknown }).results)) return (value as { results: T[] }).results
  return []
}
const asRecord = (value: unknown): Record<string, unknown> => value && typeof value === 'object' ? value as Record<string, unknown> : {}
const textValue = (value: unknown, fallback = '') => typeof value === 'string' && value.trim() ? value : fallback
const numberValue = (value: unknown, fallback = 0) => {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'classes', label: 'My Classes', icon: Users },
  { id: 'assignments', label: 'Assignments', icon: ClipboardList },
  { id: 'quizzes', label: 'Quizzes', icon: HelpCircle },
  { id: 'gradebook', label: 'Gradebook', icon: BarChart3 },
  { id: 'content', label: 'Content', icon: BookOpen },
  { id: 'evaluations', label: 'Evaluations', icon: Check },
  { id: 'support', label: 'Support', icon: Download },
  { id: 'schedule', label: 'Schedule', icon: Calendar },
  { id: 'announcements', label: 'Announcements', icon: Megaphone },
] as const

const navSections = navItems.map((item) => item.id)
const detailSections: Section[] = ['class-detail', 'assign-create', 'assign-detail', 'quiz-create', 'quiz-subs']
const validSections: Section[] = [...navSections, ...detailSections]

function fmtDate(date: string) {
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function TeacherDashboard() {
  const router = useRouter()
  const pathname = usePathname()
  const authUser = useAuthStore((state) => state.user)
  const [section, setSection] = useState<Section>('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [dark, setDark] = useState(false)
  const [classes, setClasses] = useState<TeacherClass[]>([])
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [apiNotice, setApiNotice] = useState('Loading live teacher data from the API...')
  const [classId, setClassId] = useState(1)
  const [classTab, setClassTab] = useState<ClassTab>('students')
  const [assignId, setAssignId] = useState(101)
  const [quizId, setQuizId] = useState(201)
  const [assignFilter, setAssignFilter] = useState('all')
  const [quizFilter, setQuizFilter] = useState('all')
  const [selectedSubId, setSelectedSubId] = useState<string | null>(null)
  const [subFilter, setSubFilter] = useState('all')
  const [gradebookClassId, setGradebookClassId] = useState(1)
  const [createForClassId, setCreateForClassId] = useState<number | null>(null)
  const [newQuestions, setNewQuestions] = useState([{ question: '', options: ['', '', '', ''], correctIndex: 0 }])
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([])
  const [timetable, setTimetable] = useState<TimetableEntry[]>([])

  const teacher = { name: authUser?.full_name ?? 'Teacher', dept: 'Teaching Staff' }
  const studentName = (id: string) => classes.flatMap((c) => c.students).find((s) => s.id === id)?.name ?? id
  const classInfo = (id: number) => classes.find((c) => c.id === id)
  const ungradedCount = assignments.reduce((n, a) => n + a.submissions.filter((s) => s.score === null).length, 0)
  const ungradedForClass = (id: number) => assignments.filter((a) => a.classId === id).reduce((n, a) => n + a.submissions.filter((s) => s.score === null).length, 0)

  useEffect(() => {
    let cancelled = false

    async function loadTeacherData() {
      setApiNotice('Loading live teacher data from the API...')
      try {
        const [courseAssignments, assignmentRecords, quizRecords, announcementRecords, timetableRecords] = await Promise.all([
          academicsApi.assignments({ page_size: 100 }),
          assignmentsApi.list({ page_size: 100 }),
          quizzesApi.list({ page_size: 100 }),
          announcementsApi.list({ page_size: 20 }).catch(() => null),
          schedulesApi.timetables({ page_size: 100 }).catch(() => null),
        ])

        if (cancelled) return

        const apiClasses = listItems(courseAssignments).map((item, index): TeacherClass => {
          const record = asRecord(item)
          const course = asRecord(record.course)
          const level = asRecord(record.level)
          return {
            id: index + 1,
            apiAssignmentId: textValue(record.id),
            name: `${textValue(level.name, textValue(record.level_name, 'Class'))} - ${textValue(course.name, textValue(record.name, `Course ${index + 1}`))}`,
            code: textValue(course.code, textValue(record.code, `CLS-${index + 1}`)),
            students: listItems<Record<string, unknown>>(record.students).map((student, studentIndex) => {
              const studentRecord = asRecord(student)
              return {
                id: textValue(studentRecord.school_id, textValue(studentRecord.id, `STD-${studentIndex + 1}`)),
                name: textValue(studentRecord.full_name, `Student ${studentIndex + 1}`),
              }
            }),
          }
        })

        const classIdForCourse = (value: unknown) => {
          const record = asRecord(value)
          const course = asRecord(record.course)
          const code = textValue(course.code, textValue(record.course_code))
          const found = apiClasses.find((item) => item.code === code)
          return found?.id ?? apiClasses[0]?.id ?? 1
        }

        const mappedAssignments = listItems(assignmentRecords).map((item, index): Assignment => {
          const record = asRecord(item)
          return {
            id: numberValue(record.numeric_id, index + 1),
            apiId: textValue(record.id, String(index + 1)),
            title: textValue(record.title, `Assignment ${index + 1}`),
            classId: classIdForCourse(record),
            due: textValue(record.due_datetime, textValue(record.due, new Date().toISOString())),
            maxScore: numberValue(record.total_marks, numberValue(record.max_score, 100)),
            question: textValue(record.instructions, textValue(record.question)),
            submissions: [],
          }
        })

        const mappedQuizzes = listItems(quizRecords).map((item, index): Quiz => {
          const record = asRecord(item)
          return {
            id: numberValue(record.numeric_id, index + 1),
            apiId: textValue(record.id, String(index + 1)),
            title: textValue(record.title, `Quiz ${index + 1}`),
            classId: classIdForCourse(record),
            due: textValue(record.due_datetime, new Date().toISOString()),
            maxScore: numberValue(record.total_marks, 0),
            instructions: textValue(record.instructions),
            questions: [],
            submissions: [],
          }
        })

        setClasses(apiClasses)
        setAssignments(mappedAssignments)
        setQuizzes(mappedQuizzes)
        setAnnouncements(listItems(announcementRecords).map((item) => {
          const record = asRecord(item)
          return {
            title: textValue(record.title, 'Untitled announcement'),
            date: textValue(record.created_at, new Date().toISOString()),
            source: textValue(record.source, textValue(record.recipient_type, 'General')),
            content: textValue(record.body, textValue(record.content)),
            important: Boolean(record.important || record.is_important),
          }
        }))
        setTimetable(listItems(timetableRecords).map((item) => {
          const record = asRecord(item)
          const course = asRecord(record.course)
          return {
            dayOfWeek: numberValue(record.day_of_week, numberValue(record.day, 0)),
            startTime: textValue(record.start_time, '08:00'),
            endTime: textValue(record.end_time, '09:00'),
            courseCode: textValue(course.code, textValue(record.course_code, 'COURSE')),
            courseName: textValue(course.name, textValue(record.course_name, 'Course')),
          }
        }))
        setApiNotice(apiClasses.length || mappedAssignments.length || mappedQuizzes.length ? '' : 'No teacher course assignments, assignments, or quizzes were returned by the API.')
      } catch (error) {
        if (!cancelled) {
          setClasses([])
          setAssignments([])
          setQuizzes([])
          setApiNotice(error instanceof Error ? error.message : 'Could not load teacher data from the API.')
        }
      }
    }

    loadTeacherData()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    const parts = pathname.split('/').filter(Boolean)
    const pathSection = parts[2] as Section | undefined
    if (pathSection && validSections.includes(pathSection)) {
      setSection(pathSection)
    } else {
      setSection('dashboard')
    }
  }, [pathname])

  const sectionHref = (next: Section) => next === 'dashboard' ? '/teacher/dashboard' : `/teacher/dashboard/${next}`

  const updateUrl = (next: Section) => {
    window.history.pushState(null, '', sectionHref(next))
  }

  const go = (next: Section) => {
    setSection(next)
    setSelectedSubId(null)
    setSubFilter('all')
    setSidebarOpen(false)
    updateUrl(next)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const openClass = (id: number) => {
    setClassId(id)
    setClassTab('students')
    go('class-detail')
  }

  const openAssignment = async (id: number) => {
    setAssignId(id)
    setSelectedSubId(null)
    setSubFilter('all')
    const assignment = assignments.find((item) => item.id === id)
    if (assignment) {
      try {
        const submissions = listItems(await assignmentsApi.submissions(assignment.apiId))
        setAssignments((items) => items.map((item) => item.id === id ? {
          ...item,
          submissions: submissions.map((sub, index): Submission => {
            const record = asRecord(sub)
            const student = asRecord(record.student)
            return {
              id: textValue(record.id, `sub-${index}`),
              studentId: textValue(student.school_id, textValue(record.student_id, `STD-${index + 1}`)),
              type: record.file || record.file_name ? 'file' : 'text',
              fileName: textValue(record.file_name),
              fileSize: textValue(record.file_size),
              text: textValue(record.text_content),
              date: textValue(record.submitted_at, new Date().toISOString()),
              score: typeof record.marks_obtained === 'number' ? record.marks_obtained : typeof record.score === 'number' ? record.score : null,
            }
          }),
        } : item))
      } catch {
        // keep empty submissions if API unavailable
      }
    }
    go('assign-detail')
  }

  const openQuiz = async (id: number) => {
    setQuizId(id)
    const quiz = quizzes.find((item) => item.id === id)
    if (quiz) {
      try {
        const submissions = listItems(await quizzesApi.submissions(quiz.apiId))
        setQuizzes((items) => items.map((item) => item.id === id ? {
          ...item,
          submissions: submissions.map((sub, index) => {
            const record = asRecord(sub)
            const student = asRecord(record.student)
            return {
              studentId: textValue(student.school_id, textValue(record.student_id, `STD-${index + 1}`)),
              answers: [],
              score: numberValue(record.score, 0),
            }
          }),
        } : item))
      } catch {
        // keep empty submissions if API unavailable
      }
    }
    go('quiz-subs')
  }

  const logout = () => {
    Cookies.remove('access_token')
    Cookies.remove('refresh_token')
    Cookies.remove('active_role')
    router.replace('/')
  }

  const createAssignment = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const classInfoItem = classes.find((item) => item.id === Number(form.get('classId')))
    try {
      const created = asRecord(await assignmentsApi.create({
        title: String(form.get('title') || ''),
        due_datetime: String(form.get('due') || ''),
        total_marks: Number(form.get('maxScore') || 100),
        instructions: String(form.get('question') || ''),
        assignment_id: classInfoItem?.apiAssignmentId,
      }))
      const nextAssignment: Assignment = {
        id: Math.max(...assignments.map((a) => a.id), 0) + 1,
        apiId: textValue(created.id, String(Math.max(...assignments.map((a) => a.id), 0) + 1)),
        title: String(form.get('title') || ''),
        classId: Number(form.get('classId')),
        due: String(form.get('due') || ''),
        maxScore: Number(form.get('maxScore') || 100),
        question: String(form.get('question') || ''),
        submissions: [],
      }
      setAssignments((items) => [nextAssignment, ...items])
      go('assignments')
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Could not create assignment.')
    }
  }

  const createQuiz = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (newQuestions.some((q) => !q.question.trim() || q.options.some((option) => !option.trim()))) {
      alert('Complete every question and option before creating the quiz.')
      return
    }
    const form = new FormData(event.currentTarget)
    const classInfoItem = classes.find((item) => item.id === Number(form.get('classId')))
    try {
      const created = asRecord(await quizzesApi.create({
        assignment_id: classInfoItem?.apiAssignmentId,
        title: String(form.get('title') || ''),
        due_datetime: String(form.get('due') || ''),
        max_attempts: 2,
        total_marks: newQuestions.length * 5,
        questions: newQuestions.map((q, index) => ({
          question_text: q.question,
          question_type: 'MULTIPLE_CHOICE',
          marks: 5,
          order: index + 1,
          choices: q.options.map((text, choiceIndex) => ({ text, is_correct: choiceIndex === q.correctIndex })),
        })),
      }))
      const nextQuiz: Quiz = {
        id: Math.max(...quizzes.map((q) => q.id), 0) + 1,
        apiId: textValue(created.id, String(Math.max(...quizzes.map((q) => q.id), 0) + 1)),
        title: String(form.get('title') || ''),
        classId: Number(form.get('classId')),
        due: String(form.get('due') || ''),
        maxScore: newQuestions.length * 5,
        instructions: String(form.get('instructions') || ''),
        questions: newQuestions.map((q) => ({ q: q.question, opts: q.options, correct: q.correctIndex })),
        submissions: [],
      }
      setQuizzes((items) => [nextQuiz, ...items])
      setNewQuestions([{ question: '', options: ['', '', '', ''], correctIndex: 0 }])
      go('quizzes')
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Could not create quiz.')
    }
  }

  const gradeSubmission = async (assignmentId: number, studentId: string, rawScore: string) => {
    const assignment = assignments.find((a) => a.id === assignmentId)
    if (!assignment) return
    const score = Number(rawScore)
    if (Number.isNaN(score) || score < 0 || score > assignment.maxScore) {
      alert(`Enter a valid score from 0 to ${assignment.maxScore}.`)
      return
    }
    const submission = assignment.submissions.find((s) => s.studentId === studentId)
    if (!submission?.id) {
      alert('Submission record not available for grading.')
      return
    }
    try {
      await assignmentsApi.grade(submission.id, { marks_obtained: score, feedback: '' })
      setAssignments((items) => items.map((a) => a.id === assignmentId ? { ...a, submissions: a.submissions.map((s) => s.studentId === studentId ? { ...s, score } : s) } : a))
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Could not save grade.')
    }
  }

  return (
    <div className={`${dark ? 'dark' : ''}`}>
      <div className="h-screen overflow-hidden bg-slate-50 font-sans text-slate-900 dark:bg-[#0B0F19] dark:text-slate-200">
        <div className="fixed left-0 right-0 top-0 z-30 flex h-14 items-center justify-between border-b border-slate-200 bg-white px-4 dark:border-slate-800 dark:bg-slate-900 lg:hidden">
          <div className="flex items-center gap-2.5">
            <button onClick={() => setSidebarOpen(true)} className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"><Menu className="h-5 w-5 text-slate-600" /></button>
            <Brand compact />
          </div>
          <button onClick={() => setDark((value) => !value)} className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">{dark ? <Sun className="h-5 w-5 text-slate-400" /> : <Moon className="h-5 w-5 text-slate-500" />}</button>
        </div>
        {sidebarOpen && <button aria-label="Close menu" className="fixed inset-0 z-40 bg-black/40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

        <div className="flex h-full">
          <aside className={`fixed z-50 flex h-full w-60 flex-col border-r border-slate-200 bg-white transition-transform duration-200 dark:border-slate-800 dark:bg-slate-900 lg:static lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
            <div className="hidden h-16 shrink-0 items-center gap-3 border-b border-slate-100 px-5 dark:border-slate-800 lg:flex"><Brand /></div>
            <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
              {navItems.map(({ id, label, icon: Icon }) => {
                const active = id === section || (section === 'class-detail' && id === 'classes') || (section.startsWith('assign') && id === 'assignments') || (section.startsWith('quiz') && id === 'quizzes')
                return <button key={id} onClick={() => go(id)} className={`flex w-full items-center gap-3 rounded-l-lg px-3 py-2.5 text-left text-sm font-medium transition-colors ${active ? 'border-r-[3px] border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' : 'text-slate-500 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800'}`}><Icon className="h-5 w-5" />{label}</button>
              })}
            </nav>
            <div className="shrink-0 space-y-3 border-t border-slate-100 p-4 dark:border-slate-800">
              <button onClick={() => setDark((value) => !value)} className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm text-slate-600 transition-colors hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800">
                <span className="flex items-center gap-2.5">{dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}{dark ? 'Light Mode' : 'Dark Mode'}</span>
                <span className={`relative h-[22px] w-10 rounded-full transition-colors ${dark ? 'bg-emerald-500' : 'bg-slate-200'}`}><span className={`absolute top-[3px] h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${dark ? 'translate-x-[21px]' : 'translate-x-[3px]'}`} /></span>
              </button>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-slate-100 bg-emerald-50 text-sm font-semibold text-emerald-700 dark:border-slate-700 dark:bg-emerald-950 dark:text-emerald-300">SJ</div>
                <div className="min-w-0"><p className="truncate text-sm font-medium text-slate-800 dark:text-slate-100">{teacher.name}</p><p className="truncate text-[11px] text-slate-400">{teacher.dept}</p></div>
              </div>
              <button onClick={logout} className="flex w-full items-center justify-center gap-2 rounded-lg py-2 text-xs text-slate-400 transition-colors hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950"><LogOut className="h-4 w-4" />Sign out</button>
            </div>
          </aside>

          <main className="flex-1 overflow-y-auto pt-14 lg:pt-0">
            <div className="max-w-7xl p-5 lg:p-8">
              {apiNotice && <div className="mb-5 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-xs font-medium text-amber-700 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-300">{apiNotice}</div>}
              {section === 'dashboard' && <Dashboard teacher={teacher} classes={classes} assignments={assignments} quizzes={quizzes} ungradedCount={ungradedCount} ungradedForClass={ungradedForClass} openClass={openClass} openAssignment={openAssignment} studentName={studentName} classInfo={classInfo} />}
              {section === 'classes' && <ClassesView classes={classes} assignments={assignments} quizzes={quizzes} ungradedForClass={ungradedForClass} openClass={openClass} />}
              {section === 'class-detail' && <ClassDetail classId={classId} classes={classes} assignments={assignments} quizzes={quizzes} tab={classTab} setTab={setClassTab} openAssignment={openAssignment} openQuiz={openQuiz} createAssignment={(id: number) => { setCreateForClassId(id); go('assign-create') }} createQuiz={(id: number) => { setCreateForClassId(id); setNewQuestions([{ question: '', options: ['', '', '', ''], correctIndex: 0 }]); go('quiz-create') }} />}
              {section === 'assignments' && <AssignmentsView assignments={assignments} classes={classes} filter={assignFilter} setFilter={setAssignFilter} openAssignment={openAssignment} create={() => { setCreateForClassId(null); go('assign-create') }} />}
              {section === 'assign-create' && <AssignmentCreate classes={classes} defaultClassId={createForClassId} onSubmit={createAssignment} cancel={() => go('assignments')} />}
              {section === 'assign-detail' && <AssignmentDetail assignment={assignments.find((a) => a.id === assignId)!} classes={classes} studentName={studentName} selectedSubId={selectedSubId} setSelectedSubId={setSelectedSubId} subFilter={subFilter} setSubFilter={setSubFilter} gradeSubmission={gradeSubmission} back={() => go('assignments')} />}
              {section === 'quizzes' && <QuizzesView quizzes={quizzes} classes={classes} filter={quizFilter} setFilter={setQuizFilter} openQuiz={openQuiz} create={() => { setCreateForClassId(null); setNewQuestions([{ question: '', options: ['', '', '', ''], correctIndex: 0 }]); go('quiz-create') }} />}
              {section === 'quiz-create' && <QuizCreate classes={classes} defaultClassId={createForClassId} questions={newQuestions} setQuestions={setNewQuestions} onSubmit={createQuiz} cancel={() => go('quizzes')} />}
              {section === 'quiz-subs' && <QuizSubmissions quiz={quizzes.find((q) => q.id === quizId)!} classes={classes} studentName={studentName} back={() => go('quizzes')} />}
              {section === 'gradebook' && <Gradebook classes={classes} assignments={assignments} quizzes={quizzes} selectedClassId={gradebookClassId} setSelectedClassId={setGradebookClassId} />}
              {section === 'content' && <TeacherApiFeaturePage title="Course Content" subtitle="Manage uploaded resources and weekly outlines." features={['GET/POST /assignments/{assignment_id}/resources', 'GET/PUT /assignments/{assignment_id}/outline', 'Multipart upload controls for PDF, documents, and lesson files']} />}
              {section === 'evaluations' && <TeacherApiFeaturePage title="My Evaluations" subtitle="View evaluation feedback received from students." features={['GET /evaluations scoped to the logged-in teacher', 'Aggregate rating summaries', 'Student comments when returned by the backend']} />}
              {section === 'support' && <TeacherApiFeaturePage title="Support Tickets" subtitle="Create and track support requests." features={['GET /support-tickets for your tickets', 'POST /support-tickets to request help', 'Show ticket status and assignment']} />}
              {section === 'schedule' && <Schedule classes={classes} timetable={timetable} />}
              {section === 'announcements' && <Announcements items={announcements} />}
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}

function Brand({ compact = false }: { compact?: boolean }) {
  return <><div className={`${compact ? 'h-7 w-7' : 'h-9 w-9'} flex items-center justify-center rounded-lg bg-slate-900`}><GraduationCap className={`${compact ? 'h-3.5 w-3.5' : 'h-5 w-5'} text-emerald-400`} /></div><div><span className={`${compact ? 'text-sm' : 'text-sm'} block font-semibold leading-tight`}>Greenfield Academy</span>{!compact && <span className="text-[10px] text-slate-400">Teacher Portal</span>}</div></>
}

function Badge({ children, tone = 'slate' }: { children: React.ReactNode; tone?: 'emerald' | 'blue' | 'amber' | 'slate' | 'red' }) {
  const styles = { emerald: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300', blue: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300', amber: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300', slate: 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-300', red: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300' }
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-medium ${styles[tone]}`}>{children}</span>
}

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`rounded-2xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800 ${className}`}>{children}</div>
}

function statCard(icon: React.ReactNode, value: React.ReactNode, label: string) {
  return <Card className="p-5"><div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-300">{icon}</div><p className="text-2xl font-semibold">{value}</p><p className="mt-0.5 text-xs text-slate-400">{label}</p></Card>
}

function Dashboard({ teacher, classes, assignments, quizzes, ungradedCount, ungradedForClass, openClass, openAssignment, studentName, classInfo }: any) {
  const recent = assignments.flatMap((a: Assignment) => a.submissions.map((s) => ({ ...s, assignment: a }))).sort((a: any, b: any) => +new Date(b.date) - +new Date(a.date)).slice(0, 5)
  return <div><h1 className="mb-1 text-2xl font-semibold">Welcome back, {teacher.name.split(' ')[0]}</h1><p className="mb-8 text-sm text-slate-400">{teacher.dept} - {classes.length} classes</p><div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">{statCard(<Users className="h-5 w-5" />, classes.reduce((n: number, c: any) => n + c.students.length, 0), 'Total Students')}{statCard(<BookOpen className="h-5 w-5" />, classes.length, 'My Classes')}{statCard(<ClipboardList className="h-5 w-5" />, <>{ungradedCount}</>, 'To Grade')}{statCard(<HelpCircle className="h-5 w-5" />, assignments.length + quizzes.length, 'Assessments')}</div><div className="grid gap-6 lg:grid-cols-2"><div><h2 className="mb-4 text-sm font-semibold">My Classes</h2><div className="space-y-3">{classes.map((c: any) => <button key={c.id} onClick={() => openClass(c.id)} className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white p-4 text-left transition hover:-translate-y-0.5 hover:shadow-lg dark:border-slate-700 dark:bg-slate-800"><div><p className="text-sm font-medium">{c.code} - {c.name}</p><p className="mt-0.5 text-xs text-slate-400">{c.students.length} students {ungradedForClass(c.id) > 0 && <span className="text-amber-600">- {ungradedForClass(c.id)} to grade</span>}</p></div><ChevronRight className="h-4 w-4 text-slate-300" /></button>)}</div></div><div><h2 className="mb-4 text-sm font-semibold">Recent Submissions</h2><div className="space-y-3">{recent.map((s: any) => <button key={`${s.assignment.id}-${s.studentId}`} onClick={() => openAssignment(s.assignment.id)} className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white p-4 text-left transition hover:-translate-y-0.5 hover:shadow-lg dark:border-slate-700 dark:bg-slate-800"><div className="min-w-0"><p className="truncate text-sm font-medium">{studentName(s.studentId)} - {s.assignment.title}</p><p className="mt-0.5 text-xs text-slate-400">{classInfo(s.assignment.classId)?.code} - {s.type === 'text' ? 'Text' : 'File'} - {fmtDate(s.date)}</p></div>{s.score === null ? <Badge tone="amber">Ungraded</Badge> : <Badge tone="emerald">{s.score}/{s.assignment.maxScore}</Badge>}</button>)}</div></div></div></div>
}

function ClassesView({ classes, assignments, quizzes, ungradedForClass, openClass }: any) {
  return <div><PageTitle title="My Classes" subtitle={`${classes.length} classes assigned`} /><div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{classes.map((c: any) => { const ta = assignments.filter((a: Assignment) => a.classId === c.id).length; const tq = quizzes.filter((q: Quiz) => q.classId === c.id).length; const ug = ungradedForClass(c.id); return <button key={c.id} onClick={() => openClass(c.id)} className="overflow-hidden rounded-2xl border border-slate-200 bg-white text-left transition hover:-translate-y-0.5 hover:shadow-lg dark:border-slate-700 dark:bg-slate-800"><div className="h-1.5 bg-emerald-50"><div className="h-full w-3/4 rounded-r-full bg-emerald-500" /></div><div className="p-6"><div className="mb-3 flex items-start justify-between"><div><h3 className="font-semibold">{c.name}</h3><p className="mt-1 text-xs text-slate-400">{c.code}</p></div>{ug > 0 ? <Badge tone="amber">{ug} to grade</Badge> : <Badge tone="emerald">All graded</Badge>}</div><p className="mb-4 text-xs text-slate-500">{c.students.length} students - {ta} assignments - {tq} quizzes</p><span className="text-xs font-medium text-emerald-600">View</span></div></button> })}</div></div>
}

function ClassDetail({ classId, classes, assignments, quizzes, tab, setTab, openAssignment, openQuiz, createAssignment, createQuiz }: any) {
  const c = classes.find((item: any) => item.id === classId)
  const ca = assignments.filter((a: Assignment) => a.classId === classId)
  const cq = quizzes.filter((q: Quiz) => q.classId === classId)
  if (!c) return null
  return <div><Crumbs items={['My Classes', c.name]} /><div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center"><div><h1 className="text-2xl font-semibold">{c.name}</h1><p className="mt-1 text-sm text-slate-400">{c.code} - {c.students.length} students</p></div><div className="flex gap-2"><button onClick={() => createAssignment(c.id)} className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-500"><Plus className="h-4 w-4" />Assignment</button><button onClick={() => createQuiz(c.id)} className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900"><Plus className="h-4 w-4" />Quiz</button></div></div><Tabs value={tab} onChange={setTab} items={['students', 'assignments', 'quizzes', 'grades']} /><ClassTabContent c={c} ca={ca} cq={cq} tab={tab} openAssignment={openAssignment} openQuiz={openQuiz} /></div>
}

function ClassTabContent({ c, ca, cq, tab, openAssignment, openQuiz }: any) {
  if (tab === 'students') return <Card className="overflow-hidden"><table className="w-full text-sm"><thead className="bg-slate-50 dark:bg-slate-900"><tr><Th>Student</Th><Th>ID</Th><Th>Assignments</Th><Th>Quizzes</Th></tr></thead><tbody>{c.students.map((s: any) => <tr key={s.id} className="border-t border-slate-100 dark:border-slate-700"><Td strong>{s.name}</Td><Td mono>{s.id}</Td><Td>{ca.filter((a: Assignment) => a.submissions.some((sub) => sub.studentId === s.id)).length}/{ca.length}</Td><Td>{cq.filter((q: Quiz) => q.submissions.some((sub) => sub.studentId === s.id)).length}/{cq.length}</Td></tr>)}</tbody></table></Card>
  if (tab === 'assignments') return <div className="space-y-3">{ca.map((a: Assignment) => <ListButton key={a.id} onClick={() => openAssignment(a.id)} title={a.title} meta={`Due ${fmtDate(a.due)} - ${a.maxScore} pts - ${a.submissions.length} submitted`} badge={a.submissions.some((s) => s.score === null) ? `${a.submissions.filter((s) => s.score === null).length} to grade` : 'All graded'} tone={a.submissions.some((s) => s.score === null) ? 'amber' : 'emerald'} />)}</div>
  if (tab === 'quizzes') return <div className="space-y-3">{cq.map((q: Quiz) => <ListButton key={q.id} onClick={() => openQuiz(q.id)} title={q.title} meta={`${q.questions.length} Qs - ${q.maxScore} pts - ${q.submissions.length} taken`} badge={`${q.submissions.length} graded`} tone="blue" />)}</div>
  return <GradesSummary c={c} assessments={[...ca, ...cq]} />
}

function AssignmentsView({ assignments, classes, filter, setFilter, openAssignment, create }: any) {
  const decorated = assignments.map((a: Assignment) => ({ ...a, classCode: classes.find((c: any) => c.id === a.classId)?.code, ungraded: a.submissions.filter((s) => s.score === null).length }))
  const filtered = filter === 'all' ? decorated : decorated.filter((a: any) => filter === 'pending' ? a.ungraded > 0 : a.ungraded === 0)
  return <div><div className="mb-8 flex items-center justify-between"><PageTitle title="Assignments" subtitle={`${assignments.length} total across classes`} tight /><button onClick={create} className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-emerald-500"><Plus className="h-4 w-4" />New Assignment</button></div><FilterBar value={filter} onChange={setFilter} items={['all', 'pending', 'graded']} /> <div className="space-y-3">{filtered.map((a: any) => <ListButton key={a.id} onClick={() => openAssignment(a.id)} title={a.title} meta={`${a.classCode} - Due ${fmtDate(a.due)} - ${a.maxScore} pts - ${a.submissions.length} submitted`} badge={a.ungraded ? `${a.ungraded} to grade` : 'All graded'} tone={a.ungraded ? 'amber' : 'emerald'} />)}</div></div>
}

function AssignmentCreate({ classes, defaultClassId, onSubmit, cancel }: any) {
  return <div><Crumbs items={['Assignments', 'New Assignment']} /><div className="max-w-2xl"><h1 className="mb-6 text-2xl font-semibold">Create Assignment</h1><Card className="p-8"><form onSubmit={onSubmit} className="space-y-5"><Field label="Title"><input required name="title" className="input-field px-4" placeholder="e.g. Algebra Problem Set" /></Field><div className="grid gap-4 sm:grid-cols-3"><Field label="Class"><select name="classId" defaultValue={defaultClassId ?? classes[0].id} className="input-field px-4">{classes.map((c: any) => <option key={c.id} value={c.id}>{c.code} - {c.name}</option>)}</select></Field><Field label="Due Date"><input required name="due" type="date" className="input-field px-4" /></Field><Field label="Max Score"><input name="maxScore" type="number" min="1" defaultValue="100" className="input-field px-4" /></Field></div><Field label="Instructions"><textarea required name="question" rows={4} className="input-field resize-none px-4" /></Field><FormActions cancel={cancel} submit="Create Assignment" /></form></Card></div></div>
}

function AssignmentDetail({ assignment, classes, studentName, selectedSubId, setSelectedSubId, subFilter, setSubFilter, gradeSubmission, back }: any) {
  if (!assignment) return null
  const c = classes.find((item: any) => item.id === assignment.classId)
  const studentIds = c.students.map((s: any) => s.id)
  const missing = studentIds.filter((id: string) => !assignment.submissions.some((s: Submission) => s.studentId === id))
  const graded = assignment.submissions.filter((s: Submission) => s.score !== null).length
  const ungraded = assignment.submissions.length - graded
  const selected = assignment.submissions.find((s: Submission) => s.studentId === selectedSubId)
  const rows = subFilter === 'graded' ? assignment.submissions.filter((s: Submission) => s.score !== null) : subFilter === 'pending' ? assignment.submissions.filter((s: Submission) => s.score === null) : assignment.submissions
  return <div><Crumbs items={['Assignments', assignment.title]} /><div className="grid gap-6 lg:grid-cols-[1fr_340px]"><div className="space-y-6"><Card className="p-6"><div className="mb-4 flex items-start justify-between"><div><h1 className="text-xl font-semibold">{assignment.title}</h1><p className="mt-1.5 text-xs text-slate-400">{c.code} - Due {fmtDate(assignment.due)} - Max {assignment.maxScore} pts</p></div>{ungraded ? <Badge tone="amber">{ungraded} Pending</Badge> : <Badge tone="emerald">Fully Graded</Badge>}</div><div className="mb-5 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">{assignment.question}</div><div className="grid grid-cols-2 gap-3 sm:grid-cols-5">{[['Submitted', `${assignment.submissions.length}/${studentIds.length}`], ['Files', assignment.submissions.filter((s: Submission) => s.type === 'file').length], ['Text', assignment.submissions.filter((s: Submission) => s.type === 'text').length], ['Pending', ungraded], ['Missing', missing.length]].map(([label, value]) => <div key={label} className="rounded-xl bg-slate-50 p-3.5 text-center dark:bg-slate-900"><p className="mb-1 text-[10px] uppercase tracking-wider text-slate-400">{label}</p><p className="font-semibold">{value}</p></div>)}</div></Card>{selected ? <SubmissionDetail assignment={assignment} submission={selected} studentName={studentName} gradeSubmission={gradeSubmission} /> : <Card className="p-12 text-center text-sm text-slate-400">Select a submission from the panel to view details and grade.</Card>}</div><Card className="overflow-hidden lg:sticky lg:top-8"><div className="border-b border-slate-100 px-4 py-3 dark:border-slate-700"><h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Submissions ({assignment.submissions.length}/{studentIds.length})</h3><FilterBar compact value={subFilter} onChange={setSubFilter} items={['all', 'graded', 'pending']} /></div><div className="max-h-[calc(100vh-280px)] overflow-y-auto">{rows.map((s: Submission) => <button key={s.studentId} onClick={() => setSelectedSubId(s.studentId)} className={`flex w-full items-center gap-3 border-b border-slate-100 px-4 py-3 text-left hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-900 ${selectedSubId === s.studentId ? 'border-l-[3px] border-l-emerald-500 bg-emerald-50 dark:bg-emerald-950' : ''}`}><div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-500 dark:bg-slate-700">{studentName(s.studentId).charAt(0)}</div><div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{studentName(s.studentId)}</p><p className="truncate text-[11px] text-slate-400">{s.type === 'text' ? 'Text submission' : s.fileName} - {fmtDate(s.date)}</p></div>{s.score === null ? <Badge tone="amber">Grade</Badge> : <span className="text-xs font-bold text-emerald-600">{s.score}</span>}</button>)}{subFilter === 'all' && missing.map((id: string) => <div key={id} className="flex items-center gap-3 border-b border-slate-100 px-4 py-3 text-slate-300 dark:border-slate-700"><div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-xs">{studentName(id).charAt(0)}</div><div className="flex-1"><p className="text-sm">{studentName(id)}</p><p className="text-[11px]">Not submitted</p></div></div>)}</div></Card></div></div>
}

function SubmissionDetail({ assignment, submission, studentName, gradeSubmission }: any) {
  const [score, setScore] = useState('')
  return <Card className="overflow-hidden"><div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 dark:border-slate-700"><div><p className="text-sm font-semibold">{studentName(submission.studentId)}</p><p className="font-mono text-xs text-slate-400">{submission.studentId} - Submitted {fmtDate(submission.date)}</p></div>{submission.score !== null && <Badge tone="emerald">{submission.score}/{assignment.maxScore}</Badge>}</div><div className="space-y-4 p-6">{submission.type === 'text' ? <div className="max-h-[400px] overflow-y-auto whitespace-pre-wrap rounded-xl border border-slate-200 bg-slate-50 p-5 text-sm leading-7 text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">{submission.text}</div> : <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900"><ClipboardList className="h-5 w-5 text-slate-400" /><div className="flex-1"><p className="text-sm font-medium">{submission.fileName}</p><p className="text-xs text-slate-400">{submission.fileSize}</p></div><button onClick={() => alert(`${submission.fileName} downloaded.`)} className="rounded-lg p-2 hover:bg-slate-200 dark:hover:bg-slate-700"><Download className="h-4 w-4" /></button></div>}{submission.score === null ? <div className="flex items-center justify-between rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950"><div><p className="text-sm font-medium text-amber-800 dark:text-amber-200">Grade this submission</p><p className="text-xs text-amber-600 dark:text-amber-300">Enter a score out of {assignment.maxScore}</p></div><div className="flex items-center gap-2"><input value={score} onChange={(e) => setScore(e.target.value)} className="input-field w-20 px-3 text-center" type="number" min="0" max={assignment.maxScore} /><button onClick={() => gradeSubmission(assignment.id, submission.studentId, score)} className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-medium text-white hover:bg-emerald-500">Save</button></div></div> : <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-200">Score: {submission.score} / {assignment.maxScore}</div>}</div></Card>
}

function QuizzesView({ quizzes, classes, filter, setFilter, openQuiz, create }: any) {
  const decorated = quizzes.map((q: Quiz) => ({ ...q, classCode: classes.find((c: any) => c.id === q.classId)?.code, ungraded: 0 }))
  const filtered = filter === 'all' ? decorated : decorated.filter((q: any) => filter === 'graded' ? q.ungraded === 0 : q.ungraded > 0)
  return <div><div className="mb-8 flex items-center justify-between"><PageTitle title="Quizzes" subtitle={`${quizzes.length} total`} tight /><button onClick={create} className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900"><Plus className="h-4 w-4" />New Quiz</button></div><FilterBar value={filter} onChange={setFilter} items={['all', 'pending', 'graded']} /><div className="space-y-3">{filtered.map((q: any) => <ListButton key={q.id} onClick={() => openQuiz(q.id)} title={q.title} meta={`${q.classCode} - ${q.questions.length} Qs - ${q.maxScore} pts - ${q.submissions.length} taken`} badge="All graded" tone="emerald" />)}</div></div>
}

function QuizCreate({ classes, defaultClassId, questions, setQuestions, onSubmit, cancel }: any) {
  return <div><Crumbs items={['Quizzes', 'New Quiz']} /><div className="max-w-2xl"><h1 className="mb-6 text-2xl font-semibold">Create Quiz</h1><Card className="p-8"><form onSubmit={onSubmit} className="space-y-5"><Field label="Title"><input required name="title" className="input-field px-4" placeholder="e.g. Algebra Quiz 2" /></Field><div className="grid gap-4 sm:grid-cols-2"><Field label="Class"><select name="classId" defaultValue={defaultClassId ?? classes[0].id} className="input-field px-4">{classes.map((c: any) => <option key={c.id} value={c.id}>{c.code} - {c.name}</option>)}</select></Field><Field label="Due Date"><input required name="due" type="date" className="input-field px-4" /></Field></div><Field label="Instructions"><textarea name="instructions" rows={2} className="input-field resize-none px-4" /></Field><div className="flex items-center justify-between"><p className="text-xs font-medium uppercase tracking-wider text-slate-500">Questions ({questions.length})</p><button type="button" onClick={() => setQuestions([...questions, { question: '', options: ['', '', '', ''], correctIndex: 0 }])} className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600"><Plus className="h-4 w-4" />Add Question</button></div>{questions.map((q: any, i: number) => <div key={i} className="rounded-xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-900"><div className="mb-3 flex items-center justify-between"><span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Question {i + 1}</span><button type="button" onClick={() => setQuestions(questions.filter((_: any, index: number) => index !== i))} className="rounded-lg p-1 text-slate-400 hover:text-red-500"><X className="h-4 w-4" /></button></div><input value={q.question} onChange={(e) => setQuestions(questions.map((item: any, index: number) => index === i ? { ...item, question: e.target.value } : item))} className="input-field mb-3 px-3" placeholder="Enter question..." /> <div className="grid gap-2 sm:grid-cols-2">{q.options.map((option: string, oi: number) => <label key={oi} className="flex items-center gap-2"><input type="radio" checked={q.correctIndex === oi} onChange={() => setQuestions(questions.map((item: any, index: number) => index === i ? { ...item, correctIndex: oi } : item))} className="accent-emerald-500" /><input value={option} onChange={(e) => setQuestions(questions.map((item: any, index: number) => index === i ? { ...item, options: item.options.map((opt: string, optIndex: number) => optIndex === oi ? e.target.value : opt) } : item))} className="input-field px-3" placeholder={`Option ${oi + 1}`} /></label>)}</div></div>)}<FormActions cancel={cancel} submit="Create Quiz" /></form></Card></div></div>
}

function QuizSubmissions({ quiz, classes, studentName, back }: any) {
  const c = classes.find((item: any) => item.id === quiz.classId)
  const missing = c.students.filter((s: any) => !quiz.submissions.some((sub: any) => sub.studentId === s.id))
  const perQuestion = quiz.questions.map((q: any, i: number) => quiz.submissions.filter((s: any) => s.answers[i] === q.correct).length)
  return <div><Crumbs items={['Quizzes', quiz.title]} /><div className="mb-6 flex items-center justify-between"><div><h1 className="text-xl font-semibold">{quiz.title}</h1><p className="mt-1 text-sm text-slate-400">{c.code} - {quiz.questions.length} questions - {quiz.submissions.length} taken</p></div><button onClick={back} className="text-sm text-slate-400 hover:text-slate-600">Back</button></div><div className="mb-6 grid gap-3 sm:grid-cols-4">{quiz.questions.map((_: any, i: number) => <Card key={i} className="p-4"><p className="mb-1 text-[10px] uppercase tracking-wider text-slate-400">Q{i + 1}</p><p className="font-semibold">{perQuestion[i]}/{quiz.submissions.length}</p><div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700"><div className="h-full rounded-full bg-emerald-500" style={{ width: `${quiz.submissions.length ? perQuestion[i] / quiz.submissions.length * 100 : 0}%` }} /></div></Card>)}</div><Card className="overflow-x-auto"><table className="w-full text-sm"><thead className="bg-slate-50 dark:bg-slate-900"><tr><Th>Student</Th>{quiz.questions.map((_: any, i: number) => <Th key={i}>Q{i + 1}</Th>)}<Th>Score</Th></tr></thead><tbody>{quiz.submissions.map((s: any) => <tr key={s.studentId} className="border-t border-slate-100 dark:border-slate-700"><Td strong>{studentName(s.studentId)}<p className="font-mono text-xs font-normal text-slate-400">{s.studentId}</p></Td>{s.answers.map((a: number, i: number) => <Td key={i}>{a === quiz.questions[i].correct ? <Check className="mx-auto h-4 w-4 text-emerald-500" /> : <X className="mx-auto h-4 w-4 text-red-400" />}</Td>)}<Td strong>{s.score}/{quiz.maxScore}</Td></tr>)}{missing.map((s: any) => <tr key={s.id} className="border-t border-slate-100 bg-slate-50 text-slate-400 dark:border-slate-700 dark:bg-slate-900"><Td>{s.name}<p className="font-mono text-xs">{s.id}</p></Td><td colSpan={quiz.questions.length + 1} className="px-5 py-3 text-center text-xs italic">Not taken</td></tr>)}</tbody></table></Card></div>
}

function Gradebook({ classes, assignments, quizzes, selectedClassId, setSelectedClassId }: any) {
  const c = classes.find((item: any) => item.id === selectedClassId)
  const assessments = [...assignments.filter((a: Assignment) => a.classId === selectedClassId).map((a: Assignment) => ({ ...a, kind: 'A' })), ...quizzes.filter((q: Quiz) => q.classId === selectedClassId).map((q: Quiz) => ({ ...q, kind: 'Q' }))]
  const avg = (sid: string) => {
    const scores = assessments.map((a: any) => a.submissions.find((s: any) => s.studentId === sid)).filter((s: any) => s && s.score !== null).map((s: any, i: number) => s.score / assessments[i].maxScore * 100)
    return scores.length ? scores.reduce((x: number, y: number) => x + y, 0) / scores.length : null
  }
  return <div><div className="no-print mb-6"><PageTitle title="Gradebook" subtitle="Student grades by class" /></div><div className="no-print mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center"><div className="flex gap-2 overflow-x-auto">{classes.map((cl: any) => <button key={cl.id} onClick={() => setSelectedClassId(cl.id)} className={`whitespace-nowrap rounded-lg px-4 py-2 text-xs font-medium ${cl.id === selectedClassId ? 'bg-emerald-600 text-white' : 'border border-slate-200 bg-white text-slate-500 dark:border-slate-700 dark:bg-slate-800'}`}>{cl.code} - {cl.name}</button>)}</div><button onClick={() => window.print()} className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white dark:bg-slate-100 dark:text-slate-900"><Printer className="h-4 w-4" />Print Report</button></div><Card className="mx-auto max-w-5xl overflow-hidden shadow-lg"><div className="bg-slate-900 px-8 py-5 text-white"><h1 className="font-semibold tracking-tight">GREENFIELD ACADEMY</h1><p className="text-xs text-slate-400">CLASS GRADE REPORT</p></div><div className="border-b border-slate-200 bg-slate-50 px-8 py-4 dark:border-slate-700 dark:bg-slate-900"><p className="text-sm font-semibold">{c.name} - {c.code}</p><p className="text-xs text-slate-400">Teacher: Dr. Sarah Johnson</p></div><div className="overflow-x-auto p-6"><table className="w-full text-sm"><thead><tr><Th>Student</Th><Th>ID</Th>{assessments.map((a: any) => <Th key={`${a.kind}-${a.id}`}>{a.title}<br /><span className="font-normal text-slate-400">({a.kind}/{a.maxScore})</span></Th>)}<Th>Average</Th></tr></thead><tbody>{c.students.map((s: any) => <tr key={s.id} className="border-t border-slate-200 dark:border-slate-700"><Td strong>{s.name}</Td><Td mono>{s.id}</Td>{assessments.map((a: any) => { const sub = a.submissions.find((x: any) => x.studentId === s.id); return <Td key={`${s.id}-${a.id}`}>{sub ? sub.score ?? 'pending' : '-'}</Td> })}<Td strong>{avg(s.id) === null ? '-' : `${avg(s.id)!.toFixed(1)}%`}</Td></tr>)}</tbody></table></div></Card></div>
}

function Schedule({ classes, timetable }: { classes: TeacherClass[]; timetable: TimetableEntry[] }) {
  const today = dayLabels[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1] ?? ''
  const slotFor = (day: string, periodIndex: number) => {
    const dayIndex = dayLabels.indexOf(day)
    const period = periodLabels[periodIndex]
    if (!period) return null
    const [startTime] = period.split('-')
    return timetable.find((entry) => entry.dayOfWeek === dayIndex && entry.startTime.startsWith(startTime.slice(0, 2))) ?? null
  }
  return <div><PageTitle title="Schedule" subtitle="Weekly teaching timetable" /><Card className="overflow-x-auto"><table className="w-full min-w-[700px] text-sm"><thead className="bg-slate-50 dark:bg-slate-900"><tr><Th>Time</Th>{dayLabels.map((d) => <Th key={d}>{d}{d === today ? ' *' : ''}</Th>)}</tr></thead><tbody>{periodLabels.map((period, pi) => <tr key={period} className="border-t border-slate-100 dark:border-slate-700"><Td>{period}</Td>{dayLabels.map((day) => { if (pi === 3) return <Td key={day}>Break</Td>; if (pi === 6) return <Td key={day}>Lunch</Td>; const slot = slotFor(day, pi); const c = classes.find((item) => item.code === slot?.courseCode); return <Td key={day}>{c || slot ? <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-center text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300"><p className="text-xs font-semibold">{slot?.courseCode ?? c?.code}</p><p className="truncate text-[10px] text-slate-500">{slot?.courseName ?? c?.name}</p></div> : ''}</Td> })}</tr>)}</tbody></table></Card></div>
}

function Announcements({ items }: { items: AnnouncementItem[] }) {
  return <div><PageTitle title="Announcements" subtitle={`${items.length} posted`} /><div className="space-y-4">{items.length === 0 && <Card className="p-8 text-center text-sm text-slate-400">No announcements available.</Card>}{items.map((a) => <Card key={`${a.title}-${a.date}`} className={`p-6 ${a.important ? 'border-l-4 border-l-amber-400' : ''}`}><div className="mb-2 flex items-center gap-2">{a.important && <Badge tone="amber">Important</Badge>}<h2 className="font-semibold">{a.title}</h2></div><p className="mb-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{a.content}</p><p className="text-xs text-slate-400">{fmtDate(a.date)} - {a.source}</p></Card>)}</div></div>
}

function TeacherApiFeaturePage({ title, subtitle, features }: { title: string; subtitle: string; features: string[] }) {
  return <div><PageTitle title={title} subtitle={subtitle} /><div className="grid gap-4 md:grid-cols-2">{features.map((feature) => <Card key={feature} className="p-5"><div className="flex items-start gap-3"><div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-300"><Check className="h-4 w-4" /></div><p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">{feature}</p></div></Card>)}</div></div>
}

function GradesSummary({ c, assessments }: any) {
  const avg = (sid: string) => {
    const scores = assessments.map((a: any) => a.submissions.find((s: any) => s.studentId === sid)).filter((s: any) => s && s.score !== null).map((s: any, i: number) => s.score / assessments[i].maxScore * 100)
    return scores.length ? scores.reduce((x: number, y: number) => x + y, 0) / scores.length : 0
  }
  return <Card className="p-6"><div className="space-y-3">{c.students.map((s: any) => { const score = avg(s.id); return <div key={s.id} className="flex items-center justify-between border-b border-slate-100 py-2 last:border-b-0 dark:border-slate-700"><span className="text-sm">{s.name}</span><div className="flex items-center gap-3"><div className="h-2 w-24 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700"><div className={`h-full ${score >= 80 ? 'bg-emerald-500' : score >= 60 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${score}%` }} /></div><span className="w-14 text-right text-sm font-semibold">{score ? `${score.toFixed(1)}%` : '-'}</span></div></div> })}</div></Card>
}

function PageTitle({ title, subtitle, tight = false }: { title: string; subtitle: string; tight?: boolean }) {
  return <div className={tight ? '' : 'mb-8'}><h1 className="mb-1 text-2xl font-semibold">{title}</h1><p className="text-sm text-slate-400">{subtitle}</p></div>
}

function Crumbs({ items }: { items: string[] }) {
  return <div className="mb-6 flex flex-wrap items-center gap-2 text-xs text-slate-400">{items.map((item, i) => <span key={item} className="flex items-center gap-2">{i === items.length - 1 ? <span className="font-medium text-slate-700 dark:text-slate-200">{item}</span> : <span>{item}</span>}{i < items.length - 1 && <ChevronRight className="h-3 w-3" />}</span>)}</div>
}

function Tabs({ value, onChange, items }: { value: string; onChange: (value: any) => void; items: string[] }) {
  return <div className="mb-6 flex gap-1 overflow-x-auto border-b border-slate-200 dark:border-slate-700">{items.map((item) => <button key={item} onClick={() => onChange(item)} className={`whitespace-nowrap border-b-2 px-4 py-3 text-sm font-medium capitalize ${value === item ? 'border-current text-emerald-700 dark:text-emerald-300' : 'border-transparent text-slate-400 hover:text-slate-600'}`}>{item}</button>)}</div>
}

function FilterBar({ value, onChange, items, compact = false }: { value: string; onChange: (value: string) => void; items: string[]; compact?: boolean }) {
  return <div className={`flex gap-2 overflow-x-auto ${compact ? '' : 'mb-6'}`}>{items.map((item) => <button key={item} onClick={() => onChange(item)} className={`${compact ? 'flex-1 px-2 py-1.5 text-[11px]' : 'px-4 py-2 text-xs'} whitespace-nowrap rounded-lg font-medium capitalize ${value === item ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900' : 'border border-slate-200 bg-white text-slate-500 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800'}`}>{item}</button>)}</div>
}

function ListButton({ title, meta, badge, tone, onClick }: { title: string; meta: string; badge: string; tone: any; onClick: () => void }) {
  return <button onClick={onClick} className="flex w-full flex-col justify-between gap-3 rounded-xl border border-slate-200 bg-white p-5 text-left transition hover:-translate-y-0.5 hover:shadow-lg dark:border-slate-700 dark:bg-slate-800 sm:flex-row sm:items-center"><div className="min-w-0"><h3 className="text-sm font-semibold">{title}</h3><p className="mt-1 text-xs text-slate-400">{meta}</p></div><Badge tone={tone}>{badge}</Badge></button>
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="mb-2 block text-xs font-medium text-slate-600 dark:text-slate-300">{label}</span>{children}</label>
}

function FormActions({ cancel, submit }: { cancel: () => void; submit: string }) {
  return <div className="flex justify-end gap-3 pt-2"><button type="button" onClick={cancel} className="rounded-lg px-6 py-2.5 text-sm font-medium text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700">Cancel</button><button type="submit" className="rounded-lg bg-emerald-600 px-8 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-emerald-500">{submit}</button></div>
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">{children}</th>
}

function Td({ children, strong, mono }: { children: React.ReactNode; strong?: boolean; mono?: boolean }) {
  return <td className={`px-5 py-3 text-sm ${strong ? 'font-medium text-slate-800 dark:text-slate-100' : 'text-slate-600 dark:text-slate-300'} ${mono ? 'font-mono text-xs' : ''}`}>{children}</td>
}
