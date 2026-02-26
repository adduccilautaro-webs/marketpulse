import { NextResponse } from 'next/server'
import { initParse } from '@/lib/parse'

const SYMBOL_MAP = {
  'Oro': 'GC=F', 'Gold': 'GC=F', 'XAU/USD': 'GC=F',
  'Plata': 'SI=F', 'Silver': 'SI=F',
  'Bitcoin': 'BTC-USD', 'BTC': 'BTC-USD',
  'Ethereum': 'ETH-USD', 'ETH': 'ETH-USD',
  'Apple': 'AAPL', 'AAPL': 'AAPL',
  'Tesla': 'TSLA', 'TSLA': 'TSLA',
  'Nvidia': 'NVDA', 'NVDA': 'NVDA',
  'Amazon': 'AMZN', 'AMZN': 'AMZN',
  'EUR/USD': 'EURUSD=X', 'GBP/USD': 'GBPUSD=X',
  'WTI': 'CL=F', 'Brent': 'BZ=F',
  'Gas Natural': 'NG=F',
  'SPX': '^GSPC', 'NDX': '^IXIC', 'DJI': '^DJI',
}

async function fetchCurrentPrice(asset) {
  try {
    const ticker = SYMBOL_MAP[asset] || asset
    const url = 'https://query1.finance.yahoo.com/v8/finance/chart/' + ticker + '?interval=1d&range=5d'
    const response = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } })
    const data = await response.json()
    const closes = data.chart.result[0].indicators.quote[0].close
    return closes.filter(Boolean).pop()
  } catch (err) {
    return null
  }
}

function getStatus(idea, currentPrice) {
  if (!currentPrice) return 'abierta'
  const entry = parseFloat(idea.entry)
  const tp = parseFloat(idea.takeProfit)
  const sl = parseFloat(idea.stopLoss)
  if (isNaN(entry) || isNaN(tp) || isNaN(sl)) return 'abierta'

  if (idea.direction === 'LONG') {
    if (currentPrice >= tp) return 'tp_alcanzado'
    if (currentPrice <= sl) return 'sl_alcanzado'
    if (currentPrice > entry) return 'ganando'
    if (currentPrice < entry) return 'perdiendo'
  } else {
    if (currentPrice <= tp) return 'tp_alcanzado'
    if (currentPrice >= sl) return 'sl_alcanzado'
    if (currentPrice < entry) return 'ganando'
    if (currentPrice > entry) return 'perdiendo'
  }
  return 'abierta'
}

export async function GET() {
  try {
    const Parse = initParse()
    const TradingIdea = Parse.Object.extend('TradingIdea')
    const query = new Parse.Query(TradingIdea)
    query.descending('createdAt')
    query.limit(100)
    const results = await query.find({ useMasterKey: true })

    const ideas = await Promise.all(results.map(async function(item) {
      const asset = item.get('asset')
      const currentPrice = await fetchCurrentPrice(asset)
      const direction = item.get('direction')
      const entry = item.get('entry')
      const status = getStatus({ direction, entry, takeProfit: item.get('takeProfit'), stopLoss: item.get('stopLoss') }, currentPrice)

      let pnl = null
      if (currentPrice && entry) {
        const entryNum = parseFloat(entry)
        if (!isNaN(entryNum) && entryNum > 0) {
          pnl = direction === 'LONG'
            ? (((currentPrice - entryNum) / entryNum) * 100).toFixed(2)
            : (((entryNum - currentPrice) / entryNum) * 100).toFixed(2)
        }
      }

      return {
        id: item.id,
        asset,
        direction,
        entry,
        stopLoss: item.get('stopLoss'),
        takeProfit: item.get('takeProfit'),
        confidence: item.get('confidence'),
        rationale: item.get('rationale'),
        headline: item.get('headline'),
        source: item.get('source'),
        currentPrice: currentPrice ? currentPrice.toFixed(2) : null,
        status,
        pnl,
        createdAt: item.get('createdAt'),
      }
    }))

    return NextResponse.json({ success: true, ideas })
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function DELETE(request) {
  try {
    const body = await request.json()
    const { id } = body
    const Parse = initParse()
    const TradingIdea = Parse.Object.extend('TradingIdea')
    const query = new Parse.Query(TradingIdea)
    const idea = await query.get(id, { useMasterKey: true })
    await idea.destroy({ useMasterKey: true })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
