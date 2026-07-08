'use client'

import { useState } from 'react'
import { resetPasswordSchema } from '@/schemas/auth'
import { resetPasswordAction, type ActionResult } from '@/actions/auth'
import { toast } from 'sonner'
import { Lock, Eye, EyeOff, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'

export default function ChangePasswordForm() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isPending, setPending] = useState(false)

  async function handleSubmit() {
    const parsed = resetPasswordSchema.safeParse({ password, confirmPassword })
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {}
      for (const issue of parsed.error.issues) {
        fieldErrors[issue.path[0] as string] = issue.message
      }
      setErrors(fieldErrors)
      return
    }
    setErrors({})
    setPending(true)
    try {
      const result = await resetPasswordAction(parsed.data.password) as ActionResult | undefined
      if (result && !result.success) {
        toast.error(result.error)
      }
    } catch {
      // redirect handled by Next.js — component will unmount
      return
    }
    setPending(false)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <div className="flex w-full max-w-[480px] flex-col gap-6">
      <Card className="w-full overflow-hidden shadow-2xl bg-white backdrop-blur-sm">
        <CardContent className="p-8 md:p-12">
          <div className="mb-8 flex flex-col items-center">
            <div className="mb-5 flex size-14 items-center justify-center rounded-full bg-brand-primary-50">
              <Lock className="size-7 text-brand-primary-700" strokeWidth={1.5} />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-brand-primary-700">
              Reset password
            </h1>
            <p className="mt-2 text-center text-sm text-muted-foreground">
              Enter your new password below.
            </p>
          </div>

          <div>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="password">New password</FieldLabel>
                <div className="group relative">
                  <Lock className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-brand-primary-700" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Min. 8 characters"
                    autoComplete="new-password"
                    className="h-12 pl-11 pr-11"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={handleKeyDown}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((p) => !p)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                  </button>
                </div>
                {errors.password && (
                  <FieldDescription className="text-brand-danger-800">
                    {errors.password}
                  </FieldDescription>
                )}
              </Field>

              <Field>
                <FieldLabel htmlFor="confirmPassword">Confirm new password</FieldLabel>
                <div className="group relative">
                  <Lock className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-brand-primary-700" />
                  <Input
                    id="confirmPassword"
                    type={showConfirm ? 'text' : 'password'}
                    placeholder="Re-enter your new password"
                    autoComplete="new-password"
                    className="h-12 pl-11 pr-11"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    onKeyDown={handleKeyDown}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((p) => !p)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    tabIndex={-1}
                  >
                    {showConfirm ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <FieldDescription className="text-brand-danger-800">
                    {errors.confirmPassword}
                  </FieldDescription>
                )}
              </Field>

              <Field>
                <Button
                  className="h-12 w-full bg-brand-primary-700 text-brand-tertiary-50 hover:bg-brand-primary-500"
                  disabled={isPending}
                  onClick={handleSubmit}
                >
                  {isPending ? (
                    <><Loader2 className="mr-2 size-4 animate-spin" /> Resetting…</>
                  ) : (
                    'Reset password'
                  )}
                </Button>
              </Field>
            </FieldGroup>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
