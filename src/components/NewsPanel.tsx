'use client'

import { ExternalLink, Newspaper, KeyRound } from 'lucide-react'
import { useStockNews } from '@/hooks/useStockNews'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'

interface NewsPanelProps {
  ticker: string
  /** When true, the API key is configured server-side */
  hasApiKey?: boolean
}

function timeAgo(unixSeconds: number): string {
  const diff = Math.floor(Date.now() / 1000) - unixSeconds
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

export function NewsPanel({ ticker, hasApiKey = true }: NewsPanelProps) {
  const { news, isLoading, error } = useStockNews(ticker, 8)

  return (
    <div className="space-y-4 animate-fade-up">
      <div className="flex items-center gap-2">
        <Newspaper className="h-4 w-4 text-slate-400" />
        <h2 className="text-sm font-medium tracking-wide text-slate-200">Latest News</h2>
        <Badge variant="outline" className="text-[10px] ml-auto border-hairline bg-black/20 text-slate-400">
          Last 7 days
        </Badge>
      </div>

      {isLoading ? (
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
      ) : error ? (
        <p className="text-sm text-slate-400">{error}</p>
      ) : !news.length ? (
        <div className="flex flex-col items-center gap-3 py-8 text-center">
          <KeyRound className="h-8 w-8 text-slate-600" />
          <p className="text-sm text-slate-400 max-w-[200px]">
            {!hasApiKey
              ? 'News unavailable — configure FINNHUB_API_KEY to enable.'
              : `No recent news found for ${ticker}.`}
          </p>
        </div>
      ) : (
        <ul className="space-y-0 divide-y divide-white/5">
          {news.map((article) => (
            <li key={article.id} className="py-4 first:pt-0 last:pb-0 group">
              <a
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex gap-4 items-start"
              >
                {/* Thumbnail */}
                {article.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={article.image}
                    alt=""
                    className="h-14 w-20 shrink-0 rounded-lg object-cover bg-black/40 border border-hairline"
                    onError={(e) => {
                      ;(e.target as HTMLImageElement).style.display = 'none'
                    }}
                  />
                ) : (
                  <div className="h-14 w-20 shrink-0 rounded-lg bg-black/40 border border-hairline flex items-center justify-center">
                    <Newspaper className="h-5 w-5 text-slate-500/40" />
                  </div>
                )}

                {/* Content */}
                <div className="flex-1 min-w-0 space-y-1.5">
                  <p className="text-sm font-medium leading-snug line-clamp-2 text-slate-200 group-hover:text-emerald-400 transition-colors">
                    {article.headline}
                  </p>
                  <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
                    <span className="truncate max-w-[100px]">{article.source}</span>
                    <span>·</span>
                    <span className="shrink-0">{timeAgo(article.datetime)}</span>
                    <ExternalLink className="h-3 w-3 shrink-0 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
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
