import type { OAuthTokenResponse } from '@/types/shopware'

let refreshTimer: ReturnType<typeof setTimeout> | null = null

export interface AuthState {
  token: string | null
  expiresAt: number | null
}

export async function authenticate(
  baseUrl: string,
  clientId: string,
  clientSecret: string,
): Promise<OAuthTokenResponse> {
  const url = `${baseUrl.replace(/\/+$/, '')}/api/oauth/token`

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      grant_type: 'client_credentials',
      client_id: clientId,
      client_secret: clientSecret,
    }),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Auth failed (${res.status}): ${text}`)
  }

  return res.json()
}

export function scheduleRefresh(
  baseUrl: string,
  clientId: string,
  clientSecret: string,
  expiresIn: number,
  onRefresh: (token: OAuthTokenResponse) => void,
  onError: (error: Error) => void,
): void {
  cancelRefresh()

  // Refresh at 80% of TTL
  const delay = expiresIn * 0.8 * 1000
  refreshTimer = setTimeout(async () => {
    try {
      const tokenResponse = await authenticate(baseUrl, clientId, clientSecret)
      onRefresh(tokenResponse)
      // Schedule the next refresh
      scheduleRefresh(baseUrl, clientId, clientSecret, tokenResponse.expires_in, onRefresh, onError)
    } catch (err) {
      onError(err instanceof Error ? err : new Error(String(err)))
    }
  }, delay)
}

export function cancelRefresh(): void {
  if (refreshTimer !== null) {
    clearTimeout(refreshTimer)
    refreshTimer = null
  }
}
