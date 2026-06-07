import React from 'react';

const Admin = () => {
  return (
    <section id="admin-screen" className="screen">
        <div className="hero-section text-center">
            <h1>Sistem Yönetim Paneli 👑</h1>
            <p>Kullanıcı hesaplarını görüntüleyin, rolleri kontrol edin ve sistemi yönetin.</p>
        </div>
        
        <div className="admin-container glass">
            <div className="admin-header-row">
                <h2>Kayıtlı Kullanıcılar</h2>
                <span className="user-badge" id="totalUsersBadge">Toplam: 0 Kullanıcı</span>
            </div>
            
            <div className="table-responsive">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Kullanıcı</th>
                            <th>E-Posta</th>
                            <th>Rol</th>
                            <th>Toplam Puan</th>
                            <th>Oynanan Maç</th>
                            <th>Kayıt Tarihi</th>
                            <th>İşlemler</th>
                        </tr>
                    </thead>
                    <tbody id="adminUsersTableBody">
                    </tbody>
                </table>
            </div>
        </div>

        <div className="admin-container glass" style={{ marginTop: '3rem' }}>
            <div className="admin-header-row">
                <h2>Yapboz Şablonları Yönetimi</h2>
                <span className="user-badge" id="totalTemplatesBadge">Toplam: 0 Şablon</span>
            </div>
            
            <form id="adminAddTemplateForm" className="auth-form" style={{ maxWidth: '100%', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2.5rem', padding: '2rem', borderRadius: '12px', background: 'rgba(0, 0, 0, 0.2)', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                <div className="input-group" style={{ gridColumn: 'span 2' }}>
                    <h3 style={{ color: '#00f2fe', marginBottom: '0.5rem' }}>👑 Yeni Hazır Şablon Ekle</h3>
                </div>
                <div className="input-group">
                    <label htmlFor="tplKey">Şablon Benzersiz Anahtarı (Örn: neon-astronot, siber-kedi)</label>
                    <input type="text" id="tplKey" placeholder="neon-astronot" required autoComplete="off" />
                </div>
                <div className="input-group">
                    <label htmlFor="tplName">Şablon Adı</label>
                    <input type="text" id="tplName" placeholder="Siberpunk Astronot" required autoComplete="off" />
                </div>
                <div className="input-group">
                    <label htmlFor="tplUrl">Görsel URL'si (assets/... veya https://...)</label>
                    <input type="text" id="tplUrl" placeholder="assets/puzzle_nature.png" required autoComplete="off" />
                </div>
                <div className="input-group">
                    <label htmlFor="tplCategory">Kategori</label>
                    <select id="tplCategory" className="glass-select" style={{ padding: '0.85rem' }}>
                        <option value="Doğa">Doğa 🌲</option>
                        <option value="Uzay">Uzay 🌌</option>
                        <option value="Cyberpunk">Cyberpunk 🏙️</option>
                        <option value="Klasik">Klasik 🎨</option>
                    </select>
                </div>
                <button type="submit" className="btn primary btn-full" style={{ gridColumn: 'span 2', marginTop: '1rem' }}>🎨 Şablonu Sisteme Ekle</button>
            </form>

            <div className="table-responsive">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Önizleme</th>
                            <th>Anahtar</th>
                            <th>Şablon Adı</th>
                            <th>Kategori</th>
                            <th>İşlemler</th>
                        </tr>
                    </thead>
                    <tbody id="adminTemplatesTableBody">
                    </tbody>
                </table>
            </div>
        </div>

        <div className="admin-container glass" style={{ marginTop: '3rem', marginBottom: '3rem' }}>
            <div className="admin-header-row">
                <h2>Gelen İletişim Mesajları</h2>
                <span className="user-badge" id="totalMessagesBadge">Toplam: 0 Mesaj</span>
            </div>
            
            <div className="table-responsive">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Ad Soyad</th>
                            <th>E-Posta</th>
                            <th>Konu</th>
                            <th>Mesaj</th>
                            <th>Tarih</th>
                            <th>İşlemler</th>
                        </tr>
                    </thead>
                    <tbody id="adminMessagesTableBody">
                    </tbody>
                </table>
            </div>
        </div>
    </section>
  );
};

export default Admin;
