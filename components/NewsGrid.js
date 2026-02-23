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
  const [search, setSearch] = useState('')

  // Contar por categoría
  const counts = news.reduce((acc, item) => {
    acc[item.impact] = (acc[item.impact] || 0) + 1
    return acc
  }, {})

  // Filtrar por categoría/tipo y búsqueda
  const filtered = news.filter(item => {
    const matchFilter = activeFilter === 'all' || item.type === activeFilter || item.category === activeFilter
    const matchSearch = search === '' ||
      item.headline.toLowerCase().includes(search.toLowerCase()) ||
      item.summary.toLowerCase().includes(search.toLowerCase()) ||
      item.bullish.some(a => a.toLowerCase().includes(search.toLowerCase())) ||
      item.bearish.some(a => a.toLowerCase().includes(search.toLowerCase()))
    return matchFilter && matchSearch
  })

  const highImpact = filtered.filter(n => n.impact === 'alto')
  const rest = filtered.filter(n => n.impact !== 'alto')

  return (
    <div style={{ position: 'relative', zIndex: 1 }}>

      {/* Contador por impacto */}
      <div style={{
        maxWidth: 1200, margin: '1.5rem auto 0',
        padding: '0 2rem', display: 'flex', gap: '1rem', flexWrap: 'wrap',
      }}>
        <StatBox label="Alto impacto" count={counts.alto || 0} color="var(--down)" />
        <StatBox label="Medio impacto" count={counts.medio || 0} color="var(--neutral)" />
        <StatBox label="Bajo impacto" count={counts.bajo || 0} color="var(--up)" />
        <StatBox label="Total noticias" count={news.length} color="var(--accent)" />
      </div>

      {/* Buscador */}
      <div style={{
        maxWidth: 1200, margin: '1.25rem auto 0',
        padding: '0 2rem',
      }}>
        <input
          type="text"
          placeholder="🔍  Buscar por titular, resumen o activo (ej: oro, EUR/USD, Fed...)"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            width: '100%',
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            color: 'var(--text)',
            fontFamily: "'Syne', sans-serif",
            fontSize: '0.85rem',
            padding: '10px 16px',
            borderRadius: 2,
            outline: 'none',
          }}
        />
      </div>

      {/* Filtros */}
      <div style={{
        maxWidth: 1200, m

        
