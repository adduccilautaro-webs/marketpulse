'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Header from '@/components/Header'

export default function AssetPage() {
  const params = useParams()
  const router = useRouter()
  const asset = decodeURIComponent(params.slug)
  const [loading, setLoading] = useState(true)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  useEffect(function() {
    async function analyze() {
      try {
        const response = await fetch('/api/asset-analysis', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: asset, lang: 'es' }),
        })
        const data = await response.json()
        if (data.success) {
          setResult(data)
        } else {
          setError(data.error || 'Error al analizar el activo.')
        }
      } catch (err) {
        setError('Error de conexion.')
      }
      setLoading(false)
    }
    analyze()
  }, [asset])

  const verdict = result && result.analysis && result.analysis.verdict
  const verdictColor = verdict === 'COMPRAR' ? 'var(--up)' : verdict === 'VENDER' ? 'var(--down)' : 'var(--neutral)'
  const verdictBg = verdict === 'COMPRAR' ? 'var(--up-dim)' : verdict === 'VENDER' ? 'var(--down-dim)' : 'var(--neutral-dim)'

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Header />
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '3rem 2rem' }}>

        <button onClick={() => router.back()} style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.72rem', color: 'var(--muted)', background: 'none', border: '1px solid var(--border)', padding: '5px 14px', borderRadius: 2, cursor: 'pointer', marginBottom: '2rem' }}>
          ← Volver
        </button>

        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: '2rem', color: 'var(--text)', marginBottom: '0.5rem' }}>{asset}</h1>
          <p style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.8rem', color: 'var(--muted)', letterSpacing: '0.05em' }}>
            Analisis completo · Figuras chartistas · Noticias recientes
          </p>
        </div>

        {loading && (
          <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--muted)', fontFamily: "'DM Mono', monospace", fontSize: '0.85rem' }}>
            <div style={{ marginBottom: '1rem', fontSize: '2rem' }}>⟳</div>
            Analizando {asset} con IA...
          </div>
        )}

        {error && (
          <div style={{ background: 'var(--down-dim)', border: '1px solid rgba(255,77,109,0.25)', padding: '1rem', borderRadius: 2, color: 'var(--down)', fontFamily: "'DM Mono', monospace", fontSize: '0.82rem' }}>{error}</div>
        )}

        {result && result.analysis && (
          <div>
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', padding: '1.5rem', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.7rem', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{result.analysis.type}</div>
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
                        <span style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.65rem', background: pBg, color: pColor, border: '1px solid ' + pColor + '44', padding: '2px 8px', borderRadius: 2, textTransform: 'uppercase' }}>
                          {p.type === 'alcista' ? '▲ Alcista' : p.type === 'bajista' ? '▼ Bajista' : '◆ Neutral'}
                        </span>
                        <span style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.65rem', color: 'var(--muted)' }}>Fiabilidad: {p.reliability}</span>
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
