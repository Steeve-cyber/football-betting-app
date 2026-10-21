// Fonctions pures : analyse des cotes, dates, abréviations (aucun affichage ici)
export const CLES = ['dom', 'nul', 'ext']

export const LIGUES = [
  ['soccer_epl', 'Premier League'], ['soccer_france_ligue_one', 'Ligue 1'], ['soccer_spain_la_liga', 'La Liga'],
  ['soccer_italy_serie_a', 'Serie A'], ['soccer_germany_bundesliga', 'Bundesliga'], ['soccer_uefa_champs_league', 'Ligue des champions'],
]

export const abr = (nom) => {
  const m = nom.replace(/\b(FC|AFC|CF|SC|AS|SSC|1\.)\b/gi, '').trim().split(/\s+/)
  return (m.length > 1 ? m.map((w) => w[0]).join('').slice(0, 3) : m[0].slice(0, 3)).toUpperCase()
}

// Couleur de l'écusson, toujours la même pour une équipe donnée
export const teinte = (nom) => [...nom].reduce((h, c) => (h * 31 + c.charCodeAt(0)) % 360, 7)

// Marché 1N2 : meilleures cotes, probabilités sans marge, marge moyenne, écart de valeur
export function analyser(g) {
  const lignes = (g.bookmakers || []).map((b) => {
    const o = b.markets?.find((m) => m.key === 'h2h')?.outcomes || []
    const dom = o.find((x) => x.name === g.home_team)?.price
    const ext = o.find((x) => x.name === g.away_team)?.price
    const nul = o.find((x) => x.name === 'Draw')?.price
    return dom && ext && nul ? { nom: b.title, dom, nul, ext } : null
  }).filter(Boolean)
  if (!lignes.length) return null
  const best = Object.fromEntries(CLES.map((k) => [k, lignes.reduce((m, l) => (l[k] > m[k] ? l : m))]))
  const p = { dom: 0, nul: 0, ext: 0 }
  let marge = 0
  lignes.forEach((l) => {
    const s = CLES.reduce((t, k) => t + 1 / l[k], 0)
    marge += (s - 1) / lignes.length
    CLES.forEach((k) => { p[k] += 1 / l[k] / s / lignes.length })
  })
  const valeur = Object.fromEntries(CLES.map((k) => [k, best[k][k] * p[k] - 1]))
  const pMax = Math.max(...CLES.map((k) => p[k]))
  return { lignes, best, p, marge, valeur, fav: CLES.find((k) => p[k] === pMax), pMax, vMax: Math.max(...CLES.map((k) => valeur[k])) }
}

// Les cotes les plus avantageuses par rapport au consensus du marché
export function opportunites(jouables, analyses, n = 3) {
  const items = []
  jouables.forEach((g) => {
    const a = analyses.get(g.id)
    CLES.forEach((k) => {
      if (a.valeur[k] > 0.03) {
        items.push({
          game: g, k, cote: a.best[k][k], bm: a.best[k].nom, valeur: a.valeur[k], p: a.p[k],
          nom: k === 'dom' ? g.home_team : k === 'ext' ? g.away_team : 'Match nul',
        })
      }
    })
  })
  return items.sort((x, y) => y.valeur - x.valeur).slice(0, n)
}

export const memeJour = (a, b) => a.toDateString() === b.toDateString()

export function statut(debut, now) {
  const d = debut - now
  if (d < 0) return { texte: 'En cours', live: d > -108e5 }
  const h = Math.floor(d / 36e5), m = Math.floor((d % 36e5) / 6e4)
  if (d < 864e5) return { texte: h > 0 ? `Dans ${h} h ${String(m).padStart(2, '0')}` : `Dans ${m} min`, bientot: h < 3 }
  return { texte: '' }
}

export function jourLabel(date, now) {
  const dem = new Date(now)
  dem.setDate(dem.getDate() + 1)
  if (memeJour(date, new Date(now))) return "Aujourd'hui"
  if (memeJour(date, dem)) return 'Demain'
  return date.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'short' })
}

export const heure = (d) => d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })

export const ilYa = (ts, now) => {
  const s = Math.max(0, Math.round((now - ts) / 1000))
  return s < 45 ? "à l'instant" : `il y a ${Math.round(s / 60) || 1} min`
}
