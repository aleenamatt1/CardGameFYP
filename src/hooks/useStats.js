import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useStats() {
  const [history, setHistory] = useState([])
  const [leaderboard, setLeaderboard] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      setLoading(true)

      const [{ data: games, error: gamesError }, { data: profiles, error: profilesError }] = await Promise.all([
        supabase.from('game_history').select('*').order('created_at', { ascending: false }),
        supabase.from('profiles').select('nickname'),
      ])

      if (gamesError || profilesError) {
        console.error(gamesError?.message ?? profilesError?.message)
        setLoading(false)
        return
      }

      const registeredNicknames = new Set(profiles.map(p => p.nickname))

      setHistory(games)
      setLeaderboard(computeLeaderboard(games, registeredNicknames))
      setLoading(false)
    }
    fetchStats()
  }, [])

  return { history, leaderboard, loading }
}

function computeLeaderboard(history, registeredNicknames) {
  const stats = {}

  for (const game of history) {
    for (const player of game.players) {
      if (!registeredNicknames.has(player)) continue
      if (!stats[player]) {
        stats[player] = { nickname: player, wins: 0, games: 0, totalMoves: 0, totalDuration: 0 }
      }
      stats[player].games += 1
      stats[player].totalMoves += game.total_moves ?? 0
      stats[player].totalDuration += game.duration_seconds ?? 0
    }
    if (game.winner && stats[game.winner]) {
      stats[game.winner].wins += 1
    }
  }

  return Object.values(stats)
    .map(p => ({
      ...p,
      winRate: p.games > 0 ? Math.round((p.wins / p.games) * 100) : 0,
      avgDuration: p.games > 0 ? Math.round(p.totalDuration / p.games) : 0,
      avgMoves: p.games > 0 ? Math.round(p.totalMoves / p.games) : 0,
    }))
    .sort((a, b) => b.wins - a.wins || b.winRate - a.winRate)
}