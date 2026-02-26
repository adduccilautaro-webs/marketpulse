'use client'
import { useState, useEffect } from 'react'
import Header from '@/components/Header'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'

const STATUS_CONFIG = {
  tp_alcanzado: { label: 'TP Alcanzado', color: 'var(--up)', bg: 'var(--up-dim)', border: 'rgba(0,230,118,0.25)' },
  sl_alcanzado: { label: 'SL Alcanzado', color: 'var(--down)', bg: 'var(--down-dim)', border: 'rgba(255,77,109,0.25)' },
  ganando: { label: 'Ganando', color: 'var(--up)', bg: 'var(--up-dim)', border: 'rgba(0,230,118,0.25)' },
  perdiendo: { label: 'Perdiendo', color: 'var(--down)', bg: 'var(--down-dim)', border: 'rgba(255,77,109,0.25)' },
  abierta: { label: 'Abierta', color: 'var(--muted)', bg: 'var(--surface)', border: 'var(--border)' },
}

export default function IdeasPage() {
  const [ideas, setIdeas] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [deleting, setDeleting] = useState(null)

  async function loadIdeas() {
    setLoading(true)
    try {
      const response = await fetch('/api/ideas')
      const data = await response.json()
      if (data.success) setIdeas(data.ideas)
    } catch (err) {}
    setLoading(false)
  }

  async function deleteIdea(id) {
    setDeleting(id)
    try {
      await fetch('/api/ideas', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      setIdeas(function(prev) { return prev.filter(function(i) { return i.id !== id }) })
    } catch (err) {}
    setDeleting(null)
  }

  useEffect(function() { loadIdeas() }, [])

  const filtered = ideas.filter(function(idea) {
    if (filter === 'all') return true
    if (filter === 'ganando') return idea.status === 'ganando' || idea.status === 'tp_alcanzado'
    if (filter === 'perdiendo') return idea.status === 'perdiendo' || idea.status === 'sl_alcanzado'
    return idea.status === filter
  })

  const stats = {
    total: ideas.length,
    ganando: ideas.filter(function(i) { return i.status === 'ganando' || i.status === 'tp_alcanzado' }).length,
    perdiendo: ideas.filter(function(i) { return i.status === 'perdiendo' || i.status === 'sl_alcanzado' }).length,
    abierta: ideas.filter(function(i) { return i.status === 'abierta' }).length,
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Header />
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '3rem 2rem' }}>

        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: '2rem', color: 'var(--text)', marginBottom: '0.5rem' }}>Mis Ideas de Trading</h1>
            <p style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.8rem', color: 'var(--muted)', letterSpacing: '0.05em' }}>
              Seguimiento de ideas guardadas con precio actual
            </p>
          </div>
          <button onClick={loadIdeas} disabled={loading} style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.72rem', background: 'var(--surface)', color: 'var(--muted)', border: '1px solid var(--border)', padding: '8px 16px', borderRadius: 2, cursor: 'pointer' }}>
            {loading ? 'Actualizando...' : '↻ Actualizar precios'}
          </button>
        </div>

        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
          <StatBox label="Total" count={stats.total} color="var(--accent)" onClick={() => setFilter('all')} active={filter === 'all'} />
          <StatBox label="Ganando" count={stats.ganando} color="var(--up)" onClick={() => setFilter('ganando')} active={filter === 'ganando'} />
          <StatBox label="Perdiendo" count={stats.perdiendo} color="var(--down)" onClick={() => setFilter('perdiendo')} active={filter === 'perdiendo'} />
          <StatBox label="Abiertas" count={stats.abierta} color="var(--muted)" onClick={() => setFilter('abierta')} active={filter === 'abierta'} />
        </div>

        {loading && (
          <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--muted)', fontFamily: "'DM Mono', monospace", fontSize: '0.85rem' }}>
            <div style={{ marginBottom: '1rem', fontSize: '2rem' }}>⟳</div>
            Cargando ideas y precios actuales...
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--muted)', fontFamily: "'DM Mono', monospace", fontSize: '0.85rem' }}>
            No hay ideas guardadas aun. Genera ideas de trading en las noticias y guardalas con el boton "+ Guardar idea".
          </div>
        )}

        {!loading && filtered.map(function(idea) {
          const sc = STATUS_CONFIG[idea.status] || STATUS_CONFIG.abierta
          const pnlNum = parseFloat(idea.pnl)
          const pnlColor = pnlNum > 0 ? 'var(--up)' : pnlNum < 0 ? 'var(--down)' : 'var(--muted)'
          const timeAgo = idea.createdAt ? formatDistanceToNow(new Date(idea.createdAt), { addSuffix: true, locale: es }) : ''

          return (
            <div key={idea.id} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderLeft: '3px solid ' + sc.color, padding: '1.25rem', marginBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem', flexWrap: 'wrap', gap: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.9rem', fontWeight: 700, color: idea.direction === 'LONG' ? 'var(--up)' : 'var(--down)' }}>
                    {idea.direction === 'LONG' ? '▲ LONG' : '▼ SHORT'}
                  </span>
                  <span style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.9rem', fontWeight: 700, color: 'var(--text)' }}>{idea.asset}</span>
                  <span style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.65rem', background: sc.bg, color: sc.color, border: '1px solid ' + sc.border, padding: '2px 8px', borderRadius: 2, textTransform: 'uppercase' }}>{sc.label}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  {idea.pnl !== null && (
                    <span style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.85rem', fontWeight: 700, color: pnlColor }}>
                      {pnlNum > 0 ? '+' : ''}{idea.pnl}%
                    </span>
                  )}
                  <button
                    onClick={function() { deleteIdea(idea.id) }}
                    disabled={deleting === idea.id}
                    style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.65rem', background: 'none', color: 'var(--muted)', border: '1px solid var(--border)', padding: '3px 8px', borderRadius: 2, cursor: 'pointer' }}
                  >
                    {deleting === idea.id ? '...' : '✕ Eliminar'}
                  </button>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: '0.75rem' }}>
                <PriceBox label="Entrada" value={idea.entry} color="var(--accent)" />
                <PriceBox label="Stop Loss" value={idea.stopLoss} color="var(--down)" />
                <PriceBox label="Take Profit" value={idea.takeProfit} color="var(--up)" />
                <PriceBox label="Precio actual" value={idea.currentPrice || '...'} color={pnlColor} />
              </div>

              {idea.rationale && (
                <p style={{ fontSize: '0.78rem', lineHeight: 1.5, color: '#8a93a8', margin: 0, marginBottom: '0.5rem' }}>{idea.rationale}</p>
              )}

              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                {idea.confidence && (
                  <span style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.65rem', color: 'var(--muted)', textTransform: 'uppercase' }}>Confianza: {idea.confidence}</span>
                )}
                {idea.source && (
                  <span style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.65rem', color: 'var(--muted)' }}>· {idea.source}</span>
                )}
                {timeAgo && (
                  <span style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.65rem', color: 'var(--muted)', marginLeft: 'auto' }}>{timeAgo}</span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function StatBox({ label, count, color, onClick, active }) {
  return (
    <div
      onClick={onClick}
      style={{ background: active ? 'var(--surface2)' : 'var(--surface)', border: active ? '1px solid ' + color : '1px solid var(--border)', padding: '0.6rem 1.25rem', display: 'flex', alignItems: 'center', gap: 10, borderRadius: 2, cursor: 'pointer', transition: 'all 0.2s' }}
      onMouseEnter={function(e) { e.currentTarget.style.borderColor = color }}
      onMouseLeave={function(e) { e.currentTarget.style.borderColor = active ? color : 'var(--border)' }}
    >
      <span style={{ fontFamily: "'DM Mono', monospace", fontSize: '1.4rem', fontWeight: 700, color }}>{count}</span>
      <span style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.65rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted)' }}>{label}</span>
    </div>
  )
}

function PriceBox({ label, value, color }) {
  return (
    <div style={{ background: 'var(--surface2)', border: '1px solid var(--border)', padding: '0.5rem', textAlign: 'center', borderRadius: 2 }}>
      <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.6rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 4 }}>{label}</div>
      <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.82rem', fontWeight: 700, color }}>{value}</div>
    </div>
  )
}
