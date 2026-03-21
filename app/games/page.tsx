'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { getTeamLogoUrl } from '@/lib/sportUtils'
import { getTeamColors } from '@/lib/teamColors'
import RatingModal from '../components/RatingModal'

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

const sportEmoji: Record<string, string> = {
  NBA: '🏀', NFL: '🏈', MLB: '⚾', NHL: '🏒', Soccer: '⚽',
}


const SPORTS = ['All', 'NBA', 'NFL', 'MLB', 'NHL', 'Soccer']
const PAGE_SIZE = 50

function TeamLogo({ team, sport }: { team: string; sport: string }) {
  const [err, setErr] = useState(false)
  const url = getTeamLogoUrl(team, sport)
  const abbr = team.split(' ').map(w => w[0]).join('').slice(0, 3).toUpperCase()

  if (!url || err) {
    return (
      <div style={{
        width: '40px', height: '40px', borderRadius: '8px',
        background: 'rgba(255,255,255,0.1)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '10px', fontWeight: '800', color: 'rgba(255,255,255,0.7)',
        letterSpacing: '0.5px', fontFamily: "'Barlow Condensed', sans-serif",
        flexShrink: 0,
      }}>
        {abbr}
      </div>
    )
  }

  return (
    <img
      src={url}
      alt={team}
      width={40}
      height={40}
      style={{ objectFit: 'contain', flexShrink: 0, filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.4))' }}
      onError={() => setErr(true)}
    />
  )
}

export default function GamesPage() {
  const router = useRouter()
  const [games, setGames] = useState<Game[]>([])
  const [filtered, setFiltered] = useState<Game[]>([])
  const [activeSport, setActiveSport] = useState('All')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const [isSearching, setIsSearching] = useState(false)
  const [modalTarget, setModalTarget] = useState<{ id: string; name: string } | null>(null)

  const fetchGames = async (pageNum: number, reset: boolean = false) => {
    setLoading(true)
    const { data } = await supabase
      .from('games')
      .select('*')
      .order('game_date', { ascending: false })
      .range(pageNum * PAGE_SIZE, (pageNum + 1) * PAGE_SIZE - 1)

    if (data) {
      if (reset) { setGames(data); setFiltered(data) }
      else { setGames(prev => [...prev, ...data]); setFiltered(prev => [...prev, ...data]) }
      setHasMore(data.length === PAGE_SIZE)
    }
    setLoading(false)
  }

  const searchGames = async (term: string, sport: string) => {
    setLoading(true)
    setIsSearching(true)
    let query = supabase.from('games').select('*').order('game_date', { ascending: false }).limit(100)
    if (sport !== 'All') query = query.eq('sport', sport)
    if (term.trim()) query = query.or(`home_team.ilike.%${term}%,away_team.ilike.%${term}%,notable.ilike.%${term}%`)
    const { data } = await query
    if (data) setFiltered(data)
    setLoading(false)
  }

  useEffect(() => { fetchGames(0, true) }, [])

  useEffect(() => {
    const hasSearch = search.trim() !== ''
    const hasSportFilter = activeSport !== 'All'
    if (hasSearch || hasSportFilter) {
      const timeout = setTimeout(() => searchGames(search, activeSport), 400)
      return () => clearTimeout(timeout)
    } else {
      setIsSearching(false)
      fetchGames(0, true)
      setPage(0)
    }
  }, [search, activeSport])

  return (
    <div style={{ background: '#0e1015', minHeight: '100vh' }}>

      {/* ── Page header ─────────────────────────────────────── */}
      <div style={{ position: 'relative', overflow: 'hidden', borderBottom: '1px solid #1e2330' }}>
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: `url('https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1600&q=80')`,
          backgroundSize: 'cover', backgroundPosition: 'center 40%', filter: 'brightness(0.2)',
        }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(14,16,21,0.95) 40%, rgba(14,16,21,0.5) 100%)' }} />
        <div style={{ position: 'relative', zIndex: 1, padding: '52px 2rem 36px' }}>
          <div style={{
            display: 'inline-block', background: 'rgba(232,164,50,0.1)', border: '1px solid rgba(232,164,50,0.2)',
            color: '#e8a432', fontSize: '9px', fontWeight: '700', letterSpacing: '3px',
            textTransform: 'uppercase', padding: '4px 14px', borderRadius: '20px', marginBottom: '14px',
          }}>Database</div>
          <h1 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '52px', fontWeight: '900', letterSpacing: '4px', textTransform: 'uppercase', color: '#f0ece4', marginBottom: '6px', lineHeight: 1 }}>
            Games
          </h1>
          <p style={{ color: '#3a4055', fontSize: '13px', letterSpacing: '0.5px' }}>
            Browse and rate every game in the database · Click any game to see full details
          </p>
        </div>
      </div>

      {/* ── Search and filter bar ───────────────────────────── */}
      <div style={{
        background: '#12151c', borderBottom: '1px solid #1e2330',
        padding: '16px 2rem', display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap',
      }}>
        <input
          type="text"
          placeholder="Search teams or keywords..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            background: '#1a1d26', border: '1px solid #2a2f3e', borderRadius: '6px',
            color: '#e8e4dc', fontSize: '13px', padding: '8px 14px', outline: 'none', width: '260px',
          }}
        />
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {SPORTS.map((sport) => (
            <button
              key={sport}
              onClick={() => setActiveSport(sport)}
              style={{
                background: activeSport === sport ? '#e8a432' : '#1a1d26',
                color: activeSport === sport ? '#000' : '#7a8099',
                border: activeSport === sport ? 'none' : '1px solid #2a2f3e',
                borderRadius: '20px', padding: '6px 14px', fontSize: '12px',
                fontWeight: '700', letterSpacing: '0.5px', textTransform: 'uppercase', cursor: 'pointer',
              }}
            >
              {sportEmoji[sport] ?? ''} {sport}
            </button>
          ))}
        </div>
      </div>

      {/* ── Games grid ─────────────────────────────────────── */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>

        <p style={{ color: '#3a4055', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '1.5rem' }}>
          {isSearching ? `${filtered.length} results found` : `${filtered.length} games loaded`}
        </p>

        {loading && page === 0 ? (
          <p style={{ color: '#3a4055', fontSize: '14px' }}>Loading...</p>
        ) : filtered.length === 0 ? (
          <div style={{ background: '#151820', border: '1px solid #1e2330', borderRadius: '10px', padding: '60px', textAlign: 'center' }}>
            <p style={{ color: '#3a4055', fontSize: '14px', marginBottom: '8px' }}>No games found.</p>
            <p style={{ color: '#2a2f3e', fontSize: '12px' }}>Try a different search or sport filter.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
            {filtered.map((game) => {
              const homeColors = getTeamColors(game.home_team, game.sport)
              const awayColors = getTeamColors(game.away_team, game.sport)
              return (
              <div
                key={game.id}
                onClick={() => router.push(`/games/${game.id}`)}
                style={{
                  background: '#151820', border: '1px solid #1e2330',
                  borderRadius: '10px', overflow: 'hidden', cursor: 'pointer',
                  transition: 'border-color 0.15s, transform 0.1s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#2a2f3e'; e.currentTarget.style.transform = 'translateY(-2px)' }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#1e2330'; e.currentTarget.style.transform = 'translateY(0)' }}
              >
                {/* Banner with team logos */}
                <div style={{
                  height: '120px',
                  background: `linear-gradient(100deg, ${homeColors.primary}ee 0%, ${homeColors.primary}99 45%, ${awayColors.primary}99 55%, ${awayColors.primary}ee 100%)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '0 16px', position: 'relative',
                }}>
                  <div style={{
                    position: 'absolute', top: '8px', left: '10px',
                    fontSize: '9px', fontWeight: '700', letterSpacing: '2px',
                    color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase',
                  }}>
                    {game.sport}
                  </div>

                  {/* Home team */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', zIndex: 1 }}>
                    <TeamLogo team={game.home_team} sport={game.sport} />
                    <div style={{
                      fontFamily: "'Barlow Condensed', sans-serif",
                      fontSize: '28px', fontWeight: '800', color: '#fff', lineHeight: 1,
                      textShadow: '0 2px 8px rgba(0,0,0,0.6)',
                    }}>
                      {game.home_score}
                    </div>
                  </div>

                  {/* VS */}
                  <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.3)', fontWeight: '700', letterSpacing: '2px', flexShrink: 0 }}>
                    FINAL
                  </div>

                  {/* Away team */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', zIndex: 1 }}>
                    <TeamLogo team={game.away_team} sport={game.sport} />
                    <div style={{
                      fontFamily: "'Barlow Condensed', sans-serif",
                      fontSize: '28px', fontWeight: '800', color: '#fff', lineHeight: 1,
                      textShadow: '0 2px 8px rgba(0,0,0,0.6)',
                    }}>
                      {game.away_score}
                    </div>
                  </div>
                </div>

                {/* Game details */}
                <div style={{ padding: '14px' }}>
                  <div style={{ fontSize: '13px', fontWeight: '600', color: '#c8c4bc', marginBottom: '4px' }}>
                    {game.home_team} vs {game.away_team}
                  </div>
                  <div style={{ fontSize: '11px', color: '#3a4055', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    {sportEmoji[game.sport]} {game.sport} · {new Date(game.game_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </div>
                  {game.season && (
                    <div style={{ fontSize: '11px', color: '#2a2f3e', marginTop: '2px' }}>{game.season}</div>
                  )}
                  {game.notable && (
                    <div style={{ fontSize: '11px', color: '#e8a432', marginTop: '6px', fontStyle: 'italic' }}>
                      {game.notable}
                    </div>
                  )}

                  <button
                    onClick={(e) => { e.stopPropagation(); setModalTarget({ id: game.id, name: `${game.home_team} vs ${game.away_team}` }) }}
                    style={{
                      marginTop: '12px', width: '100%', background: 'transparent',
                      border: '1px solid #2a2f3e', borderRadius: '4px', color: '#7a8099',
                      fontSize: '11px', fontWeight: '700', letterSpacing: '1px',
                      textTransform: 'uppercase', padding: '8px', cursor: 'pointer',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#e8a432'; e.currentTarget.style.color = '#e8a432' }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#2a2f3e'; e.currentTarget.style.color = '#7a8099' }}
                  >
                    ★ Rate this game
                  </button>
                </div>
              </div>
              )
            })}
          </div>
        )}

        {hasMore && !loading && !isSearching && (
          <div style={{ textAlign: 'center', marginTop: '2rem' }}>
            <button
              onClick={() => { const nextPage = page + 1; setPage(nextPage); fetchGames(nextPage) }}
              style={{
                background: 'transparent', border: '1px solid #2a2f3e', borderRadius: '6px',
                color: '#7a8099', fontSize: '13px', fontWeight: '700', letterSpacing: '1px',
                textTransform: 'uppercase', padding: '12px 32px', cursor: 'pointer',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#e8a432'; e.currentTarget.style.color = '#e8a432' }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#2a2f3e'; e.currentTarget.style.color = '#7a8099' }}
            >
              Load more games
            </button>
          </div>
        )}

        {loading && page > 0 && (
          <p style={{ textAlign: 'center', color: '#3a4055', fontSize: '13px', marginTop: '2rem' }}>Loading more...</p>
        )}
      </div>

      {modalTarget && (
        <RatingModal
          targetId={modalTarget.id}
          targetName={modalTarget.name}
          targetType="game"
          onClose={() => setModalTarget(null)}
          onSuccess={() => setModalTarget(null)}
        />
      )}
    </div>
  )
}
