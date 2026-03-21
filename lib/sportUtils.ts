// ─── Team name → ESPN abbreviation maps ────────────────────────────────────

const NBA_ABBR: Record<string, string> = {
  // Full names
  'Atlanta Hawks': 'atl', 'Boston Celtics': 'bos', 'Brooklyn Nets': 'bkn',
  'Charlotte Hornets': 'cha', 'Chicago Bulls': 'chi', 'Cleveland Cavaliers': 'cle',
  'Dallas Mavericks': 'dal', 'Denver Nuggets': 'den', 'Detroit Pistons': 'det',
  'Golden State Warriors': 'gsw', 'Houston Rockets': 'hou', 'Indiana Pacers': 'ind',
  'LA Clippers': 'lac', 'Los Angeles Clippers': 'lac', 'Los Angeles Lakers': 'lal',
  'Memphis Grizzlies': 'mem', 'Miami Heat': 'mia', 'Milwaukee Bucks': 'mil',
  'Minnesota Timberwolves': 'min', 'New Orleans Pelicans': 'no', 'New York Knicks': 'nyk',
  'Oklahoma City Thunder': 'okc', 'Orlando Magic': 'orl', 'Philadelphia 76ers': 'phi',
  'Phoenix Suns': 'phx', 'Portland Trail Blazers': 'por', 'Sacramento Kings': 'sac',
  'San Antonio Spurs': 'sas', 'Toronto Raptors': 'tor', 'Utah Jazz': 'utah',
  'Washington Wizards': 'wsh',
  // Historical
  'Seattle SuperSonics': 'okc', 'New Jersey Nets': 'bkn', 'Vancouver Grizzlies': 'mem',
  'Charlotte Bobcats': 'cha', 'New Orleans Hornets': 'no', 'New Orleans/Oklahoma City Hornets': 'no',
  // Short names
  'Hawks': 'atl', 'Celtics': 'bos', 'Nets': 'bkn', 'Hornets': 'cha',
  'Bulls': 'chi', 'Cavaliers': 'cle', 'Mavericks': 'dal', 'Nuggets': 'den',
  'Pistons': 'det', 'Warriors': 'gsw', 'Rockets': 'hou', 'Pacers': 'ind',
  'Clippers': 'lac', 'Lakers': 'lal', 'Grizzlies': 'mem', 'Heat': 'mia',
  'Bucks': 'mil', 'Timberwolves': 'min', 'Pelicans': 'no', 'Knicks': 'nyk',
  'Thunder': 'okc', 'Magic': 'orl', '76ers': 'phi', 'Suns': 'phx',
  'Trail Blazers': 'por', 'Blazers': 'por', 'Kings': 'sac', 'Spurs': 'sas',
  'Raptors': 'tor', 'Jazz': 'utah', 'Wizards': 'wsh', 'SuperSonics': 'okc',
}

const NFL_ABBR: Record<string, string> = {
  'Arizona Cardinals': 'ari', 'Atlanta Falcons': 'atl', 'Baltimore Ravens': 'bal',
  'Buffalo Bills': 'buf', 'Carolina Panthers': 'car', 'Chicago Bears': 'chi',
  'Cincinnati Bengals': 'cin', 'Cleveland Browns': 'cle', 'Dallas Cowboys': 'dal',
  'Denver Broncos': 'den', 'Detroit Lions': 'det', 'Green Bay Packers': 'gb',
  'Houston Texans': 'hou', 'Indianapolis Colts': 'ind', 'Jacksonville Jaguars': 'jax',
  'Kansas City Chiefs': 'kc', 'Las Vegas Raiders': 'lv', 'Los Angeles Chargers': 'lac',
  'Los Angeles Rams': 'lar', 'Miami Dolphins': 'mia', 'Minnesota Vikings': 'min',
  'New England Patriots': 'ne', 'New Orleans Saints': 'no', 'New York Giants': 'nyg',
  'New York Jets': 'nyj', 'Philadelphia Eagles': 'phi', 'Pittsburgh Steelers': 'pit',
  'San Francisco 49ers': 'sf', 'Seattle Seahawks': 'sea', 'Tampa Bay Buccaneers': 'tb',
  'Tennessee Titans': 'ten', 'Washington Commanders': 'wsh', 'Washington Football Team': 'wsh',
  'Oakland Raiders': 'lv', 'San Diego Chargers': 'lac', 'St. Louis Rams': 'lar',
  // Short names
  'Cardinals': 'ari', 'Falcons': 'atl', 'Ravens': 'bal', 'Bills': 'buf',
  'Panthers': 'car', 'Bears': 'chi', 'Bengals': 'cin', 'Browns': 'cle',
  'Cowboys': 'dal', 'Broncos': 'den', 'Lions': 'det', 'Packers': 'gb',
  'Texans': 'hou', 'Colts': 'ind', 'Jaguars': 'jax', 'Chiefs': 'kc',
  'Raiders': 'lv', 'Chargers': 'lac', 'Rams': 'lar', 'Dolphins': 'mia',
  'Vikings': 'min', 'Patriots': 'ne', 'Saints': 'no', 'Giants': 'nyg',
  'Jets': 'nyj', 'Eagles': 'phi', 'Steelers': 'pit', '49ers': 'sf',
  'Seahawks': 'sea', 'Buccaneers': 'tb', 'Titans': 'ten', 'Commanders': 'wsh',
}

const MLB_ABBR: Record<string, string> = {
  'Arizona Diamondbacks': 'ari', 'Atlanta Braves': 'atl', 'Baltimore Orioles': 'bal',
  'Boston Red Sox': 'bos', 'Chicago Cubs': 'chc', 'Chicago White Sox': 'cws',
  'Cincinnati Reds': 'cin', 'Cleveland Guardians': 'cle', 'Cleveland Indians': 'cle',
  'Colorado Rockies': 'col', 'Detroit Tigers': 'det', 'Houston Astros': 'hou',
  'Kansas City Royals': 'kc', 'Los Angeles Angels': 'laa', 'Los Angeles Dodgers': 'lad',
  'Miami Marlins': 'mia', 'Milwaukee Brewers': 'mil', 'Minnesota Twins': 'min',
  'New York Mets': 'nym', 'New York Yankees': 'nyy', 'Oakland Athletics': 'oak',
  'Philadelphia Phillies': 'phi', 'Pittsburgh Pirates': 'pit', 'San Diego Padres': 'sd',
  'San Francisco Giants': 'sf', 'Seattle Mariners': 'sea', 'St. Louis Cardinals': 'stl',
  'Tampa Bay Rays': 'tb', 'Texas Rangers': 'tex', 'Toronto Blue Jays': 'tor',
  'Washington Nationals': 'wsh',
  // Short
  'Diamondbacks': 'ari', 'Braves': 'atl', 'Orioles': 'bal', 'Red Sox': 'bos',
  'Cubs': 'chc', 'White Sox': 'cws', 'Reds': 'cin', 'Guardians': 'cle',
  'Indians': 'cle', 'Rockies': 'col', 'Tigers': 'det', 'Astros': 'hou',
  'Royals': 'kc', 'Angels': 'laa', 'Dodgers': 'lad', 'Marlins': 'mia',
  'Brewers': 'mil', 'Twins': 'min', 'Mets': 'nym', 'Yankees': 'nyy',
  'Athletics': 'oak', 'Phillies': 'phi', 'Pirates': 'pit', 'Padres': 'sd',
  'Mariners': 'sea', 'Cardinals': 'stl', 'Rays': 'tb', 'Rangers': 'tex',
  'Blue Jays': 'tor', 'Nationals': 'wsh',
}

const NHL_ABBR: Record<string, string> = {
  'Anaheim Ducks': 'ana', 'Arizona Coyotes': 'ari', 'Boston Bruins': 'bos',
  'Buffalo Sabres': 'buf', 'Calgary Flames': 'cgy', 'Carolina Hurricanes': 'car',
  'Chicago Blackhawks': 'chi', 'Colorado Avalanche': 'col', 'Columbus Blue Jackets': 'cbj',
  'Dallas Stars': 'dal', 'Detroit Red Wings': 'det', 'Edmonton Oilers': 'edm',
  'Florida Panthers': 'fla', 'Los Angeles Kings': 'lak', 'Minnesota Wild': 'min',
  'Montreal Canadiens': 'mtl', 'Nashville Predators': 'nsh', 'New Jersey Devils': 'njd',
  'New York Islanders': 'nyi', 'New York Rangers': 'nyr', 'Ottawa Senators': 'ott',
  'Philadelphia Flyers': 'phi', 'Pittsburgh Penguins': 'pit', 'San Jose Sharks': 'sjs',
  'Seattle Kraken': 'sea', 'St. Louis Blues': 'stl', 'Tampa Bay Lightning': 'tbl',
  'Toronto Maple Leafs': 'tor', 'Vancouver Canucks': 'van', 'Vegas Golden Knights': 'vgk',
  'Washington Capitals': 'wsh', 'Winnipeg Jets': 'wpg',
  // Short
  'Ducks': 'ana', 'Coyotes': 'ari', 'Bruins': 'bos', 'Sabres': 'buf',
  'Flames': 'cgy', 'Hurricanes': 'car', 'Blackhawks': 'chi', 'Avalanche': 'col',
  'Blue Jackets': 'cbj', 'Stars': 'dal', 'Red Wings': 'det', 'Oilers': 'edm',
  'Sharks': 'sjs', 'Kraken': 'sea', 'Blues': 'stl', 'Lightning': 'tbl',
  'Maple Leafs': 'tor', 'Canucks': 'van', 'Golden Knights': 'vgk', 'Capitals': 'wsh',
}

// ─── BBRef home team abbreviations (for box score URLs) ────────────────────

const NBA_BBREF_ABBR: Record<string, string> = {
  'Hawks': 'ATL', 'Celtics': 'BOS', 'Nets': 'BKN', 'Hornets': 'CHA',
  'Bulls': 'CHI', 'Cavaliers': 'CLE', 'Mavericks': 'DAL', 'Nuggets': 'DEN',
  'Pistons': 'DET', 'Warriors': 'GSW', 'Rockets': 'HOU', 'Pacers': 'IND',
  'Clippers': 'LAC', 'Lakers': 'LAL', 'Grizzlies': 'MEM', 'Heat': 'MIA',
  'Bucks': 'MIL', 'Timberwolves': 'MIN', 'Pelicans': 'NOP', 'Knicks': 'NYK',
  'Thunder': 'OKC', 'Magic': 'ORL', '76ers': 'PHI', 'Suns': 'PHO',
  'Trail Blazers': 'POR', 'Blazers': 'POR', 'Kings': 'SAC', 'Spurs': 'SAS',
  'Raptors': 'TOR', 'Jazz': 'UTA', 'Wizards': 'WAS', 'SuperSonics': 'SEA',
  // full names
  'Atlanta Hawks': 'ATL', 'Boston Celtics': 'BOS', 'Brooklyn Nets': 'BKN',
  'Charlotte Hornets': 'CHA', 'Chicago Bulls': 'CHI', 'Cleveland Cavaliers': 'CLE',
  'Dallas Mavericks': 'DAL', 'Denver Nuggets': 'DEN', 'Detroit Pistons': 'DET',
  'Golden State Warriors': 'GSW', 'Houston Rockets': 'HOU', 'Indiana Pacers': 'IND',
  'Los Angeles Clippers': 'LAC', 'Los Angeles Lakers': 'LAL', 'Memphis Grizzlies': 'MEM',
  'Miami Heat': 'MIA', 'Milwaukee Bucks': 'MIL', 'Minnesota Timberwolves': 'MIN',
  'New Orleans Pelicans': 'NOP', 'New York Knicks': 'NYK', 'Oklahoma City Thunder': 'OKC',
  'Orlando Magic': 'ORL', 'Philadelphia 76ers': 'PHI', 'Phoenix Suns': 'PHO',
  'Portland Trail Blazers': 'POR', 'Sacramento Kings': 'SAC', 'San Antonio Spurs': 'SAS',
  'Toronto Raptors': 'TOR', 'Utah Jazz': 'UTA', 'Washington Wizards': 'WAS',
  'Seattle SuperSonics': 'SEA', 'New Jersey Nets': 'NJN',
}

// ─── Public helpers ─────────────────────────────────────────────────────────

export function getTeamLogoUrl(teamName: string, sport: string): string {
  const s = sport.toUpperCase()
  let abbr: string | undefined

  if (s === 'NBA') abbr = NBA_ABBR[teamName]
  else if (s === 'NFL') abbr = NFL_ABBR[teamName]
  else if (s === 'MLB') abbr = MLB_ABBR[teamName]
  else if (s === 'NHL') abbr = NHL_ABBR[teamName]

  if (!abbr) return ''

  const leagueMap: Record<string, string> = {
    NBA: 'nba', NFL: 'nfl', MLB: 'mlb', NHL: 'nhl',
  }
  const league = leagueMap[s] || s.toLowerCase()
  return `https://a.espncdn.com/i/teamlogos/${league}/500/${abbr}.png`
}

/** Generate a Basketball Reference player ID from a full name.
 *  Format: first-5-chars-of-lastname + first-2-chars-of-firstname + 01
 */
export function getBBRefPlayerId(fullName: string): string {
  const parts = fullName.trim().split(/\s+/)
  if (parts.length < 2) return ''
  const firstName = parts[0].replace(/[^a-zA-Z]/g, '').toLowerCase()
  const lastName = parts.slice(1).join('').replace(/[^a-zA-Z]/g, '').toLowerCase()
  const lastPart = lastName.substring(0, 5)
  const firstPart = firstName.substring(0, 2)
  return `${lastPart}${firstPart}01`
}

/** Basketball Reference headshot URL (NBA only) */
export function getPlayerHeadshotUrl(fullName: string, sport: string): string {
  if (sport !== 'NBA') return ''
  const id = getBBRefPlayerId(fullName)
  if (!id) return ''
  return `https://www.basketball-reference.com/req/202106291/images/players/${id}.jpg`
}

/** Full BBRef player page URL */
export function getBBRefPlayerUrl(fullName: string, sport: string): string {
  if (sport !== 'NBA') return ''
  const id = getBBRefPlayerId(fullName)
  if (!id) return ''
  const firstLetter = id.charAt(0)
  return `https://www.basketball-reference.com/players/${firstLetter}/${id}.html`
}

/** BBRef box score URL for NBA games */
export function getBBRefBoxScoreUrl(gameDate: string, homeTeam: string, sport: string): string {
  if (sport !== 'NBA') return ''
  const abbr = NBA_BBREF_ABBR[homeTeam]
  if (!abbr) return ''
  // gameDate is ISO: "2023-06-18" → "20230618"
  const dateStr = gameDate.replace(/-/g, '').substring(0, 8)
  return `https://www.basketball-reference.com/boxscores/${dateStr}0${abbr}.html`
}
