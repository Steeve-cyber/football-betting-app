import { useEffect, useMemo, useState } from "react";
import { genererDemo } from "./demo";
import "./App.css";

const LEAGUES = [
  ["soccer_epl", "Premier League", "Angleterre", "🏴"],
  ["soccer_france_ligue_one", "Ligue 1", "France", "🇫🇷"],
  ["soccer_spain_la_liga", "LaLiga", "Espagne", "🇪🇸"],
  ["soccer_italy_serie_a", "Serie A", "Italie", "🇮🇹"],
  ["soccer_germany_bundesliga", "Bundesliga", "Allemagne", "🇩🇪"],
  ["soccer_uefa_champs_league", "Ligue des champions", "Europe", "✦"],
  ["soccer_netherlands_eredivisie", "Eredivisie", "Pays-Bas", "🇳🇱"],
  ["soccer_portugal_primeira_liga", "Liga Portugal", "Portugal", "🇵🇹"],
  ["soccer_usa_mls", "Major League Soccer", "États-Unis", "🇺🇸"],
  ["soccer_brazil_campeonato", "Brasileirão", "Brésil", "🇧🇷"],
  ["soccer_turkey_super_league", "Süper Lig", "Turquie", "🇹🇷"],
  ["soccer_argentina_primera_division", "Liga Profesional", "Argentine", "🇦🇷"],
  ["soccer_australia_aleague", "A-League", "Australie", "🇦🇺"],
  ["soccer_spl", "Scottish Premiership", "Écosse", "🏴"],
].map(([id, name, country, flag]) => ({ id, name, country, flag }));
const LABEL = { "1": "Victoire domicile", N: "Match nul", "2": "Victoire extérieur" };
const fmt = (value) => new Intl.NumberFormat("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);
const euros = (value) => new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(value);
function initials(name) {
  const words = name.replace(/[^A-Za-zÀ-ÿ0-9 ]/g, "").trim().split(/\s+/).filter(Boolean);
  return words.length < 2 ? words[0].slice(0, 2).toUpperCase() : (words[0][0] + words[words.length - 1][0]).toUpperCase();
}
function normalize(raw, league) {
  const options = [["1", raw.home_team], ["N", "Draw"], ["2", raw.away_team]];
  const odds = Object.fromEntries(options.map(([key, name]) => {
    const offers = (raw.bookmakers || []).flatMap((book) => {
      const market = (book.markets || []).find((item) => item.key === "h2h");
      const outcome = market && (market.outcomes || []).find((item) => item.name === name);
      return outcome ? [{ price: Number(outcome.price), book: book.title || "Marché" }] : [];
    }).filter((offer) => Number.isFinite(offer.price)).sort((a, b) => b.price - a.price);
    const average = offers.length ? offers.reduce((sum, offer) => sum + offer.price, 0) / offers.length : 0;
    return [key, offers[0] ? { ...offers[0], advantage: average ? (offers[0].price / average - 1) * 100 : 0 } : null];
  }));
  if (Object.values(odds).some((odd) => !odd)) return null;
  return { id: String(raw.id), home: raw.home_team, away: raw.away_team, kickoff: raw.commence_time, odds, league: league.name, leagueId: league.id, country: league.country, flag: league.flag };
}
const demo = (league) => genererDemo(league.id).map((game) => normalize(game, league)).filter(Boolean);

function Emblem({ small = false }) {
  return <span className={"emblem" + (small ? " emblem-small" : "")} aria-hidden="true"><svg viewBox="0 0 56 56">
    <defs><linearGradient id="emblem-gold" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#fff0b1"/><stop offset=".5" stopColor="#e7bd62"/><stop offset="1" stopColor="#9d6828"/></linearGradient></defs>
    <circle cx="28" cy="17" r="12" fill="#15251c" stroke="url(#emblem-gold)" strokeWidth="2"/>
    <path d="m28 8 2.8 5.5 6.1.9-4.4 4.3 1 6.1-5.5-2.9-5.5 2.9 1-6.1-4.4-4.3 6.1-.9L28 8Z" fill="url(#emblem-gold)"/>
    <path d="M14 27h28l-2.5 9.5a12 12 0 0 1-9.5 8.8V49h8v3H18v-3h8v-2.7a12 12 0 0 1-9.5-8.8L14 27Z" fill="url(#emblem-gold)"/>
    <path d="M14 30H8v3a8 8 0 0 0 8 8m26-11h6v3a8 8 0 0 1-8 8" fill="none" stroke="url(#emblem-gold)" strokeWidth="2.5" strokeLinecap="round"/>
  </svg></span>;
}
function ClubMark({ name }) {
  const color = [...name].reduce((sum, char) => (sum * 31 + char.charCodeAt(0)) % 360, 0);
  return <span className="club-mark" style={{ "--club-hue": color }} aria-hidden="true">{initials(name)}</span>;
}

export default function App() {
  const [leagueId, setLeagueId] = useState(LEAGUES[0].id);
  const league = LEAGUES.find((item) => item.id === leagueId) || LEAGUES[0];
  const [matches, setMatches] = useState(() => demo(LEAGUES[0]));
  const [source, setSource] = useState("demo");
  const [loading, setLoading] = useState(false);
  const [updatedAt, setUpdatedAt] = useState(new Date());
  const [refreshKey, setRefreshKey] = useState(0);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [stake, setStake] = useState(10);
  const [picks, setPicks] = useState([]);
  const [message, setMessage] = useState("");
  const [favorites, setFavorites] = useState(() => {
    try { return JSON.parse(localStorage.getItem("bet-app-foot-favorites") || "[]"); } catch { return []; }
  });

  useEffect(() => { try { localStorage.setItem("bet-app-foot-favorites", JSON.stringify(favorites)); } catch {} }, [favorites]);
  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    setLoading(true);
    fetch("/odds?league=" + encodeURIComponent(leagueId), { signal: controller.signal })
      .then(async (response) => {
        const body = await response.json();
        if (!response.ok) throw new Error(body.error || "Flux indisponible");
        return Array.isArray(body) ? body.map((item) => normalize(item, league)).filter(Boolean) : [];
      })
      .then((data) => { if (active) { setMatches(data.length ? data : demo(league)); setSource(data.length ? "live" : "demo"); } })
      .catch((error) => { if (active && error.name !== "AbortError") { setMatches(demo(league)); setSource("demo"); } })
      .finally(() => { if (active) { setUpdatedAt(new Date()); setLoading(false); } });
    return () => { active = false; controller.abort(); };
  }, [leagueId, refreshKey]);
  useEffect(() => {
    if (!message) return undefined;
    const timer = setTimeout(() => setMessage(""), 3200);
    return () => clearTimeout(timer);
  }, [message]);

  const visible = useMemo(() => {
    const today = new Date().toDateString();
    const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1);
    const term = search.trim().toLocaleLowerCase("fr");
    return matches.filter((match) => {
      const text = (match.home + " " + match.away + " " + match.league).toLocaleLowerCase("fr");
      const day = new Date(match.kickoff).toDateString();
      const dateOk = dateFilter === "all" || (dateFilter === "today" && day === today) || (dateFilter === "tomorrow" && day === tomorrow.toDateString());
      const favoriteOk = filter !== "favorites" || favorites.includes(match.id);
      const valueOk = filter !== "value" || Object.values(match.odds).some((odd) => odd && odd.advantage >= 1.5);
      return dateOk && favoriteOk && valueOk && text.includes(term);
    }).sort((a, b) => new Date(a.kickoff) - new Date(b.kickoff));
  }, [matches, search, filter, dateFilter, favorites]);

  const combo = picks.reduce((value, pick) => value * pick.price, 1);
  const wager = Number(stake) || 0;
  const payout = picks.length ? combo * wager : 0;
  const time = new Intl.DateTimeFormat("fr-FR", { hour: "2-digit", minute: "2-digit" }).format(updatedAt);
  const valueCount = matches.filter((match) => Object.values(match.odds).some((odd) => odd && odd.advantage >= 1.5)).length;
  const toggleFavorite = (id) => setFavorites((old) => old.includes(id) ? old.filter((item) => item !== id) : [...old, id]);
  function choose(match, key) {
    const odd = match.odds[key];
    setPicks((old) => {
      if (old.some((pick) => pick.matchId === match.id && pick.key === key)) return old.filter((pick) => pick.matchId !== match.id);
      const next = { matchId: match.id, name: match.home + " – " + match.away, home: match.home, away: match.away, key, label: LABEL[key], price: odd.price, book: odd.book };
      return [...old.filter((pick) => pick.matchId !== match.id), next];
    });
  }
  function scrollCoupon() { document.getElementById("coupon")?.scrollIntoView({ behavior: "smooth", block: "center" }); }
  function simulate() {
    if (!picks.length || wager <= 0) return;
    setPicks([]);
    setMessage("Coupon démo enregistré : aucune mise réelle n’a été envoyée.");
  }

  return <div className="app-shell">
    <header className="topbar">
      <a className="brand" href="#home"><Emblem/><span>BET-APP <b>FOOT</b></span></a>
      <nav aria-label="Navigation principale"><a className="nav-active" href="#matchs">Les matchs</a><a href="#comparateur">Comparateur</a><a href="#about">Le projet</a></nav>
      <div className="top-actions"><span className={"source-pill " + (source === "live" ? "is-live" : "")}><i/>{source === "live" ? "Flux connecté" : "Mode démo"}</span><button onClick={scrollCoupon} type="button">Mon coupon <b>{picks.length}</b></button></div>
    </header>

    <main id="home" className="page">
      <section className="hero">
        <div className="hero-copy"><div className="eyebrow"><i/>LE FOOTBALL, CÔTÉ MARCHÉ</div><h1>Le jeu se lit mieux<br/><em>quand tout est clair.</em></h1><p>Explorez les grands championnats, comparez les cotes et composez un coupon dans une expérience pensée pour les passionnés.</p><a className="hero-cta" href="#matchs">Explorer les rencontres <b>↗</b></a><small className="demo-caption"><i/>Démonstration interactive · sans mise réelle</small></div>
        <div className="hero-art" aria-hidden="true"><div className="glow"/><div className="orbit orbit-a"/><div className="orbit orbit-b"/><div className="ball"><span/></div><div className="trophy"><Emblem/></div><div className="est"><small>EST.</small><b>2025</b><small>LE JEU EN GRAND</small></div><div className="hero-stats"><div><b>14</b><span>championnats</span></div><i/><div><b>168</b><span>clubs en démo</span></div><i/><div><b>08</b><span>marchés comparés</span></div></div></div>
      </section>
      <section className="catalog-stats"><div className="catalog-intro"><i>✦</i><div><b>Le football sans frontières</b><small>Des clubs répartis sur quatre continents</small></div></div><div><b>14</b><small>compétitions</small></div><div><b>168</b><small>clubs au catalogue</small></div><div><b>8</b><small>sources en démo</small></div><span><i/> Catalogue démo</span></section>

      <section id="matchs" className="markets">
        <div className="section-head"><div><div className="eyebrow"><i/>CENTRE DE MATCHS</div><h2>Choisissez votre terrain.</h2><p>Les rencontres du moment, les meilleures cotes, réunies au même endroit.</p></div><button className="refresh" type="button" onClick={() => setRefreshKey((n) => n + 1)} disabled={loading}><b className={loading ? "spin" : ""}>↻</b>{loading ? "Actualisation…" : "Actualiser"}</button></div>
        <div className="league-bar"><small>COMPÉTITIONS</small><div>{LEAGUES.map((item) => <button type="button" key={item.id} title={item.country} aria-pressed={item.id === leagueId} className={item.id === leagueId ? "league-active" : ""} onClick={() => { setLeagueId(item.id); setDateFilter("all"); setFilter("all"); }}><span>{item.flag}</span>{item.name}</button>)}</div></div>
        <div className="market-layout"><section className="fixtures">
          <div id="comparateur" className="toolbar"><div className="tabs" role="group" aria-label="Filtrer les matchs"><button className={filter === "all" ? "selected-tab" : ""} onClick={() => setFilter("all")} type="button">Tous <b>{matches.length}</b></button><button className={filter === "favorites" ? "selected-tab" : ""} onClick={() => setFilter("favorites")} type="button">Favoris <b>{favorites.length}</b></button><button className={filter === "value" ? "selected-tab" : ""} onClick={() => setFilter("value")} type="button">Cotes en hausse <b>{valueCount}</b></button></div><label className="search"><span>⌕</span><input aria-label="Rechercher un club" placeholder="Rechercher un club…" value={search} onChange={(event) => setSearch(event.target.value)}/>{search && <button type="button" onClick={() => setSearch("")} aria-label="Effacer">×</button>}</label></div>
          <div className="date-tabs" role="group" aria-label="Filtrer par date">{[["all","Toutes les dates"],["today","Aujourd’hui"],["tomorrow","Demain"]].map(([key,label]) => <button type="button" key={key} className={dateFilter === key ? "date-selected" : ""} onClick={() => setDateFilter(key)}>{label}</button>)}<small>Heure locale · {time}</small></div>
          <div className="list-head"><div><b>{league.flag}</b><p><strong>{league.name}</strong><small>{league.country} · {visible.length} rencontre{visible.length === 1 ? "" : "s"}</small></p></div><div className="legend"><span>1</span><span>N</span><span>2</span><small>RÉSULTAT À 90 MIN</small></div></div>
          <div className="match-list">{visible.map((match,index) => {
            const date = new Date(match.kickoff);
            const day = new Intl.DateTimeFormat("fr-FR", { weekday:"short", day:"2-digit", month:"short" }).format(date);
            const hour = new Intl.DateTimeFormat("fr-FR", { hour:"2-digit", minute:"2-digit" }).format(date);
            const fav = favorites.includes(match.id);
            return <article className="match-card" key={match.id} style={{ "--i": index }}>
              <div className="match-meta"><small>{match.flag} {match.league}</small><div><b>{hour}</b><span>{day}</span></div><button className={fav ? "favorite favorite-on" : "favorite"} type="button" aria-pressed={fav} aria-label={(fav ? "Retirer des" : "Ajouter aux") + " favoris : " + match.home + " – " + match.away} onClick={() => toggleFavorite(match.id)}>{fav ? "★" : "☆"}</button></div>
              <div className="teams"><div><ClubMark name={match.home}/><b>{match.home}</b><small>DOM</small></div><div><ClubMark name={match.away}/><b>{match.away}</b><small>EXT</small></div></div>
              <div className="odds">{["1","N","2"].map((key) => { const odd = match.odds[key]; const active = picks.some((pick) => pick.matchId === match.id && pick.key === key); return <button key={key} className={active ? "odd odd-active" : "odd"} type="button" aria-pressed={active} aria-label={LABEL[key] + " " + fmt(odd.price) + ", " + odd.book} title={"Meilleure offre : " + odd.book} onClick={() => choose(match,key)}><small>{key}</small><b>{fmt(odd.price)}</b>{odd.advantage >= 1.5 && <i title="Supérieure à la moyenne">↗</i>}</button>; })}</div>
            </article>;
          })}{!visible.length && <div className="empty"><b>◌</b><strong>Aucune rencontre ici pour l’instant</strong><p>Essayez une autre date, effacez votre recherche ou affichez tous les matchs.</p><button type="button" onClick={() => {setSearch("");setFilter("all");setDateFilter("all");}}>Réinitialiser les filtres</button></div>}</div>
          <p className="disclaimer"><b>ⓘ</b> Les cotes sont illustratives. Les flèches signalent une offre supérieure à la moyenne des opérateurs disponibles.</p>
        </section>

        <aside className="rail">
          <section id="coupon" className="coupon"><div className="coupon-head"><div><small>VOTRE SÉLECTION</small><h3>Le coupon</h3></div><b>{String(picks.length).padStart(2,"0")}</b></div>
            {!picks.length ? <div className="coupon-empty"><span>＋</span><b>À vous de jouer</b><p>Choisissez une ou plusieurs cotes pour composer votre combiné.</p><small>① Une sélection par rencontre</small></div> : <>
              <div className="pick-list">{picks.map((pick,index) => <div className="pick" key={pick.matchId}><b>{String(index+1).padStart(2,"0")}</b><p><strong>{pick.home} – {pick.away}</strong><small>{pick.label} <em>@ {fmt(pick.price)}</em></small></p><button type="button" aria-label={"Retirer " + pick.name} onClick={() => setPicks((old) => old.filter((item) => item.matchId !== pick.matchId))}>×</button></div>)}</div>
              <div className="combo"><span>Cote combinée</span><b>{fmt(combo)}</b></div><div className="stake"><label htmlFor="stake">Mise fictive</label><div><span>€</span><input id="stake" type="number" min="1" value={stake} onChange={(event) => setStake(event.target.value === "" ? "" : Math.max(1,Number(event.target.value)))}/></div><section>{[5,10,25,50].map((n) => <button type="button" key={n} className={Number(stake) === n ? "quick-active" : ""} onClick={() => setStake(n)}>{n} €</button>)}</section></div>
              <div className="returns"><div><span>Retour potentiel</span><b>{euros(payout)}</b></div><div><span>Gain estimé</span><b className="profit">{euros(Math.max(0,payout-wager))}</b></div></div><button className="submit" type="button" onClick={simulate}>Simuler le coupon <b>↗</b></button><small className="no-money">Simulation uniquement. Aucune mise réelle.</small>
            </>}
          </section>
          <section className="market-note"><div><b>↗</b><small>{source === "live" ? "DONNÉES FOURNISSEUR" : "MODE DÉMO"}</small></div><h3>{source === "live" ? "Le marché est connecté." : "Un terrain de jeu, partout dans le monde."}</h3><p>{source === "live" ? "Les cotes proviennent du fournisseur configuré." : "Du nord de l’Europe à l’Amérique du Sud, explorez 168 clubs au catalogue."}</p><footer><i/>Actualisé à {time}</footer></section>
          <div className="responsible"><b>◎</b><p>Une démo de portfolio conçue pour l’analyse football. <strong>Jouez de manière responsable.</strong></p></div>
        </aside></div>
      </section>
      <footer id="about" className="footer"><a className="brand" href="#home"><Emblem small/><span>BET-APP <b>FOOT</b></span></a><span>Comparateur football · Données simulées par défaut</span><a href="#home">Retour en haut ↑</a></footer>
    </main>
    <button className="mobile-coupon" type="button" onClick={scrollCoupon}>Voir mon coupon <b>{picks.length}</b></button>
    {message && <div className="toast" role="status"><b>✓</b>{message}</div>}
  </div>;
}

