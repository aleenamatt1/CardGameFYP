import { useState, useEffect } from 'react'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import { useGame } from '../hooks/useGame'
import { canPlay, getTopCard, isBlackJack } from '../lib/gameEngine'

// ── Card visuals ──────────────────────────────────────────────────────────────

const SUIT_SYMBOLS = {
  hearts: '♥', diamonds: '♦', clubs: '♣', spades: '♠'
}
const SUIT_COLORS = {
  hearts: '#c0392b', diamonds: '#c0392b', clubs: '#1a1208', spades: '#1a1208'
}

function PlayingCard({ card, onClick, disabled, selected, faceDown = false }) {
  if (!faceDown && (!card || !card.rank || !card.suit)) return null
  const symbol = faceDown ? '?' : SUIT_SYMBOLS[card.suit]
  const color = faceDown ? '#8b7d6b' : SUIT_COLORS[card.suit]
  const label = faceDown ? '' : `${card.rank}${symbol}`

  return (
    <div
      onClick={!disabled ? onClick : undefined}
      style={{
        width: '64px', height: '96px', borderRadius: '10px', flexShrink: 0,
        background: faceDown
          ? 'linear-gradient(135deg, #1a1208, #2a1f0e)'
          : 'linear-gradient(160deg, #faf7f0, #f0ece4)',
        border: selected
          ? '2px solid #d4af37'
          : faceDown
          ? '1px solid rgba(212,175,55,0.2)'
          : '1px solid rgba(0,0,0,0.1)',
        boxShadow: selected
          ? '0 0 16px rgba(212,175,55,0.5)'
          : '0 4px 12px rgba(0,0,0,0.4)',
        cursor: disabled ? 'default' : 'pointer',
        display: 'flex', flexDirection: 'column',
        justifyContent: 'space-between', padding: '6px',
        transition: 'transform 0.15s, box-shadow 0.15s',
        transform: selected ? 'translateY(-12px)' : 'translateY(0)',
        position: 'relative', userSelect: 'none',
      }}
      onMouseEnter={e => { if (!disabled && !faceDown) e.currentTarget.style.transform = selected ? 'translateY(-12px)' : 'translateY(-6px)' }}
      onMouseLeave={e => { if (!disabled) e.currentTarget.style.transform = selected ? 'translateY(-12px)' : 'translateY(0)' }}
    >
      {!faceDown && (
        <>
          <span style={{ fontSize: '13px', fontWeight: 'bold', color, fontFamily: "'Georgia', serif" }}>{card.rank}</span>
          <span style={{ fontSize: '22px', color, textAlign: 'center', lineHeight: 1 }}>{symbol}</span>
          <span style={{ fontSize: '13px', fontWeight: 'bold', color, alignSelf: 'flex-end', transform: 'rotate(180deg)', fontFamily: "'Georgia', serif" }}>{card.rank}</span>
        </>
      )}
      {faceDown && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: '28px', color: 'rgba(212,175,55,0.3)' }}>♠</span>
        </div>
      )}
    </div>
  )
}

// ── Suit picker (for Ace) ─────────────────────────────────────────────────────

function SuitPicker({ onPick }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100
    }}>
      <div style={{
        background: 'linear-gradient(160deg, rgba(30,22,12,0.99), rgba(18,14,8,0.99))',
        border: '1px solid rgba(212,175,55,0.3)', borderRadius: '16px', padding: '40px',
        textAlign: 'center'
      }}>
        <p style={{ color: '#f0ece4', fontFamily: "'Palatino Linotype', serif", fontSize: '20px', marginBottom: '24px' }}>
          Choose a suit
        </p>
        <div style={{ display: 'flex', gap: '16px' }}>
          {['hearts', 'diamonds', 'clubs', 'spades'].map(suit => (
            <button key={suit} onClick={() => onPick(suit)} style={{
              width: '64px', height: '64px', borderRadius: '12px',
              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.15)',
              fontSize: '28px', cursor: 'pointer',
              color: suit === 'hearts' || suit === 'diamonds' ? '#e05555' : '#f0ece4',
              transition: 'all 0.15s',
            }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(212,175,55,0.15)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
            >
              {SUIT_SYMBOLS[suit]}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Game Page ─────────────────────────────────────────────────────────────────

export default function GamePage() {
  const { lobbyId } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const nickname = location.state?.nickname
  const lobbyName = location.state?.lobbyName

  const { gameState, makeMove } = useGame(lobbyId, nickname)
  const [selectedCard, setSelectedCard] = useState(null)
  const [showSuitPicker, setShowSuitPicker] = useState(false)
  const [message, setMessage] = useState('')

  // redirect if no nickname (e.g. direct URL access)
  useEffect(() => {
    if (!nickname) navigate('/')
  }, [nickname])

  if (!gameState) {
    return (
      <div style={{
        minHeight: '100vh', background: 'radial-gradient(ellipse at 30% 20%, #1e1408 0%, #0d0a06 60%, #080604 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8b7d6b',
        fontFamily: "'Courier New', monospace", fontSize: '13px', letterSpacing: '2px'
      }}>
        LOADING GAME…
      </div>
    )
  }

  const { hands, pile, current_turn, status, winner, currentSuit } = gameState
  const myHand = hands?.[nickname] || []
  const players = Object.keys(hands || {})
  const topCard = getTopCard(pile || [])
  const isMyTurn = current_turn === nickname

  function handleCardClick(card) {
    if (!isMyTurn) return
    if (selectedCard?.id === card.id) {
      setSelectedCard(null)
      return
    }
    if (!canPlay(card, topCard, currentSuit)) {
      setMessage("You can't play that card here.")
      setTimeout(() => setMessage(''), 2000)
      return
    }
    setSelectedCard(card)
    setMessage('')
  }

  function handlePlayCard() {
    if (!selectedCard) return
    if (selectedCard.rank === 'A') {
      setShowSuitPicker(true)
      return
    }
    makeMove({ type: 'PLAY_CARD', nickname, card: selectedCard })
    setSelectedCard(null)
  }

  function handleSuitPicked(suit) {
    setShowSuitPicker(false)
    makeMove({ type: 'PLAY_CARD', nickname, card: selectedCard, chosenSuit: suit })
    setSelectedCard(null)
  }

  function handleDraw() {
    if (!isMyTurn) return
    makeMove({ type: 'DRAW_CARD', nickname })
    setSelectedCard(null)
  }

  if (status === 'finished') {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'radial-gradient(ellipse at 30% 20%, #1e1408 0%, #0d0a06 60%, #080604 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{
          background: 'linear-gradient(160deg, rgba(30,22,12,0.97), rgba(18,14,8,0.99))',
          border: '1px solid rgba(212,175,55,0.2)', borderRadius: '16px',
          padding: '48px', textAlign: 'center', maxWidth: '380px',
        }}>
          <div style={{ fontSize: '56px', marginBottom: '16px' }}>♛</div>
          <h2 style={{ fontFamily: "'Palatino Linotype', serif", fontSize: '28px', color: '#d4af37', margin: '0 0 8px', fontWeight: 'normal' }}>
            {winner === nickname ? 'You Won!' : `${winner} Won!`}
          </h2>
          <p style={{ color: '#6b5d4f', fontSize: '12px', fontFamily: "'Courier New', monospace", marginBottom: '32px' }}>
            {winner === nickname ? 'Well played.' : 'Better luck next time.'}
          </p>
          <button onClick={() => navigate('/')} style={{
            width: '100%', padding: '14px', border: 'none', borderRadius: '6px',
            background: 'linear-gradient(135deg, #c9a227, #8b6914)',
            color: '#1a1208', fontSize: '13px', letterSpacing: '2px',
            textTransform: 'uppercase', fontFamily: "'Courier New', monospace",
            fontWeight: '700', cursor: 'pointer',
          }}>Back to Lobby</button>
        </div>
      </div>
    )
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(ellipse at 30% 20%, #1e1408 0%, #0d0a06 60%, #080604 100%)',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'space-between', padding: '24px',
      fontFamily: "'Georgia', serif", overflowX: 'hidden',
    }}>
      {showSuitPicker && <SuitPicker onPick={handleSuitPicked} />}

      {/* Header */}
      <div style={{ width: '100%', maxWidth: '700px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ fontFamily: "'Palatino Linotype', serif", fontSize: '22px', color: '#f0ece4', margin: 0, fontWeight: 'normal', letterSpacing: '2px' }}>
          {lobbyName || 'SWITCH'}
        </h1>
        <div style={{ display: 'flex', gap: '12px' }}>
          {players.map(p => (
            <div key={p} style={{
              padding: '6px 12px', borderRadius: '20px', fontSize: '12px',
              fontFamily: "'Courier New', monospace", letterSpacing: '1px',
              background: current_turn === p ? 'rgba(212,175,55,0.15)' : 'rgba(255,255,255,0.04)',
              border: current_turn === p ? '1px solid rgba(212,175,55,0.4)' : '1px solid rgba(255,255,255,0.08)',
              color: current_turn === p ? '#d4af37' : '#6b5d4f',
            }}>
              {p === nickname ? 'You' : p} {current_turn === p ? '▸' : ''} ({hands[p]?.length ?? 0})
            </div>
          ))}
        </div>
      </div>

      {/* Other players' hands (face down) */}
      <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap', justifyContent: 'center' }}>
        {players.filter(p => p !== nickname).map(p => (
          <div key={p} style={{ textAlign: 'center' }}>
            <p style={{ color: '#6b5d4f', fontSize: '11px', letterSpacing: '1px', fontFamily: "'Courier New', monospace", marginBottom: '8px' }}>
              {p} — {hands[p]?.length ?? 0} cards
            </p>
            <div style={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
              {(hands[p] || []).slice(0, 7).map((_, i) => (
                <PlayingCard key={i} card={{}} faceDown />
              ))}
              {(hands[p] || []).length > 7 && (
                <div style={{ color: '#6b5d4f', fontSize: '11px', alignSelf: 'center', fontFamily: "'Courier New', monospace" }}>
                  +{hands[p].length - 7}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Pile and Deck */}
      <div style={{ display: 'flex', gap: '32px', alignItems: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ color: '#6b5d4f', fontSize: '11px', letterSpacing: '1px', fontFamily: "'Courier New', monospace", marginBottom: '8px' }}>PILE</p>
          {topCard && <PlayingCard card={topCard} disabled />}
          {currentSuit && (
            <p style={{ color: '#d4af37', fontSize: '11px', marginTop: '6px', fontFamily: "'Courier New', monospace" }}>
              Suit: {SUIT_SYMBOLS[currentSuit]}
            </p>
          )}
        </div>
        <div style={{ textAlign: 'center' }}>
          <p style={{ color: '#6b5d4f', fontSize: '11px', letterSpacing: '1px', fontFamily: "'Courier New', monospace", marginBottom: '8px' }}>DECK</p>
          <div onClick={handleDraw} style={{ cursor: isMyTurn ? 'pointer' : 'default', opacity: isMyTurn ? 1 : 0.5 }}>
            <PlayingCard card={{}} faceDown />
          </div>
          <p style={{ color: '#4a4035', fontSize: '10px', marginTop: '6px', fontFamily: "'Courier New', monospace" }}>
            {gameState.deck?.length ?? 0} left
          </p>
        </div>
      </div>

      {/* Status message */}
      <div style={{ minHeight: '24px', textAlign: 'center' }}>
        {message && (
          <p style={{ color: '#c0392b', fontSize: '12px', fontFamily: "'Courier New', monospace" }}>{message}</p>
        )}
        {!message && (
          <p style={{ color: isMyTurn ? '#d4af37' : '#6b5d4f', fontSize: '12px', fontFamily: "'Courier New', monospace", letterSpacing: '1px' }}>
            {isMyTurn ? '▸ Your turn' : `Waiting for ${current_turn}…`}
          </p>
        )}
      </div>

      {/* My hand */}
      <div style={{ width: '100%', maxWidth: '700px' }}>
        <p style={{ color: '#6b5d4f', fontSize: '11px', letterSpacing: '1px', fontFamily: "'Courier New', monospace", marginBottom: '12px', textAlign: 'center' }}>
          YOUR HAND ({myHand.length} cards)
        </p>
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
          {myHand.map(card => (
            <PlayingCard
              key={card.id}
              card={card}
              onClick={() => handleCardClick(card)}
              disabled={!isMyTurn}
              selected={selectedCard?.id === card.id}
            />
          ))}
        </div>
        {selectedCard && (
          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <button onClick={handlePlayCard} style={{
              padding: '12px 32px', border: 'none', borderRadius: '6px',
              background: 'linear-gradient(135deg, #c9a227, #8b6914)',
              color: '#1a1208', fontSize: '13px', letterSpacing: '2px',
              textTransform: 'uppercase', fontFamily: "'Courier New', monospace",
              fontWeight: '700', cursor: 'pointer',
            }}>
              Play {selectedCard.rank}{SUIT_SYMBOLS[selectedCard.suit]}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}