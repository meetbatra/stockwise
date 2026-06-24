import { Skeleton } from '@/components/ui/skeleton'

export default function TickerLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-24 pb-12 space-y-8 animate-pulse">
      {/* Price Header Skeleton */}
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <Skeleton className="h-12 w-12 rounded-xl bg-slate-800/50" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-48 bg-slate-800/50" />
            <Skeleton className="h-4 w-32 bg-slate-800/50" />
          </div>
        </div>
        <div className="flex items-end gap-4 p-5 rounded-2xl bg-surface-card border border-hairline">
          <Skeleton className="h-12 w-40 bg-slate-800/50" />
          <Skeleton className="h-8 w-32 rounded-full bg-slate-800/50" />
        </div>
      </div>

      {/* Main grid: chart + sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column — chart + stats */}
        <div className="lg:col-span-2 space-y-6">
          {/* Chart Skeleton */}
          <div className="group relative overflow-hidden rounded-2xl bg-surface-card border border-hairline p-5">
            <div className="flex items-center justify-between mb-4">
              <Skeleton className="h-5 w-24 bg-slate-800/50" />
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-6 w-8 rounded bg-slate-800/50" />
                ))}
              </div>
            </div>
            <Skeleton className="h-60 w-full rounded-xl bg-slate-800/50" />
          </div>

          {/* Stats Skeleton */}
          <div className="group relative overflow-hidden rounded-2xl bg-surface-card border border-hairline p-5">
            <Skeleton className="h-5 w-32 mb-4 bg-slate-800/50" />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="rounded-xl border border-hairline bg-black/20 p-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-1.5">
                      <Skeleton className="h-3 w-3 bg-slate-800/50" />
                      <Skeleton className="h-3 w-16 bg-slate-800/50" />
                    </div>
                    <Skeleton className="h-6 w-24 bg-slate-800/50" />
                  </div>
                </div>
              ))}
              <div className="col-span-2 sm:col-span-4 rounded-xl border border-hairline bg-black/20 p-4 flex items-center gap-2">
                <Skeleton className="h-4 w-4 bg-slate-800/50" />
                <Skeleton className="h-4 w-16 bg-slate-800/50" />
                <Skeleton className="h-4 w-40 ml-1 bg-slate-800/50" />
                <Skeleton className="h-4 w-12 ml-auto bg-slate-800/50" />
              </div>
            </div>
          </div>
        </div>

        {/* Right column — news */}
        <div className="lg:col-span-1">
          <div className="group relative overflow-hidden rounded-2xl bg-surface-card border border-hairline p-5 h-full">
            <div className="flex items-center gap-2 mb-4">
              <Skeleton className="h-4 w-4 bg-slate-800/50" />
              <Skeleton className="h-5 w-24 bg-slate-800/50" />
              <Skeleton className="h-5 w-20 ml-auto rounded-full bg-slate-800/50" />
            </div>
            <div className="space-y-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="flex gap-4 items-start">
                  <Skeleton className="h-14 w-20 shrink-0 rounded-lg bg-slate-800/50" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-full bg-slate-800/50" />
                    <Skeleton className="h-4 w-4/5 bg-slate-800/50" />
                    <div className="flex items-center gap-2 pt-1">
                      <Skeleton className="h-3 w-16 bg-slate-800/50" />
                      <Skeleton className="h-3 w-12 bg-slate-800/50" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
