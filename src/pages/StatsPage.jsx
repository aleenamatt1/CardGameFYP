import { useNavigate } from 'react-router-dom'
import { useStats } from '../hooks/useStats'

function formatDuration(seconds) {
  if (!seconds) return '—'
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return m > 0 ? `${m}m ${s}s` : `${s}s`
}

function formatDate(dateString) {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-IE', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function StatsPage() {
  const navigate = useNavigate()
  const { history, leaderboard, loading } = useStats()

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(ellipse at 30% 20%, #1e1408 0%, #0d0a06 60%, #080604 100%)',
      padding: '40px 24px',
      fontFamily: "'Georgia', serif",
      color: '#f0ece4',
    }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '48px' }}>
          <div>
            <h1 style={{
              fontFamily: "'Palatino Linotype', serif", fontSize: '32px',
              color: '#f0ece4', margin: '0 0 6px', letterSpacing: '3px', fontWeight: 'normal'
            }}>STATISTICS</h1>
            <p style={{ color: '#6b5d4f', fontSize: '12px', letterSpacing: '2px', fontFamily: "'Courier New', monospace", margin: 0 }}>
              SWITCH — GAME HISTORY
            </p>
          </div>
          <button onClick={() => navigate('/')} style={{
            background: 'none', border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: '6px', padding: '10px 20px', color: '#8b7d6b',
            fontSize: '12px', letterSpacing: '2px', textTransform: 'uppercase',
            fontFamily: "'Courier New', monospace", cursor: 'pointer',
          }}>← Back</button>
        </div>

        {loading ? (
          <p style={{ color: '#6b5d4f', fontFamily: "'Courier New', monospace", fontSize: '13px', textAlign: 'center' }}>
            Loading stats…
          </p>
        ) : (
          <>
            {/* Leaderboard */}
            <section style={{ marginBottom: '48px' }}>
              <h2 style={{
                fontFamily: "'Palatino Linotype', serif", fontSize: '20px',
                color: '#d4af37', fontWeight: 'normal', margin: '0 0 20px',
                letterSpacing: '2px'
              }}>♛ Leaderboard</h2>

              {leaderboard.length === 0 ? (
                <p style={{ color: '#4a4035', fontSize: '13px', fontFamily: "'Courier New', monospace" }}>No games played yet.</p>
              ) : (
                <div style={{
                  background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)',
                  borderRadius: '12px', overflow: 'hidden'
                }}>
                  {/* Table header */}
                  <div style={{
                    display: 'grid', gridTemplateColumns: '40px 1fr 80px 80px 80px 100px',
                    padding: '12px 20px', borderBottom: '1px solid rgba(255,255,255,0.07)',
                    gap: '8px',
                  }}>
                    {['#', 'Player', 'Wins', 'Games', 'Win %', 'Avg Time'].map(h => (
                      <span key={h} style={{ color: '#6b5d4f', fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', fontFamily: "'Courier New', monospace" }}>{h}</span>
                    ))}
                  </div>

                  {/* Table rows */}
                  {leaderboard.map((player, i) => (
                    <div key={player.nickname} style={{
                      display: 'grid', gridTemplateColumns: '40px 1fr 80px 80px 80px 100px',
                      padding: '14px 20px', gap: '8px',
                      borderBottom: i < leaderboard.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                      background: i === 0 ? 'rgba(212,175,55,0.05)' : 'transparent',
                    }}>
                      <span style={{ color: i === 0 ? '#d4af37' : '#4a4035', fontFamily: "'Courier New', monospace", fontSize: '13px' }}>
                        {i === 0 ? '♛' : i + 1}
                      </span>
                      <span style={{ color: i === 0 ? '#d4af37' : '#f0ece4', fontSize: '15px' }}>
                        {player.nickname}
                      </span>
                      <span style={{ color: '#f0ece4', fontFamily: "'Courier New', monospace", fontSize: '13px' }}>{player.wins}</span>
                      <span style={{ color: '#8b7d6b', fontFamily: "'Courier New', monospace", fontSize: '13px' }}>{player.games}</span>
                      <span style={{ color: '#8b7d6b', fontFamily: "'Courier New', monospace", fontSize: '13px' }}>{player.winRate}%</span>
                      <span style={{ color: '#8b7d6b', fontFamily: "'Courier New', monospace", fontSize: '13px' }}>{formatDuration(player.avgDuration)}</span>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Summary cards */}
            {leaderboard.length > 0 && (
              <section style={{ marginBottom: '48px' }}>
                <h2 style={{
                  fontFamily: "'Palatino Linotype', serif", fontSize: '20px',
                  color: '#d4af37', fontWeight: 'normal', margin: '0 0 20px', letterSpacing: '2px'
                }}>♠ Overview</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                  {[
                    { label: 'Total Games', value: history.length },
                    { label: 'Total Players', value: leaderboard.length },
                    { label: 'Avg Game Length', value: formatDuration(Math.round(history.reduce((a, g) => a + (g.duration_seconds ?? 0), 0) / history.length)) },
                  ].map(stat => (
                    <div key={stat.label} style={{
                      background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)',
                      borderRadius: '10px', padding: '20px', textAlign: 'center'
                    }}>
                      <p style={{ color: '#d4af37', fontSize: '28px', margin: '0 0 6px', fontFamily: "'Palatino Linotype', serif" }}>
                        {stat.value}
                      </p>
                      <p style={{ color: '#6b5d4f', fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', fontFamily: "'Courier New', monospace", margin: 0 }}>
                        {stat.label}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Game history */}
            <section>
              <h2 style={{
                fontFamily: "'Palatino Linotype', serif", fontSize: '20px',
                color: '#d4af37', fontWeight: 'normal', margin: '0 0 20px', letterSpacing: '2px'
              }}>♦ Recent Games</h2>

              {history.length === 0 ? (
                <p style={{ color: '#4a4035', fontSize: '13px', fontFamily: "'Courier New', monospace" }}>No games played yet.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {history.map(game => (
                    <div key={game.id} style={{
                      background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)',
                      borderRadius: '10px', padding: '16px 20px',
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      flexWrap: 'wrap', gap: '12px'
                    }}>
                      <div>
                        <span style={{ color: '#d4af37', fontSize: '15px' }}>♛ {game.winner}</span>
                        <span style={{ color: '#4a4035', fontSize: '13px', marginLeft: '12px', fontFamily: "'Courier New', monospace" }}>
                          vs {game.players.filter(p => p !== game.winner).join(', ')}
                        </span>
                      </div>
                      <div style={{ display: 'flex', gap: '20px' }}>
                        <span style={{ color: '#6b5d4f', fontSize: '11px', fontFamily: "'Courier New', monospace" }}>
                          {game.total_moves} moves
                        </span>
                        <span style={{ color: '#6b5d4f', fontSize: '11px', fontFamily: "'Courier New', monospace" }}>
                          {formatDuration(game.duration_seconds)}
                        </span>
                        <span style={{ color: '#4a4035', fontSize: '11px', fontFamily: "'Courier New', monospace" }}>
                          {formatDate(game.created_at)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </div>
  )
}