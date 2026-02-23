// lib/analyzer.js
export async function analyzeNewsImpact(headline, summary) {
  const prompt = `Eres un analista financiero experto. Se te dará el titular y resumen de una noticia financiera.

Tu tarea:
1. Clasificar el tipo: "noticia" | "anuncio" | "rumor"
2. Clasificar el nivel de impacto: "alto" | "medio" | "bajo"
3. Listar activos que podrían SUBIR (bullish)
4. Listar activos que podrían BAJAR (bearish)
5. Dar una categoría: "indices" | "divisas" | "metales" | "energia" | "cripto" | "acciones" | "bonos"

TITULAR: ${headline}
RESUMEN: ${summary}

Responde SOLO con JSON válido, sin explicaciones:
{
  "type": "noticia|anuncio|rumor",
  "impact": "alto|medio|bajo",
  "category": "categoria",
  "bullish": ["ACTIVO1", "ACTIVO2"],
  "bearish": ["ACTIVO1"],
  "neutral": []
}`

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      max_tokens: 500,
      messages: [{ role: 'user', content: prompt }],
    }),
  })

  if (!response.ok) {
    throw new Error(`Groq API error: ${response.status}`)
  }

  const data = await response.json()
  const text = data.choices[0].message.content.trim()
  const clean = text.replace(/```json|```/g, '').trim()
  return JSON.parse(clean)
}