import { NextResponse } from 'next/server'

const LEAGUE_PATHS: Record<string, string> = {
  NBA: 'basketball/nba',
  NFL: 'football/nfl',
  MLB: 'baseball/mlb',
  NHL: 'hockey/nhl',
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const date = searchParams.get('date') || ''    // YYYY-MM-DD
  const homeTeam = searchParams.get('home') || ''
  const awayTeam = searchParams.get('away') || ''
  const sport = searchParams.get('sport') || 'NBA'

  const leaguePath = LEAGUE_PATHS[sport]
  if (!leaguePath) {
    return NextResponse.json({ error: 'Unsupported sport' })
  }

  // ESPN date format: YYYYMMDD
  const espnDate = date.replace(/-/g, '')

  const headers = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    'Accept': 'application/json',
  }

  try {
    // Step 1: Get scoreboard for the date
    const scoreboardUrl = `https://site.api.espn.com/apis/site/v2/sports/${leaguePath}/scoreboard?dates=${espnDate}&limit=20`
    const scoreboardRes = await fetch(scoreboardUrl, { headers, next: { revalidate: 86400 } })

    if (!scoreboardRes.ok) {
      return NextResponse.json({ error: 'ESPN scoreboard unavailable' })
    }

    const scoreboardData = await scoreboardRes.json()
    const events: any[] = scoreboardData.events || []

    if (!events.length) {
      return NextResponse.json({ error: 'No games found on this date' })
    }

    // Step 2: Find the matching event by team name
    const normalize = (s: string) => s.toLowerCase().trim()
    const homeWords = homeTeam.toLowerCase().split(' ')
    const awayWords = awayTeam.toLowerCase().split(' ')

    const matchingEvent = events.find((event: any) => {
      const competitors: any[] = event.competitions?.[0]?.competitors || []
      const teamNames = competitors.map((c: any) => normalize(c.team?.displayName || c.team?.shortDisplayName || ''))
      const teamAbbrs = competitors.map((c: any) => normalize(c.team?.abbreviation || ''))
      const allTeamText = [...teamNames, ...teamAbbrs].join(' ')
      const homeMatch = homeWords.some(w => w.length > 3 && allTeamText.includes(w))
      const awayMatch = awayWords.some(w => w.length > 3 && allTeamText.includes(w))
      return homeMatch || awayMatch
    })

    if (!matchingEvent) {
      return NextResponse.json({ error: 'Game not found in ESPN data for this date' })
    }

    // Step 3: Get full event summary (box score)
    const summaryUrl = `https://site.api.espn.com/apis/site/v2/sports/${leaguePath}/summary?event=${matchingEvent.id}`
    const summaryRes = await fetch(summaryUrl, { headers, next: { revalidate: 86400 } })

    if (!summaryRes.ok) {
      return NextResponse.json({ event: matchingEvent, summary: null })
    }

    const summary = await summaryRes.json()
    return NextResponse.json({ event: matchingEvent, summary })
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch box score data' })
  }
}
