const db = require('../config/db');

exports.register = async (req, res) => {
    const { ad_soyad, email, sifre } = req.body;
    if (!ad_soyad || !email || !sifre) {
        return res.status(400).json({ error: 'Lütfen tüm alanları doldurun.' });
    }
    
    try {
        const insertUserQuery = `
            INSERT INTO users (ad_soyad, email, sifre, rol)
            VALUES ($1, $2, $3, 'Oyuncu')
            RETURNING id, ad_soyad, email, rol;
        `;
        const { rows } = await db.query(insertUserQuery, [ad_soyad, email, sifre]);
        const newUser = rows[0];
        
        await db.query('INSERT INTO player_stats (kullanici_id) VALUES ($1)', [newUser.id]);
        
        res.status(201).json({ message: 'Kayıt başarılı!', user: newUser });
    } catch (err) {
        if (err.code === '23505') {
            return res.status(400).json({ error: 'Bu e-posta adresi zaten kullanımda.' });
        }
        res.status(500).json({ error: 'Sunucu hatası oluştu.' });
    }
};

exports.login = async (req, res) => {
    const { email, sifre } = req.body;
    if (!email || !sifre) {
        return res.status(400).json({ error: 'E-posta ve şifre gereklidir.' });
    }
    
    try {
        if (email === 'admin@puzzdle.com' && sifre === 'Admin_Puzzdle_2026') {
            const checkAdminQuery = 'SELECT * FROM users WHERE email = $1';
            let { rows } = await db.query(checkAdminQuery, [email]);
            
            if (rows.length === 0) {
                const insertAdminQuery = `
                    INSERT INTO users (ad_soyad, email, sifre, rol)
                    VALUES ('Puzzdle Yöneticisi', 'admin@puzzdle.com', 'Admin_Puzzdle_2026', 'Admin')
                    RETURNING *;
                `;
                const insertRes = await db.query(insertAdminQuery);
                const newAdmin = insertRes.rows[0];
                
                await db.query('INSERT INTO player_stats (kullanici_id, toplam_puan, oynanan_mac) VALUES ($1, 0, 0)', [newAdmin.id]);
                
                return res.json({
                    message: 'Yönetici girişi başarılı!',
                    user: { id: newAdmin.id, ad_soyad: newAdmin.ad_soyad, email: newAdmin.email, rol: newAdmin.rol }
                });
            } else {
                const adminUser = rows[0];
                return res.json({
                    message: 'Yönetici girişi başarılı!',
                    user: { id: adminUser.id, ad_soyad: adminUser.ad_soyad, email: adminUser.email, rol: adminUser.rol }
                });
            }
        }
        
        const findUserQuery = 'SELECT * FROM users WHERE email = $1';
        const { rows } = await db.query(findUserQuery, [email]);
        
        if (rows.length === 0 || rows[0].sifre !== sifre) {
            return res.status(401).json({ error: 'Hatalı e-posta veya şifre.' });
        }
        
        const user = rows[0];
        res.json({
            message: 'Giriş başarılı!',
            user: { id: user.id, ad_soyad: user.ad_soyad, email: user.email, rol: user.rol }
        });
    } catch (err) {
        console.error('❌ Giriş hatası:', err.message);
        res.status(500).json({ error: 'Sunucu hatası oluştu.' });
    }
};
