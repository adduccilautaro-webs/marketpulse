const FINANCIAL_QUERIES_EN = [
  'Federal Reserve interest rates inflation',
  'OPEC oil production crude',
  'gold silver commodities metals',
  'EUR USD dollar index DXY',
  'SPX DAX Nikkei stock market',
  'bitcoin ethereum cryptocurrency',
  'earnings GDP economy recession',
  'China stimulus economy',
  'ECB European Central Bank rates',
  'natural gas energy prices',
]

const FINANCIAL_QUERIES_ES = [
  'Fed tasas interes inflacion',
  'OPEP petroleo produccion',
  'oro plata metales preciosos',
  'euro dolar bolsa mercados',
  'Bitcoin criptomonedas',
  'economia PIB recesion',
  'China estimulo economia',
  'BCE tipos interes europa',
  'gas natural energia precios',
  'acciones bolsa wall street',
]

export async function fetchFinancialNewsEN(query, pageSize) {
  const size = pageSize || 3
  const queries = FINANCIAL_QUERIES_EN
  const searchQuery = query || queries[Math.floor(Math.random() * queries.length)]

  const params = new URLSearchParams()
  params.set('q', searchQuery)
  params.set('language', 'en')
  params.set('sortBy', 'publishedAt')
  params.set('pageSize', String(size))
  params.set('domains', 'reuters.com,bloomberg.com,cnbc.com,wsj.com,marketwatch.com,ft.com')
  params.set('apiKey', process.env.NEWS_API_KEY)

  const response = await fetch('https://newsapi.org/v2/everything?' + params.toString())
  const data = await response.json()

  return (data.articles || [])
    .filter(function(a) { return a.title && a.description && a.title !== '[Removed]' })
    .map(function(a) {
      return {
        headline: a.title,
        summary: a.description,
        source: (a.source && a.source.name) ? a.source.name : 'Reuters',
        url: a.url,
        publishedAt: a.publishedAt,
      }
    })
}

export async function fetchFinancialNewsES(query, pageSize) {
  const size = pageSize || 3
  const queries = FINANCIAL_QUERIES_ES
  const searchQuery = query || queries[Math.floor(Math.random() * queries.length)]

  const params = new URLSearchParams()
  params.set('q', searchQuery)
  params.set('language', 'es')
  params.set('sortBy', 'publishedAt')
  params.set('pageSize', String(size))
  params.set('domains', 'expansion.com,eleconomista.es,infobae.com,ambito.com,cronista.com')
  params.set('apiKey', process.env.NEWS_API_KEY)

  const response = await fetch('https://newsapi.org/v2/everything?' + params.toString())
  const data = await response.json()

  return (data.articles || [])
    .filter(function(a) { return a.title && a.description && a.title !== '[Removed]' })
    .map(function(a) {
      return {
        headline: a.title,
        summary: a.description,
        source: (a.source && a.source.name) ? a.source.name : 'Expansion',
        url: a.url,
        publishedAt: a.publishedAt,
      }
    })
}

export async function fetchFinancialNews(query, pageSize) {
  return fetchFinancialNewsEN(query, pageSize)
}
