// components/NewsGrid.js
'use client'
import { useState } from 'react'
import NewsCard from './NewsCard'
import NewsModal from './NewsModal'

const FILTERS = [
  { id: 'all', label: 'Todo' },
  { id: 'noticia', label: 'Noticias' },
  { id: 'anuncio', label: 'Anuncios' },
  { id: 'rumor', label: 'Rumores' },
  { id: 'indices', label: 'Índices' },
  { id: 'divisas', label: 'Divisas' },
  { id: 'metales', label: 'Metales' },
  { id: 'energia', label: 'Energía' },
  { id: 'cripto', label: 'Cripto' },
  { id: 'acciones', label: 'Acciones' },
]

export default function NewsGrid({ news }) {
  const [activeFilter, setActiveFilter] = useState('all')
  const [selectedNews, setSelectedNews] = useState(null)

  const filtered = news.filter(item => {
    if (activeFilter === 'all') return true
    return item.type === activeFilter || item.category === activeFilter
  })

  const highImpact = filtered.filter(n => n.impact === 'alto')
  const rest = filtered.filter(n => n.impact !== 'alto')

  return (
    <div style={{ position: 'relative', zIndex: 1 }}>
      {/* Filtros */}
      <div style={{
        maxWidth: 1200, margin: '2rem auto 1.5rem',
        padding: '0 2rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap',
      }}>
        {FILTERS.map(f => (
          <button
            key={f.id}
            onClick={() => setActiveFilter(f.id)}
            style={{
              fontFamily: "'Syne', sans-serif",
              fontSize: '0.78rem', fontWeight: 600,
              letterSpacing: '0.05em', textTransform: 'uppercase',
              background: activeFilter === f.id ? 'var(--accent-dim)' : 'var(--surface)',
              color: activeFilter === f.id ? 'var(--accent)' : 'var(--muted)',
              border: activeFilter === f.id
                ? '1px solid rgba(79,195,247,0.4)'
                : '1px solid var(--border)',
              padding: '6px 16px', borderRadius: 2,
              cursor: 'pointer', transition: 'all 0.2s',
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '0 2rem 4rem' }}>
        {/* Sección alto impacto */}
        {highImpact.length > 0 && (
          <>
            <SectionLabel text="Impacto alto · Última hora" />
            <div style={{
              display: 'grid',
              gridTemplateColumns: highImpact.length === 1 ? '1fr' : '1.6fr 1fr',
              gap: 1, background: 'var(--border)',
            }}>
              {highImpact.slice(0, 2).map((item, i) => (
                <NewsCard
                  key={item.id}
                  news={item}
                  featured={i === 0}
                  onClick={() => setSelectedNews(item)}
                />
              ))}
            </div>
            {highImpact.length > 2 && (
              <div style={{
                display: 'grid', gridTemplateColumns: '1fr 1fr',
                gap: 1, background: 'var(--border)', marginTop: 1,
              }}>
                {highImpact.slice(2).map(item => (
                  <NewsCard key={item.id} news={item} onClick={() => setSelectedNews(item)} />
                ))}
              </div>
            )}
          </>
        )}

        {/* Resto de noticias */}
        {rest.length > 0 && (
          <>
            <div style={{ height: 1, background: 'var(--border)', margin: '2rem 0' }} />
            <SectionLabel text="Otras noticias · Medio y bajo impacto" />
            <div style={{
              display: 'grid', gridTemplateColumns: '1fr 1fr',
              gap: 1, background: 'var(--border)',
            }}>
              {rest.map(item => (
                <NewsCard key={item.id} news={item} onClick={() => setSelectedNews(item)} />
              ))}
            </div>
          </>
        )}

        {filtered.length === 0 && (
          <div style={{
            textAlign: 'center', padding: '4rem',
            color: 'var(--muted)', fontFamily: "'DM Mono', monospace", fontSize: '0.85rem',
          }}>
            No hay noticias en esta categoría todavía.
          </div>
        )}
      </main>

      {/* Modal */}
      {selectedNews && (
        <NewsModal news={selectedNews} onClose={() => setSelectedNews(null)} />
      )}
    </div>
  )
}

function SectionLabel({ text }) {
  return (
    <div style={{
      fontFamily: "'DM Mono', monospace", fontSize: '0.7rem',
      letterSpacing: '0.15em', textTransform: 'uppercase',
      color: 'var(--muted)', marginBottom: '1rem',
      display: 'flex', alignItems: 'center', gap: 8,
    }}>
      {text}
      <span style={{ flex: 1, height: 1, background: 'var(--border)' }} />
    </div>
  )
}
