'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { getTeamLogoUrl, getBBRefBoxScoreUrl } from '@/lib/sportUtils'
import RatingModal from '../../components/RatingModal'

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

type Rating = {
  stars: number
  review: string
}

const sportEmoji: Record<string, string> = {
  NBA: '🏀', NFL: '🏈', MLB: '⚾', NHL: '🏒', Soccer: '⚽',
}

const sportBanners: Record<string, { from: string; to: string }> = {
  NBA: { from: '#1a3a6c', to: '#c9082a' },
  NFL: { from: '#013369', to: '#d50a0a' },
  MLB: { from: '#002d72', to: '#e31837' },
  NHL: { from: '#003087', to: '#6d6e71' },
  Soccer: { from: '#004012', to: '#c8b400' },
}

const sportPhotos: Record<string, string> = {
  NBA: 'https://images.unsplash.com/photo-1546519638405-a9d1b16a5b24?auto=format&fit=crop&w=1600&q=80',
  NFL: 'https://images.unsplash.com/photo-1560272564-c83b66b1ad12?auto=format&fit=crop&w=1600&q=80',
  MLB: 'https://images.unsplash.com/photo-1489944440615-453fc2b6a9a9?auto=format&fit=crop&w=1600&q=80',
  NHL: 'https://images.unsplash.com/photo-1515703407324-5f753afd8be8?auto=format&fit=crop&w=1600&q=80',
  Soccer: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=1600&q=80',
}

function TeamLogo({ team, sport, size = 80 }: { team: string; sport: string; size?: number }) {
  const [imgError, setImgError] = useState(false)
  const logoUrl = getTeamLogoUrl(team, sport)

  if (!logoUrl || imgError) {
    const colors = sportBanners[sport] || { from: '#1a1d26', to: '#2a2f3e' }
    const abbr = team.split(' ').map(w => w[0]).join('').slice(0, 3).toUpperCase()
    return (
      <div style={{
        width: size, height: size,
        borderRadius: '12px',
        background: `linear-gradient(135deg, ${colors.from}, ${colors.to})`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: "'Barlow Condensed', sans-serif",
        fontWeight: '900', fontSize: size * 0.3,
        color: 'rgba(255,255,255,0.9)',
        letterSpacing: '2px',
        flexShrink: 0,
      }}>
        {abbr}
      </div>
    )
  }

  return (
    <img
      src={logoUrl}
      alt={team}
      width={size}
      height={size}
      style={{ objectFit: 'contain', flexShrink: 0, filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.5))' }}
      onError={() => setImgError(true)}
    />
  )
}

export default function GameDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [game, setGame] = useState<Game | null>(null)
  const [ratings, setRatings] = useState<Rating[]>([])
  const [avgRating, setAvgRating] = useState(0)
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    const fetchGame = async () => {
      const { data: gameData } = await supabase
        .from('games')
        .select('*')
        .eq('id', id)
        .single()

      const { data: ratingData } = await supabase
        .from('ratings')
        .select('stars, review')
        .eq('target_id', id)
        .eq('target_type', 'game')

      if (gameData) setGame(gameData)
      if (ratingData) {
        setRatings(ratingData)
        if (ratingData.length > 0) {
          const avg = ratingData.reduce((s: number, r: Rating) => s + r.stars, 0) / ratingData.length
          setAvgRating(avg)
        }
      }
      setLoading(false)
    }
    fetchGame()
  }, [id])

  if (loading) {
    return (
      <div style={{ background: '#0e1015', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#3a4055', fontSize: '14px' }}>Loading game...</p>
      </div>
    )
  }

  if (!game) {
    return (
      <div style={{ background: '#0e1015', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#3a4055', fontSize: '14px' }}>Game not found.</p>
      </div>
    )
  }

  const colors = sportBanners[game.sport] || { from: '#1a1d26', to: '#2a2f3e' }
  const winner = game.home_score > game.away_score ? 'home' : game.away_score > game.home_score ? 'away' : 'tie'
  const bbrefUrl = getBBRefBoxScoreUrl(game.game_date, game.home_team, game.sport)
  const formattedDate = new Date(game.game_date).toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  })

  const renderStars = (avg: number) => '★'.repeat(Math.round(avg)) + '☆'.repeat(5 - Math.round(avg))

  return (
    <div style={{ background: '#0e1015', minHeight: '100vh' }}>

      {/* ── Back button ──────────────────────────────────────── */}
      <div style={{ padding: '16px 2rem 0', maxWidth: '1100px', margin: '0 auto' }}>
        <button
          onClick={() => router.back()}
          style={{
            background: 'transparent', border: '1px solid #2a2f3e',
            borderRadius: '6px', color: '#5a6070', fontSize: '12px',
            fontWeight: '700', letterSpacing: '1px', textTransform: 'uppercase',
            padding: '7px 16px', cursor: 'pointer',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#e8a432'; e.currentTarget.style.color = '#e8a432' }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#2a2f3e'; e.currentTarget.style.color = '#5a6070' }}
        >
          ← Back
        </button>
      </div>

      {/* ── Hero scoreboard ──────────────────────────────────── */}
      <div style={{
        position: 'relative', overflow: 'hidden', marginTop: '20px',
        borderTop: '1px solid #1e2330', borderBottom: '1px solid #1e2330',
      }}>
        {/* Background photo */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: `url('${sportPhotos[game.sport] || sportPhotos.NBA}')`,
          backgroundSize: 'cover', backgroundPosition: 'center',
          filter: 'brightness(0.12)',
        }} />
        <div style={{
          position: 'absolute', inset: 0,
          background: `linear-gradient(135deg, ${colors.from}cc, ${colors.to}88)`,
        }} />

        <div style={{
          position: 'relative', zIndex: 1,
          maxWidth: '1100px', margin: '0 auto',
          padding: '60px 2rem',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0',
        }}>

          {/* Home team */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
            <TeamLogo team={game.home_team} sport={game.sport} size={100} />
            <div style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: '22px', fontWeight: '900', letterSpacing: '3px',
              color: winner === 'home' ? '#fff' : 'rgba(255,255,255,0.5)',
              textTransform: 'uppercase', textAlign: 'center',
            }}>
              {game.home_team}
            </div>
            <div style={{
              fontSize: '11px', color: 'rgba(255,255,255,0.4)',
              textTransform: 'uppercase', letterSpacing: '2px', fontWeight: '600',
            }}>
              Home
            </div>
          </div>

          {/* Score */}
          <div style={{ textAlign: 'center', padding: '0 40px', flexShrink: 0 }}>
            <div style={{
              fontSize: '11px', color: 'rgba(255,255,255,0.3)',
              textTransform: 'uppercase', letterSpacing: '3px', fontWeight: '700',
              marginBottom: '12px',
            }}>
              Final
            </div>
            <div style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: '80px', fontWeight: '900', lineHeight: 1,
              color: '#fff', letterSpacing: '-2px',
              textShadow: '0 4px 20px rgba(0,0,0,0.5)',
            }}>
              {game.home_score}
              <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: '48px', margin: '0 8px' }}>·</span>
              {game.away_score}
            </div>
            <div style={{
              marginTop: '16px',
              display: 'inline-block',
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '20px',
              padding: '4px 16px',
              fontSize: '10px', color: 'rgba(255,255,255,0.4)',
              textTransform: 'uppercase', letterSpacing: '2px', fontWeight: '700',
            }}>
              {sportEmoji[game.sport]} {game.sport}
            </div>
          </div>

          {/* Away team */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
            <TeamLogo team={game.away_team} sport={game.sport} size={100} />
            <div style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: '22px', fontWeight: '900', letterSpacing: '3px',
              color: winner === 'away' ? '#fff' : 'rgba(255,255,255,0.5)',
              textTransform: 'uppercase', textAlign: 'center',
            }}>
              {game.away_team}
            </div>
            <div style={{
              fontSize: '11px', color: 'rgba(255,255,255,0.4)',
              textTransform: 'uppercase', letterSpacing: '2px', fontWeight: '600',
            }}>
              Away
            </div>
          </div>
        </div>
      </div>

      {/* ── Main content ─────────────────────────────────────── */}
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '2rem', display: 'grid', gridTemplateColumns: '1fr 340px', gap: '2rem' }}>

        {/* Left: game info */}
        <div>

          {/* Notable / headline */}
          {game.notable && (
            <div style={{
              background: 'rgba(232,164,50,0.06)',
              border: '1px solid rgba(232,164,50,0.15)',
              borderRadius: '10px',
              padding: '20px 22px',
              marginBottom: '20px',
            }}>
              <div style={{ fontSize: '9px', color: '#e8a432', fontWeight: '700', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '8px' }}>
                Notable
              </div>
              <p style={{ color: '#c8c4bc', fontSize: '16px', lineHeight: 1.6, margin: 0, fontStyle: 'italic' }}>
                "{game.notable}"
              </p>
            </div>
          )}

          {/* Game info grid */}
          <div style={{
            background: '#151820', border: '1px solid #1e2330',
            borderRadius: '10px', padding: '24px', marginBottom: '20px',
          }}>
            <div style={{ fontSize: '11px', color: '#3a4055', fontWeight: '700', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '20px' }}>
              Game Information
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              {[
                { label: 'Date', value: formattedDate },
                { label: 'Sport', value: `${sportEmoji[game.sport]} ${game.sport}` },
                { label: 'Season', value: game.season || '—' },
                { label: 'Matchup', value: `${game.home_team} vs ${game.away_team}` },
                { label: 'Home Score', value: game.home_score?.toString() },
                { label: 'Away Score', value: game.away_score?.toString() },
                { label: 'Result', value: winner === 'tie' ? 'Tie' : `${winner === 'home' ? game.home_team : game.away_team} Win` },
                { label: 'Margin', value: Math.abs(game.home_score - game.away_score).toString() + ' pts' },
              ].map(({ label, value }) => (
                <div key={label}>
                  <div style={{ fontSize: '10px', color: '#3a4055', fontWeight: '700', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '4px' }}>
                    {label}
                  </div>
                  <div style={{ fontSize: '14px', color: '#c8c4bc', fontWeight: '600' }}>
                    {value}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Box score / external links */}
          <div style={{
            background: '#151820', border: '1px solid #1e2330',
            borderRadius: '10px', padding: '24px', marginBottom: '20px',
          }}>
            <div style={{ fontSize: '11px', color: '#3a4055', fontWeight: '700', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '16px' }}>
              Box Score &amp; Stats
            </div>
            {bbrefUrl ? (
              <div>
                <p style={{ color: '#5a6070', fontSize: '13px', lineHeight: 1.7, marginBottom: '16px' }}>
                  Full play-by-play, quarter scores, individual player stats, and advanced metrics are available on Basketball Reference.
                </p>
                <a
                  href={bbrefUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: '8px',
                    background: '#e8a432', color: '#000',
                    fontSize: '12px', fontWeight: '800', letterSpacing: '1px',
                    textTransform: 'uppercase', padding: '10px 20px',
                    borderRadius: '6px', textDecoration: 'none',
                  }}
                >
                  View Full Box Score →
                </a>
              </div>
            ) : (
              <p style={{ color: '#3a4055', fontSize: '13px' }}>
                Detailed box score available for NBA games via Basketball Reference.
              </p>
            )}
          </div>

          {/* Community reviews */}
          {ratings.filter(r => r.review).length > 0 && (
            <div style={{
              background: '#151820', border: '1px solid #1e2330',
              borderRadius: '10px', padding: '24px',
            }}>
              <div style={{ fontSize: '11px', color: '#3a4055', fontWeight: '700', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '16px' }}>
                Community Reviews
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {ratings.filter(r => r.review).slice(0, 5).map((r, i) => (
                  <div key={i} style={{ borderBottom: '1px solid #1e2330', paddingBottom: '14px' }}>
                    <div style={{ color: '#e8a432', fontSize: '13px', marginBottom: '6px' }}>
                      {'★'.repeat(r.stars)}{'☆'.repeat(5 - r.stars)}
                    </div>
                    <p style={{ color: '#7a8099', fontSize: '13px', lineHeight: 1.6, margin: 0, fontStyle: 'italic' }}>
                      "{r.review}"
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: rating sidebar */}
        <div>
          {/* Community rating */}
          <div style={{
            background: '#151820', border: '1px solid #1e2330',
            borderRadius: '10px', padding: '24px', marginBottom: '16px', textAlign: 'center',
          }}>
            <div style={{ fontSize: '10px', color: '#3a4055', fontWeight: '700', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '16px' }}>
              Community Rating
            </div>
            {ratings.length > 0 ? (
              <>
                <div style={{
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontSize: '64px', fontWeight: '900', color: '#e8a432',
                  lineHeight: 1, marginBottom: '8px',
                }}>
                  {avgRating.toFixed(1)}
                </div>
                <div style={{ color: '#e8a432', fontSize: '18px', letterSpacing: '4px', marginBottom: '8px' }}>
                  {renderStars(avgRating)}
                </div>
                <div style={{ color: '#3a4055', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  {ratings.length} {ratings.length === 1 ? 'rating' : 'ratings'}
                </div>
              </>
            ) : (
              <div style={{ color: '#3a4055', fontSize: '13px', padding: '10px 0' }}>
                No ratings yet — be the first!
              </div>
            )}
          </div>

          {/* Rate button */}
          <button
            onClick={() => setShowModal(true)}
            style={{
              width: '100%', background: '#e8a432', border: 'none',
              borderRadius: '8px', color: '#000',
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: '16px', fontWeight: '800', letterSpacing: '2px',
              textTransform: 'uppercase', padding: '14px',
              cursor: 'pointer', marginBottom: '16px',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#f0b340')}
            onMouseLeave={(e) => (e.currentTarget.style.background = '#e8a432')}
          >
            ★ Rate This Game
          </button>

          {/* Scoreline recap */}
          <div style={{
            background: '#151820', border: '1px solid #1e2330',
            borderRadius: '10px', padding: '20px',
          }}>
            <div style={{ fontSize: '10px', color: '#3a4055', fontWeight: '700', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '14px' }}>
              Scoreline
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
              <div style={{ textAlign: 'center', flex: 1 }}>
                <div style={{ fontSize: '11px', color: '#5a6070', marginBottom: '4px', fontWeight: '600' }}>
                  {game.home_team.split(' ').slice(-1)[0]}
                </div>
                <div style={{
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontSize: '36px', fontWeight: '900',
                  color: winner === 'home' ? '#e8a432' : '#3a4055',
                }}>
                  {game.home_score}
                </div>
              </div>
              <div style={{ color: '#2a2f3e', fontWeight: '700', fontSize: '14px' }}>—</div>
              <div style={{ textAlign: 'center', flex: 1 }}>
                <div style={{ fontSize: '11px', color: '#5a6070', marginBottom: '4px', fontWeight: '600' }}>
                  {game.away_team.split(' ').slice(-1)[0]}
                </div>
                <div style={{
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontSize: '36px', fontWeight: '900',
                  color: winner === 'away' ? '#e8a432' : '#3a4055',
                }}>
                  {game.away_score}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showModal && (
        <RatingModal
          targetId={game.id}
          targetName={`${game.home_team} vs ${game.away_team}`}
          targetType="game"
          onClose={() => setShowModal(false)}
          onSuccess={() => { setShowModal(false) }}
        />
      )}
    </div>
  )
}
