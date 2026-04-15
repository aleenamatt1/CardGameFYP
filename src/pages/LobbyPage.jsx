import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLobby } from '../hooks/useLobby'
import { useGame } from '../hooks/useGame'
import { supabase } from '../lib/supabase'
import { Input, Btn } from '../components/ui'

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


function HomeScreen({ nickname, onCreate, onJoin, isGuest }) {
  const navigate = useNavigate()
  return (
    <UICard style={{ textAlign: 'center', maxWidth: '420px', width: '100%' }}>
      <div style={{ marginBottom: '8px', fontSize: '30px', letterSpacing: '6px' }}>♠ ♥ ♦ ♣</div>
      <h1 style={{
        fontFamily: "'Palatino Linotype', serif", fontSize: '36px',
        color: '#f0ece4', margin: '0 0 6px', letterSpacing: '3px', fontWeight: 'normal'
      }}>SWITCH</h1>
      <p style={{
        color: '#8b7d6b', fontSize: '12px', letterSpacing: '3px',
        textTransform: 'uppercase', marginBottom: '8px',
        fontFamily: "'Courier New', monospace"
      }}>Online Card Room</p>
      <p style={{
        color: '#d4af37', fontSize: '14px', marginBottom: '36px',
        fontFamily: "'Georgia', serif"
      }}>Welcome {nickname}</p>
      <Btn onClick={onCreate}>⊕ &nbsp;Create a Game</Btn>
      <Btn onClick={onJoin} variant="outline">⊞ &nbsp;Join a Game</Btn>
      {!isGuest && (
      <Btn onClick={() => navigate('/stats')} variant="ghost">♦ &nbsp;Statistics</Btn>
      )}
      <p style={{ color: '#4a4035', fontSize: '11px', marginTop: '20px', fontFamily: "'Courier New', monospace" }}>── Est. 2025 ──</p>
    </UICard>
  )
}

function CreateScreen({ onBack, onCreated, nickname }) {
  const { createLobby, addPlayer, loading, error } = useLobby()
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
      await addPlayer({ lobbyId: lobby.id, nickname })
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
          {mismatch && <p style={{ color: '#c0392b', fontSize: '12px', marginBottom: '16px', fontFamily: "'Courier New', monospace" }}>✕ Passwords do not match</p>}
          {error && <p style={{ color: '#c0392b', fontSize: '12px', marginBottom: '16px', fontFamily: "'Courier New', monospace" }}>✕ {error}</p>}
          <Btn onClick={handleCreate} disabled={!canSubmit}>{loading ? 'Creating…' : 'Create Lobby'}</Btn>
        </>
      )}
    </UICard>
  )
}

function JoinScreen({ onBack, onJoined, nickname }) {
  const { fetchLobbies, joinLobby, addPlayer, loading } = useLobby()
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
      await addPlayer({ lobbyId: lobby.id, nickname })
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
              <p style={{ color: '#6b5d4f', fontSize: '13px', textAlign: 'center', fontFamily: "'Courier New', monospace" }}>Loading tables…</p>
            ) : lobbies.length === 0 ? (
              <p style={{ color: '#6b5d4f', fontSize: '13px', textAlign: 'center', fontFamily: "'Courier New', monospace" }}>No open lobbies. Create one!</p>
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
              {joinError && <p style={{ color: '#c0392b', fontSize: '12px', marginBottom: '16px', fontFamily: "'Courier New', monospace" }}>✕ {joinError}</p>}
              <Btn onClick={handleJoin} disabled={!password || loading}>{loading ? 'Checking…' : 'Enter Table'}</Btn>
            </>
          )}
          {!selected && lobbies.length > 0 && (
            <p style={{ color: '#4a4035', fontSize: '11px', textAlign: 'center', fontFamily: "'Courier New', monospace" }}>↑ Select a table above to continue</p>
          )}
        </>
      )}
    </UICard>
  )
}

function WaitingRoom({ lobby, nickname, onLeave }) {
  const { fetchPlayers, subscribePlayers, removePlayer } = useLobby()
  const { startGame } = useGame(lobby.id, nickname)
  const [players, setPlayers] = useState([])
  const playerIdRef = useRef(null)
  const navigate = useNavigate()
  const isHost = players.length > 0 && players[0].nickname === nickname
  const maxPlayers = 4

  useEffect(() => {
    async function load() {
      const data = await fetchPlayers(lobby.id)
      setPlayers(data)
      const me = data.find(p => p.nickname === nickname)
      if (me) playerIdRef.current = me.id
    }
    load()

    const channel = subscribePlayers(lobby.id, async () => {
      const data = await fetchPlayers(lobby.id)
      setPlayers(data)
      const me = data.find(p => p.nickname === nickname)
      if (me) playerIdRef.current = me.id
    })

    const gameChannel = supabase
      .channel(`game_start:${lobby.id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'game_state',
        filter: `lobby_id=eq.${lobby.id}`,
      }, () => {
        navigate(`/game/${lobby.id}`, { state: { nickname, lobbyName: lobby.name } })
      })
      .subscribe()

    return () => {
      channel.unsubscribe()
      gameChannel.unsubscribe()
    }
  }, [lobby.id])

  async function handleLeave() {
    if (playerIdRef.current) await removePlayer(playerIdRef.current)
    onLeave()
  }

  async function handleStartGame() {
    const playerNames = players.map(p => p.nickname)
    await startGame(playerNames)
  }

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
      }}>Waiting for players… {players.length}/{maxPlayers}</p>
      <div style={{
        background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '8px', padding: '20px', marginBottom: '28px'
      }}>
        <p style={{ color: '#6b5d4f', fontSize: '11px', letterSpacing: '1px', fontFamily: "'Courier New', monospace", margin: '0 0 10px' }}>
          PLAYERS IN ROOM
        </p>
        {[...Array(maxPlayers)].map((_, i) => {
          const player = players[i]
          const isMe = player?.nickname === nickname
          return (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 0',
              borderBottom: i < maxPlayers - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none'
            }}>
              <div style={{
                width: '8px', height: '8px', borderRadius: '50%',
                background: player ? '#d4af37' : 'rgba(255,255,255,0.12)'
              }} />
              <span style={{
                color: player ? (isMe ? '#d4af37' : '#f0ece4') : '#4a4035',
                fontFamily: "'Georgia', serif", fontSize: '14px'
              }}>
                {player ? `${player.nickname}${i === 0 ? ' (host)' : ''}${isMe ? ' (you)' : ''}` : 'Waiting…'}
              </span>
            </div>
          )
        })}
      </div>
      {isHost && players.length >= 2 && (
        <Btn onClick={handleStartGame}>Start Game</Btn>
      )}
      {isHost && players.length < 2 && (
        <p style={{ color: '#6b5d4f', fontSize: '12px', marginBottom: '16px', fontFamily: "'Courier New', monospace" }}>
          Waiting for at least 2 players to start…
        </p>
      )}
      {!isHost && (
        <p style={{ color: '#6b5d4f', fontSize: '12px', marginBottom: '16px', fontFamily: "'Courier New', monospace" }}>
          Waiting for host to start the game…
        </p>
      )}
      <Btn onClick={handleLeave} variant="ghost">Leave Table</Btn>
    </UICard>
  )
}

export default function LobbyPage({ nickname, onLogOut, isGuest }) {
  const [screen, setScreen] = useState('home')
  const [activeLobby, setActiveLobby] = useState(null)
  const navigate = useNavigate()

  // check if user is already in an active game on mount
  useEffect(() => {
    async function checkActiveGame() {
      if (!nickname) return
      // find if this player is in any lobby
      const { data: playerRow } = await supabase
        .from('players')
        .select('lobby_id')
        .eq('nickname', nickname)
        .single()

      if (!playerRow) return

      // check if that lobby has an active game
      const { data: game } = await supabase
        .from('game_state')
        .select('*')
        .eq('lobby_id', playerRow.lobby_id)
        .eq('status', 'active')
        .single()

      if (game) {
        // get lobby details
        const { data: lobby } = await supabase
          .from('lobbies')
          .select('*')
          .eq('id', playerRow.lobby_id)
          .single()

        if (lobby) {
          navigate(`/game/${lobby.id}`, { state: { nickname, lobbyName: lobby.name } })
        }
      }
    }
    checkActiveGame()
  }, [nickname])

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(ellipse at 30% 20%, #1e1408 0%, #0d0a06 60%, #080604 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '24px', position: 'relative', fontFamily: "'Georgia', serif"
    }}>
      <FloatingCards />

      {/* Log out button */}
      <button onClick={onLogOut} style={{
        position: 'fixed', top: '20px', right: '20px',
        background: 'none', border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '6px', padding: '8px 16px', color: '#6b5d4f',
        fontSize: '11px', letterSpacing: '2px', textTransform: 'uppercase',
        fontFamily: "'Courier New', monospace", cursor: 'pointer', zIndex: 10,
      }}>Log out</button>

      {screen === 'home' && (
      <HomeScreen
        nickname={nickname}
        onCreate={() => setScreen('create')}
        onJoin={() => setScreen('join')}
        isGuest={isGuest}
      />
      )}
      {screen === 'create' && (
        <CreateScreen
          onBack={() => setScreen('home')}
          onCreated={l => { setActiveLobby(l); setScreen('lobby') }}
          nickname={nickname}
        />
      )}
      {screen === 'join' && (
        <JoinScreen
          onBack={() => setScreen('home')}
          onJoined={l => { setActiveLobby(l); setScreen('lobby') }}
          nickname={nickname}
        />
      )}
      {screen === 'lobby' && activeLobby && (
        <WaitingRoom
          lobby={activeLobby}
          nickname={nickname}
          onLeave={() => { setActiveLobby(null); setScreen('home') }}
        />
      )}
    </div>
  )
}