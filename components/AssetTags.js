// components/AssetTags.js
// Muestra los activos afectados al alza y a la baja

export default function AssetTags({ bullish = [], bearish = [], neutral = [] }) {
  return (
    <div>
      {bearish.length > 0 && (
        <div style={{ marginBottom: 8 }}>
          <div style={{
            fontFamily: "'DM Mono', monospace", fontSize: '0.65rem',
            letterSpacing: '0.1em', textTransform: 'uppercase',
            color: 'var(--down)', marginBottom: 4,
          }}>▼ Presión bajista</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {bearish.map(asset => (
              <AssetTag key={asset} label={asset} variant="down" />
            ))}
          </div>
        </div>
      )}
      {bullish.length > 0 && (
        <div style={{ marginBottom: neutral.length > 0 ? 8 : 0 }}>
          <div style={{
            fontFamily: "'DM Mono', monospace", fontSize: '0.65rem',
            letterSpacing: '0.1em', textTransform: 'uppercase',
            color: 'var(--up)', marginBottom: 4, marginTop: bearish.length > 0 ? 8 : 0,
          }}>▲ Presión alcista</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {bullish.map(asset => (
              <AssetTag key={asset} label={asset} variant="up" />
            ))}
          </div>
        </div>
      )}
      {neutral.length > 0 && (
        <div>
          <div style={{
            fontFamily: "'DM Mono', monospace", fontSize: '0.65rem',
            letterSpacing: '0.1em', textTransform: 'uppercase',
            color: 'var(--neutral)', marginBottom: 4, marginTop: 8,
          }}>↔ Neutral / Mixto</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {neutral.map(asset => (
              <AssetTag key={asset} label={asset} variant="neutral" />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function AssetTag({ label, variant }) {
  const styles = {
    up: {
      background: 'var(--up-dim)', color: 'var(--up)',
      border: '1px solid rgba(0,230,118,0.2)',
    },
    down: {
      background: 'var(--down-dim)', color: 'var(--down)',
      border: '1px solid rgba(255,77,109,0.2)',
    },
    neutral: {
      background: 'var(--neutral-dim)', color: 'var(--neutral)',
      border: '1px solid rgba(255,209,102,0.2)',
    },
  }

  return (
    <span style={{
      fontFamily: "'DM Mono', monospace", fontSize: '0.72rem',
      fontWeight: 500, padding: '3px 10px', borderRadius: 2,
      letterSpacing: '0.05em', ...styles[variant],
    }}>
      {label}
    </span>
  )
}
