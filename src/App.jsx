import { Routes, Route } from 'react-router-dom'
import LobbyPage from './pages/LobbyPage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LobbyPage />} />
      {/* Future routes:
          <Route path="/game/:lobbyId" element={<GamePage />} />
      */}
    </Routes>
  )
}