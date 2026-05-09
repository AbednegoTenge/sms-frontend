'use client'

import { useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Link from 'next/link'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { useLogin } from '@/lib/hooks/useAuth'

const ROLE_LABELS: Record<string, string> = {
  STUDENT:    'Student',
  TEACHER:    'Teacher',
  ADMIN:      'Admin',
  SUPER_ADMIN:'Super Admin',
  PRINCIPAL:  'Principal',
  IT_SUPPORT: 'IT Support',
}

const loginSchema = z.object({
  school_id: z.string().min(1, 'School ID is required'),
  password:  z.string().min(1, 'Password is required'),
})

type LoginInput = z.infer<typeof loginSchema>

export default function LoginPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const role = searchParams.get('role') ?? ''
  const { mutate: loginMutate, isPending } = useLogin()

  useEffect(() => {
    if (!role) router.replace('/')
  }, [role, router])

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { school_id: '', password: '' },
  })

  const onSubmit = (values: LoginInput) => {
    loginMutate({ ...values, role })
  }

  const roleLabel = ROLE_LABELS[role] ?? role

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <Link
          href="/"
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Change role
        </Link>

        <Card>
          <CardHeader>
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-sm font-medium mb-2 w-fit">
              Signing in as {roleLabel}
            </div>
            <CardTitle className="text-2xl">Welcome back</CardTitle>
            <CardDescription>Enter your school ID and password to continue.</CardDescription>
          </CardHeader>

          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="school_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>School ID</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. STD001" {...field} />
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
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="••••••••" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full" disabled={isPending}>
                  {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Sign in
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
