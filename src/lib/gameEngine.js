// gameEngine.js
// Pure game logic for Switch (like Uno). No Supabase, no React.
// All functions take state and return new state — nothing is mutated directly.

const SUITS = ['hearts', 'diamonds', 'clubs', 'spades']
const RANKS = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A']

// ── Deck ─────────────────────────────────────────────────────────────────────

export function createDeck() {
  const deck = []
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push({ suit, rank, id: `${rank}_${suit}` })
    }
  }
  return shuffle(deck)
}

export function shuffle(array) {
  const arr = [...array]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

// ── Deal ─────────────────────────────────────────────────────────────────────

export function dealHands(deck, players, cardsEach = 7) {
  const remaining = [...deck]
  const hands = {}
  for (const nickname of players) {
    hands[nickname] = remaining.splice(0, cardsEach)
  }
  // flip first card to start the pile — skip action cards at top
  let starterIndex = remaining.findIndex(c => !['A', '2', '8'].includes(c.rank) && !(c.rank === 'J' && (c.suit === 'clubs' || c.suit === 'spades')))
  if (starterIndex === -1) starterIndex = 0
  const [starter] = remaining.splice(starterIndex, 1)
  return { hands, deck: remaining, pile: [starter] }
}

// ── Card Rules ────────────────────────────────────────────────────────────────

export function isBlackJack(card) {
  return card.rank === 'J' && (card.suit === 'clubs' || card.suit === 'spades')
}

export function canPlay(card, topCard, currentSuit) {
  const effectiveSuit = currentSuit || topCard.suit
  if (card.rank === 'A') return true // ace is wild
  if (isBlackJack(card)) return true // black jack is wild
  if (card.suit === effectiveSuit) return true
  if (card.rank === topCard.rank) return true
  return false
}

export function getNextPlayer(players, currentNickname, direction) {
  const idx = players.indexOf(currentNickname)
  const step = direction === 'clockwise' ? 1 : -1
  return players[(idx + step + players.length) % players.length]
}

export function skipPlayer(players, currentNickname, direction) {
  const next = getNextPlayer(players, currentNickname, direction)
  return getNextPlayer(players, next, direction)
}

// ── Apply Move ────────────────────────────────────────────────────────────────
// Takes current game state + a move, returns the new game state.

export function applyMove(state, move) {
  let { deck, hands, pile, current_turn, direction, status, winner } = state
  const players = Object.keys(hands)

  // deep clone to avoid mutation
  hands = JSON.parse(JSON.stringify(hands))
  deck = [...deck]
  pile = [...pile]

  if (move.type === 'PLAY_CARD') {
    const { nickname, card, chosenSuit } = move
    // remove card from hand
    hands[nickname] = hands[nickname].filter(c => c.id !== card.id)

    // add to pile
    pile.push(card)

    // check for win
    if (hands[nickname].length === 0) {
      return { ...state, hands, pile, deck, status: 'finished', winner: nickname }
    }

    let nextTurn = getNextPlayer(players, nickname, direction)
    let currentSuit = chosenSuit || null

    // handle special cards
    if (card.rank === '2') {
      // next player picks up 2
      const target = nextTurn
      const drawn = deck.splice(0, 2)
      if (drawn.length < 2) {
        const reshuffled = reshufflePile(pile)
        deck = reshuffled.deck
        pile = reshuffled.pile
        drawn.push(...deck.splice(0, 2 - drawn.length))
      }
      hands[target] = [...hands[target], ...drawn]
      nextTurn = getNextPlayer(players, target, direction)
    } else if (card.rank === '8') {
      // skip next player
      nextTurn = skipPlayer(players, nickname, direction)
    } else if (isBlackJack(card)) {
      // next player picks up 5
      const target = nextTurn
      const drawn = deck.splice(0, 5)
      if (drawn.length < 5) {
        const reshuffled = reshufflePile(pile)
        deck = reshuffled.deck
        pile = reshuffled.pile
        drawn.push(...deck.splice(0, 5 - drawn.length))
      }
      hands[target] = [...hands[target], ...drawn]
      nextTurn = getNextPlayer(players, target, direction)
    }

    return { ...state, hands, pile, deck, current_turn: nextTurn, currentSuit, direction, status, winner }
  }

  if (move.type === 'DRAW_CARD') {
    const { nickname } = move
    if (deck.length === 0) {
      const reshuffled = reshufflePile(pile)
      deck = reshuffled.deck
      pile = reshuffled.pile
    }
    const [drawn] = deck.splice(0, 1)
    if (drawn) hands[nickname] = [...hands[nickname], drawn]
    const nextTurn = getNextPlayer(players, nickname, direction)
    return { ...state, hands, pile, deck, current_turn: nextTurn, direction, status, winner }
  }

  return state
}

// ── Reshuffle ─────────────────────────────────────────────────────────────────

function reshufflePile(pile) {
  const top = pile[pile.length - 1]
  const reshuffled = shuffle(pile.slice(0, -1))
  return { deck: reshuffled, pile: [top] }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

export function getTopCard(pile) {
  return pile[pile.length - 1]
}