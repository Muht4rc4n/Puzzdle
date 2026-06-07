import React from 'react';

const Profile = () => {
  return (
    <section id="profile-screen" className="screen">
        <div className="profile-header glass">
            <div className="profile-avatar-large">ME</div>
            <div className="profile-info-block">
                <h2 id="profileName">Muhtarcan Ergen</h2>
                <p className="profile-subtitle">🏆 Puzzdle Ustası (Master Level 12)</p>
            </div>
        </div>

        <div className="stats-grid">
            <div className="stat-card glass">
                <div className="stat-icon">✨</div>
                <div className="stat-value" id="statScore">1500</div>
                <div className="stat-label">Toplam Puan</div>
            </div>
            <div className="stat-card glass">
                <div className="stat-icon">⚔️</div>
                <div className="stat-value" id="statMatches">42</div>
                <div className="stat-label">Oynanan Maç</div>
            </div>
            <div className="stat-card glass">
                <div className="stat-icon">🧩</div>
                <div className="stat-value">Kolay (5x4)</div>
                <div className="stat-label">Tercih Edilen</div>
            </div>
            <div className="stat-card glass">
                <div className="stat-icon">👑</div>
                <div className="stat-value">Oyuncu</div>
                <div className="stat-label">Hesap Rolü</div>
            </div>
        </div>

        <div className="gallery-title-wrapper">
            <h2>Beğendiğim Şablonlar ❤️</h2>
            <p>Favorilere eklediğiniz şablonlardan dilediğinizi seçip hemen oynamaya başlayın.</p>
        </div>

        <div className="favorites-gallery-container">
            <div className="templates-grid" id="favorites-gallery-grid"></div>

            <div className="empty-state-card glass" id="favorites-empty-state" style={{ display: 'none' }}>
                <div className="empty-icon">❤️</div>
                <h3>Henüz hiçbir şablonu favorilemediniz!</h3>
                <p>Şablonlar kütüphanesine dönün ve beğendiğiniz görsellerin üzerindeki kalp simgesine tıklayarak buraya ekleyin.</p>
                <button className="btn primary" id="exploreTemplatesBtn">Şablonları Keşfet 🧭</button>
            </div>
        </div>

        <div className="gallery-title-wrapper" style={{ marginTop: '3rem' }}>
            <h2>Düello Geçmişi ⚔️</h2>
            <p>Katıldığınız Battle Arena (Düello) maçlarının sonuçları ve skorları.</p>
        </div>

        <div className="battle-history-container glass" style={{ padding: '2rem', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.05)', background: 'rgba(0, 0, 0, 0.2)', marginBottom: '2rem' }}>
            <div className="table-responsive" id="battle-history-table-wrapper">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Tarih</th>
                            <th>Oda Kodu</th>
                            <th>Yapboz</th>
                            <th>Oyuncu 1</th>
                            <th>Oyuncu 2</th>
                            <th>Skorlar</th>
                            <th>Durum / Kazanan</th>
                        </tr>
                    </thead>
                    <tbody id="battleHistoryTableBody">
                    </tbody>
                </table>
            </div>

            <div className="empty-state-card" id="battle-history-empty-state" style={{ display: 'none', padding: '2rem 0', textAlign: 'center', background: 'transparent', border: 'none', boxShadow: 'none' }}>
                <div className="empty-icon" style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.5 }}>⚔️</div>
                <h3 style={{ color: '#fff', marginBottom: '0.5rem' }}>Henüz hiçbir düelloya katılmadınız!</h3>
                <p style={{ color: '#888', maxWidth: '400px', margin: '0 auto 1.5rem auto', fontSize: '0.9rem' }}>Battle Arena lobisinden bir oda kurarak veya arkadaşınızın odasına katılarak hemen düelloya başlayın.</p>
                <button className="btn primary" id="playBattleNowBtn">Lobiyi Keşfet 🏟️</button>
            </div>
        </div>

        <div className="logout-btn-wrapper" style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end' }}>
            <button className="btn secondary" id="logoutBtn" style={{ borderColor: 'rgba(255, 51, 102, 0.3)', color: '#ff3366', fontWeight: 600 }}>Çıkış Yap 🚪</button>
        </div>
    </section>
  );
};

export default Profile;
