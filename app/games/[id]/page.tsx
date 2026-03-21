'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { getTeamLogoUrl } from '@/lib/sportUtils'
import { getTeamColors } from '@/lib/teamColors'
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

type Rating = { stars: number; review: string }

const sportEmoji: Record<string, string> = {
  NBA: '🏀', NFL: '🏈', MLB: '⚾', NHL: '🏒', Soccer: '⚽',
}

// ── Team logo with fallback ──────────────────────────────────────────────────

function TeamLogo({ team, sport, size = 100 }: { team: string; sport: string; size?: number }) {
  const [err, setErr] = useState(false)
  const url = getTeamLogoUrl(team, sport)
  const abbr = team.split(' ').map(w => w[0]).join('').slice(0, 3).toUpperCase()

  if (!url || err) {
    return (
      <div style={{
        width: size, height: size, borderRadius: '14px',
        background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: "'Barlow Condensed', sans-serif",
        fontWeight: '900', fontSize: size * 0.28, color: 'rgba(255,255,255,0.85)',
        letterSpacing: '2px', flexShrink: 0,
      }}>
        {abbr}
      </div>
    )
  }

  return (
    <img
      src={url} alt={team} width={size} height={size}
      style={{ objectFit: 'contain', flexShrink: 0, filter: 'drop-shadow(0 4px 16px rgba(0,0,0,0.6))' }}
      onError={() => setErr(true)}
    />
  )
}

// ── Box score components ─────────────────────────────────────────────────────

function BoxScoreSection({ game }: { game: Game }) {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchBoxScore = async () => {
      try {
        const params = new URLSearchParams({
          date: game.game_date,
          home: game.home_team,
          away: game.away_team,
          sport: game.sport,
        })
        const res = await fetch(`/api/boxscore?${params}`)
        const json = await res.json()
        if (json.error) { setError(json.error); setLoading(false); return }
        setData(json)
      } catch {
        setError('Could not load box score.')
      }
      setLoading(false)
    }
    fetchBoxScore()
  }, [game])

  if (loading) return (
    <div style={{ padding: '24px', color: '#3a4055', fontSize: '13px' }}>Loading box score...</div>
  )

  if (error || !data?.summary) return (
    <div style={{ padding: '24px' }}>
      <p style={{ color: '#3a4055', fontSize: '13px', marginBottom: '8px' }}>
        Live box score data is available for recent games. For historical matchups, scores are shown above.
      </p>
      {error && <p style={{ color: '#2a2f3e', fontSize: '12px', fontStyle: 'italic' }}>{error}</p>}
    </div>
  )

  const summary = data.summary
  const boxscore = summary.boxscore
  const linescore = summary.header?.competitions?.[0]?.linescores || []

  const teams: any[] = boxscore?.teams || []
  const plays: any[] = summary.plays || []

  return (
    <div>
      {/* Line score (quarter by quarter) */}
      {linescore.length > 0 && (
        <div style={{ marginBottom: '20px', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', padding: '8px 12px', color: '#3a4055', fontWeight: '700', fontSize: '10px', letterSpacing: '1px', textTransform: 'uppercase' }}>Team</th>
                {linescore[0]?.value !== undefined && linescore.map((_: any, i: number) => (
                  <th key={i} style={{ textAlign: 'center', padding: '8px 10px', color: '#3a4055', fontWeight: '700', fontSize: '10px', letterSpacing: '1px', textTransform: 'uppercase' }}>
                    {game.sport === 'NBA' || game.sport === 'NHL' ? `Q${i + 1}` : game.sport === 'NFL' ? `Q${i + 1}` : `${i + 1}`}
                  </th>
                ))}
                <th style={{ textAlign: 'center', padding: '8px 10px', color: '#e8a432', fontWeight: '900', fontSize: '12px' }}>Final</th>
              </tr>
            </thead>
            <tbody>
              {teams.map((team: any, ti: number) => (
                <tr key={ti} style={{ borderTop: '1px solid #1e2330' }}>
                  <td style={{ padding: '10px 12px', color: '#c8c4bc', fontWeight: '600', fontSize: '13px' }}>
                    {team.team?.abbreviation || team.team?.displayName || `Team ${ti + 1}`}
                  </td>
                  {(team.linescores || []).map((ls: any, qi: number) => (
                    <td key={qi} style={{ textAlign: 'center', padding: '10px', color: '#7a8099', fontSize: '13px' }}>{ls.value ?? '—'}</td>
                  ))}
                  <td style={{ textAlign: 'center', padding: '10px', fontFamily: "'Barlow Condensed', sans-serif", fontSize: '22px', fontWeight: '900', color: '#e8a432' }}>
                    {team.score ?? (ti === 0 ? game.home_score : game.away_score)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Team stats */}
      {teams.length > 0 && teams[0]?.statistics?.length > 0 && (
        <div>
          <div style={{ fontSize: '10px', color: '#3a4055', fontWeight: '700', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '12px' }}>
            Team Stats
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            {teams.map((team: any, ti: number) => (
              <div key={ti} style={{ background: '#1a1d26', borderRadius: '8px', padding: '14px' }}>
                <div style={{ fontSize: '12px', fontWeight: '700', color: '#c8c4bc', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  {team.team?.abbreviation || team.team?.displayName}
                </div>
                {(team.statistics || []).slice(0, 10).map((stat: any, si: number) => (
                  <div key={si} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid #1e2330' }}>
                    <span style={{ fontSize: '12px', color: '#5a6070' }}>{stat.label || stat.name}</span>
                    <span style={{ fontSize: '12px', color: '#c8c4bc', fontWeight: '600' }}>{stat.displayValue || stat.value}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Player box score */}
      {teams.length > 0 && teams[0]?.athletes?.length > 0 && (
        <div style={{ marginTop: '20px' }}>
          <div style={{ fontSize: '10px', color: '#3a4055', fontWeight: '700', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '12px' }}>
            Player Stats
          </div>
          {teams.map((team: any, ti: number) => (
            <div key={ti} style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '11px', fontWeight: '700', color: '#7a8099', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>
                {team.team?.displayName}
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                  <thead>
                    <tr style={{ background: '#1a1d26' }}>
                      <th style={{ textAlign: 'left', padding: '8px 10px', color: '#3a4055', fontSize: '10px', fontWeight: '700', letterSpacing: '1px', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>Player</th>
                      {(team.athletes?.[0]?.statistics?.names || []).slice(0, 8).map((name: string, ni: number) => (
                        <th key={ni} style={{ textAlign: 'center', padding: '8px 6px', color: '#3a4055', fontSize: '10px', fontWeight: '700', letterSpacing: '0.5px', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{name}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {(team.athletes || []).filter((a: any) => a.statistics?.values).map((athlete: any, ai: number) => (
                      <tr key={ai} style={{ borderBottom: '1px solid #1e2330' }}>
                        <td style={{ padding: '8px 10px', color: '#c8c4bc', fontWeight: '600', whiteSpace: 'nowrap' }}>
                          {athlete.athlete?.displayName || athlete.athlete?.shortName || 'Unknown'}
                          {athlete.starter && <span style={{ marginLeft: '4px', fontSize: '9px', color: '#e8a432' }}>START</span>}
                        </td>
                        {(athlete.statistics?.values || []).slice(0, 8).map((val: string, vi: number) => (
                          <td key={vi} style={{ textAlign: 'center', padding: '8px 6px', color: '#7a8099', whiteSpace: 'nowrap' }}>{val || '—'}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Main page ────────────────────────────────────────────────────────────────

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
      const [{ data: gameData }, { data: ratingData }] = await Promise.all([
        supabase.from('games').select('*').eq('id', id).single(),
        supabase.from('ratings').select('stars, review').eq('target_id', id).eq('target_type', 'game'),
      ])
      if (gameData) setGame(gameData)
      if (ratingData) {
        setRatings(ratingData)
        if (ratingData.length > 0) {
          setAvgRating(ratingData.reduce((s: number, r: Rating) => s + r.stars, 0) / ratingData.length)
        }
      }
      setLoading(false)
    }
    fetchGame()
  }, [id])

  if (loading) return (
    <div style={{ background: '#0e1015', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: '#3a4055', fontSize: '14px' }}>Loading game...</p>
    </div>
  )

  if (!game) return (
    <div style={{ background: '#0e1015', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: '#3a4055', fontSize: '14px' }}>Game not found.</p>
    </div>
  )

  const homeColors = getTeamColors(game.home_team, game.sport)
  const awayColors = getTeamColors(game.away_team, game.sport)
  const winner = game.home_score > game.away_score ? 'home' : game.away_score > game.home_score ? 'away' : 'tie'
  const formattedDate = new Date(game.game_date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
  const renderStars = (avg: number) => '★'.repeat(Math.round(avg)) + '☆'.repeat(5 - Math.round(avg))

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

      {/* ── Hero scoreboard with team colors ────────────────── */}
      <div style={{ position: 'relative', overflow: 'hidden', marginTop: '20px', borderTop: '1px solid #1e2330', borderBottom: '1px solid #1e2330', minHeight: '280px' }}>

        {/* Home team color — left half */}
        <div style={{
          position: 'absolute', inset: 0,
          background: homeColors.primary,
          clipPath: 'polygon(0 0, 52% 0, 48% 100%, 0 100%)',
          opacity: 0.85,
        }} />
        {/* Away team color — right half */}
        <div style={{
          position: 'absolute', inset: 0,
          background: awayColors.primary,
          clipPath: 'polygon(52% 0, 100% 0, 100% 100%, 48% 100%)',
          opacity: 0.85,
        }} />
        {/* Dark overlay for readability */}
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(14,16,21,0.45)' }} />
        {/* Bottom fade */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '80px', background: 'linear-gradient(to bottom, transparent, #0e1015)' }} />

        {/* Sport badge */}
        <div style={{ position: 'absolute', top: '16px', left: '50%', transform: 'translateX(-50%)', zIndex: 2 }}>
          <div style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px', padding: '4px 16px', fontSize: '11px', color: 'rgba(255,255,255,0.6)', fontWeight: '700', letterSpacing: '2px', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
            {sportEmoji[game.sport]} {game.sport} · {game.season || formattedDate.split(', ').slice(-1)[0]}
          </div>
        </div>

        <div style={{
          position: 'relative', zIndex: 1,
          maxWidth: '1100px', margin: '0 auto',
          padding: '56px 2rem 40px',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0',
        }}>

          {/* Home team */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}>
            <TeamLogo team={game.home_team} sport={game.sport} size={96} />
            <div style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: '20px', fontWeight: '900', letterSpacing: '3px',
              color: winner === 'home' ? '#fff' : 'rgba(255,255,255,0.5)',
              textTransform: 'uppercase', textAlign: 'center',
            }}>
              {game.home_team}
            </div>
            <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: '700' }}>
              Home
            </div>
          </div>

          {/* Score */}
          <div style={{ textAlign: 'center', padding: '0 36px', flexShrink: 0 }}>
            <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '3px', fontWeight: '700', marginBottom: '10px' }}>Final</div>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '84px', fontWeight: '900', lineHeight: 1, color: '#fff', letterSpacing: '-2px', textShadow: '0 4px 24px rgba(0,0,0,0.6)' }}>
              {game.home_score}
              <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: '48px', margin: '0 6px' }}>·</span>
              {game.away_score}
            </div>
            {winner !== 'tie' && (
              <div style={{ marginTop: '10px', fontSize: '11px', color: '#e8a432', fontWeight: '700', letterSpacing: '1px', textTransform: 'uppercase' }}>
                {winner === 'home' ? game.home_team : game.away_team} Win · by {Math.abs(game.home_score - game.away_score)}
              </div>
            )}
          </div>

          {/* Away team */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}>
            <TeamLogo team={game.away_team} sport={game.sport} size={96} />
            <div style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: '20px', fontWeight: '900', letterSpacing: '3px',
              color: winner === 'away' ? '#fff' : 'rgba(255,255,255,0.5)',
              textTransform: 'uppercase', textAlign: 'center',
            }}>
              {game.away_team}
            </div>
            <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: '700' }}>
              Away
            </div>
          </div>
        </div>
      </div>

      {/* ── Main content ─────────────────────────────────────── */}
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '2rem', display: 'grid', gridTemplateColumns: '1fr 320px', gap: '2rem' }}>

        {/* Left */}
        <div>

          {/* Notable */}
          {game.notable && (
            <div style={{ background: 'rgba(232,164,50,0.06)', border: '1px solid rgba(232,164,50,0.15)', borderRadius: '10px', padding: '20px 22px', marginBottom: '20px' }}>
              <div style={{ fontSize: '9px', color: '#e8a432', fontWeight: '700', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '8px' }}>Notable</div>
              <p style={{ color: '#c8c4bc', fontSize: '15px', lineHeight: 1.6, margin: 0, fontStyle: 'italic' }}>"{game.notable}"</p>
            </div>
          )}

          {/* Game info */}
          <div style={{ background: '#151820', border: '1px solid #1e2330', borderRadius: '10px', padding: '24px', marginBottom: '20px' }}>
            <div style={{ fontSize: '11px', color: '#3a4055', fontWeight: '700', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '20px' }}>Game Information</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px' }}>
              {[
                { label: 'Date', value: formattedDate },
                { label: 'Sport', value: `${sportEmoji[game.sport]} ${game.sport}` },
                { label: 'Season', value: game.season || '—' },
                { label: 'Matchup', value: `${game.home_team} vs ${game.away_team}` },
                { label: 'Home Score', value: String(game.home_score) },
                { label: 'Away Score', value: String(game.away_score) },
                { label: 'Result', value: winner === 'tie' ? 'Tie' : `${winner === 'home' ? game.home_team : game.away_team} Win` },
                { label: 'Margin', value: `${Math.abs(game.home_score - game.away_score)} pts` },
              ].map(({ label, value }) => (
                <div key={label}>
                  <div style={{ fontSize: '10px', color: '#3a4055', fontWeight: '700', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '4px' }}>{label}</div>
                  <div style={{ fontSize: '14px', color: '#c8c4bc', fontWeight: '600' }}>{value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Box Score */}
          <div style={{ background: '#151820', border: '1px solid #1e2330', borderRadius: '10px', marginBottom: '20px', overflow: 'hidden' }}>
            <div style={{ padding: '16px 24px', borderBottom: '1px solid #1e2330' }}>
              <div style={{ fontSize: '11px', color: '#3a4055', fontWeight: '700', letterSpacing: '2px', textTransform: 'uppercase' }}>Box Score</div>
            </div>
            <BoxScoreSection game={game} />
          </div>

          {/* Team color badges */}
          <div style={{ background: '#151820', border: '1px solid #1e2330', borderRadius: '10px', padding: '20px 24px', marginBottom: '20px' }}>
            <div style={{ fontSize: '11px', color: '#3a4055', fontWeight: '700', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '14px' }}>Teams</div>
            <div style={{ display: 'flex', gap: '12px' }}>
              {[
                { team: game.home_team, colors: homeColors, label: 'Home' },
                { team: game.away_team, colors: awayColors, label: 'Away' },
              ].map(({ team, colors, label }) => (
                <div key={team} style={{ flex: 1, background: `${colors.primary}22`, border: `1px solid ${colors.primary}44`, borderRadius: '8px', padding: '14px 16px' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: colors.primary, marginBottom: '8px' }} />
                  <div style={{ fontSize: '12px', fontWeight: '700', color: '#c8c4bc' }}>{team}</div>
                  <div style={{ fontSize: '10px', color: '#3a4055', textTransform: 'uppercase', letterSpacing: '1px', marginTop: '2px' }}>{label}</div>
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
                <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '64px', fontWeight: '900', color: '#e8a432', lineHeight: 1, marginBottom: '8px' }}>
                  {avgRating.toFixed(1)}
                </div>
                <div style={{ color: '#e8a432', fontSize: '18px', letterSpacing: '4px', marginBottom: '8px' }}>{renderStars(avgRating)}</div>
                <div style={{ color: '#3a4055', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  {ratings.length} {ratings.length === 1 ? 'rating' : 'ratings'}
                </div>
              </>
            ) : (
              <div style={{ color: '#3a4055', fontSize: '13px', padding: '10px 0' }}>No ratings yet — be the first!</div>
            )}
          </div>

          <button
            onClick={() => setShowModal(true)}
            style={{ width: '100%', background: '#e8a432', border: 'none', borderRadius: '8px', color: '#000', fontFamily: "'Barlow Condensed', sans-serif", fontSize: '16px', fontWeight: '800', letterSpacing: '2px', textTransform: 'uppercase', padding: '14px', cursor: 'pointer', marginBottom: '16px' }}
            onMouseEnter={e => (e.currentTarget.style.background = '#f0b340')}
            onMouseLeave={e => (e.currentTarget.style.background = '#e8a432')}
          >
            ★ Rate This Game
          </button>

          {/* Scoreline */}
          <div style={{ background: '#151820', border: '1px solid #1e2330', borderRadius: '10px', padding: '20px' }}>
            <div style={{ fontSize: '10px', color: '#3a4055', fontWeight: '700', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '14px' }}>Scoreline</div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
              <div style={{ textAlign: 'center', flex: 1 }}>
                <div style={{ fontSize: '11px', color: '#5a6070', marginBottom: '4px', fontWeight: '600' }}>
                  {game.home_team.split(' ').slice(-1)[0]}
                </div>
                <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '40px', fontWeight: '900', color: winner === 'home' ? homeColors.secondary || '#e8a432' : '#3a4055' }}>
                  {game.home_score}
                </div>
              </div>
              <div style={{ color: '#2a2f3e', fontWeight: '700', fontSize: '14px' }}>—</div>
              <div style={{ textAlign: 'center', flex: 1 }}>
                <div style={{ fontSize: '11px', color: '#5a6070', marginBottom: '4px', fontWeight: '600' }}>
                  {game.away_team.split(' ').slice(-1)[0]}
                </div>
                <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '40px', fontWeight: '900', color: winner === 'away' ? awayColors.secondary || '#e8a432' : '#3a4055' }}>
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
          onSuccess={() => setShowModal(false)}
        />
      )}
    </div>
  )
}
