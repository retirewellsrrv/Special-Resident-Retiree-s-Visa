'use client'

import { cn } from '@/lib/utils'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { registerSchema, type RegisterInput } from '@/schemas/auth'
import { registerAction, oauthAction } from '@/actions/auth'
import { useState } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'
import { User, Flag, MapPin, Mail, Lock, KeyRound } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox"
import { Controller } from "react-hook-form"
import PhoneInput from 'react-phone-number-input'
import 'react-phone-number-input/style.css'
import { DatePicker } from '../ui/datepicker'


export function SignupForm({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  const [serverError, setServerError] = useState<string | null>(null)
  const [oauthPending, setOauthPending] = useState(false)

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: '',
      surname: '',
      email: '',
      birthday: '',
      nationality: '',
      address: '',
      phoneNumber: '',
      password: '',
      confirmPassword: '',
    },
  })

  async function onSubmit(data: RegisterInput) {
    console.log('errors', errors)
    console.log('Clicked: ', data)
    try {
      setServerError(null)

      const result = await registerAction(data)

      if (!result.success) {
        toast.error(`Something went wrong: ${result.error}`)
        setServerError(result.error)
        return
      }

      // success logic here
      toast.success("Check your email to verify account")
    } catch (error) {
      console.error(error)
      setServerError('Something went wrong.')
    }
  }

  async function handleGoogleOAuth() {
    setOauthPending(true)
    const result = await oauthAction('google')
    if (!result.success) {
      setServerError(result.error)
      setOauthPending(false)
    }
    // On success, Supabase redirects — no further action needed
  }

  const SEX_OPTIONS = ['male', 'female']

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card className="overflow-hidden p-0 bg-white w-full max-w-5xl">
        <CardContent className="grid p-0 md:grid-cols-2">

          {/* ── Left panel (branding) ── */}
          <div className="relative hidden bg-brand-primary-800 md:flex flex-col justify-between px-8 py-10 gap-10">
            {/* Logo */}
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-brand-goldAccent-1 flex items-center justify-center font-semibold text-base">
                S
              </div>
              <span className="text-brand-tertiary-600 text-[15px] font-medium tracking-wide">
                SRRV Portal
              </span>
            </div>

            {/* Tagline */}
            <div>
              <h1 className="text-brand-goldAccent-1 text-xl font-medium leading-snug mb-2">
                Your path to Philippine residency, simplified.
              </h1>
              <p className="text-brand-tertiary-600 text-sm leading-relaxed">
                Create an account to begin your Special Resident Retiree&apos;s Visa application.
              </p>
            </div>

            {/* Steps */}
            <ol className="flex flex-col gap-4">
              {[
                ['Register & verify', 'Create your account and confirm your email'],
                ['Submit application', 'Complete the multi-step SRRV application form'],
                ['Upload documents', 'Attach required documents for review'],
                ['Track your status', 'Follow your application through approval'],
              ].map(([title, desc], i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="mt-0.5 w-6 h-6 shrink-0 rounded-full border border-brand-goldAccent-1/40 bg-brand-goldAccent/10 flex items-center justify-center text-[11px] font-medium text-brand-goldAccent-1">
                    {i + 1}
                  </span>
                  <div>
                    <p className="text-brand-goldAccent-2 text-[13px] font-medium">{title}</p>
                    <p className="text-brand-goldAccent-1 text-[13px] leading-relaxed">{desc}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          {/* ── Right panel (form) ── */}
          <form
            onSubmit={handleSubmit(onSubmit)}
            noValidate
            className="p-6 md:p-8 w-full min-w-0 md:max-h-[90vh] overflow-y-auto"
          >
            <FieldGroup>
              {/* Header */}
              <div className="flex flex-col items-center gap-2 text-center">
                <h2 className="text-2xl font-bold">Create your account</h2>
                <p className="text-sm text-balance text-muted-foreground">
                  Welcome to Retire Well SRRV
                </p>
                <p className="text-sm text-muted-foreground">
                  Fill up the information below to create your account
                </p>
              </div>

              {/* Google OAuth */}
              <Field>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={handleGoogleOAuth}
                  disabled={oauthPending}
                >
                  <GoogleIcon />
                  {oauthPending ? 'Redirecting…' : 'Continue with Google'}
                </Button>
              </Field>

              {/* Divider //! can be improve, create a component for this */}
              <div className="flex items-center m-4">
                <div className="flex-1 border-t border-brand-primary-500"></div>
                <span className="px-4 text-sm text-brand-secondary-800">or</span>
                <div className="flex-1 border-t border-brand-primary-500"></div>
              </div>

              {/* First name + Surname */}
              <Field className="grid grid-cols-2 gap-4">
                <Field>
                  <FieldLabel htmlFor="firstName">First name</FieldLabel>
                  <div className="group relative">
                    <User className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-brand-primary-700" />
                    <Input
                      id="firstName"
                      type="text"
                      placeholder="John"
                      autoComplete="given-name"
                      className="pl-9"
                      {...register('firstName')}
                    />
                  </div>
                  {errors.firstName && (
                    <FieldDescription className="text-brand-danger-800">
                      {errors.firstName.message}
                    </FieldDescription>
                  )}
                </Field>
                <Field>
                  <FieldLabel htmlFor="surname">Surname</FieldLabel>
                  <div className="group relative">
                    <User className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-brand-primary-700" />
                    <Input
                      id="surname"
                      type="text"
                      placeholder="Smith"
                      autoComplete="family-name"
                      className="pl-9"
                      {...register('surname')}
                    />
                  </div>
                  {errors.surname && (
                    <FieldDescription className="text-brand-danger-800">
                      {errors.surname.message}
                    </FieldDescription>
                  )}
                </Field>
              </Field>

              {/* Birthday + Sex //! birthday not using shadcd component due to compatibility issue with tailwind version*/}
              <Field className="grid grid-cols-2 gap-4">
                <Field>
                  <FieldLabel htmlFor="birthday">Birthday</FieldLabel>
                  <Controller
                    name="birthday"
                    control={control}
                    render={({ field }) => (
                      <DatePicker
                        value={field.value ? new Date(field.value) : null}
                        onChange={(date) => field.onChange(date ? date.toISOString() : '')}
                        placeholder="Dec 25, 2000"
                        maxDate={new Date()}
                      />
                    )}
                  />
                  {errors.birthday && (
                    <FieldDescription className="text-brand-danger-800">
                      {errors.birthday.message}
                    </FieldDescription>
                  )}
                </Field>
                <Field>
                  <FieldLabel htmlFor="sex">Sex</FieldLabel>
                  <Controller
                    name="sex"
                    control={control}
                    render={({ field }) => (
                      <Combobox
                        items={SEX_OPTIONS}
                        value={field.value ?? ''}
                        onValueChange={field.onChange}
                      >
                        <ComboboxInput id="sex" placeholder="Select" />
                        <ComboboxContent>
                          <ComboboxEmpty>No options found.</ComboboxEmpty>
                          <ComboboxList>
                            {(item) => (
                              <ComboboxItem key={item} value={item}>
                                {item}
                              </ComboboxItem>
                            )}
                          </ComboboxList>
                        </ComboboxContent>
                      </Combobox>
                    )}
                  />
                  {errors.sex && (
                    <FieldDescription className="text-brand-danger-800">
                      {errors.sex.message}
                    </FieldDescription>
                  )}
                </Field>
              </Field>

              {/* Nationality */}
              <Field className="grid grid-cols-2 gap-4">
                <Field>
                  <FieldLabel htmlFor="nationality">Nationality</FieldLabel>
                  <div className="group relative">
                    <Flag className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-brand-primary-700" />
                    <Input
                      id="nationality"
                      type="text"
                      placeholder="Filipino"
                      autoComplete="nationality"
                      className="pl-9"
                      {...register('nationality')}
                    />
                  </div>
                  {errors.nationality && (
                    <FieldDescription className="text-brand-danger-800">
                      {errors.nationality.message}
                    </FieldDescription>
                  )}
                </Field>
              </Field>

              {/* Address */}
              <Field>
                <FieldLabel htmlFor="address">Address</FieldLabel>
                <div className="group relative">
                  <MapPin className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-brand-primary-700" />
                  <Input
                    id="address"
                    type="text"
                    placeholder="Complete address"
                    autoComplete="street-address"
                    className="pl-9"
                    {...register('address')}
                  />
                </div>
                {errors.address && (
                  <FieldDescription className="text-brand-danger-800">
                    {errors.address.message}
                  </FieldDescription>
                )}
              </Field>

              {/* Email — full width, has description */}
              <Field>
                <FieldLabel htmlFor="email">Email address</FieldLabel>
                <div className="group relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-brand-primary-700" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="john@example.com"
                    autoComplete="email"
                    className="pl-9"
                    {...register('email')}
                  />
                </div>
                <FieldDescription className="text-xs">
                  We&apos;ll use this to contact you. We will not share your email with anyone else.
                </FieldDescription>
                {errors.email && (
                  <FieldDescription className="text-brand-danger-800">
                    {errors.email.message}
                  </FieldDescription>
                )}
              </Field>

              {/* Phone — full width */}
              <Field>
                <FieldLabel htmlFor="phoneNumber">Phone</FieldLabel>
                <Controller
                  name="phoneNumber"
                  control={control}
                  render={({ field }) => (
                    <PhoneInput
                      id="phoneNumber"
                      international
                      defaultCountry="PH"
                      value={field.value ?? ''}
                      onChange={field.onChange}
                      inputComponent={Input}
                    />
                  )}
                />
                {errors.phoneNumber && (
                  <FieldDescription className="text-brand-danger-800">
                    {errors.phoneNumber.message}
                  </FieldDescription>
                )}
              </Field>

              {/* Password + Confirm — already paired, just clean up the outer Field */}
              <Field className="grid grid-cols-2 gap-4">
                <Field>
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  <div className="group relative">
                    <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-brand-primary-700" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="Min. 8 characters"
                      autoComplete="new-password"
                      className="pl-9"
                      {...register('password')}
                    />
                  </div>
                  {errors.password && (
                    <FieldDescription className="text-brand-danger-800">
                      {errors.password.message}
                    </FieldDescription>
                  )}
                </Field>
                <Field>
                  <FieldLabel htmlFor="confirm-password">Confirm password</FieldLabel>
                  <div className="group relative">
                    <KeyRound className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-brand-primary-700" />
                    <Input
                      id="confirm-password"
                      type="password"
                      placeholder="Repeat password"
                      autoComplete="new-password"
                      className="pl-9"
                      {...register('confirmPassword')}
                    />
                  </div>
                  {errors.confirmPassword && (
                    <FieldDescription className="text-brand-danger-800">
                      {errors.confirmPassword.message}
                    </FieldDescription>
                  )}
                </Field>
              </Field>

              {/* Server error */}
              {serverError && (
                <Field>
                  <FieldDescription className="text-destructive bg-destructive/10 rounded-lg px-3 py-2 break-words">
                    {serverError}
                  </FieldDescription>
                </Field>
              )}

              {/* Submit */}
              <Field>
                <Button
                  type="submit"
                  className="w-full bg-brand-primary-700 hover:bg-brand-primary-500 text-brand-tertiary-50"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Creating account…' : 'Create account'}
                </Button>
              </Field>

              {/* Sign in link */}
              <FieldDescription className="text-center">
                Already have an account?{' '}
                <Link href="/login" className="font-medium text-brand-secondary-700 hover:underline">
                  Sign in
                </Link>
              </FieldDescription>
            </FieldGroup>
          </form>

        </CardContent>
      </Card>

      {/* Terms */}
      <FieldDescription className="px-6 text-center">
        {/* By clicking continue, you agree to our{' '} //! Commented this for now
        <Link href="/terms" className="text-brand-secondary-700 hover:underline">Terms of Service</Link>{' '}
        and{' '}
        <Link href="/privacy" className="text-brand-secondary-700 hover:underline">Privacy Policy</Link>. */}
      </FieldDescription>
    </div>
  )
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  )
}