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

const avatarColors: Record<string, { bg: string; color: string; border: string }> = {
  NBA: { bg: '#0a1e3a', color: '#5b9ee8', border: '#1a3a6c' },
  NFL: { bg: '#1a0808', color: '#e85b5b', border: '#3a1010' },
  MLB: { bg: '#0a2010', color: '#5bbf7a', border: '#143020' },
  NHL: { bg: '#0a1530', color: '#7aa8e8', border: '#162040' },
  Soccer: { bg: '#1a1a08', color: '#d4c84a', border: '#2a2a10' },
}

export default function RankingsPage() {
  const [activeTab, setActiveTab] = useState<'games' | 'players'>('games')
  const [games, setGames] = useState<RankedGame[]>([])
  const [players, setPlayers] = useState<RankedPlayer[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRankings = async () => {
      setLoading(true)

      const { data: gamesData } = await supabase
        .from('games')
        .select(`*, ratings(stars)`)
        .limit(100)

      const { data: playersData } = await supabase
        .from('players')
        .select(`*, ratings(stars)`)
        .limit(100)

      if (gamesData) {
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

  const rankDisplay = (rank: number) => {
    if (rank === 1) return { icon: '🥇', color: '#e8a432' }
    if (rank === 2) return { icon: '🥈', color: '#9aa0b4' }
    if (rank === 3) return { icon: '🥉', color: '#cd7f32' }
    return { icon: null, color: '#2a2f3e' }
  }

  const renderStars = (avg: number) => {
    return '★'.repeat(Math.round(avg)) + '☆'.repeat(5 - Math.round(avg))
  }

  return (
    <div style={{ background: '#0e1015', minHeight: '100vh' }}>

      {/* ── Page header with imagery ─────────────────────── */}
      <div style={{
        position: 'relative',
        overflow: 'hidden',
        borderBottom: '1px solid #1e2330',
      }}>
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `url('https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1600&q=80')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center 50%',
          filter: 'brightness(0.15)',
        }} />
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to right, rgba(14,16,21,0.97) 30%, rgba(14,16,21,0.6) 100%)',
        }} />

        <div style={{ position: 'relative', zIndex: 1, padding: '52px 2rem 0' }}>
          <div style={{
            display: 'inline-block',
            background: 'rgba(232,164,50,0.1)',
            border: '1px solid rgba(232,164,50,0.2)',
            color: '#e8a432',
            fontSize: '9px',
            fontWeight: '700',
            letterSpacing: '3px',
            textTransform: 'uppercase',
            padding: '4px 14px',
            borderRadius: '20px',
            marginBottom: '14px',
          }}>
            Community Rated
          </div>
          <h1 style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: '52px',
            fontWeight: '900',
            letterSpacing: '4px',
            textTransform: 'uppercase',
            color: '#f0ece4',
            marginBottom: '6px',
            lineHeight: 1,
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
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontSize: '16px',
                  fontWeight: '700',
                  letterSpacing: '2px',
                  textTransform: 'uppercase',
                  padding: '10px 22px',
                  cursor: 'pointer',
                  marginBottom: '-1px',
                }}
              >
                {tab === 'games' ? '🏆 Top Games' : '⭐ Top Players'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Leaderboard ─────────────────────────────────── */}
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem' }}>

        {loading ? (
          <p style={{ color: '#3a4055', fontSize: '14px' }}>Loading rankings...</p>
        ) : activeTab === 'games' ? (

          games.length === 0 ? (
            <div style={{
              background: '#151820',
              border: '1px solid #1e2330',
              borderRadius: '10px',
              padding: '60px',
              textAlign: 'center',
            }}>
              <p style={{ color: '#3a4055', fontSize: '14px', marginBottom: '8px' }}>No ratings yet.</p>
              <p style={{ color: '#2a2f3e', fontSize: '12px' }}>Once users start rating games they will appear here.</p>
            </div>
          ) : (
            <div>
              {games.map((game, index) => {
                const rank = rankDisplay(index + 1)
                return (
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
                    {/* Rank */}
                    <div style={{
                      width: '40px',
                      textAlign: 'right',
                      flexShrink: 0,
                    }}>
                      {rank.icon ? (
                        <span style={{ fontSize: '22px' }}>{rank.icon}</span>
                      ) : (
                        <span style={{
                          fontFamily: "'Barlow Condensed', sans-serif",
                          fontSize: '22px',
                          fontWeight: '800',
                          color: rank.color,
                        }}>
                          {index + 1}
                        </span>
                      )}
                    </div>

                    {/* Sport banner */}
                    <div style={{
                      width: '56px',
                      height: '38px',
                      borderRadius: '5px',
                      background: sportColors[game.sport] || '#1a1d26',
                      flexShrink: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '18px',
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
                        textOverflow: 'ellipsis',
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
                      <div style={{
                        fontFamily: "'Barlow Condensed', sans-serif",
                        fontSize: '26px',
                        fontWeight: '800',
                        color: '#e8a432',
                        letterSpacing: '1px',
                        lineHeight: 1,
                      }}>
                        {game.avg_rating.toFixed(1)}
                      </div>
                      <div style={{ fontSize: '11px', color: '#3a4055', marginTop: '2px' }}>
                        {renderStars(game.avg_rating)}
                      </div>
                      <div style={{ fontSize: '10px', color: '#2a2f3e', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        {game.rating_count} {game.rating_count === 1 ? 'rating' : 'ratings'}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )

        ) : (

          players.length === 0 ? (
            <div style={{
              background: '#151820',
              border: '1px solid #1e2330',
              borderRadius: '10px',
              padding: '60px',
              textAlign: 'center',
            }}>
              <p style={{ color: '#3a4055', fontSize: '14px', marginBottom: '8px' }}>No ratings yet.</p>
              <p style={{ color: '#2a2f3e', fontSize: '12px' }}>Once users start rating players they will appear here.</p>
            </div>
          ) : (
            <div>
              {players.map((player, index) => {
                const ac = avatarColors[player.sport] || { bg: '#1a1d26', color: '#7a8099', border: '#2a2f3e' }
                const initials = player.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)
                const rank = rankDisplay(index + 1)

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
                    {/* Rank */}
                    <div style={{ width: '40px', textAlign: 'right', flexShrink: 0 }}>
                      {rank.icon ? (
                        <span style={{ fontSize: '22px' }}>{rank.icon}</span>
                      ) : (
                        <span style={{
                          fontFamily: "'Barlow Condensed', sans-serif",
                          fontSize: '22px',
                          fontWeight: '800',
                          color: rank.color,
                        }}>
                          {index + 1}
                        </span>
                      )}
                    </div>

                    {/* Avatar */}
                    <div style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '50%',
                      background: ac.bg,
                      color: ac.color,
                      border: `2px solid ${ac.border}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '14px',
                      fontWeight: '800',
                      flexShrink: 0,
                      fontFamily: "'Barlow Condensed', sans-serif",
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
                        textOverflow: 'ellipsis',
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
                      <div style={{
                        fontFamily: "'Barlow Condensed', sans-serif",
                        fontSize: '26px',
                        fontWeight: '800',
                        color: '#e8a432',
                        letterSpacing: '1px',
                        lineHeight: 1,
                      }}>
                        {player.avg_rating.toFixed(1)}
                      </div>
                      <div style={{ fontSize: '11px', color: '#3a4055', marginTop: '2px' }}>
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
