import { useState } from 'react'
import { supabase } from '../lib/supabase'

function withTimeout(promise, ms = 5000) {
  const timeout = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('Request timed out. Please try again.')), ms)
  )
  return Promise.race([promise, timeout])
}

export function useLobby() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function createLobby({ name, password }) {
    setLoading(true)
    setError(null)
    try {
      const { data, error } = await withTimeout(
        supabase.from('lobbies').insert([{ name, password }]).select().single()
      )
      setLoading(false)
      if (error) { setError(error.message); return null }
      return data
    } catch (err) {
      setLoading(false)
      setError(err.message)
      return null
    }
  }

  async function fetchLobbies() {
    setLoading(true)
    setError(null)
    try {
      const { data, error } = await withTimeout(
        supabase.from('lobbies').select('*').order('created_at', { ascending: false })
      )
      setLoading(false)
      if (error) { setError(error.message); return [] }
      return data
    } catch (err) {
      setLoading(false)
      setError(err.message)
      return []
    }
  }

  async function joinLobby({ lobbyId, password }) {
    setLoading(true)
    setError(null)
    const { data, error } = await supabase
      .from('lobbies')
      .select('*')
      .eq('id', lobbyId)
      .single()
    setLoading(false)
    if (error) { setError(error.message); return null }
    if (data.password !== password) {
      setError('Incorrect password')
      return null
    }
    return data
  }

  async function addPlayer({ lobbyId, nickname }) {
    const { data, error } = await supabase
      .from('players')
      .insert([{ lobby_id: lobbyId, nickname }])
      .select()
      .single()
    if (error) { console.error(error.message); return null }
    return data
  }

  async function removePlayer(playerId) {
    await supabase.from('players').delete().eq('id', playerId)
  }

  function subscribePlayers(lobbyId, onChange) {
    const channel = supabase
      .channel(`players:${lobbyId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'players',
        filter: `lobby_id=eq.${lobbyId}`,
      }, onChange)
      .subscribe()
    return channel
  }

  async function fetchPlayers(lobbyId) {
    const { data, error } = await supabase
      .from('players')
      .select('*')
      .eq('lobby_id', lobbyId)
      .order('created_at', { ascending: true })
    if (error) { console.error(error.message); return [] }
    return data
  }

  return {
    createLobby, joinLobby, fetchLobbies,
    addPlayer, removePlayer, subscribePlayers, fetchPlayers,
    loading, error
  }
}
