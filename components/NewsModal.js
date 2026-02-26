'use client'
import { useEffect, useState, useRef } from 'react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import AssetTags from './AssetTags'

const ASSET_TO_SYMBOL = {
  'XAU/USD': 'OANDA:XAUUSD', 'Oro': 'OANDA:XAUUSD', 'Gold': 'OANDA:XAUUSD',
  'XAG/USD': 'OANDA:XAGUSD', 'Plata': 'OANDA:XAGUSD', 'Silver': 'OANDA:XAGUSD',
  'WTI': 'OANDA:WTICOUSD', 'Brent': 'OANDA:BCOUSD',
  'EUR/USD': 'OANDA:EURUSD', 'GBP/USD': 'OANDA:GBPUSD',
  'USD/JPY': 'OANDA:USDJPY', 'DXY': 'TVC:DXY',
  'AUD/USD': 'OANDA:AUDUSD', 'USD/CAD': 'OANDA:USDCAD',
  'Cobre': 'OANDA:XCUUSD',
  'SPX': 'SP:SPX', 'NDX': 'NASDAQ:NDX', 'DJI': 'DJ:DJI',
  'DAX': 'XETR:DAX', 'Nikkei': 'TVC:NI225',
  'BTC': 'BINANCE:BTCUSDT', 'Bitcoin': 'BINANCE:BTCUSDT',
  'ETH': 'BINANCE:ETHUSDT', 'Ethereum': 'BINANCE:ETHUSDT',
  'AAPL': 'NASDAQ:AAPL', 'Tesla': 'NASDAQ:TSLA',
  'XOM': 'NYSE:XOM', 'CVX': 'NYSE:CVX',
  'Gas Natural': 'NYMEX:NG1!', 'Gas': 'NYMEX:NG1!',
}

function getSymbol(bullish, bearish) {
  const all = [...bullish, ...bearish]
  for (const asset of all) {
    if (ASSET_TO_SYMBOL[asset]) return ASSET_TO_SYMBOL[asset]
  }
  return 'OANDA:XAUUSD'
}

export default function NewsModal({ news, onClose }) {
  const [tradingIdeas, setTradingIdeas] = useState(null)
  const [loadingIdeas, setLoadingIdeas] = useState(false)
  const [chartData, setChartData] = useState(null)
  const [lastPrice, setLastPrice] = useState(null)
  const [savedIdeas, setSavedIdeas] = useState({})
  const chartRef = useRef(null)
  const symbol = getSymbol(news.bullish || [], news.bearish || [])

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
    fetch('/api/prices?symbol=' + symbol)
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          setChartData(data.candles)
          setLastPrice(data.lastPrice)
        }
      })
      .catch(() => {})
  }, [symbol])

  useEffect(() => {
    if (!chartData || !chartRef.current) return
    function renderChart() {
      if (!window.LightweightCharts || !chartRef.current) return
      chartRef.current.innerHTML = ''
      const chart = window.LightweightCharts.createChart(chartRef.current, {
        width: chartRef.current.offsetWidth || 600,
        height: 240,
        layout: { background: { color: '#111318' }, textColor: '#8a93a8' },
        grid: { vertLines: { color: '#1e2430' }, horzLines: { color: '#1e2430' } },
        rightPriceScale: { borderColor: '#1e2430' },
        timeScale: { borderColor: '#1e2430', timeVisible: true },
      })
      const series = chart.addCandlestickSeries({
        upColor: '#00e676', downColor: '#ff4d6d',
        borderUpColor: '#00e676', borderDownColor: '#ff4d6d',
        wickUpColor: '#00e676', wickDownColor: '#ff4d6d',
      })
      series.setData(chartData)
      chart.timeScale().fitContent()
    }
    if (window.LightweightCharts) {
      renderChart()
    } else {
      const script = document.createElement('script')
      script.src = 'https://unpkg.com/lightweight-charts@3.8.0/dist/lightweight-charts.standalone.production.js'
      script.async = true
      script.onload = renderChart
      document.head.appendChild(script)
    }
  }, [chartData])

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

  async function saveIdea(idea, index) {
    try {
      const response = await fetch('/api/ideas/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          asset: idea.asset,
          direction: idea.direction,
          entry: idea.entry,
          stopLoss: idea.stopLoss,
          takeProfit: idea.takeProfit,
          confidence: idea.confidence,
          rationale: idea.rationale,
          headline: news.headline,
          source: news.source,
        }),
      })
      const data = await response.json()
      if (data.success) {
        setSavedIdeas(function(prev) { return { ...prev, [index]: true } })
      }
    } catch (err) {}
  }

  const dateStr = news.publishedAt
    ? format(new Date(news.publishedAt), "d 'de' MMMM yyyy", { locale: es })
    : ''

  const impactColor = news.impact === 'alto' ? 'var(--down)' : news.impact === 'medio' ? 'var(--neutral)' : 'var(--up)'
  const impactBg = news.impact === 'alto' ? 'var(--down-dim)' : news.impact === 'medio' ? 'var(--neutral-dim)' : 'var(--up-dim)'
  const impactBorder = news.impact === 'alto' ? 'rgba(255,77,109,0.25)' : news.impact === 'medio' ? 'rgba(255,209,102,0.25)' : 'rgba(0,230,118,0.25)'

  return (
    <>
      <style>{`
        .modal-inner {
          background: var(--surface);
          border: 1px solid var(--border);
          max-width: 700px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
          padding: 2rem;
          position: relative;
        }
        @media (max-width: 768px) {
          .modal-overlay {
            padding: 0 !important;
            align-items: flex-end !important;
          }
          .modal-inner {
            max-height: 92vh;
            border-radius: 12px 12px 0 0;
            padding: 1.25rem 1.1rem 2rem;
            border-bottom: none;
          }
          .modal-close-btn {
            width: 44px !important;
            height: 44px !important;
            font-size: 1.3rem !important;
          }
          .modal-title {
            font-size: 1.2rem !important;
            padding-right: 2.5rem;
          }
          .price-grid {
            grid-template-columns: 1fr 1fr 1fr !important;
          }
        }
      `}</style>
      <div
        onClick={onClose}
        className="modal-overlay"
        style={{ position: 'fixed', inset: 0, background: 'rgba(10,12,15,0.92)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
      >
        <div onClick={e => e.stopPropagation()} className="modal-inner">

          <button
            onClick={onClose}
            className="modal-close-btn"
            style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--text)', width: 36, height: 36, cursor: 'pointer', fontSize: '1rem', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}
          >
            ✕
          </button>

          <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
            <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.65rem', fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', background: impactBg, color: impactColor, border: '1px solid ' + impactBorder, padding: '3px 8px', borderRadius: 2 }}>
              {news.impact === 'alto' ? 'Alto' : news.impact === 'medio' ? 'Medio' : 'Bajo'} impacto
            </span>
            <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.65rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: news.type === 'rumor' ? 'var(--neutral)' : news.type === 'anuncio' ? 'var(--accent)' : 'var(--muted)', border: '1px solid ' + (news.type === 'rumor' ? 'rgba(255,209,102,0.3)' : news.type === 'anuncio' ? 'rgba(79,195,247,0.3)' : 'var(--border)'), padding: '2px 7px', borderRadius: 2 }}>
              {news.type}
            </span>
          </div>

          <h2 className="modal-title" style={{ fontFamily: 'DM Serif Display, serif', fontSize: '1.4rem', lineHeight: 1.3, marginBottom: '1rem', color: 'var(--text)' }}>{news.headline}</h2>
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
            <div style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.7rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Grafico 3 meses</span>
              {lastPrice && <span style={{ color: 'var(--up)', fontSize: '0.85rem', fontWeight: 700 }}>{lastPrice.toFixed(2)}</span>}
            </div>
            <div ref={chartRef} style={{ width: '100%', height: 240, background: 'var(--surface2)', border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--muted)', fontFamily: 'DM Mono, monospace', fontSize: '0.8rem' }}>Cargando grafico...</div>
            </div>
          </div>

          <div style={{ marginBottom: '1.25rem' }}>
            <div style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.7rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '0.75rem' }}>Ideas de trading con IA</div>
            {!tradingIdeas && !loadingIdeas && (
              <button onClick={generateTradingIdeas} style={{ fontFamily: 'Syne, sans-serif', fontSize: '0.85rem', fontWeight: 600, background: 'var(--accent-dim)', color: 'var(--accent)', border: '1px solid rgba(79,195,247,0.4)', padding: '12px 20px', borderRadius: 2, cursor: 'pointer', width: '100%' }}>
                Generar ideas de trading
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
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem', flexWrap: 'wrap', gap: 6 }}>
                        <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.85rem', fontWeight: 700, color: idea.direction === 'LONG' ? 'var(--up)' : 'var(--down)' }}>
                          {idea.direction === 'LONG' ? '▲ LONG' : '▼ SHORT'} — {idea.asset}
                        </span>
                        <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.65rem', color: 'var(--muted)', textTransform: 'uppercase' }}>
                          Confianza: {idea.confidence}
                        </span>
                      </div>
                      <div className="price-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: '0.75rem' }}>
                        <PriceBox label="Entrada" value={idea.entry} color="var(--accent)" />
                        <PriceBox label="Stop Loss" value={idea.stopLoss} color="var(--down)" />
                        <PriceBox label="Take Profit" value={idea.takeProfit} color="var(--up)" />
                      </div>
                      <p style={{ fontSize: '0.8rem', lineHeight: 1.5, color: '#8a93a8', margin: 0, marginBottom: '0.75rem' }}>{idea.rationale}</p>
                      <button
                        onClick={function() { saveIdea(idea, i) }}
                        disabled={savedIdeas[i]}
                        style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.7rem', fontWeight: 500, background: savedIdeas[i] ? 'var(--up-dim)' : 'var(--surface)', color: savedIdeas[i] ? 'var(--up)' : 'var(--muted)', border: '1px solid ' + (savedIdeas[i] ? 'rgba(0,230,118,0.3)' : 'var(--border)'), padding: '6px 14px', borderRadius: 2, cursor: savedIdeas[i] ? 'default' : 'pointer', textTransform: 'uppercase', letterSpacing: '0.05em' }}
                      >
                        {savedIdeas[i] ? '✓ Guardada' : '+ Guardar idea'}
                      </button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          <div style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.68rem', color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--muted)', display: 'inline-block' }} />
            {news.source} {dateStr && '· ' + dateStr}
          </div>

          {news.url && (
            <a href={news.url} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block', marginTop: '1rem', fontFamily: 'DM Mono, monospace', fontSize: '0.72rem', color: 'var(--accent)', textDecoration: 'underline' }}>
              Ver articulo original →
            </a>
          )}
        </div>
      </div>
    </>
  )
}

function PriceBox(props) {
  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', padding: '0.5rem', textAlign: 'center', borderRadius: 2 }}>
      <div style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.6rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 4 }}>{props.label}</div>
      <div style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.82rem', fontWeight: 700, color: props.color }}>{props.value}</div>
    </div>
  )
}
