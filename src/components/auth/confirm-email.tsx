'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Mail, RefreshCw, RotateCcw } from 'lucide-react'
import Link from 'next/link'
import { resendConfirmationAction } from '@/actions/auth'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

const COOLDOWN_SECONDS = 60

const steps = [
  { label: 'Open your inbox', desc: 'and look for an email from Retire Well SRRV.' },
  { label: 'Click "Confirm email"', desc: 'in the message. The link expires shortly and can only be used once.' },
  { label: "You'll be redirected", desc: 'to your dashboard automatically once confirmed.' },
]

interface Props {
  email: string
}

export default function ConfirmEmailForm({ email }: Props) {
  const router = useRouter()
  const [cooldown, setCooldown] = useState(0)
  const [sending, setSending] = useState(false)
  const redirecting = useRef(false)

  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    )

    const interval = setInterval(async () => {
      if (redirecting.current) return
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        redirecting.current = true
        clearInterval(interval)
        router.push('/applicant/dashboard')
      }
    }, 3000)

    return () => clearInterval(interval)
  }, [router])

  useEffect(() => {
    if (cooldown <= 0) return
    const id = setTimeout(() => setCooldown((c) => c - 1), 1000)
    return () => clearTimeout(id)
  }, [cooldown])

  const handleResend = useCallback(async () => {
    if (sending || cooldown > 0) return
    setSending(true)
    const result = await resendConfirmationAction(email)
    setSending(false)

    if (result.success) {
      toast.success('Confirmation email sent! Check your inbox.')
      setCooldown(COOLDOWN_SECONDS)
    } else {
      toast.error(result.error)
    }
  }, [email, sending, cooldown])

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
              We sent a confirmation link to your inbox. Follow the steps to activate your account.
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
              <svg className="mt-0.5 size-4 shrink-0 text-muted-foreground" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
              </svg>
              <p className="text-xs leading-relaxed text-muted-foreground">
                Can't find it? Check your{' '}
                <span className="font-medium text-foreground">spam or junk folder</span>.
                The sender is{' '}
                <span className="font-medium text-foreground">admin@retirwellsrrv.com</span>.
              </p>
            </div>

            <Button
              variant="outline"
              className="mt-2 w-full"
              onClick={handleResend}
              disabled={isDisabled}
            >
              {sending
                ? <><RotateCcw className="mr-2 size-4 animate-spin" /> Sending...</>
                : <><RefreshCw className="mr-2 size-4" /> Resend confirmation email</>
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
      </Card>

      <div className="flex items-center justify-center">
        <Link href="/register" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
          ← Back to register
        </Link>
      </div>
    </div>
  )
}
