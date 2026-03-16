'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import RatingModal from '../components/RatingModal'

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

const SPORTS = ['All', 'NBA', 'NFL', 'MLB', 'NHL', 'Soccer']
const PAGE_SIZE = 50

export default function GamesPage() {
  const [games, setGames] = useState<Game[]>([])
  const [filtered, setFiltered] = useState<Game[]>([])
  const [activeSport, setActiveSport] = useState('All')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const [isSearching, setIsSearching] = useState(false)
  const [modalTarget, setModalTarget] = useState<{ id: string; name: string } | null>(null)

  const fetchGames = async (pageNum: number, reset: boolean = false) => {
    setLoading(true)

    const { data } = await supabase
      .from('games')
      .select('*')
      .order('game_date', { ascending: false })
      .range(pageNum * PAGE_SIZE, (pageNum + 1) * PAGE_SIZE - 1)

    if (data) {
      if (reset) {
        setGames(data)
        setFiltered(data)
      } else {
        setGames((prev) => [...prev, ...data])
        setFiltered((prev) => [...prev, ...data])
      }
      setHasMore(data.length === PAGE_SIZE)
    }

    setLoading(false)
  }

  const searchGames = async (term: string, sport: string) => {
    setLoading(true)
    setIsSearching(true)

    let query = supabase
      .from('games')
      .select('*')
      .order('game_date', { ascending: false })
      .limit(100)

    if (sport !== 'All') {
      query = query.eq('sport', sport)
    }

    if (term.trim()) {
      query = query.or(
        `home_team.ilike.%${term}%,away_team.ilike.%${term}%,notable.ilike.%${term}%`
      )
    }

    const { data } = await query
    if (data) setFiltered(data)
    setLoading(false)
  }

  useEffect(() => {
    fetchGames(0, true)
  }, [])

  useEffect(() => {
    const hasSearch = search.trim() !== ''
    const hasSportFilter = activeSport !== 'All'

    if (hasSearch || hasSportFilter) {
      const timeout = setTimeout(() => {
        searchGames(search, activeSport)
      }, 400)
      return () => clearTimeout(timeout)
    } else {
      setIsSearching(false)
      fetchGames(0, true)
      setPage(0)
    }
  }, [search, activeSport])

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
        padding: '16px 2rem',
        display: 'flex',
        gap: '12px',
        alignItems: 'center',
        flexWrap: 'wrap'
      }}>
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

        <p style={{ color: '#3a4055', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '1.5rem' }}>
          {isSearching ? `${filtered.length} results found` : `${filtered.length} games loaded`}
        </p>

        {loading && page === 0 ? (
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

        {/* Load more — hidden when searching */}
        {hasMore && !loading && !isSearching && (
          <div style={{ textAlign: 'center', marginTop: '2rem' }}>
            <button
              onClick={() => {
                const nextPage = page + 1
                setPage(nextPage)
                fetchGames(nextPage)
              }}
              style={{
                background: 'transparent',
                border: '1px solid #2a2f3e',
                borderRadius: '6px',
                color: '#7a8099',
                fontSize: '13px',
                fontWeight: '700',
                letterSpacing: '1px',
                textTransform: 'uppercase',
                padding: '12px 32px',
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
              Load more games
            </button>
          </div>
        )}

        {loading && page > 0 && (
          <p style={{ textAlign: 'center', color: '#3a4055', fontSize: '13px', marginTop: '2rem' }}>
            Loading more...
          </p>
        )}

      </div>

      {modalTarget && (
        <RatingModal
          targetId={modalTarget.id}
          targetName={modalTarget.name}
          targetType="game"
          onClose={() => setModalTarget(null)}
          onSuccess={() => setModalTarget(null)}
        />
      )}

    </div>
  )
}