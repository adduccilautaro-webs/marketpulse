import { NextResponse } from 'next/server'

async function fetchPrice(ticker) {
  try {
    const url = 'https://query1.finance.yahoo.com/v8/finance/chart/' + ticker + '?interval=1d&range=5d'
    const response = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } })
    const data = await response.json()
    const closes = data.chart.result[0].indicators.quote[0].close
    return closes.filter(Boolean).pop()
  } catch (err) {
    return null
  }
}

export async function POST(request) {
  try {
    const body = await request.json()
    const { amount, currency, risk } = body

    const assetsByRisk = {
      bajo: [
        { asset: 'Oro', ticker: 'GC=F', type: 'Materia Prima' },
        { asset: 'S&P 500 ETF', ticker: '^GSPC', type: 'Indice' },
        { asset: 'EUR/USD', ticker: 'EURUSD=X', type: 'Forex' },
        { asset: 'Microsoft', ticker: 'MSFT', type: 'Accion' },
        { asset: 'Plata', ticker: 'SI=F', type: 'Materia Prima' },
      ],
      medio: [
        { asset: 'Apple', ticker: 'AAPL', type: 'Accion' },
        { asset: 'Nvidia', ticker: 'NVDA', type: 'Accion' },
        { asset: 'Oro', ticker: 'GC=F', type: 'Materia Prima' },
        { asset: 'Bitcoin', ticker: 'BTC-USD', type: 'Cripto' },
        { asset: 'S&P 500', ticker: '^GSPC', type: 'Indice' },
        { asset: 'Petroleo WTI', ticker: 'CL=F', type: 'Materia Prima' },
      ],
      alto: [
        { asset: 'Bitcoin', ticker: 'BTC-USD', type: 'Cripto' },
        { asset: 'Ethereum', ticker: 'ETH-USD', type: 'Cripto' },
        { asset: 'Nvidia', ticker: 'NVDA', type: 'Accion' },
        { asset: 'Tesla', ticker: 'TSLA', type: 'Accion' },
        { asset: 'Oro', ticker: 'GC=F', type: 'Materia Prima' },
        { asset: 'Amazon', ticker: 'AMZN', type: 'Accion' },
      ],
    }

    const assets = assetsByRisk[risk] || assetsByRisk.medio
    const prices = await Promise.all(assets.map(async function(a) {
      const price = await fetchPrice(a.ticker)
      return { ...a, price }
    }))

    const priceText = prices.map(function(p) {
      return p.asset + ': ' + (p.price ? p.price.toFixed(2) + ' USD' : 'precio no disponible')
    }).join('\n')

    const prompt = `Eres un asesor financiero experto. El usuario tiene ${amount} ${currency} para invertir con perfil de riesgo ${risk}.

Precios actuales de mercado:
${priceText}

Genera una asignacion optima de capital con este JSON exacto:
{
  "context": "analisis del mercado actual en 1-2 oraciones",
  "allocations": [
    {
      "asset": "nombre del activo",
      "type": "tipo de activo",
      "percentage": 30,
      "amount": 300,
      "currentPrice": "precio actual en USD",
      "units": "cuantas unidades puede comprar con esa cantidad",
      "rationale": "por que incluir este activo en 1 oracion"
    }
  ],
  "disclaimer": "Este analisis es solo informativo y no constituye asesoramiento financiero profesional."
}

Reglas:
- Los porcentajes deben sumar exactamente 100
- El campo amount debe ser el porcentaje del total: ${amount} ${currency}
- Calcula las unidades usando el precio actual
- Para oro divide por 100 si el precio parece estar en cents
- Responde SOLO con JSON sin markdown`

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + process.env.GROQ_API_KEY,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        max_tokens: 1500,
        messages: [{ role: 'user', content: prompt }],
      }),
    })

    const data = await response.json()
    const text = data.choices[0].message.content.trim()
    const clean = text.replace(/```json|```/g, '').trim()
    const result = JSON.parse(clean)

    return NextResponse.json({ success: true, ...result })
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
