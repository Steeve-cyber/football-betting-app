import { useState } from "react";

const leftMatches = [
  {
    id: 1,
    league: "UEFA Champions League",
    home: {
      name: "Fenerbahçe SK",
      logo: "https://a.espncdn.com/i/teamlogos/soccer/500/457.png",
    },
    away: {
      name: "SK Slavia Praha",
      logo: "/sk-slavia-praha.svg",
    },
    odds: { 1: 2.1, N: 3.4, 2: 3.1 },
  },
  {
    id: 2,
    league: "UEFA Champions League",
    home: {
      name: "Sabah FK",
      logo: "https://a.espncdn.com/i/teamlogos/soccer/500/default-team-logo-500.png",
    },
    away: {
      name: "Borussia Dortmund",
      logo: "https://a.espncdn.com/i/teamlogos/soccer/500/124.png",
    },
    odds: { 1: 2.1, N: 3.4, 2: 3.1 },
  },
  {
    id: 3,
    league: "Premier League",
    home: {
      name: "Arsenal FC",
      logo: "https://a.espncdn.com/i/teamlogos/soccer/500/359.png",
    },
    away: {
      name: "Chelsea FC",
      logo: "https://a.espncdn.com/i/teamlogos/soccer/500/363.png",
    },
    odds: { 1: 1.9, N: 3.7, 2: 3.2 },
  },
  {
    id: 4,
    league: "Premier League",
    home: {
      name: "Manchester City",
      logo: "https://a.espncdn.com/i/teamlogos/soccer/500/382.png",
    },
    away: {
      name: "Liverpool FC",
      logo: "https://a.espncdn.com/i/teamlogos/soccer/500/364.png",
    },
    odds: { 1: 1.8, N: 5.2, 2: 3.4 },
  },
];

const rightMatches = [
  {
    id: 11,
    league: "LaLiga",
    home: {
      name: "FC Barcelona",
      logo: "https://a.espncdn.com/i/teamlogos/soccer/500/83.png",
    },
    away: {
      name: "Real Madrid",
      logo: "https://a.espncdn.com/i/teamlogos/soccer/500/86.png",
    },
    odds: { 1: 2.4, N: 2.8, 2: 3.3 },
  },
  {
    id: 12,
    league: "Serie A",
    home: {
      name: "Juventus",
      logo: "/juventus.svg",
    },
    away: {
      name: "Inter Milan",
      logo: "https://a.espncdn.com/i/teamlogos/soccer/500/110.png",
    },
    odds: { 1: 2.2, N: 3.4, 2: 3.1 },
  },
  {
    id: 13,
    league: "Bundesliga",
    home: {
      name: "Bayern Munich",
      logo: "https://a.espncdn.com/i/teamlogos/soccer/500/132.png",
    },
    away: {
      name: "RB Leipzig",
      logo: "/leipzig.svg",
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
                    <img src={match.home.logo} alt="" className="team-logo" />
                    <span>{match.home.name}</span>
                  </div>

                  <span className="vs">VS</span>

                  <div className="team team-away">
                    <img src={match.away.logo} alt="" className="team-logo" />
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
          <div className="bet-slip">
            <h2>Coupon de pari</h2>

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
                    <label>💶 Mise (€)</label>
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
                    <span>💰 Gains potentiels</span>
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
