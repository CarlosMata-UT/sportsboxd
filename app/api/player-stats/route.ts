import { NextResponse } from 'next/server'

const LEAGUE_PATHS: Record<string, string> = {
  NBA: 'basketball/nba',
  NFL: 'football/nfl',
  MLB: 'baseball/mlb',
  NHL: 'hockey/nhl',
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const name = searchParams.get('name') || ''
  const sport = searchParams.get('sport') || 'NBA'

  const leaguePath = LEAGUE_PATHS[sport]
  if (!leaguePath) {
    return NextResponse.json({ error: 'Unsupported sport' })
  }

  try {
    // Step 1: Search for athlete by name
    const searchUrl = `https://site.api.espn.com/apis/site/v2/sports/${leaguePath}/athletes?search=${encodeURIComponent(name)}&limit=5`
    const searchRes = await fetch(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        'Accept': 'application/json',
      },
      next: { revalidate: 86400 },
    })

    if (!searchRes.ok) {
      return NextResponse.json({ error: 'ESPN search failed', athlete: null, stats: null })
    }

    const searchData = await searchRes.json()
    const items = searchData.items || searchData.athletes || []

    if (!items.length) {
      return NextResponse.json({ error: 'Player not found on ESPN', athlete: null, stats: null })
    }

    const athleteId = items[0].id

    // Step 2: Get full athlete profile
    const profileUrl = `https://site.api.espn.com/apis/site/v2/sports/${leaguePath}/athletes/${athleteId}`
    const profileRes = await fetch(profileUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0', 'Accept': 'application/json' },
      next: { revalidate: 86400 },
    })

    let athlete = null
    if (profileRes.ok) {
      const profileData = await profileRes.json()
      athlete = profileData.athlete || profileData
    }

    // Step 3: Attempt to get career statistics
    let stats = null
    try {
      const statsUrl = `https://site.api.espn.com/apis/site/v2/sports/${leaguePath}/athletes/${athleteId}/statistics`
      const statsRes = await fetch(statsUrl, {
        headers: { 'User-Agent': 'Mozilla/5.0', 'Accept': 'application/json' },
        next: { revalidate: 86400 },
      })
      if (statsRes.ok) {
        stats = await statsRes.json()
      }
    } catch {
      // Stats not available — not an error
    }

    return NextResponse.json({ athlete, stats, athleteId })
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch player data', athlete: null, stats: null })
  }
}
