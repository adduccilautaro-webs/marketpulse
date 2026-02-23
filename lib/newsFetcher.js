export async function fetchFinancialNewsEN(query, pageSize) {
  const size = pageSize || 3
  const searchQuery = query || 'Federal Reserve interest rates inflation'
  const params = new URLSearchParams()
  params.set('q', searchQuery)
  params.set('language', 'en')
  params.set('sortBy', 'publishedAt')
  params.set('pageSize', String(size))
  params.set('domains', 'reuters.com,bloomberg.com,cnbc.com,wsj.com,marketwatch.com')
  params.set('apiKey', process.env.NEWS_API_KEY)
  const response = await fetch('https://newsapi.org/v2/everything?' + params.toString())
  const data = await response.json()
  return (data.articles || []).filter(function(a) {
    return a.title && a.description && a.title !== '[Removed]'
  }).map(function(a) {
    return {
      headline: a.title,
      summary: a.description,
      source: a.source && a.source.name ? a.source.name : 'Reuters',
      url: a.url,
      publishedAt: a.publishedAt,
    }
  })
}

export async function fetchFinancialNewsES(query, pageSize) {
  const size = pageSize || 3
  const searchQuery = query || 'oro plata metales preciosos'
  const params = new URLSearchParams()
  params.set('q', searchQuery)
  params.set('language', 'es')
  params.set('sortBy', 'publishedAt')
  params.set('pageSize', String(size))
  params.set('domains', 'expansion.com,eleconomista.es,infobae.com,ambito.com')
  params.set('apiKey', process.env.NEWS_API_KEY)
  const response = await fetch('https://newsapi.org/v2/everything?' + params.toString())
  const data = await response.json()
  return (data.articles || []).filter(function(a) {
    return a.title && a.description && a.title !== '[Removed]'
  }).map(function(a) {
    return {
      headline: a.title,
      summary: a.description,
      source: a.source && a.source.name ? a.source.name : 'Expansion',
      url: a.url,
      publishedAt: a.publishedAt,
    }
  })
}

export async function fetchFinancialNews(query, pageSize) {
  return fetchFinancialNewsEN(query, pageSize)
}
