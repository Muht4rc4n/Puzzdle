-- ========================================================
-- PUZZDLE POSTGRESQL VERİTABANI ŞEMASI (SCHEMA.SQL)
-- ========================================================
-- Bu SQL kodlarını pgAdmin Query Tool üzerinde çalıştırarak
-- Puzzdle için gerekli tabloları oluşturabilirsiniz.
-- ========================================================

-- 1. Kullanıcılar Tablosu (Users)
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    ad_soyad VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    sifre VARCHAR(255) NOT NULL, -- bcrypt ile hashlenmiş şifreler için
    rol VARCHAR(20) DEFAULT 'Oyuncu' CHECK (rol IN ('Admin', 'Oyuncu')),
    olusturma_tarihi TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Oyuncu İstatistikleri Tablosu (Player_Stats)
CREATE TABLE IF NOT EXISTS player_stats (
    id SERIAL PRIMARY KEY,
    kullanici_id INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    toplam_puan INTEGER DEFAULT 0,
    oynanan_mac INTEGER DEFAULT 0
);

-- 3. Yapboz Galerisi Tablosu (Puzzles)
CREATE TABLE IF NOT EXISTS puzzles (
    id SERIAL PRIMARY KEY,
    olusturan_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    gorsel_url VARCHAR(255) NOT NULL,
    parca_sayisi INTEGER DEFAULT 20, -- 5x4 = 20 parça
    olusturma_tarihi TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Maç Geçmişi Tablosu (Match_History)
CREATE TABLE IF NOT EXISTS match_history (
    id SERIAL PRIMARY KEY,
    oda_kodu VARCHAR(10) UNIQUE NOT NULL,
    kazanan_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    kazanilan_puan INTEGER DEFAULT 0,
    oyun_tarihi TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ========================================================
-- ÖRNEK VERİ EKLEME (Opsiyonel)
-- ========================================================
-- Test amaçlı ilk kullanıcımızı ve istatistiğini ekleyelim:
INSERT INTO users (ad_soyad, email, sifre, rol)
SELECT 'Muhtarcan Ergen', 'muhtarcan@puzzdle.com', 'sifre123_hash', 'Admin'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'muhtarcan@puzzdle.com');

INSERT INTO player_stats (kullanici_id, toplam_puan, oynanan_mac)
SELECT 1, 1500, 42
WHERE NOT EXISTS (SELECT 1 FROM player_stats WHERE kullanici_id = 1);

-- 5. Kullanıcı Favorileri Tablosu (User_Favorites)
CREATE TABLE IF NOT EXISTS user_favorites (
    id SERIAL PRIMARY KEY,
    kullanici_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    gorsel_key VARCHAR(50) NOT NULL,
    olusturma_tarihi TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(kullanici_id, gorsel_key)
);

-- Örnek favori veri (nature yapboz şablonu)
INSERT INTO user_favorites (kullanici_id, gorsel_key)
SELECT 1, 'nature'
WHERE NOT EXISTS (SELECT 1 FROM user_favorites WHERE kullanici_id = 1 AND gorsel_key = 'nature');

-- 6. Küresel Yapboz Şablonları Tablosu (Global Templates)
CREATE TABLE IF NOT EXISTS global_templates (
    id SERIAL PRIMARY KEY,
    gorsel_key VARCHAR(50) UNIQUE NOT NULL,
    gorsel_url TEXT NOT NULL,
    ad VARCHAR(100) NOT NULL,
    kategori VARCHAR(50) DEFAULT 'Klasik',
    olusturma_tarihi TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Küresel Şablonlar Otomatik Tohumlama (Seeding)
INSERT INTO global_templates (gorsel_key, gorsel_url, ad, kategori)
SELECT 'nature', 'assets/puzzle_nature.png', 'Sakin Dağ Gölü', 'Doğa'
WHERE NOT EXISTS (SELECT 1 FROM global_templates WHERE gorsel_key = 'nature');

INSERT INTO global_templates (gorsel_key, gorsel_url, ad, kategori)
SELECT 'space', 'assets/puzzle_space.png', 'Kozmik Bulutsu', 'Uzay'
WHERE NOT EXISTS (SELECT 1 FROM global_templates WHERE gorsel_key = 'space');

INSERT INTO global_templates (gorsel_key, gorsel_url, ad, kategori)
SELECT 'cyberpunk', 'assets/puzzle_cyberpunk.png', 'Neon Şehir', 'Cyberpunk'
WHERE NOT EXISTS (SELECT 1 FROM global_templates WHERE gorsel_key = 'cyberpunk');

INSERT INTO global_templates (gorsel_key, gorsel_url, ad, kategori)
SELECT 'demo', 'assets/puzzle_demo_art.png', 'Orijinal Sanat', 'Klasik'
WHERE NOT EXISTS (SELECT 1 FROM global_templates WHERE gorsel_key = 'demo');

-- 7. Battle Arena Maç Geçmişi Tablosu (Battle_History)
CREATE TABLE IF NOT EXISTS battle_history (
    id SERIAL PRIMARY KEY,
    oda_kodu VARCHAR(50) NOT NULL,
    gorsel_key VARCHAR(50) NOT NULL,
    gorsel_ad VARCHAR(100) NOT NULL,
    oyuncu1_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    oyuncu2_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    oyuncu1_skor INTEGER DEFAULT 0,
    oyuncu2_skor INTEGER DEFAULT 0,
    kazanan_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    oyun_tarihi TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);



-- 8. Iletisim Formu Mesajlari (Contact_Messages)
CREATE TABLE IF NOT EXISTS contact_messages (
    id SERIAL PRIMARY KEY,
    ad_soyad VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    konu VARCHAR(150) NOT NULL,
    mesaj TEXT NOT NULL,
    okundu BOOLEAN DEFAULT FALSE,
    gonderim_tarihi TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
