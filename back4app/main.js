// back4app/main.js
// Cloud Functions de Back4App
// Sube este archivo al Cloud Code de tu app en Back4App
// Panel: https://www.back4app.com → Tu app → Cloud Code → main.js

const axios = require('axios')

// ─────────────────────────────────────────────
// FUNCIÓN: analyzeAndSave
// Llamada desde tu frontend o cron job para
// analizar una noticia con Claude y guardarla
// ─────────────────────────────────────────────
Parse.Cloud.define('analyzeAndSave', async (request) => {
  const { headline, summary, source, url, publishedAt } = request.params

  if (!headline || !summary) {
    throw new Parse.Error(400, 'headline y summary son requeridos')
  }

  // 1. Llamar a Claude API
  const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY // Configura en Back4App Settings → Environment Variables

  const prompt = `Eres un analista financiero experto. Analiza esta noticia y responde SOLO con JSON válido:

TITULAR: ${headline}
RESUMEN: ${summary}

{
  "type": "noticia|anuncio|rumor",
  "impact": "alto|medio|bajo",
  "category": "indices|divisas|metales|energia|cripto|acciones|bonos",
  "bullish": ["ACTIVO1", "ACTIVO2"],
  "bearish": ["ACTIVO1"],
  "neutral": []
}`

  const aiResponse = await axios.post(
    'https://api.anthropic.com/v1/messages',
    {
      model: 'claude-sonnet-4-20250514',
      max_tokens: 500,
      messages: [{ role: 'user', content: prompt }],
    },
    {
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_KEY,
        'anthropic-version': '2023-06-01',
      },
    }
  )

  const text = aiResponse.data.content[0].text.replace(/```json|```/g, '').trim()
  const analysis = JSON.parse(text)

  // 2. Guardar en la clase NewsItem
  const NewsItem = Parse.Object.extend('NewsItem')

  // Verificar duplicados por URL
  if (url) {
    const q = new Parse.Query(NewsItem)
    q.equalTo('url', url)
    const existing = await q.first({ useMasterKey: true })
    if (existing) return { saved: false, reason: 'duplicate', id: existing.id }
  }

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

  const acl = new Parse.ACL()
  acl.setPublicReadAccess(true)
  acl.setPublicWriteAccess(false)
  item.setACL(acl)

  await item.save(null, { useMasterKey: true })

  return { saved: true, id: item.id, analysis }
})

// ─────────────────────────────────────────────
// FUNCIÓN: getLatestNews
// Obtener noticias con filtros opcionales
// ─────────────────────────────────────────────
Parse.Cloud.define('getLatestNews', async (request) => {
  const { category, type, limit = 20 } = request.params

  const NewsItem = Parse.Object.extend('NewsItem')
  const query = new Parse.Query(NewsItem)

  if (category && category !== 'all') query.equalTo('category', category)
  if (type && type !== 'all') query.equalTo('type', type)

  query.descending('publishedAt')
  query.limit(limit)

  const results = await query.find({ useMasterKey: true })

  return results.map(item => ({
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
  }))
})

// ─────────────────────────────────────────────
// FUNCIÓN: deleteOldNews
// Limpieza automática: elimina noticias de más de 7 días
// Configura en Back4App: Jobs → Scheduled → cada 24h
// ─────────────────────────────────────────────
Parse.Cloud.job('deleteOldNews', async (request) => {
  const { message } = request

  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - 7)

  const NewsItem = Parse.Object.extend('NewsItem')
  const query = new Parse.Query(NewsItem)
  query.lessThan('publishedAt', cutoff)
  query.limit(200)

  const old = await query.find({ useMasterKey: true })
  await Parse.Object.destroyAll(old, { useMasterKey: true })

  message(`Eliminadas ${old.length} noticias antiguas`)
})
