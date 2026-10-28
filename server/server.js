import 'dotenv/config';
import express from 'express';

const app = express();
app.disable('x-powered-by');
const PORT = Number(process.env.PORT) || 3001;
const TTL = 5 * 60 * 1000;
const LEAGUES = new Set([
  'soccer_epl','soccer_france_ligue_one','soccer_spain_la_liga','soccer_italy_serie_a',
  'soccer_germany_bundesliga','soccer_uefa_champs_league','soccer_netherlands_eredivisie',
  'soccer_portugal_primeira_liga','soccer_usa_mls','soccer_brazil_campeonato',
  'soccer_turkey_super_league','soccer_argentina_primera_division','soccer_australia_aleague','soccer_spl',
]);
const cache = new Map();
const pending = new Map();

app.get('/health', (_req, res) => res.json({ status: 'ok', leagues: LEAGUES.size }));
app.get('/odds', async (req, res) => {
  const league = req.query.league;
  if (typeof league !== 'string' || !LEAGUES.has(league)) return res.status(400).json({ error: 'Championnat inconnu.' });
  const cached = cache.get(league);
  if (cached && Date.now() - cached.savedAt < TTL) {
    res.set('X-Data-Source', 'cache');
    return res.json(cached.data);
  }
  if (!process.env.ODDS_API_KEY) {
    if (cached) { res.set('X-Data-Source', 'stale'); return res.json(cached.data); }
    return res.status(503).json({ error: 'Configurez ODDS_API_KEY dans server/.env pour activer les cotes fournisseur.' });
  }
  try {
    let request = pending.get(league);
    if (!request) {
      request = (async () => {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 12000);
        try {
          const url = new URL('https://api.the-odds-api.com/v4/sports/' + league + '/odds/');
          url.search = new URLSearchParams({ regions: 'eu', markets: 'h2h', oddsFormat: 'decimal', apiKey: process.env.ODDS_API_KEY });
          const response = await fetch(url, { signal: controller.signal });
          if (!response.ok) {
            const error = new Error(response.status === 401 ? 'Clé fournisseur invalide.' : response.status === 429 ? 'Quota fournisseur atteint.' : 'Fournisseur de cotes indisponible.');
            error.status = response.status === 401 ? 401 : response.status === 429 ? 429 : 502;
            throw error;
          }
          const data = await response.json();
          cache.set(league, { savedAt: Date.now(), data });
          return data;
        } finally { clearTimeout(timer); }
      })();
      pending.set(league, request);
    }
    const data = await request;
    res.set('X-Data-Source', 'live');
    return res.json(data);
  } catch (error) {
    if (cached) { res.set('X-Data-Source', 'stale'); return res.json(cached.data); }
    return res.status(error.status || (error.name === 'AbortError' ? 504 : 502))
      .json({ error: error.name === 'AbortError' ? 'Le fournisseur met trop de temps à répondre.' : error.message });
  } finally { pending.delete(league); }
});
app.listen(PORT, '127.0.0.1', () => console.log('BET-APP FOOT API sur http://127.0.0.1:' + PORT));
