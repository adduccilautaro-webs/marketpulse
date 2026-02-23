// components/NewsModal.js
'use client'
import { useEffect } from 'react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import AssetTags from './AssetTags'

export default function NewsModal({ news, onClose }) {
  // Cerrar con Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', handler)
      document.body.style.overflow = ''
    }
  }, [onClose])

  const dateStr = news.publishedAt
    ? format(new Date(news.publishedAt), "d 'de' MMMM yyyy · HH:mm 'UTC'", { locale: es })
    : ''

  const typeLabel = { noticia: 'Noticia', anuncio: 'Anuncio', rumor: 'Rumor' }[news.type] || 'Noticia'
  const impactLabel = { alto: 'Alto impacto', medio: 'Medio impacto', bajo: 'Bajo impacto' }[news.impact] || ''

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(10,12,15,0.92)',
        zIndex: 200, display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        padding: '2rem',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          maxWidth: 640, width: '100%',
          maxHeight: '85vh', overflowY: 'auto',
          padding: '2rem', position: 'relative',
        }}
      >
        {/* Botón cerrar */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute', top: '1rem', right: '1rem',
            background: 'none', border: '1px solid var(--border)',
            color: 'var(--muted)', width: 32, height: 32,
            cursor: 'pointer', fontSize: '1rem', borderRadius: 2,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >✕</button>

        {/* Meta */}
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
          <span style={{
            fontFamily: "'DM Mono', monospace", fontSize: '0.65rem',
            fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase',
            background: news.impact === 'alto' ? 'var(--down-dim)' : news.impact === 'medio' ? 'var(--neutral-dim)' : 'var(--up-dim)',
            color: news.impact === 'alto' ? 'var(--down)' : news.impact === 'medio' ? 'var(--neutral)' : 'var(--up)',
            border: `1px solid ${news.impact === 'alto' ? 'rgba(255,77,109,0.25)' : news.impact === 'medio' ? 'rgba(255,209,102,0.25)' : 'rgba(0,230,118,0.25)'}`,
            padding: '3px 8px', borderRadius: 2,
          }}>{impactLabel}</span>
          <span style={{
            fontFamily: "'DM Mono', monospace", fontSize: '0.65rem',
            letterSpacing: '0.1em', textTransform: 'uppercase',
            color: news.type === 'rumor' ? 'var(--neutral)' : news.type === 'anuncio' ? 'var(--accent)' : 'var(--muted)',
            border: `1px solid ${news.type === 'rumor' ? 'rgba(255,209,102,0.3)' : news.type === 'anuncio' ? 'rgba(79,195,247,0.3)' : 'var(--border)'}`,
            padding: '2px 7px', borderRadius: 2,
          }}>{typeLabel}</span>
        </div>

        {/* Titular */}
        <h2 style={{
          fontFamily: "'DM Serif Display', serif",
          fontSize: '1.5rem', lineHeight: 1.3,
          marginBottom: '1rem', color: 'var(--text)',
        }}>{news.headline}</h2>

        {/* Resumen */}
        <p style={{
          fontSize: '0.88rem', lineHeight: 1.7,
          color: '#8a93a8', marginBottom: '1.5rem',
        }}>{news.summary}</p>

        {/* Advertencia rumor */}
        {news.type === 'rumor' && (
          <div style={{
            background: 'var(--neutral-dim)', border: '1px solid rgba(255,209,102,0.2)',
            padding: '0.75rem 1rem', marginBottom: '1.25rem', borderRadius: 2,
            fontFamily: "'DM Mono', monospace", fontSize: '0.75rem', color: 'var(--neutral)',
          }}>
            ⚠️ Este es un rumor no confirmado por fuentes oficiales.
          </div>
        )}

        {/* Análisis de activos */}
        <div style={{
          background: 'var(--surface2)', border: '1px solid var(--border)',
          padding: '1.25rem', marginBottom: '1.25rem',
        }}>
          <div style={{
            fontFamily: "'DM Mono', monospace", fontSize: '0.7rem',
            letterSpacing: '0.12em', textTransform: 'uppercase',
            color: 'var(--muted)', marginBottom: '1rem',
          }}>Análisis de impacto por activo</div>
          <AssetTags bullish={news.bullish} bearish={news.bearish} neutral={news.neutral} />
        </div>

        {/* Fuente y fecha */}
        <div style={{
          fontFamily: "'DM Mono', monospace", fontSize: '0.68rem',
          color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: 6,
        }}>
          <span style={{
            width: 5, height: 5, borderRadius: '50%',
            background: 'var(--muted)', display: 'inline-block',
          }} />
          {news.source} {dateStr && `· ${dateStr}`}
        </div>

        {/* Link original */}
        {news.url && (
          <a
            href={news.url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-block', marginTop: '1rem',
              fontFamily: "'DM Mono', monospace", fontSize: '0.72rem',
              color: 'var(--accent)', letterSpacing: '0.05em',
              textDecoration: 'underline',
            }}
          >
            Ver artículo original →
          </a>
        )}
      </div>
    </div>
  )
}
