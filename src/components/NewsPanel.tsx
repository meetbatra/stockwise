'use client'

import { ExternalLink, Newspaper } from 'lucide-react'
import { useStockNews } from '@/hooks/useStockNews'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'

interface NewsPanelProps {
  ticker: string
}

function timeAgo(unixSeconds: number): string {
  const diff = Math.floor(Date.now() / 1000) - unixSeconds
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

export function NewsPanel({ ticker }: NewsPanelProps) {
  const { news, isLoading, error } = useStockNews(ticker, 8)

  return (
    <div className="space-y-3 animate-fade-up">
      <div className="flex items-center gap-2">
        <Newspaper className="h-4 w-4 text-muted-foreground" />
        <h2 className="text-sm font-medium">Latest News</h2>
        <Badge variant="outline" className="text-[10px] ml-auto">
          Last 7 days
        </Badge>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="space-y-1.5">
              <Skeleton className="h-3.5 w-full" />
              <Skeleton className="h-3.5 w-4/5" />
              <Skeleton className="h-3 w-24" />
            </div>
          ))}
        </div>
      ) : error ? (
        <p className="text-sm text-muted-foreground">{error}</p>
      ) : !news.length ? (
        <p className="text-sm text-muted-foreground">
          No recent news found for {ticker}.
        </p>
      ) : (
        <ul className="space-y-0 divide-y divide-border/40">
          {news.map((article) => (
            <li key={article.id} className="py-3 first:pt-0 last:pb-0 group">
              <a
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex gap-3 items-start"
              >
                {/* Thumbnail */}
                {article.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={article.image}
                    alt=""
                    className="h-12 w-16 shrink-0 rounded-md object-cover bg-muted"
                    onError={(e) => {
                      ;(e.target as HTMLImageElement).style.display = 'none'
                    }}
                  />
                ) : (
                  <div className="h-12 w-16 shrink-0 rounded-md bg-muted flex items-center justify-center">
                    <Newspaper className="h-4 w-4 text-muted-foreground/40" />
                  </div>
                )}

                {/* Content */}
                <div className="flex-1 min-w-0 space-y-1">
                  <p className="text-sm font-medium leading-snug line-clamp-2 group-hover:text-emerald-400 transition-colors">
                    {article.headline}
                  </p>
                  <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                    <span className="truncate max-w-24">{article.source}</span>
                    <span>·</span>
                    <span className="shrink-0">{timeAgo(article.datetime)}</span>
                    <ExternalLink className="h-2.5 w-2.5 shrink-0 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
