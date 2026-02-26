'use client'
import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    setMenuOpen(false)
  }, [pathname])

  const navItems = [
    { label: 'Noticias', path: '/' },
    { label: 'Analizar', path: '/analyze' },
    { label: 'Portfolio', path: '/portfolio' },
    { label: 'Calendario', path: '/calendar' },
    { label: 'Simulador', path: '/simulator' },
    { label: 'Comparar', path: '/compare' },
    { label: 'Mis Ideas', path: '/ideas' },
  ]

  function navigate(path) {
    setMenuOpen(false)
    router.push(path)
  }

  return (
    <>
      <style>{`
        @keyframes pulse {
          0%,100% { opacity:1; transform:scale(1); }
          50% { opacity:0.4; transform:scale(0.7); }
        }
        .desktop-nav { display: flex; align-items: center; gap: 4px; }
        .hamburger { display: none !important; }
        .live-badge { display: inline-block; }
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .hamburger { display: flex !important; }
          .live-badge { display: none !important; }
        }
      `}</style>

      <header style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(10,12,15,0.96)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--border)',
        padding: '0 1.25rem',
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 56 }}>

          <div
            onClick={() => navigate('/')}
            style={{ fontFamily: "'DM Serif Display', serif", fontSize: '1.3rem', letterSpacing: '-0.5px', display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', color: 'var(--text)' }}
          >
            <span style={{ width: 8, height: 8, background: 'var(--accent)', borderRadius: '50%', display: 'inline-block', animation: 'pulse 2s ease-in-out infinite' }} />
            MarketPulse
          </div>

          <nav className="desktop-nav">
            {navItems.map(function(item) {
              const active = pathname === item.path
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  style={{
                    fontFamily: "'DM Mono', monospace", fontSize: '0.68rem', fontWeight: 500,
                    letterSpacing: '0.06em', textTransform: 'uppercase',
                    background: active ? 'var(--accent-dim)' : 'transparent',
                    color: active ? 'var(--accent)' : 'var(--muted)',
                    border: active ? '1px solid rgba(79,195,247,0.3)' : '1px solid transparent',
                    padding: '4px 10px', borderRadius: 2, cursor: 'pointer', transition: 'all 0.2s',
                  }}
                >
                  {item.label}
                </button>
              )
            })}
          </nav>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span className="live-badge" style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.6rem', letterSpacing: '0.1em', textTransform: 'uppercase', background: 'var(--down-dim)', color: 'var(--down)', border: '1px solid rgba(255,77,109,0.25)', padding: '2px 6px', borderRadius: 2 }}>
              ● LIVE
            </span>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="hamburger"
              style={{ background: 'none', border: '1px solid var(--border)', color: 'var(--text)', width: 40, height: 40, cursor: 'pointer', borderRadius: 2, alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}
            >
              {menuOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>
      </header>

      {menuOpen && (
        <div style={{
          position: 'fixed', top: 56, left: 0, right: 0, bottom: 0,
          background: 'rgba(10,12,15,0.98)',
          zIndex: 99, padding: '1.5rem',
          display: 'flex', flexDirection: 'column', gap: 6,
          overflowY: 'auto',
        }}>
          {navItems.map(function(item) {
            const active = pathname === item.path
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                style={{
                  fontFamily: "'DM Mono', monospace", fontSize: '1rem', fontWeight: 500,
                  letterSpacing: '0.08em', textTransform: 'uppercase',
                  background: active ? 'var(--accent-dim)' : 'var(--surface)',
                  color: active ? 'var(--accent)' : 'var(--text)',
                  border: active ? '1px solid rgba(79,195,247,0.3)' : '1px solid var(--border)',
                  padding: '16px 20px', borderRadius: 2, cursor: 'pointer', textAlign: 'left', width: '100%',
                }}
              >
                {active ? '→ ' : ''}{item.label}
              </button>
            )
          })}
        </div>
      )}
    </>
  )
}
