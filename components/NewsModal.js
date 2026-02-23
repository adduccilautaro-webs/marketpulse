'use client'
import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import AssetTags from './AssetTags'

const ASSET_TO_TRADINGVIEW = {
  'SPX': 'SP:SPX', 'NDX': 'NASDAQ:NDX', 'DJI': 'DJ:DJI',
  'DAX': 'XETR:DAX', 'IBEX 35': 'BME:IBC', 'CAC 40': 'EURONEXT:PX1',
  'Nikkei': 'TVC:NI225', 'Hang Seng': 'TVC:HSI', 'MSCI EM': 'TVC:MXEF',
  'XAU/USD': 'TVC:GOLD', 'Oro': 'TVC:GOLD', 'Gold': 'TVC:GOLD',
  'XAG/USD': 'TVC:SILVER', 'Plata': 'TVC:SILVER', 'Silver': 'TVC:SILVER',
  'Cobre': 'COMEX:HG1!', 'Litio': 'TVC:LITHIUM',
  'WTI': 'NYMEX:CL1!', 'Brent': 'TVC:UKOIL',
  'Gas Natural': 'NYMEX:NG1!', 'Gas': 'NYMEX:NG1!',
  'EUR/USD': 'FX:EURUSD', 'GBP/USD': 'FX:GBPUSD',
  'USD/JPY': 'FX:USDJPY', 'DXY': 'TVC:DXY',
  'AUD/USD': 'FX:AUDUSD', 'USD/CAD': 'FX:USDCAD',
  'BTC': 'BINANCE:BTCUSDT', 'Bitcoin': 'BINANCE:BTCUSDT',
  'ETH': 'BINANCE:ETHUSDT', 'Ethereum': 'BINANCE:ETHUSDT',
  'AAPL': 'NASDAQ:AAPL', 'Tesla': 'NASDAQ:TSLA',
  'XOM': 'NYSE:XOM', 'CVX': 'NYSE:CVX',
  'SQM': 'NYSE:SQM', 'ALB': 'NYSE:ALB',
}

function getChartSymbol(bullish, bearish) {
  const all = [...bullish, ...bearish]
  for (const asset of all) {
    if (ASSET_TO_TRADINGVIEW[asset]) return ASSET_TO_TRADINGVIEW[asset]
  }
  return 'SP:SPX'
}

export default function NewsModal({ news, onClose }) {
  const [tradingIdeas, setTradingIdeas] = useState(null)
  const [loadingIdeas, setLoadingIdeas] = useState(false)
  const chartSymbol = getChartSymbol(news.bullish || [], news.bearish || [])

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', handler)
      document.body.style.overflow = ''
    }
  }, [onClose])

  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://s3.tradingview.com/tv.js'
    script.async = true
    script.onload = () => {
      if (window.TradingView) {
        new window.TradingView.widget({
          container_id: 'tv_chart',
          symbol: chartSymbol,
          interval: 'D',
          theme: 'dark',
          style: '1',
          locale: 'es',
          toolbar_bg: '#111318',
          enable_publishing: false,
          hide_top_toolbar: false,
          hide_legend: false,
          save_image: false,
          height: 300,
          width: '100%',
        })
      }
    }
    document.head.appendChild(script)
    return () => {
      if (document.head.contains(script)) document.head.removeChild(script)
    }
  }, [chartSymbol])

  async function generateTradingIdeas() {
    setLoadingIdeas(true)
    try {
      const response = await fetch('/api/trading-ideas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          headline: news.headline,
          summary: news.summary,
          bullish: news.bullish,
          bearish: news.bearish,
          impact: news.impact,
        }),
      })
      const data = await response.json()
      setTradingIdeas(data.ideas)
    } catch (err) {
      setTradingIdeas([{ error: 'No se pudieron generar ideas. Intentá de nuevo.' }])
    }
    setLoadingIdeas(false)
  }

  const dateStr = news.publishedAt
    ? format(new Date(news.publishedAt), "d 'de' MMMM yyyy", { locale: es })
    : ''

  const impactColor = news.impact === 'alto' ? 'var(--down)' : news.impact === 'medio' ? 'var(--neutral)' : 'var(--up)'
  const impactBg = news.impact === 'alto' ? 'var(--down-dim)' : news.impact === 'medio' ? 'var(--neutral-dim)' : 'var(--up-dim)'
  const impactBorder = news.impact === 'alto' ? 'rgba(255,77,109,0.25)' : news.impact === 'medio' ? 'rgba(255,209,102,0.25)' : 'rgba(0,230,118,0.25)'

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(10,12,15,0.92)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div onClick={e => e.stopPropagation()} style={{ background: 'var(--surface)', border: '1px solid var(--border)', maxWidth: 700, width: '100%', maxHeight: '90vh', overflowY: 'auto', padding: '2rem', position: 'relative' }}>
        
        <button onClick={onClose} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: '1px solid var(--border)', color: 'var(--muted)', width: 32, height: 32, cursor: 'pointer', fontSize: '1rem', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>

        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
          <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.65rem', fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', background: impactBg, color: impactColor, border: `1px solid ${impactBorder}`, padding: '3px 8px', borderRadius: 2 }}>
            {news.impact === 'alto' ? 'Alto' : news.impact === 'medio' ? 'Medio' : 'Bajo'} impacto
          </span>
          <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.65rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: news.type === 'rumor' ? 'var(--neutral)' : news.type === 'anuncio' ? 'var(--accent)' : 'var(--muted)', border: `1px solid ${news.type === 'rumor' ? 'rgba(255,209,102,0.3)' : news.type === 'anuncio' ? 'rgba(79,195,247,0.3)' : 'var(--border)'}`, padding: '2px 7px', borderRadius: 2 }}>
            {news.type}
          </span>
        </div>

        <h2 style={{ fontFamily: 'DM Serif Display, serif', fontSize: '1.4rem', lineHeight: 1.3, marginBottom: '1rem', color: 'var(--text)' }}>{news.headline}</h2>
        <p style={{ fontSize: '0.88rem', lineHeight: 1.7, color: '#8a93a8', marginBottom: '1.5rem' }}>{news.summary}</p>

        {news.type === 'rumor' && (
          <div style={{ background: 'var(--neutral-dim)', border: '1px solid rgba(255,209,102,0.2)', padding: '0.75rem 1rem', marginBottom: '1.25rem', borderRadius: 2, fontFamily: 'DM Mono, monospace', fontSize: '0.75rem', color: 'var(--neutral)' }}>
            ⚠️ Rumor no confirmado por fuentes oficiales.
          </div>
        )}

        <div style={{ background: 'var(--surface2)', border: '1px solid var(--border)', padding: '1.25rem', marginBottom: '1.25rem' }}>
          <div style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.7rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '1rem' }}>Activos afectados</div>
          <AssetTags bullish={news.bullish} bearish={news.bearish} neutral={news.neutral} />
        </div>

        <div style={{ marginBottom: '1.25rem' }}>
          <div style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.7rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '0.75rem' }}>Gráfico — {chartSymbol}</div>
          <div id="tv_chart" style={{ width: '100%', height: 300, background: 'var(--surface2)', border: '1px solid var(--border)' }} />
        </div>

        <div style={{ marginBottom: '1.25rem' }}>
          <div style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.7rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '0.75rem' }}>Ideas de trading con IA</div>
          {!tradingIdeas && !loadingIdeas && (
            <button onClick={generateTradingIdeas} style={{ fontFamily: 'Syne, sans-serif', fontSize: '0.82rem', fontWeight: 600, background: 'var(--accent-dim)', color: 'var(--accent)', border: '1px solid rgba(79,195,247,0.4)', padding: '10px 20px', borderRadius: 2, cursor: 'pointer', width: '100%' }}>
              ✨ Generar ideas de trading
            </button>
          )}
          {loadingIdeas && (
            <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--muted)', fontFamily: 'DM Mono, monospace', fontSize: '0.8rem' }}>
              Analizando con IA...
            </div>
          )}
          {tradingIdeas && tradingIdeas.map(function(idea, i) {
            return (
              <div key={i} style={{ background: 'var(--surface2)', border: '1px solid var(--border)', padding: '1rem', marginBottom: '0.75rem', borderRadius: 2 }}>
                {idea.error ? (
                  <p style={{ color: 'var(--down)', fontSize: '0.82rem', fontFamily: 'DM Mono, monospace' }}>{idea.error}</p>
                ) : (
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                      <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.8rem', fontWeight: 700, color: idea.direction === 'LONG' ? 'var(--up)' : 'var(--down)' }}>
                        {idea.direction === 'LONG' ? '▲ LONG' : '▼ SHORT'} — {idea.asset}
                      </span>
                      <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.65rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Confianza: {idea.confidence}
                      </span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: '0.75rem' }}>
                      <PriceBox label="Entrada" value={idea.entry} color="var(--accent)" />
                      <PriceBox label="Stop Loss" value={idea.stopLoss} color="var(--down)" />
                      <PriceBox label="Take Profit" value={idea.takeProfit} color="var(--up)" />
                    </div>
                    <p style={{ fontSize: '0.8rem', lineHeight: 1.5, color: '#8a93a8', margin: 0 }}>{idea.rationale}</p>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        <div style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.68rem', color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--muted)', display: 'inline-block' }} />
          {news.source} {dateStr && '· ' + dateStr}
        </div>

        {news.url && (
          <a href={news.url} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block', marginTop: '1rem', fontFamily: 'DM Mono, monospace', fontSize: '0.72rem', color: 'var(--accent)', textDecoration: 'underline' }}>
            Ver artículo original →
          </a>
        )}
      </div>
    </div>
  )
}

function PriceBox(props) {
  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', padding: '0.5rem', textAlign: 'center', borderRadius: 2 }}>
      <div style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.6rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 4 }}>{props.label}</div>
      <div style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.85rem', fontWeight: 700, color: props.color }}>{props.value}</div>
    </div>
  )
}
