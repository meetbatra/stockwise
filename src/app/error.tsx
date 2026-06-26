'use client'

import Link from 'next/link'
import { AlertTriangle } from 'lucide-react'
import { Button, buttonVariants } from '@/components/ui/button'

export default function Error({
  error: _error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-4 animate-fade-up">
      <div className="flex flex-col items-center gap-4 text-center">
        <AlertTriangle className="h-12 w-12 text-trend-down" />
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold text-primary">Something went wrong</h1>
          <p className="text-sm text-on-surface-variant">
            An unexpected error occurred. Please try again.
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Button onClick={reset}>Try again</Button>
        <Link href="/" className={buttonVariants({ variant: 'outline' })}>
          Go home
        </Link>
      </div>
    </div>
  )
}

