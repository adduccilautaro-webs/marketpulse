// lib/newsFetcher.js
// Obtiene noticias financieras desde NewsAPI y las prepara para análisis

const FINANCIAL_QUERIES = [
  'Federal Reserve interest rates',
  'OPEC oil production',
  'ECB European Central Bank',
  'inflation GDP economy',
  'stock market earnings',
  'China economy stimulus',
  'gold silver commodities',
  'cryptocurrency bitcoin',
  'geopolitical trade war tariffs',
]

export async function fetchFinancialNews(query = null, pageSize = 10) {
  const searchQuery = query || FINANCIAL_QUERIES[Math.floor(Math.random() * FINANCIAL_QUERIES.length)]

  const url = new URL('https://newsapi.org/v2/everything')
  url.searchParams.set('q', searchQuery)
  url.searchParams.set('language', 'es')
  url.searchParams.set('sortBy', 'publishedAt')
  url.searchParams.set('pageSize', pageSize)
  url.searchParams.set('apiKey', process.env.NEWS_API_KEY)

  const response = await fetch(url.toString())

  if (!response.ok) {
    throw new Error(`NewsAPI error: ${response.status}`)
  }

  const data = await response.json()

  if (data.status !== 'ok') {
    throw new Error(`NewsAPI returned: ${data.message}`)
  }

  // Filtrar artículos sin contenido útil
  return data.articles
    .filter(a => a.title && a.description && a.title !== '[Removed]')
    .map(a => ({
      headline: a.title,
      summary: a.description,
      source: a.source?.name || 'Desconocido',
      url: a.url,
      publishedAt: a.publishedAt,
    }))
}

// Alias: también buscar en inglés (más cobertura financiera)
export async function fetchFinancialNewsEN(query = null, pageSize = 10) {
  const searchQuery = query || FINANCIAL_QUERIES[Math.floor(Math.random() * FINANCIAL_QUERIES.length)]

  const url = new URL('https://newsapi.org/v2/everything')
  url.searchParams.set('q', searchQuery)
  url.searchParams.set('language', 'en')
  url.searchParams.set('sortBy', 'publishedAt')
  url.searchParams.set('pageSize', pageSize)
  url.searchParams.set('domains', 'reuters.com,bloomberg.com,ft.com,cnbc.com,wsj.com,marketwatch.com')
  url.searchParams.set('apiKey', process.env.NEWS_API_KEY)

  const response = await fetch(url.toString())
  const data = await response.json()

  return (data.articles || [])
    .filter(a => a.title && a.description && a.title !== '[Removed]')
    .map(a => ({
      headline: a.title,
      summary: a.description,
      source: a.source?.name || 'Reuters',
      url: a.url,
      publishedAt: a.publishedAt,
    }))
}
