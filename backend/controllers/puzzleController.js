const db = require('../config/db');

exports.getHealth = (req, res) => {
    res.json({ status: 'ok', message: 'Puzzdle Backend Servisi Aktif! 🚀' });
};

exports.getLeaderboard = async (req, res) => {
    try {
        const queryText = `
            SELECT u.ad_soyad, ps.toplam_puan, ps.oynanan_mac 
            FROM player_stats ps
            JOIN users u ON ps.kullanici_id = u.id
            ORDER BY ps.toplam_puan DESC 
            LIMIT 10;
        `;
        const { rows } = await db.query(queryText);
        
        if (rows.length === 0) {
            return res.json([
                { ad_soyad: 'Muhtarcan Ergen', toplam_puan: 1500, oynanan_mac: 42 }
            ]);
        }
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: 'Liderlik tablosu hatası' });
    }
};

exports.getFavorites = async (req, res) => {
    const userId = req.query.userId || 1;
    try {
        const queryText = 'SELECT gorsel_key FROM user_favorites WHERE kullanici_id = $1';
        const { rows } = await db.query(queryText, [userId]);
        res.json(rows.map(r => r.gorsel_key));
    } catch (err) {
        res.status(500).json({ error: 'Favoriler getirilemedi.' });
    }
};

exports.addFavorite = async (req, res) => {
    const { userId, imgKey } = req.body;
    const uid = userId || 1;
    if (!imgKey) return res.status(400).json({ error: 'imgKey parametresi gereklidir.' });
    try {
        const insertQuery = `
            INSERT INTO user_favorites (kullanici_id, gorsel_key)
            VALUES ($1, $2)
            ON CONFLICT (kullanici_id, gorsel_key) DO NOTHING;
        `;
        await db.query(insertQuery, [uid, imgKey]);
        res.status(201).json({ success: true, message: 'Favorilere başarıyla eklendi.' });
    } catch (err) {
        res.status(500).json({ error: 'Favori eklenemedi.' });
    }
};

exports.deleteFavorite = async (req, res) => {
    const imgKey = req.params.key;
    const userId = req.query.userId || 1;
    try {
        const deleteQuery = 'DELETE FROM user_favorites WHERE kullanici_id = $1 AND gorsel_key = $2';
        await db.query(deleteQuery, [userId, imgKey]);
        res.json({ success: true, message: 'Favorilerden başarıyla silindi.' });
    } catch (err) {
        res.status(500).json({ error: 'Favori silinemedi.' });
    }
};

exports.getAdminUsers = async (req, res) => {
    try {
        const queryText = `
            SELECT u.id, u.ad_soyad, u.email, u.rol, u.olusturma_tarihi,
                   COALESCE(ps.toplam_puan, 0) AS toplam_puan,
                   COALESCE(ps.oynanan_mac, 0) AS oynanan_mac
            FROM users u
            LEFT JOIN player_stats ps ON u.id = ps.kullanici_id
            ORDER BY u.id DESC;
        `;
        const { rows } = await db.query(queryText);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: 'Kullanıcılar listelenemedi.' });
    }
};

exports.deleteAdminUser = async (req, res) => {
    const userId = req.params.id;
    try {
        await db.query('DELETE FROM users WHERE id = $1', [userId]);
        res.json({ success: true, message: 'Kullanıcı başarıyla silindi.' });
    } catch (err) {
        res.status(500).json({ error: 'Kullanıcı silinemedi.' });
    }
};

exports.getTemplates = async (req, res) => {
    try {
        const queryText = 'SELECT * FROM global_templates ORDER BY id ASC;';
        const { rows } = await db.query(queryText);
        if (rows.length === 0) {
            return res.json([
                { id: 1, gorsel_key: 'nature', gorsel_url: 'assets/puzzle_nature.png', ad: 'Sakin Dağ Gölü', kategori: 'Doğa' }
            ]);
        }
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: 'Şablonları çekme hatası' });
    }
};

exports.addTemplate = async (req, res) => {
    const { gorsel_key, gorsel_url, ad, kategori } = req.body;
    try {
        const insertQuery = `
            INSERT INTO global_templates (gorsel_key, gorsel_url, ad, kategori)
            VALUES ($1, $2, $3, $4)
            RETURNING *;
        `;
        const { rows } = await db.query(insertQuery, [gorsel_key.trim().toLowerCase(), gorsel_url.trim(), ad.trim(), kategori || 'Klasik']);
        res.status(201).json({ success: true, template: rows[0] });
    } catch (err) {
        res.status(500).json({ error: 'Şablon veritabanına eklenemedi.' });
    }
};

exports.deleteTemplate = async (req, res) => {
    const tplId = req.params.id;
    try {
        await db.query('DELETE FROM global_templates WHERE id = $1', [tplId]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Şablon silinemedi.' });
    }
};

exports.getBattlesHistory = async (req, res) => {
    const userId = req.query.userId;
    try {
        const queryText = `
            SELECT bh.*, 
                   u1.ad_soyad AS oyuncu1_ad, 
                   u2.ad_soyad AS oyuncu2_ad,
                   wk.ad_soyad AS kazanan_ad
            FROM battle_history bh
            LEFT JOIN users u1 ON bh.oyuncu1_id = u1.id
            LEFT JOIN users u2 ON bh.oyuncu2_id = u2.id
            LEFT JOIN users wk ON bh.kazanan_id = wk.id
            WHERE bh.oyuncu1_id = $1 OR bh.oyuncu2_id = $1
            ORDER BY bh.oyun_tarihi DESC;
        `;
        const { rows } = await db.query(queryText, [userId]);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: 'Maç geçmişi getirilemedi.' });
    }
};

// Faz 5: İletişim Formu Endpoint (Veritabanına Kayıtlı)
exports.submitContactForm = async (req, res) => {
    const { name, email, subject, message } = req.body;
    try {
        await db.query(`
            INSERT INTO contact_messages (ad_soyad, email, konu, mesaj)
            VALUES ($1, $2, $3, $4)
        `, [name, email, subject, message]);
        console.log(`📩 Yeni Mesaj Veritabanına Kaydedildi: [${subject}] - ${name}`);
        res.status(200).json({ success: true, message: 'Mesajınız başarıyla iletildi.' });
    } catch (err) {
        console.error('❌ İletişim formu hatası:', err.message);
        res.status(500).json({ error: 'Mesaj iletilemedi.' });
    }
};

exports.getContactMessages = async (req, res) => {
    try {
        const { rows } = await db.query('SELECT * FROM contact_messages ORDER BY gonderim_tarihi DESC');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: 'Mesajlar listelenemedi.' });
    }
};

exports.deleteContactMessage = async (req, res) => {
    const msgId = req.params.id;
    try {
        await db.query('DELETE FROM contact_messages WHERE id = $1', [msgId]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Mesaj silinemedi.' });
    }
};
