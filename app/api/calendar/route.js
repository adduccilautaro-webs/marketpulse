import { NextResponse } from 'next/server'

export async function POST() {
  try {
    const now = new Date()
    const day = now.getDay()
    const monday = new Date(now)
    monday.setDate(now.getDate() - (day === 0 ? 6 : day - 1))
    const weekDates = Array.from({ length: 7 }, function(_, i) {
      const d = new Date(monday)
      d.setDate(monday.getDate() + i)
      return d.toISOString().split('T')[0]
    })

    const prompt = `Eres un analista economico experto. Genera el calendario economico de la semana del ${weekDates[0]} al ${weekDates[6]}.

Incluye los eventos economicos mas importantes de esa semana como:
- Decisiones de tasas de interes (Fed, BCE, BoE, BoJ)
- NFP (Non-Farm Payrolls)
- IPC / CPI (inflacion)
- PIB / GDP
- PMI manufacturero y de servicios
- Ventas minoristas
- Desempleo
- Balanza comercial
- Discursos de bancos centrales importantes

Para cada evento indica la hora en UTC, el pais, impacto estimado y descripcion breve.

Responde SOLO con este JSON sin markdown:
{
  "events": [
    {
      "date": "YYYY-MM-DD",
      "time": "HH:MM UTC",
      "name": "nombre del evento",
      "country": "pais o region",
      "impact": "alto | medio | bajo",
      "previous": "valor anterior si lo conoces",
      "forecast": "estimacion si la conoces",
      "description": "descripcion breve de que mide y por que importa"
    }
  ]
}

Genera entre 15 y 25 eventos reales y relevantes para esa semana. Los eventos deben estar ordenados por fecha y hora.`

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + process.env.GROQ_API_KEY,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        max_tokens: 2000,
        messages: [{ role: 'user', content: prompt }],
      }),
    })

    const data = await response.json()
    const text = data.choices[0].message.content.trim()
    const clean = text.replace(/```json|```/g, '').trim()
    const result = JSON.parse(clean)

    return NextResponse.json({ success: true, ...result, week: { from: weekDates[0], to: weekDates[6] } })
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
