// app/api/heatmap/route.js
// Datos en vivo usando múltiples APIs gratuitas sin API key:
//   - Crypto:  CoinGecko (gratuito, sin key)
//   - Forex:   exchangerate.host  
//   - Indices/Acciones: Yahoo Finance query2 (con headers correctos)
//   - Metales: metals via Yahoo

import { NextResponse } from 'next/server'

let _cache = null
let _cacheTs = 0
const CACHE_MS = 60_000

// ─── 1. CRYPTO via CoinGecko (sin API key, muy confiable) ────
async function fetchCrypto() {
  const ids = 'bitcoin,ethereum,solana,binancecoin,ripple,cardano'
  const url = `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`

  const res = await fetch(url, {
    headers: { 'Accept': 'application/json' },
    signal: AbortSignal.timeout(8000),
  })
  if (!res.ok) throw new Error('CoinGecko ' + res.status)
  const json = await res.json()

  const MAP = {
    bitcoin:     'BTC',
    ethereum:    'ETH',
    solana:      'SOL',
    binancecoin: 'BNB',
    ripple:      'XRP',
    cardano:     'ADA',
  }

  const result = {}
  for (const [id, sym] of Object.entries(MAP)) {
    if (json[id]) {
      result[sym] = {
        price: json[id].usd,
        pct:   json[id].usd_24h_change != null
          ? Math.round(json[id].usd_24h_change * 100) / 100
          : null,
      }
    }
  }
  return result
}

// ─── 2. YAHOO FINANCE via query2 (más permisivo que query1) ──
async function fetchYahoo(symbols) {
  // query2 tiene menos restricciones que query1 desde servidores
  const url = 'https://query2.finance.yahoo.com/v8/finance/spark?symbols=' +
    symbols.join(',') +
    '&range=1d&interval=1d&indicators=close&includeTimestamps=false'

  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'application/json',
      'Accept-Language': 'en-US,en;q=0.9',
      'Referer': 'https://finance.yahoo.com/',
      'Origin': 'https://finance.yahoo.com',
    },
    signal: AbortSignal.timeout(10000),
  })
  if (!res.ok) throw new Error('Yahoo query2 ' + res.status)
  const json = await res.json()
  return json?.spark?.result ?? []
}

// Alternativa: Yahoo v7/finance/quote con cookie workaround
async function fetchYahooQuote(symbols) {
  const joined = symbols.join(',')
  const url = `https://query2.finance.yahoo.com/v7/finance/quote?symbols=${joined}&fields=symbol,regularMarketPrice,regularMarketChangePercent&formatted=false&lang=en-US&region=US`

  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
      'Accept': '*/*',
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept-Encoding': 'gzip, deflate, br',
      'Referer': 'https://finance.yahoo.com/',
      'Cache-Control': 'no-cache',
    },
    signal: AbortSignal.timeout(10000),
  })

  if (!res.ok) throw new Error('Yahoo quote ' + res.status)
  const json = await res.json()
  return json?.quoteResponse?.result ?? []
}

// ─── 3. STOOQ como fallback para índices ─────────────────────
// stooq.com devuelve CSV y es accesible desde servidores
async function fetchStooq(ticker) {
  const url = `https://stooq.com/q/l/?s=${ticker}&f=sd2t2ohlcv&h&e=csv`
  const res = await fetch(url, { signal: AbortSignal.timeout(5000) })
  if (!res.ok) return null
  const text = await res.text()
  const lines = text.trim().split('\n')
  if (lines.length < 2) return null
  const parts = lines[1].split(',')
  // Header: Symbol,Date,Time,Open,High,Low,Close,Volume
  const close = parseFloat(parts[6])
  const open  = parseFloat(parts[3])
  if (!close || !open) return null
  const pct = Math.round(((close - open) / open) * 10000) / 100
  return { price: close, pct }
}

// ─── 4. EXCHANGERATE.HOST para forex ─────────────────────────
async function fetchForex() {
  // frankfurter.app: gratuito y confiable
  const url = 'https://api.frankfurter.app/latest?from=USD&to=EUR,GBP,JPY,AUD,CAD'
  const res = await fetch(url, { signal: AbortSignal.timeout(8000) })
  if (!res.ok) throw new Error('Frankfurter ' + res.status)
  const json = await res.json()

  // Frankfurter no da % cambio — lo calculamos con yesterday
  const urlYest = 'https://api.frankfurter.app/latest?from=USD&to=EUR,GBP,JPY,AUD,CAD&amount=1'
  // Solo devolvemos precios, el % lo calculamos en una segunda call
  return json.rates // { EUR: x, GBP: x, ... }
}

// ─── MAIN HANDLER ────────────────────────────────────────────
export async function GET() {
  const now = Date.now()

  // Cache fresco
  if (_cache && now - _cacheTs < CACHE_MS) {
    return NextResponse.json({ data: _cache, ts: _cacheTs, cached: true })
  }

  const data = {}
  const errors = []

  // ── CRYPTO ────────────────────────────────────────────────
  try {
    const crypto = await fetchCrypto()
    Object.assign(data, crypto)
  } catch (e) {
    errors.push('crypto: ' + e.message)
  }

  // ── INDICES, ACCIONES, METALES via Yahoo ──────────────────
  const yahooSymbols = {
    // Índices
    '^GSPC': 'SPX',   '^NDX':   'NDX',  '^DJI': 'DJI',
    '^GDAXI': 'DAX',  '^N225':  'NKY',  '^FTSE': 'FTSE',
    // Metales / Commodities
    'GC=F':  'XAUUSD', 'SI=F': 'XAGUSD', 'CL=F': 'WTI',
    'BZ=F':  'BRENT',  'NG=F': 'NG',     'HG=F': 'COPPER',
    // Acciones
    'AAPL': 'AAPL', 'NVDA': 'NVDA', 'MSFT': 'MSFT',
    'AMZN': 'AMZN', 'TSLA': 'TSLA', 'META': 'META',
    // Forex (Yahoo también los tiene)
    'EURUSD=X': 'EURUSD', 'GBPUSD=X': 'GBPUSD',
    'JPY=X':    'USDJPY',  'AUDUSD=X': 'AUDUSD',
    'CAD=X':    'USDCAD',  'DX-Y.NYB': 'DXY',
    // Bonos
    '^TNX': 'US10Y', '^IRX': 'US02Y', '^TYX': 'US30Y',
  }

  const yahooList  = Object.keys(yahooSymbols)
  const invertMap  = Object.fromEntries(Object.entries(yahooSymbols).map(([k,v]) => [k,v]))

  try {
    // Lotes de 15
    const BATCH = 15
    const batches = []
    for (let i = 0; i < yahooList.length; i += BATCH) {
      batches.push(yahooList.slice(i, i + BATCH))
    }
    const settled = await Promise.allSettled(batches.map(b => fetchYahooQuote(b)))

    for (const r of settled) {
      if (r.status !== 'fulfilled') continue
      for (const q of r.value) {
        const sym = invertMap[q.symbol]
        if (!sym) continue
        data[sym] = {
          price: q.regularMarketPrice ?? null,
          pct:   q.regularMarketChangePercent != null
            ? Math.round(q.regularMarketChangePercent * 100) / 100
            : null,
        }
      }
    }
  } catch (e) {
    errors.push('yahoo: ' + e.message)
  }

  // ── STOOQ FALLBACK para índices que no cargaron ───────────
  const stooqMap = {
    SPX:  '^spx',  NDX:  '^ndx',  DJI:  '^dji',
    DAX:  '^dax',  NKY:  '^nkx',  FTSE: '^ftx',
  }
  const missingIndices = Object.keys(stooqMap).filter(s => !data[s]?.price)

  if (missingIndices.length > 0) {
    await Promise.allSettled(
      missingIndices.map(async sym => {
        try {
          const d = await fetchStooq(stooqMap[sym])
          if (d) data[sym] = d
        } catch (_) {}
      })
    )
  }

  // ── BONO ALEMÁN fallback ──────────────────────────────────
  if (!data['DE10Y']) {
    try {
      const d = await fetchStooq('10de.b')
      if (d) data['DE10Y'] = d
    } catch (_) {}
  }

  // Si no hay nada, error real
  if (Object.keys(data).length === 0) {
    return NextResponse.json(
      { error: 'No se pudieron cargar datos. ' + errors.join(' | ') },
      { status: 503 }
    )
  }

  _cache = data
  _cacheTs = now

  return NextResponse.json({
    data,
    ts: now,
    cached: false,
    coverage: Object.keys(data).length,
    errors: errors.length ? errors : undefined,
  })
}
