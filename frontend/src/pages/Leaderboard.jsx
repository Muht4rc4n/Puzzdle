import React from 'react';

const Leaderboard = () => {
  return (
    <section id="leaderboard-screen" className="screen">
        <div className="hero-section text-center">
            <h1>Liderlik Tablosu 🏆</h1>
            <p>En iyi yapboz çözücüler burada! Sıralamanda yukarı çık.</p>
        </div>

        <div className="podium-container">
            <div className="podium-slot silver" id="podium-2">
                <div className="podium-avatar">2</div>
                <div className="podium-name">-</div>
                <div className="podium-score">0</div>
                <div className="podium-bar">
                    <span className="podium-rank">🥈</span>
                </div>
            </div>
            <div className="podium-slot gold" id="podium-1">
                <div className="podium-avatar">1</div>
                <div className="podium-name">-</div>
                <div className="podium-score">0</div>
                <div className="podium-bar">
                    <span className="podium-rank">🥇</span>
                </div>
            </div>
            <div className="podium-slot bronze" id="podium-3">
                <div className="podium-avatar">3</div>
                <div className="podium-name">-</div>
                <div className="podium-score">0</div>
                <div className="podium-bar">
                    <span className="podium-rank">🥉</span>
                </div>
            </div>
        </div>

        <div className="leaderboard-list glass" id="leaderboardList">
        </div>
    </section>
  );
};

export default Leaderboard;
