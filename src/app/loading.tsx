/**
 * Shared loading skeleton for the home page.
 *
 * `LoadingRows` — the 10 pulsing list rows, used by HomeContent for the
 *   client-side loading state while data is being fetched.
 *
 * Default export — full-page wrapper used automatically by Next.js as the
 *   Suspense boundary for any Server Component route that wraps this segment.
 */

export function LoadingRows() {
  return (
    <div className="flex flex-col gap-2 animate-fade-up w-full">
      {Array.from({ length: 10 }).map((_, i) => (
        <div
          key={i}
          className="h-[90px] lg:h-[72px] bg-white/10 border border-white/5 rounded-xl animate-pulse"
        />
      ))}
    </div>
  )
}

export default function HomeLoading() {
  return (
    <div className="flex-grow pt-24 pb-12 px-4 sm:px-6 md:px-8 max-w-[1400px] mx-auto w-full flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <div className="h-9 w-48 bg-white/10 rounded animate-pulse" />
        <div className="h-4 w-64 bg-white/10 rounded animate-pulse" />
      </div>

      {/* Screener pills */}
      <div className="flex gap-2">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="h-9 w-28 bg-white/10 rounded-full animate-pulse" />
        ))}
      </div>

      {/* Search row */}
      <div className="h-10 w-full sm:max-w-xs bg-white/10 rounded-lg animate-pulse" />

      {/* List rows */}
      <LoadingRows />
    </div>
  )
}
