'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

type RankedGame = {
  id: string
  sport: string
  home_team: string
  away_team: string
  home_score: number
  away_score: number
  game_date: string
  notable: string
  avg_rating: number
  rating_count: number
}

type RankedPlayer = {
  id: string
  name: string
  sport: string
  position: string
  team: string
  era: string
  avg_rating: number
  rating_count: number
}

type ListItem = {
  id: string
  name: string
  type: 'game' | 'player'
  note: string
  sport: string
}

type UserList = {
  id: string
  title: string
  description: string
  items: ListItem[]
  createdAt: string
}

const sportEmoji: Record<string, string> = {
  NBA: '🏀', NFL: '🏈', MLB: '⚾', NHL: '🏒', Soccer: '⚽',
}

const sportColors: Record<string, string> = {
  NBA: 'linear-gradient(100deg, #1a3a6c, #c9082a)',
  NFL: 'linear-gradient(100deg, #013369, #d50a0a)',
  MLB: 'linear-gradient(100deg, #002d72, #e31837)',
  NHL: 'linear-gradient(100deg, #003087, #6d6e71)',
  Soccer: 'linear-gradient(100deg, #004012, #c8b400)',
}

const avatarColors: Record<string, { bg: string; color: string; border: string }> = {
  NBA: { bg: '#0a1e3a', color: '#5b9ee8', border: '#1a3a6c' },
  NFL: { bg: '#1a0808', color: '#e85b5b', border: '#3a1010' },
  MLB: { bg: '#0a2010', color: '#5bbf7a', border: '#143020' },
  NHL: { bg: '#0a1530', color: '#7aa8e8', border: '#162040' },
  Soccer: { bg: '#1a1a08', color: '#d4c84a', border: '#2a2a10' },
}

// ── Create List Modal ────────────────────────────────────────────────────────

function CreateListModal({
  onClose,
  onSave,
}: {
  onClose: () => void
  onSave: (list: UserList) => void
}) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [itemType, setItemType] = useState<'game' | 'player'>('player')
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState<ListItem[]>([])
  const [selectedItems, setSelectedItems] = useState<ListItem[]>([])
  const [searching, setSearching] = useState(false)

  useEffect(() => {
    if (!searchTerm.trim()) { setSearchResults([]); return }
    const timeout = setTimeout(async () => {
      setSearching(true)
      if (itemType === 'player') {
        const { data } = await supabase.from('players').select('id, name, sport, position').ilike('name', `%${searchTerm}%`).limit(8)
        if (data) setSearchResults(data.map(p => ({ id: p.id, name: p.name, type: 'player' as const, note: '', sport: p.sport })))
      } else {
        const { data } = await supabase.from('games').select('id, home_team, away_team, sport, game_date')
          .or(`home_team.ilike.%${searchTerm}%,away_team.ilike.%${searchTerm}%`).limit(8)
        if (data) setSearchResults(data.map(g => ({
          id: g.id,
          name: `${g.home_team} vs ${g.away_team}`,
          type: 'game' as const, note: '',
          sport: g.sport,
        })))
      }
      setSearching(false)
    }, 350)
    return () => clearTimeout(timeout)
  }, [searchTerm, itemType])

  const addItem = (item: ListItem) => {
    if (selectedItems.find(i => i.id === item.id)) return
    setSelectedItems(prev => [...prev, item])
    setSearchTerm('')
    setSearchResults([])
  }

  const removeItem = (id: string) => setSelectedItems(prev => prev.filter(i => i.id !== id))

  const moveItem = (index: number, dir: -1 | 1) => {
    const next = [...selectedItems]
    const swap = index + dir
    if (swap < 0 || swap >= next.length) return
    ;[next[index], next[swap]] = [next[swap], next[index]]
    setSelectedItems(next)
  }

  const handleSave = () => {
    if (!title.trim() || selectedItems.length === 0) return
    onSave({
      id: Date.now().toString(),
      title: title.trim(),
      description: description.trim(),
      items: selectedItems,
      createdAt: new Date().toISOString(),
    })
  }

  const overlayStyle: React.CSSProperties = {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 1000, padding: '2rem',
  }

  return (
    <div style={overlayStyle} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={{
        background: '#151820', border: '1px solid #2a2f3e',
        borderRadius: '14px', width: '100%', maxWidth: '640px',
        maxHeight: '90vh', overflowY: 'auto',
        boxShadow: '0 24px 80px rgba(0,0,0,0.7)',
      }}>
        {/* Header */}
        <div style={{ padding: '24px 28px', borderBottom: '1px solid #1e2330', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: '10px', color: '#e8a432', fontWeight: '700', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '4px' }}>New</div>
            <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '28px', fontWeight: '900', letterSpacing: '2px', textTransform: 'uppercase', color: '#f0ece4', margin: 0 }}>
              Create a Ranking
            </h2>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: '1px solid #2a2f3e', borderRadius: '6px', color: '#5a6070', fontSize: '16px', width: '36px', height: '36px', cursor: 'pointer', flexShrink: 0 }}>✕</button>
        </div>

        <div style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Title */}
          <div>
            <label style={{ display: 'block', fontSize: '10px', color: '#3a4055', fontWeight: '700', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '8px' }}>
              List Title *
            </label>
            <input
              type="text"
              placeholder="e.g. Greatest NBA Players of All Time"
              value={title}
              onChange={e => setTitle(e.target.value)}
              style={{
                width: '100%', boxSizing: 'border-box',
                background: '#1a1d26', border: '1px solid #2a2f3e', borderRadius: '8px',
                color: '#e8e4dc', fontSize: '14px', padding: '10px 14px', outline: 'none',
              }}
            />
          </div>

          {/* Description */}
          <div>
            <label style={{ display: 'block', fontSize: '10px', color: '#3a4055', fontWeight: '700', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '8px' }}>
              Description
            </label>
            <textarea
              placeholder="What makes these your picks?"
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={2}
              style={{
                width: '100%', boxSizing: 'border-box', resize: 'vertical',
                background: '#1a1d26', border: '1px solid #2a2f3e', borderRadius: '8px',
                color: '#e8e4dc', fontSize: '13px', padding: '10px 14px', outline: 'none', fontFamily: 'inherit',
              }}
            />
          </div>

          {/* Type toggle */}
          <div>
            <label style={{ display: 'block', fontSize: '10px', color: '#3a4055', fontWeight: '700', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '8px' }}>
              Ranking Type
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              {(['player', 'game'] as const).map(t => (
                <button
                  key={t}
                  onClick={() => { setItemType(t); setSearchTerm(''); setSearchResults([]) }}
                  style={{
                    background: itemType === t ? '#e8a432' : '#1a1d26',
                    color: itemType === t ? '#000' : '#7a8099',
                    border: itemType === t ? 'none' : '1px solid #2a2f3e',
                    borderRadius: '20px', padding: '6px 18px', fontSize: '12px',
                    fontWeight: '700', letterSpacing: '1px', textTransform: 'uppercase', cursor: 'pointer',
                  }}
                >
                  {t === 'player' ? '⭐ Players' : '🏆 Games'}
                </button>
              ))}
            </div>
          </div>

          {/* Search */}
          <div style={{ position: 'relative' }}>
            <label style={{ display: 'block', fontSize: '10px', color: '#3a4055', fontWeight: '700', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '8px' }}>
              Add {itemType === 'player' ? 'Players' : 'Games'}
            </label>
            <input
              type="text"
              placeholder={itemType === 'player' ? 'Search player name...' : 'Search by team name...'}
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{
                width: '100%', boxSizing: 'border-box',
                background: '#1a1d26', border: '1px solid #2a2f3e', borderRadius: '8px',
                color: '#e8e4dc', fontSize: '13px', padding: '10px 14px', outline: 'none',
              }}
            />
            {searchResults.length > 0 && (
              <div style={{
                position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 10,
                background: '#1a1d26', border: '1px solid #2a2f3e', borderRadius: '8px',
                marginTop: '4px', overflow: 'hidden',
                boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
              }}>
                {searchResults.map(item => (
                  <button
                    key={item.id}
                    onClick={() => addItem(item)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '10px',
                      width: '100%', background: 'transparent', border: 'none',
                      borderBottom: '1px solid #1e2330', padding: '10px 14px',
                      color: '#c8c4bc', fontSize: '13px', cursor: 'pointer', textAlign: 'left',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#151820')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <span>{sportEmoji[item.sport]}</span>
                    <span>{item.name}</span>
                    <span style={{ marginLeft: 'auto', fontSize: '10px', color: '#3a4055', textTransform: 'uppercase', letterSpacing: '1px' }}>{item.sport}</span>
                  </button>
                ))}
              </div>
            )}
            {searching && (
              <div style={{ position: 'absolute', right: '12px', top: '50%', color: '#3a4055', fontSize: '12px' }}>...</div>
            )}
          </div>

          {/* Selected items */}
          {selectedItems.length > 0 && (
            <div>
              <label style={{ display: 'block', fontSize: '10px', color: '#3a4055', fontWeight: '700', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '8px' }}>
                Your Ranking ({selectedItems.length} items) — drag to reorder
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {selectedItems.map((item, i) => (
                  <div
                    key={item.id}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '12px',
                      background: '#1a1d26', border: '1px solid #2a2f3e',
                      borderRadius: '8px', padding: '10px 12px',
                    }}
                  >
                    <span style={{
                      fontFamily: "'Barlow Condensed', sans-serif",
                      fontSize: '20px', fontWeight: '900', color: '#e8a432',
                      minWidth: '28px', textAlign: 'right',
                    }}>
                      {i + 1}
                    </span>
                    <span style={{ fontSize: '18px' }}>{sportEmoji[item.sport]}</span>
                    <span style={{ flex: 1, fontSize: '13px', color: '#c8c4bc', fontWeight: '600' }}>{item.name}</span>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <button onClick={() => moveItem(i, -1)} disabled={i === 0}
                        style={{ background: 'transparent', border: '1px solid #2a2f3e', borderRadius: '4px', color: '#5a6070', fontSize: '10px', padding: '3px 7px', cursor: 'pointer', opacity: i === 0 ? 0.3 : 1 }}>↑</button>
                      <button onClick={() => moveItem(i, 1)} disabled={i === selectedItems.length - 1}
                        style={{ background: 'transparent', border: '1px solid #2a2f3e', borderRadius: '4px', color: '#5a6070', fontSize: '10px', padding: '3px 7px', cursor: 'pointer', opacity: i === selectedItems.length - 1 ? 0.3 : 1 }}>↓</button>
                      <button onClick={() => removeItem(item.id)}
                        style={{ background: 'transparent', border: '1px solid #3a1010', borderRadius: '4px', color: '#e85b5b', fontSize: '10px', padding: '3px 7px', cursor: 'pointer' }}>✕</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', gap: '10px', paddingTop: '4px' }}>
            <button
              onClick={handleSave}
              disabled={!title.trim() || selectedItems.length === 0}
              style={{
                flex: 1, background: !title.trim() || selectedItems.length === 0 ? '#1a1d26' : '#e8a432',
                border: 'none', borderRadius: '8px',
                color: !title.trim() || selectedItems.length === 0 ? '#3a4055' : '#000',
                fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: '15px', fontWeight: '800', letterSpacing: '2px',
                textTransform: 'uppercase', padding: '13px', cursor: !title.trim() || selectedItems.length === 0 ? 'not-allowed' : 'pointer',
              }}
            >
              Save Ranking
            </button>
            <button
              onClick={onClose}
              style={{
                background: 'transparent', border: '1px solid #2a2f3e', borderRadius: '8px',
                color: '#5a6070', fontSize: '13px', fontWeight: '700',
                letterSpacing: '1px', textTransform: 'uppercase', padding: '13px 20px', cursor: 'pointer',
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Main Rankings Page ───────────────────────────────────────────────────────

type Tab = 'games' | 'players' | 'lists'

export default function RankingsPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<Tab>('games')
  const [games, setGames] = useState<RankedGame[]>([])
  const [players, setPlayers] = useState<RankedPlayer[]>([])
  const [userLists, setUserLists] = useState<UserList[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)

  useEffect(() => {
    const fetchRankings = async () => {
      setLoading(true)
      const [{ data: gamesData }, { data: playersData }] = await Promise.all([
        supabase.from('games').select(`*, ratings(stars)`).limit(100),
        supabase.from('players').select(`*, ratings(stars)`).limit(100),
      ])

      if (gamesData) {
        const ranked = gamesData
          .map((game: any) => {
            const stars = game.ratings.map((r: any) => r.stars)
            const avg = stars.length > 0 ? stars.reduce((a: number, b: number) => a + b, 0) / stars.length : 0
            return { ...game, avg_rating: avg, rating_count: stars.length }
          })
          .filter((g: any) => g.rating_count > 0)
          .sort((a: any, b: any) => b.avg_rating - a.avg_rating)
        setGames(ranked)
      }

      if (playersData) {
        const ranked = playersData
          .map((player: any) => {
            const stars = player.ratings.map((r: any) => r.stars)
            const avg = stars.length > 0 ? stars.reduce((a: number, b: number) => a + b, 0) / stars.length : 0
            return { ...player, avg_rating: avg, rating_count: stars.length }
          })
          .filter((p: any) => p.rating_count > 0)
          .sort((a: any, b: any) => b.avg_rating - a.avg_rating)
        setPlayers(ranked)
      }

      // Load saved lists from localStorage
      try {
        const saved = localStorage.getItem('sportboxd_lists')
        if (saved) setUserLists(JSON.parse(saved))
      } catch {}

      setLoading(false)
    }
    fetchRankings()
  }, [])

  const handleSaveList = (list: UserList) => {
    const updated = [list, ...userLists]
    setUserLists(updated)
    try { localStorage.setItem('sportboxd_lists', JSON.stringify(updated)) } catch {}
    setShowCreateModal(false)
    setActiveTab('lists')
  }

  const handleDeleteList = (id: string) => {
    const updated = userLists.filter(l => l.id !== id)
    setUserLists(updated)
    try { localStorage.setItem('sportboxd_lists', JSON.stringify(updated)) } catch {}
  }

  const rankDisplay = (rank: number) => {
    if (rank === 1) return { icon: '🥇', color: '#e8a432' }
    if (rank === 2) return { icon: '🥈', color: '#9aa0b4' }
    if (rank === 3) return { icon: '🥉', color: '#cd7f32' }
    return { icon: null, color: '#2a2f3e' }
  }

  const renderStars = (avg: number) => '★'.repeat(Math.round(avg)) + '☆'.repeat(5 - Math.round(avg))

  const TABS: { key: Tab; label: string }[] = [
    { key: 'games', label: '🏆 Top Games' },
    { key: 'players', label: '⭐ Top Players' },
    { key: 'lists', label: `📋 My Rankings${userLists.length > 0 ? ` (${userLists.length})` : ''}` },
  ]

  return (
    <div style={{ background: '#0e1015', minHeight: '100vh' }}>

      {/* ── Page header ─────────────────────────────────────── */}
      <div style={{ position: 'relative', overflow: 'hidden', borderBottom: '1px solid #1e2330' }}>
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: `url('https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1600&q=80')`,
          backgroundSize: 'cover', backgroundPosition: 'center 50%', filter: 'brightness(0.15)',
        }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(14,16,21,0.97) 30%, rgba(14,16,21,0.6) 100%)' }} />

        <div style={{ position: 'relative', zIndex: 1, padding: '52px 2rem 0' }}>
          <div style={{
            display: 'inline-block', background: 'rgba(232,164,50,0.1)', border: '1px solid rgba(232,164,50,0.2)',
            color: '#e8a432', fontSize: '9px', fontWeight: '700', letterSpacing: '3px',
            textTransform: 'uppercase', padding: '4px 14px', borderRadius: '20px', marginBottom: '14px',
          }}>Community Rated</div>
          <h1 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '52px', fontWeight: '900', letterSpacing: '4px', textTransform: 'uppercase', color: '#f0ece4', marginBottom: '6px', lineHeight: 1 }}>
            Rankings
          </h1>
          <p style={{ color: '#3a4055', fontSize: '13px', letterSpacing: '0.5px', marginBottom: '24px' }}>
            Community rated · Updated in real time · Build your own rankings
          </p>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: '0', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex' }}>
              {TABS.map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  style={{
                    background: 'transparent', border: 'none',
                    borderBottom: activeTab === tab.key ? '2px solid #e8a432' : '2px solid transparent',
                    color: activeTab === tab.key ? '#e8a432' : '#3a4055',
                    fontFamily: "'Barlow Condensed', sans-serif",
                    fontSize: '16px', fontWeight: '700', letterSpacing: '2px',
                    textTransform: 'uppercase', padding: '10px 22px',
                    cursor: 'pointer', marginBottom: '-1px',
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Create ranking button */}
            <button
              onClick={() => setShowCreateModal(true)}
              style={{
                background: '#e8a432', border: 'none', borderRadius: '6px',
                color: '#000', fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: '13px', fontWeight: '800', letterSpacing: '1.5px',
                textTransform: 'uppercase', padding: '9px 20px',
                cursor: 'pointer', marginBottom: '2px',
                whiteSpace: 'nowrap',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = '#f0b340')}
              onMouseLeave={e => (e.currentTarget.style.background = '#e8a432')}
            >
              + New Ranking
            </button>
          </div>
        </div>
      </div>

      {/* ── Content ─────────────────────────────────────────── */}
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem' }}>

        {loading ? (
          <p style={{ color: '#3a4055', fontSize: '14px' }}>Loading rankings...</p>
        ) : activeTab === 'games' ? (

          games.length === 0 ? (
            <div style={{ background: '#151820', border: '1px solid #1e2330', borderRadius: '10px', padding: '60px', textAlign: 'center' }}>
              <p style={{ color: '#3a4055', fontSize: '14px', marginBottom: '8px' }}>No ratings yet.</p>
              <p style={{ color: '#2a2f3e', fontSize: '12px' }}>Once users start rating games they will appear here.</p>
            </div>
          ) : (
            <div>
              {games.map((game, index) => {
                const rank = rankDisplay(index + 1)
                return (
                  <div
                    key={game.id}
                    onClick={() => router.push(`/games/${game.id}`)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '16px',
                      padding: '14px 12px', borderBottom: '1px solid #1a1d26',
                      borderRadius: '6px', cursor: 'pointer',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#151820')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <div style={{ width: '40px', textAlign: 'right', flexShrink: 0 }}>
                      {rank.icon ? (
                        <span style={{ fontSize: '22px' }}>{rank.icon}</span>
                      ) : (
                        <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '22px', fontWeight: '800', color: rank.color }}>{index + 1}</span>
                      )}
                    </div>
                    <div style={{ width: '56px', height: '38px', borderRadius: '5px', background: sportColors[game.sport] || '#1a1d26', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>
                      {sportEmoji[game.sport]}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '14px', fontWeight: '600', color: '#c8c4bc', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {game.home_team} vs {game.away_team}
                      </div>
                      <div style={{ fontSize: '11px', color: '#3a4055', textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: '2px' }}>
                        {game.sport} · {new Date(game.game_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        {game.notable ? ` · ${game.notable}` : ''}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '26px', fontWeight: '800', color: '#e8a432', letterSpacing: '1px', lineHeight: 1 }}>
                        {game.avg_rating.toFixed(1)}
                      </div>
                      <div style={{ fontSize: '11px', color: '#3a4055', marginTop: '2px' }}>{renderStars(game.avg_rating)}</div>
                      <div style={{ fontSize: '10px', color: '#2a2f3e', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        {game.rating_count} {game.rating_count === 1 ? 'rating' : 'ratings'}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )

        ) : activeTab === 'players' ? (

          players.length === 0 ? (
            <div style={{ background: '#151820', border: '1px solid #1e2330', borderRadius: '10px', padding: '60px', textAlign: 'center' }}>
              <p style={{ color: '#3a4055', fontSize: '14px', marginBottom: '8px' }}>No ratings yet.</p>
              <p style={{ color: '#2a2f3e', fontSize: '12px' }}>Once users start rating players they will appear here.</p>
            </div>
          ) : (
            <div>
              {players.map((player, index) => {
                const ac = avatarColors[player.sport] || { bg: '#1a1d26', color: '#7a8099', border: '#2a2f3e' }
                const initials = player.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)
                const rank = rankDisplay(index + 1)
                return (
                  <div
                    key={player.id}
                    onClick={() => router.push(`/players/${player.id}`)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '16px',
                      padding: '14px 12px', borderBottom: '1px solid #1a1d26',
                      borderRadius: '6px', cursor: 'pointer',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#151820')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <div style={{ width: '40px', textAlign: 'right', flexShrink: 0 }}>
                      {rank.icon ? <span style={{ fontSize: '22px' }}>{rank.icon}</span> : <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '22px', fontWeight: '800', color: rank.color }}>{index + 1}</span>}
                    </div>
                    <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: ac.bg, color: ac.color, border: `2px solid ${ac.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: '800', flexShrink: 0, fontFamily: "'Barlow Condensed', sans-serif" }}>
                      {initials}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '14px', fontWeight: '600', color: '#c8c4bc', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {player.name}
                      </div>
                      <div style={{ fontSize: '11px', color: '#3a4055', textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: '2px' }}>
                        {player.position} · {sportEmoji[player.sport]} {player.sport}{player.team ? ` · ${player.team}` : ''}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '26px', fontWeight: '800', color: '#e8a432', letterSpacing: '1px', lineHeight: 1 }}>
                        {player.avg_rating.toFixed(1)}
                      </div>
                      <div style={{ fontSize: '11px', color: '#3a4055', marginTop: '2px' }}>{renderStars(player.avg_rating)}</div>
                      <div style={{ fontSize: '10px', color: '#2a2f3e', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        {player.rating_count} {player.rating_count === 1 ? 'rating' : 'ratings'}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )

        ) : (
          /* ── My Lists tab ── */
          <div>
            {userLists.length === 0 ? (
              <div style={{ background: '#151820', border: '1px solid #1e2330', borderRadius: '10px', padding: '60px', textAlign: 'center' }}>
                <div style={{ fontSize: '40px', marginBottom: '16px' }}>📋</div>
                <p style={{ color: '#5a6070', fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>No rankings yet</p>
                <p style={{ color: '#2a2f3e', fontSize: '13px', marginBottom: '24px' }}>
                  Create your first custom ranking — best players, must-watch games, all-time classics.
                </p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  style={{
                    background: '#e8a432', border: 'none', borderRadius: '8px',
                    color: '#000', fontFamily: "'Barlow Condensed', sans-serif",
                    fontSize: '14px', fontWeight: '800', letterSpacing: '2px',
                    textTransform: 'uppercase', padding: '12px 28px', cursor: 'pointer',
                  }}
                >
                  + Create a Ranking
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {userLists.map(list => (
                  <div key={list.id} style={{ background: '#151820', border: '1px solid #1e2330', borderRadius: '12px', overflow: 'hidden' }}>
                    {/* List header */}
                    <div style={{ padding: '20px 22px', borderBottom: '1px solid #1e2330', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px' }}>
                      <div>
                        <h3 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '22px', fontWeight: '900', letterSpacing: '2px', textTransform: 'uppercase', color: '#f0ece4', margin: '0 0 4px' }}>
                          {list.title}
                        </h3>
                        {list.description && (
                          <p style={{ color: '#5a6070', fontSize: '13px', margin: '0 0 4px', lineHeight: 1.5 }}>{list.description}</p>
                        )}
                        <div style={{ fontSize: '10px', color: '#2a2f3e', textTransform: 'uppercase', letterSpacing: '1px' }}>
                          {list.items.length} items · Created {new Date(list.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteList(list.id)}
                        style={{ background: 'transparent', border: '1px solid #3a1010', borderRadius: '6px', color: '#e85b5b', fontSize: '11px', fontWeight: '700', letterSpacing: '1px', textTransform: 'uppercase', padding: '6px 12px', cursor: 'pointer', flexShrink: 0 }}
                        onMouseEnter={e => (e.currentTarget.style.background = '#3a1010')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                      >
                        Delete
                      </button>
                    </div>

                    {/* List items */}
                    <div>
                      {list.items.map((item, i) => (
                        <div
                          key={item.id}
                          onClick={() => router.push(item.type === 'player' ? `/players/${item.id}` : `/games/${item.id}`)}
                          style={{
                            display: 'flex', alignItems: 'center', gap: '14px',
                            padding: '12px 22px', borderBottom: i < list.items.length - 1 ? '1px solid #1a1d26' : 'none',
                            cursor: 'pointer',
                          }}
                          onMouseEnter={e => (e.currentTarget.style.background = '#12151c')}
                          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                        >
                          <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '24px', fontWeight: '900', color: '#e8a432', minWidth: '32px', textAlign: 'right' }}>
                            {i + 1}
                          </span>
                          <span style={{ fontSize: '18px' }}>{sportEmoji[item.sport]}</span>
                          <span style={{ flex: 1, fontSize: '14px', fontWeight: '600', color: '#c8c4bc' }}>{item.name}</span>
                          <span style={{ fontSize: '10px', color: '#2a2f3e', textTransform: 'uppercase', letterSpacing: '1px', flexShrink: 0 }}>
                            {item.type === 'player' ? 'Player' : 'Game'} ›
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}

                <button
                  onClick={() => setShowCreateModal(true)}
                  style={{
                    background: 'transparent', border: '1px dashed #2a2f3e', borderRadius: '10px',
                    color: '#5a6070', fontFamily: "'Barlow Condensed', sans-serif",
                    fontSize: '14px', fontWeight: '700', letterSpacing: '2px',
                    textTransform: 'uppercase', padding: '20px', cursor: 'pointer',
                    width: '100%',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#e8a432'; e.currentTarget.style.color = '#e8a432' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#2a2f3e'; e.currentTarget.style.color = '#5a6070' }}
                >
                  + Create Another Ranking
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {showCreateModal && (
        <CreateListModal
          onClose={() => setShowCreateModal(false)}
          onSave={handleSaveList}
        />
      )}
    </div>
  )
}
