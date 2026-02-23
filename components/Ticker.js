// components/Ticker.js
// Banda de precios en tiempo real (datos de ejemplo, reemplazar con API real)

const TICKERS = [
  { sym: 'SPX', price: '5.847,21', chg: '+0.42%', up: true },
  { sym: 'GOLD', price: '2.384,50', chg: '+1.18%', up: true },
  { sym: 'BTC', price: '68.220', chg: '−2.33%', up: false },
  { sym: 'EUR/USD', price: '1,0851', chg: '−0.21%', up: false },
  { sym: 'WTI', price: '82,40', chg: '+0.87%', up: true },
  { sym: 'NDX', price: '20.541', chg: '+0.61%', up: true },
  { sym: 'DXY', price: '104,32', chg: '+0.19%', up: true },
  { sym: 'SILVER', price: '27,84', chg: '+0.54%', up: true },
  { sym: 'NIKKEI', price: '38.460', chg: '−0.31%', up: false },
  { sym: 'Brent', price: '86,10', chg: '+0.92%', up: true },
  { sym: 'GBP/USD', price: '1,2741', chg: '−0.15%', up: false },
]

export default function Ticker() {
  const items = [...TICKERS, ...TICKERS] // duplicar para loop infinito

  return (
    <div style={{
      background: 'var(--surface)',
      borderBottom: '1px solid var(--border)',
      overflow: 'hidden', height: 36,
    }}>
      <div style={{
        display: 'flex', alignItems: 'center',
        height: '100%', animation: 'ticker 35s linear infinite',
        whiteSpace: 'nowrap',
      }}>
        {items.map((t, i) => (
          <span key={i} style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{
              fontFamily: "'DM Mono', monospace", fontSize: '0.78rem',
              padding: '0 1.25rem', display: 'flex', alignItems: 'center', gap: 8,
              color: 'var(--muted)',
            }}>
              <span style={{ color: 'var(--text)', fontWeight: 500 }}>{t.sym}</span>
              {t.price}
              <span style={{ color: t.up ? 'var(--up)' : 'var(--down)' }}>{t.chg}</span>
            </span>
            <span style={{ color: 'var(--border)' }}>|</span>
          </span>
        ))}
      </div>
      <style>{`
        @keyframes ticker {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  )
}
