# School Management System — Frontend Codex Configuration

## Project Overview

Next.js 14 (App Router) frontend for a school management system with 5 role-based
portals: Admin, Student, Teacher, Principal, IT Support.
Backend is Django REST Framework running at http://localhost:8000.

## Tech Stack

* **Framework:** Next.js 14 (App Router)
* **Language:** TypeScript
* **Styling:** Tailwind CSS
* **Components:** shadcn/ui
* **API calls:** Axios + TanStack React Query v5
* **Forms:** React Hook Form + Zod
* **Tables:** TanStack Table v8
* **Charts:** Recharts
* **Icons:** Lucide React
* **Auth:** JWT stored in HttpOnly cookie via Next.js middleware
* **State:** Zustand (global auth state only — server state via React Query)

## Commands

```bash
npm run dev          # start dev server (port 3000)
npm run build        # production build
npm run lint         # ESLint
npm run type-check   # tsc --noEmit
npm test             # Jest + React Testing Library
npm run test:e2e     # Playwright e2e tests
```

## Project Structure

```
app/
  (auth)/
    login/
    reset-password/       # first-login reset
  (admin)/
    layout.tsx            # admin sidebar + navbar
    dashboard/
    students/
    teachers/
    courses/
    schedules/
    fees/
    announcements/
    reports/
  (student)/
    layout.tsx
    dashboard/
    courses/
      [id]/
        resources/
        outline/
        quizzes/
        assignments/
    fees/
    announcements/
  (teacher)/
    layout.tsx
    dashboard/
    courses/
      [id]/
        resources/
        outline/
        quizzes/
        assignments/
    evaluations/
  (principal)/
    layout.tsx
    dashboard/
    reports/
    announcements/
  (it-support)/
    layout.tsx
    dashboard/
    tickets/
    users/
components/
  ui/                     # shadcn/ui components (never edit directly)
  shared/                 # shared across portals
    DataTable.tsx
    PageHeader.tsx
    StatusBadge.tsx
    ConfirmDialog.tsx
    LoadingSkeleton.tsx
  admin/                  # admin-specific components
  student/
  teacher/
  principal/
  it-support/
lib/
  api/                    # axios instance + all API call functions
    auth.ts
    users.ts
    academics.ts
    enrollment.ts
    assessments.ts
    fees.ts
    schedules.ts
    announcements.ts
    reports.ts
    it-support.ts
  hooks/                  # React Query hooks
    useAuth.ts
    useStudents.ts
    useCourses.ts
    useQuizzes.ts
    useFees.ts
  types/                  # TypeScript interfaces matching backend models
    user.ts
    academics.ts
    enrollment.ts
    assessments.ts
    fees.ts
    announcements.ts
  utils/
    formatters.ts         # date, currency, status formatters
    validators.ts         # Zod schemas
  constants.ts            # role names, status labels, color maps
middleware.ts             # JWT validation + route protection
```

## Code Style

* TypeScript strict mode — no `any` types
* All API response types defined in `lib/types/`
* All API calls in `lib/api/` — never fetch directly in components
* All server state via React Query — never useState for remote data
* Forms always use React Hook Form + Zod schema validation
* Tables always use TanStack Table with server-side pagination
* Never hardcode API URLs — use `NEXT_PUBLIC_API_URL` env variable
* All dates formatted via `lib/utils/formatters.ts` — never inline
* All currency (fees) formatted as Ghana Cedis via `formatters.ts`
* Components use named exports — never default export from component files
* Pages use default exports (Next.js requirement)

## Critical Rules (NEVER violate)

* **JWT stored in HttpOnly cookie only** — never localStorage or sessionStorage
* **Middleware guards every portal route** — no client-only route protection
* **`force_password_reset: true` redirects to /reset-password immediately** — no other page accessible
* **Role check happens in middleware** — never trust client-side role checks alone
* **API errors always show user-friendly messages** — never expose raw error objects
* **All forms show field-level validation errors** matching DRF error response shape
* **Loading states on every async action** — no silent loading
* **Optimistic updates only for non-critical actions** — fee payments, grade submissions always wait for server confirmation
* **Never mutate React Query cache directly** — use invalidateQueries after mutations

## Environment Variables

```
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_APP_NAME=School Management System
```

## API Response Shape (always expect this)

```typescript
// Success
{ success: true, data: T, message: string }

// Error
{ success: false, data: null, message: string, errors: Record<string, string[]> }

// Paginated
{ success: true, data: { count: number, next: string|null, previous: string|null, results: T[] } }
```

## Auth Flow

1. User lands on `/` — role selection page with 5 role cards
2. User clicks their role → redirected to `/login?role=STUDENT`
3. Login page reads `role` from URL param, shows "Signing in as Student"
4. User submits `{ school_id, password, role }` to `POST /auth/login/`
5. Backend validates credentials AND that user has the submitted role assigned
6. If role mismatch → 403 error shown: "You are not registered as a Student"
7. On success: store `access`, `refresh`, `active_role` in HttpOnly cookies
8. If `force_password_reset=true` → redirect to `/reset-password`
9. Middleware reads JWT, extracts `active_role`, routes to correct portal
10. Axios interceptor auto-refreshes access token on 401 using refresh token
11. On logout → call `POST /auth/logout/` → clear cookies → redirect to `/`

## @imports

* API contracts: @docs/api.md (backend)
* Permissions: @docs/permissions.md (backend)
* Component patterns: @docs/frontend-components.md
* API hooks: @docs/frontend-api.md
