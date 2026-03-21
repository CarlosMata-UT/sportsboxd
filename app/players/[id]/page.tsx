'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import RatingModal from '../../components/RatingModal'

type Player = {
  id: string
  name: string
  sport: string
  position: string
  team: string
  era: string
}

type Rating = { stars: number; review: string }

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

// ── ESPN Stats fetcher ───────────────────────────────────────────────────────

function useESPNPlayer(name: string, sport: string) {
  const [data, setData] = useState<{ athlete: any; stats: any; athleteId: string | null; error?: string } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!name || sport === 'Soccer') { setLoading(false); return }
    const params = new URLSearchParams({ name, sport })
    fetch(`/api/player-stats?${params}`)
      .then(r => r.json())
      .then(json => { setData(json); setLoading(false) })
      .catch(() => setLoading(false))
  }, [name, sport])

  return { data, loading }
}

// ── Stat card ────────────────────────────────────────────────────────────────

function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div style={{ background: '#1a1d26', border: '1px solid #2a2f3e', borderRadius: '8px', padding: '14px 16px', textAlign: 'center' }}>
      <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '32px', fontWeight: '900', color: '#e8a432', lineHeight: 1, marginBottom: '4px' }}>{value}</div>
      <div style={{ fontSize: '10px', color: '#3a4055', fontWeight: '700', letterSpacing: '1.5px', textTransform: 'uppercase' }}>{label}</div>
      {sub && <div style={{ fontSize: '10px', color: '#2a2f3e', marginTop: '2px' }}>{sub}</div>}
    </div>
  )
}

// ── Parse ESPN stats by sport ────────────────────────────────────────────────

function parseStats(stats: any, sport: string): { label: string; value: string }[] {
  if (!stats) return []

  try {
    // ESPN stats structure: stats.splits.categories[].stats[]
    const splits = stats.splits || stats.statistics?.splits || {}
    const categories: any[] = splits.categories || []

    const findStat = (statName: string): string => {
      for (const cat of categories) {
        const found = (cat.stats || []).find((s: any) =>
          s.name === statName || s.abbreviation === statName || s.displayName === statName
        )
        if (found) return found.displayValue || String(found.value ?? '—')
      }
      return '—'
    }

    if (sport === 'NBA') {
      return [
        { label: 'PPG', value: findStat('avgPoints') || findStat('points') },
        { label: 'RPG', value: findStat('avgRebounds') || findStat('rebounds') },
        { label: 'APG', value: findStat('avgAssists') || findStat('assists') },
        { label: 'SPG', value: findStat('avgSteals') || findStat('steals') },
        { label: 'BPG', value: findStat('avgBlocks') || findStat('blocks') },
        { label: 'FG%', value: findStat('fieldGoalPct') || findStat('shootingPct') },
        { label: '3P%', value: findStat('threePointPct') || findStat('3pointPct') },
        { label: 'FT%', value: findStat('freeThrowPct') },
        { label: 'GP', value: findStat('gamesPlayed') },
      ].filter(s => s.value !== '—')
    }

    if (sport === 'NFL') {
      const passingStats = [
        { label: 'PASS YDS', value: findStat('passingYards') || findStat('avgPassingYards') },
        { label: 'PASS TD', value: findStat('passingTouchdowns') },
        { label: 'INT', value: findStat('interceptions') },
        { label: 'RATING', value: findStat('QBRating') || findStat('passerRating') },
      ]
      const rushingStats = [
        { label: 'RUSH YDS', value: findStat('rushingYards') },
        { label: 'RUSH TD', value: findStat('rushingTouchdowns') },
        { label: 'YPC', value: findStat('avgRushingYards') },
      ]
      const receivingStats = [
        { label: 'REC YDS', value: findStat('receivingYards') },
        { label: 'REC TD', value: findStat('receivingTouchdowns') },
        { label: 'RECEPTIONS', value: findStat('receptions') },
      ]
      return [...passingStats, ...rushingStats, ...receivingStats].filter(s => s.value !== '—')
    }

    if (sport === 'MLB') {
      return [
        { label: 'AVG', value: findStat('avg') || findStat('battingAvg') },
        { label: 'HR', value: findStat('homeRuns') },
        { label: 'RBI', value: findStat('RBIs') || findStat('runs') },
        { label: 'OBP', value: findStat('OBP') || findStat('onBasePct') },
        { label: 'SLG', value: findStat('SLG') || findStat('sluggingPct') },
        { label: 'ERA', value: findStat('ERA') },
        { label: 'W', value: findStat('wins') },
        { label: 'SO', value: findStat('strikeouts') },
      ].filter(s => s.value !== '—')
    }

    if (sport === 'NHL') {
      return [
        { label: 'G', value: findStat('goals') },
        { label: 'A', value: findStat('assists') },
        { label: 'PTS', value: findStat('points') },
        { label: '+/-', value: findStat('plusMinus') },
        { label: 'PIM', value: findStat('PIM') },
        { label: 'SV%', value: findStat('savePct') },
        { label: 'GAA', value: findStat('goalsAgainstAvg') },
        { label: 'GP', value: findStat('gamesPlayed') },
      ].filter(s => s.value !== '—')
    }
  } catch {
    // Parsing failed — return empty
  }

  return []
}

// ── Main page ────────────────────────────────────────────────────────────────

export default function PlayerDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [player, setPlayer] = useState<Player | null>(null)
  const [ratings, setRatings] = useState<Rating[]>([])
  const [avgRating, setAvgRating] = useState(0)
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [localImgErr, setLocalImgErr] = useState(false)
  const [espnImgErr, setEspnImgErr] = useState(false)

  useEffect(() => {
    const fetchPlayer = async () => {
      const [{ data: playerData }, { data: ratingData }] = await Promise.all([
        supabase.from('players').select('*').eq('id', id).single(),
        supabase.from('ratings').select('stars, review').eq('target_id', id).eq('target_type', 'player'),
      ])
      if (playerData) setPlayer(playerData)
      if (ratingData) {
        setRatings(ratingData)
        if (ratingData.length > 0) {
          setAvgRating(ratingData.reduce((s: number, r: Rating) => s + r.stars, 0) / ratingData.length)
        }
      }
      setLoading(false)
    }
    fetchPlayer()
  }, [id])

  const { data: espnData, loading: espnLoading } = useESPNPlayer(player?.name || '', player?.sport || '')

  if (loading) return (
    <div style={{ background: '#0e1015', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: '#3a4055', fontSize: '14px' }}>Loading player...</p>
    </div>
  )

  if (!player) return (
    <div style={{ background: '#0e1015', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: '#3a4055', fontSize: '14px' }}>Player not found.</p>
    </div>
  )

  const ac = avatarColors[player.sport] || { bg: '#1a1d26', color: '#7a8099', border: '#2a2f3e', from: '#1a1d26', to: '#2a2f3e' }
  const initials = player.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
  const renderStars = (avg: number) => '★'.repeat(Math.round(avg)) + '☆'.repeat(5 - Math.round(avg))

  // ESPN athlete data
  const espnAthlete = espnData?.athlete
  const espnStats = espnData?.stats
  const espnAthleteId = espnData?.athleteId

  // Prefer ESPN headshot, fall back to BBRef, fall back to initials
  const espnHeadshotUrl = espnAthleteId && player.sport === 'NBA'
    ? `https://a.espncdn.com/i/headshots/nba/players/full/${espnAthleteId}.png`
    : espnAthleteId && player.sport === 'NFL'
    ? `https://a.espncdn.com/i/headshots/nfl/players/full/${espnAthleteId}.png`
    : espnAthleteId && player.sport === 'MLB'
    ? `https://a.espncdn.com/i/headshots/mlb/players/full/${espnAthleteId}.png`
    : espnAthleteId && player.sport === 'NHL'
    ? `https://a.espncdn.com/i/headshots/nhl/players/full/${espnAthleteId}.png`
    : null

  // Use ESPN position if available (more accurate)
  const displayPosition = espnAthlete?.position?.displayName || espnAthlete?.position?.abbreviation || player.position
  const displayTeam = espnAthlete?.team?.displayName || player.team
  const displayWeight = espnAthlete?.displayWeight
  const displayHeight = espnAthlete?.displayHeight
  const displayAge = espnAthlete?.age
  const displayJersey = espnAthlete?.jersey

  const careerStats = parseStats(espnStats, player.sport)

  const showHeadshot = espnHeadshotUrl && !espnImgErr

  return (
    <div style={{ background: '#0e1015', minHeight: '100vh' }}>

      {/* Back */}
      <div style={{ padding: '16px 2rem 0', maxWidth: '1100px', margin: '0 auto' }}>
        <button onClick={() => router.back()} style={{ background: 'transparent', border: '1px solid #2a2f3e', borderRadius: '6px', color: '#5a6070', fontSize: '12px', fontWeight: '700', letterSpacing: '1px', textTransform: 'uppercase', padding: '7px 16px', cursor: 'pointer' }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = '#e8a432'; e.currentTarget.style.color = '#e8a432' }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = '#2a2f3e'; e.currentTarget.style.color = '#5a6070' }}>
          ← Back
        </button>
      </div>

      {/* ── Hero ─────────────────────────────────────────────── */}
      <div style={{ position: 'relative', overflow: 'hidden', marginTop: '20px', borderTop: '1px solid #1e2330', borderBottom: '1px solid #1e2330' }}>
        <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(135deg, ${ac.from}44, ${ac.to}22)` }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 50%, #0e1015 100%)' }} />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: '1100px', margin: '0 auto', padding: '48px 2rem 48px', display: 'flex', alignItems: 'center', gap: '40px' }}>

          {/* Headshot */}
          <div style={{ flexShrink: 0, position: 'relative' }}>
            {showHeadshot ? (
              <div style={{ width: '160px', height: '160px', borderRadius: '16px', overflow: 'hidden', border: `3px solid ${ac.border}`, boxShadow: `0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px ${ac.color}22`, background: ac.bg }}>
                <img
                  src={espnHeadshotUrl!}
                  alt={player.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' }}
                  onError={() => setEspnImgErr(true)}
                />
              </div>
            ) : (
              <div style={{ width: '160px', height: '160px', borderRadius: '16px', background: `linear-gradient(135deg, ${ac.from}, ${ac.to}44)`, border: `3px solid ${ac.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Barlow Condensed', sans-serif", fontSize: '52px', fontWeight: '900', color: ac.color, letterSpacing: '2px', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}>
                {initials}
              </div>
            )}
            <div style={{ position: 'absolute', bottom: '-10px', right: '-10px', background: '#0e1015', border: `2px solid ${ac.border}`, borderRadius: '10px', padding: '4px 10px', fontSize: '18px' }}>
              {sportEmoji[player.sport]}
            </div>
            {displayJersey && (
              <div style={{ position: 'absolute', top: '-10px', left: '-10px', background: ac.from, border: `2px solid ${ac.border}`, borderRadius: '8px', padding: '2px 8px', fontFamily: "'Barlow Condensed', sans-serif", fontSize: '16px', fontWeight: '900', color: '#fff', letterSpacing: '1px' }}>
                #{displayJersey}
              </div>
            )}
          </div>

          {/* Info */}
          <div>
            <div style={{ display: 'inline-block', background: `${ac.color}18`, border: `1px solid ${ac.color}33`, color: ac.color, fontSize: '9px', fontWeight: '700', letterSpacing: '3px', textTransform: 'uppercase', padding: '4px 14px', borderRadius: '20px', marginBottom: '14px' }}>
              {player.sport} · {displayPosition || player.position}
            </div>
            <h1 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '52px', fontWeight: '900', letterSpacing: '3px', textTransform: 'uppercase', color: '#f0ece4', lineHeight: 1, marginBottom: '12px' }}>
              {player.name}
            </h1>
            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
              {displayTeam && <div style={{ fontSize: '14px', color: '#5a6070' }}><span style={{ color: '#3a4055', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px' }}>Team · </span>{displayTeam}</div>}
              {player.era && <div style={{ fontSize: '14px', color: '#5a6070', fontStyle: 'italic' }}><span style={{ color: '#3a4055', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', fontStyle: 'normal' }}>Era · </span>{player.era}</div>}
              {displayHeight && <div style={{ fontSize: '14px', color: '#5a6070' }}><span style={{ color: '#3a4055', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px' }}>Height · </span>{displayHeight}</div>}
              {displayWeight && <div style={{ fontSize: '14px', color: '#5a6070' }}><span style={{ color: '#3a4055', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px' }}>Weight · </span>{displayWeight}</div>}
              {displayAge && <div style={{ fontSize: '14px', color: '#5a6070' }}><span style={{ color: '#3a4055', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px' }}>Age · </span>{displayAge}</div>}
            </div>
          </div>
        </div>
      </div>

      {/* ── Main content ─────────────────────────────────────── */}
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '2rem', display: 'grid', gridTemplateColumns: '1fr 320px', gap: '2rem' }}>

        {/* Left */}
        <div>

          {/* Career Stats */}
          <div style={{ background: '#151820', border: '1px solid #1e2330', borderRadius: '10px', padding: '24px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <div style={{ fontSize: '11px', color: '#3a4055', fontWeight: '700', letterSpacing: '2px', textTransform: 'uppercase' }}>
                Career Statistics
              </div>
              {espnLoading && <span style={{ fontSize: '11px', color: '#3a4055' }}>Loading from ESPN...</span>}
              {!espnLoading && espnAthleteId && <span style={{ fontSize: '10px', color: '#2a2f3e', textTransform: 'uppercase', letterSpacing: '1px' }}>Via ESPN</span>}
            </div>

            {espnLoading ? (
              <div style={{ color: '#3a4055', fontSize: '13px' }}>Fetching career stats...</div>
            ) : careerStats.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '10px' }}>
                {careerStats.map(stat => (
                  <StatCard key={stat.label} label={stat.label} value={stat.value} />
                ))}
              </div>
            ) : (
              <div>
                <p style={{ color: '#5a6070', fontSize: '13px', lineHeight: 1.7, marginBottom: '16px' }}>
                  {espnData?.error === 'Player not found on ESPN'
                    ? `${player.name} is not in ESPN's active database. This player may be retired or historical.`
                    : `Career statistics are not available for ${player.name} through our data provider.`}
                </p>
                <p style={{ color: '#3a4055', fontSize: '12px' }}>
                  For complete career stats and historical data, search for this player on Basketball Reference or the relevant sports stats site.
                </p>
              </div>
            )}
          </div>

          {/* Player Profile */}
          <div style={{ background: '#151820', border: '1px solid #1e2330', borderRadius: '10px', padding: '24px', marginBottom: '20px' }}>
            <div style={{ fontSize: '11px', color: '#3a4055', fontWeight: '700', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '20px' }}>Player Profile</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px' }}>
              {[
                { label: 'Full Name', value: espnAthlete?.fullName || player.name },
                { label: 'Sport', value: `${sportEmoji[player.sport]} ${player.sport}` },
                { label: 'Position', value: displayPosition || player.position || '—' },
                { label: 'Team / Organization', value: displayTeam || '—' },
                { label: 'Era / Active', value: player.era || (espnAthlete?.active ? 'Active' : '—') },
                { label: 'Jersey', value: displayJersey ? `#${displayJersey}` : '—' },
                { label: 'Height', value: displayHeight || '—' },
                { label: 'Weight', value: displayWeight || '—' },
                { label: 'Nationality', value: espnAthlete?.birthPlace?.country || '—' },
                { label: 'Birth City', value: espnAthlete?.birthPlace?.city && espnAthlete?.birthPlace?.state ? `${espnAthlete.birthPlace.city}, ${espnAthlete.birthPlace.state}` : '—' },
              ].filter(f => f.value !== '—').map(({ label, value }) => (
                <div key={label}>
                  <div style={{ fontSize: '10px', color: '#3a4055', fontWeight: '700', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '4px' }}>{label}</div>
                  <div style={{ fontSize: '14px', color: '#c8c4bc', fontWeight: '600' }}>{value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Community reviews */}
          {ratings.filter(r => r.review).length > 0 && (
            <div style={{ background: '#151820', border: '1px solid #1e2330', borderRadius: '10px', padding: '24px' }}>
              <div style={{ fontSize: '11px', color: '#3a4055', fontWeight: '700', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '16px' }}>Community Reviews</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {ratings.filter(r => r.review).slice(0, 5).map((r, i) => (
                  <div key={i} style={{ borderBottom: '1px solid #1e2330', paddingBottom: '14px' }}>
                    <div style={{ color: '#e8a432', fontSize: '13px', marginBottom: '6px' }}>{'★'.repeat(r.stars)}{'☆'.repeat(5 - r.stars)}</div>
                    <p style={{ color: '#7a8099', fontSize: '13px', lineHeight: 1.6, margin: 0, fontStyle: 'italic' }}>"{r.review}"</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right sidebar */}
        <div>
          {/* Community rating */}
          <div style={{ background: '#151820', border: '1px solid #1e2330', borderRadius: '10px', padding: '24px', marginBottom: '16px', textAlign: 'center' }}>
            <div style={{ fontSize: '10px', color: '#3a4055', fontWeight: '700', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '16px' }}>Community Rating</div>
            {ratings.length > 0 ? (
              <>
                <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '64px', fontWeight: '900', color: '#e8a432', lineHeight: 1, marginBottom: '8px' }}>{avgRating.toFixed(1)}</div>
                <div style={{ color: '#e8a432', fontSize: '18px', letterSpacing: '4px', marginBottom: '8px' }}>{renderStars(avgRating)}</div>
                <div style={{ color: '#3a4055', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>{ratings.length} {ratings.length === 1 ? 'rating' : 'ratings'}</div>
              </>
            ) : (
              <div style={{ color: '#3a4055', fontSize: '13px', padding: '10px 0' }}>No ratings yet — be the first!</div>
            )}
          </div>

          <button
            onClick={() => setShowModal(true)}
            style={{ width: '100%', background: ac.color, border: 'none', borderRadius: '8px', color: '#000', fontFamily: "'Barlow Condensed', sans-serif", fontSize: '16px', fontWeight: '800', letterSpacing: '2px', textTransform: 'uppercase', padding: '14px', cursor: 'pointer', marginBottom: '16px' }}
          >
            ★ Rate This Player
          </button>

          {/* Quick facts */}
          <div style={{ background: '#151820', border: `1px solid ${ac.border}`, borderRadius: '10px', padding: '20px' }}>
            <div style={{ fontSize: '10px', color: '#3a4055', fontWeight: '700', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '14px' }}>Quick Facts</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                { label: 'Sport', value: `${sportEmoji[player.sport]} ${player.sport}` },
                { label: 'Position', value: displayPosition || player.position || '—' },
                { label: 'Team', value: displayTeam || '—' },
                { label: 'Era', value: player.era || '—' },
                { label: 'Height', value: displayHeight || '—' },
                { label: 'Status', value: espnAthlete ? (espnAthlete.active ? '🟢 Active' : '⚫ Retired') : '—' },
              ].filter(f => f.value !== '—').map(({ label, value }) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '8px', borderBottom: '1px solid #1e2330' }}>
                  <span style={{ fontSize: '11px', color: '#3a4055', textTransform: 'uppercase', letterSpacing: '1px' }}>{label}</span>
                  <span style={{ fontSize: '13px', color: '#c8c4bc', fontWeight: '600' }}>{value}</span>
                </div>
              ))}
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
