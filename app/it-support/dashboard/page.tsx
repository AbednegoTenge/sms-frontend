'use client'

import { useRouter } from 'next/navigation'
import Cookies from 'js-cookie'
import { BadgeCheck, KeyRound, LifeBuoy, LogOut, Ticket } from 'lucide-react'

const features = [
  {
    title: 'Support Tickets',
    description: 'View all tickets, assign ownership, and update status.',
    endpoint: 'GET/PATCH /api/v1/support-tickets/',
    icon: Ticket,
  },
  {
    title: 'Password Reset',
    description: 'Reset a user password and force first-login password change.',
    endpoint: 'POST /api/v1/support/reset-password/',
    icon: KeyRound,
  },
]

export default function ItSupportDashboardPage() {
  const router = useRouter()

  const logout = () => {
    Cookies.remove('access_token')
    Cookies.remove('refresh_token')
    Cookies.remove('active_role')
    router.push('/')
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6 text-slate-900">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-rose-600 text-white">
              <BadgeCheck className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold">IT Support Dashboard</h1>
              <p className="text-sm text-slate-400">Support tickets and account recovery tools</p>
            </div>
          </div>
          <button onClick={logout} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600 hover:bg-slate-100">
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </header>

        <section className="grid gap-5 md:grid-cols-2">
          {features.map(({ title, description, endpoint, icon: Icon }) => (
            <div key={title} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
                <Icon className="h-6 w-6" />
              </div>
              <h2 className="text-sm font-semibold">{title}</h2>
              <p className="mt-1 text-sm text-slate-500">{description}</p>
              <p className="mt-4 rounded-lg bg-slate-50 px-3 py-2 font-mono text-xs text-slate-500">{endpoint}</p>
            </div>
          ))}
        </section>

        <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          <div className="flex gap-2">
            <LifeBuoy className="mt-0.5 h-4 w-4 shrink-0" />
            <p>These frontend surfaces are ready for the support APIs in <span className="font-mono">lib/api/school.ts</span>.</p>
          </div>
        </div>
      </div>
    </main>
  )
}
