import { useState } from "react";
import "./App.css";

const leftMatches = [
  {
    id: 1,
    league: "UEFA Champions League",
    home: {
      name: "Fenerbahçe SK",
      badge: "F",
      logo: "/hollanda-fenerbahceliler.svg",
      colors: "badge-pink",
    },
    away: {
      name: "SK Slavia Praha",
      badge: "S",
      logo: "/sk-slavia-praha.svg",
      colors: "badge-red",
    },
    odds: { 1: 2.1, N: 3.4, 2: 3.1 },
  },
  {
    id: 2,
    league: "UEFA Champions League",
    home: {
      name: "Sabah FK",
      badge: "S",
      logo: "/sabah FK.svg",
      colors: "badge-purple",
    },
    away: {
      name: "Borussia Dortmund",
      badge: "B",
      logo: "/borussia-dortmund.svg",
      colors: "badge-yellow",
    },
    odds: { 1: 2.1, N: 3.4, 2: 3.1 },
  },
  {
    id: 3,
    league: "Premier League",
    home: {
      name: "Arsenal FC",
      badge: "A",
      logo: "https://upload.wikimedia.org/wikipedia/en/thumb/5/53/Arsenal_FC.svg/120px-Arsenal_FC.svg.png",
      colors: "badge-cyan",
    },
    away: {
      name: "Chelsea FC",
      badge: "C",
      logo: "https://upload.wikimedia.org/wikipedia/en/thumb/c/cc/Chelsea_FC.svg/120px-Chelsea_FC.svg.png",
      colors: "badge-blue",
    },
    odds: { 1: 1.9, N: 3.7, 2: 3.2 },
  },
  {
    id: 4,
    league: "Premier League",
    home: {
      name: "Manchester City",
      badge: "M",
      logo: "https://upload.wikimedia.org/wikipedia/en/thumb/e/eb/Manchester_City_FC_badge.svg/120px-Manchester_City_FC_badge.svg.png",
      colors: "badge-gold",
    },
    away: {
      name: "Liverpool",
      badge: "L",
      logo: "/liverpool-fc.svg",
      colors: "badge-red-dark",
    },
    odds: { 1: 1.8, N: 5.2, 2: 3.4 },
  },
];

const rightMatches = [
  {
    id: 11,
    league: "LaLiga",
    home: {
      name: "Barcelona",
      badge: "B",
      logo: "https://upload.wikimedia.org/wikipedia/en/thumb/4/47/FC_Barcelona_%28crest%29.svg/120px-FC_Barcelona_%28crest%29.svg.png",
      colors: "badge-gold",
    },
    away: {
      name: "Real Madrid",
      badge: "R",
      logo: "https://upload.wikimedia.org/wikipedia/en/thumb/5/56/Real_Madrid_CF.svg/120px-Real_Madrid_CF.svg.png",
      colors: "badge-red-dark",
    },
    odds: { 1: 2.4, N: 2.8, 2: 3.3 },
  },
  {
    id: 12,
    league: "Serie A",
    home: {
      name: "Juventus",
      badge: "J",
      logo: "/juventus.svg",
      colors: "badge-silver",
    },
    away: {
      name: "Inter Milan",
      badge: "I",
      logo: "/inter-milan.svg",
      colors: "badge-green",
    },
    odds: { 1: 2.2, N: 3.4, 2: 3.1 },
  },
  {
    id: 13,
    league: "Bundesliga",
    home: {
      name: "Bayern Munich",
      badge: "B",
      logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/FC_Bayern_M%C3%BCnchen_logo_%282017%29.svg/120px-FC_Bayern_M%C3%BCnchen_logo_%282017%29.svg.png",
      colors: "badge-gold",
    },
    away: {
      name: "RB Leipzig",
      badge: "L",
      logo: "/leipzig.svg",
      colors: "badge-violet",
    },
    odds: { 1: 1.8, N: 4.5, 2: 3.5 },
  },
];

function App() {
  const [selectedBet, setSelectedBet] = useState(null);
  const [stake, setStake] = useState(10);
  const [betPlaced, setBetPlaced] = useState(false);

  const handleSelectOdd = (match, type, odd) => {
    setBetPlaced(false);

    if (
      selectedBet &&
      selectedBet.matchId === match.id &&
      selectedBet.type === type
    ) {
      setSelectedBet(null);
      return;
    }

    setSelectedBet({
      matchId: match.id,
      matchName: `${match.home.name} vs ${match.away.name}`,
      type,
      odd,
    });
  };

  const potentialWin = selectedBet
    ? (stake * selectedBet.odd).toFixed(2)
    : "0.00";

  const handlePlaceBet = () => {
    setBetPlaced(true);
    setTimeout(() => {
      setSelectedBet(null);
      setBetPlaced(false);
    }, 2500);
  };

  return (
    <div className="container">
      <header className="header">
        <h1 className="brand-title">
          <span className="cup-icon">🏆</span>
          <span className="brand-text">Foot Predict</span>
        </h1>
        <p>Analyse des rencontres en direct &amp; Cotes en temps réel</p>
      </header>

      <div className="main-layout">
        <div className="matches-grid">
          {leftMatches.map((match) => (
            <div key={match.id} className="match-card">
              <div className="match-left">
                <span className="league-badge">{match.league}</span>

                <div className="teams-container">
                  <div className="team team-home">
                    <img
                      src={match.home.logo}
                      alt={match.home.name}
                      className="team-logo"
                    />
                    <span>{match.home.name}</span>
                  </div>

                  <span className="vs">VS</span>

                  <div className="team team-away">
                    <img
                      src={match.away.logo}
                      alt={match.away.name}
                      className="team-logo"
                    />
                    <span>{match.away.name}</span>
                  </div>
                </div>
              </div>

              <div className="odds-group">
                {Object.entries(match.odds).map(([type, odd]) => {
                  const isSelected =
                    selectedBet &&
                    selectedBet.matchId === match.id &&
                    selectedBet.type === type;

                  return (
                    <button
                      key={`${match.id}-${type}`}
                      className={`odd-btn ${isSelected ? "selected" : ""}`}
                      onClick={() => handleSelectOdd(match, type, odd)}
                    >
                      <span>{type}</span>
                      {odd.toFixed(2)}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <aside className="side-panel">
          <div className="side-card">
            <h3>Autres rencontres</h3>

            {rightMatches.map((match) => (
              <div key={match.id} className="mini-match">
                <div className="mini-header">{match.league}</div>

                <div className="mini-teams">
                  <div className="mini-team">
                    <img
                      src={match.home.logo}
                      alt={match.home.name}
                      className="team-logo"
                    />
                    <span>{match.home.name}</span>
                  </div>

                  <span className="mini-vs">VS</span>

                  <div className="mini-team">
                    <img
                      src={match.away.logo}
                      alt={match.away.name}
                      className="team-logo"
                    />
                    <span>{match.away.name}</span>
                  </div>
                </div>

                <div className="mini-odds">
                  {Object.entries(match.odds).map(([type, odd]) => (
                    <button
                      key={`${match.id}-${type}-mini`}
                      className="mini-odd"
                      onClick={() => handleSelectOdd(match, type, odd)}
                    >
                      <span>{type}</span>
                      {odd.toFixed(2)}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="bet-slip">
            <h2>🎫 Coupon de pari</h2>

            {betPlaced ? (
              <div className="success-msg">✅ Pari validé avec succès !</div>
            ) : selectedBet ? (
              <>
                <div className="bet-item">
                  <button
                    className="remove-btn"
                    onClick={() => setSelectedBet(null)}
                  >
                    ✕
                  </button>
                  <div className="bet-item-header">{selectedBet.matchName}</div>
                  <div className="bet-item-choice">
                    <span>Pronostic : {selectedBet.type}</span>
                    <span>@ {selectedBet.odd.toFixed(2)}</span>
                  </div>
                </div>

                <div className="stake-section">
                  <div className="stake-input-group">
                    <label>Mise (€)</label>
                    <input
                      type="number"
                      min="1"
                      value={stake}
                      onChange={(e) =>
                        setStake(Math.max(1, Number(e.target.value) || 1))
                      }
                    />
                  </div>

                  <div className="potential-win">
                    <span>Gains potentiels</span>
                    <strong>{potentialWin} €</strong>
                  </div>

                  <button className="place-bet-btn" onClick={handlePlaceBet}>
                    Valider le coupon
                  </button>
                </div>
              </>
            ) : (
              <div className="empty-slip">
                Sélectionnez une cote pour remplir votre coupon.
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}

export default App;
