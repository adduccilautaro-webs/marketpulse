// app/api/heatmap/route.js
// Datos de mercado en vivo via Yahoo Finance — sin API key

import { NextResponse } from 'next/server'

const SYMBOLS = {
  // Índices
  SPX:    '^GSPC',
  NDX:    '^NDX',
  DJI:    '^DJI',
  DAX:    '^GDAXI',
  NKY:    '^N225',
  FTSE:   '^FTSE',
  // Forex
  DXY:    'DX-Y.NYB',
  EURUSD: 'EURUSD=X',
  GBPUSD: 'GBPUSD=X',
  USDJPY: 'JPY=X',
  AUDUSD: 'AUDUSD=X',
  USDCAD: 'CAD=X',
  // Commodities
  XAUUSD: 'GC=F',
  XAGUSD: 'SI=F',
  WTI:    'CL=F',
  BRENT:  'BZ=F',
  NG:     'NG=F',
  COPPER: 'HG=F',
  // Crypto
  BTC:    'BTC-USD',
  ETH:    'ETH-USD',
  SOL:    'SOL-USD',
  BNB:    'BNB-USD',
  XRP:    'XRP-USD',
  ADA:    'ADA-USD',
  // Acciones
  AAPL:   'AAPL',
  NVDA:   'NVDA',
  MSFT:   'MSFT',
  AMZN:   'AMZN',
  TSLA:   'TSLA',
  META:   'META',
  // Bonos
  US10Y:  '^TNX',
  US02Y:  '^IRX',
  US30Y:  '^TYX',
  DE10Y:  '^DE10YT=RR',
}

// Cache en memoria — sobrevive entre requests, se reinicia con cold start
let _cache = null
let _cacheTs = 0
const CACHE_MS = 60_000

async function fetchBatch(yahooSymbols) {
  const url =
    'https://query1.finance.yahoo.com/v7/finance/quote?symbols=' +
    yahooSymbols.join(',') +
    '&fields=symbol,regularMarketPrice,regularMarketChangePercent'

  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; MarketPulse/1.0)' },
    signal: AbortSignal.timeout(8000),
  })
  if (!res.ok) throw new Error('Yahoo HTTP ' + res.status)
  const json = await res.json()
  return json?.quoteResponse?.result ?? []
}

export async function GET() {
  try {
    const now = Date.now()

    // Devolver caché si es fresco
    if (_cache && now - _cacheTs < CACHE_MS) {
      return NextResponse.json({ data: _cache, ts: _cacheTs, cached: true })
    }

    // Invertir mapa para lookups
    const yahooToOurs = Object.fromEntries(
      Object.entries(SYMBOLS).map(([k, v]) => [v, k])
    )

    const yahooSyms = Object.values(SYMBOLS)

    // Lotes de 20 (límite seguro de Yahoo)
    const BATCH = 20
    const batches = []
    for (let i = 0; i < yahooSyms.length; i += BATCH) {
      batches.push(yahooSyms.slice(i, i + BATCH))
    }

    const settled = await Promise.allSettled(batches.map(fetchBatch))

    const data = {}
    for (const r of settled) {
      if (r.status !== 'fulfilled') continue
      for (const q of r.value) {
        const ourSym = yahooToOurs[q.symbol]
        if (!ourSym) continue
        data[ourSym] = {
          price: q.regularMarketPrice ?? null,
          pct: q.regularMarketChangePercent != null
            ? Math.round(q.regularMarketChangePercent * 100) / 100
            : null,
        }
      }
    }

    _cache = data
    _cacheTs = now

    return NextResponse.json({ data, ts: now, cached: false })
  } catch (err) {
    console.error('[heatmap]', err.message)
    if (_cache) {
      return NextResponse.json({ data: _cache, ts: _cacheTs, cached: true, stale: true })
    }
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
