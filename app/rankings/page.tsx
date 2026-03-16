'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

type RankedGame = {
  id: string
  sport: string
  home_team: string
  away_team: string
  home_score: number
  away_score: number
  game_date: string
  notable: string
  avg_rating: number
  rating_count: number
}

type RankedPlayer = {
  id: string
  name: string
  sport: string
  position: string
  team: string
  era: string
  avg_rating: number
  rating_count: number
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

const avatarColors: Record<string, { bg: string; color: string }> = {
  NBA: { bg: '#0a1e3a', color: '#5b9ee8' },
  NFL: { bg: '#1a0808', color: '#e85b5b' },
  MLB: { bg: '#0a2010', color: '#5bbf7a' },
  NHL: { bg: '#0a1530', color: '#7aa8e8' },
  Soccer: { bg: '#1a1a08', color: '#d4c84a' },
}

export default function RankingsPage() {
  const [activeTab, setActiveTab] = useState<'games' | 'players'>('games')
  const [games, setGames] = useState<RankedGame[]>([])
  const [players, setPlayers] = useState<RankedPlayer[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRankings = async () => {
      setLoading(true)

      // Fetch games with their average rating and rating count
      // by joining the ratings table and averaging the stars
      const { data: gamesData } = await supabase
        .from('games')
        .select(`
          *,
          ratings(stars)
        `)
        .limit(100)

      // Fetch players the same way
      const { data: playersData } = await supabase
        .from('players')
        .select(`
          *,
          ratings(stars)
        `)
        .limit(100)

      if (gamesData) {
        // Calculate average rating and count for each game then sort highest first
        const ranked = gamesData
          .map((game: any) => {
            const stars = game.ratings.map((r: any) => r.stars)
            const avg = stars.length > 0
              ? stars.reduce((a: number, b: number) => a + b, 0) / stars.length
              : 0
            return { ...game, avg_rating: avg, rating_count: stars.length }
          })
          .filter((g: any) => g.rating_count > 0)
          .sort((a: any, b: any) => b.avg_rating - a.avg_rating)

        setGames(ranked)
      }

      if (playersData) {
        // Same calculation for players
        const ranked = playersData
          .map((player: any) => {
            const stars = player.ratings.map((r: any) => r.stars)
            const avg = stars.length > 0
              ? stars.reduce((a: number, b: number) => a + b, 0) / stars.length
              : 0
            return { ...player, avg_rating: avg, rating_count: stars.length }
          })
          .filter((p: any) => p.rating_count > 0)
          .sort((a: any, b: any) => b.avg_rating - a.avg_rating)

        setPlayers(ranked)
      }

      setLoading(false)
    }

    fetchRankings()
  }, [])

  // Rank number gets a special color for top 3
  const rankColor = (rank: number) => {
    if (rank === 1) return '#e8a432'
    if (rank === 2) return '#9aa0b4'
    if (rank === 3) return '#cd7f32'
    return '#2a2f3e'
  }

  // Renders a single row in the leaderboard
  const renderStars = (avg: number) => {
    return '★'.repeat(Math.round(avg)) + '☆'.repeat(5 - Math.round(avg))
  }

  return (
    <div style={{ background: '#0e1015', minHeight: '100vh' }}>

      {/* Page header */}
      <div style={{
        padding: '48px 2rem 0',
        background: '#12151c',
        borderBottom: '1px solid #1e2330'
      }}>
        <h1 style={{
          fontSize: '36px',
          fontWeight: '800',
          letterSpacing: '4px',
          textTransform: 'uppercase',
          color: '#e8e4dc',
          marginBottom: '4px'
        }}>
          Rankings
        </h1>
        <p style={{ color: '#3a4055', fontSize: '13px', letterSpacing: '0.5px', marginBottom: '24px' }}>
          Community rated · Updated in real time
        </p>

        {/* Tab switcher */}
        <div style={{ display: 'flex', gap: '0' }}>
          {(['games', 'players'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                background: 'transparent',
                border: 'none',
                borderBottom: activeTab === tab ? '2px solid #e8a432' : '2px solid transparent',
                color: activeTab === tab ? '#e8a432' : '#3a4055',
                fontSize: '13px',
                fontWeight: '700',
                letterSpacing: '1px',
                textTransform: 'uppercase',
                padding: '10px 20px',
                cursor: 'pointer',
                marginBottom: '-1px'
              }}
            >
              {tab === 'games' ? '🏆 Top Games' : '⭐ Top Players'}
            </button>
          ))}
        </div>
      </div>

      {/* Leaderboard */}
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem' }}>

        {loading ? (
          <p style={{ color: '#3a4055', fontSize: '14px' }}>Loading rankings...</p>
        ) : activeTab === 'games' ? (

          // Games leaderboard
          games.length === 0 ? (
            <div style={{
              background: '#151820',
              border: '1px solid #1e2330',
              borderRadius: '8px',
              padding: '60px',
              textAlign: 'center'
            }}>
              <p style={{ color: '#3a4055', fontSize: '14px', marginBottom: '8px' }}>No ratings yet.</p>
              <p style={{ color: '#2a2f3e', fontSize: '12px' }}>Once users start rating games they will appear here.</p>
            </div>
          ) : (
            <div>
              {games.map((game, index) => (
                <div
                  key={game.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    padding: '14px 12px',
                    borderBottom: '1px solid #1a1d26',
                    borderRadius: '6px',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = '#151820')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  {/* Rank number */}
                  <div style={{
                    fontSize: '24px',
                    fontWeight: '800',
                    color: rankColor(index + 1),
                    width: '40px',
                    textAlign: 'right',
                    flexShrink: 0
                  }}>
                    {index + 1}
                  </div>

                  {/* Sport color banner */}
                  <div style={{
                    width: '56px',
                    height: '38px',
                    borderRadius: '4px',
                    background: sportColors[game.sport] || '#1a1d26',
                    flexShrink: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '18px'
                  }}>
                    {sportEmoji[game.sport]}
                  </div>

                  {/* Game info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#c8c4bc',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      {game.home_team} vs {game.away_team}
                    </div>
                    <div style={{ fontSize: '11px', color: '#3a4055', textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: '2px' }}>
                      {game.sport} · {new Date(game.game_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      {game.notable ? ` · ${game.notable}` : ''}
                    </div>
                  </div>

                  {/* Rating */}
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontSize: '24px', fontWeight: '800', color: '#e8a432', letterSpacing: '1px' }}>
                      {game.avg_rating.toFixed(1)}
                    </div>
                    <div style={{ fontSize: '11px', color: '#3a4055' }}>
                      {renderStars(game.avg_rating)}
                    </div>
                    <div style={{ fontSize: '10px', color: '#2a2f3e', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      {game.rating_count} {game.rating_count === 1 ? 'rating' : 'ratings'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )

        ) : (

          // Players leaderboard
          players.length === 0 ? (
            <div style={{
              background: '#151820',
              border: '1px solid #1e2330',
              borderRadius: '8px',
              padding: '60px',
              textAlign: 'center'
            }}>
              <p style={{ color: '#3a4055', fontSize: '14px', marginBottom: '8px' }}>No ratings yet.</p>
              <p style={{ color: '#2a2f3e', fontSize: '12px' }}>Once users start rating players they will appear here.</p>
            </div>
          ) : (
            <div>
              {players.map((player, index) => {
                const avatarColor = avatarColors[player.sport] || { bg: '#1a1d26', color: '#7a8099' }
                const initials = player.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)

                return (
                  <div
                    key={player.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px',
                      padding: '14px 12px',
                      borderBottom: '1px solid #1a1d26',
                      borderRadius: '6px',
                      cursor: 'pointer',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = '#151820')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    {/* Rank number */}
                    <div style={{
                      fontSize: '24px',
                      fontWeight: '800',
                      color: rankColor(index + 1),
                      width: '40px',
                      textAlign: 'right',
                      flexShrink: 0
                    }}>
                      {index + 1}
                    </div>

                    {/* Avatar */}
                    <div style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '50%',
                      background: avatarColor.bg,
                      color: avatarColor.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '14px',
                      fontWeight: '700',
                      flexShrink: 0
                    }}>
                      {initials}
                    </div>

                    {/* Player info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontSize: '14px',
                        fontWeight: '600',
                        color: '#c8c4bc',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}>
                        {player.name}
                      </div>
                      <div style={{ fontSize: '11px', color: '#3a4055', textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: '2px' }}>
                        {player.position} · {sportEmoji[player.sport]} {player.sport}
                        {player.team ? ` · ${player.team}` : ''}
                      </div>
                    </div>

                    {/* Rating */}
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontSize: '24px', fontWeight: '800', color: '#e8a432', letterSpacing: '1px' }}>
                        {player.avg_rating.toFixed(1)}
                      </div>
                      <div style={{ fontSize: '11px', color: '#3a4055' }}>
                        {renderStars(player.avg_rating)}
                      </div>
                      <div style={{ fontSize: '10px', color: '#2a2f3e', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        {player.rating_count} {player.rating_count === 1 ? 'rating' : 'ratings'}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )
        )}
      </div>
    </div>
  )
}