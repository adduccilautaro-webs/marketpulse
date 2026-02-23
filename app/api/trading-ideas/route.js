import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const body = await request.json()
    const { headline, summary, bullish, bearish, impact } = body

    const prompt = `Eres un trader profesional experto en analisis tecnico y fundamental.
Se te dara una noticia financiera con sus activos afectados.
Genera 2 ideas de trading concretas y accionables basadas en esta noticia.

NOTICIA: ${headline}
RESUMEN: ${summary}
IMPACTO: ${impact}
ACTIVOS ALCISTAS: ${(bullish || []).join(', ')}
ACTIVOS BAJISTAS: ${(bearish || []).join(', ')}

IMPORTANTE sobre precios del Oro (XAU/USD):
- El broker FBS cotiza el oro en cents, por lo que el precio se ve como ~5200-5300
- Usa precios en ese formato para el oro (multiplica el precio spot por 2 aproximadamente)
- Para todos los demas activos usa precios normales de mercado

Para cada idea incluye:
- direction: "LONG" o "SHORT"
- asset: el activo especifico
- entry: precio de entrada en formato del broker (para oro ~5200-5300)
- stopLoss: nivel de stop loss
- takeProfit: objetivo de precio
- confidence: "Alta" | "Media" | "Baja"
- rationale: explicacion breve de 1-2 oraciones en español

Responde SOLO con JSON valido sin markdown:
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
