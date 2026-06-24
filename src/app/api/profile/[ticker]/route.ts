import { type NextRequest } from 'next/server'
import { fetchProfile } from '@/lib/finnhub'
import type { ApiErrorResponse, ApiProfileResponse } from '@/lib/types'

type Params = { ticker: string }

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<Params> },
): Promise<Response> {
  const { ticker } = await params

  try {
    const profile = await fetchProfile(ticker)
    if (!profile) {
      return Response.json(
        {
          error: `No profile found for ${ticker.toUpperCase()}`,
        } satisfies ApiErrorResponse,
        { status: 404 },
      )
    }
    return Response.json({ profile } satisfies ApiProfileResponse)
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'Failed to fetch profile'
    return Response.json({ error: message } satisfies ApiErrorResponse, {
      status: 500,
    })
  }
}
