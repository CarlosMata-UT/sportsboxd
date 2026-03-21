'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { getPlayerHeadshotUrl } from '@/lib/sportUtils'
import RatingModal from '../components/RatingModal'

type Player = {
  id: string
  name: string
  sport: string
  position: string
  team: string
  era: string
}

const sportEmoji: Record<string, string> = {
  NBA: '🏀', NFL: '🏈', MLB: '⚾', NHL: '🏒', Soccer: '⚽',
}

const avatarColors: Record<string, { bg: string; color: string; border: string }> = {
  NBA: { bg: '#0a1e3a', color: '#5b9ee8', border: '#1a3a6c' },
  NFL: { bg: '#1a0808', color: '#e85b5b', border: '#3a1010' },
  MLB: { bg: '#0a2010', color: '#5bbf7a', border: '#143020' },
  NHL: { bg: '#0a1530', color: '#7aa8e8', border: '#162040' },
  Soccer: { bg: '#1a1a08', color: '#d4c84a', border: '#2a2a10' },
}

const SPORTS = ['All', 'NBA', 'NFL', 'MLB', 'NHL', 'Soccer']
const PAGE_SIZE = 50

function PlayerAvatar({ player }: { player: Player }) {
  const [imgErr, setImgErr] = useState(false)
  const ac = avatarColors[player.sport] || { bg: '#1a1d26', color: '#7a8099', border: '#2a2f3e' }
  const initials = player.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
  const headshotUrl = getPlayerHeadshotUrl(player.name, player.sport)

  if (headshotUrl && !imgErr) {
    return (
      <div style={{
        width: '72px', height: '72px', borderRadius: '50%',
        overflow: 'hidden', border: `2px solid ${ac.border}`,
        margin: '0 auto 14px', background: ac.bg,
        boxShadow: `0 4px 12px rgba(0,0,0,0.4)`,
      }}>
        <img
          src={headshotUrl}
          alt={player.name}
          style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' }}
          onError={() => setImgErr(true)}
        />
      </div>
    )
  }

  return (
    <div style={{
      width: '72px', height: '72px', borderRadius: '50%',
      background: ac.bg, color: ac.color, border: `2px solid ${ac.border}`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: '22px', fontWeight: '800', margin: '0 auto 14px',
      letterSpacing: '1px', fontFamily: "'Barlow Condensed', sans-serif",
    }}>
      {initials}
    </div>
  )
}

export default function PlayersPage() {
  const router = useRouter()
  const [players, setPlayers] = useState<Player[]>([])
  const [filtered, setFiltered] = useState<Player[]>([])
  const [activeSport, setActiveSport] = useState('All')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const [isSearching, setIsSearching] = useState(false)
  const [modalTarget, setModalTarget] = useState<{ id: string; name: string } | null>(null)

  const fetchPlayers = async (pageNum: number, reset: boolean = false) => {
    setLoading(true)
    const { data } = await supabase
      .from('players')
      .select('*')
      .order('name', { ascending: true })
      .range(pageNum * PAGE_SIZE, (pageNum + 1) * PAGE_SIZE - 1)

    if (data) {
      if (reset) { setPlayers(data); setFiltered(data) }
      else { setPlayers(prev => [...prev, ...data]); setFiltered(prev => [...prev, ...data]) }
      setHasMore(data.length === PAGE_SIZE)
    }
    setLoading(false)
  }

  const searchPlayers = async (term: string, sport: string) => {
    setLoading(true)
    setIsSearching(true)
    let query = supabase.from('players').select('*').order('name', { ascending: true }).limit(100)
    if (sport !== 'All') query = query.eq('sport', sport)
    if (term.trim()) query = query.or(`name.ilike.%${term}%,team.ilike.%${term}%,position.ilike.%${term}%`)
    const { data } = await query
    if (data) setFiltered(data)
    setLoading(false)
  }

  useEffect(() => { fetchPlayers(0, true) }, [])

  useEffect(() => {
    const hasSearch = search.trim() !== ''
    const hasSportFilter = activeSport !== 'All'
    if (hasSearch || hasSportFilter) {
      const timeout = setTimeout(() => searchPlayers(search, activeSport), 400)
      return () => clearTimeout(timeout)
    } else {
      setIsSearching(false)
      fetchPlayers(0, true)
      setPage(0)
    }
  }, [search, activeSport])

  return (
    <div style={{ background: '#0e1015', minHeight: '100vh' }}>

      {/* ── Page header ─────────────────────────────────────── */}
      <div style={{ position: 'relative', overflow: 'hidden', borderBottom: '1px solid #1e2330' }}>
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: `url('https://images.unsplash.com/photo-1504450758481-7338eba7524a?auto=format&fit=crop&w=1600&q=80')`,
          backgroundSize: 'cover', backgroundPosition: 'center 30%', filter: 'brightness(0.18)',
        }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(14,16,21,0.96) 35%, rgba(14,16,21,0.5) 100%)' }} />
        <div style={{ position: 'relative', zIndex: 1, padding: '52px 2rem 36px' }}>
          <div style={{
            display: 'inline-block', background: 'rgba(232,164,50,0.1)', border: '1px solid rgba(232,164,50,0.2)',
            color: '#e8a432', fontSize: '9px', fontWeight: '700', letterSpacing: '3px',
            textTransform: 'uppercase', padding: '4px 14px', borderRadius: '20px', marginBottom: '14px',
          }}>All Time Greats</div>
          <h1 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '52px', fontWeight: '900', letterSpacing: '4px', textTransform: 'uppercase', color: '#f0ece4', marginBottom: '6px', lineHeight: 1 }}>
            Players
          </h1>
          <p style={{ color: '#3a4055', fontSize: '13px', letterSpacing: '0.5px' }}>
            Browse and rate the greatest players of all time · Click any player to see career stats
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
          placeholder="Search players, teams, positions..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            background: '#1a1d26', border: '1px solid #2a2f3e', borderRadius: '6px',
            color: '#e8e4dc', fontSize: '13px', padding: '8px 14px', outline: 'none', width: '280px',
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

      {/* ── Players grid ───────────────────────────────────── */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>

        <p style={{ color: '#3a4055', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '1.5rem' }}>
          {isSearching ? `${filtered.length} results found` : `${filtered.length} players loaded`}
        </p>

        {loading && page === 0 ? (
          <p style={{ color: '#3a4055', fontSize: '14px' }}>Loading...</p>
        ) : filtered.length === 0 ? (
          <div style={{ background: '#151820', border: '1px solid #1e2330', borderRadius: '10px', padding: '60px', textAlign: 'center' }}>
            <p style={{ color: '#3a4055', fontSize: '14px', marginBottom: '8px' }}>No players found.</p>
            <p style={{ color: '#2a2f3e', fontSize: '12px' }}>Try a different search or sport filter.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
            {filtered.map((player) => {
              const ac = avatarColors[player.sport] || { bg: '#1a1d26', color: '#7a8099', border: '#2a2f3e' }
              return (
                <div
                  key={player.id}
                  onClick={() => router.push(`/players/${player.id}`)}
                  style={{
                    background: '#151820', border: `1px solid ${ac.border}`,
                    borderRadius: '10px', padding: '22px 16px 18px',
                    textAlign: 'center', cursor: 'pointer', position: 'relative', overflow: 'hidden',
                    transition: 'border-color 0.15s, transform 0.1s',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = ac.color; e.currentTarget.style.transform = 'translateY(-2px)' }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = ac.border; e.currentTarget.style.transform = 'translateY(0)' }}
                >
                  {/* Top accent bar */}
                  <div style={{
                    position: 'absolute', top: 0, left: 0, right: 0, height: '3px',
                    background: `linear-gradient(90deg, ${ac.color}, transparent)`, opacity: 0.6,
                  }} />

                  <PlayerAvatar player={player} />

                  <div style={{ fontSize: '14px', fontWeight: '700', color: '#e8e4dc', marginBottom: '3px' }}>
                    {player.name}
                  </div>
                  <div style={{ fontSize: '11px', color: '#5a6070', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>
                    {player.position}
                  </div>
                  {player.team && (
                    <div style={{ fontSize: '11px', color: '#3a4055', marginBottom: '3px' }}>{player.team}</div>
                  )}
                  {player.era && (
                    <div style={{ fontSize: '11px', color: '#2a2f3e', fontStyle: 'italic', marginBottom: '10px' }}>{player.era}</div>
                  )}

                  <div style={{
                    display: 'inline-block', background: ac.bg, color: ac.color,
                    fontSize: '9px', fontWeight: '700', letterSpacing: '1.5px',
                    textTransform: 'uppercase', padding: '3px 10px', borderRadius: '20px',
                    border: `1px solid ${ac.border}`, marginBottom: '12px',
                  }}>
                    {sportEmoji[player.sport]} {player.sport}
                  </div>

                  <button
                    onClick={(e) => { e.stopPropagation(); setModalTarget({ id: player.id, name: player.name }) }}
                    style={{
                      display: 'block', width: '100%', background: 'transparent',
                      border: '1px solid #2a2f3e', borderRadius: '4px', color: '#7a8099',
                      fontSize: '11px', fontWeight: '700', letterSpacing: '1px',
                      textTransform: 'uppercase', padding: '8px', cursor: 'pointer',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#e8a432'; e.currentTarget.style.color = '#e8a432' }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#2a2f3e'; e.currentTarget.style.color = '#7a8099' }}
                  >
                    ★ Rate this player
                  </button>
                </div>
              )
            })}
          </div>
        )}

        {hasMore && !loading && !isSearching && (
          <div style={{ textAlign: 'center', marginTop: '2rem' }}>
            <button
              onClick={() => { const nextPage = page + 1; setPage(nextPage); fetchPlayers(nextPage) }}
              style={{
                background: 'transparent', border: '1px solid #2a2f3e', borderRadius: '6px',
                color: '#7a8099', fontSize: '13px', fontWeight: '700', letterSpacing: '1px',
                textTransform: 'uppercase', padding: '12px 32px', cursor: 'pointer',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#e8a432'; e.currentTarget.style.color = '#e8a432' }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#2a2f3e'; e.currentTarget.style.color = '#7a8099' }}
            >
              Load more players
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
          targetType="player"
          onClose={() => setModalTarget(null)}
          onSuccess={() => setModalTarget(null)}
        />
      )}
    </div>
  )
}
