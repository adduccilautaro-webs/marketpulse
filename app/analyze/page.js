'use client'
import { useState } from 'react'
import Header from '@/components/Header'

const EXAMPLES = ['Apple', 'Tesla', 'Bitcoin', 'Gold', 'EUR/USD', 'Amazon', 'Nvidia', 'Oil']

export default function AnalyzePage() {
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [lang, setLang] = useState('es')

  async function analyze() {
    if (!query.trim()) return
    setLoading(true)
    setResult(null)
    setError(null)
    try {
      const response = await fetch('/api/asset-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: query.trim(), lang }),
      })
      const data = await response.json()
      if (data.success) {
        setResult(data)
      } else {
        setError(data.error || 'Error al analizar el activo.')
      }
    } catch (err) {
      setError('Error de conexion. Intentá de nuevo.')
    }
    setLoading(false)
  }

  function handleKey(e) {
    if (e.key === 'Enter') analyze()
  }

  const verdict = result && result.analysis && result.analysis.verdict
  const verdictColor = verdict === 'COMPRAR' ? 'var(--up)' : verdict === 'VENDER' ? 'var(--down)' : 'var(--neutral)'
  const verdictBg = verdict === 'COMPRAR' ? 'var(--up-dim)' : verdict === 'VENDER' ? 'var(--down-dim)' : 'var(--neutral-dim)'

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Header />
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '3rem 2rem' }}>

        <div style={{ marginBottom: '2.5rem' }}>
          <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: '2rem', color: 'var(--text)', marginBottom: '0.5rem' }}>
            Analisis de Activos
          </h1>
          <p style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.8rem', color: 'var(--muted)', letterSpacing: '0.05em' }}>
            Fundamental · Tecnico · Figuras Chartistas · Noticias · Veredicto
          </p>
        </div>

        <div style={{ display: 'flex', gap: 8, marginBottom: '1rem' }}>
          <button onClick={() => setLang('es')} style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.72rem', fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', background: lang === 'es' ? 'var(--accent-dim)' : 'var(--surface)', color: lang === 'es' ? 'var(--accent)' : 'var(--muted)', border: lang === 'es' ? '1px solid rgba(79,195,247,0.3)' : '1px solid var(--border)', padding: '5px 14px', borderRadius: 2, cursor: 'pointer' }}>Español</button>
          <button onClick={() => setLang('en')} style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.72rem', fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', background: lang === 'en' ? 'var(--accent-dim)' : 'var(--surface)', color: lang === 'en' ? 'var(--accent)' : 'var(--muted)', border: lang === 'en' ? '1px solid rgba(79,195,247,0.3)' : '1px solid var(--border)', padding: '5px 14px', borderRadius: 2, cursor: 'pointer' }}>English</button>
        </div>

        <div style={{ display: 'flex', gap: 8, marginBottom: '1.5rem' }}>
          <input
            type="text"
            placeholder="Ej: Apple, Tesla, Bitcoin, Gold, EUR/USD..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKey}
            style={{ flex: 1, background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)', fontFamily: "'Syne', sans-serif", fontSize: '0.9rem', padding: '12px 16px', borderRadius: 2, outline: 'none' }}
          />
          <button
            onClick={analyze}
            disabled={loading}
            style={{ fontFamily: "'Syne', sans-serif", fontSize: '0.85rem', fontWeight: 600, background: loading ? 'var(--surface)' : 'var(--accent-dim)', color: loading ? 'var(--muted)' : 'var(--accent)', border: '1px solid rgba(79,195,247,0.4)', padding: '12px 24px', borderRadius: 2, cursor: loading ? 'not-allowed' : 'pointer', whiteSpace: 'nowrap' }}
          >
            {loading ? 'Analizando...' : 'Analizar →'}
          </button>
        </div>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: '2rem' }}>
          {EXAMPLES.map(ex => (
            <button key={ex} onClick={() => setQuery(ex)} style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.68rem', background: 'var(--surface)', color: 'var(--muted)', border: '1px solid var(--border)', padding: '4px 10px', borderRadius: 2, cursor: 'pointer' }}>{ex}</button>
          ))}
        </div>

        {error && (
          <div style={{ background: 'var(--down-dim)', border: '1px solid rgba(255,77,109,0.25)', padding: '1rem', borderRadius: 2, color: 'var(--down)', fontFamily: "'DM Mono', monospace", fontSize: '0.82rem' }}>{error}</div>
        )}

        {loading && (
          <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--muted)', fontFamily: "'DM Mono', monospace", fontSize: '0.85rem' }}>
            <div style={{ marginBottom: '1rem', fontSize: '2rem' }}>⟳</div>
            Buscando datos y generando analisis con IA...
          </div>
        )}

        {result && result.analysis && (
          <div>
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', padding: '1.5rem', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                <div>
                  <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: '1.5rem', color: 'var(--text)' }}>{result.asset}</div>
                  <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.7rem', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginTop: 4 }}>{result.analysis.type}</div>
                </div>
                {verdict && (
                  <div style={{ background: verdictBg, border: '1px solid ' + verdictColor + '44', padding: '0.75rem 1.5rem', borderRadius: 2, textAlign: 'center' }}>
                    <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.65rem', color: 'var(--muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4 }}>Veredicto</div>
                    <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '1.2rem', fontWeight: 700, color: verdictColor }}>{verdict}</div>
                    <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.65rem', color: 'var(--muted)', marginTop: 4 }}>Confianza: {result.analysis.confidence}</div>
                  </div>
                )}
              </div>
            </div>

            <Section title="Analisis Fundamental" content={result.analysis.fundamental} />
            <Section title="Analisis Tecnico" content={result.analysis.technical} />

            {result.analysis.chartPatterns && result.analysis.chartPatterns.length > 0 && (
              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', padding: '1.5rem', marginBottom: '1rem' }}>
                <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.7rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '1rem' }}>Figuras Chartistas Detectadas</div>
                {result.analysis.chartPatterns.map(function(p, i) {
                  const pColor = p.type === 'alcista' ? 'var(--up)' : p.type === 'bajista' ? 'var(--down)' : 'var(--neutral)'
                  const pBg = p.type === 'alcista' ? 'var(--up-dim)' : p.type === 'bajista' ? 'var(--down-dim)' : 'var(--neutral-dim)'
                  return (
                    <div key={i} style={{ borderTop: i > 0 ? '1px solid var(--border)' : 'none', paddingTop: i > 0 ? '1rem' : 0, marginTop: i > 0 ? '1rem' : 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                        <span style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.85rem', fontWeight: 700, color: 'var(--text)' }}>{p.pattern}</span>
                        <span style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.65rem', background: pBg, color: pColor, border: '1px solid ' + pColor + '44', padding: '2px 8px', borderRadius: 2, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          {p.type === 'alcista' ? '▲ Alcista' : p.type === 'bajista' ? '▼ Bajista' : '◆ Neutral'}
                        </span>
                        <span style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.65rem', color: 'var(--muted)', textTransform: 'uppercase' }}>Fiabilidad: {p.reliability}</span>
                        {p.target && <span style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.72rem', color: pColor, marginLeft: 'auto' }}>Objetivo: {p.target}</span>}
                      </div>
                      <p style={{ fontSize: '0.82rem', lineHeight: 1.5, color: '#8a93a8', margin: 0 }}>{p.description}</p>
                    </div>
                  )
                })}
              </div>
            )}

            {result.analysis.risks && <Section title="Riesgos Principales" content={result.analysis.risks} color="var(--down)" />}

            {result.news && result.news.length > 0 && (
              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', padding: '1.5rem', marginBottom: '1rem' }}>
                <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.7rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '1rem' }}>Noticias Recientes</div>
                {result.news.map(function(n, i) {
                  return (
                    <div key={i} style={{ borderTop: i > 0 ? '1px solid var(--border)' : 'none', paddingTop: i > 0 ? '0.75rem' : 0, marginTop: i > 0 ? '0.75rem' : 0 }}>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text)', marginBottom: '0.25rem', lineHeight: 1.4 }}>{n.title}</div>
                      <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.65rem', color: 'var(--muted)' }}>{n.source}</div>
                    </div>
                  )
                })}
              </div>
            )}

            {result.analysis.summary && (
              <div style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderLeft: '3px solid ' + verdictColor, padding: '1.5rem', marginBottom: '1rem' }}>
                <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.7rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '0.75rem' }}>Conclusion</div>
                <p style={{ fontSize: '0.88rem', lineHeight: 1.7, color: 'var(--text)', margin: 0 }}>{result.analysis.summary}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function Section({ title, content, color }) {
  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', padding: '1.5rem', marginBottom: '1rem' }}>
      <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.7rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: color || 'var(--muted)', marginBottom: '0.75rem' }}>{title}</div>
      <p style={{ fontSize: '0.88rem', lineHeight: 1.7, color: 'var(--text)', margin: 0 }}>{content}</p>
    </div>
  )
}
