'use client'
import { useState } from 'react'
import Header from '@/components/Header'

const EXAMPLES = ['Apple', 'Tesla', 'Bitcoin', 'Gold', 'EUR/USD', 'Nvidia', 'Ethereum', 'Oil']

export default function ComparePage() {
  const [asset1, setAsset1] = useState('')
  const [asset2, setAsset2] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [lang, setLang] = useState('es')

  async function compare() {
    if (!asset1.trim() || !asset2.trim()) return
    setLoading(true)
    setResult(null)
    setError(null)
    try {
      const response = await fetch('/api/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ asset1: asset1.trim(), asset2: asset2.trim(), lang }),
      })
      const data = await response.json()
      if (data.success) {
        setResult(data)
      } else {
        setError(data.error || 'Error al comparar.')
      }
    } catch (err) {
      setError('Error de conexion. Intentá de nuevo.')
    }
    setLoading(false)
  }

  const verdictColor = (v) => v === 'COMPRAR' ? 'var(--up)' : v === 'VENDER' ? 'var(--down)' : 'var(--neutral)'
  const verdictBg = (v) => v === 'COMPRAR' ? 'var(--up-dim)' : v === 'VENDER' ? 'var(--down-dim)' : 'var(--neutral-dim)'

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Header />
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '3rem 2rem' }}>

        <div style={{ marginBottom: '2.5rem' }}>
          <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: '2rem', color: 'var(--text)', marginBottom: '0.5rem' }}>Comparador de Activos</h1>
          <p style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.8rem', color: 'var(--muted)', letterSpacing: '0.05em' }}>
            Compara dos activos lado a lado · Fundamental · Tecnico · Veredicto
          </p>
        </div>

        <div style={{ display: 'flex', gap: 8, marginBottom: '1rem' }}>
          <button onClick={() => setLang('es')} style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.72rem', fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', background: lang === 'es' ? 'var(--accent-dim)' : 'var(--surface)', color: lang === 'es' ? 'var(--accent)' : 'var(--muted)', border: lang === 'es' ? '1px solid rgba(79,195,247,0.3)' : '1px solid var(--border)', padding: '5px 14px', borderRadius: 2, cursor: 'pointer' }}>Español</button>
          <button onClick={() => setLang('en')} style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.72rem', fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', background: lang === 'en' ? 'var(--accent-dim)' : 'var(--surface)', color: lang === 'en' ? 'var(--accent)' : 'var(--muted)', border: lang === 'en' ? '1px solid rgba(79,195,247,0.3)' : '1px solid var(--border)', padding: '5px 14px', borderRadius: 2, cursor: 'pointer' }}>English</button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: '1rem' }}>
          <input type="text" placeholder="Activo 1 (ej: Apple)" value={asset1} onChange={e => setAsset1(e.target.value)} onKeyDown={e => e.key === 'Enter' && compare()} style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)', fontFamily: "'Syne', sans-serif", fontSize: '0.9rem', padding: '12px 16px', borderRadius: 2, outline: 'none' }} />
          <input type="text" placeholder="Activo 2 (ej: Bitcoin)" value={asset2} onChange={e => setAsset2(e.target.value)} onKeyDown={e => e.key === 'Enter' && compare()} style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)', fontFamily: "'Syne', sans-serif", fontSize: '0.9rem', padding: '12px 16px', borderRadius: 2, outline: 'none' }} />
        </div>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: '1.5rem' }}>
          {EXAMPLES.map(ex => (
            <button key={ex} onClick={() => { if (!asset1) setAsset1(ex); else setAsset2(ex) }} style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.68rem', background: 'var(--surface)', color: 'var(--muted)', border: '1px solid var(--border)', padding: '4px 10px', borderRadius: 2, cursor: 'pointer' }}>{ex}</button>
          ))}
        </div>

        <button onClick={compare} disabled={loading || !asset1 || !asset2} style={{ width: '100%', fontFamily: "'Syne', sans-serif", fontSize: '0.9rem', fontWeight: 600, background: loading || !asset1 || !asset2 ? 'var(--surface)' : 'var(--accent-dim)', color: loading || !asset1 || !asset2 ? 'var(--muted)' : 'var(--accent)', border: '1px solid rgba(79,195,247,0.4)', padding: '12px', borderRadius: 2, cursor: loading || !asset1 || !asset2 ? 'not-allowed' : 'pointer', marginBottom: '2rem' }}>
          {loading ? 'Comparando...' : '⚡ Comparar Activos'}
        </button>

        {error && <div style={{ background: 'var(--down-dim)', border: '1px solid rgba(255,77,109,0.25)', padding: '1rem', borderRadius: 2, color: 'var(--down)', fontFamily: "'DM Mono', monospace", fontSize: '0.82rem', marginBottom: '1rem' }}>{error}</div>}

        {loading && (
          <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--muted)', fontFamily: "'DM Mono', monospace", fontSize: '0.85rem' }}>
            <div style={{ marginBottom: '1rem', fontSize: '2rem' }}>⟳</div>
            Analizando ambos activos con IA...
          </div>
        )}

        {result && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, background: 'var(--border)', marginBottom: '1rem' }}>
              {[result.asset1, result.asset2].map(function(a, idx) {
                return (
                  <div key={idx} style={{ background: 'var(--surface)', padding: '1.25rem' }}>
                    <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: '1.3rem', color: 'var(--text)', marginBottom: '0.25rem' }}>{a.name}</div>
                    <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.65rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '1rem' }}>{a.type}</div>
                    <div style={{ background: verdictBg(a.verdict), border: '1px solid ' + verdictColor(a.verdict) + '44', padding: '0.75rem', borderRadius: 2, textAlign: 'center', marginBottom: '1rem' }}>
                      <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.65rem', color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 4 }}>Veredicto</div>
                      <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '1.1rem', fontWeight: 700, color: verdictColor(a.verdict) }}>{a.verdict}</div>
                      <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.65rem', color: 'var(--muted)', marginTop: 4 }}>Confianza: {a.confidence}</div>
                    </div>
                    <CompareSection title="Fundamental" content={a.fundamental} />
                    <CompareSection title="Tecnico" content={a.technical} />
                    {a.chartPattern && (
                      <div style={{ background: 'var(--surface2)', border: '1px solid var(--border)', padding: '0.75rem', marginBottom: '0.75rem', borderRadius: 2 }}>
                        <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.62rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '0.25rem' }}>Figura chartista</div>
                        <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.78rem', fontWeight: 700, color: a.chartPattern.type === 'alcista' ? 'var(--up)' : a.chartPattern.type === 'bajista' ? 'var(--down)' : 'var(--neutral)' }}>
                          {a.chartPattern.type === 'alcista' ? '▲' : a.chartPattern.type === 'bajista' ? '▼' : '◆'} {a.chartPattern.pattern}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#8a93a8', marginTop: 4 }}>{a.chartPattern.description}</div>
                      </div>
                    )}
                    <CompareSection title="Riesgos" content={a.risks} color="var(--down)" />
                  </div>
                )
              })}
            </div>

            {result.winner && (
              <div style={{ background: 'var(--surface)', border: '1px solid var(--accent)', borderLeft: '3px solid var(--accent)', padding: '1.5rem', marginBottom: '1rem' }}>
                <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.7rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: '0.5rem' }}>⚡ Mejo
