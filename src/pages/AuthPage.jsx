import { useState } from 'react'

function Input({ label, type = 'text', value, onChange, placeholder }) {
  return (
    <div style={{ marginBottom: '20px' }}>
      <label style={{
        display: 'block', fontSize: '11px', letterSpacing: '2px',
        textTransform: 'uppercase', color: '#8b7d6b', marginBottom: '8px',
        fontFamily: "'Courier New', monospace"
      }}>{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
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

function Btn({ children, onClick, disabled, variant = 'primary' }) {
  const isPrimary = variant === 'primary'
  const isGhost = variant === 'ghost'
  return (
    <button onClick={onClick} disabled={disabled} style={{
      width: '100%', padding: '14px',
      border: isPrimary ? 'none' : isGhost ? '1px solid rgba(255,255,255,0.15)' : '1px solid rgba(212,175,55,0.4)',
      borderRadius: '6px',
      background: isPrimary ? 'linear-gradient(135deg, #c9a227, #8b6914)' : 'transparent',
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

export default function AuthPage({ playAsGuest, signUp, logIn }) {
  const [mode, setMode] = useState('home') // 'home' | 'login' | 'signup' | 'guest'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [nickname, setNickname] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const cardStyle = {
    background: 'linear-gradient(160deg, rgba(30,22,12,0.97) 0%, rgba(18,14,8,0.99) 100%)',
    border: '1px solid rgba(212,175,55,0.2)', borderRadius: '16px', padding: '40px',
    boxShadow: '0 32px 80px rgba(0,0,0,0.6)',
    width: '100%', maxWidth: '400px', position: 'relative',
  }

  const ornaments = ['top-left', 'top-right', 'bottom-left', 'bottom-right'].map(pos => (
    <div key={pos} style={{
      position: 'absolute',
      [pos.includes('top') ? 'top' : 'bottom']: '12px',
      [pos.includes('left') ? 'left' : 'right']: '12px',
      width: '18px', height: '18px',
      borderTop: pos.includes('top') ? '1.5px solid rgba(212,175,55,0.35)' : 'none',
      borderBottom: pos.includes('bottom') ? '1.5px solid rgba(212,175,55,0.35)' : 'none',
      borderLeft: pos.includes('left') ? '1.5px solid rgba(212,175,55,0.35)' : 'none',
      borderRight: pos.includes('right') ? '1.5px solid rgba(212,175,55,0.35)' : 'none',
    }} />
  ))

  const header = (
    <div style={{ textAlign: 'center', marginBottom: '36px' }}>
      <div style={{ fontSize: '24px', letterSpacing: '6px', marginBottom: '8px' }}>♠ ♥ ♦ ♣</div>
      <h1 style={{
        fontFamily: "'Palatino Linotype', serif", fontSize: '32px',
        color: '#f0ece4', margin: '0 0 6px', letterSpacing: '3px', fontWeight: 'normal'
      }}>SWITCH</h1>
      <p style={{
        color: '#8b7d6b', fontSize: '11px', letterSpacing: '3px',
        textTransform: 'uppercase', fontFamily: "'Courier New', monospace", margin: 0
      }}>Online Card Room</p>
    </div>
  )

  async function handleAuth() {
    setLoading(true)
    setError('')
    const result = mode === 'login'
      ? await logIn({ email, password })
      : await signUp({ email, password, nickname })
    setLoading(false)
    if (result.error) setError(result.error)
  }

  function handleGuest() {
    if (nickname.trim().length < 2) return
    playAsGuest(nickname.trim())
  }

  // ── Home screen ───────────────────────────────────────────────────────────
  if (mode === 'home') {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'radial-gradient(ellipse at 30% 20%, #1e1408 0%, #0d0a06 60%, #080604 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '24px', fontFamily: "'Georgia', serif"
      }}>
        <div style={cardStyle}>
          {ornaments}
          {header}
          <Btn onClick={() => setMode('login')}>Log In</Btn>
          <Btn onClick={() => setMode('signup')} variant="outline">Create Account</Btn>
          <Btn onClick={() => setMode('guest')} variant="ghost">♟ Play as Guest</Btn>
          <p style={{
            color: '#4a4035', fontSize: '11px', textAlign: 'center',
            fontFamily: "'Courier New', monospace", letterSpacing: '1px',
            marginTop: '4px', marginBottom: '0'
          }}>
            Log in to save stats & track your progress
          </p>
        </div>
      </div>
    )
  }

  // ── Guest screen ──────────────────────────────────────────────────────────
  if (mode === 'guest') {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'radial-gradient(ellipse at 30% 20%, #1e1408 0%, #0d0a06 60%, #080604 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '24px', fontFamily: "'Georgia', serif"
      }}>
        <div style={cardStyle}>
          {ornaments}
          {header}
          <p style={{ color: '#6b5d4f', fontSize: '12px', fontFamily: "'Courier New', monospace", marginBottom: '24px', textAlign: 'center' }}>
            Playing as a guest means your progress won't be saved.
          </p>
          <Input label="Choose a Nickname" value={nickname} onChange={setNickname} placeholder="e.g. Ace" />
          <Btn onClick={handleGuest} disabled={nickname.trim().length < 2}>Play as Guest</Btn>
          <button onClick={() => { setMode('home'); setNickname('') }} style={{
            background: 'none', border: 'none', color: '#6b5d4f', cursor: 'pointer',
            fontSize: '12px', fontFamily: "'Courier New', monospace", letterSpacing: '1px',
            width: '100%', textAlign: 'center', padding: '8px',
          }}>← Back</button>
        </div>
      </div>
    )
  }

  // ── Login / Signup screen ─────────────────────────────────────────────────
  const isLogin = mode === 'login'
  const canSubmit = email.trim() && password.length >= 6 && (isLogin || nickname.trim().length >= 2) && !loading

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(ellipse at 30% 20%, #1e1408 0%, #0d0a06 60%, #080604 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '24px', fontFamily: "'Georgia', serif"
    }}>
      <div style={cardStyle}>
        {ornaments}
        {header}
        {!isLogin && (
          <Input label="Nickname" value={nickname} onChange={setNickname} placeholder="e.g. Ace" />
        )}
        <Input label="Email" type="email" value={email} onChange={setEmail} placeholder="your@email.com" />
        <Input label="Password" type="password" value={password} onChange={setPassword} placeholder="Min. 6 characters" />
        {error && (
          <p style={{ color: '#c0392b', fontSize: '12px', marginBottom: '16px', fontFamily: "'Courier New', monospace" }}>
            ✕ {error}
          </p>
        )}
        <Btn onClick={handleAuth} disabled={!canSubmit}>
          {loading ? (isLogin ? 'Logging in…' : 'Creating account…') : (isLogin ? 'Log In' : 'Sign Up')}
        </Btn>
        <button onClick={() => { setMode(isLogin ? 'signup' : 'login'); setError('') }} style={{
          background: 'none', border: 'none', color: '#6b5d4f', cursor: 'pointer',
          fontSize: '12px', fontFamily: "'Courier New', monospace", letterSpacing: '1px',
          width: '100%', textAlign: 'center', padding: '8px',
        }}>
          {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Log in'}
        </button>
        <button onClick={() => { setMode('home'); setError('') }} style={{
          background: 'none', border: 'none', color: '#4a4035', cursor: 'pointer',
          fontSize: '11px', fontFamily: "'Courier New', monospace", letterSpacing: '1px',
          width: '100%', textAlign: 'center', padding: '4px',
        }}>← Back</button>
      </div>
    </div>
  )
}