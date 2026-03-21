'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import RatingModal from '../components/RatingModal'

type Moment = {
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

const sportColors: Record<string, { from: string; to: string; accent: string }> = {
  NBA: { from: '#1a3a6c', to: '#c9082a', accent: '#5b9ee8' },
  NFL: { from: '#013369', to: '#d50a0a', accent: '#e85b5b' },
  MLB: { from: '#002d72', to: '#e31837', accent: '#5bbf7a' },
  NHL: { from: '#003087', to: '#6d6e71', accent: '#7aa8e8' },
  Soccer: { from: '#004012', to: '#c8b400', accent: '#d4c84a' },
}

const sportPhotos: Record<string, string> = {
  NBA: 'https://images.unsplash.com/photo-1546519638405-a9d1b16a5b24?auto=format&fit=crop&w=800&q=80',
  NFL: 'https://images.unsplash.com/photo-1560272564-c83b66b1ad12?auto=format&fit=crop&w=800&q=80',
  MLB: 'https://images.unsplash.com/photo-1489944440615-453fc2b6a9a9?auto=format&fit=crop&w=800&q=80',
  NHL: 'https://images.unsplash.com/photo-1515703407324-5f753afd8be8?auto=format&fit=crop&w=800&q=80',
  Soccer: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=800&q=80',
}

const SPORTS = ['All', 'NBA', 'NFL', 'MLB', 'NHL', 'Soccer']

export default function MomentsPage() {
  const router = useRouter()
  const [moments, setMoments] = useState<Moment[]>([])
  const [filtered, setFiltered] = useState<Moment[]>([])
  const [activeSport, setActiveSport] = useState('All')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [modalTarget, setModalTarget] = useState<{ id: string; name: string } | null>(null)
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)

  const PAGE_SIZE = 30

  const fetchMoments = async (pageNum: number, reset = false) => {
    setLoading(true)
    const { data } = await supabase
      .from('games')
      .select('*')
      .not('notable', 'is', null)
      .neq('notable', '')
      .order('game_date', { ascending: false })
      .range(pageNum * PAGE_SIZE, (pageNum + 1) * PAGE_SIZE - 1)

    if (data) {
      if (reset) { setMoments(data); setFiltered(data) }
      else { setMoments(prev => [...prev, ...data]); setFiltered(prev => [...prev, ...data]) }
      setHasMore(data.length === PAGE_SIZE)
    }
    setLoading(false)
  }

  useEffect(() => { fetchMoments(0, true) }, [])

  useEffect(() => {
    let result = moments
    if (activeSport !== 'All') result = result.filter(m => m.sport === activeSport)
    if (search.trim()) {
      const term = search.toLowerCase()
      result = result.filter(m =>
        m.notable?.toLowerCase().includes(term) ||
        m.home_team.toLowerCase().includes(term) ||
        m.away_team.toLowerCase().includes(term)
      )
    }
    setFiltered(result)
  }, [search, activeSport, moments])

  return (
    <div style={{ background: '#0e1015', minHeight: '100vh' }}>

      {/* ── Page header ─────────────────────────────────────── */}
      <div style={{ position: 'relative', overflow: 'hidden', borderBottom: '1px solid #1e2330' }}>
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: `url('https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1600&q=80')`,
          backgroundSize: 'cover', backgroundPosition: 'center 40%', filter: 'brightness(0.15)',
        }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(14,16,21,0.97) 30%, rgba(14,16,21,0.6) 100%)' }} />
        <div style={{ position: 'relative', zIndex: 1, padding: '52px 2rem 36px' }}>
          <div style={{
            display: 'inline-block', background: 'rgba(232,164,50,0.1)', border: '1px solid rgba(232,164,50,0.2)',
            color: '#e8a432', fontSize: '9px', fontWeight: '700', letterSpacing: '3px',
            textTransform: 'uppercase', padding: '4px 14px', borderRadius: '20px', marginBottom: '14px',
          }}>Historic</div>
          <h1 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '52px', fontWeight: '900', letterSpacing: '4px', textTransform: 'uppercase', color: '#f0ece4', marginBottom: '6px', lineHeight: 1 }}>
            Moments
          </h1>
          <p style={{ color: '#3a4055', fontSize: '13px', letterSpacing: '0.5px' }}>
            The iconic plays, upsets, and performances that defined sports history
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
          placeholder="Search moments, teams..."
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

      {/* ── Moments grid ────────────────────────────────────── */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>

        <p style={{ color: '#3a4055', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '1.5rem' }}>
          {filtered.length} moments · Click to see full game details
        </p>

        {loading && page === 0 ? (
          <p style={{ color: '#3a4055', fontSize: '14px' }}>Loading moments...</p>
        ) : filtered.length === 0 ? (
          <div style={{ background: '#151820', border: '1px solid #1e2330', borderRadius: '10px', padding: '60px', textAlign: 'center' }}>
            <p style={{ color: '#3a4055', fontSize: '14px', marginBottom: '8px' }}>No moments found.</p>
            <p style={{ color: '#2a2f3e', fontSize: '12px' }}>Try a different sport filter or search term.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.5rem' }}>
            {filtered.map((moment) => {
              const sc = sportColors[moment.sport] || { from: '#1a1d26', to: '#2a2f3e', accent: '#7a8099' }
              const photo = sportPhotos[moment.sport]
              const winner = moment.home_score > moment.away_score ? moment.home_team : moment.away_score > moment.home_score ? moment.away_team : null
              const formattedDate = new Date(moment.game_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })

              return (
                <div
                  key={moment.id}
                  onClick={() => router.push(`/games/${moment.id}`)}
                  style={{
                    background: '#151820', border: '1px solid #1e2330',
                    borderRadius: '14px', overflow: 'hidden', cursor: 'pointer',
                    transition: 'border-color 0.15s, transform 0.1s',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#e8a43260'; e.currentTarget.style.transform = 'translateY(-3px)' }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#1e2330'; e.currentTarget.style.transform = 'translateY(0)' }}
                >
                  {/* Photo banner */}
                  <div style={{
                    position: 'relative', height: '160px', overflow: 'hidden',
                    backgroundImage: `url('${photo}')`,
                    backgroundSize: 'cover', backgroundPosition: 'center',
                  }}>
                    <div style={{
                      position: 'absolute', inset: 0,
                      background: `linear-gradient(135deg, ${sc.from}dd, ${sc.to}99)`,
                    }} />

                    {/* Sport badge */}
                    <div style={{
                      position: 'absolute', top: '12px', left: '14px',
                      background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '20px', padding: '4px 12px',
                      fontSize: '11px', fontWeight: '700', color: 'rgba(255,255,255,0.8)',
                      letterSpacing: '1px', textTransform: 'uppercase',
                    }}>
                      {sportEmoji[moment.sport]} {moment.sport}
                    </div>

                    {/* Scoreline */}
                    <div style={{
                      position: 'absolute', bottom: '14px', left: '14px', right: '14px',
                      display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
                    }}>
                      <div>
                        <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', marginBottom: '2px' }}>
                          {moment.home_team}
                        </div>
                        <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '32px', fontWeight: '900', color: '#fff', lineHeight: 1 }}>
                          {moment.home_score}
                          <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '20px', margin: '0 6px' }}>·</span>
                          {moment.away_score}
                        </div>
                        <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', marginTop: '2px' }}>
                          {moment.away_team}
                        </div>
                      </div>
                      {winner && (
                        <div style={{
                          background: 'rgba(232,164,50,0.15)', border: '1px solid rgba(232,164,50,0.3)',
                          borderRadius: '6px', padding: '4px 10px',
                          fontSize: '10px', color: '#e8a432', fontWeight: '700',
                          textTransform: 'uppercase', letterSpacing: '1px',
                        }}>
                          {winner.split(' ').slice(-1)[0]} Win
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Content */}
                  <div style={{ padding: '18px' }}>
                    {/* Notable quote */}
                    <p style={{
                      color: '#c8c4bc', fontSize: '14px', lineHeight: 1.6,
                      fontStyle: 'italic', marginBottom: '14px',
                      borderLeft: `3px solid ${sc.accent}66`,
                      paddingLeft: '12px',
                    }}>
                      "{moment.notable}"
                    </p>

                    {/* Date & season */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '6px' }}>
                      <div style={{ fontSize: '11px', color: '#3a4055', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        {formattedDate}
                        {moment.season ? ` · ${moment.season}` : ''}
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); setModalTarget({ id: moment.id, name: `${moment.home_team} vs ${moment.away_team}` }) }}
                        style={{
                          background: 'transparent', border: '1px solid #2a2f3e',
                          borderRadius: '4px', color: '#7a8099',
                          fontSize: '10px', fontWeight: '700', letterSpacing: '1px',
                          textTransform: 'uppercase', padding: '5px 12px', cursor: 'pointer',
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#e8a432'; e.currentTarget.style.color = '#e8a432' }}
                        onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#2a2f3e'; e.currentTarget.style.color = '#7a8099' }}
                      >
                        ★ Rate
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {hasMore && !loading && (
          <div style={{ textAlign: 'center', marginTop: '2rem' }}>
            <button
              onClick={() => { const next = page + 1; setPage(next); fetchMoments(next) }}
              style={{
                background: 'transparent', border: '1px solid #2a2f3e', borderRadius: '6px',
                color: '#7a8099', fontSize: '13px', fontWeight: '700', letterSpacing: '1px',
                textTransform: 'uppercase', padding: '12px 32px', cursor: 'pointer',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#e8a432'; e.currentTarget.style.color = '#e8a432' }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#2a2f3e'; e.currentTarget.style.color = '#7a8099' }}
            >
              Load more moments
            </button>
          </div>
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
