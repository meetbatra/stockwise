let cachedCookie: string | null = null
let cachedCrumb: string | null = null
let cacheTimestamp: number = 0

const CACHE_TTL = 30 * 60 * 1000 // 30 minutes
const USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'

/**
 * Parses the set-cookie header to extract the actual cookie string
 */
function parseCookies(setCookieHeader: string | null): string | null {
  if (!setCookieHeader) return null
  
  // set-cookie can contain multiple cookies separated by comma if it's a combined string
  // For node-fetch / Next.js fetch, multiple Set-Cookie headers are joined by ', '
  const parts = setCookieHeader.split(',')
  const cookies = parts.map((part) => part.split(';')[0]!.trim())
  return cookies.join('; ')
}

/**
 * Fetches a fresh cookie and crumb from Yahoo Finance.
 */
async function refreshAuth(): Promise<{ cookie: string; crumb: string }> {
  // Step 1: Get Cookie
  const cookieRes = await fetch('https://fc.yahoo.com', {
    headers: { 'User-Agent': USER_AGENT },
    redirect: 'follow',
  })
  
  const setCookie = cookieRes.headers.get('set-cookie')
  const cookie = parseCookies(setCookie)
  
  if (!cookie) {
    throw new Error('Failed to obtain cookie from Yahoo Finance')
  }

  // Step 2: Get Crumb
  const crumbRes = await fetch('https://query2.finance.yahoo.com/v1/test/getcrumb', {
    headers: {
      'User-Agent': USER_AGENT,
      Cookie: cookie,
    },
  })
  
  const crumb = await crumbRes.text()
  
  if (crumb.includes('<!DOCTYPE') || crumb.includes('html')) {
    throw new Error('Failed to obtain crumb from Yahoo Finance (received HTML instead of crumb)')
  }

  cachedCookie = cookie
  cachedCrumb = crumb
  cacheTimestamp = Date.now()

  return { cookie, crumb }
}

/**
 * Returns the current cached cookie and crumb, or fetches new ones if expired/missing.
 */
export async function getAuth(): Promise<{ cookie: string; crumb: string }> {
  const now = Date.now()
  if (!cachedCookie || !cachedCrumb || now - cacheTimestamp > CACHE_TTL) {
    return refreshAuth()
  }
  return { cookie: cachedCookie, crumb: cachedCrumb }
}

/**
 * Forces a refresh of the auth tokens on the next request.
 */
export function invalidateAuth() {
  cachedCookie = null
  cachedCrumb = null
  cacheTimestamp = 0
}
