import 'dotenv/config';
import express from 'express';

const app = express();
const LIGUES = ['soccer_epl', 'soccer_france_ligue_one', 'soccer_spain_la_liga', 'soccer_italy_serie_a', 'soccer_germany_bundesliga', 'soccer_uefa_champs_league'];
const TTL = 5 * 60 * 1000;
const cache = new Map();

app.get('/odds', async (req, res) => {
  const ligue = req.query.league;
  if (!LIGUES.includes(ligue)) return res.status(400).json({ error: 'Championnat inconnu.' });
  const hit = cache.get(ligue);
  if (hit && Date.now() - hit.t < TTL) return res.json(hit.data);
  if (!process.env.ODDS_API_KEY) return res.status(500).json({ error: 'Clé ODDS_API_KEY manquante dans le fichier .env.' });
  try {
    const url = `https://api.the-odds-api.com/v4/sports/${ligue}/odds/?regions=eu&markets=h2h&oddsFormat=decimal&apiKey=${process.env.ODDS_API_KEY}`;
    const r = await fetch(url);
    if (!r.ok) throw new Error(r.status === 401 ? 'Clé API invalide.' : r.status === 429 ? "Quota de l'API atteint pour aujourd'hui." : 'Fournisseur de cotes indisponible.');
    const data = await r.json();
    cache.set(ligue, { t: Date.now(), data });
    res.json(data);
  } catch (e) {
    if (hit) return res.json(hit.data); // en cas de panne, on sert la dernière version connue
    res.status(502).json({ error: e.message });
  }
});

app.listen(3001, () => console.log('API cotes sur http://localhost:3001'));