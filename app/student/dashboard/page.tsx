'use client'

import { useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Cookies from 'js-cookie'
import {
  AlertCircle,
  Archive,
  BarChart3,
  BookOpen,
  Calendar,
  Check,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  CloudUpload,
  Download,
  File,
  FileText,
  GraduationCap,
  HelpCircle,
  LayoutDashboard,
  List,
  ListOrdered,
  Lock,
  LogOut,
  Megaphone,
  Menu,
  Moon,
  Pencil,
  Play,
  Printer,
  Sun,
  Tag,
  UploadCloud,
  User,
  X,
} from 'lucide-react'

type Section =
  | 'dashboard'
  | 'courses'
  | 'course-detail'
  | 'assignments'
  | 'assignment-view'
  | 'quizzes'
  | 'quiz-view'
  | 'gradebook'
  | 'schedule'
  | 'announcements'
type CourseTab = 'outline' | 'resources' | 'assignments' | 'quizzes' | 'grades'
type ColorName = 'emerald' | 'blue' | 'amber' | 'purple' | 'cyan' | 'rose'
type AssignmentStatus = 'graded' | 'submitted' | 'open' | 'closed'
type QuizStatus = 'graded' | 'open' | 'submitted'

type Course = {
  id: number
  name: string
  code: string
  lecturer: string
  color: ColorName
  progress: number
  credits: number
  outline: { week: number; topic: string; status: 'done' | 'current' | 'upcoming' }[]
  resources: { name: string; type: 'pdf' | 'doc' | 'ppt' | 'zip'; size: string }[]
  assignments: Assignment[]
  quizzes: Quiz[]
  grades: { midterm: number; quizzes: number; assignments: number; overall: number; grade: string; gpa: number }
}

type Assignment = {
  id: number
  title: string
  due: string
  status: AssignmentStatus
  score: number | null
  max: number
  attempts: number
  maxAttempts: number
  question: string
  submittedFile?: { name: string; size: string }
  submittedDate?: string
}

type Quiz = {
  id: number
  title: string
  due: string
  status: QuizStatus
  score: number | null
  max: number
  attempts: number
  maxAttempts: number
  instructions: string
  questions: { q: string; opts: string[]; correct: number }[]
}

const student = {
  name: 'Alex Thompson',
  id: 'STU-2024-0042',
  className: 'Grade 10 - Section A',
  dob: '15-MAR-2010',
  gender: 'Male',
}

const initialCourses: Course[] = [
  {
    id: 1,
    name: 'Mathematics',
    code: 'MTH 101',
    lecturer: 'Dr. Sarah Johnson',
    color: 'emerald',
    progress: 68,
    credits: 4,
    outline: [
      { week: 1, topic: 'Introduction to Algebra', status: 'done' },
      { week: 2, topic: 'Linear Equations', status: 'done' },
      { week: 3, topic: 'Quadratic Functions', status: 'done' },
      { week: 4, topic: 'Polynomials', status: 'current' },
      { week: 5, topic: 'Coordinate Geometry', status: 'upcoming' },
      { week: 6, topic: 'Trigonometry Basics', status: 'upcoming' },
    ],
    resources: [
      { name: 'Algebra Fundamentals.pdf', type: 'pdf', size: '2.4 MB' },
      { name: 'Practice Problems Set 1.docx', type: 'doc', size: '840 KB' },
      { name: 'Linear Equations Slides.pptx', type: 'ppt', size: '5.1 MB' },
    ],
    assignments: [
      { id: 101, title: 'Algebra Problem Set', due: '2025-01-15', status: 'graded', score: 85, max: 100, attempts: 1, maxAttempts: 1, question: 'Solve the following algebraic expressions and show all working steps.', submittedFile: { name: 'Algebra_Problem_Set.pdf', size: '1.2 MB' }, submittedDate: '2025-01-14' },
      { id: 102, title: 'Linear Equations Worksheet', due: '2025-01-22', status: 'submitted', score: null, max: 50, attempts: 1, maxAttempts: 3, question: 'Complete all 20 problems on linear equations.', submittedFile: { name: 'Linear_Equations_Worksheet.docx', size: '890 KB' }, submittedDate: '2025-01-21' },
      { id: 103, title: 'Quadratic Functions Assignment', due: '2025-02-05', status: 'open', score: null, max: 100, attempts: 0, maxAttempts: 1, question: 'Identify and graph quadratic functions.' },
    ],
    quizzes: [
      {
        id: 201,
        title: 'Algebra Quiz 1',
        due: '2025-01-10',
        status: 'graded',
        score: 18,
        max: 20,
        attempts: 1,
        maxAttempts: 1,
        instructions: 'This quiz covers basic algebra concepts. 15 minutes.',
        questions: [
          { q: 'What is x in 3x + 7 = 22?', opts: ['3', '5', '7', '15'], correct: 1 },
          { q: 'Simplify: 2(x + 3) - x', opts: ['x + 3', 'x + 6', '2x + 6', '3x + 6'], correct: 1 },
          { q: 'Which is a quadratic expression?', opts: ['3x + 1', 'x^2 + 2x + 1', '1/x', 'sqrt(x)'], correct: 1 },
          { q: 'Factor: x^2 - 9', opts: ['(x-3)^2', '(x+3)(x-3)', '(x-9)(x+1)', '(x^2-3)'], correct: 1 },
        ],
      },
      {
        id: 202,
        title: 'Linear Equations Quiz',
        due: '2025-02-01',
        status: 'open',
        score: null,
        max: 20,
        attempts: 0,
        maxAttempts: 2,
        instructions: 'Linear equations and systems. 20 minutes, 4 questions.',
        questions: [
          { q: 'Consistent system has how many solutions?', opts: ['0', '1', 'Infinite', '2'], correct: 1 },
          { q: 'Slope of y = 2x + 1?', opts: ['1', '2', '-1', '-2'], correct: 1 },
          { q: 'Method that adds equations?', opts: ['Substitution', 'Elimination', 'Graphing', 'Factoring'], correct: 1 },
          { q: 'If 2x + y = 10, x = 3, find y.', opts: ['3', '4', '5', '6'], correct: 1 },
        ],
      },
    ],
    grades: { midterm: 82, quizzes: 90, assignments: 85, overall: 85.7, grade: 'A', gpa: 3.5 },
  },
  {
    id: 2,
    name: 'English Language',
    code: 'ENG 101',
    lecturer: 'Ms. Emily Carter',
    color: 'blue',
    progress: 72,
    credits: 3,
    outline: [
      { week: 1, topic: 'Essay Writing Fundamentals', status: 'done' },
      { week: 2, topic: 'Narrative Techniques', status: 'done' },
      { week: 3, topic: 'Poetry Analysis', status: 'done' },
      { week: 4, topic: 'Persuasive Writing', status: 'current' },
      { week: 5, topic: 'Shakespeare Studies', status: 'upcoming' },
    ],
    resources: [
      { name: 'Essay Writing Guide.pdf', type: 'pdf', size: '1.8 MB' },
      { name: 'Poetry Collection.docx', type: 'doc', size: '520 KB' },
    ],
    assignments: [
      { id: 104, title: 'Personal Narrative Essay', due: '2025-01-12', status: 'graded', score: 92, max: 100, attempts: 1, maxAttempts: 1, question: 'Write an 800-word personal narrative essay.', submittedFile: { name: 'Personal_Narrative.pdf', size: '456 KB' }, submittedDate: '2025-01-11' },
      { id: 105, title: 'Poetry Analysis Report', due: '2025-01-28', status: 'open', score: null, max: 100, attempts: 0, maxAttempts: 1, question: 'Analyze two poems from the provided collection.' },
    ],
    quizzes: [
      { id: 203, title: 'Grammar Fundamentals Quiz', due: '2025-01-08', status: 'graded', score: 15, max: 20, attempts: 1, maxAttempts: 2, instructions: 'Grammar fundamentals. 10 minutes.', questions: [{ q: 'Which is a conjunction?', opts: ['Quickly', 'But', 'Beautiful', 'Running'], correct: 1 }, { q: '"She writes beautifully." - Adverb?', opts: ['She', 'writes', 'beautifully', 'None'], correct: 2 }, { q: 'Past tense of "run"?', opts: ['Runned', 'Ran', 'Runned', 'Running'], correct: 1 }, { q: 'A group of sheep?', opts: ['Pack', 'Flock', 'Herd', 'Swarm'], correct: 1 }] },
    ],
    grades: { midterm: 88, quizzes: 75, assignments: 92, overall: 88.3, grade: 'A', gpa: 3.7 },
  },
  {
    id: 3,
    name: 'Physics',
    code: 'PHY 101',
    lecturer: 'Mr. Robert Chen',
    color: 'amber',
    progress: 55,
    credits: 4,
    outline: [
      { week: 1, topic: 'Measurements & Units', status: 'done' },
      { week: 2, topic: 'Kinematics', status: 'done' },
      { week: 3, topic: "Newton's Laws", status: 'current' },
      { week: 4, topic: 'Work, Energy & Power', status: 'upcoming' },
      { week: 5, topic: 'Waves & Sound', status: 'upcoming' },
    ],
    resources: [
      { name: 'Kinematics Notes.pdf', type: 'pdf', size: '3.2 MB' },
      { name: "Newton's Laws.docx", type: 'doc', size: '680 KB' },
    ],
    assignments: [
      { id: 106, title: 'Unit Conversion Worksheet', due: '2025-01-10', status: 'graded', score: 78, max: 100, attempts: 1, maxAttempts: 1, question: 'Convert between SI and non-SI units.', submittedFile: { name: 'Unit_Conversion.pdf', size: '780 KB' }, submittedDate: '2025-01-09' },
      { id: 107, title: 'Kinematics Problems', due: '2025-01-20', status: 'graded', score: 90, max: 100, attempts: 1, maxAttempts: 1, question: 'Solve 15 kinematics problems.', submittedFile: { name: 'Kinematics_Solutions.pdf', size: '1.4 MB' }, submittedDate: '2025-01-19' },
      { id: 108, title: 'Forces & Motion Lab Report', due: '2025-02-08', status: 'open', score: null, max: 100, attempts: 0, maxAttempts: 1, question: 'Write a lab report for the forces experiment.' },
    ],
    quizzes: [
      { id: 204, title: 'Measurements Quiz', due: '2025-01-06', status: 'graded', score: 19, max: 20, attempts: 1, maxAttempts: 1, instructions: 'SI units. 5 minutes.', questions: [{ q: 'SI unit of force?', opts: ['Joule', 'Watt', 'Newton', 'Pascal'], correct: 2 }, { q: '1 km = ? m', opts: ['100', '1000', '10000', '100000'], correct: 1 }] },
    ],
    grades: { midterm: 75, quizzes: 95, assignments: 84, overall: 81.3, grade: 'B+', gpa: 3.3 },
  },
  {
    id: 4,
    name: 'Chemistry',
    code: 'CHM 101',
    lecturer: 'Dr. Lisa Park',
    color: 'purple',
    progress: 60,
    credits: 4,
    outline: [
      { week: 1, topic: 'Atomic Structure', status: 'done' },
      { week: 2, topic: 'Periodic Table', status: 'done' },
      { week: 3, topic: 'Chemical Bonding', status: 'current' },
      { week: 4, topic: 'Stoichiometry', status: 'upcoming' },
      { week: 5, topic: 'States of Matter', status: 'upcoming' },
    ],
    resources: [
      { name: 'Periodic Table.pdf', type: 'pdf', size: '1.1 MB' },
      { name: 'Bonding Diagrams.pptx', type: 'ppt', size: '4.5 MB' },
    ],
    assignments: [
      { id: 109, title: 'Atomic Model Worksheet', due: '2025-01-14', status: 'graded', score: 88, max: 100, attempts: 1, maxAttempts: 1, question: 'Draw Bohr models for the first 20 elements.', submittedFile: { name: 'Atomic_Models.pdf', size: '2.1 MB' }, submittedDate: '2025-01-13' },
      { id: 110, title: 'Chemical Bonding Assignment', due: '2025-02-03', status: 'open', score: null, max: 100, attempts: 0, maxAttempts: 1, question: 'Explain bonding types with Lewis dot structures.' },
    ],
    quizzes: [
      { id: 205, title: 'Atomic Structure Quiz', due: '2025-01-09', status: 'graded', score: 17, max: 20, attempts: 1, maxAttempts: 1, instructions: 'Atomic structure. 5 minutes.', questions: [{ q: 'Atomic number represents?', opts: ['Neutrons', 'Protons', 'Electrons', 'Mass'], correct: 1 }, { q: 'Most abundant gas?', opts: ['Oxygen', 'Nitrogen', 'CO2', 'Argon'], correct: 1 }] },
    ],
    grades: { midterm: 80, quizzes: 85, assignments: 88, overall: 84.3, grade: 'A', gpa: 3.5 },
  },
  {
    id: 5,
    name: 'Computer Science',
    code: 'CSC 101',
    lecturer: 'Mr. David Kim',
    color: 'cyan',
    progress: 75,
    credits: 3,
    outline: [
      { week: 1, topic: 'Intro to Programming', status: 'done' },
      { week: 2, topic: 'Variables & Data Types', status: 'done' },
      { week: 3, topic: 'Control Structures', status: 'done' },
      { week: 4, topic: 'Functions', status: 'current' },
      { week: 5, topic: 'Arrays & Lists', status: 'upcoming' },
    ],
    resources: [
      { name: 'Python Basics.pdf', type: 'pdf', size: '2.8 MB' },
      { name: 'Code Examples.zip', type: 'zip', size: '1.2 MB' },
    ],
    assignments: [
      { id: 111, title: 'Hello World Exercises', due: '2025-01-08', status: 'graded', score: 95, max: 100, attempts: 1, maxAttempts: 1, question: 'Complete 10 basic Python exercises.', submittedFile: { name: 'Hello_World.zip', size: '34 KB' }, submittedDate: '2025-01-07' },
      { id: 112, title: 'Loops & Conditions Project', due: '2025-01-25', status: 'submitted', score: null, max: 100, attempts: 1, maxAttempts: 2, question: 'Build a number guessing game.', submittedFile: { name: 'Guessing_Game.py', size: '4 KB' }, submittedDate: '2025-01-24' },
      { id: 113, title: 'Functions Practice Set', due: '2025-02-10', status: 'open', score: null, max: 100, attempts: 0, maxAttempts: 1, question: 'Write 8 functions.' },
    ],
    quizzes: [
      { id: 206, title: 'Python Basics Quiz', due: '2025-01-07', status: 'graded', score: 20, max: 20, attempts: 1, maxAttempts: 1, instructions: 'Python basics. 5 minutes.', questions: [{ q: 'Keyword to define a function?', opts: ['func', 'function', 'def', 'define'], correct: 2 }, { q: 'Python is?', opts: ['Compiled', 'Interpreted', 'Assembly', 'Machine'], correct: 1 }] },
    ],
    grades: { midterm: 92, quizzes: 100, assignments: 95, overall: 94.3, grade: 'A+', gpa: 4.0 },
  },
  {
    id: 6,
    name: 'History',
    code: 'HIS 101',
    lecturer: 'Mrs. Anna Williams',
    color: 'rose',
    progress: 45,
    credits: 3,
    outline: [
      { week: 1, topic: 'The French Revolution', status: 'done' },
      { week: 2, topic: 'Industrial Revolution', status: 'done' },
      { week: 3, topic: 'World War I', status: 'current' },
      { week: 4, topic: 'World War II', status: 'upcoming' },
      { week: 5, topic: 'Cold War Era', status: 'upcoming' },
    ],
    resources: [
      { name: 'French Revolution Timeline.pdf', type: 'pdf', size: '1.5 MB' },
      { name: 'WWI Map Activity.docx', type: 'doc', size: '920 KB' },
    ],
    assignments: [
      { id: 114, title: 'French Revolution Essay', due: '2025-01-18', status: 'graded', score: 80, max: 100, attempts: 1, maxAttempts: 1, question: 'Write a 1000-word essay on the French Revolution.', submittedFile: { name: 'French_Revolution_Essay.pdf', size: '320 KB' }, submittedDate: '2025-01-17' },
      { id: 115, title: 'Industrial Revolution Report', due: '2025-01-30', status: 'closed', score: null, max: 100, attempts: 0, maxAttempts: 1, question: 'Create a report on the Industrial Revolution.' },
    ],
    quizzes: [
      { id: 207, title: 'French Revolution Quiz', due: '2025-01-13', status: 'graded', score: 16, max: 20, attempts: 1, maxAttempts: 1, instructions: 'French Revolution. 5 minutes.', questions: [{ q: 'Bastille stormed in?', opts: ['1776', '1789', '1799', '1804'], correct: 1 }, { q: 'King during Revolution?', opts: ['Louis XIV', 'Louis XV', 'Louis XVI', 'Napoleon'], correct: 2 }] },
    ],
    grades: { midterm: 70, quizzes: 80, assignments: 80, overall: 76.7, grade: 'B+', gpa: 3.2 },
  },
]

const announcements = [
  { id: 1, title: 'Mid-Term Examination Schedule Released', date: '2025-01-20', source: 'General', content: 'The mid-term examination schedule for Grade 10 has been finalized. Examinations begin February 15th.', important: true },
  { id: 2, title: 'Annual Sports Day - February 8th', date: '2025-01-18', source: 'General', content: 'Annual sports day on February 8th at the school ground. All students report by 7:30 AM.', important: true },
  { id: 3, title: 'Mathematics - Additional Practice Materials', date: '2025-01-16', source: 'MTH 101', content: 'Dr. Sarah Johnson has uploaded additional practice materials.', important: false },
  { id: 4, title: 'Parent-Teacher Meeting', date: '2025-01-14', source: 'General', content: 'Parent-teacher meeting scheduled for January 28th, 9:00 AM to 1:00 PM.', important: false },
  { id: 5, title: 'Computer Science Lab - Schedule Change', date: '2025-01-12', source: 'CSC 101', content: 'Lab sessions rescheduled to Thursday, 5th period.', important: false },
  { id: 6, title: 'Science Fair Registration Open', date: '2025-01-10', source: 'General', content: 'Registration open. Last date February 1st.', important: false },
]

const schedule = {
  periods: ['8:00-8:45', '8:50-9:35', '9:40-10:25', '10:40-11:25', '11:30-12:15', '12:20-1:05', '1:10-1:55', '2:00-2:45'],
  days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
  data: {
    Monday: [1, 2, 3, null, 4, 5, null, 6],
    Tuesday: [3, 1, 5, null, 2, 6, null, 4],
    Wednesday: [5, 4, 1, null, 3, 2, null, null],
    Thursday: [2, 6, 4, null, 5, 1, null, 3],
    Friday: [4, 3, 6, null, 1, null, null, 5],
  } as Record<string, (number | null)[]>,
}

const colorMap: Record<ColorName, { bg: string; border: string; text: string; dot: string; badge: string; btn: string; light: string }> = {
  emerald: { bg: 'bg-emerald-50 dark:bg-emerald-950', border: 'border-emerald-200 dark:border-emerald-900', text: 'text-emerald-700 dark:text-emerald-300', dot: 'bg-emerald-500', badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300', btn: 'bg-emerald-600 hover:bg-emerald-500', light: 'bg-emerald-500/10' },
  blue: { bg: 'bg-blue-50 dark:bg-blue-950', border: 'border-blue-200 dark:border-blue-900', text: 'text-blue-700 dark:text-blue-300', dot: 'bg-blue-500', badge: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300', btn: 'bg-blue-600 hover:bg-blue-500', light: 'bg-blue-500/10' },
  amber: { bg: 'bg-amber-50 dark:bg-amber-950', border: 'border-amber-200 dark:border-amber-900', text: 'text-amber-700 dark:text-amber-300', dot: 'bg-amber-500', badge: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300', btn: 'bg-amber-600 hover:bg-amber-500', light: 'bg-amber-500/10' },
  purple: { bg: 'bg-purple-50 dark:bg-purple-950', border: 'border-purple-200 dark:border-purple-900', text: 'text-purple-700 dark:text-purple-300', dot: 'bg-purple-500', badge: 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300', btn: 'bg-purple-600 hover:bg-purple-500', light: 'bg-purple-500/10' },
  cyan: { bg: 'bg-cyan-50 dark:bg-cyan-950', border: 'border-cyan-200 dark:border-cyan-900', text: 'text-cyan-700 dark:text-cyan-300', dot: 'bg-cyan-500', badge: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-300', btn: 'bg-cyan-600 hover:bg-cyan-500', light: 'bg-cyan-500/10' },
  rose: { bg: 'bg-rose-50 dark:bg-rose-950', border: 'border-rose-200 dark:border-rose-900', text: 'text-rose-700 dark:text-rose-300', dot: 'bg-rose-500', badge: 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300', btn: 'bg-rose-600 hover:bg-rose-500', light: 'bg-rose-500/10' },
}

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'courses', label: 'Courses', icon: BookOpen },
  { id: 'assignments', label: 'Assignments', icon: ClipboardList },
  { id: 'quizzes', label: 'Quizzes', icon: HelpCircle },
  { id: 'gradebook', label: 'Gradebook', icon: BarChart3 },
  { id: 'schedule', label: 'Schedule', icon: Calendar },
  { id: 'announcements', label: 'Announcements', icon: Megaphone },
] as const

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function fileIcon(typeOrName: string) {
  const ext = typeOrName.split('.').pop()?.toLowerCase()
  if (ext === 'zip') return Archive
  if (ext === 'ppt' || ext === 'pptx' || typeOrName === 'ppt') return FileText
  if (ext === 'pdf' || typeOrName === 'pdf') return FileText
  return File
}

export default function StudentDashboard() {
  const router = useRouter()
  const editorRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [dark, setDark] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [section, setSection] = useState<Section>('dashboard')
  const [courses, setCourses] = useState(initialCourses)
  const [courseId, setCourseId] = useState<number | null>(null)
  const [courseTab, setCourseTab] = useState<CourseTab>('outline')
  const [assignmentFilter, setAssignmentFilter] = useState('all')
  const [quizFilter, setQuizFilter] = useState('all')
  const [assignmentId, setAssignmentId] = useState<number | null>(null)
  const [quizId, setQuizId] = useState<number | null>(null)
  const [quizStarted, setQuizStarted] = useState(false)
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({})
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const allAssignments = useMemo(() => courses.flatMap((course) => course.assignments.map((assignment) => ({ ...assignment, course }))), [courses])
  const allQuizzes = useMemo(() => courses.flatMap((course) => course.quizzes.map((quiz) => ({ ...quiz, course }))), [courses])
  const selectedCourse = courses.find((course) => course.id === courseId) ?? courses[0]
  const selectedAssignment = allAssignments.find(({ id }) => id === assignmentId)
  const selectedQuiz = allQuizzes.find(({ id }) => id === quizId)

  const go = (next: Section) => {
    setSection(next)
    setCourseId(null)
    setAssignmentId(null)
    setQuizId(null)
    setQuizStarted(false)
    setQuizAnswers({})
    setSelectedFile(null)
    setSidebarOpen(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const openCourse = (id: number) => {
    setCourseId(id)
    setCourseTab('outline')
    setSection('course-detail')
    setSidebarOpen(false)
  }

  const openAssignment = (id: number) => {
    setAssignmentId(id)
    setSelectedFile(null)
    setSection('assignment-view')
  }

  const openQuiz = (id: number) => {
    setQuizId(id)
    setQuizStarted(false)
    setQuizAnswers({})
    setSection('quiz-view')
  }

  const logout = () => {
    Cookies.remove('access_token')
    Cookies.remove('refresh_token')
    Cookies.remove('active_role')
    router.replace('/')
  }

  const submitAssignment = (id: number) => {
    const text = editorRef.current?.textContent?.trim() ?? ''
    if (!selectedFile && text.length < 5) {
      alert('Please upload a file or type your answer.')
      return
    }

    setCourses((items) =>
      items.map((course) => ({
        ...course,
        assignments: course.assignments.map((assignment) =>
          assignment.id === id
            ? {
                ...assignment,
                status: 'submitted',
                attempts: assignment.attempts + 1,
                submittedDate: new Date().toISOString().split('T')[0],
                submittedFile: selectedFile
                  ? { name: selectedFile.name, size: `${(selectedFile.size / 1024 / 1024).toFixed(1)} MB` }
                  : assignment.submittedFile,
              }
            : assignment
        ),
      }))
    )
    setSelectedFile(null)
    go('assignments')
  }

  const submitQuiz = (id: number) => {
    const quiz = allQuizzes.find((item) => item.id === id)
    if (!quiz) return
    const answered = quiz.questions.filter((_, index) => quizAnswers[`${id}-${index}`] !== undefined).length
    if (answered < quiz.questions.length && !confirm(`Answered ${answered}/${quiz.questions.length}. Submit anyway?`)) return
    const score = quiz.questions.reduce((total, question, index) => total + (quizAnswers[`${id}-${index}`] === question.correct ? 1 : 0), 0)

    setCourses((items) =>
      items.map((course) => ({
        ...course,
        quizzes: course.quizzes.map((quizItem) =>
          quizItem.id === id ? { ...quizItem, status: 'graded', score, attempts: quizItem.attempts + 1 } : quizItem
        ),
      }))
    )
    go('quizzes')
  }

  const isActive = (id: string) => id === section || (section === 'course-detail' && id === 'courses') || (section === 'assignment-view' && id === 'assignments') || (section === 'quiz-view' && id === 'quizzes')

  return (
    <div className={dark ? 'dark' : ''}>
      <div className="h-screen overflow-hidden bg-slate-50 font-sans text-slate-900 dark:bg-[#0B0F19] dark:text-slate-200">
        <MobileHeader dark={dark} setDark={setDark} setSidebarOpen={setSidebarOpen} />
        {sidebarOpen && <button aria-label="Close menu" className="fixed inset-0 z-40 bg-black/40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

        <div className="flex h-full">
          <aside className={`fixed z-50 flex h-full w-64 flex-col border-r border-slate-200 bg-white transition-transform duration-200 dark:border-slate-800 dark:bg-slate-900 lg:static lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
            <div className="hidden h-16 shrink-0 items-center gap-3 border-b border-slate-100 px-5 dark:border-slate-800 lg:flex">
              <Brand />
            </div>
            <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
              {navItems.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => go(id)}
                  className={`flex w-full items-center gap-3 rounded-l-lg px-3 py-2.5 text-left text-sm font-medium transition-colors ${
                    isActive(id)
                      ? 'border-r-[3px] border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                      : 'text-slate-500 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  {label}
                </button>
              ))}
            </nav>
            <div className="shrink-0 space-y-3 border-t border-slate-100 p-4 dark:border-slate-800">
              <ThemeToggle dark={dark} setDark={setDark} />
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-slate-100 bg-emerald-50 text-sm font-semibold text-emerald-700 dark:border-slate-700 dark:bg-emerald-950 dark:text-emerald-300">AT</div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-slate-800 dark:text-slate-100">{student.name}</p>
                  <p className="truncate text-[11px] text-slate-400">{student.id}</p>
                </div>
              </div>
              <button onClick={logout} className="flex w-full items-center justify-center gap-2 rounded-lg py-2 text-xs text-slate-400 transition-colors hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950">
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
            </div>
          </aside>

          <main className="flex-1 overflow-y-auto pt-14 lg:pt-0">
            <div className="max-w-6xl p-5 lg:p-8">
              {section === 'dashboard' && <Dashboard courses={courses} assignments={allAssignments} quizzes={allQuizzes} openAssignment={openAssignment} />}
              {section === 'courses' && <Courses courses={courses} openCourse={openCourse} />}
              {section === 'course-detail' && <CourseDetail course={selectedCourse} tab={courseTab} setTab={setCourseTab} openAssignment={openAssignment} openQuiz={openQuiz} />}
              {section === 'assignments' && <AssignmentsPage assignments={allAssignments} filter={assignmentFilter} setFilter={setAssignmentFilter} openAssignment={openAssignment} />}
              {section === 'assignment-view' && selectedAssignment && (
                <AssignmentView
                  assignment={selectedAssignment}
                  selectedFile={selectedFile}
                  setSelectedFile={setSelectedFile}
                  fileInputRef={fileInputRef}
                  editorRef={editorRef}
                  submitAssignment={submitAssignment}
                  goAssignments={() => go('assignments')}
                />
              )}
              {section === 'quizzes' && <QuizzesPage quizzes={allQuizzes} filter={quizFilter} setFilter={setQuizFilter} openQuiz={openQuiz} />}
              {section === 'quiz-view' && selectedQuiz && (
                <QuizView
                  quiz={selectedQuiz}
                  started={quizStarted}
                  setStarted={setQuizStarted}
                  answers={quizAnswers}
                  setAnswers={setQuizAnswers}
                  submitQuiz={submitQuiz}
                  goQuizzes={() => go('quizzes')}
                />
              )}
              {section === 'gradebook' && <Gradebook courses={courses} />}
              {section === 'schedule' && <Schedule courses={courses} />}
              {section === 'announcements' && <Announcements />}
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}

function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <>
      <div className={`${compact ? 'h-7 w-7 rounded-md' : 'h-9 w-9 rounded-lg'} flex items-center justify-center bg-slate-900 dark:bg-slate-950`}>
        <GraduationCap className={`${compact ? 'h-4 w-4' : 'h-5 w-5'} text-emerald-400`} />
      </div>
      <div>
        <span className="block text-sm font-semibold leading-tight">Greenfield Academy</span>
        {!compact && <span className="text-[10px] text-slate-400">Student Portal</span>}
      </div>
    </>
  )
}

function MobileHeader({ dark, setDark, setSidebarOpen }: { dark: boolean; setDark: (value: boolean) => void; setSidebarOpen: (value: boolean) => void }) {
  return (
    <div className="fixed left-0 right-0 top-0 z-30 flex h-14 items-center justify-between border-b border-slate-200 bg-white px-4 dark:border-slate-800 dark:bg-slate-900 lg:hidden">
      <div className="flex items-center gap-2.5">
        <button onClick={() => setSidebarOpen(true)} className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
          <Menu className="h-5 w-5 text-slate-600 dark:text-slate-300" />
        </button>
        <Brand compact />
      </div>
      <div className="flex items-center gap-2">
        <button onClick={() => setDark(!dark)} className="flex h-9 w-9 items-center justify-center rounded-lg transition-transform hover:rotate-12 hover:bg-slate-100 dark:hover:bg-slate-800">
          {dark ? <Sun className="h-5 w-5 text-slate-400" /> : <Moon className="h-5 w-5 text-slate-500" />}
        </button>
        <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-slate-100 bg-emerald-50 text-xs font-semibold text-emerald-700 dark:border-slate-700 dark:bg-emerald-950 dark:text-emerald-300">AT</div>
      </div>
    </div>
  )
}

function ThemeToggle({ dark, setDark }: { dark: boolean; setDark: (value: boolean) => void }) {
  return (
    <button onClick={() => setDark(!dark)} className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm text-slate-600 transition-colors hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800">
      <span className="flex items-center gap-2.5">{dark ? <Sun className="h-4 w-4 text-slate-400" /> : <Moon className="h-4 w-4 text-slate-400" />}{dark ? 'Light Mode' : 'Dark Mode'}</span>
      <span className={`relative h-[22px] w-10 rounded-full transition-colors ${dark ? 'bg-emerald-500' : 'bg-slate-200'}`}>
        <span className={`absolute top-[3px] h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${dark ? 'translate-x-[21px]' : 'translate-x-[3px]'}`} />
      </span>
    </button>
  )
}

function StatusBadge({ status }: { status: AssignmentStatus | QuizStatus }) {
  const styles = {
    graded: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
    submitted: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
    open: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
    closed: 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-300',
  }
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-medium ${styles[status]}`}>{status.charAt(0).toUpperCase() + status.slice(1)}</span>
}

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`rounded-2xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800 ${className}`}>{children}</div>
}

function Dashboard({ courses, assignments, quizzes, openAssignment }: { courses: Course[]; assignments: Array<Assignment & { course: Course }>; quizzes: Array<Quiz & { course: Course }>; openAssignment: (id: number) => void }) {
  const openAssignments = assignments.filter((assignment) => assignment.status === 'open')
  const pendingQuizzes = quizzes.filter((quiz) => quiz.status === 'open').length
  const totalCredits = courses.reduce((sum, course) => sum + course.credits, 0)
  const totalGpa = courses.reduce((sum, course) => sum + course.grades.gpa * course.credits, 0) / totalCredits

  return (
    <div className="animate-[fadeIn_.3s_ease-out]">
      <h1 className="mb-1 text-2xl font-semibold text-slate-900 dark:text-slate-100">Welcome back, Alex</h1>
      <p className="mb-8 text-sm text-slate-400">{student.className} - Academic Year 2024-25</p>
      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat icon={<BookOpen className="h-5 w-5" />} value={courses.length} label="Enrolled Courses" tone="emerald" />
        <Stat icon={<ClipboardList className="h-5 w-5" />} value={openAssignments.length + pendingQuizzes} label="Pending Tasks" tone="amber" badge={openAssignments.length + pendingQuizzes} />
        <Stat icon={<BarChart3 className="h-5 w-5" />} value={totalGpa.toFixed(2)} label="Current GPA" tone="blue" />
        <Stat icon={<CheckCircle2 className="h-5 w-5" />} value="96.4%" label="Attendance" tone="purple" />
      </div>
      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <h2 className="mb-4 text-sm font-semibold text-slate-900 dark:text-slate-100">Upcoming Deadlines</h2>
          <div className="space-y-3">
            {openAssignments.slice(0, 5).map((assignment) => {
              const colors = colorMap[assignment.course.color]
              return (
                <button key={assignment.id} onClick={() => openAssignment(assignment.id)} className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white p-4 text-left transition hover:-translate-y-0.5 hover:shadow-lg dark:border-slate-700 dark:bg-slate-800">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className={`h-2 w-2 shrink-0 rounded-full ${colors.dot}`} />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-slate-800 dark:text-slate-100">{assignment.title}</p>
                      <p className="text-xs text-slate-400">{assignment.course.code} - Due {formatDate(assignment.due)}</p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 shrink-0 text-slate-300" />
                </button>
              )
            })}
            {openAssignments.length === 0 && <p className="py-4 text-sm text-slate-400">No upcoming deadlines.</p>}
          </div>
        </div>
        <div className="lg:col-span-2">
          <h2 className="mb-4 text-sm font-semibold text-slate-900 dark:text-slate-100">Recent Announcements</h2>
          <div className="space-y-3">
            {announcements.slice(0, 4).map((announcement) => (
              <Card key={announcement.id} className="p-4">
                <div className="flex items-start gap-2">
                  {announcement.important ? <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" /> : <Megaphone className="mt-0.5 h-4 w-4 shrink-0 text-slate-300" />}
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-800 dark:text-slate-100">{announcement.title}</p>
                    <p className="mt-0.5 text-xs text-slate-400">{formatDate(announcement.date)}{announcement.source !== 'General' ? ` - ${announcement.source}` : ''}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function Stat({ icon, value, label, tone, badge }: { icon: React.ReactNode; value: React.ReactNode; label: string; tone: 'emerald' | 'amber' | 'blue' | 'purple'; badge?: number }) {
  const bg = {
    emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-300',
    amber: 'bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-300',
    blue: 'bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-300',
    purple: 'bg-purple-50 text-purple-600 dark:bg-purple-950 dark:text-purple-300',
  }
  return (
    <Card className="p-5">
      <div className="mb-3 flex items-center justify-between">
        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${bg[tone]}`}>{icon}</div>
        {badge !== undefined && <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-950 dark:text-amber-300">{badge}</span>}
      </div>
      <p className="text-2xl font-semibold">{value}</p>
      <p className="mt-0.5 text-xs text-slate-400">{label}</p>
    </Card>
  )
}

function Courses({ courses, openCourse }: { courses: Course[]; openCourse: (id: number) => void }) {
  return (
    <div>
      <PageTitle title="My Courses" subtitle={`${courses.length} courses enrolled`} />
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {courses.map((course) => {
          const colors = colorMap[course.color]
          return (
            <Card key={course.id} className="overflow-hidden transition hover:-translate-y-0.5 hover:shadow-lg">
              <div className={`h-1.5 ${colors.bg}`}>
                <div className={`h-full rounded-r-full ${colors.btn}`} style={{ width: `${course.progress}%` }} />
              </div>
              <div className="p-6">
                <div className="mb-3 flex items-start justify-between">
                  <div>
                    <h2 className="font-semibold text-slate-900 dark:text-slate-100">{course.name}</h2>
                    <span className="mt-1 inline-flex items-center gap-1.5 text-xs text-slate-400"><span className={`h-1.5 w-1.5 rounded-full ${colors.dot}`} />{course.code}</span>
                  </div>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${colors.badge}`}>{course.progress}%</span>
                </div>
                <div className="mb-4 flex items-center gap-2">
                  <User className="h-4 w-4 text-slate-300" />
                  <span className="text-xs text-slate-500">{course.lecturer}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">{course.assignments.filter((assignment) => assignment.status === 'open').length} open</span>
                  <button onClick={() => openCourse(course.id)} className={`flex items-center gap-1 text-xs font-medium hover:underline ${colors.text}`}>
                    View Course <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

function CourseDetail({ course, tab, setTab, openAssignment, openQuiz }: { course: Course; tab: CourseTab; setTab: (tab: CourseTab) => void; openAssignment: (id: number) => void; openQuiz: (id: number) => void }) {
  const colors = colorMap[course.color]
  const tabs: CourseTab[] = ['outline', 'resources', 'assignments', 'quizzes', 'grades']
  return (
    <div>
      <Breadcrumb items={['Courses', course.name]} />
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">{course.name}</h1>
          <div className="mt-1 flex items-center gap-4">
            <span className="text-sm text-slate-400">{course.code}</span>
            <span className="text-slate-200 dark:text-slate-700">-</span>
            <span className="text-sm text-slate-400">{course.lecturer}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-2 w-32 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700"><div className={`h-full rounded-full ${colors.btn}`} style={{ width: `${course.progress}%` }} /></div>
          <span className="text-sm font-medium text-slate-600 dark:text-slate-300">{course.progress}%</span>
        </div>
      </div>
      <div className="mb-6 flex gap-1 overflow-x-auto border-b border-slate-200 dark:border-slate-700">
        {tabs.map((item) => (
          <button key={item} onClick={() => setTab(item)} className={`whitespace-nowrap border-b-2 px-4 py-3 text-sm font-medium capitalize transition-colors ${tab === item ? `border-current ${colors.text}` : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}>
            {item}
          </button>
        ))}
      </div>
      {tab === 'outline' && <Outline course={course} />}
      {tab === 'resources' && <Resources course={course} />}
      {tab === 'assignments' && <CourseAssignments course={course} openAssignment={openAssignment} />}
      {tab === 'quizzes' && <CourseQuizzes course={course} openQuiz={openQuiz} />}
      {tab === 'grades' && <CourseGrades course={course} />}
    </div>
  )
}

function Outline({ course }: { course: Course }) {
  const colors = colorMap[course.color]
  return (
    <div className="space-y-3">
      {course.outline.map((week) => (
        <Card key={week.week} className="flex items-center gap-4 p-4">
          {week.status === 'done' && <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500" />}
          {week.status === 'current' && <div className={`h-5 w-5 shrink-0 rounded-full border-2 ${colors.border}`} />}
          {week.status === 'upcoming' && <div className="h-5 w-5 shrink-0 rounded-full border-2 border-slate-300 dark:border-slate-600" />}
          <div className="flex-1">
            <p className="text-sm font-medium text-slate-800 dark:text-slate-100">Week {week.week}: {week.topic}</p>
            <p className="mt-0.5 text-xs text-slate-400">{week.status === 'done' ? 'Completed' : week.status === 'current' ? 'In Progress' : 'Upcoming'}</p>
          </div>
          {week.status === 'done' && <Check className="h-5 w-5 text-emerald-500" />}
        </Card>
      ))}
    </div>
  )
}

function Resources({ course }: { course: Course }) {
  const colors = colorMap[course.color]
  return (
    <div className="space-y-3">
      {course.resources.map((resource) => {
        const Icon = fileIcon(resource.type)
        return (
          <Card key={resource.name} className="flex items-center justify-between p-4 transition hover:-translate-y-0.5 hover:shadow-lg">
            <div className="flex min-w-0 items-center gap-3">
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${colors.light}`}><Icon className={`h-5 w-5 ${colors.text}`} /></div>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-slate-800 dark:text-slate-100">{resource.name}</p>
                <p className="text-xs text-slate-400">{resource.size}</p>
              </div>
            </div>
            <button onClick={() => alert(`${resource.name} downloaded.`)} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-700">
              <Download className="h-5 w-5" />
            </button>
          </Card>
        )
      })}
    </div>
  )
}

function CourseAssignments({ course, openAssignment }: { course: Course; openAssignment: (id: number) => void }) {
  const colors = colorMap[course.color]
  return <div className="space-y-3">{course.assignments.map((assignment) => <AssessmentRow key={assignment.id} color={colors} title={assignment.title} meta={`Due ${formatDate(assignment.due)}${assignment.score !== null ? ` - Score: ${assignment.score}/${assignment.max}` : ''}`} status={assignment.status} onClick={() => openAssignment(assignment.id)} />)}</div>
}

function CourseQuizzes({ course, openQuiz }: { course: Course; openQuiz: (id: number) => void }) {
  const colors = colorMap[course.color]
  return <div className="space-y-3">{course.quizzes.map((quiz) => <AssessmentRow key={quiz.id} color={colors} title={quiz.title} meta={`Due ${formatDate(quiz.due)}${quiz.score !== null ? ` - Score: ${quiz.score}/${quiz.max}` : ''}`} status={quiz.status} onClick={() => openQuiz(quiz.id)} disabled={!canViewQuiz(quiz)} />)}</div>
}

function AssessmentRow({ color, title, meta, status, onClick, disabled }: { color: (typeof colorMap)[ColorName]; title: string; meta: string; status: AssignmentStatus | QuizStatus; onClick: () => void; disabled?: boolean }) {
  return (
    <Card className="flex items-center justify-between gap-3 p-4 transition hover:-translate-y-0.5 hover:shadow-lg">
      <div className="flex min-w-0 items-center gap-3">
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${color.light}`}><ClipboardList className={`h-5 w-5 ${color.text}`} /></div>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-slate-800 dark:text-slate-100">{title}</p>
          <p className="mt-0.5 text-xs text-slate-400">{meta}</p>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-3">
        <StatusBadge status={status} />
        {!disabled && <button onClick={onClick} className="text-xs font-medium text-slate-500 hover:text-slate-800 dark:hover:text-slate-200">View</button>}
      </div>
    </Card>
  )
}

function CourseGrades({ course }: { course: Course }) {
  const colors = colorMap[course.color]
  const grade = course.grades
  return (
    <Card className="p-6">
      <div className="mb-6 flex items-center gap-6">
        <div className={`flex h-20 w-20 items-center justify-center rounded-2xl ${colors.light}`}><span className={`text-3xl font-semibold ${colors.text}`}>{grade.grade}</span></div>
        <div>
          <p className="text-sm text-slate-500">Overall Score</p>
          <p className="text-2xl font-semibold text-slate-900 dark:text-slate-100">{grade.overall}%</p>
        </div>
      </div>
      <div className="space-y-4">
        <GradeLine label="Mid-Term" value={`${grade.midterm}%`} />
        <GradeLine label="Quizzes" value={`${grade.quizzes}%`} />
        <GradeLine label="Assignments" value={`${grade.assignments}%`} last />
      </div>
    </Card>
  )
}

function AssignmentsPage({ assignments, filter, setFilter, openAssignment }: { assignments: Array<Assignment & { course: Course }>; filter: string; setFilter: (filter: string) => void; openAssignment: (id: number) => void }) {
  const filters = ['all', 'open', 'submitted', 'graded', 'closed']
  const filtered = filter === 'all' ? assignments : assignments.filter((assignment) => assignment.status === filter)
  return (
    <div>
      <PageTitle title="Assignments" subtitle="All assignments across your courses" compact />
      <FilterBar value={filter} setValue={setFilter} filters={filters} count={(item) => item === 'all' ? assignments.length : assignments.filter((assignment) => assignment.status === item).length} />
      <div className="space-y-3">
        {filtered.map((assignment) => {
          const colors = colorMap[assignment.course.color]
          return (
            <Card key={assignment.id} className="flex flex-col justify-between gap-3 p-4 transition hover:-translate-y-0.5 hover:shadow-lg sm:flex-row sm:items-center">
              <div className="flex min-w-0 items-center gap-3">
                <div className={`h-2 w-2 shrink-0 rounded-full ${colors.dot}`} />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-slate-800 dark:text-slate-100">{assignment.title}</p>
                  <div className="mt-0.5 flex flex-wrap items-center gap-2">
                    <span className={`text-xs ${colors.text}`}>{assignment.course.code}</span>
                    <span className="text-xs text-slate-300">-</span>
                    <span className="text-xs text-slate-400">Due {formatDate(assignment.due)}</span>
                    {assignment.score !== null && <span className="text-xs font-medium text-emerald-600">{assignment.score}/{assignment.max}</span>}
                  </div>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-3 sm:ml-4">
                <StatusBadge status={assignment.status} />
                <button onClick={() => openAssignment(assignment.id)} className="rounded-lg bg-slate-100 px-4 py-2 text-xs font-medium text-slate-900 transition-colors hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-slate-600">View</button>
              </div>
            </Card>
          )
        })}
        {filtered.length === 0 && <p className="py-12 text-center text-sm text-slate-400">No assignments found.</p>}
      </div>
    </div>
  )
}

function AssignmentView({ assignment, selectedFile, setSelectedFile, fileInputRef, editorRef, submitAssignment, goAssignments }: { assignment: Assignment & { course: Course }; selectedFile: File | null; setSelectedFile: (file: File | null) => void; fileInputRef: React.RefObject<HTMLInputElement>; editorRef: React.RefObject<HTMLDivElement>; submitAssignment: (id: number) => void; goAssignments: () => void }) {
  const colors = colorMap[assignment.course.color]
  const showSubmit = assignment.status === 'open' || canResubmitAssignment(assignment)

  const chooseFile = (fileList: FileList | null) => {
    if (fileList?.length) setSelectedFile(fileList[0])
  }

  return (
    <div>
      <Breadcrumb items={['Assignments', assignment.title]} />
      <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">{assignment.title}</h1>
          <div className="mt-1 flex items-center gap-3">
            <span className={`text-xs font-medium ${colors.text}`}>{assignment.course.code} - {assignment.course.name}</span>
            <span className="text-slate-200 dark:text-slate-700">-</span>
            <span className="text-xs text-slate-400">Due {formatDate(assignment.due)}</span>
          </div>
        </div>
        <StatusBadge status={assignment.status} />
      </div>
      <SubmissionStatus assignment={assignment} />
      <Card className="mb-6 p-6">
        <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-slate-100"><HelpCircle className="h-4 w-4 text-slate-400" />Instructions</h2>
        <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">{assignment.question}</p>
        <p className="mt-3 text-xs text-slate-400">Maximum score: <span className="font-medium text-slate-600 dark:text-slate-300">{assignment.max}</span> points{assignment.maxAttempts > 1 ? ` - Attempts: ${assignment.maxAttempts}` : ''}</p>
      </Card>
      {assignment.submittedFile && (assignment.status === 'submitted' || assignment.status === 'graded') && <PreviousSubmission assignment={assignment} />}
      {showSubmit && (
        <>
          <Card className="mb-6 p-6">
            <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-slate-100"><UploadCloud className="h-4 w-4 text-slate-400" />Upload File</h2>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => {
                event.preventDefault()
                chooseFile(event.dataTransfer.files)
              }}
              className="w-full rounded-xl border-2 border-dashed border-slate-200 p-8 text-center transition-colors hover:border-emerald-300 dark:border-slate-700"
            >
              <CloudUpload className="mx-auto mb-2 h-8 w-8 text-slate-300" />
              <p className="text-sm text-slate-500">Drag and drop or <span className="font-medium text-emerald-600">browse</span></p>
              <p className="mt-1 text-xs text-slate-400">PDF, DOCX, PPTX, XLSX (Max 25MB)</p>
              <input ref={fileInputRef} type="file" className="hidden" accept=".pdf,.docx,.pptx,.xlsx,.doc,.ppt,.xls,.zip,.py" onChange={(event) => chooseFile(event.target.files)} />
            </button>
            {selectedFile && (
              <div className="mt-3 flex items-center justify-between rounded-lg bg-slate-50 p-3 dark:bg-slate-900">
                <div className="flex min-w-0 items-center gap-2">
                  <File className="h-4 w-4 text-slate-500" />
                  <span className="truncate text-sm text-slate-700 dark:text-slate-200">{selectedFile.name}</span>
                  <span className="text-xs text-slate-400">({(selectedFile.size / 1024 / 1024).toFixed(1)} MB)</span>
                </div>
                <button onClick={() => setSelectedFile(null)} className="ml-2 text-slate-400 hover:text-red-500"><X className="h-5 w-5" /></button>
              </div>
            )}
          </Card>
          <Card className="mb-6 overflow-hidden">
            <h2 className="flex items-center gap-2 px-6 pb-3 pt-6 text-sm font-semibold text-slate-900 dark:text-slate-100"><Pencil className="h-4 w-4 text-slate-400" />Type Your Answer</h2>
            <div className="px-6 pb-2">
              <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 p-2 dark:border-slate-700 dark:bg-slate-900">
                <EditorButton command="bold" label="B" />
                <EditorButton command="italic" label="I" italic />
                <EditorButton command="underline" label="U" underline />
                <div className="mx-1 h-5 w-px bg-slate-200 dark:bg-slate-700" />
                <EditorIconButton command="insertUnorderedList" icon={<List className="h-4 w-4" />} />
                <EditorIconButton command="insertOrderedList" icon={<ListOrdered className="h-4 w-4" />} />
              </div>
            </div>
            <div ref={editorRef} contentEditable suppressContentEditableWarning className="min-h-40 border-t border-slate-200 p-6 text-sm leading-relaxed text-slate-700 outline-none empty:before:text-slate-400 dark:border-slate-700 dark:text-slate-200" data-placeholder="Start typing your answer here..." />
          </Card>
          <div className="flex items-center justify-end gap-3">
            <button onClick={goAssignments} className="rounded-lg px-6 py-2.5 text-sm font-medium text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800">Cancel</button>
            <button onClick={() => submitAssignment(assignment.id)} className="rounded-lg bg-emerald-600 px-8 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-emerald-500">{assignment.attempts > 0 ? 'Resubmit Assignment' : 'Submit Assignment'}</button>
          </div>
        </>
      )}
    </div>
  )
}

function SubmissionStatus({ assignment }: { assignment: Assignment }) {
  if (assignment.status === 'graded') {
    return <div className="mb-6 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-900 dark:bg-emerald-950"><CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" /><div><p className="text-sm font-semibold text-emerald-800 dark:text-emerald-200">Graded - {assignment.score}/{assignment.max}</p><p className="mt-0.5 text-xs text-emerald-600 dark:text-emerald-300">Submitted on {assignment.submittedDate ? formatDate(assignment.submittedDate) : 'N/A'}</p></div></div>
  }
  if (assignment.status === 'submitted') {
    return <div className="mb-6 flex items-center gap-3 rounded-xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-950"><Calendar className="h-5 w-5 shrink-0 text-blue-600" /><div><p className="text-sm font-semibold text-blue-800 dark:text-blue-200">Submitted - Awaiting Review</p><p className="mt-0.5 text-xs text-blue-600 dark:text-blue-300">Submitted on {assignment.submittedDate ? formatDate(assignment.submittedDate) : 'N/A'}{assignment.maxAttempts > 1 ? ` - Attempt ${assignment.attempts} of ${assignment.maxAttempts}` : ''}</p></div></div>
  }
  if (assignment.status === 'closed') {
    return <div className="mb-6 flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900"><Lock className="h-5 w-5 shrink-0 text-slate-400" /><div><p className="text-sm font-semibold text-slate-500">Closed</p><p className="mt-0.5 text-xs text-slate-400">The deadline has passed.</p></div></div>
  }
  return null
}

function PreviousSubmission({ assignment }: { assignment: Assignment }) {
  if (!assignment.submittedFile) return null
  const Icon = fileIcon(assignment.submittedFile.name)
  return (
    <div className="mb-6 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900">
      <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Previous Submission</h2>
      <div className="flex items-center justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <Icon className="h-5 w-5 text-slate-400" />
          <div className="min-w-0">
            <p className="truncate text-sm text-slate-700 dark:text-slate-200">{assignment.submittedFile.name}</p>
            <p className="text-xs text-slate-400">{assignment.submittedFile.size} - {assignment.submittedDate ? formatDate(assignment.submittedDate) : 'N/A'}</p>
          </div>
        </div>
        <button onClick={() => alert(`${assignment.submittedFile?.name} downloaded.`)} className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"><Download className="h-4 w-4" /></button>
      </div>
    </div>
  )
}

function QuizzesPage({ quizzes, filter, setFilter, openQuiz }: { quizzes: Array<Quiz & { course: Course }>; filter: string; setFilter: (filter: string) => void; openQuiz: (id: number) => void }) {
  const filters = ['all', 'open', 'submitted', 'graded']
  const filtered = filter === 'all' ? quizzes : quizzes.filter((quiz) => quiz.status === filter)
  return (
    <div>
      <PageTitle title="Quizzes" subtitle="All quizzes across your courses" compact />
      <FilterBar value={filter} setValue={setFilter} filters={filters} count={(item) => item === 'all' ? quizzes.length : quizzes.filter((quiz) => quiz.status === item).length} />
      <div className="space-y-3">
        {filtered.map((quiz) => {
          const colors = colorMap[quiz.course.color]
          return (
            <Card key={quiz.id} className="flex flex-col justify-between gap-3 p-4 transition hover:-translate-y-0.5 hover:shadow-lg sm:flex-row sm:items-center">
              <div className="flex items-center gap-3">
                <div className={`h-2 w-2 shrink-0 rounded-full ${colors.dot}`} />
                <div>
                  <p className="truncate text-sm font-medium text-slate-800 dark:text-slate-100">{quiz.title}</p>
                  <div className="mt-0.5 flex flex-wrap items-center gap-2">
                    <span className={`text-xs ${colors.text}`}>{quiz.course.code}</span>
                    <span className="text-xs text-slate-300">-</span>
                    <span className="text-xs text-slate-400">Due {formatDate(quiz.due)}</span>
                    {quiz.score !== null && <span className="text-xs font-medium text-emerald-600">{quiz.score}/{quiz.max}</span>}
                  </div>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-3 sm:ml-4">
                <StatusBadge status={quiz.status} />
                {canViewQuiz(quiz) && <button onClick={() => openQuiz(quiz.id)} className="rounded-lg bg-slate-100 px-4 py-2 text-xs font-medium text-slate-900 transition-colors hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-slate-600">View</button>}
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

function QuizView({ quiz, started, setStarted, answers, setAnswers, submitQuiz, goQuizzes }: { quiz: Quiz & { course: Course }; started: boolean; setStarted: (value: boolean) => void; answers: Record<string, number>; setAnswers: (answers: Record<string, number>) => void; submitQuiz: (id: number) => void; goQuizzes: () => void }) {
  const colors = colorMap[quiz.course.color]
  const isGraded = quiz.status === 'graded'
  if (!started && !isGraded) {
    return (
      <div>
        <Breadcrumb items={['Quizzes', quiz.title]} />
        <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">{quiz.title}</h1>
            <div className="mt-1 flex items-center gap-3"><span className={`text-xs font-medium ${colors.text}`}>{quiz.course.code} - {quiz.course.name}</span></div>
          </div>
          <StatusBadge status={quiz.status} />
        </div>
        <Card className="mb-6 p-8">
          <div className="mb-6 flex items-center gap-3">
            <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${colors.light}`}><HelpCircle className={`h-6 w-6 ${colors.text}`} /></div>
            <h2 className="font-semibold text-slate-900 dark:text-slate-100">Quiz Instructions</h2>
          </div>
          <p className="mb-6 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{quiz.instructions}</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <InfoBox label="Questions" value={quiz.questions.length} />
            <InfoBox label="Max Score" value={quiz.max} />
            <InfoBox label="Attempts" value={quiz.maxAttempts > 1 ? `${quiz.attempts}/${quiz.maxAttempts}` : '1 only'} />
            <InfoBox label="Time" value={quiz.questions.length <= 2 ? '5 min' : '15 min'} />
          </div>
        </Card>
        <div className="flex items-center justify-end gap-3">
          <button onClick={goQuizzes} className="rounded-lg px-6 py-2.5 text-sm font-medium text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800">Cancel</button>
          <button onClick={() => setStarted(true)} className={`flex items-center gap-2 rounded-lg px-8 py-2.5 text-sm font-medium text-white shadow-sm hover:shadow ${colors.btn}`}><Play className="h-4 w-4" />Start Quiz</button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <Breadcrumb items={['Quizzes', quiz.title]} />
      <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">{quiz.title}</h1>
          <div className="mt-1 flex items-center gap-3"><span className={`text-xs font-medium ${colors.text}`}>{quiz.course.code}</span><span className="text-slate-200 dark:text-slate-700">-</span><span className="text-xs text-slate-400">{quiz.questions.length} questions</span></div>
        </div>
        <StatusBadge status={quiz.status} />
      </div>
      {isGraded && <div className="mb-6 flex items-center gap-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-900 dark:bg-emerald-950"><p className="text-2xl font-semibold text-emerald-700 dark:text-emerald-300">{quiz.score}<span className="text-lg text-emerald-400">/{quiz.max}</span></p><p className="text-xs text-emerald-600 dark:text-emerald-300">{quiz.maxAttempts > 1 ? `Attempt ${quiz.attempts}/${quiz.maxAttempts}` : ''}</p></div>}
      <div className="mb-8 space-y-6">
        {quiz.questions.map((question, index) => {
          const selected = answers[`${quiz.id}-${index}`]
          const wrong = isGraded && selected !== undefined && selected !== question.correct
          return (
            <Card key={question.q} className="p-6">
              <p className="mb-4 text-sm font-medium text-slate-900 dark:text-slate-100"><span className="mr-2 text-slate-400">Q{index + 1}.</span>{question.q}</p>
              <div className="space-y-2">
                {question.opts.map((option, optionIndex) => {
                  const isCorrect = isGraded && optionIndex === question.correct
                  const isWrong = wrong && optionIndex === selected
                  const isSelected = !isGraded && selected === optionIndex
                  return (
                    <button
                      key={option}
                      onClick={() => !isGraded && setAnswers({ ...answers, [`${quiz.id}-${index}`]: optionIndex })}
                      className={`flex w-full items-center gap-3 rounded-xl border p-3.5 text-left transition-colors ${
                        isCorrect || isSelected
                          ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950'
                          : isWrong
                            ? 'border-red-400 bg-red-50 dark:bg-red-950'
                            : 'border-slate-200 hover:border-emerald-500 hover:bg-emerald-50 dark:border-slate-700 dark:hover:bg-emerald-950'
                      }`}
                    >
                      <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${isCorrect || isSelected ? 'border-emerald-500' : isWrong ? 'border-red-400' : 'border-slate-300 dark:border-slate-600'}`}>{(isCorrect || isSelected) && <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />}{isWrong && <span className="h-2.5 w-2.5 rounded-full bg-red-400" />}</span>
                      <span className={`text-sm ${isCorrect ? 'font-medium text-emerald-800 dark:text-emerald-200' : isWrong ? 'text-red-700 dark:text-red-200' : 'text-slate-700 dark:text-slate-200'}`}>{option}</span>
                      {isCorrect && <Check className="ml-auto h-4 w-4 shrink-0 text-emerald-500" />}
                      {isWrong && <X className="ml-auto h-4 w-4 shrink-0 text-red-400" />}
                    </button>
                  )
                })}
              </div>
            </Card>
          )
        })}
      </div>
      {!isGraded && <div className="flex items-center justify-end gap-3"><button onClick={goQuizzes} className="rounded-lg px-6 py-2.5 text-sm font-medium text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800">Cancel</button><button onClick={() => submitQuiz(quiz.id)} className="rounded-lg bg-emerald-600 px-8 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-emerald-500">Submit Quiz</button></div>}
    </div>
  )
}

function Gradebook({ courses }: { courses: Course[] }) {
  const printedDate = new Date().toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase().replace(/\s/g, '-')
  const semesters = [
    { name: '2024/2025 Academic Year - Semester 1', courses: courses.slice(0, 3) },
    { name: '2024/2025 Academic Year - Semester 2', courses: courses.slice(3) },
  ]
  const totalCredits = courses.reduce((sum, course) => sum + course.credits, 0)
  const cumulativeGpa = courses.reduce((sum, course) => sum + course.grades.gpa * course.credits, 0) / totalCredits
  const cumulativeAverage = courses.reduce((sum, course) => sum + course.grades.overall, 0) / courses.length

  return (
    <div>
      <div className="no-print mb-6">
        <PageTitle title="Gradebook" subtitle="Your official academic record" compact />
      </div>
      <div className="no-print mb-6 flex justify-end">
        <button onClick={() => window.print()} className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900"><Printer className="h-4 w-4" />Print Transcript</button>
      </div>
      <div className="transcript mx-auto max-w-4xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-800">
        <div className="bg-slate-900 px-8 py-6 text-white dark:bg-slate-950">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-white/20 bg-white/10"><GraduationCap className="h-7 w-7 text-emerald-400" /></div>
              <div><h1 className="text-xl font-semibold tracking-tight">GREENFIELD ACADEMY</h1><p className="mt-0.5 text-xs tracking-wide text-slate-400">ACADEMIC RECORD</p></div>
            </div>
            <div className="hidden text-right sm:block"><p className="text-xs text-slate-400">Printed on</p><p className="font-mono text-sm font-medium text-white">{printedDate}</p></div>
          </div>
        </div>
        <div className="border-b border-slate-200 bg-slate-50/50 px-8 py-5 dark:border-slate-700 dark:bg-slate-900">
          <div className="grid grid-cols-2 gap-x-8 gap-y-3 sm:grid-cols-4">
            <TranscriptMeta label="Student Name" value={student.name.toUpperCase()} />
            <TranscriptMeta label="Student ID" value={student.id} mono />
            <TranscriptMeta label="Date of Birth" value={student.dob} mono />
            <TranscriptMeta label="Gender" value={student.gender.toUpperCase()} />
            <TranscriptMeta label="Class" value={student.className} />
            <TranscriptMeta label="Academic Year" value="2024 / 2025" />
            <div className="sm:hidden"><TranscriptMeta label="Printed" value={printedDate} mono /></div>
          </div>
        </div>
        <div className="px-8 py-6">
          {semesters.map((semester) => <SemesterTable key={semester.name} semester={semester} />)}
          <div className="mt-8 border-t-2 border-slate-900 pt-6 dark:border-slate-600">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-900 dark:text-slate-100">Cumulative Summary</h2>
            <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
              <SummaryBox label="Total Credits" value={totalCredits} />
              <SummaryBox label="Average" value={`${cumulativeAverage.toFixed(1)}%`} />
              <SummaryBox label="GPA" value={cumulativeGpa.toFixed(2)} />
              <SummaryBox label="Grade" value={cumulativeGpa >= 3.7 ? 'A+' : cumulativeGpa >= 3.5 ? 'A' : cumulativeGpa >= 3.2 ? 'B+' : 'B'} highlight />
            </div>
          </div>
          <div className="mt-8 border-t border-slate-200 pt-6 dark:border-slate-700">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-900 dark:text-slate-100">Grading Scale</h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              {['A+ 4.0 - 90-100%', 'A 3.7 - 85-89%', 'B+ 3.3 - 80-84%', 'B 3.0 - 75-79%', 'C+ 2.7 - 70-74%', 'C 2.0 - 65-69%', 'F 0.0 - Below 50%'].map((item) => <div key={item} className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2.5 text-xs text-slate-500 dark:border-slate-700 dark:bg-slate-900">{item}</div>)}
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50/50 px-8 py-4 dark:border-slate-700 dark:bg-slate-900"><p className="text-[10px] uppercase tracking-widest text-slate-400">Greenfield Academy - Official Academic Record</p><p className="font-mono text-[10px] text-slate-400">GFA-ACAD-{student.id}</p></div>
      </div>
    </div>
  )
}

function Schedule({ courses }: { courses: Course[] }) {
  const today = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][new Date().getDay()]
  return (
    <div>
      <PageTitle title="Schedule" subtitle="Weekly timetable" compact />
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-sm">
            <thead><tr className="border-b border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-900"><th className="w-28 px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Time</th>{schedule.days.map((day) => <th key={day} className={`px-3 py-3 text-center text-xs font-medium uppercase tracking-wider ${day === today ? 'text-emerald-600' : 'text-slate-500'}`}>{day}{day === today ? ' *' : ''}</th>)}</tr></thead>
            <tbody>
              {schedule.periods.map((period, index) => (
                <tr key={period} className="border-b border-slate-50 transition-colors hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900">
                  <td className="px-4 py-3 text-xs font-medium text-slate-400">{period}</td>
                  {schedule.days.map((day) => {
                    const courseId = schedule.data[day][index]
                    const course = courseId ? courses.find((item) => item.id === courseId) : null
                    const isBreak = index === 3 || index === 6
                    if (isBreak) return <td key={day} className="px-3 py-3 text-center text-xs italic text-slate-300">{index === 3 ? 'Break' : 'Lunch'}</td>
                    if (!course) return <td key={day} className="px-3 py-3" />
                    const colors = colorMap[course.color]
                    return <td key={day} className="px-2 py-2"><div className={`rounded-lg border px-3 py-2.5 text-center ${colors.bg} ${colors.border} ${day === today ? 'ring-2 ring-emerald-400 ring-offset-1 dark:ring-offset-slate-800' : ''}`}><p className={`text-xs font-semibold leading-tight ${colors.text}`}>{course.code}</p><p className="mt-0.5 truncate text-[10px] text-slate-500">{course.name}</p></div></td>
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

function Announcements() {
  return (
    <div>
      <PageTitle title="Announcements" subtitle="School and course news" compact />
      <div className="space-y-4">
        {announcements.map((announcement) => (
          <Card key={announcement.id} className={`p-6 ${announcement.important ? 'border-l-4 border-l-amber-400' : ''}`}>
            <div className="mb-2 flex items-center gap-2">
              {announcement.important && <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-700 dark:bg-amber-950 dark:text-amber-300">Important</span>}
              <h2 className="font-semibold text-slate-900 dark:text-slate-100">{announcement.title}</h2>
            </div>
            <p className="mb-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{announcement.content}</p>
            <div className="flex items-center gap-3 text-xs text-slate-400">
              <span className="flex items-center gap-1"><Calendar className="h-4 w-4" />{formatDate(announcement.date)}</span>
              <span className="h-1 w-1 rounded-full bg-slate-200 dark:bg-slate-700" />
              <span className="flex items-center gap-1"><Tag className="h-4 w-4" />{announcement.source}</span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

function PageTitle({ title, subtitle, compact = false }: { title: string; subtitle: string; compact?: boolean }) {
  return <div className={compact ? 'mb-6' : 'mb-8'}><h1 className="mb-1 text-2xl font-semibold text-slate-900 dark:text-slate-100">{title}</h1><p className="text-sm text-slate-400">{subtitle}</p></div>
}

function Breadcrumb({ items }: { items: string[] }) {
  return <div className="mb-6 flex flex-wrap items-center gap-2 text-xs text-slate-400">{items.map((item, index) => <span key={item} className="flex items-center gap-2">{index === items.length - 1 ? <span className="font-medium text-slate-700 dark:text-slate-200">{item}</span> : <span>{item}</span>}{index < items.length - 1 && <ChevronRight className="h-3 w-3" />}</span>)}</div>
}

function FilterBar({ value, setValue, filters, count }: { value: string; setValue: (value: string) => void; filters: string[]; count: (filter: string) => number }) {
  return <div className="mb-6 flex gap-2 overflow-x-auto">{filters.map((filter) => <button key={filter} onClick={() => setValue(filter)} className={`whitespace-nowrap rounded-lg px-4 py-2 text-xs font-medium capitalize transition-colors ${value === filter ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900' : 'border border-slate-200 bg-white text-slate-500 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800'}`}>{filter === 'all' ? 'All' : filter} ({count(filter)})</button>)}</div>
}

function InfoBox({ label, value }: { label: string; value: React.ReactNode }) {
  return <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-900"><p className="mb-1 text-xs text-slate-400">{label}</p><p className="font-semibold text-slate-800 dark:text-slate-100">{value}</p></div>
}

function GradeLine({ label, value, last }: { label: string; value: string; last?: boolean }) {
  return <div className={`flex items-center justify-between py-3 ${last ? '' : 'border-b border-slate-100 dark:border-slate-700'}`}><span className="text-sm text-slate-600 dark:text-slate-300">{label}</span><span className="text-sm font-semibold text-slate-900 dark:text-slate-100">{value}</span></div>
}

function EditorButton({ command, label, italic, underline }: { command: string; label: string; italic?: boolean; underline?: boolean }) {
  return <button type="button" onClick={() => document.execCommand(command)} className={`flex h-8 w-8 items-center justify-center rounded text-sm text-slate-600 hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-700 ${italic ? 'italic' : 'font-bold'} ${underline ? 'underline' : ''}`}>{label}</button>
}

function EditorIconButton({ command, icon }: { command: string; icon: React.ReactNode }) {
  return <button type="button" onClick={() => document.execCommand(command)} className="flex h-8 w-8 items-center justify-center rounded text-slate-600 hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-700">{icon}</button>
}

function TranscriptMeta({ label, value, mono }: { label: string; value: React.ReactNode; mono?: boolean }) {
  return <div><p className="mb-0.5 text-[10px] uppercase tracking-widest text-slate-400">{label}</p><p className={`text-sm font-semibold text-slate-900 dark:text-slate-100 ${mono ? 'font-mono' : ''}`}>{value}</p></div>
}

function SemesterTable({ semester }: { semester: { name: string; courses: Course[] } }) {
  const credits = semester.courses.reduce((sum, course) => sum + course.credits, 0)
  const gpa = semester.courses.reduce((sum, course) => sum + course.grades.gpa * course.credits, 0) / credits
  const average = semester.courses.reduce((sum, course) => sum + course.grades.overall, 0) / semester.courses.length
  return (
    <div className="mb-6">
      <div className="mb-3 flex items-center gap-3"><div className="h-5 w-1 rounded-full bg-slate-900 dark:bg-slate-500" /><h2 className="text-sm font-semibold uppercase tracking-wider text-slate-900 dark:text-slate-100">{semester.name}</h2></div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead><tr className="border-b-2 border-slate-300 dark:border-slate-600">{['Code', 'Course Title', 'Credits', 'Mid-Term', 'Coursework', 'Overall', 'Grade', 'GPA'].map((head) => <th key={head} className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">{head}</th>)}</tr></thead>
          <tbody>{semester.courses.map((course) => <tr key={course.id} className="border-b border-slate-200 hover:bg-slate-50/50 dark:border-slate-700 dark:hover:bg-slate-900"><td className="px-4 py-3 font-mono text-sm tracking-wide text-slate-700 dark:text-slate-300">{course.code}</td><td className="px-4 py-3 text-sm text-slate-800 dark:text-slate-100">{course.name}</td><td className="px-4 py-3 text-center text-sm">{course.credits}</td><td className="px-4 py-3 text-center text-sm">{course.grades.midterm}%</td><td className="px-4 py-3 text-center text-sm">{course.grades.assignments}%</td><td className="px-4 py-3 text-center text-sm font-semibold">{course.grades.overall}%</td><td className="px-4 py-3 text-center text-sm font-bold">{course.grades.grade}</td><td className="px-4 py-3 text-center text-sm font-semibold">{course.grades.gpa.toFixed(1)}</td></tr>)}</tbody>
        </table>
      </div>
      <div className="mt-3 flex items-center justify-end gap-8 border-t border-slate-200 pt-3 dark:border-slate-700">
        <SummarySmall label="Credits" value={credits} />
        <SummarySmall label="Average" value={`${average.toFixed(1)}%`} />
        <SummarySmall label="GPA" value={gpa.toFixed(2)} />
      </div>
    </div>
  )
}

function SummarySmall({ label, value }: { label: string; value: React.ReactNode }) {
  return <div className="text-right"><p className="text-[11px] uppercase tracking-wider text-slate-400">{label}</p><p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{value}</p></div>
}

function SummaryBox({ label, value, highlight }: { label: string; value: React.ReactNode; highlight?: boolean }) {
  return <div className={`rounded-xl border p-4 text-center ${highlight ? 'border-emerald-100 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950' : 'border-slate-100 bg-slate-50 dark:border-slate-700 dark:bg-slate-900'}`}><p className={`mb-1 text-[10px] uppercase tracking-widest ${highlight ? 'text-emerald-600 dark:text-emerald-300' : 'text-slate-400'}`}>{label}</p><p className={`text-2xl font-bold ${highlight ? 'text-emerald-700 dark:text-emerald-300' : 'text-slate-900 dark:text-slate-100'}`}>{value}</p></div>
}

function canResubmitAssignment(assignment: Assignment) {
  return assignment.status !== 'graded' && assignment.status !== 'closed' && assignment.maxAttempts > 1 && assignment.attempts < assignment.maxAttempts
}

function canViewQuiz(quiz: Quiz) {
  if (quiz.status === 'open') return true
  return quiz.maxAttempts > 1 && quiz.attempts < quiz.maxAttempts
}
