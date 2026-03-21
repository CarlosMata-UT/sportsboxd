'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { getPlayerHeadshotUrl, getBBRefPlayerUrl } from '@/lib/sportUtils'
import RatingModal from '../../components/RatingModal'

type Player = {
  id: string
  name: string
  sport: string
  position: string
  team: string
  era: string
}

type Rating = {
  stars: number
  review: string
}

const sportEmoji: Record<string, string> = {
  NBA: '🏀', NFL: '🏈', MLB: '⚾', NHL: '🏒', Soccer: '⚽',
}

const avatarColors: Record<string, { bg: string; color: string; border: string; from: string; to: string }> = {
  NBA: { bg: '#0a1e3a', color: '#5b9ee8', border: '#1a3a6c', from: '#1a3a6c', to: '#c9082a' },
  NFL: { bg: '#1a0808', color: '#e85b5b', border: '#3a1010', from: '#013369', to: '#d50a0a' },
  MLB: { bg: '#0a2010', color: '#5bbf7a', border: '#143020', from: '#002d72', to: '#e31837' },
  NHL: { bg: '#0a1530', color: '#7aa8e8', border: '#162040', from: '#003087', to: '#6d6e71' },
  Soccer: { bg: '#1a1a08', color: '#d4c84a', border: '#2a2a10', from: '#004012', to: '#c8b400' },
}

const sportBios: Record<string, string> = {
  NBA: 'Basketball player stats, career history, and advanced analytics available on Basketball Reference.',
  NFL: 'Football player stats and career history available on Pro Football Reference.',
  MLB: 'Baseball player stats and career records available on Baseball Reference.',
  NHL: 'Hockey player stats and career history available on Hockey Reference.',
  Soccer: 'Soccer player stats and career history available via FBref.',
}

const refSites: Record<string, string> = {
  NBA: 'Basketball Reference',
  NFL: 'Pro Football Reference',
  MLB: 'Baseball Reference',
  NHL: 'Hockey Reference',
  Soccer: 'FBref',
}

export default function PlayerDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [player, setPlayer] = useState<Player | null>(null)
  const [ratings, setRatings] = useState<Rating[]>([])
  const [avgRating, setAvgRating] = useState(0)
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [imgError, setImgError] = useState(false)

  useEffect(() => {
    const fetchPlayer = async () => {
      const { data: playerData } = await supabase
        .from('players')
        .select('*')
        .eq('id', id)
        .single()

      const { data: ratingData } = await supabase
        .from('ratings')
        .select('stars, review')
        .eq('target_id', id)
        .eq('target_type', 'player')

      if (playerData) setPlayer(playerData)
      if (ratingData) {
        setRatings(ratingData)
        if (ratingData.length > 0) {
          const avg = ratingData.reduce((s: number, r: Rating) => s + r.stars, 0) / ratingData.length
          setAvgRating(avg)
        }
      }
      setLoading(false)
    }
    fetchPlayer()
  }, [id])

  if (loading) {
    return (
      <div style={{ background: '#0e1015', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#3a4055', fontSize: '14px' }}>Loading player...</p>
      </div>
    )
  }

  if (!player) {
    return (
      <div style={{ background: '#0e1015', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#3a4055', fontSize: '14px' }}>Player not found.</p>
      </div>
    )
  }

  const ac = avatarColors[player.sport] || { bg: '#1a1d26', color: '#7a8099', border: '#2a2f3e', from: '#1a1d26', to: '#2a2f3e' }
  const initials = player.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
  const headshotUrl = getPlayerHeadshotUrl(player.name, player.sport)
  const bbrefUrl = getBBRefPlayerUrl(player.name, player.sport)

  const renderStars = (avg: number) => '★'.repeat(Math.round(avg)) + '☆'.repeat(5 - Math.round(avg))

  return (
    <div style={{ background: '#0e1015', minHeight: '100vh' }}>

      {/* ── Back button ─────────────────────────────────────── */}
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

      {/* ── Hero header ─────────────────────────────────────── */}
      <div style={{
        position: 'relative', overflow: 'hidden',
        marginTop: '20px', borderTop: '1px solid #1e2330',
        borderBottom: '1px solid #1e2330',
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          background: `linear-gradient(135deg, ${ac.from}44, ${ac.to}22)`,
        }} />
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to bottom, transparent 50%, #0e1015 100%)',
        }} />

        <div style={{
          position: 'relative', zIndex: 1,
          maxWidth: '1100px', margin: '0 auto',
          padding: '48px 2rem 48px',
          display: 'flex', alignItems: 'center', gap: '40px',
        }}>

          {/* Headshot or initials */}
          <div style={{ flexShrink: 0, position: 'relative' }}>
            {headshotUrl && !imgError ? (
              <div style={{
                width: '160px', height: '160px', borderRadius: '16px',
                overflow: 'hidden',
                border: `3px solid ${ac.border}`,
                boxShadow: `0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px ${ac.color}22`,
                background: ac.bg,
              }}>
                <img
                  src={headshotUrl}
                  alt={player.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' }}
                  onError={() => setImgError(true)}
                />
              </div>
            ) : (
              <div style={{
                width: '160px', height: '160px', borderRadius: '16px',
                background: `linear-gradient(135deg, ${ac.from}, ${ac.to}44)`,
                border: `3px solid ${ac.border}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: '52px', fontWeight: '900', color: ac.color,
                letterSpacing: '2px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
              }}>
                {initials}
              </div>
            )}

            {/* Sport badge */}
            <div style={{
              position: 'absolute', bottom: '-10px', right: '-10px',
              background: '#0e1015', border: `2px solid ${ac.border}`,
              borderRadius: '10px', padding: '4px 10px',
              fontSize: '18px',
            }}>
              {sportEmoji[player.sport]}
            </div>
          </div>

          {/* Player info */}
          <div>
            <div style={{
              display: 'inline-block',
              background: `${ac.color}18`,
              border: `1px solid ${ac.color}33`,
              color: ac.color,
              fontSize: '9px', fontWeight: '700', letterSpacing: '3px',
              textTransform: 'uppercase', padding: '4px 14px',
              borderRadius: '20px', marginBottom: '14px',
            }}>
              {player.sport} · {player.position}
            </div>

            <h1 style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: '52px', fontWeight: '900', letterSpacing: '3px',
              textTransform: 'uppercase', color: '#f0ece4',
              lineHeight: 1, marginBottom: '12px',
            }}>
              {player.name}
            </h1>

            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
              {player.team && (
                <div style={{ fontSize: '14px', color: '#5a6070' }}>
                  <span style={{ color: '#3a4055', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px' }}>Team · </span>
                  {player.team}
                </div>
              )}
              {player.era && (
                <div style={{ fontSize: '14px', color: '#5a6070', fontStyle: 'italic' }}>
                  <span style={{ color: '#3a4055', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', fontStyle: 'normal' }}>Era · </span>
                  {player.era}
                </div>
              )}
              {player.position && (
                <div style={{ fontSize: '14px', color: '#5a6070' }}>
                  <span style={{ color: '#3a4055', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px' }}>Position · </span>
                  {player.position}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Main content ─────────────────────────────────────── */}
      <div style={{
        maxWidth: '1100px', margin: '0 auto', padding: '2rem',
        display: 'grid', gridTemplateColumns: '1fr 340px', gap: '2rem',
      }}>

        {/* Left */}
        <div>

          {/* Player profile */}
          <div style={{
            background: '#151820', border: '1px solid #1e2330',
            borderRadius: '10px', padding: '24px', marginBottom: '20px',
          }}>
            <div style={{ fontSize: '11px', color: '#3a4055', fontWeight: '700', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '20px' }}>
              Player Profile
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              {[
                { label: 'Full Name', value: player.name },
                { label: 'Sport', value: `${sportEmoji[player.sport]} ${player.sport}` },
                { label: 'Position', value: player.position || '—' },
                { label: 'Team / Organization', value: player.team || '—' },
                { label: 'Era', value: player.era || '—' },
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

          {/* Career stats link */}
          <div style={{
            background: '#151820', border: '1px solid #1e2330',
            borderRadius: '10px', padding: '24px', marginBottom: '20px',
          }}>
            <div style={{ fontSize: '11px', color: '#3a4055', fontWeight: '700', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '16px' }}>
              Career Statistics
            </div>
            <p style={{ color: '#5a6070', fontSize: '13px', lineHeight: 1.7, marginBottom: '16px' }}>
              {sportBios[player.sport] || 'Career stats and historical data available on the relevant sports reference site.'}
            </p>
            {bbrefUrl && (
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
                View on {refSites[player.sport] || 'Reference'} →
              </a>
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
              width: '100%', background: ac.color, border: 'none',
              borderRadius: '8px', color: '#000',
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: '16px', fontWeight: '800', letterSpacing: '2px',
              textTransform: 'uppercase', padding: '14px',
              cursor: 'pointer', marginBottom: '16px',
            }}
          >
            ★ Rate This Player
          </button>

          {/* Quick facts */}
          <div style={{
            background: '#151820', border: `1px solid ${ac.border}`,
            borderRadius: '10px', padding: '20px',
          }}>
            <div style={{ fontSize: '10px', color: '#3a4055', fontWeight: '700', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '14px' }}>
              Quick Facts
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', color: '#3a4055', textTransform: 'uppercase', letterSpacing: '1px' }}>Sport</span>
                <span style={{ fontSize: '13px', color: '#c8c4bc', fontWeight: '600' }}>{sportEmoji[player.sport]} {player.sport}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', color: '#3a4055', textTransform: 'uppercase', letterSpacing: '1px' }}>Position</span>
                <span style={{ fontSize: '13px', color: '#c8c4bc', fontWeight: '600' }}>{player.position || '—'}</span>
              </div>
              {player.era && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '12px', color: '#3a4055', textTransform: 'uppercase', letterSpacing: '1px' }}>Era</span>
                  <span style={{ fontSize: '13px', color: '#c8c4bc', fontWeight: '600', fontStyle: 'italic' }}>{player.era}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {showModal && (
        <RatingModal
          targetId={player.id}
          targetName={player.name}
          targetType="player"
          onClose={() => setShowModal(false)}
          onSuccess={() => setShowModal(false)}
        />
      )}
    </div>
  )
}
