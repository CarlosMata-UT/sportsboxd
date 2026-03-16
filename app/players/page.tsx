'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import RatingModal from '../components/RatingModal'

type Player = {
  id: string
  name: string
  sport: string
  position: string
  team: string
  era: string
}

const sportEmoji: Record<string, string> = {
  NBA: '🏀',
  NFL: '🏈',
  MLB: '⚾',
  NHL: '🏒',
  Soccer: '⚽',
}

const avatarColors: Record<string, { bg: string; color: string }> = {
  NBA: { bg: '#0a1e3a', color: '#5b9ee8' },
  NFL: { bg: '#1a0808', color: '#e85b5b' },
  MLB: { bg: '#0a2010', color: '#5bbf7a' },
  NHL: { bg: '#0a1530', color: '#7aa8e8' },
  Soccer: { bg: '#1a1a08', color: '#d4c84a' },
}

const SPORTS = ['All', 'NBA', 'NFL', 'MLB', 'NHL', 'Soccer']
const PAGE_SIZE = 50

export default function PlayersPage() {
  const [players, setPlayers] = useState<Player[]>([])
  const [filtered, setFiltered] = useState<Player[]>([])
  const [activeSport, setActiveSport] = useState('All')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const [modalTarget, setModalTarget] = useState<{ id: string; name: string } | null>(null)

  const fetchPlayers = async (pageNum: number, reset: boolean = false) => {
    setLoading(true)

    const { data } = await supabase
      .from('players')
      .select('*')
      .order('name', { ascending: true })
      .range(pageNum * PAGE_SIZE, (pageNum + 1) * PAGE_SIZE - 1)

    if (data) {
      if (reset) {
        setPlayers(data)
        setFiltered(data)
      } else {
        setPlayers((prev) => [...prev, ...data])
        setFiltered((prev) => [...prev, ...data])
      }
      setHasMore(data.length === PAGE_SIZE)
    }

    setLoading(false)
  }

  useEffect(() => {
    fetchPlayers(0, true)
  }, [])

  // Re-filter whenever sport filter or search changes
  useEffect(() => {
    let results = players

    if (activeSport !== 'All') {
      results = results.filter((p) => p.sport === activeSport)
    }

    if (search.trim()) {
      const term = search.toLowerCase()
      results = results.filter(
        (p) =>
          p.name.toLowerCase().includes(term) ||
          p.team?.toLowerCase().includes(term) ||
          p.position?.toLowerCase().includes(term)
      )
    }

    setFiltered(results)
  }, [activeSport, search, players])

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
          Players
        </h1>
        <p style={{ color: '#3a4055', fontSize: '13px', letterSpacing: '0.5px' }}>
          Browse and rate the greatest players of all time
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
          placeholder="Search players, teams, positions..."
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
            width: '280px'
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

      {/* Players grid */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>

        <p style={{ color: '#3a4055', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '1.5rem' }}>
          {filtered.length} {filtered.length === 1 ? 'player' : 'players'} loaded
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
            <p style={{ color: '#3a4055', fontSize: '14px', marginBottom: '8px' }}>No players found.</p>
            <p style={{ color: '#2a2f3e', fontSize: '12px' }}>Try a different search or sport filter.</p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: '1rem'
          }}>
            {filtered.map((player) => {
              const avatarColor = avatarColors[player.sport] || { bg: '#1a1d26', color: '#7a8099' }
              const initials = player.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)

              return (
                <div
                  key={player.id}
                  style={{
                    background: '#151820',
                    border: '1px solid #1e2330',
                    borderRadius: '8px',
                    padding: '20px 16px',
                    textAlign: 'center',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#2a2f3e')}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#1e2330')}
                >
                  {/* Avatar with player initials */}
                  <div style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '50%',
                    background: avatarColor.bg,
                    color: avatarColor.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '18px',
                    fontWeight: '700',
                    margin: '0 auto 12px',
                    letterSpacing: '1px'
                  }}>
                    {initials}
                  </div>

                  <div style={{ fontSize: '14px', fontWeight: '700', color: '#e8e4dc', marginBottom: '4px' }}>
                    {player.name}
                  </div>

                  <div style={{ fontSize: '11px', color: '#3a4055', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>
                    {player.position} · {sportEmoji[player.sport]} {player.sport}
                  </div>

                  {player.team && (
                    <div style={{ fontSize: '11px', color: '#2a2f3e', marginBottom: '4px' }}>
                      {player.team}
                    </div>
                  )}

                  {player.era && (
                    <div style={{ fontSize: '11px', color: '#2a2f3e', fontStyle: 'italic', marginBottom: '12px' }}>
                      {player.era}
                    </div>
                  )}

                  {/* Rate button */}
                  <button
                    onClick={() => setModalTarget({ id: player.id, name: player.name })}
                    style={{
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
                    ★ Rate this player
                  </button>
                </div>
              )
            })}
          </div>
        )}

        {/* Load more button */}
        {hasMore && !loading && (
          <div style={{ textAlign: 'center', marginTop: '2rem' }}>
            <button
              onClick={() => {
                const nextPage = page + 1
                setPage(nextPage)
                fetchPlayers(nextPage)
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
              Load more players
            </button>
          </div>
        )}

        {loading && page > 0 && (
          <p style={{ textAlign: 'center', color: '#3a4055', fontSize: '13px', marginTop: '2rem' }}>
            Loading more...
          </p>
        )}

      </div>

      {/* Rating modal */}
      {modalTarget && (
        <RatingModal
          targetId={modalTarget.id}
          targetName={modalTarget.name}
          targetType="player"
          onClose={() => setModalTarget(null)}
          onSuccess={() => setModalTarget(null)}
        />
      )}

    </div>
  )
}