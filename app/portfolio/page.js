'use client'
import { useState } from 'react'
import Header from '@/components/Header'

export default function PortfolioPage() {
  const [loading, setLoading] = useState(false)
  const [portfolio, setPortfolio] = useState(null)
  const [error, setError] = useState(null)
  const [lang, setLang] = useState('es')

  async function generate() {
    setLoading(true)
    setPortfolio(null)
    setError(null)
    try {
      const response = await fetch('/api/portfolio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lang }),
      })
      const data = await response.json()
      if (data.success) {
        setPortfolio(data)
      } else {
        setError(data.error || 'Error al generar el portfolio.')
      }
    } catch (err) {
      setError('Error de conexion. Intentá de nuevo.')
    }
    setLoading(false)
  }

  const riskColor = { 'Bajo': 'var(--up)', 'Medio': 'var(--neutral)', 'Alto': 'var(--down)' }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Header />
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '3rem 2rem' }}>

        <div style={{ marginBottom: '2.5rem' }}>
          <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: '2rem', color: 'var(--text)', marginBottom: '0.5rem' }}>
            Portfolio Recomendado
          </h1>
          <p style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.8rem', color: 'var(--muted)', letterSpacing: '0.05em' }}>
            Noticias actuales · Datos de precio · Figuras chartistas · IA
          </p>
        </div>

        <div style={{ display: 'flex', gap: 8, marginBottom: '1.5rem', alignItems: 'center' }}>
          <button onClick={() => setLang('es')} style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.72rem', fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', background: lang === 'es' ? 'var(--accent-dim)' : 'var(--surface)', color: lang === 'es' ? 'var(--accent)' : 'var(--muted)', border: lang === 'es' ? '1px solid rgba(79,195,247,0.3)' : '1px solid var(--border)', padding: '5px 14px', borderRadius: 2, cursor: 'pointer' }}>Español</button>
          <button onClick={() => setLang('en')} style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.72rem', fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', background: lang === 'en' ? 'var(--accent-dim)' : 'var(--surface)', color: lang === 'en' ? 'var(--accent)' : 'var(--muted)', border: lang === 'en' ? '1px solid rgba(79,195,247,0.3)' : '1px solid var(--border)', padding: '5px 14px', borderRadius: 2, cursor: 'pointer' }}>English</button>
          <button onClick={generate} disabled={loading} style={{ marginLeft: 'auto', fontFamily: "'Syne', sans-serif", fontSize: '0.85rem', fontWeight: 600, background: loading ? 'var(--surface)' : 'var(--accent-dim)', color: loading ? 'var(--muted)' : 'var(--accent)', border: '1px solid rgba(79,195,247,0.4)', padding: '10px 24px', borderRadius: 2, cursor: loading ? 'not-allowed' : 'pointer' }}>
            {loading ? 'Generando...' : '✨ Generar Portfolio'}
          </button>
        </div>

        {error && (
          <div style={{ background: 'var(--down-dim)', border: '1px solid rgba(255,77,109,0.25)', padding: '1rem', borderRadius: 2, color: 'var(--down)', fontFamily: "'DM Mono', monospace", fontSize: '0.82rem' }}>{error}</div>
        )}

        {loading && (
          <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--muted)', fontFamily: "'DM Mono', monospace", fontSize: '0.85rem' }}>
            <div style={{ marginBottom: '1rem', fontSize: '2rem' }}>⟳</div>
            Analizando mercado, precios y figuras chartistas con IA...
          </div>
        )}

        {portfolio && (
          <div>
            {portfolio.context && (
              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', padding: '1.25rem', marginBottom: '1rem', borderRadius: 2 }}>
                <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.7rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '0.5rem' }}>Contexto de mercado</div>
                <p style={{ fontSize: '0.85rem', lineHeight: 1.6, color: 'var(--text)', margin: 0 }}>{portfolio.context}</p>
              </div>
            )}

            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', padding: '1.25rem', marginBottom: '1rem' }}>
              <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.7rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '1rem' }}>Composicion del Portfolio</div>
              {portfolio.positions && portfolio.positions.map(function(pos, i) {
                const cp = pos.chartPattern
                const cpColor = cp && cp.type === 'alcista' ? 'var(--up)' : cp && cp.type === 'bajista' ? 'var(--down)' : 'var(--neutral)'
                const cpBg = cp && cp.type === 'alcista' ? 'var(--up-dim)' : cp && cp.type === 'bajista' ? 'var(--down-dim)' : 'var(--neutral-dim)'
                return (
                  <div key={i} style={{ borderTop: i > 0 ? '1px solid var(--border)' : 'none', paddingTop: i > 0 ? '1.25rem' : 0, marginTop: i > 0 ? '1.25rem' : 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.9rem', fontWeight: 700, color: 'var(--accent)' }}>{pos.asset}</span>
                        <span style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.65rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{pos.type}</span>
                        <span style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.65rem', color: riskColor[pos.risk] || 'var(--muted)', textTransform: 'uppercase' }}>Riesgo {pos.risk}</span>
                      </div>
                      <span style={{ fontFamily: "'DM Mono', monospace", fontSize: '1.2rem', fontWeight: 700, color: 'var(--up)' }}>{pos.allocation}%</span>
                    </div>
                    <div style={{ background: 'var(--border)', height: 4, borderRadius: 2, marginBottom: '0.75rem' }}>
                      <div style={{ background: 'var(--accent)', height: 4, borderRadius: 2, width: pos.allocation + '%', transition: 'width 0.5s ease' }} />
                    </div>
                    <p style={{ fontSize: '0.82rem', lineHeight: 1.5, color: '#8a93a8', margin: 0, marginBottom: cp && cp.pattern ? '0.75rem' : 0 }}>{pos.rationale}</p>
                    {cp && cp.pattern && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginTop: '0.5rem' }}>
                        <span style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.65rem', background: cpBg, color: cpColor, border: '1px solid ' + cpColor + '44', padding: '2px 8px', borderRadius: 2, textTransform: 'uppercase' }}>
                          {cp.type === 'alcista' ? '▲' : cp.type === 'bajista' ? '▼' : '◆'} {cp.pattern}
                        </span>
                        <span style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.65rem', color: 'var(--muted)' }}>Fiabilidad: {cp.reliability}</span>
                        <span style={{ fontSize: '0.75rem', color: '#8a93a8' }}>{cp.description}</span>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {portfolio.avoid && portfolio.avoid.length > 0 && (
              <div style={{ background: 'var(--surface)', border: '1px solid rgba(255,77,109,0.2)', padding: '1.25rem', marginBottom: '1rem' }}>
                <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.7rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--down)', marginBottom: '1rem' }}>Activos a Evitar</div>
                {portfolio.avoid.map(function(item, i) {
                  return (
                    <div key={i} style={{ borderTop: i > 0 ? '1px solid var(--border)' : 'none', paddingTop: i > 0 ? '0.75rem' : 0, marginTop: i > 0 ? '0.75rem' : 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '0.25rem' }}>
                        <span style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.85rem', fontWeight: 700, color: 'var(--down)' }}>{item.asset}</span>
                        {item.chartPattern && <span style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.65rem', background: 'var(--down-dim)', color: 'var(--down)', border: '1px solid rgba(255,77,109,0.25)', padding: '2px 8px', borderRadius: 2 }}>▼ {item.chartPattern}</span>}
                      </div>
                      <p style={{ fontSize: '0.82rem', lineHeight: 1.5, color: '#8a93a8', margin: 0 }}>{item.reason}</p>
                    </div>
                  )
                })}
              </div>
            )}

            {portfolio.disclaimer && (
              <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.68rem', color: 'var(--muted)', padding: '0.75rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 2 }}>
                ⚠️ {portfolio.disclaimer}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
