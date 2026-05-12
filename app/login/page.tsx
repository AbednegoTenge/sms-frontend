'use client'

import { Suspense, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import Cookies from 'js-cookie'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import {
  ArrowLeft,
  BadgeCheck,
  BookOpen,
  Crown,
  Eye,
  EyeOff,
  GraduationCap,
  Info,
  Loader2,
  Lock,
  Shield,
  User,
  UserCircle,
} from 'lucide-react'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { useLogin } from '@/lib/hooks/useAuth'
import { useAuthStore } from '@/lib/store/authStore'

const ROLE_CONFIG = {
  STUDENT: {
    label: 'Student',
    title: 'Student Login',
    subtitle: 'Access your grades, attendance & timetable',
    idLabel: 'Student ID',
    placeholder: 'Enter your Student ID',
    icon: User,
    fieldIcon: UserCircle,
    iconWrap: 'bg-emerald-50 border-emerald-100',
    iconColor: 'text-emerald-600',
    linkColor: 'text-emerald-600',
    buttonClass: 'bg-emerald-600 hover:bg-emerald-500',
    focusClass: 'focus:border-emerald-500 focus:ring-emerald-500/10',
  },
  PRINCIPAL: {
    label: 'Principal',
    title: 'Principal Login',
    subtitle: 'School oversight, analytics & reports',
    idLabel: 'Principal ID',
    placeholder: 'Enter your Principal ID',
    icon: Crown,
    fieldIcon: UserCircle,
    iconWrap: 'bg-blue-50 border-blue-100',
    iconColor: 'text-blue-600',
    linkColor: 'text-blue-600',
    buttonClass: 'bg-blue-600 hover:bg-blue-500',
    focusClass: 'focus:border-blue-500 focus:ring-blue-500/10',
  },
  TEACHER: {
    label: 'Teacher',
    title: 'Teacher Login',
    subtitle: 'Classroom management, grading & lesson plans',
    idLabel: 'Teacher ID',
    placeholder: 'Enter your Teacher ID',
    icon: BookOpen,
    fieldIcon: UserCircle,
    iconWrap: 'bg-amber-50 border-amber-100',
    iconColor: 'text-amber-600',
    linkColor: 'text-amber-600',
    buttonClass: 'bg-amber-500 hover:bg-amber-400',
    focusClass: 'focus:border-amber-500 focus:ring-amber-500/10',
  },
  ADMIN: {
    label: 'Admin',
    title: 'Admin Login',
    subtitle: 'Full system management & configuration',
    idLabel: 'Admin ID',
    placeholder: 'Enter your Admin ID',
    icon: Shield,
    fieldIcon: UserCircle,
    iconWrap: 'bg-purple-50 border-purple-100',
    iconColor: 'text-purple-600',
    linkColor: 'text-purple-600',
    buttonClass: 'bg-purple-600 hover:bg-purple-500',
    focusClass: 'focus:border-purple-500 focus:ring-purple-500/10',
  },
  SUPER_ADMIN: {
    label: 'Super Admin',
    title: 'Super Admin Login',
    subtitle: 'Platform administration and oversight',
    idLabel: 'Super Admin ID',
    placeholder: 'Enter your Super Admin ID',
    icon: Shield,
    fieldIcon: UserCircle,
    iconWrap: 'bg-purple-50 border-purple-100',
    iconColor: 'text-purple-600',
    linkColor: 'text-purple-600',
    buttonClass: 'bg-purple-600 hover:bg-purple-500',
    focusClass: 'focus:border-purple-500 focus:ring-purple-500/10',
  },
  IT_SUPPORT: {
    label: 'IT Support',
    title: 'IT Support Login',
    subtitle: 'Support tickets and account assistance',
    idLabel: 'Staff ID',
    placeholder: 'Enter your Staff ID',
    icon: BadgeCheck,
    fieldIcon: UserCircle,
    iconWrap: 'bg-rose-50 border-rose-100',
    iconColor: 'text-rose-600',
    linkColor: 'text-rose-600',
    buttonClass: 'bg-rose-600 hover:bg-rose-500',
    focusClass: 'focus:border-rose-500 focus:ring-rose-500/10',
  },
}

const loginSchema = z.object({
  school_id: z.string().min(1, 'School ID is required'),
  password: z.string().min(1, 'Password is required'),
})

type LoginInput = z.infer<typeof loginSchema>
type RoleKey = keyof typeof ROLE_CONFIG

const MOCK_ACCOUNTS: Record<
  string,
  { school_id: string; password: string; name: string; portal: string }
> = {
  STUDENT: {
    school_id: 'STD001',
    password: 'Pass123',
    name: 'Adnan Khan',
    portal: '/student/dashboard',
  },
  TEACHER: {
    school_id: 'TCH001',
    password: 'Pass123',
    name: 'Dr. Sarah Johnson',
    portal: '/teacher/dashboard',
  },
}

function base64UrlEncode(value: Record<string, unknown>) {
  return btoa(JSON.stringify(value))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
}

function createMockToken(role: string, schoolId: string) {
  const now = Math.floor(Date.now() / 1000)
  return [
    base64UrlEncode({ alg: 'none', typ: 'JWT' }),
    base64UrlEncode({
      user_id: schoolId.toLowerCase(),
      school_id: schoolId,
      active_role: role,
      must_change_password: false,
      iat: now,
      exp: now + 60 * 60 * 8,
    }),
    'mock-signature',
  ].join('.')
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginPageContent />
    </Suspense>
  )
}

function LoginPageContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const role = searchParams.get('role') ?? ''
  const config = ROLE_CONFIG[role as RoleKey]
  const { mutate: loginMutate, isPending } = useLogin()
  const setUser = useAuthStore((s) => s.setUser)
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    if (!role || !config) router.replace('/')
  }, [config, role, router])

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { school_id: '', password: '' },
  })

  const onSubmit = (values: LoginInput) => {
    const mockAccount = MOCK_ACCOUNTS[role]

    if (mockAccount) {
      if (
        values.school_id === mockAccount.school_id &&
        values.password === mockAccount.password
      ) {
        const token = createMockToken(role, values.school_id)
        Cookies.set('access_token', token, { sameSite: 'strict', expires: 1 })
        Cookies.set('refresh_token', `mock-refresh-${role}`, {
          sameSite: 'strict',
          expires: 1,
        })
        Cookies.set('active_role', role, { sameSite: 'strict', expires: 1 })
        setUser({
          id: values.school_id.toLowerCase(),
          school_id: values.school_id,
          full_name: mockAccount.name,
          roles: [role],
          active_role: role,
          must_change_password: false,
        })
        router.push(mockAccount.portal)
        return
      }

      form.setError('password', {
        message: `Use ${mockAccount.school_id} / ${mockAccount.password}`,
      })
      return
    }

    loginMutate({ ...values, role })
  }

  if (!config) return null

  const RoleIcon = config.icon
  const IdIcon = config.fieldIcon

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
            <div className="hidden h-5 w-px bg-slate-200 sm:block" />
            <span className="hidden text-xs text-slate-400 md:block">
              Academic Year 2024-25
            </span>
          </nav>
        </div>
      </header>

      <section className="flex flex-1 items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <Link
            href="/"
            className="fade-in-up mb-8 inline-flex items-center gap-1.5 text-xs text-slate-400 transition-colors hover:text-slate-600"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to portal
          </Link>

          <div className="fade-in-up mb-8 flex items-center gap-4">
            <div
              className={`flex h-14 w-14 items-center justify-center rounded-lg border ${config.iconWrap}`}
            >
              <RoleIcon className={`h-7 w-7 ${config.iconColor}`} />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-slate-900">
                {config.title}
              </h1>
              <p className="mt-0.5 text-sm text-slate-400">{config.subtitle}</p>
            </div>
          </div>

          <div className="fade-in-up-d1 rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                <FormField
                  control={form.control}
                  name="school_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="mb-2 block text-xs font-medium text-slate-600">
                        {config.idLabel}
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <IdIcon className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                          <input
                            className={`input-field pl-10 focus:ring-4 ${config.focusClass}`}
                            placeholder={config.placeholder}
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="mb-2 block text-xs font-medium text-slate-600">
                        Password
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                          <input
                            type={showPassword ? 'text' : 'password'}
                            className={`input-field pl-10 pr-10 focus:ring-4 ${config.focusClass}`}
                            placeholder="Enter your password"
                            {...field}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword((visible) => !visible)}
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-slate-600"
                            aria-label={
                              showPassword ? 'Hide password' : 'Show password'
                            }
                          >
                            {showPassword ? (
                              <Eye className="h-4 w-4" />
                            ) : (
                              <EyeOff className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex items-center justify-between pt-1">
                  <label className="flex cursor-pointer items-center gap-2">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="text-xs text-slate-500">Remember me</span>
                  </label>
                  <Link
                    href="/reset-password"
                    className={`text-xs font-medium hover:underline ${config.linkColor}`}
                  >
                    Forgot password?
                  </Link>
                </div>

                <button
                  type="submit"
                  className={`btn-primary mt-2 ${config.buttonClass}`}
                  disabled={isPending}
                >
                  {isPending ? (
                    <span className="inline-flex items-center justify-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Signing in
                    </span>
                  ) : (
                    'Sign In'
                  )}
                </button>
              </form>
            </Form>
          </div>

          <div className="fade-in-up-d2 mt-6 flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
            <p className="text-xs leading-relaxed text-amber-700">
              Your login credentials have been sent to your registered email and
              phone number. If you haven&apos;t received them, contact the school
              office.
            </p>
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
