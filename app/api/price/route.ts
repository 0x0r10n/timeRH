const TOKEN = '0x8755c1f62cfb0fad7a3dfe6ee00585b594bcc981'

export const revalidate = 0

export async function GET() {
  try {
    const response = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${TOKEN}`, {
      headers: { accept: 'application/json' },
      next: { revalidate: 20 },
    })
    if (!response.ok) throw new Error(`dexscreener ${response.status}`)
    const data = await response.json()
    const pair = (data.pairs ?? []).sort((a: any, b: any) => (b.liquidity?.usd ?? 0) - (a.liquidity?.usd ?? 0))[0]
    if (!pair) throw new Error('no pair')
    return Response.json({
      priceUsd: pair.priceUsd ?? null,
      priceNative: pair.priceNative ?? null,
      change24h: pair.priceChange?.h24 ?? null,
      marketCap: pair.marketCap ?? pair.fdv ?? null,
      liquidity: pair.liquidity?.usd ?? null,
      volume24h: pair.volume?.h24 ?? null,
      url: pair.url ?? null,
    }, { headers: { 'cache-control': 'public, s-maxage=20, stale-while-revalidate=60' } })
  } catch {
    return Response.json({ error: 'unavailable' }, { status: 502 })
  }
}
