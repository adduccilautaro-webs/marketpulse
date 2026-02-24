import { initParse } from '@/lib/parse'
import { analyzeNewsImpact } from '@/lib/analyzer'
import { NextResponse } from 'next/server'

async function fetchNews(query) {
  const params = new URLSearchParams()
  params.set('q', query)
  params.set('lang', 'en')
  params.set('max', '5')
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

export async function GET(request) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== 'Bearer ' + process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const Parse = initParse()
  const results = { processed: 0, saved: 0, deleted: 0, errors: [] }

  try {
    // Borrar noticias de mas de 3 dias
    const NewsItem = Parse.Object.extend('NewsItem')
    const threeDaysAgo = new Date()
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3)

    const oldQuery = new Parse.Query(NewsItem)
    oldQuery.lessThan('createdAt', threeDaysAgo)
    oldQuery.limit(50)
    const oldNews = await oldQuery.find({ useMasterKey: true })
    for (const item of oldNews) {
      await item.destroy({ useMasterKey: true })
      results.deleted++
    }

    // Buscar noticias con queries rotativas
    const queries = [
      'gold markets dollar',
      'Federal Reserve interest rates',
      'oil crude OPEC',
      'bitcoin crypto markets',
      'stock market earnings',
      'inflation economy GDP',
      'euro dollar forex',
      'silver commodities metals',
      'natural gas energy',
      'China economy stimulus',
    ]
    const hour = new Date().getHours()
    const query1 = queries[hour % queries.length]
    const query2 = queries[(hour + 2) % queries.length]

    const [articles1, articles2] = await Promise.all([
      fetchNews(query1),
      fetchNews(query2),
    ])

    const articles = [...articles1, ...articles2]
    results.processed = articles.length

    for (const article of articles) {
      try {
        const existing = new Parse.Query(NewsItem)
        existing.equalTo('url', article.url)
        const found = await existing.first({ useMasterKey: true })
        if (found) continue

        const analysis = await analyzeNewsImpact(article.headline, article.summary)

        const item = new NewsItem()
        item.set('headline', article.headline)
        item.set('summary', article.summary)
        item.set('source', article.source)
        item.set('url', article.url)
        item.set('publishedAt', new Date(article.publishedAt))
        item.set('type', analysis.type)
        item.set('impact', analysis.impact)
        item.set('category', analysis.category)
        item.set('bullish', analysis.bullish || [])
        item.set('bearish', analysis.bearish || [])
        item.set('neutral', analysis.neutral || [])

        const acl = new Parse.ACL()
        acl.setPublicReadAccess(true)
        acl.setPublicWriteAccess(false)
        item.setACL(acl)

        await item.save(null, { useMasterKey: true })
        results.saved++

        await new Promise(r => setTimeout(r, 1000))
      } catch (err) {
        results.errors.push({ headline: article.headline, error: err.message })
      }
    }

    return NextResponse.json({ success: true, ...results })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
