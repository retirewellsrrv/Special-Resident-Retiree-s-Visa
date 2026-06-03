// // src/components/auth/confirm-email-page.tsx
// 'use client'

// import { useState, useEffect, useCallback } from 'react'
// import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
// import { Button } from '@/components/ui/button'
// import { Separator } from '@/components/ui/separator'
// import { Mail, RefreshCw, RotateCcw } from 'lucide-react'
// import Link from 'next/link'
// import { resendConfirmationAction } from '@/actions/auth'
// import { toast } from 'sonner'

// const COOLDOWN_SECONDS = 60

// const steps = [
//   { label: 'Open your inbox', desc: 'and look for an email from Retire Well SRRV.' },
//   { label: 'Click "Confirm email"', desc: 'in the message. The link expires shortly and can only be used once.' },
//   { label: "You'll be redirected", desc: 'to your dashboard automatically once confirmed.' },
// ]

// interface Props {
//   email: string  // pass email from register action
// }

// export default function ConfirmEmailForm({ email }: Props) {
//   const [cooldown, setCooldown] = useState(0)
//   const [sending, setSending] = useState(false)

//   // countdown tick
//   useEffect(() => {
//     if (cooldown <= 0) return
//     const id = setTimeout(() => setCooldown((c) => c - 1), 1000)
//     return () => clearTimeout(id)
//   }, [cooldown])

//   const handleResend = useCallback(async () => {
//     if (sending || cooldown > 0) return
//     setSending(true)
//     const result = await resendConfirmationAction(email)
//     setSending(false)

//     if (result.success) {
//       toast.success('Confirmation email sent! Check your inbox.')
//       setCooldown(COOLDOWN_SECONDS)
//     } else {
//       toast.error(result.error)
//     }
//   }, [email, sending, cooldown])

//   const isDisabled = sending || cooldown > 0

//   return (
//     <div className="flex items-center justify-center min-h-screen bg-muted px-4">
//       <Card className="w-full max-w-[460px] overflow-hidden shadow-ht-card">
//         <div className="h-1 bg-brand-primary-500" />

//         <CardHeader className="pb-4">
//           <div className="w-13 h-13 rounded-full bg-brand-primary-50 flex items-center justify-center mb-5">
//             <Mail className="w-6 h-6 text-brand-primary-700" strokeWidth={1.5} />
//           </div>
//           <CardTitle className="font-display text-xl">Check your email</CardTitle>
//           <CardDescription>
//             We sent a confirmation link to your inbox. Follow the steps to activate your account.
//           </CardDescription>
//         </CardHeader>

//         <CardContent className="flex flex-col gap-3 pb-4">
//           {steps.map((step, i) => (
//             <div key={i} className="flex items-start gap-3">
//               <div className="w-[22px] h-[22px] rounded-full bg-brand-primary-500 text-white text-xs font-medium flex items-center justify-center flex-shrink-0 mt-0.5">
//                 {i + 1}
//               </div>
//               <p className="text-sm text-muted-foreground leading-relaxed">
//                 <span className="font-medium text-foreground">{step.label}</span>{' '}
//                 {step.desc}
//               </p>
//             </div>
//           ))}

//           <Separator className="my-1" />

//           <div className="flex items-start gap-3 rounded-md border bg-muted px-3 py-3">
//             <svg className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
//             </svg>
//             <p className="text-xs text-muted-foreground leading-relaxed">
//               Can't find it? Check your{' '}
//               <span className="font-medium text-foreground">spam or junk folder</span>.
//               The sender is{' '}
//               <span className="font-medium text-foreground">no-reply@mail.app.supabase.io</span>.
//             </p>
//           </div>

//           {/* Resend */}
//           <div className="flex flex-col items-center gap-2 pt-1">
//             <Button
//               variant="outline"
//               className="w-full"
//               onClick={handleResend}
//               disabled={isDisabled}
//             >
//               {sending
//                 ? <><RotateCcw className="w-4 h-4 mr-2 animate-spin" /> Sending...</>
//                 : <><RefreshCw className="w-4 h-4 mr-2" /> Resend confirmation email</>
//               }
//             </Button>

//             {cooldown > 0 && (
//               <p className="text-xs text-muted-foreground">
//                 You can resend in{' '}
//                 <span className="font-medium tabular-nums">{cooldown}s</span>
//               </p>
//             )}
//           </div>
//         </CardContent>

//         <CardFooter className="flex items-center justify-between border-t py-4">
//           <span className="font-display text-sm font-semibold">
//             Retire Well <span className="text-brand-primary-500">SRRV</span>
//           </span>
//           <Link href="/register" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors">
//             ← Back to register
//           </Link>
//         </CardFooter>
//       </Card>
//     </div>
//   )
// }