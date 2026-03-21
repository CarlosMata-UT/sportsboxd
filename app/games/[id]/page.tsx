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

// ── Game Highlights ──────────────────────────────────────────────────────────

function GameHighlightsSection({ game }: { game: Game }) {
  const dateStr = new Date(game.game_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
  const query = encodeURIComponent(`${game.home_team} vs ${game.away_team} highlights ${dateStr} NBA`)
  const ytUrl = `https://www.youtube.com/results?search_query=${query}`
  const homeColors = getTeamColors(game.home_team, game.sport)
  const awayColors = getTeamColors(game.away_team, game.sport)

  return (
    <div style={{ background: '#151820', border: '1px solid #1e2330', borderRadius: '10px', marginBottom: '20px', overflow: 'hidden' }}>
      <div style={{ padding: '14px 20px', borderBottom: '1px solid #1e2330', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{ width: '8px', height: '8px', background: '#ff0000', borderRadius: '2px', flexShrink: 0 }} />
        <span style={{ fontSize: '11px', color: '#3a4055', fontWeight: '700', letterSpacing: '2px', textTransform: 'uppercase' }}>Game Highlights</span>
        <span style={{ fontSize: '10px', color: '#2a2f3e', marginLeft: 'auto' }}>YouTube</span>
      </div>

      <a
        href={ytUrl}
        target="_blank"
        rel="noopener noreferrer"
        style={{ display: 'block', textDecoration: 'none', position: 'relative' }}
      >
        {/* Faux thumbnail with team color split */}
        <div style={{
          aspectRatio: '16/9',
          background: `linear-gradient(135deg, ${homeColors.primary}cc 0%, #0e1015 50%, ${awayColors.primary}cc 100%)`,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          gap: '16px', position: 'relative',
        }}>
          {/* Team name watermark */}
          <div style={{
            position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '0 32px', pointerEvents: 'none',
          }}>
            <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '20px', fontWeight: '900', color: 'rgba(255,255,255,0.12)', textTransform: 'uppercase', letterSpacing: '3px' }}>
              {game.home_team.split(' ').slice(-1)[0]}
            </span>
            <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '20px', fontWeight: '900', color: 'rgba(255,255,255,0.12)', textTransform: 'uppercase', letterSpacing: '3px' }}>
              {game.away_team.split(' ').slice(-1)[0]}
            </span>
          </div>

          {/* Play button */}
          <div style={{
            width: '64px', height: '64px', background: '#ff0000', borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 24px rgba(255,0,0,0.5)', flexShrink: 0,
            transition: 'transform 0.15s',
          }}>
            <div style={{ width: 0, height: 0, borderStyle: 'solid', borderWidth: '12px 0 12px 22px', borderColor: 'transparent transparent transparent #fff', marginLeft: '5px' }} />
          </div>

          <div style={{ textAlign: 'center', zIndex: 1 }}>
            <div style={{ fontSize: '14px', fontWeight: '700', color: '#fff', marginBottom: '4px' }}>
              Watch Highlights
            </div>
            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.45)', letterSpacing: '0.5px' }}>
              {game.home_team} vs {game.away_team} · Opens YouTube
            </div>
          </div>
        </div>
      </a>
    </div>
  )
}

// ── Box score component ──────────────────────────────────────────────────────

function BoxScoreSection({ data, loading, error, game }: {
  data: any; loading: boolean; error: string; game: Game
}) {
  const [activeTab, setActiveTab] = useState<'team' | 'players'>('team')

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
  const teams: any[] = boxscore?.teams || []
  const playerGroups: any[] = boxscore?.players || []
  const hasTeamStats = teams.length > 0 && teams[0]?.statistics?.length > 0
  const hasPlayerStats = playerGroups.length > 0 && playerGroups[0]?.statistics?.length > 0

  const tabStyle = (active: boolean) => ({
    padding: '8px 18px', fontSize: '11px', fontWeight: '700', letterSpacing: '1px',
    textTransform: 'uppercase' as const, cursor: 'pointer', border: 'none',
    background: active ? '#e8a432' : 'transparent',
    color: active ? '#000' : '#5a6070',
    borderRadius: '4px', transition: 'all 0.15s',
  })

  return (
    <div>
      {/* Line score — always visible */}
      {teams.length > 0 && teams[0]?.linescores?.length > 0 && (
        <div style={{ marginBottom: '20px', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', padding: '8px 12px', color: '#3a4055', fontWeight: '700', fontSize: '10px', letterSpacing: '1px', textTransform: 'uppercase' }}>Team</th>
                {(teams[0]?.linescores || []).map((_: any, i: number) => (
                  <th key={i} style={{ textAlign: 'center', padding: '8px 10px', color: '#3a4055', fontWeight: '700', fontSize: '10px', letterSpacing: '1px', textTransform: 'uppercase' }}>
                    {game.sport === 'NBA' || game.sport === 'NHL' ? `Q${i + 1}` : `${i + 1}`}
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

      {/* Tabs */}
      {(hasTeamStats || hasPlayerStats) && (
        <div style={{ borderTop: '1px solid #1e2330', paddingTop: '16px' }}>
          <div style={{ display: 'flex', gap: '6px', marginBottom: '16px', background: '#1a1d26', padding: '4px', borderRadius: '6px', width: 'fit-content' }}>
            {hasTeamStats && (
              <button style={tabStyle(activeTab === 'team')} onClick={() => setActiveTab('team')}>
                Team Stats
              </button>
            )}
            {hasPlayerStats && (
              <button style={tabStyle(activeTab === 'players')} onClick={() => setActiveTab('players')}>
                Player Stats
              </button>
            )}
          </div>

          {activeTab === 'team' && hasTeamStats && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              {teams.map((team: any, ti: number) => (
                <div key={ti} style={{ background: '#1a1d26', borderRadius: '8px', padding: '14px' }}>
                  <div style={{ fontSize: '12px', fontWeight: '700', color: '#c8c4bc', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    {team.team?.abbreviation || team.team?.displayName}
                  </div>
                  {(team.statistics || []).slice(0, 12).map((stat: any, si: number) => (
                    <div key={si} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid #1e2330' }}>
                      <span style={{ fontSize: '12px', color: '#5a6070' }}>{stat.label || stat.name}</span>
                      <span style={{ fontSize: '12px', color: '#c8c4bc', fontWeight: '600' }}>{stat.displayValue || stat.value}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}

          {activeTab === 'players' && hasPlayerStats && (
            <div>
              {playerGroups.map((group: any, gi: number) => {
                const statGroup = group.statistics?.[0]
                if (!statGroup) return null
                const colNames: string[] = statGroup.names || []
                const athletes: any[] = statGroup.athletes || []
                return (
                  <div key={gi} style={{ marginBottom: '28px' }}>
                    <div style={{ fontSize: '11px', fontWeight: '700', color: '#e8a432', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '10px', paddingBottom: '6px', borderBottom: '1px solid #1e2330' }}>
                      {group.team?.displayName}
                    </div>
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                        <thead>
                          <tr style={{ background: '#1a1d26' }}>
                            <th style={{ textAlign: 'left', padding: '8px 10px', color: '#3a4055', fontSize: '10px', fontWeight: '700', letterSpacing: '1px', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>Player</th>
                            {colNames.map((name: string, ni: number) => (
                              <th key={ni} style={{ textAlign: 'center', padding: '8px 8px', color: '#3a4055', fontSize: '10px', fontWeight: '700', letterSpacing: '0.5px', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{name}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {athletes.filter((a: any) => a.stats?.length || a.statistics?.length).map((athlete: any, ai: number) => {
                            const vals: string[] = athlete.stats || athlete.statistics || []
                            return (
                              <tr key={ai} style={{ borderBottom: '1px solid #1e2330', background: ai % 2 === 0 ? 'transparent' : 'rgba(26,29,38,0.3)' }}>
                                <td style={{ padding: '9px 10px', color: '#c8c4bc', fontWeight: '600', whiteSpace: 'nowrap' }}>
                                  {athlete.athlete?.displayName || athlete.athlete?.shortName || 'Unknown'}
                                  {athlete.starter && <span style={{ marginLeft: '5px', fontSize: '9px', color: '#e8a432', fontWeight: '700' }}>•</span>}
                                </td>
                                {vals.map((val: string, vi: number) => (
                                  <td key={vi} style={{ textAlign: 'center', padding: '9px 8px', color: '#7a8099', whiteSpace: 'nowrap' }}>{val || '—'}</td>
                                ))}
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                    <div style={{ marginTop: '6px', fontSize: '10px', color: '#2a2f3e' }}>• Starter</div>
                  </div>
                )
              })}
            </div>
          )}
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

  const [bsData, setBsData] = useState<any>(null)
  const [bsLoading, setBsLoading] = useState(false)
  const [bsError, setBsError] = useState('')

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

  // Fetch boxscore once we have game data
  useEffect(() => {
    if (!game) return
    setBsLoading(true)
    const params = new URLSearchParams({
      date: game.game_date,
      home: game.home_team,
      away: game.away_team,
      sport: game.sport,
    })
    fetch(`/api/boxscore?${params}`)
      .then(r => r.json())
      .then(json => {
        if (json.error) { setBsError(json.error); setBsLoading(false); return }
        setBsData(json)
        setBsLoading(false)
      })
      .catch(() => { setBsError('Could not load box score.'); setBsLoading(false) })
  }, [game])

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

  // Extract attendance from ESPN data
  const attendance: number | null =
    bsData?.summary?.gameInfo?.attendance ||
    bsData?.summary?.header?.competitions?.[0]?.attendance ||
    null

  const gameInfoRows = [
    { label: 'Date', value: formattedDate },
    { label: 'Sport', value: `${sportEmoji[game.sport]} ${game.sport}` },
    { label: 'Season', value: game.season || '—' },
    { label: 'Result', value: winner === 'tie' ? 'Tie' : `${winner === 'home' ? game.home_team : game.away_team} Win` },
    { label: 'Margin', value: `${Math.abs(game.home_score - game.away_score)} pts` },
    ...(attendance ? [{ label: 'Attendance', value: attendance.toLocaleString() }] : []),
  ]

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
        <div style={{ position: 'absolute', inset: 0, background: homeColors.primary, clipPath: 'polygon(0 0, 52% 0, 48% 100%, 0 100%)', opacity: 0.85 }} />
        <div style={{ position: 'absolute', inset: 0, background: awayColors.primary, clipPath: 'polygon(52% 0, 100% 0, 100% 100%, 48% 100%)', opacity: 0.85 }} />
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(14,16,21,0.45)' }} />
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '80px', background: 'linear-gradient(to bottom, transparent, #0e1015)' }} />

        <div style={{ position: 'absolute', top: '16px', left: '50%', transform: 'translateX(-50%)', zIndex: 2 }}>
          <div style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px', padding: '4px 16px', fontSize: '11px', color: 'rgba(255,255,255,0.6)', fontWeight: '700', letterSpacing: '2px', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
            {sportEmoji[game.sport]} {game.sport} · {game.season || formattedDate.split(', ').slice(-1)[0]}
          </div>
        </div>

        <div style={{ position: 'relative', zIndex: 1, maxWidth: '1100px', margin: '0 auto', padding: '56px 2rem 40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}>
            <TeamLogo team={game.home_team} sport={game.sport} size={96} />
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '20px', fontWeight: '900', letterSpacing: '3px', color: winner === 'home' ? '#fff' : 'rgba(255,255,255,0.5)', textTransform: 'uppercase', textAlign: 'center' }}>
              {game.home_team}
            </div>
            <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: '700' }}>Home</div>
          </div>

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

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}>
            <TeamLogo team={game.away_team} sport={game.sport} size={96} />
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '20px', fontWeight: '900', letterSpacing: '3px', color: winner === 'away' ? '#fff' : 'rgba(255,255,255,0.5)', textTransform: 'uppercase', textAlign: 'center' }}>
              {game.away_team}
            </div>
            <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: '700' }}>Away</div>
          </div>
        </div>
      </div>

      {/* ── Main content ─────────────────────────────────────── */}
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '2rem', display: 'grid', gridTemplateColumns: '1fr 320px', gap: '2rem' }}>

        {/* ── Left column ── */}
        <div>

          {/* Notable */}
          {game.notable && (
            <div style={{ background: 'rgba(232,164,50,0.06)', border: '1px solid rgba(232,164,50,0.15)', borderRadius: '10px', padding: '20px 22px', marginBottom: '20px' }}>
              <div style={{ fontSize: '9px', color: '#e8a432', fontWeight: '700', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '8px' }}>Notable</div>
              <p style={{ color: '#c8c4bc', fontSize: '15px', lineHeight: 1.6, margin: 0, fontStyle: 'italic' }}>"{game.notable}"</p>
            </div>
          )}

          {/* Highlights */}
          <GameHighlightsSection game={game} />

          {/* Box Score */}
          <div style={{ background: '#151820', border: '1px solid #1e2330', borderRadius: '10px', marginBottom: '20px', overflow: 'hidden' }}>
            <div style={{ padding: '16px 24px', borderBottom: '1px solid #1e2330' }}>
              <div style={{ fontSize: '11px', color: '#3a4055', fontWeight: '700', letterSpacing: '2px', textTransform: 'uppercase' }}>Box Score</div>
            </div>
            <div style={{ padding: '16px 20px' }}>
              <BoxScoreSection data={bsData} loading={bsLoading} error={bsError} game={game} />
            </div>
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

        {/* ── Right sidebar ── */}
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
          <div style={{ background: '#151820', border: '1px solid #1e2330', borderRadius: '10px', padding: '20px', marginBottom: '16px' }}>
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

          {/* Game Information — moved here from left column */}
          <div style={{ background: '#151820', border: '1px solid #1e2330', borderRadius: '10px', padding: '20px' }}>
            <div style={{ fontSize: '10px', color: '#3a4055', fontWeight: '700', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '16px' }}>Game Information</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {gameInfoRows.map(({ label, value }) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', borderBottom: '1px solid #1e2330', paddingBottom: '10px' }}>
                  <span style={{ fontSize: '10px', color: '#3a4055', fontWeight: '700', letterSpacing: '1.5px', textTransform: 'uppercase', flexShrink: 0 }}>{label}</span>
                  <span style={{ fontSize: '12px', color: '#c8c4bc', fontWeight: '600', textAlign: 'right' }}>{value}</span>
                </div>
              ))}
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
