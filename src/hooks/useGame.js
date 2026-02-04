// useGame.js
// Connects the game engine to Supabase.
// Handles creating a game, subscribing to real-time state changes, and applying moves.

import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { createDeck, dealHands, applyMove } from '../lib/gameEngine'

export function useGame(lobbyId, nickname) {
  const [gameState, setGameState] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // ── Fetch current game state ───────────────────────────────────────────────

  async function fetchGameState() {
    const { data, error } = await supabase
      .from('game_state')
      .select('*')
      .eq('lobby_id', lobbyId)
      .single()
    if (error) return null
    return data
  }

  // ── Start game (host only) ─────────────────────────────────────────────────

  async function startGame(players) {
    setLoading(true)
    const deck = createDeck()
    const { hands, deck: remaining, pile } = dealHands(deck, players)

    const { data, error } = await supabase
      .from('game_state')
      .insert([{
        lobby_id: lobbyId,
        deck: remaining,
        hands,
        pile,
        current_turn: players[0],
        direction: 'clockwise',
        status: 'active',
        winner: null,
      }])
      .select()
      .single()

    setLoading(false)
    if (error) { setError(error.message); return }
    setGameState(data)
  }

  // ── Play a card or draw ────────────────────────────────────────────────────

  async function makeMove(move) {
    if (!gameState) return
    const newState = applyMove(gameState, move)

    const { error } = await supabase
      .from('game_state')
      .update({
        deck: newState.deck,
        hands: newState.hands,
        pile: newState.pile,
        current_turn: newState.current_turn,
        direction: newState.direction,
        status: newState.status,
        winner: newState.winner,
        currentSuit: newState.currentSuit ?? null,
      })
      .eq('lobby_id', lobbyId)

    if (error) setError(error.message)
  }

  // ── Real-time subscription ─────────────────────────────────────────────────

  useEffect(() => {
    if (!lobbyId) return

    // load initial state
    fetchGameState().then(data => {
      if (data) setGameState(data)
    })

    // subscribe to changes
    const channel = supabase
      .channel(`game_state:${lobbyId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'game_state',
        filter: `lobby_id=eq.${lobbyId}`,
      }, payload => {
        setGameState(payload.new)
      })
      .subscribe()

    return () => channel.unsubscribe()
  }, [lobbyId])

  return { gameState, startGame, makeMove, loading, error }
}