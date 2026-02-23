'use client'
import { useState } from 'react'
import NewsCard from './NewsCard'
import NewsModal from './NewsModal'

const FILTERS = [
  { id: 'all', label: 'Todo' },
  { id: 'noticia', label: 'Noticias' },
  { id: 'anuncio', label: 'Anuncios' },
  { id: 'rumor', label: 'Rumores' },
  { id: 'indices', label: 'Indices' },
  { id: 'divisas', label: 'Divisas' },
  { id: 'metales', label: 'Metales' },
  { id: 'energia', label: 'Energia' },
  { id: 'cripto', label: 'Cripto' },
  { id: 'acciones', label: 'Acciones' },
]

export default function NewsGrid({ news }) {
  const [activeFilter, setActiveFilter] = useState('all')
  const [selectedNews, setSelectedNews] = useState(null)
  const [search, setSearch] = useState('')

  const counts = news.reduce(function(acc, item) {
    acc[item.impact] = (acc[item.impact] || 0) + 1
    return acc
  }, {})

  const filtered = news.filter(function(item) {
    const matchFilter = activeFilter === 'all' || item.type === activeFilter || item.category === activeFilter
    const matchSearch = search === '' ||
      item.headline.toLowerCase().includes(search.toLowerCase()) ||
      item.summary.toLowerCase().includes(search.toLowerCase()) ||
      item.bullish.some(function(a) { return a.toLowerCase().includes(search.toLowerCase()) }) ||
      item.bearish.some(function(a) { return a.toLowerCase().includes(search.toLowerCase()) })
    return matchFilter && matchSearch
  })

  const highImpact = filtered.filter(function(n) { return n.impact === 'alto' })
  const rest = filtered.filter(function(n) { return n.impact !== 'alto' })

  return (
    <div style={{ position: 'relative', zIndex: 1 }}>
      <div style={{ maxWidth: 1200, margin: '1.5rem auto 0', padding: '0 2rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <StatBox label="Alto impacto" count={counts.alto || 0} color="var(--down)" />
        <StatBox label="Medio impacto" count={counts.medio || 0} color="var(--neutral)" />
        <StatBox label="Bajo impacto" count={counts.bajo || 0} color="var(--up)" />
        <StatBox label="Total noticias" count={news.length} color="var(--accent)" />
      </div>
      <div style={{ maxWidth: 1200, margin: '1.25rem auto 0', padding: '0 2rem' }}>
        <input
          type="text"
          placeholder="Buscar por titular, resumen o activo..."
          value={search}
          onChange={function(e) { setSearch(e.target.value) }}
          style={{ width: '100%', background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)', fontFamily: 'Syne, sans-serif', fontSize: '0.85rem', padding: '10px 16px', borderRadius: 2, outline: 'none' }}
        />
      </div>
      <div style={{ maxWidth: 1200, margin: '1rem auto 1.5rem', padding: '0 2rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        {FILTERS.map(function(f) {
          return (
            <button
              key={f.id}
              onClick={function() { setActiveFilter(f.id) }}
              style={{ fontFamily: 'Syne, sans-serif', fontSize: '0.78rem', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', background: activeFilter === f.id ? 'var(--accent-dim)' : 'var(--surface)', color: activeFilter === f.id ? 'var(--accent)' : 'var(--muted)', border: activeFilter === f.id ? '1px solid rgba(79,195,247,0.4)' : '1px solid var(--border)', padding: '6px 16px', borderRadius: 2, cursor: 'pointer' }}
            >
              {f.label}
            </button>
          )
        })}
      </div>
      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '0 2rem 4rem' }}>
        {highImpact.length > 0 && (
          <div>
            <SectionLabel text="Impacto alto" />
            <div style={{ display: 'grid', gridTemplateColumns: highImpact.length === 1 ? '1fr' : '1.6fr 1fr', gap: 1, background: 'var(--border)' }}>
              {highImpact.slice(0, 2).map(function(item, i) {
                return <NewsCard key={item.id} news={item} featured={i === 0} onClick={function() { setSelectedNews(item) }} />
              })}
            </div>
          </div>
        )}
        {rest.length > 0 && (
          <div>
            <div style={{ height: 1, background: 'var(--border)', margin: '2rem 0' }} />
            <SectionLabel text="Otras noticias" />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, background: 'var(--border)' }}>
              {rest.map(function(item) {
                return <NewsCard key={item.id} news={item} onClick={function() { setSelectedNews(item) }} />
              })}
            </div>
          </div>
        )}
        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--muted)', fontFamily: 'DM Mono, monospace', fontSize: '0.85rem' }}>
            No hay noticias que coincidan.
          </div>
        )}
      </main>
      {selectedNews && <NewsModal news={selectedNews} onClose={function() { setSelectedNews(null) }} />}
    </div>
  )
}

function StatBox(props) {
  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', padding: '0.6rem 1.25rem', display: 'flex', alignItems: 'center', gap: 10, borderRadius: 2 }}>
      <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '1.4rem', fontWeight: 700, color: props.color }}>{props.count}</span>
      <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.65rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted)' }}>{props.label}</span>
    </div>
  )
}

function SectionLabel(props) {
  return (
    <div style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.7rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: 8 }}>
      {props.text}
      <span style={{ flex: 1, height: 1, background: 'var(--border)' }} />
    </div>
  )
}
