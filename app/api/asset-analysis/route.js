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

async function fetchPriceData(symbol) {
  try {
    const SYMBOL_MAP = {
      'apple': 'AAPL', 'tesla': 'TSLA', 'nvidia': 'NVDA', 'amazon': 'AMZN',
      'google': 'GOOGL', 'microsoft': 'MSFT', 'meta': 'META', 'netflix': 'NFLX',
      'bitcoin': 'BTC-USD', 'btc': 'BTC-USD', 'ethereum': 'ETH-USD', 'eth': 'ETH-USD',
      'gold': 'GC=F', 'oro': 'GC=F', 'silver': 'SI=F', 'plata': 'SI=F',
      'oil': 'CL=F', 'petroleo': 'CL=F', 'wti': 'CL=F', 'brent': 'BZ=F',
      'eurusd': 'EURUSD=X', 'eur/usd': 'EURUSD=X', 'gbpusd': 'GBPUSD=X',
      'usdjpy': 'JPY=X', 'dxy': 'DX=F', 'sp500': '^GSPC', 'spx': '^GSPC',
      'nasdaq': '^IXIC', 'dow': '^DJI', 'dax': '^GDAXI',
      'natural gas': 'NG=F', 'gas natural': 'NG=F', 'copper': 'HG=F', 'cobre': 'HG=F',
    }
    const key = symbol.toLowerCase().trim()
    const ticker = SYMBOL_MAP[key] || symbol.toUpperCase()
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
        volume: quotes.volume[i] || 0,
      }
    }).filter(function(c) { return c.open && c.close })
  } catch (err) {
    return []
  }
}

export async function POST(request) {
  try {
    const body = await request.json()
    const { query, lang } = body

    if (!query) return NextResponse.json({ success: false, error: 'Query requerida' }, { status: 400 })

    const [news, priceData] = await Promise.all([
      fetchNews(query),
      fetchPriceData(query),
    ])

    const newsText = news.length > 0
      ? news.map(function(n, i) { return (i + 1) + '. ' + n.title }).join('\n')
      : 'No se encontraron noticias recientes.'

    const priceText = priceData.length > 0
      ? 'Ultimos 10 dias: ' + priceData.slice(-10).map(function(d) {
          return d.date + ' O:' + d.open + ' H:' + d.high + ' L:' + d.low + ' C:' + d.close
        }).join(' | ')
      : 'No hay datos de precio disponibles.'

    const allPrices = priceData.map(function(d) { return parseFloat(d.close) })
    const recentPrices = allPrices.slice(-30)
    const maxPrice = Math.max.apply(null, recentPrices)
    const minPrice = Math.min.apply(null, recentPrices)
    const currentPrice = allPrices[allPrices.length - 1]
    const priceChange = allPrices.length > 20 ? (((currentPrice - allPrices[allPrices.length - 20]) / allPrices[allPrices.length - 20]) * 100).toFixed(2) : 'N/A'

    const langInstruction = lang === 'en' ? 'Respond entirely in English.' : 'Responde completamente en español.'

    const prompt = `Eres un analista financiero experto con conocimiento profundo de mercados globales y analisis tecnico avanzado.
${langInstruction}

Activo a analizar: "${query}"
Precio actual: ${currentPrice}
Cambio 20 dias: ${priceChange}%
Maximo 30 dias: ${maxPrice}
Minimo 30 dias: ${minPrice}
${priceText}

Noticias recientes:
${newsText}

Genera un analisis completo con este JSON exacto:
{
  "asset": "nombre oficial del activo",
  "type": "Accion | Criptomoneda | Materia Prima | Forex | Indice",
  "fundamental": "analisis fundamental de 3-4 oraciones",
  "technical": "analisis tecnico de 3-4 oraciones sobre tendencia, soportes, resistencias, momentum",
  "chartPatterns": [
    {
      "pattern": "nombre de la figura",
      "type": "alcista | bajista | neutral",
      "reliability": "Alta | Media | Baja",
      "description": "descripcion de la figura y que implica en 2 oraciones",
      "target": "precio objetivo si se confirma"
    }
  ],
  "risks": "principales riesgos en 2-3 oraciones",
  "summary": "conclusion final de 2-3 oraciones",
  "verdict": "COMPRAR | NEUTRAL | VENDER",
  "confidence": "Alta | Media | Baja"
}

Para chartPatterns detecta figuras de esta lista si aplican:
Head & Shoulders, Double Top, Double Bottom, Bull Flag, Bear Flag, Ascending Triangle, Descending Triangle, Cup & Handle, Rising Wedge, Falling Wedge, Hammer, Morning Star, Evening Star, Doji

Si no detectas ninguna figura clara, devuelve chartPatterns como array vacio [].
Responde SOLO con el JSON, sin markdown.`

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
    const analysis = JSON.parse(clean)

    return NextResponse.json({ success: true, asset: query, analysis, news, priceData: priceData.slice(-30) })
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
