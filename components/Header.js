'use client'
import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'

export default function Header() {
  const [time, setTime] = useState('')
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    const update = () => {
      const now = new Date()
      const h = String(now.getUTCHours()).padStart(2, '0')
      const m = String(now.getUTCMinutes()).padStart(2, '0')
      const s = String(now.getUTCSeconds()).padStart(2, '0')
      setTime(`${h}:${m}:${s} UTC`)
    }
    update()
    const id = setInterval(update, 1000)
    return () => clearInterval(id)
  }, [])

  const navItems = [
    { label: 'Noticias', path: '/' },
    { label: 'Analizar Activo', path: '/analyze' },
    { label: 'Portfolio', path: '/portfolio' },
    { label: 'Calendario', path: '/calendar' },
    { label: 'Simulador', path: '/simulator' },
    { label: 'Comparar', path: '/compare' },
  ]

  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 100,
      background: 'rgba(10,12,15,0.92)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid var(--border)',
      padding: '0 2rem',
    }}>
      <div style={{
        maxWidth: 1200, margin: '0 auto',
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', height: 64,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <div
            onClick={() => router.push('/')}
            style={{
              fontFamily: "'DM Serif Display', serif",
              fontSize: '1.5rem', letterSpacing: '-0.5px',
              display: 'flex', alignItems: 'center', gap: 8,
              cursor: 'pointer',
            }}
          >
            <span style={{
              width: 8, height: 8, background: 'var(--accent)',
              borderRadius: '50%', display: 'inline-block',
              animation: 'pulse 2s ease-in-out infinite',
            }} />
            MarketPulse
          </div>

          <nav style={{ display: 'flex', gap: '0.25rem' }}>
            {navItems.map(function(item) {
              const active = pathname === item.path
              return (
                <button
                  key={item.path}
                  onClick={() => router.push(item.path)}
                  style={{
                    fontFamily: "'DM Mono', monospace",
                    fontSize: '0.72rem', fontWeight: 500,
                    letterSpacing: '0.08em', textTransform: 'uppercase',
                    background: active ? 'var(--accent-dim)' : 'transparent',
                    color: active ? 'var(--accent)' : 'var(--muted)',
                    border: active ? '1px solid rgba(79,195,247,0.3)' : '1px solid transparent',
                    padding: '5px 14px', borderRadius: 2,
                    cursor: 'pointer', transition: 'all 0.2s',
                  }}
                  onMouseEnter={function(e) {
                    if (!active) e.currentTarget.style.color = 'var(--text)'
                  }}
                  onMouseLeave={function(e) {
                    if (!active) e.currentTarget.style.color = 'var(--muted)'
                  }}
                >
                  {item.label}
                </button>
              )
            })}
          </nav>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{
            fontFamily: "'DM Mono', monospace", fontSize: '0.65rem',
            letterSpacing: '0.1em', textTransform: 'uppercase',
            background: 'var(--down-dim)', color: 'var(--down)',
            border: '1px solid rgba(255,77,109,0.25)',
            padding: '2px 8px', borderRadius: 2,
          }}>● EN VIVO</span>
          <span style={{
            fontFamily: "'DM Mono', monospace",
            fontSize: '0.8rem', color: 'var(--muted)', letterSpacing: '0.05em',
          }}>{time}</span>
        </div>
      </div>
      <style>{`
        @keyframes pulse {
          0%,100% { opacity:1; transform:scale(1); }
          50% { opacity:0.4; transform:scale(0.7); }
        }
      `}</style>
    </header>
  )
}
