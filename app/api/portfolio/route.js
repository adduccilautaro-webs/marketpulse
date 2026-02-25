import { NextResponse } from 'next/server'
import { initParse } from '@/lib/parse'

async function fetchPriceData(symbol) {
  try {
    const SYMBOL_MAP = {
      'AAPL': 'AAPL', 'TSLA': 'TSLA', 'NVDA': 'NVDA', 'AMZN': 'AMZN',
      'GOOGL': 'GOOGL', 'MSFT': 'MSFT', 'META': 'META',
      'BTC': 'BTC-USD', 'ETH': 'ETH-USD',
      'Gold': 'GC=F', 'Silver': 'SI=F',
      'Oil': 'CL=F', 'WTI': 'CL=F',
      'EUR/USD': 'EURUSD=X', 'SPX': '^GSPC',
    }
    const ticker = SYMBOL_MAP[symbol] || symbol
    const url = 'https://query1.finance.yahoo.com/v8/finance/chart/' + ticker + '?interval=1d&range=3mo'
    const response = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } })
    const data = await response.json()
    const chart = data.chart.result[0]
    const timestamps = chart.timestamp
    const quotes = chart.indicators.quote[0]
    return timestamps.map(function(t, i) {
      return {
        date: new Date(t * 1000).toISOString().split('T')[0],
        open: quotes.open[i] ? quotes.open[i].toFixed(2) : null,
        high: quotes.high[i] ? quotes.high[i].toFixed(2) : null,
        low: quotes.low[i] ? quotes.low[i].toFixed(2) : null,
        close: quotes.close[i] ? quotes.close[i].toFixed(2) : null,
      }
    }).filter(function(c) { return c.open && c.close })
  } catch (err) {
    return []
  }
}

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

    const defaultAssets = ['AAPL', 'NVDA', 'BTC', 'Gold', 'EUR/USD', 'TSLA', 'ETH']
    const priceDataAll = await Promise.all(defaultAssets.map(async function(asset) {
      const prices = await fetchPriceData(asset)
      const closes = prices.map(function(p) { return parseFloat(p.close) })
      const current = closes[closes.length - 1]
      const prev20 = closes[closes.length - 20]
      const change = prev20 ? (((current - prev20) / prev20) * 100).toFixed(2) : 'N/A'
      const last10 = prices.slice(-10).map(function(d) {
        return d.date + ' C:' + d.close
      }).join(' | ')
      return { asset, current, change, last10 }
    }))

    const priceText = priceDataAll.map(function(p) {
      return p.asset + ': precio=' + p.current + ' cambio20d=' + p.change + '% | ' + p.last10
    }).join('\n')

    const langInstruction = lang === 'en' ? 'Respond entirely in English.' : 'Responde completamente en español.'

    const prompt = `Eres un gestor de portfolio profesional con experiencia en mercados globales y analisis tecnico avanzado.
${langInstruction}

Basandote en las noticias recientes Y en los datos de precio de los activos, genera un portfolio de inversion recomendado con analisis de figuras chartistas.

NOTICIAS RECIENTES:
${newsText}

DATOS DE PRECIO (ultimos 10 dias):
${priceText}

Genera un portfolio diversificado con este JSON exacto:
{
  "context": "resumen del contexto de mercado actual en 2-3 oraciones",
  "positions": [
    {
      "asset": "nombre del activo",
      "ticker": "ticker del activo",
      "type": "Accion | Cripto | Materia Prima | Forex | ETF",
      "allocation": 25,
      "risk": "Bajo | Medio | Alto",
      "rationale": "razon de la recomendacion en 1-2 oraciones",
      "chartPattern": {
        "pattern": "nombre de la figura o null si no hay",
        "type": "alcista | bajista | neutral",
        "reliability": "Alta | Media | Baja",
        "description": "descripcion breve de la figura en 1 oracion"
      }
    }
  ],
  "avoid": [
    {
      "asset": "nombre del activo",
      "reason": "razon para evitarlo",
      "chartPattern": "figura chartista negativa detectada si aplica"
    }
  ],
  "disclaimer": "Este analisis es solo informativo y no constituye asesoramiento financiero profesional."
}

Reglas:
- Incluí entre 5 y 7 posiciones
- Los porcentajes deben sumar exactamente 100
- Incluí 2-3 activos a evitar
- Detecta figuras chartistas reales basandote en los datos de precio
- Responde SOLO con el JSON, sin markdown`

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
    const portfolio = JSON.parse(clean)

    return NextResponse.json({ success: true, ...portfolio })
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
