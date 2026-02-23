import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const body = await request.json()
    const { headline, summary, bullish, bearish, impact } = body

    const prompt = `Eres un trader profesional experto en análisis técnico y fundamental. 
Se te dará una noticia financiera con sus activos afectados.
Genera 2 ideas de trading concretas y accionables basadas en esta noticia.

NOTICIA: ${headline}
RESUMEN: ${summary}
IMPACTO: ${impact}
ACTIVOS ALCISTAS: ${bullish.join(', ')}
ACTIVOS BAJISTAS: ${bearish.join(', ')}

Para cada idea incluí:
- direction: "LONG" o "SHORT"
- asset: el activo específico
- entry: precio o zona de entrada (ej: "cerca de 1.0850" o "ruptura de 2400")
- stopLoss: nivel de stop loss
- takeProfit: objetivo de precio
- confidence: "Alta" | "Media" | "Baja"
- rationale: explicación breve de 1-2 oraciones

Responde SOLO con JSON válido:
[
  {
    "direction": "LONG",
    "asset": "NOMBRE",
    "entry": "precio",
    "stopLoss": "precio",
    "takeProfit": "precio",
    "confidence": "Alta",
    "rationale": "explicacion"
  }
]`

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + process.env.GROQ_API_KEY,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        max_tokens: 800,
        messages: [{ role: 'user', content: prompt }],
      }),
    })

    const data = await response.json()
    const text = data.choices[0].message.content.trim()
    const clean = text.replace(/```json|```/g, '').trim()
    const ideas = JSON.parse(clean)

    return NextResponse.json({ success: true, ideas })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
