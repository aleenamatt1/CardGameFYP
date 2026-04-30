import { describe, it, expect } from 'vitest'
import {
  createDeck,
  shuffle,
  dealHands,
  canPlay,
  getNextPlayer,
  applyMove,
  getTopCard,
  isBlackJack,
} from '../lib/gameEngine'

describe('createDeck', () => {
  it('creates 52 cards', () => {
    expect(createDeck().length).toBe(52)
  })

  it('has all 4 suits', () => {
    const deck = createDeck()
    const suits = [...new Set(deck.map(c => c.suit))]
    expect(suits.length).toBe(4)
    expect(suits).toContain('hearts')
    expect(suits).toContain('diamonds')
    expect(suits).toContain('clubs')
    expect(suits).toContain('spades')
  })

  it('has 13 ranks', () => {
    const deck = createDeck()
    const ranks = [...new Set(deck.map(c => c.rank))]
    expect(ranks.length).toBe(13)
  })

  it('no duplicate ids', () => {
    const deck = createDeck()
    const ids = new Set(deck.map(c => c.id))
    expect(ids.size).toBe(52)
  })
})

describe('shuffle', () => {
  it('same number of cards after shuffle', () => {
    const deck = createDeck()
    expect(shuffle(deck).length).toBe(deck.length)
  })

  it("doesn't change the original array", () => {
    const deck = createDeck()
    const before = [...deck]
    shuffle(deck)
    expect(deck).toEqual(before)
  })

  it('all cards still present', () => {
    const deck = createDeck()
    const shuffled = shuffle(deck)
    expect(shuffled.map(c => c.id).sort()).toEqual(deck.map(c => c.id).sort())
  })
})

describe('dealHands', () => {
  it('deals 7 cards each', () => {
    const { hands } = dealHands(createDeck(), ['Aleena', 'TestPlayer'])
    expect(hands['Aleena'].length).toBe(7)
    expect(hands['TestPlayer'].length).toBe(7)
  })

  it('pile starts with one card', () => {
    const { pile } = dealHands(createDeck(), ['Aleena', 'TestPlayer'])
    expect(pile.length).toBe(1)
  })

  it('correct number of cards left in deck for 2 players', () => {
    const { deck } = dealHands(createDeck(), ['Aleena', 'TestPlayer'])
    expect(deck.length).toBe(37)
  })

  it('works with 4 players', () => {
    const { hands, deck } = dealHands(createDeck(), ['P1', 'P2', 'P3', 'P4'])
    expect(Object.keys(hands).length).toBe(4)
    Object.values(hands).forEach(h => expect(h.length).toBe(7))
    expect(deck.length).toBe(23)
  })

  it('starter card is never an action card', () => {
    // run a bunch of times since the deck is random
    for (let i = 0; i < 20; i++) {
      const { pile } = dealHands(createDeck(), ['P1', 'P2'])
      expect(['A', '2', '8']).not.toContain(pile[0].rank)
    }
  })
})

describe('canPlay', () => {
  const top = { rank: '5', suit: 'hearts', id: '5_hearts' }

  it('same suit is playable', () => {
    const card = { rank: '9', suit: 'hearts', id: '9_hearts' }
    expect(canPlay(card, top, null)).toBe(true)
  })

  it('same rank is playable', () => {
    const card = { rank: '5', suit: 'spades', id: '5_spades' }
    expect(canPlay(card, top, null)).toBe(true)
  })

  it('different suit and rank is blocked', () => {
    const card = { rank: '9', suit: 'spades', id: '9_spades' }
    expect(canPlay(card, top, null)).toBe(false)
  })

  it('aces can always be played', () => {
    expect(canPlay({ rank: 'A', suit: 'spades', id: 'A_spades' }, top, null)).toBe(true)
  })

  it('black jack can always be played', () => {
    expect(canPlay({ rank: 'J', suit: 'spades', id: 'J_spades' }, top, null)).toBe(true)
  })

  it('after an ace, only the chosen suit is valid', () => {
    const clubs = { rank: '7', suit: 'clubs', id: '7_clubs' }
    const diamonds = { rank: '7', suit: 'diamonds', id: '7_diamonds' }
    expect(canPlay(clubs, top, 'clubs')).toBe(true)
    expect(canPlay(diamonds, top, 'clubs')).toBe(false)
  })
})

describe('isBlackJack', () => {
  it('J of spades is a black jack', () => {
    expect(isBlackJack({ rank: 'J', suit: 'spades' })).toBe(true)
  })

  it('J of clubs is a black jack', () => {
    expect(isBlackJack({ rank: 'J', suit: 'clubs' })).toBe(true)
  })

  it('red jacks are not', () => {
    expect(isBlackJack({ rank: 'J', suit: 'hearts' })).toBe(false)
    expect(isBlackJack({ rank: 'J', suit: 'diamonds' })).toBe(false)
  })
})

describe('getNextPlayer', () => {
  const players = ['P1', 'P2', 'P3', 'P4']

  it('next player clockwise', () => {
    expect(getNextPlayer(players, 'P1', 'clockwise')).toBe('P2')
    expect(getNextPlayer(players, 'P2', 'clockwise')).toBe('P3')
  })

  it('wraps from P4 back to P1', () => {
    expect(getNextPlayer(players, 'P4', 'clockwise')).toBe('P1')
  })

  it('goes backwards anticlockwise', () => {
    expect(getNextPlayer(players, 'P3', 'anticlockwise')).toBe('P2')
    expect(getNextPlayer(players, 'P1', 'anticlockwise')).toBe('P4')
  })
})

describe('applyMove', () => {
  it('played card is removed from hand and added to pile', () => {
    const { hands, deck: remaining, pile } = dealHands(createDeck(), ['P1', 'P2'])
    const state = { deck: remaining, hands, pile, current_turn: 'P1', direction: 'clockwise', status: 'active', winner: null, currentSuit: null }
    const top = getTopCard(state.pile)
    const card = state.hands['P1'].find(c => canPlay(c, top, null))
    if (!card) return

    const next = applyMove(state, { type: 'PLAY_CARD', nickname: 'P1', card })
    expect(next.hands['P1'].find(c => c.id === card.id)).toBeUndefined()
    expect(getTopCard(next.pile).id).toBe(card.id)
  })

  it('turn passes after a normal card', () => {
    const { hands, deck: remaining, pile } = dealHands(createDeck(), ['P1', 'P2'])
    const state = { deck: remaining, hands, pile, current_turn: 'P1', direction: 'clockwise', status: 'active', winner: null, currentSuit: null }
    const top = getTopCard(state.pile)
    const card = state.hands['P1'].find(
      c => canPlay(c, top, null) && !['2', '8', 'A'].includes(c.rank) && !isBlackJack(c)
    )
    if (!card) return

    expect(applyMove(state, { type: 'PLAY_CARD', nickname: 'P1', card }).current_turn).toBe('P2')
  })

  it('playing a 2 makes next player draw 2', () => {
    const twoCard = { rank: '2', suit: 'hearts', id: '2_hearts' }
    const topCard = { rank: '2', suit: 'spades', id: '2_spades' }
    const { deck: remaining } = dealHands(createDeck(), ['P1', 'P2'])
    const state = {
      deck: remaining,
      pile: [topCard],
      hands: {
        P1: [twoCard, { rank: '3', suit: 'hearts', id: '3_hearts' }],
        P2: [{ rank: '4', suit: 'clubs', id: '4_clubs' }],
      },
      current_turn: 'P1',
      direction: 'clockwise',
      status: 'active',
      winner: null,
      currentSuit: null,
    }
    const before = state.hands['P2'].length
    const next = applyMove(state, { type: 'PLAY_CARD', nickname: 'P1', card: twoCard })
    expect(next.hands['P2'].length).toBe(before + 2)
  })

  it('should skip the next player when an 8 is played', () => {
    const eightCard = { rank: '8', suit: 'hearts', id: '8_hearts' }
    const topCard = { rank: '8', suit: 'spades', id: '8_spades' }
    const deck = createDeck()
    const { deck: remaining } = dealHands(deck, ['P1', 'P2', 'P3'])
    const state = {
      deck: remaining,
      pile: [topCard],
      hands: {
        P1: [eightCard, { rank: '3', suit: 'hearts', id: '3_hearts' }],
        P2: [{ rank: '4', suit: 'clubs', id: '4_clubs' }],
        P3: [{ rank: '5', suit: 'diamonds', id: '5_diamonds' }],
      },
      current_turn: 'P1',
      direction: 'clockwise',
      status: 'active',
      winner: null,
      currentSuit: null,
    }
    const newState = applyMove(state, { type: 'PLAY_CARD', nickname: 'P1', card: eightCard })
    expect(newState.current_turn).toBe('P3')
  })

  it('should make the next player pick up 5 cards when a Black Jack is played', () => {
    const blackJack = { rank: 'J', suit: 'spades', id: 'J_spades' }
    const topCard = { rank: 'J', suit: 'hearts', id: 'J_hearts' }
    const deck = createDeck()
    const { deck: remaining } = dealHands(deck, ['P1', 'P2'])
    const state = {
      deck: remaining,
      pile: [topCard],
      hands: {
        P1: [blackJack, { rank: '3', suit: 'hearts', id: '3_hearts' }],
        P2: [{ rank: '4', suit: 'clubs', id: '4_clubs' }],
      },
      current_turn: 'P1',
      direction: 'clockwise',
      status: 'active',
      winner: null,
      currentSuit: null,
    }
    const p2HandBefore = state.hands['P2'].length
    const newState = applyMove(state, { type: 'PLAY_CARD', nickname: 'P1', card: blackJack })
    expect(newState.hands['P2'].length).toBe(p2HandBefore + 5)
  })

  it('game ends when a player plays their last card', () => {
    const lastCard = { rank: '5', suit: 'hearts', id: '5_hearts' }
    const { deck: remaining } = dealHands(createDeck(), ['P1', 'P2'])
    const state = {
      deck: remaining,
      pile: [{ rank: '5', suit: 'spades', id: '5_spades' }],
      hands: {
        P1: [lastCard],
        P2: [{ rank: '4', suit: 'clubs', id: '4_clubs' }],
      },
      current_turn: 'P1',
      direction: 'clockwise',
      status: 'active',
      winner: null,
      currentSuit: null,
    }
    const next = applyMove(state, { type: 'PLAY_CARD', nickname: 'P1', card: lastCard })
    expect(next.status).toBe('finished')
    expect(next.winner).toBe('P1')
  })

  it('drawing adds a card to hand and passes the turn', () => {
    const { hands, deck: remaining, pile } = dealHands(createDeck(), ['P1', 'P2'])
    const state = { deck: remaining, hands, pile, current_turn: 'P1', direction: 'clockwise', status: 'active', winner: null, currentSuit: null }
    const handBefore = state.hands['P1'].length
    const deckBefore = state.deck.length

    const next = applyMove(state, { type: 'DRAW_CARD', nickname: 'P1' })
    expect(next.hands['P1'].length).toBe(handBefore + 1)
    expect(next.deck.length).toBe(deckBefore - 1)
    expect(next.current_turn).toBe('P2')
  })
})

describe('getTopCard', () => {
  it('returns the last card in the pile', () => {
    const pile = [
      { rank: '3', suit: 'hearts', id: '3_hearts' },
      { rank: '7', suit: 'clubs', id: '7_clubs' },
      { rank: 'K', suit: 'spades', id: 'K_spades' },
    ]
    expect(getTopCard(pile).id).toBe('K_spades')
  })
})
