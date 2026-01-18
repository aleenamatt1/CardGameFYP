// useLobby.js
// Handles all lobby interactions with Supabase.
// Wire these up once your Supabase project is created.

import { useState } from 'react'
// import { supabase } from '../lib/supabase'

export function useLobby() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function createLobby({ name, password }) {
    // TODO: insert row into `lobbies` table
    // const { data, error } = await supabase
    //   .from('lobbies')
    //   .insert([{ name, password }])
    //   .select()
    //   .single()
    console.log('createLobby called with', { name, password })
  }

  async function joinLobby({ lobbyId, password }) {
    // TODO: verify password and add player to lobby
    console.log('joinLobby called with', { lobbyId, password })
  }

  async function fetchLobbies() {
    // TODO: fetch open lobbies from Supabase
    // const { data } = await supabase.from('lobbies').select('*')
    console.log('fetchLobbies called')
    return []
  }

  return { createLobby, joinLobby, fetchLobbies, loading, error }
}