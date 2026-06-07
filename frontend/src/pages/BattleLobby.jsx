import React from 'react';

const BattleLobby = () => {
  return (
    <section id="battle-screen" className="screen">
        <div className="hero-section">
            <h1>Düello Lobisi ⚔️</h1>
            <p>Oda kur ve arkadaşını davet et, ya da bir oda koduna katıl!</p>
        </div>

        <div className="battle-lobby-container">
            <div className="lobby-panel glass">
                <div className="lobby-panel-header">
                    <div>
                        <span className="lobby-panel-icon">🏟️</span>
                    </div>
                    <div>
                        <h2>Oda Kur</h2>
                        <p>Görsel seç ve düelloya başla</p>
                    </div>
                </div>

                <div className="lobby-image-grid" id="lobbyImageGrid">
                    <div className="lobby-img-option selected" data-imgkey="nature" data-image="assets/puzzle_nature.png" data-name="Sakin Dağ Gölü">
                        <img src="assets/puzzle_nature.png" alt="Sakin Dağ Gölü" />
                        <div className="lobby-img-label">Sakin Dağ Gölü</div>
                    </div>
                    <div className="lobby-img-option" data-imgkey="space" data-image="assets/puzzle_space.png" data-name="Kozmik Bulutsu">
                        <img src="assets/puzzle_space.png" alt="Kozmik Bulutsu" />
                        <div className="lobby-img-label">Kozmik Bulutsu</div>
                    </div>
                    <div className="lobby-img-option" data-imgkey="cyberpunk" data-image="assets/puzzle_cyberpunk.png" data-name="Neon Şehir">
                        <img src="assets/puzzle_cyberpunk.png" alt="Neon Şehir" />
                        <div className="lobby-img-label">Neon Şehir</div>
                    </div>
                    <div className="lobby-img-option" data-imgkey="demo" data-image="assets/puzzle_demo_art.png" data-name="Orijinal Sanat">
                        <img src="assets/puzzle_demo_art.png" alt="Orijinal Sanat" />
                        <div className="lobby-img-label">Orijinal Sanat</div>
                    </div>
                </div>

                <select id="lobbyDifficultySelect" className="difficulty-select glass-select" style={{ width: '100%', padding: '0.55rem 0.8rem', fontSize: '0.9rem' }}>
                    <option value="easy">🟢 Kolay (4x3 — 12 Parça)</option>
                    <option value="medium">🟡 Orta (6x5 — 30 Parça)</option>
                    <option value="hard">🔴 Zor (8x6 — 48 Parça)</option>
                </select>

                <button id="createRoomBtn" className="btn primary btn-full">⚔️ Oda Oluştur</button>

                <div className="invite-box" id="inviteBox">
                    <p style={{ color: '#aaa', fontSize: '0.85rem' }}>Oda kodu hazır! Arkadaşına gönder:</p>
                    <div className="invite-code" id="inviteCode">-</div>
                    <button id="copyInviteBtn" className="btn secondary" style={{ width: '100%' }}>📋 Kodu Kopyala</button>
                    <button id="startBattleBtn" className="btn primary" style={{ width: '100%' }}>🚀 Düelloya Gir</button>
                    <p className="invite-status">Bekleniyor<span className="dot-pulse">...</span></p>
                </div>
            </div>

            <div className="lobby-divider">veya</div>

            <div className="lobby-panel glass">
                <div className="lobby-panel-header">
                    <div>
                        <span className="lobby-panel-icon">🎟️</span>
                    </div>
                    <div>
                        <h2>Odaya Katıl</h2>
                        <p>Arkadaşının gönderdiği kodu gir</p>
                    </div>
                </div>

                <div className="join-illustration">
                    <div className="join-icon">🤝</div>
                    <p>Arkadaşından aldığın oda kodunu aşağıya yapıştır ve düelloya katıl!</p>
                </div>

                <input type="text" id="joinCodeInput" className="lobby-code-input" placeholder="Oda kodu gir..." maxLength="8" autoComplete="off" />

                <button id="joinRoomBtn" className="btn primary btn-full">🎮 Odaya Katıl</button>
            </div>
        </div>
    </section>
  );
};

export default BattleLobby;
