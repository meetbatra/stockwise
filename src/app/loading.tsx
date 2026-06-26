import { Skeleton } from '@/components/ui/skeleton'

export default function HomeLoading() {
  return (
    <div className="flex-grow pt-24 pb-12 px-4 sm:px-6 md:px-8 max-w-[1400px] mx-auto w-full flex flex-col gap-8">
      {/* Header skeleton */}
      <div className="flex flex-col gap-2">
        <Skeleton className="h-10 w-48 bg-border-active" />
        <Skeleton className="h-4 w-64 bg-border-active" />
      </div>

      {/* Filters skeleton */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Skeleton className="h-9 w-full sm:max-w-sm bg-border-active rounded-lg" />
        <Skeleton className="h-9 w-full sm:w-[180px] bg-border-active rounded-lg" />
      </div>

      {/* Grid skeleton — 10 cards matching PAGE_SIZE */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {Array.from({ length: 10 }).map((_, i) => (
          <article
            key={i}
            className="bg-surface-card border border-border-hairline rounded-lg flex flex-col h-[170px]"
          >
            <div className="p-[20px] flex justify-between items-start">
              <div className="space-y-2">
                <Skeleton className="h-4 w-12 bg-border-active" />
                <Skeleton className="h-3 w-24 bg-border-active" />
              </div>
              <Skeleton className="h-4 w-16 bg-border-active" />
            </div>
            <div className="px-[20px] pb-[20px] flex-grow">
              <Skeleton className="h-8 w-20 bg-border-active" />
            </div>
            <div className="border-t border-border-hairline p-[20px] flex justify-between items-center bg-surface-container-lowest/50">
              <div className="space-y-1">
                <Skeleton className="h-2 w-8 bg-border-active" />
                <Skeleton className="h-4 w-12 bg-border-active" />
              </div>
              <div className="space-y-1 items-end flex flex-col">
                <Skeleton className="h-2 w-8 bg-border-active" />
                <Skeleton className="h-4 w-12 bg-border-active" />
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}
