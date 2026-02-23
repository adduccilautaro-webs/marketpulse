// app/api/news/route.js
// Endpoint público: devuelve las noticias guardadas en Back4App
// GET /api/news?category=indices&type=anuncio&limit=20

import { initParse } from '@/lib/parse'
import { NextResponse } from 'next/server'

export async function GET(request) {
  try {
    const Parse = initParse()
    const { searchParams } = new URL(request.url)

    const category = searchParams.get('category') // indices, divisas, metales, energia, etc.
    const type = searchParams.get('type')          // noticia, anuncio, rumor
    const limit = parseInt(searchParams.get('limit') || '20')

    const NewsItem = Parse.Object.extend('NewsItem')
    const query = new Parse.Query(NewsItem)

    // Filtros opcionales
    if (category && category !== 'all') {
      query.equalTo('category', category)
    }
    if (type && type !== 'all') {
      query.equalTo('type', type)
    }

    query.descending('publishedAt')
    query.limit(limit)

    const results = await query.find({ useMasterKey: true })

    const news = results.map(item => ({
      id: item.id,
      headline: item.get('headline'),
      summary: item.get('summary'),
      type: item.get('type'),
      impact: item.get('impact'),
      category: item.get('category'),
      bullish: item.get('bullish') || [],
      bearish: item.get('bearish') || [],
      neutral: item.get('neutral') || [],
      source: item.get('source'),
      url: item.get('url'),
      publishedAt: item.get('publishedAt'),
      createdAt: item.createdAt,
    }))

    return NextResponse.json({ success: true, count: news.length, news })
  } catch (error) {
    console.error('Error fetching news:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
