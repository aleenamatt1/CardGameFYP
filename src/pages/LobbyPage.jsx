import { useState, useEffect } from 'react'
import { useLobby } from '../hooks/useLobby'

const suits = ['♠', '♥', '♦', '♣']

function FloatingCards() {
  return (
    <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
      {[...Array(12)].map((_, i) => {
        const suit = suits[i % 4]
        const isRed = suit === '♥' || suit === '♦'
        const size = 40 + (i % 3) * 20
        const startX = (i * 137.5) % 100
        const delay = (i * 0.7) % 8
        const duration = 12 + (i % 5) * 3
        return (
          <div key={i} style={{
            position: 'absolute', left: `${startX}%`, top: `${110 + (i % 3) * 5}%`,
            fontSize: `${size}px`,
            color: isRed ? 'rgba(180,40,40,0.12)' : 'rgba(200,200,220,0.08)',
            animation: `floatUp ${duration}s ${delay}s infinite linear`,
            userSelect: 'none', fontFamily: 'serif',
          }}>{suit}</div>
        )
      })}
    </div>
  )
}

function UICard({ children, style = {} }) {
  return (
    <div style={{
      background: 'linear-gradient(160deg, rgba(30,22,12,0.97) 0%, rgba(18,14,8,0.99) 100%)',
      border: '1px solid rgba(212,175,55,0.2)', borderRadius: '16px', padding: '40px',
      boxShadow: '0 32px 80px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.05)',
      position: 'relative', zIndex: 1, ...style,
    }}>
      {['top-left', 'top-right', 'bottom-left', 'bottom-right'].map(pos => (
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
      ))}
      {children}
    </div>
  )
}

function Input({ label, type = 'text', value, onChange, placeholder, maxLength }) {
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

function Btn({ children, onClick, variant = 'primary', disabled }) {
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

function HomeScreen({ onCreate, onJoin }) {
  return (
    <UICard style={{ textAlign: 'center', maxWidth: '420px', width: '100%' }}>
      <div style={{ marginBottom: '8px', fontSize: '30px', letterSpacing: '6px' }}>♠ ♥ ♦ ♣</div>
      <h1 style={{
        fontFamily: "'Palatino Linotype', serif", fontSize: '36px',
        color: '#f0ece4', margin: '0 0 6px', letterSpacing: '3px', fontWeight: 'normal'
      }}>SWITCH</h1>
      <p style={{
        color: '#8b7d6b', fontSize: '12px', letterSpacing: '3px',
        textTransform: 'uppercase', marginBottom: '44px',
        fontFamily: "'Courier New', monospace"
      }}>Online Card Room</p>
      <Btn onClick={onCreate}>⊕ &nbsp;Create a Game</Btn>
      <Btn onClick={onJoin} variant="outline">⊞ &nbsp;Join a Game</Btn>
      <p style={{ color: '#4a4035', fontSize: '11px', marginTop: '20px', fontFamily: "'Courier New', monospace" }}>── Est. 2025 ──</p>
    </UICard>
  )
}

function CreateScreen({ onBack, onCreated }) {
  const { createLobby, loading, error } = useLobby()
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [success, setSuccess] = useState(false)
  const mismatch = confirm && password !== confirm
  const canSubmit = name.trim() && password.length >= 4 && !mismatch && !loading

  async function handleCreate() {
    if (!canSubmit) return
    const lobby = await createLobby({ name, password })
    if (lobby) {
      setSuccess(true)
      setTimeout(() => onCreated(lobby), 1200)
    }
  }

  return (
    <UICard style={{ maxWidth: '420px', width: '100%' }}>
      <button onClick={onBack} style={{
        background: 'none', border: 'none', color: '#8b7d6b', cursor: 'pointer',
        fontSize: '12px', letterSpacing: '2px', textTransform: 'uppercase',
        fontFamily: "'Courier New', monospace", padding: '0', marginBottom: '28px'
      }}>← Back</button>
      <h2 style={{
        fontFamily: "'Palatino Linotype', serif", fontSize: '24px',
        color: '#f0ece4', margin: '0 0 6px', fontWeight: 'normal'
      }}>Create a Lobby</h2>
      <p style={{ color: '#6b5d4f', fontSize: '12px', marginBottom: '32px', fontFamily: "'Courier New', monospace" }}>
        Set a name and password for your table
      </p>
      {success ? (
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <div style={{ fontSize: '40px', marginBottom: '12px' }}>♛</div>
          <p style={{ color: '#d4af37', fontFamily: "'Palatino Linotype', serif", fontSize: '18px' }}>Lobby created!</p>
          <p style={{ color: '#6b5d4f', fontSize: '12px', fontFamily: "'Courier New', monospace" }}>Entering "{name}"…</p>
        </div>
      ) : (
        <>
          <Input label="Lobby Name" value={name} onChange={setName} placeholder="e.g. Dragon's Den" maxLength={30} />
          <Input label="Password" type="password" value={password} onChange={setPassword} placeholder="Min. 4 characters" />
          <Input label="Confirm Password" type="password" value={confirm} onChange={setConfirm} placeholder="Repeat password" />
          {mismatch && (
            <p style={{ color: '#c0392b', fontSize: '12px', marginBottom: '16px', fontFamily: "'Courier New', monospace" }}>
              ✕ Passwords do not match
            </p>
          )}
          {error && (
            <p style={{ color: '#c0392b', fontSize: '12px', marginBottom: '16px', fontFamily: "'Courier New', monospace" }}>
              ✕ {error}
            </p>
          )}
          <Btn onClick={handleCreate} disabled={!canSubmit}>
            {loading ? 'Creating…' : 'Create Lobby'}
          </Btn>
        </>
      )}
    </UICard>
  )
}

function JoinScreen({ onBack, onJoined }) {
  const { fetchLobbies, joinLobby, loading, error } = useLobby()
  const [lobbies, setLobbies] = useState([])
  const [selected, setSelected] = useState(null)
  const [password, setPassword] = useState('')
  const [joinError, setJoinError] = useState('')
  const [success, setSuccess] = useState(false)
  const [fetching, setFetching] = useState(true)
  const selectedLobby = lobbies.find(l => l.id === selected)

  useEffect(() => {
    async function load() {
      const data = await fetchLobbies()
      setLobbies(data)
      setFetching(false)
    }
    load()
  }, [])

  async function handleJoin() {
    if (!selected || !password) return
    const lobby = await joinLobby({ lobbyId: selected, password })
    if (lobby) {
      setSuccess(true)
      setTimeout(() => onJoined(lobby), 1200)
    } else {
      setJoinError('Incorrect password. Please try again.')
    }
  }

  return (
    <UICard style={{ maxWidth: '480px', width: '100%' }}>
      <button onClick={onBack} style={{
        background: 'none', border: 'none', color: '#8b7d6b', cursor: 'pointer',
        fontSize: '12px', letterSpacing: '2px', textTransform: 'uppercase',
        fontFamily: "'Courier New', monospace", padding: '0', marginBottom: '28px'
      }}>← Back</button>
      <h2 style={{
        fontFamily: "'Palatino Linotype', serif", fontSize: '24px',
        color: '#f0ece4', margin: '0 0 6px', fontWeight: 'normal'
      }}>Join a Game</h2>
      <p style={{ color: '#6b5d4f', fontSize: '12px', marginBottom: '24px', fontFamily: "'Courier New', monospace" }}>
        Select a table, then enter its password
      </p>
      {success ? (
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <div style={{ fontSize: '40px', marginBottom: '12px' }}>♟</div>
          <p style={{ color: '#d4af37', fontFamily: "'Palatino Linotype', serif", fontSize: '18px' }}>Access granted!</p>
          <p style={{ color: '#6b5d4f', fontSize: '12px', fontFamily: "'Courier New', monospace" }}>Entering "{selectedLobby?.name}"…</p>
        </div>
      ) : (
        <>
          <div style={{ marginBottom: '24px' }}>
            {fetching ? (
              <p style={{ color: '#6b5d4f', fontSize: '13px', textAlign: 'center', fontFamily: "'Courier New', monospace" }}>
                Loading tables…
              </p>
            ) : lobbies.length === 0 ? (
              <p style={{ color: '#6b5d4f', fontSize: '13px', textAlign: 'center', fontFamily: "'Courier New', monospace" }}>
                No open lobbies. Create one!
              </p>
            ) : (
              lobbies.map(lobby => (
                <div key={lobby.id} onClick={() => { setSelected(lobby.id); setJoinError(''); setPassword('') }}
                  style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '14px 16px', marginBottom: '8px', borderRadius: '8px',
                    border: selected === lobby.id ? '1px solid rgba(212,175,55,0.55)' : '1px solid rgba(255,255,255,0.07)',
                    background: selected === lobby.id ? 'rgba(212,175,55,0.08)' : 'rgba(255,255,255,0.02)',
                    cursor: 'pointer', transition: 'all 0.15s'
                  }}>
                  <span style={{ color: '#f0ece4', fontFamily: "'Georgia', serif", fontSize: '15px' }}>
                    {lobby.name} <span style={{ color: '#6b5d4f', fontSize: '11px' }}>🔒</span>
                  </span>
                </div>
              ))
            )}
          </div>
          {selected && (
            <>
              <Input
                label={`Password for "${selectedLobby?.name}"`}
                type="password" value={password}
                onChange={v => { setPassword(v); setJoinError('') }}
                placeholder="Enter lobby password"
              />
              {joinError && (
                <p style={{ color: '#c0392b', fontSize: '12px', marginBottom: '16px', fontFamily: "'Courier New', monospace" }}>
                  ✕ {joinError}
                </p>
              )}
              <Btn onClick={handleJoin} disabled={!password || loading}>
                {loading ? 'Checking…' : 'Enter Table'}
              </Btn>
            </>
          )}
          {!selected && lobbies.length > 0 && (
            <p style={{ color: '#4a4035', fontSize: '11px', textAlign: 'center', fontFamily: "'Courier New', monospace" }}>
              ↑ Select a table above to continue
            </p>
          )}
        </>
      )}
    </UICard>
  )
}

function WaitingRoom({ lobby, onLeave }) {
  return (
    <UICard style={{ maxWidth: '420px', width: '100%', textAlign: 'center' }}>
      <div style={{ fontSize: '48px', marginBottom: '16px' }}>♠</div>
      <h2 style={{
        fontFamily: "'Palatino Linotype', serif", fontSize: '28px',
        color: '#f0ece4', margin: '0 0 8px', fontWeight: 'normal'
      }}>{lobby.name}</h2>
      <p style={{
        color: '#8b7d6b', fontSize: '11px', letterSpacing: '2px',
        textTransform: 'uppercase', fontFamily: "'Courier New', monospace", marginBottom: '32px'
      }}>Waiting for players…</p>
      <div style={{
        background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '8px', padding: '20px', marginBottom: '28px'
      }}>
        <p style={{ color: '#6b5d4f', fontSize: '11px', letterSpacing: '1px', fontFamily: "'Courier New', monospace", margin: '0 0 10px' }}>
          PLAYERS IN ROOM
        </p>
        {['You (host)', 'Waiting…', 'Waiting…', 'Waiting…'].map((p, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 0',
            borderBottom: i < 3 ? '1px solid rgba(255,255,255,0.04)' : 'none'
          }}>
            <div style={{
              width: '8px', height: '8px', borderRadius: '50%',
              background: i === 0 ? '#d4af37' : 'rgba(255,255,255,0.12)'
            }} />
            <span style={{ color: i === 0 ? '#d4af37' : '#4a4035', fontFamily: "'Georgia', serif", fontSize: '14px' }}>{p}</span>
          </div>
        ))}
      </div>
      <Btn onClick={onLeave} variant="ghost">Leave Table</Btn>
    </UICard>
  )
}

export default function LobbyPage() {
  const [screen, setScreen] = useState('home')
  const [activeLobby, setActiveLobby] = useState(null)

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(ellipse at 30% 20%, #1e1408 0%, #0d0a06 60%, #080604 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '24px', position: 'relative', fontFamily: "'Georgia', serif"
    }}>
      <FloatingCards />
      {screen === 'home' && <HomeScreen onCreate={() => setScreen('create')} onJoin={() => setScreen('join')} />}
      {screen === 'create' && <CreateScreen onBack={() => setScreen('home')} onCreated={l => { setActiveLobby(l); setScreen('lobby') }} />}
      {screen === 'join' && <JoinScreen onBack={() => setScreen('home')} onJoined={l => { setActiveLobby(l); setScreen('lobby') }} />}
      {screen === 'lobby' && activeLobby && <WaitingRoom lobby={activeLobby} onLeave={() => { setActiveLobby(null); setScreen('home') }} />}
    </div>
  )
}