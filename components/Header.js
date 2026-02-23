// components/Header.js
'use client'
import { useEffect, useState } from 'react'

export default function Header() {
  const [time, setTime] = useState('')

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
        <div style={{
          fontFamily: "'DM Serif Display', serif",
          fontSize: '1.5rem', letterSpacing: '-0.5px',
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <span style={{
            width: 8, height: 8, background: 'var(--accent)',
            borderRadius: '50%', display: 'inline-block',
            animation: 'pulse 2s ease-in-out infinite',
          }} />
          MarketPulse
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
