// Générateur de fixtures de portfolio : les horaires et les marchés sont simulés.
const EQUIPES = {
  soccer_epl: ['Manchester City','Arsenal','Liverpool','Chelsea','Tottenham Hotspur','Manchester United','Newcastle United','Aston Villa','Brighton','West Ham United','Brentford','Everton'],
  soccer_france_ligue_one: ['Paris Saint-Germain','Marseille','Monaco','Lille','Lyon','Nice','Lens','Rennes','Strasbourg','Nantes','Toulouse','Reims'],
  soccer_spain_la_liga: ['Real Madrid','Barcelona','Atlético Madrid','Real Sociedad','Athletic Bilbao','Villarreal','Real Betis','Sevilla','Valencia','Getafe','Osasuna','Celta Vigo'],
  soccer_italy_serie_a: ['Inter Milan','AC Milan','Juventus','Napoli','AS Roma','Atalanta','Lazio','Fiorentina','Bologna','Torino','Udinese','Genoa'],
  soccer_germany_bundesliga: ['Bayern Munich','Bayer Leverkusen','Borussia Dortmund','RB Leipzig','Eintracht Frankfurt','VfB Stuttgart','SC Freiburg','Wolfsburg','Hoffenheim','Werder Bremen','Mainz 05','Augsburg'],
  soccer_uefa_champs_league: ['Real Madrid','Manchester City','Bayern Munich','Paris Saint-Germain','Barcelona','Inter Milan','Arsenal','Liverpool','Borussia Dortmund','Atlético Madrid','Juventus','Benfica'],
  soccer_netherlands_eredivisie: ['Ajax','PSV Eindhoven','Feyenoord','AZ Alkmaar','FC Twente','Utrecht','Sparta Rotterdam','Heerenveen','Groningen','NEC Nijmegen','Go Ahead Eagles','Fortuna Sittard'],
  soccer_portugal_primeira_liga: ['Benfica','FC Porto','Sporting CP','Braga','Vitória Guimarães','Boavista','Famalicão','Moreirense','Rio Ave','Casa Pia','Gil Vicente','Estoril'],
  soccer_usa_mls: ['Inter Miami','LA Galaxy','LAFC','Seattle Sounders','Atlanta United','New York City FC','New York Red Bulls','Austin FC','Portland Timbers','Orlando City','Nashville SC','Columbus Crew'],
  soccer_brazil_campeonato: ['Flamengo','Palmeiras','São Paulo','Corinthians','Santos','Fluminense','Botafogo','Grêmio','Internacional','Cruzeiro','Bahia','Athletico Paranaense'],
  soccer_turkey_super_league: ['Galatasaray','Fenerbahçe','Beşiktaş','Trabzonspor','Başakşehir','Adana Demirspor','Antalyaspor','Sivasspor','Kasımpaşa','Alanyaspor','Samsunspor','Konyaspor'],
  soccer_argentina_primera_division: ['River Plate','Boca Juniors','Racing Club','Independiente','San Lorenzo','Estudiantes','Lanús','Vélez Sarsfield','Rosario Central','Talleres','Newell’s Old Boys','Huracán'],
  soccer_australia_aleague: ['Sydney FC','Melbourne Victory','Melbourne City','Western Sydney','Adelaide United','Brisbane Roar','Perth Glory','Wellington Phoenix','Central Coast Mariners','Newcastle Jets','Macarthur FC','Western United'],
  soccer_spl: ['Celtic','Rangers','Aberdeen','Hearts','Hibernian','Dundee United','Dundee FC','Motherwell','St Mirren','Kilmarnock','Livingston','Ross County'],
};
const BOOKS = [
  ['sim-alpha','Alpha Markets',0.052],['sim-vertex','Vertex Sports',0.061],['sim-north','Northline',0.057],['sim-arc','Arc Odds',0.044],
  ['sim-pulse','Pulse Exchange',0.067],['sim-field','Fieldhouse',0.05],['sim-orbit','Orbit Markets',0.063],['sim-match','Matchday Labs',0.058],
];
const hash = (s) => [...s].reduce((h,c) => Math.imul(h ^ c.charCodeAt(0),16777619) >>> 0,2166136261);
const generateur = (g) => () => {
  g = (g + 0x6d2b79f5) | 0;
  let t = Math.imul(g ^ (g >>> 15),1 | g);
  t = (t + Math.imul(t ^ (t >>> 7),61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
export function genererDemo(ligue, maintenant = Date.now()) {
  const equipes = EQUIPES[ligue] || EQUIPES.soccer_epl;
  const minuit = new Date(maintenant);
  minuit.setHours(0,0,0,0);
  const jourCle = [minuit.getFullYear(),minuit.getMonth()+1,minuit.getDate()].join("-");
  const rnd = generateur(hash(ligue + "-" + jourCle));
  const ordre = equipes.map((e) => ({ e, r: rnd() })).sort((a,b) => a.r-b.r).map((x) => x.e);
  const force = (nom) => 1 - equipes.indexOf(nom) * 0.055;
  const creneaux = [[15,0],[17,30],[20,45]];
  const minute = Math.floor(maintenant / 60000);
  return Array.from({ length: 6 }, (_, i) => {
    const dom = ordre[2*i], ext = ordre[2*i+1];
    const debut = new Date(minuit);
    debut.setDate(debut.getDate() + Math.floor(i/3));
    debut.setHours(...creneaux[i%3]);
    if (debut.getTime() < maintenant + 20*60000) debut.setDate(debut.getDate()+1);
    const ph = (force(dom)*1.12)/(force(dom)*1.12+force(ext));
    const pn = 0.29-0.14*Math.abs(ph-0.5)*2;
    const probs = [(1-pn)*ph,pn,(1-pn)*(1-ph)];
    const id = "demo-" + ligue + "-" + jourCle + "-" + i;
    const stable = generateur(hash(id));
    const bookmakers = BOOKS.map(([key,title,marge]) => ({
      key,title,markets:[{key:"h2h",outcomes:[dom,"Draw",ext].map((name,k) => {
        const variation = 1+(generateur(hash(id+"-"+key+"-"+minute))()-0.5)*0.03;
        return {name,price:Math.max(1.01,+((1/(probs[k]*(1+marge)))*(1+(stable()-0.5)*0.07)*variation).toFixed(2))};
      })}],
    }));
    if (i%3===0) {
      const book = bookmakers[Math.floor(stable()*bookmakers.length)];
      const outcome = book.markets[0].outcomes[Math.floor(stable()*3)];
      outcome.price = +(outcome.price*1.12).toFixed(2);
    }
    return {id,sport_key:ligue,commence_time:debut.toISOString(),home_team:dom,away_team:ext,bookmakers};
  });
}
