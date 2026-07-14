export const authCookieOptions = () => ({
  sameSite: 'strict' as const,
  path: '/',
  ...(typeof window !== 'undefined' && window.location.protocol === 'https:'
    ? { secure: true }
    : {}),
})
