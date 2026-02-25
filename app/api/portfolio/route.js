import { NextResponse } from 'next/server'
import { initParse } from '@/lib/parse'

async function getRecentNews() {
  try {
    const Parse = initParse()
    const NewsItem = Parse.Object.extend('NewsItem')
    const query = new Parse.Query(NewsItem)
    query.descending('createdAt')
    query.limit(10)
    const results = await query.find({ useMasterKey: true })
    return results.map(function(item) {
      return {
        headline: item.get('headline'),
        bullish: item.get('bullish') || [],
        bearish: item.get('bearish') || [],
        impact: item.get('impact'),
      }
    })
  } catch (err) {
    return []
  }
}

export async function POST(request) {
  try {
    const body = await request.json()
    const { lang } = body

    const news = await getRecentNews()
    const newsText = news.length > 0
      ? news.map(function(n) {
          return '- ' + n.headline + ' (impacto: ' + n.impact + ', alcistas: ' + n.bullish.join(', ') + ', bajistas: ' + n.bearish.join(', ') + ')'
        }).join('\n')
      : 'No hay noticias recientes disponibles.'

    const langInstruction = lang === 'en' ? 'Respond entirely in English.' : 'Responde completamente en español.'

    const prompt = `Eres un gestor de portfolio profesional con experiencia en mercados globales.
${langInstruction}

Basándote en las siguientes noticias recientes del mercado Y en tu conocimiento actual del mercado financiero global, genera un portfolio de inversión recomendado.

NOTICIAS RECIENTES:
${newsText}

Genera un portfolio diversificado con este JSON exacto:
{
  "context": "resumen del contexto de mercado actual en 2-3 oraciones",
  "positions": [
    {
      "asset": "nombre del activo",
      "type": "Acción | Cripto | Materia Prima | Forex | ETF",
      "allocation": 25,
      "risk": "Bajo | Medio | Alto",
      "rationale": "razón de la recomendación en 1-2 oraciones"
    }
  ],
  "avoid": [
    {
      "asset": "nombre del activo",
      "reason": "razón para evitarlo en 1 oración"
    }
  ],
  "disclaimer": "Este análisis es solo informativo y no constituye asesoramiento financiero profesional."
}

Reglas:
- Incluí entre 5 y 7 posiciones
- Los porcentajes deben sumar exactamente 100
- Incluí 2-3 activos a evitar
- Variá entre acciones, cripto, materias primas y forex
- Responde SOLO con el JSON, sin markdown

`

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + process.env.GROQ_API_KEY,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        max_tokens: 1200,
        messages: [{ role: 'user', content: prompt }],
      }),
    })

    const data = await response.json()
    const text = data.choices[0].message.content.trim()
    const clean = text.replace(/```json|```/g, '').trim()
    const portfolio = JSON.parse(clean)

    return NextResponse.json({ success: true, ...portfolio })
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
