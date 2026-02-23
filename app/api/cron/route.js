import { initParse } from '@/lib/parse'
import { analyzeNewsImpact } from '@/lib/analyzer'
import { fetchFinancialNewsEN, fetchFinancialNewsES } from '@/lib/newsFetcher'
import { NextResponse } from 'next/server'

export async function GET(request) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const Parse = initParse()
  const results = { processed: 0, saved: 0, errors: [] }

  try {
    const [articlesEN, articlesES] = await Promise.all([
      fetchFinancialNewsEN(null, 3),
      fetchFinancialNewsES(null, 3),
    ])

    const articles = [...articlesEN, ...articlesES]
    results.processed = articles.length

    for (const article of articles) {
      try {
        const NewsItem = Parse.Object.extend('NewsItem')
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
