import Link from 'next/link'
import {
  ArrowRight,
  BookOpen,
  Crown,
  GraduationCap,
  Info,
  Shield,
  User,
} from 'lucide-react'

const roles = [
  {
    role: 'STUDENT',
    label: 'Student',
    description: 'Grades, attendance, timetable',
    icon: User,
    accent: 'emerald',
    iconClass: 'text-emerald-600',
    iconBg: 'bg-emerald-50 group-hover:bg-emerald-100',
    borderClass: 'hover:border-emerald-300 hover:shadow-emerald-500/5',
  },
  {
    role: 'PRINCIPAL',
    label: 'Principal',
    description: 'Oversight, analytics, reports',
    icon: Crown,
    accent: 'blue',
    iconClass: 'text-blue-600',
    iconBg: 'bg-blue-50 group-hover:bg-blue-100',
    borderClass: 'hover:border-blue-300 hover:shadow-blue-500/5',
  },
  {
    role: 'TEACHER',
    label: 'Teacher',
    description: 'Classroom, grading, plans',
    icon: BookOpen,
    accent: 'amber',
    iconClass: 'text-amber-600',
    iconBg: 'bg-amber-50 group-hover:bg-amber-100',
    borderClass: 'hover:border-amber-300 hover:shadow-amber-500/5',
  },
  {
    role: 'ADMIN',
    label: 'Admin',
    description: 'Full management access',
    icon: Shield,
    accent: 'purple',
    iconClass: 'text-purple-600',
    iconBg: 'bg-purple-50 group-hover:bg-purple-100',
    borderClass: 'hover:border-purple-300 hover:shadow-purple-500/5',
  },
]

const signInTextColors: Record<string, string> = {
  emerald: 'text-emerald-600',
  blue: 'text-blue-600',
  amber: 'text-amber-600',
  purple: 'text-purple-600',
}

export default function LandingPage() {
  return (
    <main className="grid-bg flex min-h-screen flex-col bg-white text-slate-900">
      <header className="border-b border-slate-100 bg-white/75 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-900">
              <GraduationCap className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <span className="block font-semibold leading-tight text-slate-900">
                Greenfield Academy
              </span>
              <span className="text-[10px] tracking-wide text-slate-400">
                Student Management Portal
              </span>
            </div>
          </div>

          <nav className="flex items-center gap-4 text-sm">
            <Link
              href="#"
              className="hidden text-slate-400 transition-colors hover:text-slate-600 sm:block"
            >
              Help
            </Link>
            <Link
              href="#"
              className="hidden text-slate-400 transition-colors hover:text-slate-600 sm:block"
            >
              Contact
            </Link>
            <div className="hidden h-5 w-px bg-slate-200 sm:block" />
            <span className="hidden text-xs text-slate-400 md:block">
              Academic Year 2024-25
            </span>
          </nav>
        </div>
      </header>

      <section className="flex flex-1 items-center justify-center px-6 py-16">
        <div className="w-full max-w-4xl">
          <div className="fade-in-up mb-12 text-center">
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900 md:text-4xl">
              Welcome to your portal
            </h1>
            <p className="mt-3 text-slate-500">
              Select your role to sign in and access your dashboard.
            </p>
          </div>

          <div className="fade-in-up-d1 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {roles.map(
              ({
                role,
                label,
                description,
                icon: Icon,
                accent,
                iconClass,
                iconBg,
                borderClass,
              }) => (
                <Link
                  key={role}
                  href={`/login?role=${role}`}
                  className={`portal-card group block rounded-lg border border-slate-200 bg-white p-7 text-center hover:shadow-lg ${borderClass}`}
                >
                  <div
                    className={`mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-lg transition-colors ${iconBg}`}
                  >
                    <Icon className={`h-6 w-6 ${iconClass}`} />
                  </div>
                  <h2 className="mb-1 font-semibold text-slate-900">{label}</h2>
                  <p className="mb-5 text-xs text-slate-400">{description}</p>
                  <span
                    className={`inline-flex items-center gap-1.5 text-xs font-medium ${signInTextColors[accent]}`}
                  >
                    Sign in
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </Link>
              )
            )}
          </div>

          <div className="fade-in-up-d2 mt-10">
            <div className="mx-auto flex max-w-2xl items-start gap-4 rounded-lg border border-amber-200 bg-amber-50 p-5">
              <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-100">
                <Info className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="mb-1 text-sm font-semibold text-amber-800">
                  New user?
                </p>
                <p className="text-sm leading-relaxed text-amber-700">
                  Your login credentials have been sent to your registered email
                  and phone number. If you haven&apos;t received them, contact
                  the school office.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-100 py-5">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-6 text-xs text-slate-400 sm:flex-row">
          <span>© 2025 Greenfield Academy. All rights reserved.</span>
          <span>Powered by EduFlow</span>
        </div>
      </footer>
    </main>
  )
}
