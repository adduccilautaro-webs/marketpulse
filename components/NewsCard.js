// components/NewsCard.js
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import AssetTags from './AssetTags'

const IMPACT_COLORS = {
  alto: { bg: 'var(--down-dim)', color: 'var(--down)', border: 'rgba(255,77,109,0.25)', bar: 'var(--down)' },
  medio: { bg: 'var(--neutral-dim)', color: 'var(--neutral)', border: 'rgba(255,209,102,0.25)', bar: 'var(--neutral)' },
  bajo: { bg: 'var(--up-dim)', color: 'var(--up)', border: 'rgba(0,230,118,0.25)', bar: 'var(--up)' },
}

const TYPE_COLORS = {
  rumor: { color: 'var(--neutral)', border: 'rgba(255,209,102,0.3)' },
  anuncio: { color: 'var(--accent)', border: 'rgba(79,195,247,0.3)' },
  noticia: { color: 'var(--muted)', border: 'var(--border)' },
}

export default function NewsCard({ news, featured = false, onClick }) {
  const impact = IMPACT_COLORS[news.impact] || IMPACT_COLORS.medio
  const typeStyle = TYPE_COLORS[news.type] || TYPE_COLORS.noticia

  const timeAgo = news.publishedAt
    ? formatDistanceToNow(new Date(news.publishedAt), { addSuffix: true, locale: es })
    : ''

  return (
    <div
      onClick={onClick}
      style={{
        background: 'var(--surface)',
        padding: '1.75rem',
        cursor: 'pointer',
        position: 'relative',
        overflow: 'hidden',
        transition: 'background 0.2s',
      }}
      onMouseEnter={e => e.currentTarget.style.background = 'var(--surface2)'}
      onMouseLeave={e => e.currentTarget.style.background = 'var(--surface)'}
    >
      {/* Barra lateral de impacto */}
      <div style={{
        position: 'absolute', top: 0, left: 0,
        width: 3, height: '100%',
        background: impact.bar,
      }} />

      {/* Meta */}
      <div style={{
        display: 'flex', alignItems: 'center',
        gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap',
      }}>
        <span style={{
          fontFamily: "'DM Mono', monospace", fontSize: '0.65rem',
          fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase',
          background: impact.bg, color: impact.color,
          border: `1px solid ${impact.border}`,
          padding: '3px 8px', borderRadius: 2,
        }}>
          {news.impact === 'alto' ? '▲ Alto' : news.impact === 'medio' ? '◆ Medio' : '● Bajo'} impacto
        </span>
        <span style={{
          fontFamily: "'DM Mono', monospace", fontSize: '0.65rem',
          letterSpacing: '0.1em', textTransform: 'uppercase',
          color: typeStyle.color, border: `1px solid ${typeStyle.border}`,
          padding: '2px 7px', borderRadius: 2,
        }}>
          {news.type}
        </span>
        <span style={{
          marginLeft: 'auto', fontFamily: "'DM Mono', monospace",
          fontSize: '0.68rem', color: 'var(--muted)',
        }}>
          {timeAgo}
        </span>
      </div>

      {/* Titular */}
      <h2 style={{
        fontFamily: "'DM Serif Display', serif",
        fontSize: featured ? '1.45rem' : '1.1rem',
        lineHeight: 1.35, color: 'var(--text)', marginBottom: '0.75rem',
      }}>
        {news.headline}
      </h2>

      {/* Resumen */}
      <p style={{
        fontSize: '0.84rem', lineHeight: 1.6,
        color: '#8a93a8', marginBottom: '1.25rem',
      }}>
        {news.summary}
      </p>

      {/* Activos */}
      <AssetTags bullish={news.bullish} bearish={news.bearish} neutral={news.neutral} />

      {/* Fuente */}
      {news.source && (
        <div style={{
          marginTop: '1rem', fontFamily: "'DM Mono', monospace",
          fontSize: '0.68rem', color: 'var(--muted)',
          display: 'flex', alignItems: 'center', gap: 6,
        }}>
          <span style={{
            width: 5, height: 5, borderRadius: '50%',
            background: 'var(--muted)', display: 'inline-block',
          }} />
          {news.source}
        </div>
      )}
    </div>
  )
}
