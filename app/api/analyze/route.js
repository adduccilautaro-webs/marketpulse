// app/api/analyze/route.js
// Endpoint: recibe headline + summary, llama a Claude y guarda en Back4App
// POST /api/analyze

import { initParse } from '@/lib/parse'
import { analyzeNewsImpact } from '@/lib/analyzer'
import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const body = await request.json()
    const { headline, summary, source, url, publishedAt } = body

    if (!headline || !summary) {
      return NextResponse.json(
        { success: false, error: 'headline y summary son requeridos' },
        { status: 400 }
      )
    }

    // 1. Analizar con Claude
    const analysis = await analyzeNewsImpact(headline, summary)

    // 2. Guardar en Back4App
    const Parse = initParse()
    const NewsItem = Parse.Object.extend('NewsItem')
    const item = new NewsItem()

    item.set('headline', headline)
    item.set('summary', summary)
    item.set('source', source || 'Manual')
    item.set('url', url || '')
    item.set('publishedAt', publishedAt ? new Date(publishedAt) : new Date())
    item.set('type', analysis.type)
    item.set('impact', analysis.impact)
    item.set('category', analysis.category)
    item.set('bullish', analysis.bullish || [])
    item.set('bearish', analysis.bearish || [])
    item.set('neutral', analysis.neutral || [])

    // Permisos: lectura pública, escritura solo con master key
    const acl = new Parse.ACL()
    acl.setPublicReadAccess(true)
    acl.setPublicWriteAccess(false)
    item.setACL(acl)

    await item.save(null, { useMasterKey: true })

    return NextResponse.json({
      success: true,
      id: item.id,
      analysis,
    })
  } catch (error) {
    console.error('Error analyzing news:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
