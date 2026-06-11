import Link from 'next/link'
import { XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

interface Props {
  searchParams: Promise<{
    id?: string
    external_id?: string
    status?: string
    amount?: string
    error?: string
  }>
}

export default async function PaymentFailedPage({ searchParams }: Props) {
  const { id, external_id, status, error } = await searchParams

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-red-100">
            <XCircle className="size-8 text-red-600" />
          </div>
          <CardTitle className="text-2xl">Payment Failed</CardTitle>
          <CardDescription>
            {error || 'Something went wrong with your payment. Please try again.'}
          </CardDescription>
        </CardHeader>
        {external_id && (
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between rounded-lg bg-muted px-4 py-2">
              <span className="text-muted-foreground">Reference</span>
              <span className="font-medium">{external_id}</span>
            </div>
            {status && (
              <div className="flex justify-between rounded-lg bg-muted px-4 py-2">
                <span className="text-muted-foreground">Status</span>
                <span className="font-medium text-red-600">{status}</span>
              </div>
            )}
          </CardContent>
        )}
        <CardFooter className="flex-col gap-2">
          <Button className="w-full" asChild>
            <Link href="/applicant/dashboard">Try Again</Link>
          </Button>
          <Button variant="outline" className="w-full" asChild>
            <Link href="/contact">Contact Support</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
