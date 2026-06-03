import type { Metadata } from 'next'
import localFont from 'next/font/local'
import './globals.css'
import { Geist } from 'next/font/google'
import { cn } from '@/lib/utils'
import { Toaster } from '@/components/ui/sonner'
import { Navbar } from '@/components/layout/navbar'
import { getSession } from '@/actions/auth'

const geist = Geist({ subsets: ['latin'], variable: '--font-sans' })

const geistSans = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-geist-sans',
  weight: '100 900',
})
const geistMono = localFont({
  src: './fonts/GeistMonoVF.woff',
  variable: '--font-geist-mono',
  weight: '100 900',
})

export const metadata: Metadata = {
  title: "Special Resident Retiree's Visa",
  description: 'Your trusted partner for visa and immigration services',
}

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const user = await getSession()
  return (
    <html lang="en" className={cn('font-sans', geist.variable)}>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Navbar user={user} />
        {children}
        <Toaster />
      </body>
    </html>
  );
}
