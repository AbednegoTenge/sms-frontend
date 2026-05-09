export type QuestionType =
  | 'MULTIPLE_CHOICE'
  | 'MULTIPLE_ANSWER'
  | 'TRUE_FALSE'
  | 'SHORT_ANSWER'

export interface QuestionChoice {
  id: string
  text: string
  is_correct?: boolean
}

export interface Question {
  id: string
  question_text: string
  question_type: QuestionType
  marks: number
  order: number
  choices: QuestionChoice[]
}

export interface Quiz {
  id: string
  title: string
  instructions: string | null
  max_attempts: number
  due_datetime: string
  status: 'DRAFT' | 'OPEN' | 'CLOSED'
  total_marks: number
  questions: Question[]
}

export interface QuizAttempt {
  id: string
  quiz: string
  attempt_number: number
  started_at: string
  submitted_at: string | null
  score: number | null
  status: 'IN_PROGRESS' | 'SUBMITTED' | 'GRADED'
}

export interface Assignment {
  id: string
  title: string
  description: string
  due_datetime: string
  submission_type: 'DOCUMENT' | 'TEXT' | 'BOTH'
  max_marks: number
  status: 'DRAFT' | 'OPEN' | 'CLOSED'
}

export interface AssignmentSubmission {
  id: string
  assignment: string
  submitted_at: string
  text_content: string | null
  file_url: string | null
  marks_obtained: number | null
  feedback: string | null
  status: 'SUBMITTED' | 'GRADED' | 'LATE'
}

export interface Resource {
  id: string
  title: string
  resource_type: 'VIDEO_LINK' | 'PDF' | 'PRESENTATION' | 'OTHER'
  url: string | null
  file_url: string | null
  uploaded_at: string
}

export interface TeacherEvaluation {
  id: string
  rating: 1 | 2 | 3 | 4 | 5
  comment: string | null
  submitted_at: string
}
