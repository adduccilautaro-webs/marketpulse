'use client'
// components/HeatMap.js

import { useState, useEffect, useCallback } from 'react'

// ─── Sectores ────────────────────────────────────────────────
const SECTORS = [
  {
    id: 'indices',
    label: 'Índices',
    assets: [
      { symbol: 'SPX',  name: 'S&P 500'    },
      { symbol: 'NDX',  name: 'Nasdaq 100'  },
      { symbol: 'DJI',  name: 'Dow Jones'   },
      { symbol: 'DAX',  name: 'DAX'         },
      { symbol: 'NKY',  name: 'Nikkei 225'  },
      { symbol: 'FTSE', name: 'FTSE 100'    },
    ],
  },
  {
    id: 'forex',
    label: 'Forex',
    assets: [
      { symbol: 'DXY',    name: 'DXY'      },
      { symbol: 'EURUSD', name: 'EUR/USD'  },
      { symbol: 'GBPUSD', name: 'GBP/USD'  },
      { symbol: 'USDJPY', name: 'USD/JPY'  },
      { symbol: 'AUDUSD', name: 'AUD/USD'  },
      { symbol: 'USDCAD', name: 'USD/CAD'  },
    ],
  },
  {
    id: 'commodities',
    label: 'Commodities',
    assets: [
      { symbol: 'XAUUSD', name: 'Oro'        },
      { symbol: 'XAGUSD', name: 'Plata'       },
      { symbol: 'WTI',    name: 'WTI Crude'   },
      { symbol: 'BRENT',  name: 'Brent'       },
      { symbol: 'NG',     name: 'Gas Natural' },
      { symbol: 'COPPER', name: 'Cobre'       },
    ],
  },
  {
    id: 'crypto',
    label: 'Crypto',
    assets: [
      { symbol: 'BTC', name: 'Bitcoin'  },
      { symbol: 'ETH', name: 'Ethereum' },
      { symbol: 'SOL', name: 'Solana'   },
      { symbol: 'BNB', name: 'BNB'      },
      { symbol: 'XRP', name: 'XRP'      },
      { symbol: 'ADA', name: 'Cardano'  },
    ],
  },
  {
    id: 'acciones',
    label: 'Acciones',
    assets: [
      { symbol: 'AAPL', name: 'Apple'     },
      { symbol: 'NVDA', name: 'Nvidia'    },
      { symbol: 'MSFT', name: 'Microsoft' },
      { symbol: 'AMZN', name: 'Amazon'    },
      { symbol: 'TSLA', name: 'Tesla'     },
      { symbol: 'META', name: 'Meta'      },
    ],
  },
  {
    id: 'bonos',
    label: 'Bonos',
    assets: [
      { symbol: 'US10Y', name: 'UST 10Y'  },
      { symbol: 'US02Y', name: 'UST 2Y'   },
      { symbol: 'US30Y', name: 'UST 30Y'  },
      { symbol: 'DE10Y', name: 'Bund 10Y' },
    ],
  },
]

// ─── Color según % de cambio ─────────────────────────────────
function heat(pct) {
  if (pct == null) return { bg: 'transparent', text: 'var(--muted)', bar: 'var(--border)' }
  if (pct >=  3)   return { bg: 'rgba(0,230,118,0.18)', text: '#00e676', bar: '#00e676' }
  if (pct >=  1)   return { bg: 'rgba(0,230,118,0.09)', text: '#2ecc71', bar: '#2ecc71' }
  if (pct >= 0.1)  return { bg: 'rgba(0,230,118,0.04)', text: '#1e8449', bar: '#1e8449' }
  if (pct > -0.1)  return { bg: 'transparent',          text: 'var(--muted)', bar: 'var(--border)' }
  if (pct > -1)    return { bg: 'rgba(255,77,109,0.04)', text: '#c0606e', bar: '#c0606e' }
  if (pct > -3)    return { bg: 'rgba(255,77,109,0.10)', text: '#ff4d6d', bar: '#ff4d6d' }
  return               { bg: 'rgba(255,77,109,0.20)', text: '#ff4d6d', bar: '#ff4d6d' }
}

function avg(assets) {
  const v = assets.filter(a => a.pct != null)
  if (!v.length) return null
  return v.reduce((s, a) => s + a.pct, 0) / v.length
}

function fmt(pct) {
  if (pct == null) return '—'
  return (pct >= 0 ? '+' : '') + pct.toFixed(2) + '%'
}

function fmtPrice(p, sym) {
  if (p == null) return ''
  if (['EURUSD','GBPUSD','AUDUSD'].includes(sym)) return p.toFixed(4)
  if (sym === 'USDJPY') return p.toFixed(2)
  if (['US10Y','US02Y','US30Y','DE10Y'].includes(sym)) return p.toFixed(3) + '%'
  if (p >= 1000) return p.toLocaleString('es-AR', { maximumFractionDigits: 2 })
  return p.toFixed(2)
}

// ─── Componente ──────────────────────────────────────────────
export default function HeatMap() {
  const [marketData, setMarketData] = useState({})
  const [loading,    setLoading]    = useState(true)
  const [error,      setError]      = useState(null)
  const [lastUpdate, setLastUpdate] = useState(null)
  const [ticking,    setTicking]    = useState(false)
  const [sector,     setSector]     = useState('all')
  const [hovered,    setHovered]    = useState(null)

  const load = useCallback(async (silent = false) => {
    if (silent) setTicking(true)
    else        setLoading(true)
    setError(null)
    try {
      const r = await fetch('/api/heatmap', { cache: 'no-store' })
      if (!r.ok) throw new Error('Error ' + r.status)
      const j = await r.json()
      if (j.error) throw new Error(j.error)
      setMarketData(j.data || {})
      setLastUpdate(new Date())
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
      setTicking(false)
    }
  }, [])

  useEffect(() => {
    load()
    const iv = setInterval(() => load(true), 60000)
    return () => clearInterval(iv)
  }, [load])

  // Enriquecer sectores con precios en vivo
  const enriched = SECTORS.map(s => ({
    ...s,
    assets: s.assets.map(a => ({
      ...a,
      pct:   marketData[a.symbol]?.pct   ?? null,
      price: marketData[a.symbol]?.price ?? null,
    })),
  }))

  const visible  = sector === 'all' ? enriched : enriched.filter(s => s.id === sector)
  const zoomed   = sector !== 'all'

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '2rem' }}>

      {/* ── CABECERA ── */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>

        <div>
          <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.62rem', letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '0.4rem' }}>
            Mercados Globales · En Vivo
          </div>
          <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: '1.75rem', color: 'var(--text)', lineHeight: 1, margin: 0 }}>
            Mapa de Calor
          </h1>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>

          {/* Leyenda */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {[
              { l: '>+3%', c: heat(4)    },
              { l: '+1%',  c: heat(1.5)  },
              { l: '0%',   c: heat(0)    },
              { l: '−1%',  c: heat(-1.5) },
              { l: '<−3%', c: heat(-4)   },
            ].map(({ l, c }) => (
              <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                <div style={{ width: 9, height: 9, background: c.bg, borderLeft: '2px solid ' + c.bar }} />
                <span style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.58rem', color: 'var(--muted)' }}>{l}</span>
              </div>
            ))}
          </div>

          {/* Status live */}
          {!loading && !error && (
            <span style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.62rem', letterSpacing: '0.08em', background: 'var(--down-dim)', color: 'var(--down)', border: '1px solid rgba(255,77,109,0.25)', padding: '2px 8px', borderRadius: 2 }}>
              ● EN VIVO
            </span>
          )}

          {/* Botón refresh */}
          <button
            onClick={() => load(true)}
            disabled={loading || ticking}
            style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.65rem', background: 'none', border: '1px solid var(--border)', color: ticking ? 'var(--accent)' : 'var(--muted)', padding: '4px 12px', cursor: 'pointer', letterSpacing: '0.05em', transition: 'color .15s' }}
          >
            {ticking ? '↻ ...' : lastUpdate ? '↻ ' + lastUpdate.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '↻ Actualizar'}
          </button>
        </div>
      </div>

      {/* ── FILTROS DE SECTOR ── */}
      <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {[{ id: 'all', label: 'Todos los sectores' }, ...SECTORS].map(s => {
          const active   = sector === s.id
          const sEnriched = enriched.find(e => e.id === s.id)
          const sAvg     = sEnriched ? avg(sEnriched.assets) : null
          const c        = heat(sAvg)
          return (
            <button
              key={s.id}
              onClick={() => setSector(s.id)}
              style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.65rem', letterSpacing: '0.06em', textTransform: 'uppercase', padding: '5px 12px', border: '1px solid ' + (active ? 'var(--accent)' : 'var(--border)'), background: active ? 'var(--accent-dim)' : 'transparent', color: active ? 'var(--accent)' : 'var(--muted)', cursor: 'pointer', transition: 'all .15s', display: 'flex', alignItems: 'center', gap: 6 }}
            >
              {s.label}
              {sAvg != null && s.id !== 'all' && (
                <span style={{ color: c.text, fontSize: '0.6rem' }}>{fmt(sAvg)}</span>
              )}
            </button>
          )
        })}
      </div>

      {/* ── LOADING ── */}
      {loading && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1px', background: 'var(--border)' }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} style={{ height: 220, background: 'var(--surface)', opacity: 0.5, animation: 'mp-shimmer 1.4s ease-in-out infinite', animationDelay: i * 0.1 + 's' }} />
          ))}
        </div>
      )}

      {/* ── ERROR ── */}
      {error && !loading && (
        <div style={{ border: '1px solid rgba(255,77,109,0.3)', background: 'var(--down-dim)', padding: '1rem 1.25rem', fontFamily: "'DM Mono', monospace", fontSize: '0.78rem', color: 'var(--down)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span>⚠ Error: {error}</span>
          <button onClick={() => load()} style={{ background: 'none', border: '1px solid var(--down)', color: 'var(--down)', fontFamily: "'DM Mono', monospace", fontSize: '0.65rem', padding: '3px 10px', cursor: 'pointer' }}>
            Reintentar
          </button>
        </div>
      )}

      {/* ── GRILLA DE SECTORES ── */}
      {!loading && !error && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: zoomed ? '1fr' : 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1px', background: 'var(--border)' }}>
            {visible.map(sec => {
              const secAvg = avg(sec.assets)
              const secC   = heat(secAvg)

              return (
                <div key={sec.id} style={{ background: 'var(--surface)', display: 'flex', flexDirection: 'column' }}>

                  {/* Header de sector */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.6rem 0.85rem', borderBottom: '1px solid var(--border)', background: 'var(--surface2)' }}>
                    <span style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text)' }}>
                      {sec.label}
                    </span>
                    {secAvg != null && (
                      <span style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.7rem', fontWeight: 700, color: secC.text, background: secC.bg, border: '1px solid ' + (secC.bar !== 'var(--border)' ? secC.bar + '44' : 'var(--border)'), padding: '2px 8px' }}>
                        {fmt(secAvg)}
                      </span>
                    )}
                  </div>

                  {/* Grid de celdas */}
                  <div style={{ display: 'grid', gridTemplateColumns: zoomed ? 'repeat(auto-fill, minmax(160px, 1fr))' : 'repeat(3, 1fr)', gap: '1px', background: 'var(--border)', flex: 1 }}>
                    {sec.assets.map(asset => {
                      const c   = heat(asset.pct)
                      const key = sec.id + asset.symbol
                      const isH = hovered === key

                      return (
                        <div
                          key={asset.symbol}
                          onMouseEnter={() => setHovered(key)}
                          onMouseLeave={() => setHovered(null)}
                          style={{ background: isH ? (asset.pct >= 0 ? 'rgba(0,230,118,0.12)' : 'rgba(255,77,109,0.12)') : (c.bg || 'var(--surface)'), padding: zoomed ? '1rem 1.2rem' : '0.75rem 0.65rem', transition: 'background .12s', position: 'relative', display: 'flex', flexDirection: 'column', gap: 3 }}
                        >
                          {/* Barra izquierda de intensidad */}
                          <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 2, background: c.bar }} />

                          <div style={{ fontFamily: "'DM Mono', monospace", fontSize: zoomed ? '0.75rem' : '0.62rem', fontWeight: 700, letterSpacing: '0.04em', color: 'var(--text)' }}>
                            {asset.symbol}
                          </div>

                          <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.58rem', color: 'var(--muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {asset.name}
                          </div>

                          {/* % cambio — dato principal */}
                          <div style={{ fontFamily: "'DM Mono', monospace", fontSize: zoomed ? '1.1rem' : '0.9rem', fontWeight: 700, color: c.text, lineHeight: 1, marginTop: 2 }}>
                            {fmt(asset.pct)}
                          </div>

                          {/* Precio — solo en zoom */}
                          {zoomed && asset.price != null && (
                            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.65rem', color: 'var(--muted)', marginTop: 2 }}>
                              {fmtPrice(asset.price, asset.symbol)}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>

          {/* ── BARRA RESUMEN GLOBAL (solo vista "Todos") ── */}
          {!zoomed && (
            <div style={{ marginTop: '1px', display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '1px', background: 'var(--border)' }}>
              {enriched.map(sec => {
                const secAvg = avg(sec.assets)
                const c = heat(secAvg)
                return (
                  <button
                    key={sec.id}
                    onClick={() => setSector(sec.id)}
                    style={{ padding: '0.65rem 0.75rem', background: c.bg || 'var(--surface2)', borderLeft: '2px solid ' + c.bar, cursor: 'pointer', border: 'none', textAlign: 'left', transition: 'opacity .12s' }}
                    onMouseEnter={e => e.currentTarget.style.opacity = '0.75'}
                    onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                  >
                    <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.58rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 4 }}>
                      {sec.label}
                    </div>
                    <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.9rem', fontWeight: 700, color: c.text }}>
                      {fmt(secAvg)}
                    </div>
                  </button>
                )
              })}
            </div>
          )}

          {/* Nota de fuente */}
          <div style={{ marginTop: '0.75rem', fontFamily: "'DM Mono', monospace", fontSize: '0.58rem', color: 'var(--muted)', display: 'flex', gap: '0.75rem' }}>
            <span>Fuente: Yahoo Finance</span>
            <span>·</span>
            <span>Auto-actualización cada 60s</span>
            {lastUpdate && (
              <>
                <span>·</span>
                <span>Último update: {lastUpdate.toLocaleTimeString('es-AR')}</span>
              </>
            )}
          </div>
        </>
      )}

      <style>{`
        @keyframes mp-shimmer {
          0%, 100% { opacity: 0.35; }
          50%       { opacity: 0.6; }
        }
      `}</style>
    </div>
  )
}
