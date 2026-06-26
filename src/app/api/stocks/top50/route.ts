import { type NextRequest, NextResponse } from 'next/server'
import { fetchScreener } from '@/lib/yahoo-fetch'

export const revalidate = 300 // Cache at Edge/Next.js level for 5 minutes

const VALID_SCREENERS = [
  'most_actives',
  'day_gainers',
  'day_losers',
  'undervalued_large_caps',
  'growth_technology_stocks',
  'undervalued_growth_stocks',
  'small_cap_gainers',
]

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams
    const screener = searchParams.get('screener') || 'most_actives'
    
    let size = parseInt(searchParams.get('size') || '50', 10)
    if (isNaN(size) || size < 1) size = 50
    if (size > 100) size = 100

    if (!VALID_SCREENERS.includes(screener)) {
      return NextResponse.json(
        { error: `Invalid screener. Must be one of: ${VALID_SCREENERS.join(', ')}` },
        { status: 400 }
      )
    }

    const stocks = await fetchScreener(screener, size)

    return NextResponse.json({
      stocks,
      screener,
      total: stocks.length,
    })
  } catch (error) {
    console.error('[API] Error fetching top50:', error)
    return NextResponse.json(
      { error: 'Failed to fetch stocks' },
      { status: 500 }
    )
  }
}
