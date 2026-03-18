import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { createDeck, dealHands, applyMove } from '../lib/gameEngine'

export function useGame(lobbyId, nickname) {
  const [gameState, setGameState] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function fetchGameState() {
    const { data, error } = await supabase
      .from('game_state')
      .select('*')
      .eq('lobby_id', lobbyId)
      .single()
    if (error) return null
    return data
  }

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

  async function makeMove(move) {
    if (!gameState) return

    // merge currentSuit into state before applying move
    const stateWithSuit = { ...gameState, currentSuit: gameState.current_suit ?? null }
    const newState = applyMove(stateWithSuit, move)

    const { error } = await supabase
      .from('game_state')
      .update({
        deck: newState.deck,
        hands: newState.hands,
        pile: newState.pile,
        current_turn: newState.current_turn,
        direction: newState.direction,
        status: newState.status,
        winner: newState.winner ?? null,
      })
      .eq('id', gameState.id)

    if (error) {
      console.error('makeMove error:', error.message)
      setError(error.message)
    }
  }

  useEffect(() => {
    if (!lobbyId) return

    fetchGameState().then(data => {
      if (data) setGameState(data)
    })

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