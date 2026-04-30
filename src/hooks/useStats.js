// useStats.js
// Fetches game history and computes player statistics from Supabase.

import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useStats() {
  const [history, setHistory] = useState([])
  const [leaderboard, setLeaderboard] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      setLoading(true)
      const { data, error } = await supabase
        .from('game_history')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) { console.error(error.message); setLoading(false); return }

      setHistory(data)
      setLeaderboard(computeLeaderboard(data))
      setLoading(false)
    }
    fetchStats()
  }, [])

  return { history, leaderboard, loading }
}

function computeLeaderboard(history) {
  const stats = {}

  for (const game of history) {
    //make sure every player in the game has an entry
    for (const player of game.players) {
      if (!stats[player]) {
        stats[player] = { nickname: player, wins: 0, games: 0, totalMoves: 0, totalDuration: 0 }
      }
      stats[player].games += 1
      stats[player].totalMoves += game.total_moves ?? 0
      stats[player].totalDuration += game.duration_seconds ?? 0
    }
    //credit the winner
    if (game.winner && stats[game.winner]) {
      stats[game.winner].wins += 1
    }
  }

  //convert to array and compute derived stats
  return Object.values(stats)
    .map(p => ({
      ...p,
      winRate: p.games > 0 ? Math.round((p.wins / p.games) * 100) : 0,
      avgDuration: p.games > 0 ? Math.round(p.totalDuration / p.games) : 0,
      avgMoves: p.games > 0 ? Math.round(p.totalMoves / p.games) : 0,
    }))
    .sort((a, b) => b.wins - a.wins || b.winRate - a.winRate)
}