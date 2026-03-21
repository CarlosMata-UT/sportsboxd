'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

type SportStats = {
  name: string
  emoji: string
  tagline: string
  description: string
  photo: string
  gradientFrom: string
  gradientTo: string
  gameCount: number
  playerCount: number
}

const SPORT_CONFIG: Omit<SportStats, 'gameCount' | 'playerCount'>[] = [
  {
    name: 'NBA',
    emoji: '🏀',
    tagline: 'Basketball',
    description: 'The greatest players and most iconic games in professional basketball history — from Jordan\'s Bulls to LeBron\'s dynasty.',
    photo: 'https://images.unsplash.com/photo-1546519638405-a9d1b16a5b24?auto=format&fit=crop&w=1200&q=80',
    gradientFrom: '#1a3a6c',
    gradientTo: '#c9082a',
  },
  {
    name: 'NFL',
    emoji: '🏈',
    tagline: 'American Football',
    description: 'Super Bowl classics, legendary quarterbacks, and the defining moments of America\'s most-watched sport.',
    photo: 'https://images.unsplash.com/photo-1560272564-c83b66b1ad12?auto=format&fit=crop&w=1200&q=80',
    gradientFrom: '#013369',
    gradientTo: '#d50a0a',
  },
  {
    name: 'MLB',
    emoji: '⚾',
    tagline: 'Baseball',
    description: 'The timeless sport — World Series moments, Hall of Fame legends, and America\'s pastime at its finest.',
    photo: 'https://images.unsplash.com/photo-1489944440615-453fc2b6a9a9?auto=format&fit=crop&w=1200&q=80',
    gradientFrom: '#002d72',
    gradientTo: '#e31837',
  },
  {
    name: 'NHL',
    emoji: '🏒',
    tagline: 'Hockey',
    description: 'Stanley Cup battles, overtime heroes, and the fastest team sport on the planet.',
    photo: 'https://images.unsplash.com/photo-1515703407324-5f753afd8be8?auto=format&fit=crop&w=1200&q=80',
    gradientFrom: '#003087',
    gradientTo: '#6d6e71',
  },
  {
    name: 'Soccer',
    emoji: '⚽',
    tagline: 'The Beautiful Game',
    description: 'World Cup drama, Champions League classics, and the global superstars who define the world\'s sport.',
    photo: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=1200&q=80',
    gradientFrom: '#004012',
    gradientTo: '#c8b400',
  },
]

export default function SportsPage() {
  const router = useRouter()
  const [stats, setStats] = useState<Record<string, { games: number; players: number }>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      const sports = ['NBA', 'NFL', 'MLB', 'NHL', 'Soccer']
      const result: Record<string, { games: number; players: number }> = {}

      await Promise.all(
        sports.map(async (sport) => {
          const [{ count: gc }, { count: pc }] = await Promise.all([
            supabase.from('games').select('*', { count: 'exact', head: true }).eq('sport', sport),
            supabase.from('players').select('*', { count: 'exact', head: true }).eq('sport', sport),
          ])
          result[sport] = { games: gc || 0, players: pc || 0 }
        })
      )

      setStats(result)
      setLoading(false)
    }
    fetchStats()
  }, [])

  return (
    <div style={{ background: '#0e1015', minHeight: '100vh' }}>

      {/* ── Page header ─────────────────────────────────────── */}
      <div style={{ position: 'relative', overflow: 'hidden', borderBottom: '1px solid #1e2330' }}>
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: `url('https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1600&q=80')`,
          backgroundSize: 'cover', backgroundPosition: 'center 35%', filter: 'brightness(0.15)',
        }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(14,16,21,0.97) 30%, rgba(14,16,21,0.6) 100%)' }} />
        <div style={{ position: 'relative', zIndex: 1, padding: '52px 2rem 36px' }}>
          <div style={{
            display: 'inline-block', background: 'rgba(232,164,50,0.1)', border: '1px solid rgba(232,164,50,0.2)',
            color: '#e8a432', fontSize: '9px', fontWeight: '700', letterSpacing: '3px',
            textTransform: 'uppercase', padding: '4px 14px', borderRadius: '20px', marginBottom: '14px',
          }}>5 Leagues</div>
          <h1 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '52px', fontWeight: '900', letterSpacing: '4px', textTransform: 'uppercase', color: '#f0ece4', marginBottom: '6px', lineHeight: 1 }}>
            Sports
          </h1>
          <p style={{ color: '#3a4055', fontSize: '13px', letterSpacing: '0.5px' }}>
            Five sports, thousands of games, all-time legends — all in one place
          </p>
        </div>
      </div>

      {/* ── Sport cards ─────────────────────────────────────── */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {SPORT_CONFIG.map((sport) => {
            const sportStats = stats[sport.name] || { games: 0, players: 0 }

            return (
              <div
                key={sport.name}
                style={{
                  position: 'relative', overflow: 'hidden',
                  borderRadius: '14px', border: '1px solid #1e2330',
                  cursor: 'pointer', minHeight: '220px',
                  transition: 'border-color 0.2s, transform 0.1s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#2a2f3e'; e.currentTarget.style.transform = 'translateY(-2px)' }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#1e2330'; e.currentTarget.style.transform = 'translateY(0)' }}
              >
                {/* Background photo */}
                <div style={{
                  position: 'absolute', inset: 0,
                  backgroundImage: `url('${sport.photo}')`,
                  backgroundSize: 'cover', backgroundPosition: 'center',
                  filter: 'brightness(0.25)',
                }} />
                {/* Gradient overlay */}
                <div style={{
                  position: 'absolute', inset: 0,
                  background: `linear-gradient(100deg, ${sport.gradientFrom}ee 0%, ${sport.gradientFrom}aa 40%, transparent 100%)`,
                }} />

                {/* Content */}
                <div style={{
                  position: 'relative', zIndex: 1,
                  padding: '40px 48px',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '32px',
                }}>
                  {/* Sport info */}
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '48px', marginBottom: '12px', lineHeight: 1 }}>{sport.emoji}</div>
                    <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', fontWeight: '700', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '8px' }}>
                      {sport.tagline}
                    </div>
                    <h2 style={{
                      fontFamily: "'Barlow Condensed', sans-serif",
                      fontSize: '44px', fontWeight: '900', letterSpacing: '4px',
                      textTransform: 'uppercase', color: '#fff', lineHeight: 1, marginBottom: '12px',
                    }}>
                      {sport.name}
                    </h2>
                    <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '14px', lineHeight: 1.7, maxWidth: '480px', margin: '0 0 24px' }}>
                      {sport.description}
                    </p>
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <button
                        onClick={() => router.push(`/games?sport=${sport.name}`)}
                        style={{
                          background: '#e8a432', border: 'none', color: '#000',
                          fontFamily: "'Barlow Condensed', sans-serif",
                          fontSize: '13px', fontWeight: '800', letterSpacing: '1.5px',
                          textTransform: 'uppercase', padding: '10px 20px',
                          borderRadius: '6px', cursor: 'pointer',
                        }}
                      >
                        Browse Games
                      </button>
                      <button
                        onClick={() => router.push(`/players?sport=${sport.name}`)}
                        style={{
                          background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)',
                          color: 'rgba(255,255,255,0.7)',
                          fontFamily: "'Barlow Condensed', sans-serif",
                          fontSize: '13px', fontWeight: '800', letterSpacing: '1.5px',
                          textTransform: 'uppercase', padding: '10px 20px',
                          borderRadius: '6px', cursor: 'pointer',
                        }}
                      >
                        Browse Players
                      </button>
                    </div>
                  </div>

                  {/* Stats */}
                  <div style={{ display: 'flex', gap: '24px', flexShrink: 0 }}>
                    <div style={{
                      background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: '12px', padding: '24px 28px', textAlign: 'center', minWidth: '110px',
                    }}>
                      <div style={{
                        fontFamily: "'Barlow Condensed', sans-serif",
                        fontSize: '44px', fontWeight: '900', color: '#e8a432', lineHeight: 1,
                      }}>
                        {loading ? '—' : sportStats.games.toLocaleString()}
                      </div>
                      <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '1.5px', fontWeight: '700', marginTop: '6px' }}>
                        Games
                      </div>
                    </div>
                    <div style={{
                      background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: '12px', padding: '24px 28px', textAlign: 'center', minWidth: '110px',
                    }}>
                      <div style={{
                        fontFamily: "'Barlow Condensed', sans-serif",
                        fontSize: '44px', fontWeight: '900', color: '#e8a432', lineHeight: 1,
                      }}>
                        {loading ? '—' : sportStats.players.toLocaleString()}
                      </div>
                      <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '1.5px', fontWeight: '700', marginTop: '6px' }}>
                        Players
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Bottom CTA */}
        <div style={{
          marginTop: '3rem', padding: '40px',
          background: 'linear-gradient(135deg, #151820, #12151c)',
          border: '1px solid #1e2330', borderRadius: '14px', textAlign: 'center',
        }}>
          <div style={{ fontSize: '36px', marginBottom: '12px' }}>⭐</div>
          <h3 style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: '28px', fontWeight: '900', letterSpacing: '3px',
            textTransform: 'uppercase', color: '#f0ece4', marginBottom: '10px',
          }}>
            Rate Across Every Sport
          </h3>
          <p style={{ color: '#3a4055', fontSize: '14px', lineHeight: 1.7, marginBottom: '24px' }}>
            Sign in to rate games and players, write reviews, and build your sports history.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <a href="/auth" style={{
              background: '#e8a432', color: '#000',
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: '14px', fontWeight: '800', letterSpacing: '2px',
              textTransform: 'uppercase', padding: '12px 28px',
              borderRadius: '6px', textDecoration: 'none',
            }}>
              Get Started
            </a>
            <a href="/rankings" style={{
              background: 'transparent', color: '#7a8099',
              border: '1px solid #2a2f3e',
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: '14px', fontWeight: '800', letterSpacing: '2px',
              textTransform: 'uppercase', padding: '12px 28px',
              borderRadius: '6px', textDecoration: 'none',
            }}>
              View Rankings
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
