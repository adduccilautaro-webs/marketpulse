'use client'
import { useState, useEffect } from 'react'
import Header from '@/components/Header'

const DAYS = ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab']
const MONTHS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']

export default function CalendarPage() {
  const [loading, setLoading] = useState(false)
  const [events, setEvents] = useState(null)
  const [error, setError] = useState(null)
  const [filter, setFilter] = useState('all')

  async function loadEvents() {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/calendar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })
      const data = await response.json()
      if (data.success) {
        setEvents(data.events)
      } else {
        setError(data.error || 'Error al cargar el calendario.')
      }
    } catch (err) {
      setError('Error de conexion. Intentá de nuevo.')
    }
    setLoading(false)
  }

  useEffect(function() { loadEvents() }, [])

  const impactColor = { 'alto': 'var(--down)', 'medio': 'var(--neutral)', 'bajo': 'var(--up)' }
  const impactBg = { 'alto': 'var(--down-dim)', 'medio': 'var(--neutral-dim)', 'bajo': 'var(--up-dim)' }
  const impactBorder = { 'alto': 'rgba(255,77,109,0.25)', 'medio': 'rgba(255,209,102,0.25)', 'bajo': 'rgba(0,230,118,0.25)' }

  const filtered = events ? events.filter(function(e) {
    if (filter === 'all') return true
    return e.impact === filter
  }) : []

  const grouped = filtered.reduce(function(acc, event) {
    const key = event.date
    if (!acc[key]) acc[key] = []
    acc[key].push(event)
    return acc
  }, {})

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Header />
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '3rem 2rem' }}>

        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: '2rem', color: 'var(--text)', marginBottom: '0.5rem' }}>Calendario Economico</h1>
            <p style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.8rem', color: 'var(--muted)', letterSpacing: '0.05em' }}>Eventos de la semana · Impacto en mercados</p>
          </div>
          <button onClick={loadEvents} disabled={loading} style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.72rem', fontWeight: 500, background: 'var(--surface)', color: 'var(--muted)', border: '1px solid var(--border)', padding: '8px 16px', borderRadius: 2, cursor: loading ? 'not-allowed' : 'pointer' }}>
            {loading ? 'Actualizando...' : '↻ Actualizar'}
          </button>
        </div>

        <div style={{ display: 'flex', gap: 8, marginBottom: '2rem', flexWrap: 'wrap' }}>
          {[['all', 'Todos'], ['alto', 'Alto impacto'], ['medio', 'Medio impacto'], ['bajo', 'Bajo impacto']].map(function(f) {
            return (
              <button key={f[0]} onClick={() => setFilter(f[0])} style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.68rem', fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', background: filter === f[0] ? (f[0] === 'alto' ? 'var(--down-dim)' : f[0] === 'medio' ? 'var(--neutral-dim)' : f[0] === 'bajo' ? 'var(--up-dim)' : 'var(--accent-dim)') : 'var(--surface)', color: filter === f[0] ? (f[0] === 'alto' ? 'var(--down)' : f[0] === 'medio' ? 'var(--neutral)' : f[0] === 'bajo' ? 'var(--up)' : 'var(--accent)') : 'var(--muted)', border: '1px solid var(--border)', padding: '5px 14px', borderRadius: 2, cursor: 'pointer' }}>
                {f[1]}
              </button>
            )
          })}
        </div>

        {error && (
          <div style={{ background: 'var(--down-dim)', border: '1px solid rgba(255,77,109,0.25)', padding: '1rem', borderRadius: 2, color: 'var(--down)', fontFamily: "'DM Mono', monospace", fontSize: '0.82rem' }}>{error}</div>
        )}

        {loading && (
          <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--muted)', fontFamily: "'DM Mono', monospace", fontSize: '0.85rem' }}>
            <div style={{ marginBottom: '1rem', fontSize: '2rem' }}>⟳</div>
            Generando calendario con IA...
          </div>
        )}

        {!loading && events && Object.keys(grouped).sort().map(function(date) {
          const d = new Date(date + 'T12:00:00')
          const dayLabel = DAYS[d.getDay()] + ' ' + d.getDate() + ' ' + MONTHS[d.getMonth()]
          return (
            <div key={date} style={{ marginBottom: '2rem' }}>
              <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.7rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                {dayLabel}
                <span style={{ flex: 1, height: 1, background: 'var(--border)' }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 1, background: 'var(--border)' }}>
                {grouped[date].map(function(event, i) {
                  return (
                    <div key={i} style={{ background: 'var(--surface)', padding: '1rem 1.25rem', display: 'grid', gridTemplateColumns: '80px 1fr auto', gap: 16, alignItems: 'center' }}>
                      <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.8rem', color: 'var(--muted)', letterSpacing: '0.05em' }}>{event.time}</div>
                      <div>
                        <div style={{ fontSize: '0.88rem', color: 'var(--text)', marginBottom: 4, fontWeight: 500 }}>{event.name}</div>
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                          <span style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.65rem', color: 'var(--muted)' }}>{event.country}</span>
                          {event.previous && <span style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.65rem', color: 'var(--muted)' }}>Anterior: {event.previous}</span>}
                          {event.forecast && <span style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.65rem', color: 'var(--accent)' }}>Estimado: {event.forecast}</span>}
                        </div>
                        {event.description && <div style={{ fontSize: '0.78rem', color: '#8a93a8', marginTop: 4 }}>{event.description}</div>}
                      </div>
                      <span style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.65rem', fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', background: impactBg[event.impact] || 'var(--surface)', color: impactColor[event.impact] || 'var(--muted)', border: '1px solid ' + (impactBorder[event.impact] || 'var(--border)'), padding: '3px 8px', borderRadius: 2, whiteSpace: 'nowrap' }}>
                        {event.impact === 'alto' ? '▲▲ Alto' : event.impact === 'medio' ? '▲ Medio' : '● Bajo'}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}

        {!loading && events && filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--muted)', fontFamily: "'DM Mono', monospace", fontSize: '0.85rem' }}>No hay eventos para este filtro.</div>
        )}
      </div>
    </div>
  )
}
