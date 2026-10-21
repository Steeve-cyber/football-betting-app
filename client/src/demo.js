// Mode démo : génère des matchs et des cotes réalistes, au même format que The Odds API.
// Les matchs sont stables dans la journée ; les cotes bougent légèrement toutes les minutes
// (ce qui fait apparaître les flèches ▲▼ lors des actualisations).
const EQUIPES = {
  soccer_epl: ['Manchester City', 'Arsenal', 'Liverpool', 'Chelsea', 'Tottenham Hotspur', 'Manchester United', 'Newcastle United', 'Aston Villa', 'Brighton and Hove Albion', 'West Ham United', 'Brentford', 'Everton'],
  soccer_france_ligue_one: ['Paris Saint Germain', 'Marseille', 'Monaco', 'Lille', 'Lyon', 'Nice', 'Lens', 'Rennes', 'Strasbourg', 'Nantes', 'Toulouse', 'Reims'],
  soccer_spain_la_liga: ['Real Madrid', 'Barcelona', 'Atlético Madrid', 'Real Sociedad', 'Athletic Bilbao', 'Villarreal', 'Real Betis', 'Sevilla', 'Valencia', 'Getafe', 'Osasuna', 'Celta Vigo'],
  soccer_italy_serie_a: ['Inter Milan', 'AC Milan', 'Juventus', 'Napoli', 'AS Roma', 'Atalanta', 'Lazio', 'Fiorentina', 'Bologna', 'Torino', 'Udinese', 'Genoa'],
  soccer_germany_bundesliga: ['Bayern Munich', 'Bayer Leverkusen', 'Borussia Dortmund', 'RB Leipzig', 'Eintracht Frankfurt', 'VfB Stuttgart', 'SC Freiburg', 'VfL Wolfsburg', 'Hoffenheim', 'Werder Bremen', 'Mainz 05', 'FC Augsburg'],
  soccer_uefa_champs_league: ['Real Madrid', 'Manchester City', 'Bayern Munich', 'Paris Saint Germain', 'Barcelona', 'Inter Milan', 'Arsenal', 'Liverpool', 'Borussia Dortmund', 'Atlético Madrid', 'Juventus', 'Benfica'],
}

const BOOKS = [
  ['bet365', 'Bet365', 0.055], ['unibet', 'Unibet', 0.06], ['betclic', 'Betclic', 0.065], ['winamax', 'Winamax', 0.058],
  ['pinnacle', 'Pinnacle', 0.025], ['williamhill', 'William Hill', 0.07], ['bwin', 'Bwin', 0.068], ['onexbet', '1xBet', 0.05],
]

const hash = (s) => [...s].reduce((h, c) => Math.imul(h ^ c.charCodeAt(0), 16777619) >>> 0, 2166136261)
const generateur = (graine) => () => {
  graine = (graine + 0x6d2b79f5) | 0
  let t = Math.imul(graine ^ (graine >>> 15), 1 | graine)
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296
}

export function genererDemo(ligue, maintenant = Date.now()) {
  const equipes = EQUIPES[ligue] || EQUIPES.soccer_epl
  const minuit = new Date(maintenant)
  minuit.setHours(0, 0, 0, 0)
  const jourCle = `${minuit.getFullYear()}-${minuit.getMonth() + 1}-${minuit.getDate()}`
  const rnd = generateur(hash(`${ligue}-${jourCle}`))
  const ordre = equipes.map((e) => ({ e, r: rnd() })).sort((a, b) => a.r - b.r).map((x) => x.e)
  const force = (nom) => 1 - equipes.indexOf(nom) * 0.055
  const creneaux = [[15, 0], [17, 30], [20, 45]]
  const minute = Math.floor(maintenant / 60000)

  return Array.from({ length: 6 }, (_, i) => {
    const dom = ordre[2 * i], ext = ordre[2 * i + 1]
    const debut = new Date(minuit)
    debut.setDate(debut.getDate() + Math.floor(i / 3))
    debut.setHours(...creneaux[i % 3])
    if (debut.getTime() < maintenant + 20 * 60000) debut.setDate(debut.getDate() + 1)

    const ph = (force(dom) * 1.12) / (force(dom) * 1.12 + force(ext))
    const pn = 0.29 - 0.14 * Math.abs(ph - 0.5) * 2
    const proba = [(1 - pn) * ph, pn, (1 - pn) * (1 - ph)]
    const id = `demo-${ligue}-${jourCle}-${i}`
    const aleaMatch = generateur(hash(id))

    const bookmakers = BOOKS.map(([key, title, marge]) => {
      const bruit = generateur(hash(`${id}-${key}-${minute}`))
      return {
        key, title,
        markets: [{
          key: 'h2h',
          outcomes: [dom, 'Draw', ext].map((name, k) => {
            const stable = 1 + (aleaMatch() - 0.5) * 0.07
            const derive = 1 + (bruit() - 0.5) * 0.03
            return { name, price: Math.max(1.01, +((1 / (proba[k] * (1 + marge))) * stable * derive).toFixed(2)) }
          }),
        }],
      }
    })

    // Un bookmaker "généreux" sur un match sur trois : de quoi faire apparaître des cotes avantageuses
    if (i % 3 === 0) {
      const b = bookmakers[Math.floor(aleaMatch() * bookmakers.length)]
      const o = b.markets[0].outcomes[Math.floor(aleaMatch() * 3)]
      o.price = +(o.price * 1.12).toFixed(2)
    }

    return { id, sport_key: ligue, commence_time: debut.toISOString(), home_team: dom, away_team: ext, bookmakers }
  })
}
