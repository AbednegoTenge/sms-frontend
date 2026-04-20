# Frontend Task Workflow — School Management System

## Build Philosophy

* Phase-gated: each phase must be visually verified before the next begins
* Plan Mode before every new portal or complex page
* `/clear` context between portals
* Every page: API hook → loading state → error state → data display → empty state

---

## Phase 0: Project Bootstrap & Auth

**Goal:** Next.js project running with login and first-login reset working end-to-end against the real backend.

### Tasks

* [ ] Scaffold Next.js 14 project with TypeScript and App Router
* [ ] Install all dependencies (shadcn/ui, axios, react-query, zustand, etc.)
* [ ] Configure `NEXT_PUBLIC_API_URL` in `.env.local`
* [ ] Set up Tailwind CSS + shadcn/ui
* [ ] Initialize shadcn components: button, input, form, card, toast, badge, dialog, table, skeleton
* [ ] Create `lib/api/client.ts` — axios instance with JWT interceptor and auto-refresh
* [ ] Create `lib/store/authStore.ts` — Zustand auth store
* [ ] Create `lib/types/` — all TypeScript interfaces
* [ ] Create `lib/utils/formatters.ts` — date, currency, relative time
* [ ] Create `app/providers.tsx` — React Query provider + Zustand
* [ ] Write `middleware.ts` — JWT decode, active_role-based route protection
* [ ] Build `/` landing page (role selection):
  * [ ] 5 role cards: Student, Teacher, Admin, Principal, IT Support
  * [ ] Each card has an icon, role name, and short description
  * [ ] Clicking a card redirects to `/login?role=STUDENT` (or relevant role)
  * [ ] Clean welcoming design — first thing every user sees
* [ ] Build `/login` page:
  * [ ] Reads `role` from URL query param — redirects to `/` if missing
  * [ ] Shows role context banner: e.g. "Signing in as Student"
  * [ ] Back link to `/` to change role
  * [ ] school_id + password form
  * [ ] React Hook Form + Zod validation
  * [ ] useLogin mutation sends `{ school_id, password, role }` to backend
  * [ ] Error messages from API displayed below fields
  * [ ] Role mismatch error shown clearly: "You are not registered as a Student"
  * [ ] Loading state on submit button
  * [ ] Redirect to correct portal on success based on `active_role`
  * [ ] Redirect to /reset-password if `force_password_reset=true`
* [ ] Build `/reset-password` page:
  * [ ] New password + confirm password form
  * [ ] Password strength requirements shown (8 chars, 1 uppercase, 1 digit)
  * [ ] useFirstLoginReset mutation hook
  * [ ] Success → redirect to /login with toast
* [ ] Configure CORS in backend to accept requests from http://localhost:3000

**Gate:** Landing page shows 5 role cards. Clicking Student → `/login?role=STUDENT`.
Login with correct role + STD001 works. Wrong role shows clear error.
`force_password_reset` redirects correctly. Token auto-refresh works on 401.

---

## Phase 1: Admin Portal

**Goal:** Full admin dashboard covering all admin responsibilities.

### Phase 1a — Layout + Dashboard

* [ ] `app/(admin)/layout.tsx` — sidebar + topbar
* [ ] `AdminSidebar` component with all nav links
* [ ] `Topbar` component with user name, school_id, logout button
* [ ] `app/(admin)/dashboard/page.tsx` — stats cards:
  * Total students, Total teachers, Current term, Fee collection summary
  * Recent announcements
  * Quick actions: Add Student, Add Teacher, View Reports

### Phase 1b — Student Management

* [ ] `app/(admin)/students/page.tsx` — paginated table
  * Columns: school_id, full name, level, program, class section, status
  * Filters: level, program, status, search
  * Actions: View, Edit, Deactivate
* [ ] `app/(admin)/students/new/page.tsx` — create student form
  * Fields: first_name, last_name, email, phone, password
  * On success: show generated school_id to admin
* [ ] `app/(admin)/students/[id]/page.tsx` — student detail
  * Profile info
  * Assign program (dropdown of 5 programs)
  * Enroll electives (multi-select, exactly 4, filtered by program)
  * Enrolled courses list (core + elective)
  * Fee history
  * Assignment to class section

### Phase 1c — Teacher Management

* [ ] `app/(admin)/teachers/page.tsx` — paginated table
* [ ] `app/(admin)/teachers/new/page.tsx` — create teacher form
* [ ] `app/(admin)/teachers/[id]/page.tsx` — teacher detail
  * Assigned courses list
  * Assign to course (select course, term, level)
  * Evaluation summary

### Phase 1d — Academic Management

* [ ] `app/(admin)/courses/page.tsx` — course list (core + elective, filter by type/program)
* [ ] `app/(admin)/courses/new/page.tsx` — create course
* [ ] Academic year + term management page
* [ ] Term transition button (with confirmation dialog, throttled)
  * Show what will happen: X students promoted, Y graduated
  * Require typing "CONFIRM" before proceeding

### Phase 1e — Schedules

* [ ] `app/(admin)/schedules/timetable/page.tsx` — weekly timetable grid view
* [ ] `app/(admin)/schedules/exams/page.tsx` — exam schedule list
* [ ] `app/(admin)/schedules/holidays/page.tsx` — holiday list
* [ ] Create/edit forms for each with conflict detection error handling

### Phase 1f — Fees

* [ ] `app/(admin)/fees/structures/page.tsx` — fee structure list + create
* [ ] `app/(admin)/fees/page.tsx` — all student fees
  * Filter by status (OVERDUE highlighted in red), term, level
  * Export button
* [ ] `app/(admin)/fees/[id]/page.tsx` — student fee detail
  * Payment history
  * Record payment form (amount, method, reference)
  * Send reminder button
* [ ] Payment status badges with correct colors

### Phase 1g — Announcements

* [ ] `app/(admin)/announcements/page.tsx` — list + create button
* [ ] Create announcement form:
  * Title, body (textarea)
  * Recipient type selector
  * Conditional: program selector (if BY_PROGRAM), level selector (if BY_LEVEL)
  * Preview recipients count before publish
  * Publish toggle

### Phase 1h — Reports

* [ ] `app/(admin)/reports/academic/page.tsx`
  * Filters: term, level, program, course
  * Stats cards: total students, avg score, pass rate
  * Course breakdown table
  * Export CSV button (async, poll for download)
* [ ] `app/(admin)/reports/fees/page.tsx`
  * Stats: expected, collected, outstanding
  * Breakdown by status (donut chart with Recharts)
  * Export button
* [ ] `app/(admin)/reports/evaluations/page.tsx`
  * Teacher evaluation averages
  * Bar chart: avg rating per teacher

**Gate:** All admin CRUD operations work against real backend. Term transition works. Fee payment records correctly.

---

## Phase 2: Teacher Portal

**Goal:** Teachers can manage all course content for their assigned courses.

### Tasks

* [ ] `app/(teacher)/layout.tsx` — teacher sidebar + topbar
* [ ] `app/(teacher)/dashboard/page.tsx`
  * My assigned courses this term
  * Upcoming quiz/assignment due dates
  * Recent student submissions
* [ ] `app/(teacher)/courses/page.tsx` — list of assigned courses
* [ ] `app/(teacher)/courses/[id]/page.tsx` — course hub with tabs:
  * **Students tab:** enrolled students list
  * **Resources tab:** upload resource (file or link), list existing resources
  * **Outline tab:** weekly outline editor (week by week, drag to reorder)
  * **Quizzes tab:** quiz list, create quiz button
  * **Assignments tab:** assignment list, create assignment button
* [ ] Quiz builder page `courses/[id]/quizzes/new`:
  * Title, instructions, attempts, due datetime
  * Add questions dynamically (type selector changes form fields)
  * MULTIPLE_CHOICE: add choices, mark correct one
  * MULTIPLE_ANSWER: add choices, mark multiple correct
  * TRUE_FALSE: True/False choices auto-populated
  * SHORT_ANSWER: just question text
  * Reorder questions with drag handle
  * Save as draft → publish separately
* [ ] Quiz submissions page — table of all student attempts with scores
* [ ] Assignment builder page `courses/[id]/assignments/new`
* [ ] Assignment submissions page — table with grade/feedback form per submission
* [ ] `app/(teacher)/evaluations/page.tsx` — received evaluations summary (avg rating, comments)

**Gate:** Teacher can upload resources, create and publish quizzes, create assignments, and grade submissions.

---

## Phase 3: Student Portal

**Goal:** Students can access all course content and submit work.

### Tasks

* [ ] `app/(student)/layout.tsx` — student sidebar + topbar
* [ ] `app/(student)/dashboard/page.tsx`
  * Enrolled courses grid
  * Upcoming due dates (quizzes + assignments)
  * Unread announcements count
  * Fee status banner (red if OVERDUE)
* [ ] `app/(student)/courses/page.tsx` — enrolled course cards
* [ ] `app/(student)/courses/[id]/page.tsx` — course hub with tabs:
  * **Overview:** course name, teacher name, term
  * **Resources:** list of resources (click to open/download via presigned URL)
  * **Outline:** weekly topics read-only
  * **Quizzes:** list of quizzes with status badge and due date
  * **Assignments:** list of assignments with status and due date
* [ ] Quiz attempt page `courses/[id]/quizzes/[quizId]`:
  * Show attempt history (score, submitted_at)
  * Start new attempt button (disabled if max attempts reached or CLOSED)
  * Quiz taking UI:
    * One question at a time or all at once (configurable)
    * MC: radio buttons
    * MULTIPLE_ANSWER: checkboxes
    * TRUE_FALSE: True/False buttons
    * SHORT_ANSWER: textarea
    * Submit button with confirmation dialog
    * Timer showing time until due_datetime
* [ ] Assignment submission page `courses/[id]/assignments/[assignmentId]`:
  * Assignment description
  * Submission form: text area and/or file upload based on submission_type
  * Show existing submission if already submitted (with grade/feedback if graded)
  * Closed banner if CLOSED
* [ ] Teacher evaluation form (one per course per term):
  * Star rating (1-5)
  * Comment textarea
  * Submit once, then read-only
* [ ] `app/(student)/fees/page.tsx`:
  * Current term fee card with status badge
  * Payment history table
  * OVERDUE banner with contact admin message
* [ ] `app/(student)/announcements/page.tsx`:
  * List of announcements addressed to student
  * Unread highlighted
  * Mark as read on click/open

**Gate:** Student can attempt quizzes, submit assignments, view grades, and see fees.

---

## Phase 4: Principal Portal

**Goal:** Principal can view reports and send announcements.

### Tasks

* [ ] `app/(principal)/layout.tsx`
* [ ] `app/(principal)/dashboard/page.tsx`
  * School summary stats: total students, teachers, pass rate this term
  * Fee collection overview
  * Recent announcements
* [ ] `app/(principal)/reports/` — same report pages as admin (read-only)
* [ ] `app/(principal)/announcements/page.tsx` — same as admin announcements

**Gate:** Principal sees correct data, cannot access admin-only pages.

---

## Phase 5: IT Support Portal

**Goal:** IT Support can manage tickets and reset passwords.

### Tasks

* [ ] `app/(it-support)/layout.tsx`
* [ ] `app/(it-support)/dashboard/page.tsx`
  * Open tickets count by priority
  * Recent tickets
* [ ] `app/(it-support)/tickets/page.tsx`
  * All tickets table
  * Filter by status, priority, category
  * Assign to self, update status
* [ ] `app/(it-support)/tickets/[id]/page.tsx`
  * Ticket detail + update status form
  * Set resolved_at when marking RESOLVED
* [ ] `app/(it-support)/users/page.tsx`
  * Search user by school_id or name
  * Reset password form: new_password + reason
  * Confirm dialog before resetting
  * Show success with confirmation that user must reset on next login
* [ ] `app/(it-support)/announcements/page.tsx` — create maintenance announcements

**Gate:** IT Support can reset passwords and manage tickets end-to-end.

---

## Phase 6: Cross-Portal Polish

**Goal:** Production-ready UX across all portals.

### Tasks

* [ ] Mobile responsive layout for all portals (collapsible sidebar)
* [ ] Dark mode toggle (shadcn supports this out of the box)
* [ ] Empty states on every list page (no data illustration + action button)
* [ ] Loading skeletons on every data-fetching page
* [ ] 404 page per portal
* [ ] Error boundary per portal (catches unexpected JS errors)
* [ ] Multi-role user: role selector page when user has 2+ roles
* [ ] Session expiry warning (show toast 2 min before access token expires)
* [ ] Confirm dialogs on all destructive actions (deactivate user, delete, transition term)
* [ ] Toast notifications on all mutations (success + error)
* [ ] Print-friendly styles for report pages
* [ ] Favicon + page titles per portal

**Gate:** All portals work on mobile. Empty and error states handled everywhere.
No console errors. All TypeScript strict mode passes.
