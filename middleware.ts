import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { decodeJWT } from '@/lib/utils/jwt'

const PORTAL_ROLES: Record<string, string[]> = {
  '/admin':      ['ADMIN', 'SUPER_ADMIN'],
  '/student':    ['STUDENT'],
  '/teacher':    ['TEACHER'],
  '/principal':  ['PRINCIPAL'],
  '/it-support': ['IT_SUPPORT'],
}

const PUBLIC_ROUTES = ['/', '/login', '/reset-password']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get('access_token')?.value

  if (PUBLIC_ROUTES.some((r) => pathname === r || pathname.startsWith(r + '?'))) {
    return NextResponse.next()
  }

  if (!token) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  const payload = decodeJWT(token)
  if (!payload) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  if (payload.must_change_password && pathname !== '/reset-password') {
    return NextResponse.redirect(new URL('/reset-password', request.url))
  }

  const activeRole: string = payload.active_role || request.cookies.get('active_role')?.value || ''

  for (const [route, allowedRoles] of Object.entries(PORTAL_ROLES)) {
    if (pathname.startsWith(route)) {
      if (!allowedRoles.includes(activeRole)) {
        return NextResponse.redirect(new URL('/', request.url))
      }
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
