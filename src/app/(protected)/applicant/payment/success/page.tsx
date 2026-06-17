import Link from 'next/link'
import { CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

interface Props {
  searchParams: Promise<{
    id?: string
    external_id?: string
    status?: string
    amount?: string
    currency?: string
  }>
}

export default async function PaymentSuccessPage({ searchParams }: Props) {
  const { id, external_id, status, amount, currency } = await searchParams

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-green-100">
            <CheckCircle className="size-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl">Payment Successful</CardTitle>
          <CardDescription>
            Your payment has been processed successfully.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {external_id && (
            <div className="flex justify-between rounded-lg bg-muted px-4 py-2">
              <span className="text-muted-foreground">Reference</span>
              <span className="font-medium">{external_id}</span>
            </div>
          )}
          {amount && (
            <div className="flex justify-between rounded-lg bg-muted px-4 py-2">
              <span className="text-muted-foreground">Amount</span>
              <span className="font-medium">
                {currency ? `${currency} ` : ''}{parseFloat(amount).toLocaleString()}
              </span>
            </div>
          )}
          {status && (
            <div className="flex justify-between rounded-lg bg-muted px-4 py-2">
              <span className="text-muted-foreground">Status</span>
              <span className="font-medium text-green-600">{status}</span>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex-col gap-2">
          <Button className="w-full" asChild>
            <Link href="/applicant/dashboard">Go to Dashboard</Link>
          </Button>
          <Button variant="outline" className="w-full" asChild>
            <Link href="/services">View Services</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
