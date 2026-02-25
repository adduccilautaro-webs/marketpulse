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
  return (data.articles || []).map(function(a) {
    return { title: a.title, source: a.source && a.source.name ? a.source.name : 'GNews', url: a.url }
  })
}

export async function POST(request) {
  try {
    const body = await request.json()
    const { query, lang } = body

    if (!query) return NextResponse.json({ success: false, error: 'Query requerida' }, { status: 400 })

    const news = await fetchNews(query)

    const newsText = news.length > 0
      ? news.map(function(n, i) { return (i + 1) + '. ' + n.title }).join('\n')
      : 'No se encontraron noticias recientes.'

    const langInstruction = lang === 'en'
      ? 'Respond entirely in English.'
      : 'Responde completamente en español.'

    const prompt = `Eres un analista financiero experto con conocimiento profundo de mercados globales.
${langInstruction}

El usuario quiere analizar el activo: "${query}"

Noticias recientes encontradas:
${newsText}

Genera un análisis completo con este formato JSON exacto:
{
  "asset": "nombre oficial del activo",
  "type": "Acción | Criptomoneda | Materia Prima | Forex | Índice",
  "fundamental": "análisis fundamental detallado de 3-4 oraciones sobre la empresa/activo, valuación, ingresos, perspectivas",
  "technical": "análisis técnico de 3-4 oraciones sobre tendencia, soportes, resistencias, momentum",
  "risks": "principales riesgos de invertir en este activo en 2-3 oraciones",
  "summary": "conclusión final de 2-3 oraciones integrando todo el análisis",
  "verdict": "COMPRAR | NEUTRAL | VENDER",
  "confidence": "Alta | Media | Baja"
}

Sé objetivo y profesional. Basa el análisis en datos reales y las noticias proporcionadas.
Responde SOLO con el JSON, sin markdown ni explicaciones adicionales.`

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + process.env.GROQ_API_KEY,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        max_tokens: 1000,
        messages: [{ role: 'user', content: prompt }],
      }),
    })

    const data = await response.json()
    const text = data.choices[0].message.content.trim()
    const clean = text.replace(/```json|```/g, '').trim()
    const analysis = JSON.parse(clean)

    return NextResponse.json({ success: true, asset: query, analysis, news })
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
