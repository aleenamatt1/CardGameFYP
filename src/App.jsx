import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import AuthPage from './pages/AuthPage'
import LobbyPage from './pages/LobbyPage'
import GamePage from './pages/GamePage'
import StatsPage from './pages/StatsPage'

export default function App() {
  const { user, nickname, loading, isGuest, logOut, playAsGuest, signUp, logIn } = useAuth()
  console.log('App state:', { user, nickname, loading, isGuest })

  if (loading || (user && !isGuest && !nickname)) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'radial-gradient(ellipse at 30% 20%, #1e1408 0%, #0d0a06 60%, #080604 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#8b7d6b', fontFamily: "'Courier New', monospace",
        fontSize: '13px', letterSpacing: '2px'
      }}>
        LOADING…
      </div>
    )
  }

  if (!user && !isGuest) return <AuthPage playAsGuest={playAsGuest} signUp={signUp} logIn={logIn} />

  return (
    <Routes>
      <Route path="/" element={<LobbyPage nickname={nickname} onLogOut={logOut} isGuest={isGuest} />} />
      <Route path="/game/:lobbyId" element={<GamePage />} />
      <Route path="/stats" element={<StatsPage />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  )
}