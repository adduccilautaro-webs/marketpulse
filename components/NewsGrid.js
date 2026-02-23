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
    <div style
