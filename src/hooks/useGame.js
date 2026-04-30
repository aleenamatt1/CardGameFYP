import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { createDeck, dealHands, applyMove } from '../lib/gameEngine'

export function useGame(lobbyId, nickname) {
  const [gameState, setGameState] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const moveCountRef = useRef(0)
  const gameStartTimeRef = useRef(null)

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
    gameStartTimeRef.current = Date.now()
    moveCountRef.current = 0

    const { data, error } = await supabase
      .from('game_state')
      .insert([{
        lobby_id: lobbyId,
        players,
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

  async function recordGameHistory(newState) {
    const players = Object.keys(newState.hands)
    const duration = gameStartTimeRef.current
      ? Math.floor((Date.now() - gameStartTimeRef.current) / 1000)
      : 0

    await supabase.from('game_history').insert([{
      lobby_id: lobbyId,
      winner: newState.winner,
      players,
      total_moves: moveCountRef.current,
      duration_seconds: duration,
    }])
  }

  async function makeMove(move) {
    if (!gameState) return

    const newState = applyMove(gameState, move)
    moveCountRef.current += 1

    const { error } = await supabase
      .from('game_state')
      .update({
        players: newState.players,
        deck: newState.deck,
        hands: newState.hands,
        pile: newState.pile,
        current_turn: newState.current_turn,
        direction: newState.direction,
        status: newState.status,
        winner: newState.winner ?? null,
        current_suit: newState.currentSuit ?? null,
      })
      .eq('id', gameState.id)

    if (error) {
      console.error('makeMove error:', error.message)
      setError(error.message)
      return
    }


    if (newState.status === 'finished') {
      await recordGameHistory(newState)
    }
  }

  useEffect(() => {
    if (!lobbyId) return

    fetchGameState().then(data => {
      if (data) {
        setGameState({ ...data, currentSuit: data.current_suit ?? null })
        if (data.status === 'active' && !gameStartTimeRef.current) {
          gameStartTimeRef.current = Date.now()
        }
      }
    })

    const channel = supabase
      .channel(`game_state:${lobbyId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'game_state',
        filter: `lobby_id=eq.${lobbyId}`,
      }, payload => {
        const raw = payload.new
        setGameState({ ...raw, currentSuit: raw.current_suit ?? null })
      })
      .subscribe()

    return () => channel.unsubscribe()
  }, [lobbyId])

  return { gameState, startGame, makeMove, loading, error }
}