'use client'

export default function TickerError({
  error: _error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h2 className="text-xl font-semibold">Failed to load ticker data</h2>
      <button onClick={reset} className="underline">
        Try again
      </button>
    </div>
  )
}
