export function Input({ label, type = 'text', value, onChange, placeholder, maxLength }) {
  return (
    <div style={{ marginBottom: '20px' }}>
      <label style={{
        display: 'block', fontSize: '11px', letterSpacing: '2px',
        textTransform: 'uppercase', color: '#8b7d6b', marginBottom: '8px',
        fontFamily: "'Courier New', monospace"
      }}>{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)}
        placeholder={placeholder} maxLength={maxLength}
        style={{
          width: '100%', background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.12)', borderRadius: '6px',
          padding: '12px 16px', color: '#f0ece4', fontSize: '15px',
          fontFamily: "'Georgia', serif", outline: 'none',
          boxSizing: 'border-box', transition: 'border-color 0.2s'
        }}
        onFocus={e => e.target.style.borderColor = 'rgba(212,175,55,0.6)'}
        onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.12)'}
      />
    </div>
  )
}

export function Btn({ children, onClick, variant = 'primary', disabled }) {
  const isPrimary = variant === 'primary'
  const isGhost = variant === 'ghost'
  return (
    <button onClick={onClick} disabled={disabled} style={{
      width: '100%', padding: '14px',
      border: isPrimary ? 'none' : isGhost ? '1px solid rgba(255,255,255,0.15)' : '1px solid rgba(212,175,55,0.4)',
      borderRadius: '6px',
      background: isPrimary ? 'linear-gradient(135deg, #c9a227, #8b6914)' : isGhost ? 'transparent' : 'rgba(212,175,55,0.08)',
      color: isPrimary ? '#1a1208' : '#d4af37', fontSize: '13px', letterSpacing: '2px',
      textTransform: 'uppercase', fontFamily: "'Courier New', monospace",
      fontWeight: isPrimary ? '700' : '500',
      cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.5 : 1,
      transition: 'all 0.2s', marginBottom: '10px',
    }}
      onMouseEnter={e => { if (!disabled) e.target.style.opacity = '0.85' }}
      onMouseLeave={e => { if (!disabled) e.target.style.opacity = '1' }}
    >{children}</button>
  )
}
