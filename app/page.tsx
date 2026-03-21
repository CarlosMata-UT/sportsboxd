'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { getTeamColors } from '@/lib/teamColors'

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

const sportEmoji: Record<string, string> = {
  NBA: '🏀',
  NFL: '🏈',
  MLB: '⚾',
  NHL: '🏒',
  Soccer: '⚽',
}


const avatarColors: Record<string, { bg: string; color: string; border: string }> = {
  NBA: { bg: '#0a1e3a', color: '#5b9ee8', border: '#1a3a6c' },
  NFL: { bg: '#1a0808', color: '#e85b5b', border: '#3a1010' },
  MLB: { bg: '#0a2010', color: '#5bbf7a', border: '#143020' },
  NHL: { bg: '#0a1530', color: '#7aa8e8', border: '#162040' },
  Soccer: { bg: '#1a1a08', color: '#d4c84a', border: '#2a2a10' },
}

const SPORT_SHOWCASE = [
  {
    sport: 'NBA',
    name: 'Basketball',
    href: '/games',
    image: 'https://images.unsplash.com/photo-1546519638405-a9d1b16a5b24?auto=format&fit=crop&w=800&q=80',
    gradient: 'linear-gradient(to top, rgba(14,16,21,0.96) 0%, rgba(26,58,108,0.55) 55%, rgba(0,0,0,0.1) 100%)',
    accent: '#c9082a',
  },
  {
    sport: 'NFL',
    name: 'Football',
    href: '/games',
    image: 'https://images.unsplash.com/photo-1560272564-c83b66b1ad12?auto=format&fit=crop&w=800&q=80',
    gradient: 'linear-gradient(to top, rgba(14,16,21,0.96) 0%, rgba(1,51,105,0.55) 55%, rgba(0,0,0,0.1) 100%)',
    accent: '#d50a0a',
  },
  {
    sport: 'MLB',
    name: 'Baseball',
    href: '/games',
    image: 'https://images.unsplash.com/photo-1489944440615-453fc2b6a9a9?auto=format&fit=crop&w=800&q=80',
    gradient: 'linear-gradient(to top, rgba(14,16,21,0.96) 0%, rgba(0,45,114,0.55) 55%, rgba(0,0,0,0.1) 100%)',
    accent: '#e31837',
  },
]

export default function HomePage() {
  const [games, setGames] = useState<Game[]>([])
  const [players, setPlayers] = useState<Player[]>([])
  const [loading, setLoading] = useState(true)

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

  return (
    <div style={{ background: '#0e1015', minHeight: '100vh' }}>

      {/* ── Hero ─────────────────────────────────────────────── */}
      <div style={{
        position: 'relative',
        minHeight: '580px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        borderBottom: '1px solid #1e2330',
      }}>
        {/* Background stadium photo */}
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `url('https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1600&q=80')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center 35%',
          filter: 'brightness(0.28)',
        }} />
        {/* Bottom fade to page bg */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to bottom, rgba(14,16,21,0.15) 0%, rgba(14,16,21,0.55) 65%, rgba(14,16,21,1) 100%)',
        }} />

        {/* Content */}
        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', padding: '88px 2rem 64px' }}>

          <div style={{
            display: 'inline-block',
            background: 'rgba(232,164,50,0.1)',
            border: '1px solid rgba(232,164,50,0.28)',
            color: '#e8a432',
            fontSize: '10px',
            fontWeight: '700',
            letterSpacing: '3px',
            textTransform: 'uppercase',
            padding: '5px 16px',
            borderRadius: '20px',
            marginBottom: '28px',
          }}>
            The Sports Rating Community
          </div>

          <div style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: 'clamp(4.5rem, 11vw, 7.5rem)',
            fontWeight: '900',
            letterSpacing: '4px',
            lineHeight: 0.88,
            marginBottom: '28px',
            textTransform: 'uppercase',
          }}>
            <div style={{ color: '#f0ece4' }}>RATE THE</div>
            <div style={{ color: '#e8a432', fontStyle: 'italic' }}>GAME.</div>
          </div>

          <p style={{
            color: 'rgba(200,196,188,0.65)',
            fontSize: '15px',
            maxWidth: '400px',
            margin: '0 auto 36px',
            lineHeight: 1.65,
            fontWeight: '300',
            letterSpacing: '0.2px',
          }}>
            Log every game, rate every player, build your all-time list.
          </p>

          {/* Sport badges */}
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '40px' }}>
            {[
              { label: 'NBA', emoji: '🏀' },
              { label: 'NFL', emoji: '🏈' },
              { label: 'MLB', emoji: '⚾' },
              { label: 'NHL', emoji: '🏒' },
              { label: 'Soccer', emoji: '⚽' },
            ].map((s) => (
              <div key={s.label} style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '20px',
                padding: '4px 14px',
                fontSize: '11px',
                color: 'rgba(200,196,188,0.55)',
                letterSpacing: '1.5px',
                fontWeight: '600',
                textTransform: 'uppercase',
              }}>
                {s.emoji} {s.label}
              </div>
            ))}
          </div>

          {/* CTAs */}
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <a href="/auth" style={{
              background: '#e8a432',
              color: '#000',
              fontSize: '13px',
              fontWeight: '700',
              letterSpacing: '2px',
              textTransform: 'uppercase',
              padding: '13px 34px',
              borderRadius: '4px',
              textDecoration: 'none',
            }}>
              Get started
            </a>
            <a href="/games" style={{
              background: 'rgba(255,255,255,0.06)',
              backdropFilter: 'blur(8px)',
              color: '#e8e4dc',
              fontSize: '13px',
              fontWeight: '500',
              letterSpacing: '2px',
              textTransform: 'uppercase',
              padding: '12px 34px',
              borderRadius: '4px',
              textDecoration: 'none',
              border: '1px solid rgba(255,255,255,0.12)',
            }}>
              Browse games
            </a>
          </div>
        </div>
      </div>

      {/* ── Stats bar ─────────────────────────────────────────── */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '5rem',
        padding: '22px 2rem',
        background: '#12151c',
        borderBottom: '1px solid #1e2330',
      }}>
        {[
          { num: '48,291', label: 'Games rated' },
          { num: '12,540', label: 'Members' },
          { num: '5', label: 'Sports' },
        ].map((stat) => (
          <div key={stat.label} style={{ textAlign: 'center' }}>
            <div style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: '30px',
              fontWeight: '700',
              color: '#e8a432',
              letterSpacing: '1px',
            }}>
              {stat.num}
            </div>
            <div style={{ fontSize: '10px', color: '#3a4055', textTransform: 'uppercase', letterSpacing: '2px', marginTop: '2px' }}>
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* ── Sport showcase ───────────────────────────────────── */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '3rem 2rem 2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '1.25rem' }}>
          <h2 style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: '22px',
            fontWeight: '700',
            letterSpacing: '3px',
            textTransform: 'uppercase',
            color: '#e8e4dc',
          }}>
            Browse by Sport
          </h2>
          <a href="/games" style={{ fontSize: '12px', color: '#e8a432', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '700', textDecoration: 'none' }}>
            All sports →
          </a>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '14px',
        }}>
          {SPORT_SHOWCASE.map((s) => (
            <a
              key={s.sport}
              href={s.href}
              style={{
                position: 'relative',
                height: '210px',
                borderRadius: '10px',
                overflow: 'hidden',
                display: 'block',
                textDecoration: 'none',
                cursor: 'pointer',
                border: '1px solid #1e2330',
              }}
            >
              {/* Sport photo */}
              <div style={{
                position: 'absolute',
                inset: 0,
                backgroundImage: `url('${s.image}')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }} />
              {/* Gradient overlay */}
              <div style={{
                position: 'absolute',
                inset: 0,
                background: s.gradient,
              }} />
              {/* Content */}
              <div style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                padding: '20px',
                zIndex: 1,
              }}>
                <div style={{ fontSize: '26px', marginBottom: '4px' }}>
                  {sportEmoji[s.sport]}
                </div>
                <div style={{
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontSize: '26px',
                  fontWeight: '900',
                  color: '#fff',
                  letterSpacing: '2px',
                  textTransform: 'uppercase',
                  lineHeight: 1,
                }}>
                  {s.sport}
                </div>
                <div style={{
                  fontSize: '11px',
                  color: 'rgba(255,255,255,0.45)',
                  letterSpacing: '1.5px',
                  textTransform: 'uppercase',
                  marginTop: '5px',
                }}>
                  {s.name}
                </div>
              </div>
              {/* Right accent line */}
              <div style={{
                position: 'absolute',
                top: 0,
                right: 0,
                width: '3px',
                height: '100%',
                background: s.accent,
                opacity: 0.8,
              }} />
            </a>
          ))}
        </div>
      </div>

      {/* ── Recent Games ─────────────────────────────────────── */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '1rem 2rem 3rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '1.25rem' }}>
          <h2 style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: '22px',
            fontWeight: '700',
            letterSpacing: '3px',
            textTransform: 'uppercase',
            color: '#e8e4dc',
          }}>
            Recent Games
          </h2>
          <a href="/games" style={{ fontSize: '12px', color: '#e8a432', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '700', textDecoration: 'none' }}>
            Browse all →
          </a>
        </div>

        {loading ? (
          <p style={{ color: '#3a4055', fontSize: '14px' }}>Loading...</p>
        ) : games.length === 0 ? (
          <div style={{
            background: '#151820',
            border: '1px solid #1e2330',
            borderRadius: '10px',
            padding: '40px',
            textAlign: 'center',
          }}>
            <p style={{ color: '#3a4055', fontSize: '14px', marginBottom: '6px' }}>No games yet.</p>
            <p style={{ color: '#2a2f3e', fontSize: '12px' }}>Add some games in your Supabase table to see them here.</p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
            gap: '1rem',
          }}>
            {games.map((game) => {
              const homeColors = getTeamColors(game.home_team, game.sport)
              const awayColors = getTeamColors(game.away_team, game.sport)
              return (
              <div key={game.id} style={{
                background: '#151820',
                border: '1px solid #1e2330',
                borderRadius: '10px',
                overflow: 'hidden',
                cursor: 'pointer',
              }}>
                {/* Banner: team colors gradient */}
                <div style={{
                  height: '104px',
                  background: `linear-gradient(100deg, ${homeColors.primary}ee 0%, ${homeColors.primary}99 45%, ${awayColors.primary}99 55%, ${awayColors.primary}ee 100%)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0 20px',
                  position: 'relative',
                }}>
                  <div style={{
                    position: 'absolute',
                    top: '8px',
                    left: '10px',
                    fontSize: '9px',
                    fontWeight: '700',
                    letterSpacing: '2px',
                    color: 'rgba(255,255,255,0.4)',
                    textTransform: 'uppercase',
                  }}>
                    {game.sport}
                  </div>
                  <div style={{ textAlign: 'center', zIndex: 1 }}>
                    <div style={{ fontSize: '13px', fontWeight: '700', color: '#fff', letterSpacing: '0.5px', textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}>
                      {game.home_team}
                    </div>
                    <div style={{
                      fontFamily: "'Barlow Condensed', sans-serif",
                      fontSize: '30px',
                      fontWeight: '800',
                      color: '#fff',
                      lineHeight: 1,
                      textShadow: '0 2px 8px rgba(0,0,0,0.6)',
                    }}>
                      {game.home_score}
                    </div>
                  </div>
                  <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.3)', fontWeight: '700', letterSpacing: '2px' }}>
                    FINAL
                  </div>
                  <div style={{ textAlign: 'center', zIndex: 1 }}>
                    <div style={{ fontSize: '13px', fontWeight: '700', color: '#fff', letterSpacing: '0.5px', textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}>
                      {game.away_team}
                    </div>
                    <div style={{
                      fontFamily: "'Barlow Condensed', sans-serif",
                      fontSize: '30px',
                      fontWeight: '800',
                      color: '#fff',
                      lineHeight: 1,
                      textShadow: '0 2px 8px rgba(0,0,0,0.6)',
                    }}>
                      {game.away_score}
                    </div>
                  </div>
                </div>

                {/* Info */}
                <div style={{ padding: '13px 14px' }}>
                  <div style={{ fontSize: '12px', fontWeight: '600', color: '#c8c4bc', marginBottom: '3px' }}>
                    {game.home_team} vs {game.away_team}
                  </div>
                  <div style={{ fontSize: '11px', color: '#3a4055', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    {sportEmoji[game.sport]} {game.sport} · {new Date(game.game_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </div>
                  {game.notable && (
                    <div style={{ fontSize: '11px', color: '#e8a432', marginTop: '5px', fontStyle: 'italic' }}>
                      {game.notable}
                    </div>
                  )}
                </div>
              </div>
              )
            })}
          </div>
        )}
      </div>

      {/* ── Top Players ──────────────────────────────────────── */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem 5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '1.25rem' }}>
          <h2 style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: '22px',
            fontWeight: '700',
            letterSpacing: '3px',
            textTransform: 'uppercase',
            color: '#e8e4dc',
          }}>
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
            borderRadius: '10px',
            padding: '40px',
            textAlign: 'center',
          }}>
            <p style={{ color: '#3a4055', fontSize: '14px', marginBottom: '6px' }}>No players yet.</p>
            <p style={{ color: '#2a2f3e', fontSize: '12px' }}>Add some players in your Supabase table to see them here.</p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(175px, 1fr))',
            gap: '1rem',
          }}>
            {players.map((player) => {
              const ac = avatarColors[player.sport] || { bg: '#1a1d26', color: '#7a8099', border: '#2a2f3e' }
              const initials = player.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)

              return (
                <div key={player.id} style={{
                  background: '#151820',
                  border: `1px solid ${ac.border}`,
                  borderRadius: '10px',
                  padding: '20px 14px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  position: 'relative',
                  overflow: 'hidden',
                }}>
                  {/* Top accent bar */}
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '3px',
                    background: ac.color,
                    opacity: 0.5,
                  }} />

                  {/* Avatar */}
                  <div style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '50%',
                    background: ac.bg,
                    color: ac.color,
                    border: `2px solid ${ac.border}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '18px',
                    fontWeight: '800',
                    margin: '0 auto 12px',
                    letterSpacing: '1px',
                    fontFamily: "'Barlow Condensed', sans-serif",
                  }}>
                    {initials}
                  </div>

                  <div style={{ fontSize: '13px', fontWeight: '700', color: '#e8e4dc', marginBottom: '3px' }}>
                    {player.name}
                  </div>
                  <div style={{ fontSize: '10px', color: '#5a6070', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>
                    {player.position}
                  </div>

                  {/* Sport badge */}
                  <div style={{
                    display: 'inline-block',
                    background: ac.bg,
                    color: ac.color,
                    fontSize: '9px',
                    fontWeight: '700',
                    letterSpacing: '1.5px',
                    textTransform: 'uppercase',
                    padding: '3px 10px',
                    borderRadius: '20px',
                    border: `1px solid ${ac.border}`,
                  }}>
                    {sportEmoji[player.sport]} {player.sport}
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
