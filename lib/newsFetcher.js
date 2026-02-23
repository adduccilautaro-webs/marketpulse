const FINANCIAL_QUERIES = [
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

export async function fetchFinancialNewsEN(query = null, pageSize = 5) {
  const searchQuery = query || FINANCIAL_QUERIES[Math.floor(Math.random() * FINANCIAL_QUERIES.length)]

  const url = new URL('https://newsapi.org/v2/everything')
  url.searchParams.set('q', searchQuery)
  url.searchParams.set('language', 'en')
  url.searchParams.set('sortBy', 'publishedAt')
  url.searchParams.set('pageSize', pageSize)
  url.searchParams.set('domains', 'reuters.com,bloomberg.com,cnbc.com,wsj.com,marketwatch.com,ft.com')
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

export async function fetchFinancialNews(query = null, pageSize = 5) {
  return fetchFinancialNewsEN(query, pageSize)
}
