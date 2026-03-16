'use client'

import RatingModal from '../components/RatingModal'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

type Game = {
  id: string
  sport: string
  home_team: string
  away_team: string
  home_score: number
  away_score: number
  game_date: string
  season: string
  notable: string
}

const sportEmoji: Record<string, string> = {
  NBA: '🏀',
  NFL: '🏈',
  MLB: '⚾',
  NHL: '🏒',
  Soccer: '⚽',
}

const sportColors: Record<string, string> = {
  NBA: 'linear-gradient(100deg, #1a3a6c, #c9082a)',
  NFL: 'linear-gradient(100deg, #013369, #d50a0a)',
  MLB: 'linear-gradient(100deg, #002d72, #e31837)',
  NHL: 'linear-gradient(100deg, #003087, #6d6e71)',
  Soccer: 'linear-gradient(100deg, #004012, #c8b400)',
}

// All sports options for the filter bar
const SPORTS = ['All', 'NBA', 'NFL', 'MLB', 'NHL', 'Soccer']

const [modalTarget, setModalTarget] = useState<{ id: string; name: string } | null>(null)

export default function GamesPage() {
  const [games, setGames] = useState<Game[]>([])
  const [filtered, setFiltered] = useState<Game[]>([])
  const [activeSport, setActiveSport] = useState('All')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  // Fetch all games from Supabase on page load
  useEffect(() => {
    const fetchGames = async () => {
      const { data } = await supabase
        .from('games')
        .select('*')
        .order('game_date', { ascending: false })

      if (data) {
        setGames(data)
        setFiltered(data)
      }
      setLoading(false)
    }

    fetchGames()
  }, [])

  // Re-filter whenever the sport filter or search term changes
  useEffect(() => {
    let results = games

    if (activeSport !== 'All') {
      results = results.filter((g) => g.sport === activeSport)
    }

    if (search.trim()) {
      const term = search.toLowerCase()
      results = results.filter(
        (g) =>
          g.home_team.toLowerCase().includes(term) ||
          g.away_team.toLowerCase().includes(term) ||
          g.notable?.toLowerCase().includes(term)
      )
    }

    setFiltered(results)
  }, [activeSport, search, games])

  return (
    <div style={{ background: '#0e1015', minHeight: '100vh' }}>

      {/* Page header */}
      <div style={{
        padding: '48px 2rem 32px',
        borderBottom: '1px solid #1e2330',
        background: '#12151c'
      }}>
        <h1 style={{
          fontSize: '36px',
          fontWeight: '800',
          letterSpacing: '4px',
          textTransform: 'uppercase',
          color: '#e8e4dc',
          marginBottom: '4px'
        }}>
          Games
        </h1>
        <p style={{ color: '#3a4055', fontSize: '13px', letterSpacing: '0.5px' }}>
          Browse and rate every game in the database
        </p>
      </div>

      {/* Search and filter bar */}
      <div style={{
        background: '#12151c',
        borderBottom: '1px solid #1e2330',
        padding: '0 2rem 16px',
        display: 'flex',
        gap: '12px',
        alignItems: 'center',
        flexWrap: 'wrap'
      }}>

        {/* Search input */}
        <input
          type="text"
          placeholder="Search teams or keywords..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            background: '#1a1d26',
            border: '1px solid #2a2f3e',
            borderRadius: '6px',
            color: '#e8e4dc',
            fontSize: '13px',
            padding: '8px 14px',
            outline: 'none',
            width: '260px'
          }}
        />

        {/* Sport filter pills */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {SPORTS.map((sport) => (
            <button
              key={sport}
              onClick={() => setActiveSport(sport)}
              style={{
                background: activeSport === sport ? '#e8a432' : '#1a1d26',
                color: activeSport === sport ? '#000' : '#7a8099',
                border: activeSport === sport ? 'none' : '1px solid #2a2f3e',
                borderRadius: '20px',
                padding: '6px 14px',
                fontSize: '12px',
                fontWeight: '700',
                letterSpacing: '0.5px',
                textTransform: 'uppercase',
                cursor: 'pointer',
              }}
            >
              {sportEmoji[sport] ?? ''} {sport}
            </button>
          ))}
        </div>

      </div>

      {/* Games grid */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>

        {/* Result count */}
        <p style={{ color: '#3a4055', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '1.5rem' }}>
          {filtered.length} {filtered.length === 1 ? 'game' : 'games'} found
        </p>

        {loading ? (
          <p style={{ color: '#3a4055', fontSize: '14px' }}>Loading...</p>
        ) : filtered.length === 0 ? (
          <div style={{
            background: '#151820',
            border: '1px solid #1e2330',
            borderRadius: '8px',
            padding: '60px',
            textAlign: 'center'
          }}>
            <p style={{ color: '#3a4055', fontSize: '14px', marginBottom: '8px' }}>No games found.</p>
            <p style={{ color: '#2a2f3e', fontSize: '12px' }}>Try a different search or sport filter.</p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
            gap: '1rem'
          }}>
            {filtered.map((game) => (
              <div
                key={game.id}
                style={{
                  background: '#151820',
                  border: '1px solid #1e2330',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  transition: 'border-color 0.15s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#2a2f3e')}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#1e2330')}
              >
                {/* Sport color banner with teams and scores */}
                <div style={{
                  height: '90px',
                  background: sportColors[game.sport] || 'linear-gradient(100deg, #1a1d26, #2a2f3e)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0 20px'
                }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '14px', fontWeight: '700', color: '#fff', letterSpacing: '1px' }}>{game.home_team}</div>
                    <div style={{ fontSize: '24px', fontWeight: '800', color: '#fff' }}>{game.home_score}</div>
                  </div>
                  <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.35)', fontWeight: '600', letterSpacing: '1px' }}>FINAL</div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '14px', fontWeight: '700', color: '#fff', letterSpacing: '1px' }}>{game.away_team}</div>
                    <div style={{ fontSize: '24px', fontWeight: '800', color: '#fff' }}>{game.away_score}</div>
                  </div>
                </div>

                {/* Game details */}
                <div style={{ padding: '14px' }}>
                  <div style={{ fontSize: '13px', fontWeight: '600', color: '#c8c4bc', marginBottom: '4px' }}>
                    {game.home_team} vs {game.away_team}
                  </div>
                  <div style={{ fontSize: '11px', color: '#3a4055', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    {sportEmoji[game.sport]} {game.sport} · {new Date(game.game_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </div>
                  {game.season && (
                    <div style={{ fontSize: '11px', color: '#2a2f3e', marginTop: '2px' }}>
                      {game.season}
                    </div>
                  )}
                  {game.notable && (
                    <div style={{ fontSize: '11px', color: '#e8a432', marginTop: '6px', fontStyle: 'italic' }}>
                      {game.notable}
                    </div>
                  )}

                  {/* Rate button */}
                  <button
                    onClick={() => setModalTarget({ id: game.id, name: `${game.home_team} vs ${game.away_team}` })}
                    style={{
                      marginTop: '12px',
                      width: '100%',
                      background: 'transparent',
                      border: '1px solid #2a2f3e',
                      borderRadius: '4px',
                      color: '#7a8099',
                      fontSize: '11px',
                      fontWeight: '700',
                      letterSpacing: '1px',
                      textTransform: 'uppercase',
                      padding: '7px',
                      cursor: 'pointer',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#e8a432'
                      e.currentTarget.style.color = '#e8a432'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = '#2a2f3e'
                      e.currentTarget.style.color = '#7a8099'
                    }}
                  >
                  ★ Rate this game
                </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    {modalTarget && (
    <RatingModal
      targetId={modalTarget.id}
      targetName={modalTarget.name}
      targetType="game"
      onClose={() => setModalTarget(null)}
      onSuccess={() => {
        setModalTarget(null)
      }}
    />
  )}
    </div>
  )
}