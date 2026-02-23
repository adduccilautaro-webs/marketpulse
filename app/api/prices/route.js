import { NextResponse } from 'next/server'

const SYMBOL_MAP = {
  'OANDA:XAUUSD': 'GC=F',
  'OANDA:XAGUSD': 'SI=F',
  'OANDA:WTICOUSD': 'CL=F',
  'OANDA:BCOUSD': 'BZ=F',
  'OANDA:EURUSD': 'EURUSD=X',
  'OANDA:GBPUSD': 'GBPUSD=X',
  'OANDA:USDJPY': 'JPY=X',
  'OANDA:AUDUSD': 'AUDUSD=X',
  'OANDA:USDCAD': 'CAD=X',
  'OANDA:XCUUSD': 'HG=F',
  'TVC:DXY': 'DX=F',
  'SP:SPX': '^GSPC',
  'NASDAQ:NDX': '^NDX',
  'DJ:DJI': '^DJI',
  'XETR:DAX': '^GDAXI',
  'TVC:NI225': '^N225',
  'BINANCE:BTCUSDT': 'BTC-USD',
  'BINANCE:ETHUSDT': 'ETH-USD',
  'NASDAQ:AAPL': 'AAPL',
  'NASDAQ:TSLA': 'TSLA',
  'NYSE:XOM': 'XOM',
  'NYSE:CVX': 'CVX',
  'NYMEX:NG1!': 'NG=F',
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const symbol = searchParams.get('symbol') || 'OANDA:XAUUSD'
    const yahooSymbol = SYMBOL_MAP[symbol] || 'GC=F'

    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${yahooSymbol}?interval=1d&range=3mo`

    const response = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    })

    const data = await response.json()
    const chart = data.chart.result[0]
    const timestamps = chart.timestamp
    const closes = chart.indicators.quote[0].close
    const opens = chart.indicators.quote[0].open
    const highs = chart.indicators.quote[0].high
    const lows = chart.indicators.quote[0].low

    const candles = timestamps.map(function(t, i) {
      return {
        time: t,
        open: opens[i],
        high: highs[i],
        low: lows[i],
        close: closes[i],
      }
    }).filter(function(c) {
      return c.open && c.high && c.low && c.close
    })

    const lastPrice = closes[closes.length - 1]

    return NextResponse.json({ success: true, candles, lastPrice, symbol: yahooSymbol })
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
