'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { forgotPasswordSchema, type ForgotPasswordInput } from '@/schemas/auth'
import { handleResetRequest } from '@/actions/auth'
import { toast } from 'sonner'
import Link from 'next/link'
import { Mail, RefreshCw, ArrowLeft, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'

const COOLDOWN_SECONDS = 60

const steps = [
  { label: 'Open your inbox', desc: 'and look for a password reset email from Retire Well SRRV.' },
  { label: 'Click "Reset password"', desc: 'in the message. The link expires shortly and can only be used once.' },
  { label: 'Create a new password', desc: 'and sign in with your updated credentials.' },
]

export default function ForgotPasswordForm() {
  const [sent, setSent] = useState(false)
  const [sentEmail, setSentEmail] = useState('')
  const [cooldown, setCooldown] = useState(0)
  const [sending, setSending] = useState(false)

  useEffect(() => {
    if (cooldown <= 0) return
    const id = setTimeout(() => setCooldown((c) => c - 1), 1000)
    return () => clearTimeout(id)
  }, [cooldown])

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
  })

  async function onSubmit(data: ForgotPasswordInput) {
    setSending(true)
    const result = await handleResetRequest(data.email)
    setSending(false)

    if (result.success) {
      setSentEmail(data.email)
      setSent(true)
      setCooldown(COOLDOWN_SECONDS)
      toast.success('Password reset link sent!')
    } else {
      toast.error(result.error)
    }
  }

  async function handleResend() {
    if (sending || cooldown > 0 || !sentEmail) return
    setSending(true)
    const result = await handleResetRequest(sentEmail)
    setSending(false)

    if (result.success) {
      toast.success('Reset link resent! Check your inbox.')
      setCooldown(COOLDOWN_SECONDS)
    } else {
      toast.error(result.error)
    }
  }

  if (sent) {
    const isDisabled = sending || cooldown > 0

    return (
      <div className="flex w-full max-w-[480px] flex-col gap-6">
        <Card className="w-full overflow-hidden shadow-2xl bg-white backdrop-blur-sm">
          <CardContent className="p-8 md:p-12">
            <div className="mb-8 flex flex-col items-center">
              <div className="mb-5 flex size-14 items-center justify-center rounded-full bg-brand-primary-50">
                <Mail className="size-7 text-brand-primary-700" strokeWidth={1.5} />
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-brand-primary-700">
                Check your email
              </h1>
              <p className="mt-2 text-center text-sm text-muted-foreground">
                We sent a password reset link to{' '}
                <span className="font-medium text-foreground">{sentEmail}</span>.
                Follow the steps to reset your password.
              </p>
            </div>

            <div className="flex flex-col gap-4">
              {steps.map((step, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="mt-0.5 flex size-[22px] shrink-0 items-center justify-center rounded-full bg-brand-primary-500 text-xs font-medium text-white">
                    {i + 1}
                  </div>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    <span className="font-medium text-foreground">{step.label}</span>{' '}
                    {step.desc}
                  </p>
                </div>
              ))}

              <Separator className="my-2" />

              <div className="flex items-start gap-3 rounded-md border bg-muted px-4 py-3">
                <AlertCircle className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                <p className="text-xs leading-relaxed text-muted-foreground">
                  Can&apos;t find it? Check your{' '}
                  <span className="font-medium text-foreground">spam or junk folder</span>.
                  The sender is{' '}
                  <span className="font-medium text-foreground">admin@retirewellsrrv.com</span>.
                </p>
              </div>

              <Button
                variant="outline"
                className="mt-2 w-full"
                onClick={handleResend}
                disabled={isDisabled}
              >
                {sending
                  ? <><RefreshCw className="mr-2 size-4 animate-spin" /> Sending...</>
                  : <><RefreshCw className="mr-2 size-4" /> Resend reset link</>
                }
              </Button>

              {cooldown > 0 && (
                <p className="text-center text-xs text-muted-foreground">
                  You can resend in{' '}
                  <span className="font-medium tabular-nums">{cooldown}s</span>
                </p>
              )}
            </div>
          </CardContent>
          <div className="flex items-center justify-center">
            <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              ← Back to sign in
            </Link>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex w-full max-w-[480px] flex-col gap-6">
      <Card className="w-full overflow-hidden shadow-2xl bg-white backdrop-blur-sm">
        <CardContent className="p-8 md:p-12">
          <div className="mb-8 flex flex-col items-center">
            <div className="mb-5 flex size-14 items-center justify-center rounded-full bg-brand-primary-50">
              <Mail className="size-7 text-brand-primary-700" strokeWidth={1.5} />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-brand-primary-700">
              Forgot password?
            </h1>
            <p className="mt-2 text-center text-sm text-muted-foreground">
              Enter your email address and we&apos;ll send you a link to reset your password.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="email">Email address</FieldLabel>
                <div className="group relative">
                  <Mail className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-brand-primary-700" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="e.g. retiree@example.com"
                    autoComplete="email"
                    className="h-12 pl-11"
                    {...register('email')}
                  />
                </div>
                {errors.email && (
                  <FieldDescription className="text-brand-danger-800">
                    {errors.email.message}
                  </FieldDescription>
                )}
              </Field>

              <Field>
                <Button
                  type="submit"
                  className="h-12 w-full bg-brand-primary-700 text-brand-tertiary-50 hover:bg-brand-primary-500"
                  disabled={isSubmitting || sending}
                >
                  {isSubmitting || sending ? 'Sending reset link…' : 'Send reset link'}
                </Button>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
        <div className="flex items-center justify-center">
          <Link href="/login" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="size-4" />
            Back to sign in
          </Link>
        </div>
      </Card>
    </div>
  )
}
