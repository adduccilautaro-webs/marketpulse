import { NextResponse } from 'next/server'

async function fetchPriceData(symbol) {
  try {
    const SYMBOL_MAP = {
      'apple': 'AAPL', 'tesla': 'TSLA', 'nvidia': 'NVDA', 'amazon': 'AMZN',
      'google': 'GOOGL', 'microsoft': 'MSFT', 'meta': 'META',
      'bitcoin': 'BTC-USD', 'btc': 'BTC-USD', 'ethereum': 'ETH-USD', 'eth': 'ETH-USD',
      'gold': 'GC=F', 'oro': 'GC=F', 'silver': 'SI=F', 'plata': 'SI=F',
      'oil': 'CL=F', 'petroleo': 'CL=F', 'wti': 'CL=F',
      'eurusd': 'EURUSD=X', 'eur/usd': 'EURUSD=X',
      'sp500': '^GSPC', 'spx': '^GSPC', 'nasdaq': '^IXIC',
    }
    const key = symbol.toLowerCase().trim()
    const ticker = SYMBOL_MAP[key] || symbol.toUpperCase()
    const url = 'https://query1.finance.yahoo.com/v8/finance/chart/' + ticker + '?interval=1d&range=3mo'
    const response = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } })
    const data = await response.json()
    const chart = data.chart.result[0]
    const quotes = chart.indicators.quote[0]
    const closes = quotes.close.filter(Boolean)
    const current = closes[closes.length - 1]
    const prev20 = closes[closes.length - 20]
    const change = prev20 ? (((current - prev20) / prev20) * 100).toFixed(2) : 'N/A'
    const last10 = chart.timestamp.slice(-10).map(function(t, i) {
      return new Date(t * 1000).toISOString().split('T')[0] + ':' + (quotes.close[quotes.close.length - 10 + i] || 0).toFixed(2)
    }).join(' ')
    return { current: current.toFixed(2), change, last10 }
  } catch (err) {
    return { current: 'N/A', change: 'N/A', last10: '' }
  }
}

export async function POST(request) {
  try {
    const body = await request.json()
    const { asset1, asset2, lang } = body

    const [prices1, prices2] = await Promise.all([
      fetchPriceData(asset1),
      fetchPriceData(asset2),
    ])

    const langInstruction = lang === 'en' ? 'Respond entirely in English.' : 'Responde completamente en español.'

    const prompt = `Eres un analista financiero experto. Compara estos dos activos y genera un analisis detallado de cada uno.
${langInstruction}

ACTIVO 1: ${asset1}
Precio actual: ${prices1.current} | Cambio 20d: ${prices1.change}%
Precios recientes: ${prices1.last10}

ACTIVO 2: ${asset2}
Precio actual: ${prices2.current} | Cambio 20d: ${prices2.change}%
Precios recientes: ${prices2.last10}

Genera el siguiente JSON exacto:
{
  "asset1": {
    "name": "nombre oficial",
    "type": "tipo de activo",
    "fundamental": "analisis fundamental en 2-3 oraciones",
    "technical": "analisis tecnico en 2-3 oraciones",
    "chartPattern": {
      "pattern": "figura detectada",
      "type": "alcista | bajista | neutral",
      "description": "descripcion breve"
    },
    "risks": "riesgos principales en 1-2 oraciones",
    "verdict": "COMPRAR | NEUTRAL | VENDER",
    "confidence": "Alta | Media | Baja"
  },
  "asset2": {
    "name": "nombre oficial",
    "type": "tipo de activo",
    "fundamental": "analisis fundamental en 2-3 oraciones",
    "technical": "analisis tecnico en 2-3 oraciones",
    "chartPattern": {
      "pattern": "figura detectada",
      "type": "alcista | bajista | neutral",
      "description": "descripcion breve"
    },
    "risks": "riesgos principales en 1-2 oraciones",
    "verdict": "COMPRAR | NEUTRAL | VENDER",
    "confidence": "Alta | Media | Baja"
  },
  "winner": "nombre del activo ganador",
  "winnerReason": "explicacion de por que este activo es mejor opcion ahora en 2-3 oraciones"
}

Responde SOLO con JSON sin markdown.`

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
