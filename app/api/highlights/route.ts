import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const home = searchParams.get('home') || ''
  const away = searchParams.get('away') || ''
  const sport = searchParams.get('sport') || 'NBA'

  const query = encodeURIComponent(`${home} vs ${away} highlights ${sport}`)

  try {
    const res = await fetch(`https://www.youtube.com/results?search_query=${query}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
      next: { revalidate: 3600 },
    })

    const html = await res.text()

    // Extract ytInitialData from the page script
    const marker = 'var ytInitialData = '
    const start = html.indexOf(marker)
    if (start === -1) return NextResponse.json({ videoId: null })

    const jsonStart = start + marker.length
    const jsonEnd = html.indexOf(';</script>', jsonStart)
    if (jsonEnd === -1) return NextResponse.json({ videoId: null })

    const data = JSON.parse(html.slice(jsonStart, jsonEnd))

    const sections =
      data?.contents?.twoColumnSearchResultsRenderer?.primaryContents
        ?.sectionListRenderer?.contents || []

    for (const section of sections) {
      const items = section?.itemSectionRenderer?.contents || []
      for (const item of items) {
        const videoId = item?.videoRenderer?.videoId
        if (videoId) {
          return NextResponse.json({ videoId })
        }
      }
    }

    return NextResponse.json({ videoId: null })
  } catch {
    return NextResponse.json({ videoId: null })
  }
}
