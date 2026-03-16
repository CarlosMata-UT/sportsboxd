'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

// Types — these describe the shape of data coming back from Supabase
type Game = {
  id: string
  sport: string
  home_team: string
  away_team: string
  home_score: number
  away_score: number
  game_date: string
  notable: string
}

type Player = {
  id: string
  name: string
  sport: string
  position: string
  team: string
}

export default function HomePage() {
  const [games, setGames] = useState<Game[]>([])
  const [players, setPlayers] = useState<Player[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch games and players from Supabase when the page loads
  useEffect(() => {
    const fetchData = async () => {
      const { data: gamesData } = await supabase
        .from('games')
        .select('*')
        .order('game_date', { ascending: false })
        .limit(4)

      const { data: playersData } = await supabase
        .from('players')
        .select('*')
        .limit(5)

      if (gamesData) setGames(gamesData)
      if (playersData) setPlayers(playersData)
      setLoading(false)
    }

    fetchData()
  }, [])

  // Sport emoji map — used to display an icon next to each sport
  const sportEmoji: Record<string, string> = {
    NBA: '🏀',
    NFL: '🏈',
    MLB: '⚾',
    NHL: '🏒',
    Soccer: '⚽',
  }

  // Sport color map — gives each sport its own gradient on the game card banner
  const sportColors: Record<string, string> = {
    NBA: 'linear-gradient(100deg, #1a3a6c, #c9082a)',
    NFL: 'linear-gradient(100deg, #013369, #d50a0a)',
    MLB: 'linear-gradient(100deg, #002d72, #e31837)',
    NHL: 'linear-gradient(100deg, #003087, #6d6e71)',
    Soccer: 'linear-gradient(100deg, #004012, #c8b400)',
  }

  // Avatar color map — gives each player card a unique color based on sport
  const avatarColors: Record<string, { bg: string; color: string }> = {
    NBA: { bg: '#0a1e3a', color: '#5b9ee8' },
    NFL: { bg: '#1a0808', color: '#e85b5b' },
    MLB: { bg: '#0a2010', color: '#5bbf7a' },
    NHL: { bg: '#0a1530', color: '#7aa8e8' },
    Soccer: { bg: '#1a1a08', color: '#d4c84a' },
  }

  return (
    <div style={{ background: '#0e1015', minHeight: '100vh' }}>

      {/* Hero section */}
      <div style={{
        padding: '72px 2rem 52px',
        textAlign: 'center',
        borderBottom: '1px solid #1e2330',
        background: '#0e1015',
      }}>
        <div style={{
          display: 'inline-block',
          background: 'rgba(232,164,50,0.1)',
          border: '1px solid rgba(232,164,50,0.25)',
          color: '#e8a432',
          fontSize: '10px',
          fontWeight: '700',
          letterSpacing: '2px',
          textTransform: 'uppercase',
          padding: '4px 14px',
          borderRadius: '20px',
          marginBottom: '24px'
        }}>
          The Sports Rating Community
        </div>

        <h1 style={{
          fontSize: 'clamp(3rem, 8vw, 5.5rem)',
          fontWeight: '800',
          letterSpacing: '6px',
          color: '#e8e4dc',
          lineHeight: 1,
          marginBottom: '8px',
          textTransform: 'uppercase'
        }}>
          RATE THE
        </h1>
        <h1 style={{
          fontSize: 'clamp(3rem, 8vw, 5.5rem)',
          fontWeight: '800',
          letterSpacing: '6px',
          color: '#e8a432',
          lineHeight: 1,
          marginBottom: '24px',
          textTransform: 'uppercase',
          fontStyle: 'italic'
        }}>
          GAME.
        </h1>

        <p style={{
          color: '#5a6070',
          fontSize: '16px',
          maxWidth: '440px',
          margin: '0 auto 32px',
          lineHeight: 1.6,
          fontWeight: '300'
        }}>
          Log every game, rate every player, build your all-time list.
        </p>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <a href="/auth" style={{
            background: '#e8a432',
            color: '#000',
            fontSize: '13px',
            fontWeight: '700',
            letterSpacing: '1px',
            textTransform: 'uppercase',
            padding: '11px 28px',
            borderRadius: '4px',
            textDecoration: 'none'
          }}>
            Get started
          </a>
          <a href="/games" style={{
            background: 'transparent',
            color: '#e8e4dc',
            fontSize: '13px',
            fontWeight: '500',
            letterSpacing: '1px',
            textTransform: 'uppercase',
            padding: '10px 28px',
            borderRadius: '4px',
            textDecoration: 'none',
            border: '1px solid #2a2f3e'
          }}>
            Browse games
          </a>
        </div>
      </div>

      {/* Stats bar */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '4rem',
        padding: '24px 2rem',
        background: '#12151c',
        borderBottom: '1px solid #1e2330'
      }}>
        {[
          { num: '48,291', label: 'Games rated' },
          { num: '12,540', label: 'Members' },
          { num: '3', label: 'Sports' },
        ].map((stat) => (
          <div key={stat.label} style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '28px', fontWeight: '700', color: '#e8a432', letterSpacing: '1px' }}>
              {stat.num}
            </div>
            <div style={{ fontSize: '10px', color: '#3a4055', textTransform: 'uppercase', letterSpacing: '2px', marginTop: '4px' }}>
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* Recent games section */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '3rem 2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '700', letterSpacing: '3px', textTransform: 'uppercase', color: '#e8e4dc' }}>
            Recent Games
          </h2>
          <a href="/games" style={{ fontSize: '12px', color: '#e8a432', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '700', textDecoration: 'none' }}>
            Browse all →
          </a>
        </div>

        {loading ? (
          <p style={{ color: '#3a4055', fontSize: '14px' }}>Loading...</p>
        ) : games.length === 0 ? (
          // Shown when there are no games in the database yet
          <div style={{
            background: '#151820',
            border: '1px solid #1e2330',
            borderRadius: '8px',
            padding: '40px',
            textAlign: 'center'
          }}>
            <p style={{ color: '#3a4055', fontSize: '14px', marginBottom: '8px' }}>No games yet.</p>
            <p style={{ color: '#2a2f3e', fontSize: '12px' }}>Add some games in your Supabase table to see them here.</p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
            gap: '1rem'
          }}>
            {games.map((game) => (
              <div key={game.id} style={{
                background: '#151820',
                border: '1px solid #1e2330',
                borderRadius: '8px',
                overflow: 'hidden',
                cursor: 'pointer',
              }}>
                {/* Game banner with team names and score */}
                <div style={{
                  height: '80px',
                  background: sportColors[game.sport] || 'linear-gradient(100deg, #1a1d26, #2a2f3e)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0 16px'
                }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '15px', fontWeight: '700', color: '#fff', letterSpacing: '1px' }}>{game.home_team}</div>
                    <div style={{ fontSize: '20px', fontWeight: '800', color: '#fff' }}>{game.home_score}</div>
                  </div>
                  <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', fontWeight: '600' }}>VS</div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '15px', fontWeight: '700', color: '#fff', letterSpacing: '1px' }}>{game.away_team}</div>
                    <div style={{ fontSize: '20px', fontWeight: '800', color: '#fff' }}>{game.away_score}</div>
                  </div>
                </div>

                {/* Game info */}
                <div style={{ padding: '12px' }}>
                  <div style={{ fontSize: '12px', fontWeight: '600', color: '#c8c4bc' }}>
                    {game.home_team} vs {game.away_team}
                  </div>
                  <div style={{ fontSize: '11px', color: '#3a4055', textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: '3px' }}>
                    {sportEmoji[game.sport]} {game.sport} · {new Date(game.game_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </div>
                  {game.notable && (
                    <div style={{ fontSize: '11px', color: '#e8a432', marginTop: '4px', fontStyle: 'italic' }}>
                      {game.notable}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Top players section */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem 4rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '700', letterSpacing: '3px', textTransform: 'uppercase', color: '#e8e4dc' }}>
            Top Rated Players
          </h2>
          <a href="/players" style={{ fontSize: '12px', color: '#e8a432', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '700', textDecoration: 'none' }}>
            See all →
          </a>
        </div>

        {loading ? (
          <p style={{ color: '#3a4055', fontSize: '14px' }}>Loading...</p>
        ) : players.length === 0 ? (
          <div style={{
            background: '#151820',
            border: '1px solid #1e2330',
            borderRadius: '8px',
            padding: '40px',
            textAlign: 'center'
          }}>
            <p style={{ color: '#3a4055', fontSize: '14px', marginBottom: '8px' }}>No players yet.</p>
            <p style={{ color: '#2a2f3e', fontSize: '12px' }}>Add some players in your Supabase table to see them here.</p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
            gap: '1rem'
          }}>
            {players.map((player) => {
              const avatarColor = avatarColors[player.sport] || { bg: '#1a1d26', color: '#7a8099' }
              const initials = player.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)

              return (
                <div key={player.id} style={{
                  background: '#151820',
                  border: '1px solid #1e2330',
                  borderRadius: '8px',
                  padding: '1rem',
                  textAlign: 'center',
                  cursor: 'pointer',
                }}>
                  {/* Avatar circle with player initials */}
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    background: avatarColor.bg,
                    color: avatarColor.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '16px',
                    fontWeight: '700',
                    margin: '0 auto 10px',
                    letterSpacing: '1px'
                  }}>
                    {initials}
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: '600', color: '#c8c4bc' }}>{player.name}</div>
                  <div style={{ fontSize: '10px', color: '#3a4055', textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: '3px' }}>
                    {player.position} · {player.sport}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

    </div>
  )
}