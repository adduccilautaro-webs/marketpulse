'use client'
import { useState } from 'react'
import Header from '@/components/Header'

export default function SimulatorPage() {
  const [amount, setAmount] = useState('')
  const [currency, setCurrency] = useState('USD')
  const [risk, setRisk] = useState('medio')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  async function simulate() {
    if (!amount || isNaN(amount) || Number(amount) <= 0) return
    setLoading(true)
    setResult(null)
    setError(null)
    try {
      const response = await fetch('/api/simulator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: Number(amount), currency, risk }),
      })
      const data = await response.json()
      if (data.success) {
        setResult(data)
      } else {
        setError(data.error || 'Error al simular.')
      }
    } catch (err) {
      setError('Error de conexion. Intentá de nuevo.')
    }
    setLoading(false)
  }

  const riskColor = { 'bajo': 'var(--up)', 'medio': 'var(--neutral)', 'alto': 'var(--down)' }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Header />
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '3rem 2rem' }}>

        <div style={{ marginBottom: '2.5rem' }}>
          <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: '2rem', color: 'var(--text)', marginBottom: '0.5rem' }}>Simulador de Portfolio</h1>
          <p style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.8rem', color: 'var(--muted)', letterSpacing: '0.05em' }}>
            Ingresa tu capital y te decimos exactamente cuanto poner en cada activo
          </p>
        </div>

        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', padding: '1.5rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 120px', gap: 8, marginBottom: '1rem' }}>
            <input
              type="number"
              placeholder="Ej: 1000"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && simulate()}
              style={{ background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--text)', fontFamily: "'Syne', sans-serif", fontSize: '1.1rem', padding: '12px 16px', borderRadius: 2, outline: 'none' }}
            />
            <select
              value={currency}
              onChange={e => setCurrency(e.target.value)}
              style={{ background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--text)', fontFamily: "'DM Mono', monospace", fontSize: '0.85rem', padding: '12px', borderRadius: 2, outline: 'none', cursor: 'pointer' }}
            >
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="ARS">ARS</option>
              <option value="BRL">BRL</option>
            </select>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '0.5rem' }}>Perfil de riesgo</div>
            <div style={{ display: 'flex', gap: 8 }}>
              {[['bajo', 'Conservador'], ['medio', 'Moderado'], ['alto', 'Agresivo']].map(function(r) {
                return (
                  <button key={r[0]} onClick={() => setRisk(r[0])} style={{ flex: 1, fontFamily: "'DM Mono', monospace", fontSize: '0.72rem', fontWeight: 500, letterSpacing: '0.05em', textTransform: 'uppercase', background: risk === r[0] ? 'var(--surface2)' : 'transparent', color: risk === r[0] ? riskColor[r[0]] : 'var(--muted)', border: risk === r[0] ? '1px solid ' + riskColor[r[0]] + '66' : '1px solid var(--border)', padding: '8px', borderRadius: 2, cursor: 'pointer' }}>
                    {r[1]}
                  </button>
                )
              })}
            </div>
          </div>

          <button onClick={simulate} disabled={loading || !amount} style={{ width: '100%', fontFamily: "'Syne', sans-serif", fontSize: '0.9rem', fontWeight: 600, background: loading || !amount ? 'var(--surface2)' : 'var(--accent-dim)', color: loading || !amount ? 'var(--muted)' : 'var(--accent)', border: '1px solid rgba(79,195,247,0.4)', padding: '12px', borderRadius: 2, cursor: loading || !amount ? 'not-allowed' : 'pointer' }}>
            {loading ? 'Calculando...' : '✨ Simular Portfolio'}
          </button>
        </div>

        {error && (
          <div style={{ background: 'var(--down-dim)', border: '1px solid rgba(255,77,109,0.25)', padding: '1rem', borderRadius: 2, color: 'var(--down)', fontFamily: "'DM Mono', monospace", fontSize: '0.82rem' }}>{error}</div>
        )}

        {loading && (
          <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--muted)', fontFamily: "'DM Mono', monospace", fontSize: '0.85rem' }}>
            <div style={{ marginBottom: '1rem', fontSize: '2rem' }}>⟳</div>
            Calculando asignacion optima con IA...
          </div>
        )}

        {result && (
          <div>
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', padding: '1.25rem', marginBottom: '1rem' }}>
              <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.7rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '0.5rem' }}>Resumen</div>
              <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
                <div>
                  <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '1.5rem', fontWeight: 700, color: 'var(--accent)' }}>{currency} {Number(amount).toLocaleString()}</div>
                  <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.65rem', color: 'var(--muted)', textTransform: 'uppercase', marginTop: 2 }}>Capital total</div>
                </div>
                <div>
                  <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '1.5rem', fontWeight: 700, color: riskColor[risk] }}>{risk.charAt(0).toUpperCase() + risk.slice(1)}</div>
                  <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.65rem', color: 'var(--muted)', textTransform: 'uppercase', marginTop: 2 }}>Perfil de riesgo</div>
                </div>
              </div>
            </div>

            {result.context && (
              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', padding: '1.25rem', marginBottom: '1rem' }}>
                <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.7rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '0.5rem' }}>Contexto de mercado</div>
                <p style={{ fontSize: '0.85rem', lineHeight: 1.6, color: 'var(--text)', margin: 0 }}>{result.context}</p>
              </div>
            )}

            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', padding: '1.25rem', marginBottom: '1rem' }}>
              <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.7rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '1rem' }}>Asignacion de Capital</div>
              {result.allocations && result.allocations.map(function(alloc, i) {
                return (
                  <div key={i} style={{ borderTop: i > 0 ? '1px solid var(--border)' : 'none', paddingTop: i > 0 ? '1rem' : 0, marginTop: i > 0 ? '1rem' : 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.9rem', fontWeight: 700, color: 'var(--accent)' }}>{alloc.asset}</span>
                        <span style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.65rem', color: 'var(--muted)', textTransform: 'uppercase' }}>{alloc.type}</span>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '1rem', fontWeight: 700, color: 'var(--up)' }}>{currency} {alloc.amount.toLocaleString()}</div>
                        <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.65rem', color: 'var(--muted)' }}>{alloc.percentage}%</div>
                      </div>
                    </div>
                    <div style={{ background: 'var(--border)', height: 4, borderRadius: 2, marginBottom: '0.5rem' }}>
                      <div style={{ background: 'var(--accent)', height: 4, borderRadius: 2, width: alloc.percentage + '%', transition: 'width 0.5s ease' }} />
                    </div>
                    {alloc.currentPrice && (
                      <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.7rem', color: 'var(--muted)', marginBottom: '0.25rem' }}>
                        Precio actual: <span style={{ color: 'var(--text)' }}>{alloc.currentPrice}</span>
                        {alloc.units && <span> · Unidades: <span style={{ color: 'var(--accent)' }}>{alloc.units}</span></span>}
                      </div>
                    )}
                    <p style={{ fontSize: '0.8rem', lineHeight: 1.5, color: '#8a93a8', margin: 0 }}>{alloc.rationale}</p>
                  </div>
                )
              })}
            </div>

            {result.disclaimer && (
              <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.68rem', color: 'var(--muted)', padding: '0.75rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 2 }}>
                ⚠️ {result.disclaimer}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
