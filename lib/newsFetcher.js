export async function fetchFinancialNewsEN(query, pageSize) {
  const size = pageSize || 5
  const searchQuery = query || 'Federal Reserve interest rates inflation'

  const params = new URLSearchParams()
  params.set('q', searchQuery)
  params.set('lang', 'en')
  params.set('max', String(size))
  params.set('sortby', 'publishedAt')
  params.set('token', process.env.GNEWS_API_KEY)

  const response = await fetch('https://gnews.io/api/v4/search?' + params.toString())
  const data = await response.json()

  return (data.articles || []).filter(function(a) {
    return a.title && a.description
  }).map(function(a) {
    return {
      headline: a.title,
      summary: a.description,
      source: a.source && a.source.name ? a.source.name : 'GNews',
      url: a.url,
      publishedAt: a.publishedAt,
    }
  })
}

export async function fetchFinancialNewsES(query, pageSize) {
  const size = pageSize || 5
  const searchQuery = query || 'oro mercados bolsa economia'

  const params = new URLSearchParams()
  params.set('q', searchQuery)
  params.set('lang', 'es')
  params.set('max', String(size))
  params.set('sortby', 'publishedAt')
  params.set('token', process.env.GNEWS_API_KEY)

  const response = await fetch('https://gnews.io/api/v4/search?' + params.toString())
  const data = await response.json()

  return (data.articles || []).filter(function(a) {
    return a.title && a.description
  }).map(function(a) {
    return {
      headline: a.title,
      summary: a.description,
      source: a.source && a.source.name ? a.source.name : 'GNews',
      url: a.url,
      publishedAt: a.publishedAt,
    }
  })
}

export async function fetchFinancialNews(query, pageSize) {
  return fetchFinancialNewsEN(query, pageSize)
}
